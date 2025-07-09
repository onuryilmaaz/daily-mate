import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Workplace from "@/models/Workplace.model";
import WorkDay from "@/models/WorkDay.model";
import CalendarView from "@/components/CalendarView";
import StatsPanel from "@/components/StatsPanel";
import WorkplaceManager from "@/components/WorkplaceManager";

async function getWorkplaces(userId: string) {
  await connectDB();
  const workplaces = await Workplace.find({ userId }).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(workplaces));
}

async function getCurrentMonthWorkDays(userId: string) {
  await connectDB();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  const workdays = await WorkDay.find({
    userId,
    date: {
      $gte: startOfMonth,
      $lte: endOfMonth,
    },
  })
    .populate("workplaceId", "name color dailyWage")
    .sort({ date: -1 });

  return JSON.parse(JSON.stringify(workdays));
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [workplaces, workdays] = await Promise.all([
    getWorkplaces(session.user.id),
    getCurrentMonthWorkDays(session.user.id),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Daily Mate
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Hoşgeldiniz, {session.user.email}
              </p>
            </div>
            <form
              action={async () => {
                "use server";
                const { signOut } = await import("next-auth/react");
                await signOut({ callbackUrl: "/login" });
              }}
            >
              <button
                type="submit"
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Çıkış Yap
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Mobile Layout: Earnings Stats First */}
        <div className="block lg:hidden space-y-6">
          {/* Quick Earnings Summary - Mobile */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              Bu Ay Toplam Kazanç
            </h2>
            <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              ₺
              {workdays
                .reduce((total, day) => total + day.wageOnThatDay, 0)
                .toLocaleString("tr-TR")}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {workdays.length} gün çalışıldı • {workplaces.length} iş yeri
            </div>
          </div>

          {/* Calendar - Mobile */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-4 h-4 text-white"
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Henüz iş yeri eklenmemiş
                </h3>
                <p className="text-gray-500 mb-4">
                  Çalışma günlerinizi takip etmek için önce bir iş yeri ekleyin.
                </p>
                <p className="text-sm text-gray-400">
                  Aşağıdaki "İş Yeri Ekle" butonunu kullanabilirsiniz.
                </p>
              </div>
            ) : (
              <CalendarView workdays={workdays} workplaces={workplaces} />
            )}
          </div>

          {/* Workplace Manager - Mobile */}
          <div>
            <WorkplaceManager />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-8">
          {/* Workplace Manager - Desktop */}
          <div className="lg:col-span-1">
            <WorkplaceManager />
          </div>

          {/* Calendar Section - Desktop */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <svg
                    className="w-4 h-4 text-white"
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
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
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
                <CalendarView workdays={workdays} workplaces={workplaces} />
              )}
            </div>
          </div>

          {/* Stats Panel - Desktop */}
          <div className="lg:col-span-1">
            <StatsPanel />
          </div>
        </div>

        {/* Bottom Quick Stats - Desktop Only */}
        <div className="hidden lg:block">
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-600">
                    Toplam İş Yeri
                  </dt>
                  <dd className="text-2xl font-bold text-gray-800">
                    {workplaces.length}
                  </dd>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
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
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-600">
                    Bu Ay Çalışılan Gün
                  </dt>
                  <dd className="text-2xl font-bold text-gray-800">
                    {workdays.length}
                  </dd>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-600">
                    Bu Ay Toplam Kazanç
                  </dt>
                  <dd className="text-2xl font-bold text-gray-800">
                    ₺
                    {workdays
                      .reduce((total, day) => total + day.wageOnThatDay, 0)
                      .toLocaleString("tr-TR")}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
