import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Workplace from "@/models/Workplace.model";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    await connectDB();

    // isActive alanı olmayan workplace'leri güncelle
    const result = await Workplace.updateMany(
      {
        userId: session.user.id,
        isActive: { $exists: false },
      },
      {
        $set: { isActive: true },
      }
    );

    return NextResponse.json({
      message: `${result.modifiedCount} iş yeri güncellendi`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Migration hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
