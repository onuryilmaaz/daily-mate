"use client";

import { useState, useEffect, useRef } from "react";

interface WorkDay {
  _id: string;
  date: string;
  workplaceId: {
    _id: string;
    name: string;
    color: string;
    dailyWage: number;
    isActive: boolean;
  };
  wageOnThatDay: number;
  userId: string;
}

interface Workplace {
  _id: string;
  name: string;
  color: string;
  dailyWage: number;
  isActive: boolean;
}

interface CalendarViewProps {
  workdays: WorkDay[];
  workplaces: Workplace[];
  onWorkdayAdded?: (workday: WorkDay) => void;
  onWorkdayUpdated?: (workday: WorkDay) => void;
  onWorkdayDeleted?: (workdayId: string) => void;
  selectedMonth: number;
  selectedYear: number;
  onDateChange: (month: number, year: number) => void;
}

export default function CalendarView({
  workdays,
  workplaces,
  onWorkdayAdded,
  onWorkdayUpdated,
  onWorkdayDeleted,
  selectedMonth,
  selectedYear,
  onDateChange,
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkplace, setSelectedWorkplace] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [editingWorkday, setEditingWorkday] = useState<WorkDay | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const year = selectedYear;
  const month = selectedMonth - 1; // Convert to 0-based month

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

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

  const openModal = (date: Date, existingWorkday?: WorkDay) => {
    // Sadece bu ay ve bugünden önceki veya bugün olan günler için modal açılabilir
    if (date.getMonth() !== month || date > today) {
      return;
    }

    setSelectedDate(date);
    setError("");
    
    if (existingWorkday) {
      // Düzenleme modu
      setModalMode('edit');
      setEditingWorkday(existingWorkday);
      setSelectedWorkplace(existingWorkday.workplaceId._id);
    } else {
      // Ekleme modu
      setModalMode('add');
      setEditingWorkday(null);
      setSelectedWorkplace("");
    }
    
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setSelectedWorkplace("");
    setError("");
    setIsDropdownOpen(false);
    setEditingWorkday(null);
    setModalMode('add');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedWorkplace || submitting) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      if (modalMode === 'edit' && editingWorkday) {
        // Güncelleme işlemi
        const response = await fetch(`/api/workdays/${editingWorkday._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workplaceId: selectedWorkplace,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "İşlem sırasında hata oluştu");
          return;
        }

        // Call the callback with the updated workday
        if (onWorkdayUpdated && data.workday) {
          onWorkdayUpdated(data.workday);
        }
      } else {
        // Ekleme işlemi
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
      }

      closeModal();
    } catch {
      setError("İşlem sırasında hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingWorkday || submitting) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/workdays/${editingWorkday._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "İşlem sırasında hata oluştu");
        return;
      }

      // Call the callback with the deleted workday ID
      if (onWorkdayDeleted) {
        onWorkdayDeleted(editingWorkday._id);
      }

      closeModal();
    } catch {
      setError("İşlem sırasında hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
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
          const isClickableForAdd =
            day.isCurrentMonth && day.date <= today && !day.hasWork;
          const isClickableForEdit =
            day.isCurrentMonth && day.date <= today && day.hasWork;

          return (
            <div
              key={index}
              onClick={() => {
                if (isClickableForAdd) {
                  openModal(day.date);
                } else if (isClickableForEdit && day.workDay) {
                  openModal(day.date, day.workDay);
                }
              }}
              className={`
                aspect-square flex items-center justify-center text-sm relative overflow-hidden
                ${!day.isCurrentMonth ? "text-gray-300" : "text-gray-900"}
                ${
                  day.isToday && !day.hasWork
                    ? "bg-emerald-100 text-emerald-700 font-semibold border-2 border-emerald-300"
                    : ""
                }
                ${day.hasWork ? "text-white font-bold shadow-md border-2" : ""}
                ${
                  isClickableForAdd || isClickableForEdit
                    ? "cursor-pointer hover:bg-emerald-50 hover:scale-105"
                    : ""
                }
                ${day.date > today ? "text-gray-300" : ""}
                rounded-xl transition-all duration-200
              `}
              style={{
                backgroundColor: day.hasWork
                  ? day.workDay?.workplaceId.color
                  : undefined,
                borderColor: day.hasWork
                  ? day.workDay?.workplaceId.color
                  : undefined,
                boxShadow: day.hasWork
                  ? `0 4px 12px ${day.workDay?.workplaceId.color}40`
                  : undefined,
              }}
            >
              {/* Background gradient for work days */}
              {day.hasWork && (
                <div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${day.workDay?.workplaceId.color} 0%, ${day.workDay?.workplaceId.color}E0 100%)`,
                  }}
                ></div>
              )}

              {/* Date number */}
              <span
                className={`relative z-10 ${
                  day.hasWork ? "drop-shadow-sm" : ""
                }`}
              >
                {day.date.getDate()}
              </span>

              {/* Work day indicator dot */}
              {day.hasWork && (
                <div className="absolute bottom-1 right-1 w-2 h-2 bg-white rounded-full opacity-80"></div>
              )}

              {/* Today indicator for work days */}
              {day.isToday && day.hasWork && (
                <div className="absolute top-1 left-1 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
              )}
            </div>
          );
        })}
      </div>

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
                {modalMode === 'edit' ? 'Çalışma Günü Düzenle' : 'Çalışma Günü Ekle'}
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
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İş Yeri Seçin
                  </label>

                  {/* Custom Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-gray-400 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        {selectedWorkplace ? (
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor:
                                  workplaces.find(
                                    (w) => w._id === selectedWorkplace
                                  )?.color || "#3B82F6",
                              }}
                            ></div>
                            <div>
                              <span className="text-gray-900 font-medium">
                                {
                                  workplaces.find(
                                    (w) => w._id === selectedWorkplace
                                  )?.name
                                }
                              </span>
                              <span className="text-gray-500 text-sm ml-2">
                                {workplaces
                                  .find((w) => w._id === selectedWorkplace)
                                  ?.dailyWage.toLocaleString("tr-TR")}{" "}
                                ₺
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">İş yeri seçiniz</span>
                        )}
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            isDropdownOpen ? "rotate-180" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {workplaces.length === 0 ? (
                          <div className="px-4 py-3 text-gray-500 text-sm">
                            Henüz aktif iş yeri bulunmuyor
                          </div>
                        ) : (
                          workplaces.map((workplace) => (
                            <button
                              key={workplace._id}
                              type="button"
                              onClick={() => {
                                setSelectedWorkplace(workplace._id);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full px-4 py-3 text-left hover:bg-emerald-50 focus:bg-emerald-50 focus:outline-none transition-colors border-b border-gray-100 last:border-b-0 ${
                                selectedWorkplace === workplace._id
                                  ? "bg-emerald-50"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: workplace.color }}
                                ></div>
                                <div>
                                  <div className="text-gray-900 font-medium">
                                    {workplace.name}
                                  </div>
                                  <div className="text-gray-500 text-sm">
                                    Günlük:{" "}
                                    {workplace.dailyWage.toLocaleString(
                                      "tr-TR"
                                    )}{" "}
                                    ₺
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
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
                  
                  {modalMode === 'edit' && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={submitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Siliniyor..." : "Sil"}
                    </button>
                  )}
                  
                  <button
                    type="submit"
                    disabled={submitting || !selectedWorkplace}
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 
                      (modalMode === 'edit' ? "Güncelleniyor..." : "Ekleniyor...") : 
                      (modalMode === 'edit' ? "Güncelle" : "Ekle")
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
