"use client";

import { useState, useEffect } from "react";

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
  insights: {
    mostWorkedWorkplace: {
      name: string;
      days: number;
      earnings: number;
    } | null;
    highestEarningWorkplace: {
      name: string;
      days: number;
      earnings: number;
    } | null;
  };
  workplaceBreakdown: Array<{
    workplaceId: string;
    name: string;
    color: string;
    defaultWage: number;
    totalDays: number;
    totalEarnings: number;
    averageWage: number;
    percentage: number;
  }>;
  weeklyDistribution: Array<{
    dayName: string;
    dayNumber: number;
    count: number;
    totalEarnings: number;
  }>;
}

export default function StatsPanel() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Tarih seçici state'leri
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Ay isimleri
  const months = [
    { value: 1, name: "Ocak" },
    { value: 2, name: "Şubat" },
    { value: 3, name: "Mart" },
    { value: 4, name: "Nisan" },
    { value: 5, name: "Mayıs" },
    { value: 6, name: "Haziran" },
    { value: 7, name: "Temmuz" },
    { value: 8, name: "Ağustos" },
    { value: 9, name: "Eylül" },
    { value: 10, name: "Ekim" },
    { value: 11, name: "Kasım" },
    { value: 12, name: "Aralık" },
  ];

  // Yıl seçenekleri (geçen yıldan başlayarak 5 yıl ileriye kadar)
  const years = [];
  for (
    let year = currentDate.getFullYear() - 1;
    year <= currentDate.getFullYear() + 5;
    year++
  ) {
    years.push(year);
  }

  useEffect(() => {
    fetchStats();
  }, [selectedMonth, selectedYear]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(
        `/api/stats?month=${selectedMonth}&year=${selectedYear}`
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "İstatistikler yüklenirken hata oluştu");
        return;
      }

      setStats(data);
    } catch (error) {
      setError("İstatistikler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Bir önceki ay
  const goToPreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  // Bir sonraki ay
  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Bugüne git
  const goToCurrentMonth = () => {
    setSelectedMonth(currentDate.getMonth() + 1);
    setSelectedYear(currentDate.getFullYear());
  };

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded-lg mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded-lg"></div>
            <div className="h-4 bg-gray-200 rounded-lg"></div>
            <div className="h-4 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
        <div className="text-center">
          <div className="text-red-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
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
          <p className="text-sm text-gray-600 mb-3">{error}</p>
          <button
            onClick={fetchStats}
            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Hiç veri yoksa özel görünüm
  if (stats.summary.totalWorkDays === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
          {/* Date Selector Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Önceki Ay"
            >
              <svg
                className="w-4 h-4 text-gray-600"
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

            <div className="flex-1 mx-4">
              <h2 className="text-xl font-semibold text-gray-800 text-center flex items-center justify-center">
                <div className="w-6 h-6 bg-gradient-to-r from-pink-400 to-pink-600 rounded-lg flex items-center justify-center mr-2">
                  <svg
                    className="w-3 h-3 text-white"
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
                {stats.period.monthName} {stats.period.year}
              </h2>
            </div>

            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Sonraki Ay"
            >
              <svg
                className="w-4 h-4 text-gray-600"
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

          {/* Month/Year Selectors */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div>
              <label
                htmlFor="month"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Ay
              </label>
              <select
                id="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="year"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Yıl
              </label>
              <select
                id="year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={goToCurrentMonth}
              className="mt-5 px-3 py-2 text-xs bg-gradient-to-r from-pink-100 to-pink-200 text-pink-700 rounded-lg hover:from-pink-200 hover:to-pink-300 transition-all duration-200"
            >
              Bugün
            </button>
          </div>

          {/* No Data Message */}
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-16 w-16"
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
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Bu ay için veri bulunamadı
            </h3>
            <p className="text-gray-500 mb-4">
              {stats.period.monthName} {stats.period.year} ayında henüz çalışma
              günü kaydı bulunmuyor.
            </p>
            <p className="text-sm text-gray-400">
              Veri görmek için farklı bir ay seçin veya çalışma günleri ekleyin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Selector Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
        {/* Navigation Controls */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Önceki Ay"
          >
            <svg
              className="w-4 h-4 text-gray-600"
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

          <div className="flex-1 mx-4">
            <h2 className="text-xl font-semibold text-gray-800 text-center flex items-center justify-center">
              <div className="w-6 h-6 bg-gradient-to-r from-pink-400 to-pink-600 rounded-lg flex items-center justify-center mr-2">
                <svg
                  className="w-3 h-3 text-white"
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
              {stats.period.monthName} {stats.period.year}
            </h2>
          </div>

          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Sonraki Ay"
          >
            <svg
              className="w-4 h-4 text-gray-600"
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

        {/* Month/Year Selectors */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div>
            <label
              htmlFor="month"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Ay
            </label>
            <select
              id="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="year"
              className="block text-xs font-medium text-gray-700 mb-1"
            >
              Yıl
            </label>
            <select
              id="year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={goToCurrentMonth}
            className="mt-5 px-3 py-2 text-xs bg-gradient-to-r from-pink-100 to-pink-200 text-pink-700 rounded-lg hover:from-pink-200 hover:to-pink-300 transition-all duration-200"
          >
            Bugün
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl">
            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">
              ₺{stats.summary.totalEarnings.toLocaleString("tr-TR")}
            </div>
            <div className="text-xs text-indigo-600 font-medium">
              Toplam Kazanç
            </div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
              {stats.summary.totalWorkDays}
            </div>
            <div className="text-xs text-emerald-600 font-medium">
              Çalışılan Gün
            </div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              ₺{stats.summary.averageDailyEarning.toLocaleString("tr-TR")}
            </div>
            <div className="text-xs text-blue-600 font-medium">
              Günlük Ortalama
            </div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
              {stats.summary.workplaceCount}
            </div>
            <div className="text-xs text-purple-600 font-medium">İş Yeri</div>
          </div>
        </div>

        {/* Insights */}
        {(stats.insights.mostWorkedWorkplace ||
          stats.insights.highestEarningWorkplace) && (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Öne Çıkanlar
            </h3>
            <div className="space-y-2 text-sm">
              {stats.insights.mostWorkedWorkplace && (
                <div className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-gray-600">En Çok Çalışılan:</span>
                  <span className="font-semibold text-gray-800">
                    {stats.insights.mostWorkedWorkplace.name} (
                    {stats.insights.mostWorkedWorkplace.days} gün)
                  </span>
                </div>
              )}
              {stats.insights.highestEarningWorkplace && (
                <div className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-gray-600">En Yüksek Kazanç:</span>
                  <span className="font-semibold text-gray-800">
                    {stats.insights.highestEarningWorkplace.name} (₺
                    {stats.insights.highestEarningWorkplace.earnings.toLocaleString(
                      "tr-TR"
                    )}
                    )
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Workplace Breakdown */}
      {stats.workplaceBreakdown.length > 0 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            İş Yeri Bazında Dökümü
          </h3>
          <div className="space-y-4">
            {stats.workplaceBreakdown.map((workplace) => (
              <div
                key={workplace.workplaceId}
                className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-3 shadow-lg"
                      style={{ backgroundColor: workplace.color }}
                    ></div>
                    <span className="font-semibold text-gray-800">
                      {workplace.name}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                    {workplace.percentage}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-gray-800">
                      ₺{workplace.totalEarnings.toLocaleString("tr-TR")}
                    </div>
                    <div className="text-gray-500">Toplam Kazanç</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-800">
                      {workplace.totalDays}
                    </div>
                    <div className="text-gray-500">Gün Sayısı</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-800">
                      ₺{workplace.averageWage.toLocaleString("tr-TR")}
                    </div>
                    <div className="text-gray-500">Ortalama</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full shadow-sm"
                      style={{
                        width: `${workplace.percentage}%`,
                        backgroundColor: workplace.color,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Distribution */}
      {stats.weeklyDistribution.length > 0 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Haftalık Dağılım
          </h3>
          <div className="space-y-2">
            {stats.weeklyDistribution.map((day) => (
              <div
                key={day.dayNumber}
                className="flex justify-between items-center py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50/50 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-800">
                  {day.dayName}
                </span>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-800">
                    {day.count} gün
                  </div>
                  <div className="text-xs text-gray-500">
                    ₺{day.totalEarnings.toLocaleString("tr-TR")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={fetchStats}
          className="text-pink-600 hover:text-pink-500 text-sm font-medium transition-colors"
        >
          İstatistikleri Yenile
        </button>
      </div>
    </div>
  );
}
