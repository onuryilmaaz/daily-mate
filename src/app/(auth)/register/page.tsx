"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Şifreler eşleşmiyor");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Kayıt olurken bir hata oluştu");
        return;
      }

      // Başarılı kayıt sonrası giriş sayfasına yönlendir
      router.push("/login?message=Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
    } catch (error) {
      setError("Kayıt olurken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-100">
      {/* Main Content */}
      <div className="w-full max-w-md px-6">
        {/* Clean Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500 rounded-xl mx-auto flex items-center justify-center">
              <span className="text-2xl font-bold text-white">₺</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Daily Mate</h1>
            <p className="text-gray-600">Kayıt Ol</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              {/* Name and Surname Row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Name Input */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    İsim
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="given-name"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                    placeholder="İsminiz"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Surname Input */}
                <div>
                  <label
                    htmlFor="surname"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Soyisim
                  </label>
                  <input
                    id="surname"
                    name="surname"
                    type="text"
                    autoComplete="family-name"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                    placeholder="Soyisminiz"
                    value={formData.surname}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  E-posta adresi
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  placeholder="ornek@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Şifre
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  placeholder="En az 6 karakter"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>

              {/* Confirm Password Input */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Şifre Tekrar
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  placeholder="Şifrenizi tekrar giriniz"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-red-700 text-sm text-center">{error}</div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Kayıt yapılıyor...</span>
                </div>
              ) : (
                "Kayıt Ol"
              )}
            </button>
          </form>

          {/* Navigation */}
          <p className="text-center text-sm text-gray-600">
            Zaten hesabınız var mı?{" "}
            <Link
              href="/login"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Giriş yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
