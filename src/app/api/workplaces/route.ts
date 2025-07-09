import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Workplace from "@/models/Workplace.model";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    await connectDB();

    const workplaces = await Workplace.find({
      userId: session.user.id,
    }).sort({ createdAt: -1 });

    return NextResponse.json({ workplaces });
  } catch (error) {
    console.error("İş yerleri listeleme hatası:", error);
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

    const { name, dailyWage, color } = await req.json();

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

    const newWorkplace = new Workplace({
      userId: session.user.id,
      name: name.trim(),
      dailyWage: Number(dailyWage),
      color: color || "#3B82F6",
    });

    await newWorkplace.save();

    return NextResponse.json(
      {
        message: "İş yeri başarıyla oluşturuldu",
        workplace: newWorkplace,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("İş yeri oluşturma hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
