"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

interface WorkplaceBreakdown {
  workplaceId: string;
  name: string;
  color: string;
  defaultWage: number;
  totalDays: number;
  totalEarnings: number;
  averageWage: number;
  percentage: number;
}

interface StatsData {
  period: {
    month: number;
    year: number;
    monthName: string;
  };
  summary: {
    totalEarnings: number;
    totalWorkDays: number;
    averageDailyEarning: number;
    workplaceCount: number;
  };
  workplaceBreakdown: WorkplaceBreakdown[];
}

interface WorkDay {
  _id: string;
  date: string;
  workplaceId: {
    _id: string;
    name: string;
    color: string;
    dailyWage: number;
  };
  wageOnThatDay: number;
  userId: string;
}



interface StatsPanelProps {
  workdays: WorkDay[];
  selectedMonth: number;
  selectedYear: number;
  onDateChange: (month: number, year: number) => void;
}

export default function StatsPanel({
  workdays,
  selectedMonth,
  selectedYear,
  onDateChange,
}: StatsPanelProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentDate = useMemo(() => new Date(), []);

  // Hesapla stats'i workdays ve workplaces'den
  const calculateStats = useCallback(() => {
    const monthNames = [
      "Ocak",
      "Şubat",
      "Mart",
      "Nisan",
      "Mayıs",
      "Haziran",
      "Temmuz",
      "Ağustos",
      "Eylül",
      "Ekim",
      "Kasım",
      "Aralık",
    ];

    const totalEarnings = workdays.reduce(
      (sum, wd) => sum + wd.wageOnThatDay,
      0
    );
    const totalWorkDays = workdays.length;
    const averageDailyEarning =
      totalWorkDays > 0 ? totalEarnings / totalWorkDays : 0;

    // İş yeri bazında breakdown
    const workplaceMap = new Map<string, WorkplaceBreakdown>();

    workdays.forEach((wd) => {
      const wpId = wd.workplaceId._id;
      if (!workplaceMap.has(wpId)) {
        workplaceMap.set(wpId, {
          workplaceId: wpId,
          name: wd.workplaceId.name,
          color: wd.workplaceId.color,
          defaultWage: wd.workplaceId.dailyWage,
          totalDays: 0,
          totalEarnings: 0,
          averageWage: 0,
          percentage: 0,
        });
      }

      const breakdown = workplaceMap.get(wpId)!;
      breakdown.totalDays += 1;
      breakdown.totalEarnings += wd.wageOnThatDay;
    });

    // Yüzdeleri ve ortalamalarıHesapla
    const workplaceBreakdown = Array.from(workplaceMap.values()).map(
      (breakdown) => ({
        ...breakdown,
        averageWage:
          breakdown.totalDays > 0
            ? breakdown.totalEarnings / breakdown.totalDays
            : 0,
        percentage:
          totalEarnings > 0
            ? (breakdown.totalEarnings / totalEarnings) * 100
            : 0,
      })
    );

    return {
      period: {
        month: selectedMonth,
        year: selectedYear,
        monthName: monthNames[selectedMonth - 1],
      },
      summary: {
        totalEarnings,
        totalWorkDays,
        averageDailyEarning,
        workplaceCount: workplaceBreakdown.length,
      },
      workplaceBreakdown: workplaceBreakdown.sort(
        (a, b) => b.totalEarnings - a.totalEarnings
      ),
    };
  }, [workdays, selectedMonth, selectedYear]);

  // Workdays değiştiğinde stats'i yeniden hesapla
  useEffect(() => {
    setLoading(true);
    const newStats = calculateStats();
    setStats(newStats);
    setLoading(false);
  }, [calculateStats]);

  const years = [];
  for (
    let year = currentDate.getFullYear() - 1;
    year <= currentDate.getFullYear() + 2;
    year++
  ) {
    years.push(year);
  }

  const goToPreviousMonth = () => {
    if (selectedMonth === 1) {
      onDateChange(12, selectedYear - 1);
    } else {
      onDateChange(selectedMonth - 1, selectedYear);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      onDateChange(1, selectedYear + 1);
    } else {
      onDateChange(selectedMonth + 1, selectedYear);
    }
  };

  const goToCurrentMonth = () => {
    onDateChange(currentDate.getMonth() + 1, currentDate.getFullYear());
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white via-white to-slate-50/30 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-8 shadow-xl">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg"></div>
          <div className="space-y-4">
            <div className="h-20 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl"></div>
            <div className="h-16 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl"></div>
            <div className="h-16 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 via-white to-red-50/30 backdrop-blur-sm rounded-2xl border border-red-200/50 p-8 shadow-xl">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Bir hata oluştu
          </h3>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => setError("")} // Clear error on retry
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-gradient-to-br from-white via-white to-emerald-50/30 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-xl overflow-hidden">
      {/* Header with Month Navigation */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            İstatistikler
          </h2>

          {selectedMonth === currentDate.getMonth() + 1 &&
            selectedYear === currentDate.getFullYear() && (
              <span className="bg-gradient-to-r from-teal-400 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                Bu Ay
              </span>
            )}
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 text-white"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="text-center">
            <h3 className="text-lg font-bold text-white">
              {stats.period.monthName} {stats.period.year}
            </h3>
          </div>

          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 text-white"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {selectedMonth !== currentDate.getMonth() + 1 ||
        selectedYear !== currentDate.getFullYear() ? (
          <button
            onClick={goToCurrentMonth}
            className="w-full mt-3 bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg text-sm font-medium transition-all duration-200"
          >
            Bu Aya Dön
          </button>
        ) : null}
      </div>

      <div className="p-6 space-y-6">
        {stats.summary.totalWorkDays === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              Bu ay henüz veri yok
            </h3>
            <p className="text-slate-500">
              Bu ay için henüz çalışma günü eklenmemiş.
            </p>
          </div>
        ) : (
          <>
            {/* Total Summary */}
            <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-emerald-100 mb-2">
                    Toplam Kazanç
                  </h3>
                  <p className="text-3xl font-bold">
                    {stats.summary.totalEarnings.toLocaleString("tr-TR")} ₺
                  </p>
                  <p className="text-sm text-emerald-100 mt-1">
                    {stats.summary.totalWorkDays} gün çalışıldı
                  </p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-3xl font-bold text-white">₺</span>
                </div>
              </div>
            </div>

            {/* Company Breakdown */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-slate-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Firmalar Bazında Detay
              </h3>

              <div className="space-y-3">
                {stats.workplaceBreakdown.map((workplace) => (
                  <div
                    key={workplace.workplaceId}
                    className="bg-gradient-to-r from-white via-white to-slate-50/50 rounded-xl border border-slate-200/50 p-4 hover:shadow-lg transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full shadow-sm"
                          style={{ backgroundColor: workplace.color }}
                        ></div>
                        <div>
                          <h4 className="font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
                            {workplace.name}
                          </h4>
                          <p className="text-sm text-slate-500">
                            {workplace.totalDays} gün
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-slate-900">
                          {workplace.totalEarnings.toLocaleString("tr-TR")} ₺
                        </p>
                        <p className="text-xs text-slate-500">
                          %{workplace.percentage} pay
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-400 to-teal-500"
                          style={{ width: `${workplace.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
