import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import WorkDay from "@/models/WorkDay.model";
import mongoose from "mongoose";

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
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    await connectDB();

    // Varsayılan olarak mevcut ay ve yıl
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    // Ay başlangıcı ve bitişi
    const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
    const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    // MongoDB Aggregation Pipeline
    const aggregationResult = await WorkDay.aggregate([
      // İlk aşama: Kullanıcı ve tarih filtresi
      {
        $match: {
          userId: new mongoose.Types.ObjectId(session.user.id),
          date: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },
      // İkinci aşama: Workplace bilgilerini join et
      {
        $lookup: {
          from: "workplaces",
          localField: "workplaceId",
          foreignField: "_id",
          as: "workplace",
        },
      },
      // Üçüncü aşama: Workplace bilgilerini düzleştir
      {
        $unwind: "$workplace",
      },
      // Dördüncü aşama: İş yeri bazında gruplama ve toplam hesaplama
      {
        $group: {
          _id: "$workplaceId",
          workplaceName: { $first: "$workplace.name" },
          workplaceColor: { $first: "$workplace.color" },
          workplaceDefaultWage: { $first: "$workplace.dailyWage" },
          totalDays: { $sum: 1 },
          totalEarnings: { $sum: "$wageOnThatDay" },
          workDays: {
            $push: {
              date: "$date",
              wage: "$wageOnThatDay",
            },
          },
        },
      },
      // Beşinci aşama: Kazanç miktarına göre sıralama (yüksekten düşüğe)
      {
        $sort: { totalEarnings: -1 },
      },
    ]);

    // Genel toplam hesaplama
    const totalEarnings = aggregationResult.reduce(
      (sum, workplace) => sum + workplace.totalEarnings,
      0
    );
    const totalWorkDays = aggregationResult.reduce(
      (sum, workplace) => sum + workplace.totalDays,
      0
    );

    // Günlük ortalama hesaplama
    const averageDailyEarning =
      totalWorkDays > 0 ? totalEarnings / totalWorkDays : 0;

    // En çok çalışılan iş yeri
    const mostWorkedWorkplace = aggregationResult.reduce(
      (max, current) =>
        current.totalDays > (max?.totalDays || 0) ? current : max,
      null
    );

    // En yüksek kazanç sağlayan iş yeri
    const highestEarningWorkplace = aggregationResult.reduce(
      (max, current) =>
        current.totalEarnings > (max?.totalEarnings || 0) ? current : max,
      null
    );

    // Hafta bazında dağılım hesaplama
    const weeklyDistribution = await WorkDay.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(session.user.id),
          date: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$date" }, // 1=Pazar, 2=Pazartesi, vb.
          count: { $sum: 1 },
          totalEarnings: { $sum: "$wageOnThatDay" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Gün isimlerini Türkçe'ye çevir
    const dayNames = [
      "",
      "Pazar",
      "Pazartesi",
      "Salı",
      "Çarşamba",
      "Perşembe",
      "Cuma",
      "Cumartesi",
    ];
    const formattedWeeklyDistribution = weeklyDistribution.map((day) => ({
      dayName: dayNames[day._id],
      dayNumber: day._id,
      count: day.count,
      totalEarnings: day.totalEarnings,
    }));

    return NextResponse.json({
      period: {
        month: targetMonth,
        year: targetYear,
        monthName: new Date(targetYear, targetMonth - 1).toLocaleDateString(
          "tr-TR",
          { month: "long" }
        ),
      },
      summary: {
        totalEarnings,
        totalWorkDays,
        averageDailyEarning: Math.round(averageDailyEarning),
        workplaceCount: aggregationResult.length,
      },
      insights: {
        mostWorkedWorkplace: mostWorkedWorkplace
          ? {
              name: mostWorkedWorkplace.workplaceName,
              days: mostWorkedWorkplace.totalDays,
              earnings: mostWorkedWorkplace.totalEarnings,
            }
          : null,
        highestEarningWorkplace: highestEarningWorkplace
          ? {
              name: highestEarningWorkplace.workplaceName,
              days: highestEarningWorkplace.totalDays,
              earnings: highestEarningWorkplace.totalEarnings,
            }
          : null,
      },
      workplaceBreakdown: aggregationResult.map((workplace) => ({
        workplaceId: workplace._id,
        name: workplace.workplaceName,
        color: workplace.workplaceColor,
        defaultWage: workplace.workplaceDefaultWage,
        totalDays: workplace.totalDays,
        totalEarnings: workplace.totalEarnings,
        averageWage: Math.round(workplace.totalEarnings / workplace.totalDays),
        percentage:
          Math.round((workplace.totalEarnings / totalEarnings) * 100) || 0,
      })),
      weeklyDistribution: formattedWeeklyDistribution,
    });
  } catch (error) {
    console.error("İstatistik hesaplama hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
