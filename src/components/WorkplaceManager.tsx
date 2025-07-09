"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";

interface Workplace {
  _id: string;
  name: string;
  dailyWage: number;
  color: string;
  createdAt: string;
}

interface WorkplaceManagerProps {
  onUpdate?: () => void;
}

export default function WorkplaceManager({ onUpdate }: WorkplaceManagerProps) {
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
      const response = await fetch("/api/workplaces");
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
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">İş Yerleri</h2>
        <button
          onClick={() => openModal()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + İş Yeri Ekle
        </button>
      </div>

      {error && !isModalOpen && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {workplaces.length === 0 ? (
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Henüz iş yeri eklenmemiş
          </h3>
          <p className="text-gray-500 mb-4">
            İlk iş yerinizi ekleyerek başlayın.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {workplaces.map((workplace) => (
            <div
              key={workplace._id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: workplace.color }}
                  ></div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {workplace.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Günlük Yevmiye:{" "}
                      {workplace.dailyWage.toLocaleString("tr-TR")} ₺
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openModal(workplace)}
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(workplace)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {editingWorkplace ? "İş Yeri Düzenle" : "Yeni İş Yeri Ekle"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-5">
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
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    placeholder="Örn: ABC Şirketi"
                    required
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
                    value={formData.dailyWage}
                    onChange={(e) =>
                      setFormData({ ...formData, dailyWage: e.target.value })
                    }
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    placeholder="500"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Renk Seçimi
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          formData.color === color
                            ? "border-gray-900 ring-2 ring-gray-400"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
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
                  <button
                    type="submit"
                    disabled={
                      submitting || !formData.name.trim() || !formData.dailyWage
                    }
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
