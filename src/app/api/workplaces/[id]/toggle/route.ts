import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Workplace from "@/models/Workplace.model";

export async function PATCH(
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

    const workplace = await Workplace.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!workplace) {
      return NextResponse.json(
        { error: "İş yeri bulunamadı veya yetkiniz yok." },
        { status: 404 }
      );
    }

    // Aktif/pasif durumunu tersine çevir
    // Eski kayıtlarda isActive undefined olabilir, bunları aktif kabul et
    const currentStatus = workplace.isActive !== false; // undefined veya true -> true, false -> false
    workplace.isActive = !currentStatus;
    await workplace.save();

    return NextResponse.json({
      message: `İş yeri durumu başarıyla güncellendi. Yeni durum: ${
        workplace.isActive ? "Aktif" : "Pasif"
      }`,
      workplace,
    });
  } catch (error) {
    console.error("İş yeri durum değiştirme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
