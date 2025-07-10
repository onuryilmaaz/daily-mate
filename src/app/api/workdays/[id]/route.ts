import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import WorkDay from "@/models/WorkDay.model";
import Workplace from "@/models/Workplace.model";

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

    const { id } = await params;
    const { workplaceId, wageOnThatDay } = await req.json();

    if (!workplaceId) {
      return NextResponse.json(
        { error: "İş yeri zorunludur" },
        { status: 400 }
      );
    }

    await connectDB();

    // Çalışma gününün var olduğunu ve kullanıcıya ait olduğunu kontrol et
    const workday = await WorkDay.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!workday) {
      return NextResponse.json(
        { error: "Çalışma günü bulunamadı" },
        { status: 404 }
      );
    }

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

    // Yevmiye kontrolü - eğer belirtilmemişse iş yerinin varsayılan yevmiyesini kullan
    const finalWage =
      wageOnThatDay !== undefined ? Number(wageOnThatDay) : workplace.dailyWage;

    if (finalWage < 0) {
      return NextResponse.json(
        { error: "Yevmiye 0'dan küçük olamaz" },
        { status: 400 }
      );
    }

    // Çalışma gününü güncelle
    const updatedWorkDay = await WorkDay.findByIdAndUpdate(
      id,
      {
        workplaceId,
        wageOnThatDay: finalWage,
      },
      { new: true }
    ).populate("workplaceId", "name color dailyWage");

    return NextResponse.json({
      message: "Çalışma günü başarıyla güncellendi",
      workday: updatedWorkDay,
    });
  } catch (error) {
    console.error("Çalışma günü güncelleme hatası:", error);
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

    // Çalışma gününün var olduğunu ve kullanıcıya ait olduğunu kontrol et
    const workday = await WorkDay.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!workday) {
      return NextResponse.json(
        { error: "Çalışma günü bulunamadı" },
        { status: 404 }
      );
    }

    // Çalışma gününü sil
    await WorkDay.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Çalışma günü başarıyla silindi",
    });
  } catch (error) {
    console.error("Çalışma günü silme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
