"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import CalendarView from "@/components/CalendarView";
import StatsPanel from "@/components/StatsPanel";
import WorkplaceManager from "@/components/WorkplaceManager";

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

interface Workplace {
  _id: string;
  name: string;
  color: string;
  dailyWage: number;
}

export default function DashboardPage() {
  // All hooks must be at the top, before any conditional logic
  const { data: session, status } = useSession();
  const router = useRouter();
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [workdays, setWorkdays] = useState<WorkDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [workdaysLoading, setWorkdaysLoading] = useState(false);

  // Shared date state for both calendar and stats
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Fetch workplaces only once on mount
  useEffect(() => {
    if (session?.user?.id) {
      fetchWorkplaces();
    }
  }, [session?.user?.id]);

  // Fetch workdays when month/year changes
  useEffect(() => {
    if (session?.user?.id) {
      fetchWorkdays();
    }
  }, [session?.user?.id, selectedMonth, selectedYear]);

  // Redirect effect - only redirect if not loading and no session
  useEffect(() => {
    if (status !== "loading" && !session?.user?.id) {
      router.push("/login");
    }
  }, [status, session?.user?.id, router]);

  const fetchWorkplaces = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/workplaces");

      if (response.ok) {
        const data = await response.json();
        setWorkplaces(data.workplaces || []);
      }
    } catch (error) {
      console.error("Error fetching workplaces:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkdays = async () => {
    try {
      // Don't show full loading for month changes, only workdays loading
      if (workplaces.length > 0) {
        setWorkdaysLoading(true);
      } else {
        setLoading(true);
      }

      // Calculate start and end dates for the selected month
      const startOfMonth = new Date(selectedYear, selectedMonth - 1, 1);
      const endOfMonth = new Date(
        selectedYear,
        selectedMonth,
        0,
        23,
        59,
        59,
        999
      );

      const startDate = startOfMonth.toISOString().split("T")[0];
      const endDate = endOfMonth.toISOString().split("T")[0];

      const response = await fetch(
        `/api/workdays?startDate=${startDate}&endDate=${endDate}`
      );

      if (response.ok) {
        const data = await response.json();
        setWorkdays(data.workdays || []);
      }
    } catch (error) {
      console.error("Error fetching workdays:", error);
    } finally {
      setLoading(false);
      setWorkdaysLoading(false);
    }
  };

  // Callback when a new workday is added
  const handleWorkdayAdded = (newWorkday: WorkDay) => {
    setWorkdays((prev) => [...prev, newWorkday]);
  };

  // Callback when a workplace is updated
  const handleWorkplacesUpdated = () => {
    fetchWorkplaces();
  };

  // Callback when month/year changes from stats panel
  const handleDateChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  // Show loading spinner while session is being fetched or while redirecting
  if (status === "loading" || !session?.user?.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Show loading spinner while initial data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Temel istatistikler
  const totalEarnings = workdays.reduce(
    (total, day) => total + day.wageOnThatDay,
    0
  );
  const totalWorkDays = workdays.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Daily Mate</h1>
              <p className="text-sm text-gray-600">
                Hoşgeldiniz, {session.user.name} {session.user.surname}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Total Earnings Card */}
          <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium mb-1">
                  Bu Ay Toplam Kazanç
                </p>
                <p className="text-3xl font-bold">
                  {totalEarnings.toLocaleString("tr-TR")} ₺
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/30 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-emerald-200">₺</span>
              </div>
            </div>
          </div>

          {/* Work Days Card */}
          <div className="bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium mb-1">
                  Çalışılan Gün Sayısı
                </p>
                <p className="text-3xl font-bold">{totalWorkDays}</p>
              </div>
              <div className="w-12 h-12 bg-teal-500/30 rounded-xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-teal-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="block lg:hidden space-y-6">
          {/* Calendar - Mobile */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Çalışma Takvimi
            </h2>
            {workplaces.length === 0 ? (
              <div className="text-center py-12">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Henüz iş yeri eklenmemiş
                </h3>
                <p className="text-gray-500 mb-4">
                  Çalışma günlerinizi takip etmek için önce bir iş yeri ekleyin.
                </p>
              </div>
            ) : (
              <div className="relative">
                {workdaysLoading && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                  </div>
                )}
                <CalendarView
                  workdays={workdays}
                  workplaces={workplaces}
                  onWorkdayAdded={handleWorkdayAdded}
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                  onDateChange={handleDateChange}
                />
              </div>
            )}
          </div>

          {/* Stats Panel - Mobile */}
          <div>
            <StatsPanel
              workdaysLength={workdays.length}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onDateChange={handleDateChange}
            />
          </div>

          {/* Workplace Manager - Mobile */}
          <div>
            <WorkplaceManager onUpdate={handleWorkplacesUpdated} />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6">
          {/* Workplace Manager - Desktop */}
          <div className="lg:col-span-3">
            <WorkplaceManager onUpdate={handleWorkplacesUpdated} />
          </div>

          {/* Calendar Section - Desktop */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Çalışma Takvimi
              </h2>

              {workplaces.length === 0 ? (
                <div className="text-center py-12">
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Henüz iş yeri eklenmemiş
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Çalışma günlerinizi takip etmek için önce bir iş yeri
                    ekleyin.
                  </p>
                  <p className="text-sm text-gray-400">
                    Sol panelden "İş Yeri Ekle" butonunu kullanabilirsiniz.
                  </p>
                </div>
              ) : (
                <div className="relative">
                  {workdaysLoading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                    </div>
                  )}
                  <CalendarView
                    workdays={workdays}
                    workplaces={workplaces}
                    onWorkdayAdded={handleWorkdayAdded}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    onDateChange={handleDateChange}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Stats Panel - Desktop */}
          <div className="lg:col-span-3">
            <StatsPanel
              workdaysLength={workdays.length}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onDateChange={handleDateChange}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
