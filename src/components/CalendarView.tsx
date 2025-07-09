"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

interface CalendarViewProps {
  workdays: WorkDay[];
  workplaces: Workplace[];
  onWorkdayAdded?: (workday: WorkDay) => void;
  selectedMonth: number;
  selectedYear: number;
  onDateChange: (month: number, year: number) => void;
}

export default function CalendarView({
  workdays,
  workplaces,
  onWorkdayAdded,
  selectedMonth,
  selectedYear,
  onDateChange,
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkplace, setSelectedWorkplace] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const today = new Date();
  const year = selectedYear;
  const month = selectedMonth - 1; // Convert to 0-based month

  // Ayın ilk günü ve son günü
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Ayın ilk gününün hangi gün olduğunu bulalım (0: Pazar, 1: Pazartesi, ...)
  const firstDayWeekday = firstDayOfMonth.getDay();

  // Takvim günlerini oluşturalım
  const calendarDays = [];

  // Önceki ayın son günlerini ekleyelim
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const prevDate = new Date(year, month, -i);
    calendarDays.push({
      date: prevDate,
      isCurrentMonth: false,
      isToday: false,
      hasWork: false,
      workDay: null as WorkDay | null,
    });
  }

  // Bu ayın günlerini ekleyelim
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateString = date.toISOString().split("T")[0];
    const workDay = workdays.find((wd) => wd.date.split("T")[0] === dateString);

    calendarDays.push({
      date,
      isCurrentMonth: true,
      isToday: date.toDateString() === today.toDateString(),
      hasWork: !!workDay,
      workDay: workDay || null,
    });
  }

  // Sonraki ayın ilk günlerini ekleyelim (42 gün tamamlamak için)
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    const nextDate = new Date(year, month + 1, day);
    calendarDays.push({
      date: nextDate,
      isCurrentMonth: false,
      isToday: false,
      hasWork: false,
      workDay: null,
    });
  }

  // Ay isimleri
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

  // Gün isimleri
  const dayNames = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

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
    const currentDate = new Date();
    onDateChange(currentDate.getMonth() + 1, currentDate.getFullYear());
  };

  const openModal = (date: Date) => {
    // Sadece bu ay ve bugünden önceki veya bugün olan günler için modal açılabilir
    if (date.getMonth() !== month || date > today) {
      return;
    }

    setSelectedDate(date);
    setSelectedWorkplace("");
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setSelectedWorkplace("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedWorkplace || submitting) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/workdays", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: selectedDate.toISOString().split("T")[0],
          workplaceId: selectedWorkplace,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "İşlem sırasında hata oluştu");
        return;
      }

      // Call the callback with the new workday
      if (onWorkdayAdded && data.workday) {
        onWorkdayAdded(data.workday);
      }

      closeModal();
    } catch (error) {
      setError("İşlem sırasında hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-emerald-50 rounded-lg transition-colors"
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

        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {monthNames[month]} {year}
          </h3>
        </div>

        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-emerald-50 rounded-lg transition-colors"
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

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {dayNames.map((dayName) => (
          <div
            key={dayName}
            className="text-center py-2 text-xs font-medium text-gray-500"
          >
            {dayName}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map((day, index) => {
          const isClickable =
            day.isCurrentMonth && day.date <= today && !day.hasWork;

          return (
            <div
              key={index}
              onClick={() => isClickable && openModal(day.date)}
              className={`
                aspect-square flex items-center justify-center text-sm relative
                ${!day.isCurrentMonth ? "text-gray-300" : "text-gray-900"}
                ${
                  day.isToday
                    ? "bg-emerald-100 text-emerald-700 font-semibold"
                    : ""
                }
                ${day.hasWork ? "text-white font-medium" : ""}
                ${isClickable ? "cursor-pointer hover:bg-emerald-50" : ""}
                ${day.date > today ? "text-gray-300" : ""}
                rounded-lg transition-colors
              `}
              style={{
                backgroundColor: day.hasWork
                  ? day.workDay?.workplaceId.color
                  : undefined,
              }}
            >
              <span className="relative z-10">{day.date.getDate()}</span>

              {/* Work indicator */}
              {day.hasWork && (
                <div
                  className="absolute inset-0 rounded-lg opacity-90"
                  style={{ backgroundColor: day.workDay?.workplaceId.color }}
                ></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      {workplaces.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            İş Yerleri:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {workplaces.map((workplace) => (
              <div key={workplace._id} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: workplace.color }}
                ></div>
                <span className="text-sm text-gray-600">{workplace.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-4 text-center">
        <button
          onClick={goToCurrentMonth}
          className="text-sm text-emerald-600 hover:text-emerald-500 font-medium"
        >
          Bu Aya Git
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && selectedDate && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Çalışma Günü Ekle
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {selectedDate.toLocaleDateString("tr-TR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="workplace"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    İş Yeri Seçin
                  </label>
                  <select
                    id="workplace"
                    value={selectedWorkplace}
                    onChange={(e) => setSelectedWorkplace(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    required
                  >
                    <option value="">İş yeri seçiniz</option>
                    {workplaces.map((workplace) => (
                      <option key={workplace._id} value={workplace._id}>
                        {workplace.name} -{" "}
                        {workplace.dailyWage.toLocaleString("tr-TR")} ₺
                      </option>
                    ))}
                  </select>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !selectedWorkplace}
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Ekleniyor..." : "Ekle"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
