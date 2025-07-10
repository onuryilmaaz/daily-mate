"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";

interface Workplace {
  _id: string;
  name: string;
  dailyWage: number;
  color: string;
  isActive: boolean;
  createdAt: string;
}

interface WorkplaceManagerProps {
  onUpdate?: () => void;
  onWorkplaceChanged?: (workplace: Workplace) => void;
}

export default function WorkplaceManager({
  onUpdate,
  onWorkplaceChanged,
}: WorkplaceManagerProps) {
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkplace, setEditingWorkplace] = useState<Workplace | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    dailyWage: "",
    color: "#3B82F6",
  });
  const [submitting, setSubmitting] = useState(false);

  const colors = [
    "#3B82F6", // Blue
    "#EF4444", // Red
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#14B8A6", // Teal
    "#F97316", // Orange
    "#6366F1", // Indigo
    "#84CC16", // Lime
  ];

  useEffect(() => {
    fetchWorkplaces();
  }, []);

  const fetchWorkplaces = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/workplaces/all"); // Tüm workplace'leri getir
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "İş yerleri yüklenirken hata oluştu");
        return;
      }

      setWorkplaces(data.workplaces);
    } catch {
      setError("İş yerleri yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (workplace?: Workplace) => {
    if (workplace) {
      setEditingWorkplace(workplace);
      setFormData({
        name: workplace.name,
        dailyWage: workplace.dailyWage.toString(),
        color: workplace.color,
      });
    } else {
      setEditingWorkplace(null);
      setFormData({
        name: "",
        dailyWage: "",
        color: "#3B82F6",
      });
    }
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingWorkplace(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitting) return;

    const dailyWage = Number(formData.dailyWage);

    if (dailyWage <= 0) {
      setError("Günlük yevmiye 0'dan büyük olmalıdır");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const url = editingWorkplace
        ? `/api/workplaces/${editingWorkplace._id}`
        : "/api/workplaces";

      const response = await fetch(url, {
        method: editingWorkplace ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          dailyWage: dailyWage,
          color: formData.color,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "İşlem sırasında hata oluştu");
        return;
      }

      // Anlık güncelleme: yeni/güncellenmiş workplace'i parent'a gönder
      if (onWorkplaceChanged && data.workplace) {
        onWorkplaceChanged(data.workplace);
      }

      closeModal();
      fetchWorkplaces();

      // Notify parent component
      if (onUpdate) {
        onUpdate();
      }
    } catch {
      setError("İşlem sırasında hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (workplace: Workplace) => {
    try {
      console.log(
        "Toggle başlatıldı:",
        workplace.name,
        "mevcut durum:",
        workplace.isActive
      );

      const response = await fetch(`/api/workplaces/${workplace._id}/toggle`, {
        method: "PATCH",
      });

      const data = await response.json();
      console.log("API response:", data);

      if (!response.ok) {
        setError(data.error || "Durum değişikliği başarısız");
        return;
      }

      // Anlık güncelleme: değişmiş workplace'i parent'a gönder
      if (onWorkplaceChanged && data.workplace) {
        onWorkplaceChanged(data.workplace);
      }

      fetchWorkplaces();

      // Notify parent component
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Toggle hatası:", error);
      setError("Durum değişikliği sırasında hata oluştu");
    }
  };

  const handleDelete = async (workplace: Workplace) => {
    const result = await Swal.fire({
      title: "İş Yeri Sil",
      text: `"${workplace.name}" iş yerini silmek istediğinizden emin misiniz? Bu işlemle birlikte bu iş yerine ait tüm çalışma günleri de silinecektir.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Evet, Sil!",
      cancelButtonText: "İptal",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/workplaces/${workplace._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        await Swal.fire({
          title: "Hata!",
          text: data.error || "Silme işlemi başarısız",
          icon: "error",
          confirmButtonText: "Tamam",
        });
        return;
      }

      await Swal.fire({
        title: "Başarılı!",
        text: `"${workplace.name}" iş yeri ve ilgili tüm kayıtlar başarıyla silindi.`,
        icon: "success",
        confirmButtonText: "Tamam",
      });

      fetchWorkplaces();

      // Notify parent component
      if (onUpdate) {
        onUpdate();
      }
    } catch {
      await Swal.fire({
        title: "Hata!",
        text: "Silme işlemi sırasında hata oluştu",
        icon: "error",
        confirmButtonText: "Tamam",
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <svg
            className="w-6 h-6 mr-2 text-emerald-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0v-4a2 2 0 012-2h6a2 2 0 012 2v4m-6 0h-2"
            />
          </svg>
          İş Yerleri
        </h2>
        <button
          onClick={() => openModal()}
          className="flex items-center bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Yeni Ekle
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="flex-1">
        {workplaces.length > 0 ? (
          <div className="space-y-4 overflow-y-auto max-h-[580px] pr-2 -mr-2">
            {workplaces
              .sort(
                (a, b) =>
                  (b.isActive ? 1 : -1) - (a.isActive ? 1 : -1) ||
                  new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
              )
              .map((workplace) => (
                <div
                  key={workplace._id}
                  className="rounded-xl p-4 transition-all duration-300 shadow-md relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${
                      workplace.color
                    } 0%, ${shadeColor(workplace.color, -20)} 100%)`,
                    opacity: workplace.isActive ? 1 : 0.5,
                    border: `1px solid ${workplace.color}`,
                  }}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-bold text-lg text-white drop-shadow-sm">
                          {workplace.name}
                        </h3>
                        <p className="text-white text-sm opacity-90 drop-shadow-sm">
                          {workplace.dailyWage.toLocaleString("tr-TR")} ₺ /
                          günlük
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3">
                      {/* Toggle Switch */}
                      <button
                        onClick={() => handleToggleActive(workplace)}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none ${
                          workplace.isActive ? "bg-green-500" : "bg-red-700"
                        }`}
                      >
                        <span
                          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
                            workplace.isActive
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => openModal(workplace)}
                        className="p-2 rounded-full bg-white hover:bg-white/40 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          style={{ color: workplace.color }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"
                          />
                        </svg>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(workplace)}
                        className="p-2 rounded-full bg-white hover:bg-white/40 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          style={{ color: workplace.color }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg flex flex-col justify-center items-center">
            <svg
              className="w-12 h-12 text-gray-300 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0v-4a2 2 0 012-2h6a2 2 0 012 2v4m-6 0h-2"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-600">
              Henüz İş Yeri Eklemediniz
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Başlamak için yeni bir iş yeri ekleyin.
            </p>
            <button
              onClick={() => openModal()}
              className="mt-4 flex items-center bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              İlk İş Yerini Ekle
            </button>
          </div>
        )}
      </div>

      {/* Modal for adding/editing workplace */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative p-5 border w-full max-w-md shadow-lg rounded-2xl bg-white">
            <div className="mt-3">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                {editingWorkplace ? "İş Yerini Düzenle" : "Yeni İş Yeri Ekle"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    İş Yeri Adı
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Örn: Proje X"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="dailyWage"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Günlük Yevmiye (₺)
                  </label>
                  <input
                    type="number"
                    id="dailyWage"
                    name="dailyWage"
                    value={formData.dailyWage}
                    onChange={(e) =>
                      setFormData({ ...formData, dailyWage: e.target.value })
                    }
                    placeholder="Örn: 1000"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Renk Seçimi
                  </label>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-10 h-10 rounded-full transition-all duration-200 transform hover:scale-110 ${
                          formData.color === color ? "ring-4 ring-offset-2" : ""
                        }`}
                        style={{
                          backgroundColor: color,
                          borderColor: shadeColor(color, -20),
                          boxShadow: `0 2px 8px ${color}80`,
                        }}
                      >
                        {formData.color === color && (
                          <svg
                            className="w-6 h-6 text-white mx-auto"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-100 border-l-4 border-red-500 rounded-r-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={submitting}
                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-60 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={
                      submitting || !formData.name || !formData.dailyWage
                    }
                    className="px-6 py-3 text-sm font-semibold text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
                  >
                    {submitting
                      ? "Kaydediliyor..."
                      : editingWorkplace
                      ? "Güncelle"
                      : "Kaydet"}
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

// Helper function to shade colors
function shadeColor(color: string, percent: number) {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = parseInt(((R * (100 + percent)) / 100).toString());
  G = parseInt(((G * (100 + percent)) / 100).toString());
  B = parseInt(((B * (100 + percent)) / 100).toString());

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  R = Math.round(R);
  G = Math.round(G);
  B = Math.round(B);

  const RR = R.toString(16).length == 1 ? "0" + R.toString(16) : R.toString(16);
  const GG = G.toString(16).length == 1 ? "0" + G.toString(16) : G.toString(16);
  const BB = B.toString(16).length == 1 ? "0" + B.toString(16) : B.toString(16);

  return "#" + RR + GG + BB;
}
