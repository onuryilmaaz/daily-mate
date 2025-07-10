import { NextResponse } from "next/server";
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

    // Tüm workplace'leri getir (aktif ve pasif)
    const workplaces = await Workplace.find({
      userId: session.user.id,
    }).sort({ isActive: -1, createdAt: -1 }); // Önce aktifler, sonra pasifler

    return NextResponse.json({ workplaces });
  } catch (error) {
    console.error("Tüm iş yerleri listeleme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
