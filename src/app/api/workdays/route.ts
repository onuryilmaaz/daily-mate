import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import WorkDay from "@/models/WorkDay.model";
import Workplace from "@/models/Workplace.model";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    await connectDB();

    // Tarih filtresi oluştur
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    const workdays = await WorkDay.find({
      userId: session.user.id,
      ...dateFilter,
    })
      .populate("workplaceId", "name color dailyWage")
      .sort({ date: -1 });

    return NextResponse.json({ workdays });
  } catch (error) {
    console.error("Çalışma günleri listeleme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    const { workplaceId, date, wageOnThatDay } = await req.json();

    // Giriş verilerini doğrula
    if (!workplaceId || !date) {
      return NextResponse.json(
        { error: "İş yeri ve tarih zorunludur" },
        { status: 400 }
      );
    }

    await connectDB();

    // İş yerinin var olduğunu ve kullanıcıya ait olduğunu kontrol et
    const workplace = await Workplace.findOne({
      _id: workplaceId,
      userId: session.user.id,
    });

    if (!workplace) {
      return NextResponse.json(
        { error: "İş yeri bulunamadı" },
        { status: 404 }
      );
    }

    // Tarih formatını kontrol et
    const workDate = new Date(date);
    if (isNaN(workDate.getTime())) {
      return NextResponse.json(
        { error: "Geçerli bir tarih giriniz" },
        { status: 400 }
      );
    }

    // Gelecek tarih kontrolü
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (workDate > today) {
      return NextResponse.json(
        { error: "Gelecek tarihler için kayıt oluşturamazsınız" },
        { status: 400 }
      );
    }

    // Yevmiye kontrolü - eğer belirtilmemişse iş yerinin varsayılan yevmiyesini kullan
    const finalWage =
      wageOnThatDay !== undefined ? Number(wageOnThatDay) : workplace.dailyWage;

    if (finalWage < 0) {
      return NextResponse.json(
        { error: "Yevmiye 0'dan küçük olamaz" },
        { status: 400 }
      );
    }

    // Aynı tarihte kayıt var mı kontrol et
    const existingWorkDay = await WorkDay.findOne({
      userId: session.user.id,
      date: {
        $gte: new Date(workDate.setHours(0, 0, 0, 0)),
        $lt: new Date(workDate.setHours(23, 59, 59, 999)),
      },
    });

    if (existingWorkDay) {
      return NextResponse.json(
        { error: "Bu tarih için zaten bir kayıt bulunuyor" },
        { status: 400 }
      );
    }

    // Yeni çalışma günü oluştur
    const newWorkDay = new WorkDay({
      userId: session.user.id,
      workplaceId,
      date: new Date(date),
      wageOnThatDay: finalWage,
    });

    await newWorkDay.save();

    // Populated versiyonu döndür
    const populatedWorkDay = await WorkDay.findById(newWorkDay._id).populate(
      "workplaceId",
      "name color dailyWage"
    );

    return NextResponse.json(
      {
        message: "Çalışma günü başarıyla oluşturuldu",
        workday: populatedWorkDay,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Çalışma günü oluşturma hatası:", error);

    // Duplicate key hatası kontrolü
    if (
      error instanceof Error &&
      "code" in error &&
      (error as Error & { code?: number }).code === 11000
    ) {
      return NextResponse.json(
        { error: "Bu tarih için zaten bir kayıt bulunuyor" },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
