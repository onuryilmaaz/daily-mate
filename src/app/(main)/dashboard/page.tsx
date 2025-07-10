"use client";

import { useState, useEffect, useCallback } from "react";
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
  isActive?: boolean; // Eski kayıtlarda olmayabilir
}

export default function DashboardPage() {
  useEffect(() => {
    document.title = "Dashboard - Daily Mate";
  }, []);

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

  const fetchWorkdays = useCallback(async () => {
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
  }, [selectedMonth, selectedYear, workplaces.length]);

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
  }, [session?.user?.id, selectedMonth, selectedYear, fetchWorkdays]);

  // Redirect effect - only redirect if not loading and no session
  useEffect(() => {
    if (status !== "loading" && !session?.user?.id) {
      router.push("/login");
    }
  }, [status, session?.user?.id, router]);

  // Callback when a new workday is added
  const handleWorkdayAdded = (newWorkday: WorkDay) => {
    setWorkdays((prev) => [...prev, newWorkday]);
    // Workplaces'i de yenile (güncellenmiş istatistikler için)
    fetchWorkplaces();
  };

  // Callback when a workday is updated
  const handleWorkdayUpdated = (updatedWorkday: WorkDay) => {
    setWorkdays((prev) =>
      prev.map((wd) => (wd._id === updatedWorkday._id ? updatedWorkday : wd))
    );
    // Workplaces'i de yenile (güncellenmiş istatistikler için)
    fetchWorkplaces();
  };

  // Callback when a workday is deleted
  const handleWorkdayDeleted = (workdayId: string) => {
    setWorkdays((prev) => prev.filter((wd) => wd._id !== workdayId));
    // Workplaces'i de yenile (güncellenmiş istatistikler için)
    fetchWorkplaces();
  };

  // Callback when a workplace is updated
  const handleWorkplacesUpdated = () => {
    fetchWorkplaces();
    // Workdays'i de yenile (güncellenmiş workplace bilgileri için)
    fetchWorkdays();
  };

  // Callback when month/year changes from stats panel
  const handleDateChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  // Yeni callback: Workplace değiştiğinde workdays'i güncelle
  const handleWorkplaceChanged = (updatedWorkplace: Workplace) => {
    // Workplaces listesini güncelle
    setWorkplaces((prev) =>
      prev.map((wp) =>
        wp._id === updatedWorkplace._id ? { ...wp, ...updatedWorkplace } : wp
      )
    );

    // Workdays'deki workplace bilgilerini de güncelle
    setWorkdays((prev) =>
      prev.map((wd) =>
        wd.workplaceId._id === updatedWorkplace._id
          ? {
              ...wd,
              workplaceId: {
                ...wd.workplaceId,
                name: updatedWorkplace.name,
                color: updatedWorkplace.color,
                dailyWage: updatedWorkplace.dailyWage,
                isActive: updatedWorkplace.isActive || true,
              },
            }
          : wd
      )
    );
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
      <header className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 shadow-xl border-b border-emerald-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              {/* Logo/Brand */}
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-white"
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

              {/* Brand Name & Welcome Text */}
              <div>
                <h1 className="text-2xl font-bold text-white">Daily Mate</h1>
                <p className="text-emerald-100 text-sm">
                  Hoşgeldiniz, {session.user.name} {session.user.surname}
                </p>
              </div>
            </div>

            {/* User Section */}
            <div className="flex items-center space-x-4">
              {/* User Avatar */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {session.user.name?.charAt(0)?.toUpperCase()}
                    {session.user.surname?.charAt(0)?.toUpperCase()}
                  </span>
                </div>

                {/* User Info - Hidden on mobile */}
                <div className="hidden sm:block">
                  <p className="text-white font-medium text-sm">
                    {session.user.name} {session.user.surname}
                  </p>
                  <p className="text-emerald-200 text-xs">
                    {session.user.email}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 border border-white/20 hover:border-white/30"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="hidden sm:inline">Çıkış Yap</span>
              </button>
            </div>
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

        {/* Main Dashboard Layout for all screen sizes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Workplace Manager */}
          <div className="lg:col-span-1 order-3 lg:order-1">
            <div className="h-full">
              <WorkplaceManager
                onUpdate={handleWorkplacesUpdated}
                onWorkplaceChanged={handleWorkplaceChanged}
              />
            </div>
          </div>

          {/* Middle Column: Calendar */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <CalendarView
              workplaces={workplaces}
              workdays={workdays}
              onWorkdayAdded={handleWorkdayAdded}
              onWorkdayUpdated={handleWorkdayUpdated}
              onWorkdayDeleted={handleWorkdayDeleted}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onDateChange={handleDateChange}
            />
          </div>

          {/* Right Column: Stats Panel */}
          <div className="lg:col-span-1 order-2 lg:order-3">
            <StatsPanel
              workdays={workdays}
              workplaces={workplaces}
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
