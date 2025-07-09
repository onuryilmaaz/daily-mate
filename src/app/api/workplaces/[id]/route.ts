import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Workplace from "@/models/Workplace.model";
import WorkDay from "@/models/WorkDay.model";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    const { name, dailyWage, color } = await req.json();
    const { id } = await params;

    // Giriş verilerini doğrula
    if (!name || !dailyWage) {
      return NextResponse.json(
        { error: "İş yeri adı ve günlük yevmiye zorunludur" },
        { status: 400 }
      );
    }

    if (dailyWage < 0) {
      return NextResponse.json(
        { error: "Yevmiye 0'dan küçük olamaz" },
        { status: 400 }
      );
    }

    await connectDB();

    // İş yerinin var olduğunu ve kullanıcıya ait olduğunu kontrol et
    const workplace = await Workplace.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!workplace) {
      return NextResponse.json(
        { error: "İş yeri bulunamadı" },
        { status: 404 }
      );
    }

    // İş yerini güncelle
    workplace.name = name.trim();
    workplace.dailyWage = Number(dailyWage);
    workplace.color = color || workplace.color;

    await workplace.save();

    return NextResponse.json({
      message: "İş yeri başarıyla güncellendi",
      workplace,
    });
  } catch (error) {
    console.error("İş yeri güncelleme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectDB();

    // İş yerinin var olduğunu ve kullanıcıya ait olduğunu kontrol et
    const workplace = await Workplace.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!workplace) {
      return NextResponse.json(
        { error: "İş yeri bulunamadı" },
        { status: 404 }
      );
    }

    // Bu iş yeriyle ilişkili çalışma günlerini SİL (artık hata vermek yerine)
    await WorkDay.deleteMany({
      workplaceId: id,
    });

    // İş yerini sil
    await Workplace.findByIdAndDelete(id);

    return NextResponse.json({
      message: "İş yeri başarıyla silindi",
    });
  } catch (error) {
    console.error("İş yeri silme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
