"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Workplace {
  _id: string;
  name: string;
  dailyWage: number;
  color: string;
}

interface WorkDay {
  _id: string;
  date: string;
  wageOnThatDay: number;
  workplaceId: {
    _id: string;
    name: string;
    color: string;
    dailyWage: number;
  };
}

interface CalendarViewProps {
  workdays: WorkDay[];
  workplaces: Workplace[];
}

export default function CalendarView({
  workdays,
  workplaces,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalWorkday, setModalWorkday] = useState<WorkDay | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  // Bu ayın ilk ve son günlerini hesapla
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  const firstDayOfWeek = firstDayOfMonth.getDay();

  // Takvim için gün sayısını hesapla
  const daysInMonth = lastDayOfMonth.getDate();

  // Önceki aydan gösterilecek günler
  const prevMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    0
  );
  const daysFromPrevMonth = firstDayOfWeek;

  // Sonraki aydan gösterilecek günler
  const totalCells = 42; // 6 hafta x 7 gün
  const daysFromNextMonth = totalCells - daysInMonth - daysFromPrevMonth;

  // Çalışma günlerini tarih anahtarı ile eşle
  const workdayMap = new Map();
  workdays.forEach((workday) => {
    const date = new Date(workday.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
    workdayMap.set(key, workday);
  });

  // Tarih formatı
  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  // Önceki ay
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  // Sonraki ay
  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  // Bu aya git
  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  // Günü tıklama
  const handleDayClick = (
    day: number,
    isCurrentMonth: boolean,
    isPreviousMonth: boolean
  ) => {
    if (!isCurrentMonth) return;

    let clickedDate: Date;
    if (isPreviousMonth) {
      clickedDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        day
      );
    } else {
      clickedDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
    }

    const dateKey = formatDate(clickedDate);
    const existingWorkday = workdayMap.get(dateKey);

    if (existingWorkday) {
      // Mevcut çalışma günü varsa, modalı aç
      setModalWorkday(existingWorkday);
      setSelectedDate(clickedDate);
      setShowModal(true);
    } else {
      // Çalışma günü yoksa, ekleme modalını aç
      setModalWorkday(null);
      setSelectedDate(clickedDate);
      setShowModal(true);
    }
  };

  // Modal'ı kapat
  const closeModal = () => {
    setShowModal(false);
    setModalWorkday(null);
    setSelectedDate(null);
    setError("");
  };

  // Çalışma günü ekle
  const handleAddWorkday = async (workplaceId: string, customWage?: number) => {
    if (!selectedDate || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      const selectedWorkplace = workplaces.find((wp) => wp._id === workplaceId);
      const wageToUse =
        customWage !== undefined
          ? customWage
          : selectedWorkplace?.dailyWage || 0;

      const response = await fetch("/api/workdays", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: formatDate(selectedDate),
          workplaceId: workplaceId,
          wageOnThatDay: wageToUse,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Çalışma günü eklenirken hata oluştu");
        return;
      }

      closeModal();
      router.refresh();
    } catch (error) {
      setError("Çalışma günü eklenirken hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Çalışma günü sil
  const handleDeleteWorkday = async () => {
    if (!modalWorkday || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/workdays/${modalWorkday._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Çalışma günü silinirken hata oluştu");
        return;
      }

      closeModal();
      router.refresh();
    } catch (error) {
      setError("Çalışma günü silinirken hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Takvim oluştur
  const renderCalendar = () => {
    const days = [];

    // Önceki aydan günler
    for (let i = daysFromPrevMonth; i > 0; i--) {
      const day = prevMonth.getDate() - i + 1;
      days.push(
        <div
          key={`prev-${day}`}
          className="h-8 sm:h-12 lg:h-16 flex items-center justify-center text-gray-300 text-xs sm:text-sm cursor-not-allowed"
        >
          {day}
        </div>
      );
    }

    // Bu ayın günleri
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const dateKey = formatDate(date);
      const workday = workdayMap.get(dateKey);
      const isToday =
        date.getDate() === new Date().getDate() &&
        date.getMonth() === new Date().getMonth() &&
        date.getFullYear() === new Date().getFullYear();

      days.push(
        <div
          key={day}
          onClick={() => handleDayClick(day, true, false)}
          className={`h-8 sm:h-12 lg:h-16 p-1 cursor-pointer rounded-lg transition-all duration-200 border-2 ${
            isToday
              ? "border-indigo-500 bg-indigo-50"
              : "border-transparent hover:border-gray-300 hover:bg-gray-50"
          } ${workday ? "transform hover:scale-105 shadow-lg" : ""}`}
          style={{
            backgroundColor: workday ? workday.workplaceId.color : undefined,
          }}
        >
          <div className="h-full w-full flex flex-col justify-between">
            <div
              className={`text-xs sm:text-sm font-medium ${
                workday
                  ? "text-white"
                  : isToday
                  ? "text-indigo-600"
                  : "text-gray-700"
              }`}
            >
              {day}
            </div>
            {workday && (
              <div className="text-xs text-white font-semibold opacity-90 bg-black/20 rounded px-1">
                ₺{workday.wageOnThatDay.toLocaleString("tr-TR")}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Sonraki aydan günler
    for (let day = 1; day <= daysFromNextMonth; day++) {
      days.push(
        <div
          key={`next-${day}`}
          className="h-8 sm:h-12 lg:h-16 flex items-center justify-center text-gray-300 text-xs sm:text-sm cursor-not-allowed"
        >
          {day}
        </div>
      );
    }

    return days;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Önceki Ay"
        >
          <svg
            className="w-5 h-5 text-gray-600"
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

        <div className="flex-1 mx-4 text-center">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
            {currentDate.toLocaleDateString("tr-TR", {
              month: "long",
              year: "numeric",
            })}
          </h3>
        </div>

        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Sonraki Ay"
        >
          <svg
            className="w-5 h-5 text-gray-600"
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

      {/* Quick Actions */}
      <div className="flex justify-center mb-6">
        <button
          onClick={goToCurrentMonth}
          className="px-4 py-2 text-sm bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-lg hover:from-blue-200 hover:to-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Bu Aya Git
        </button>
      </div>

      {/* Haftanın Günleri */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {[
          "Pazar",
          "Pazartesi",
          "Salı",
          "Çarşamba",
          "Perşembe",
          "Cuma",
          "Cumartesi",
        ].map((day) => (
          <div
            key={day}
            className="text-center text-xs sm:text-sm font-semibold text-gray-600 py-2"
          >
            {day.substring(0, 3)}
          </div>
        ))}
      </div>

      {/* Takvim */}
      <div className="grid grid-cols-7 gap-1 mb-6">{renderCalendar()}</div>

      {/* Legend */}
      <div className="text-center">
        <p className="text-xs text-gray-500 mb-2">
          Çalışma günü eklemek için tarihe tıklayın
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <div className="flex items-center text-xs text-gray-500">
            <div className="w-3 h-3 border-2 border-indigo-500 bg-indigo-50 rounded mr-2"></div>
            Bugün
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <div className="w-3 h-3 bg-gray-400 rounded mr-2"></div>
            Çalışma Günü
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-2xl rounded-2xl bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {modalWorkday
                  ? `${selectedDate?.toLocaleDateString(
                      "tr-TR"
                    )} - Çalışma Günü`
                  : `${selectedDate?.toLocaleDateString(
                      "tr-TR"
                    )} - Çalışma Günü Ekle`}
              </h3>

              {modalWorkday ? (
                // Mevcut çalışma günü görünümü
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div
                        className="w-4 h-4 rounded-full mr-3"
                        style={{
                          backgroundColor: modalWorkday.workplaceId.color,
                        }}
                      ></div>
                      <span className="font-semibold text-gray-800">
                        {modalWorkday.workplaceId.name}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800 mb-1">
                      ₺{modalWorkday.wageOnThatDay.toLocaleString("tr-TR")}
                    </div>
                    <div className="text-sm text-gray-500">
                      Standart Yevmiye: ₺
                      {modalWorkday.workplaceId.dailyWage.toLocaleString(
                        "tr-TR"
                      )}
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={closeModal}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
                    >
                      Kapat
                    </button>
                    <button
                      onClick={handleDeleteWorkday}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isSubmitting ? "Siliniyor..." : "Sil"}
                    </button>
                  </div>
                </div>
              ) : (
                // Yeni çalışma günü ekleme
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Bu tarih için hangi iş yerinde çalışacaksınız?
                  </p>

                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {workplaces.map((workplace) => (
                      <button
                        key={workplace._id}
                        onClick={() => handleAddWorkday(workplace._id)}
                        disabled={isSubmitting}
                        className="w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div
                              className="w-4 h-4 rounded-full mr-3"
                              style={{ backgroundColor: workplace.color }}
                            ></div>
                            <div>
                              <div className="font-semibold text-gray-800">
                                {workplace.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                Günlük Yevmiye: ₺
                                {workplace.dailyWage.toLocaleString("tr-TR")}
                              </div>
                            </div>
                          </div>
                          <svg
                            className="w-5 h-5 text-gray-400"
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
                        </div>
                      </button>
                    ))}
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={closeModal}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
