import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Daily Mate - Günlük Çalışma ve Kazanç Takip Uygulaması",
  description:
    "Günlük çalışma saatlerinizi, kazançlarınızı ve iş yerlerinizi kolayca takip edin. Ücretsiz, modern ve kullanıcı dostu arayüzü ile çalışma verilerinizi analiz edin ve raporlayın.",
  keywords: [
    "günlük çalışma takip",
    "kazanç hesaplayıcı",
    "iş yeri yönetimi",
    "freelancer takip",
    "çalışma saati hesaplama",
    "yevmiye takip",
    "iş raporu",
    "çalışma takvimi",
  ],
  openGraph: {
    title: "Daily Mate - Günlük Çalışma ve Kazanç Takip Uygulaması",
    description:
      "Günlük çalışma saatlerinizi, kazançlarınızı ve iş yerlerinizi kolayca takip edin. Ücretsiz, modern ve kullanıcı dostu arayüzü ile çalışma verilerinizi analiz edin.",
    url: "/",
    images: [
      {
        url: "/og-home.png",
        width: 1200,
        height: 630,
        alt: "Daily Mate Ana Sayfa",
      },
    ],
  },
  twitter: {
    title: "Daily Mate - Günlük Çalışma ve Kazanç Takip Uygulaması",
    description:
      "Günlük çalışma saatlerinizi, kazançlarınızı ve iş yerlerinizi kolayca takip edin.",
    images: ["/twitter-home.png"],
  },
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Daily Mate
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-emerald-600 font-medium transition-colors"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Ücretsiz Başla
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Günlük Çalışmanızı
            <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent block mt-2">
              Kolayca Takip Edin
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Modern ve kullanıcı dostu arayüzü ile günlük çalışma saatlerinizi,
            kazançlarınızı ve iş yerlerinizi takip edin. Detaylı raporlar ve
            analizler ile verimliliğinizi artırın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 shadow-xl"
            >
              Ücretsiz Hesap Oluştur
            </Link>
            <Link
              href="#features"
              className="text-emerald-600 hover:text-emerald-700 font-semibold text-lg flex items-center space-x-2 transition-colors"
            >
              <span>Özellikleri Keşfet</span>
              <svg
                className="w-5 h-5"
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
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-gray-900 mb-4">
            Neden Daily Mate?
          </h3>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Çalışma hayatınızı organize etmeniz için ihtiyacınız olan tüm
            araçlar tek bir platformda
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-emerald-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-6">
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
            <h4 className="text-xl font-semibold text-gray-900 mb-4">
              Kolay Takip
            </h4>
            <p className="text-gray-600">
              Tek tıkla günlük çalışma saatlerinizi kaydedin. Modern takvim
              arayüzü ile tüm çalışma günlerinizi görselleştirin.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-emerald-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-6">
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-4">
              Detaylı Raporlar
            </h4>
            <p className="text-gray-600">
              Aylık kazanç analizi, iş yeri bazında raporlar ve performans
              istatistikleri ile verilerinizi analiz edin.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-emerald-100 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-6">
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-4">
              Çoklu İş Yeri
            </h4>
            <p className="text-gray-600">
              Birden fazla iş yerinde çalışıyorsanız, her birini ayrı ayrı takip
              edin ve karşılaştırın.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-emerald-500 to-teal-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-white mb-6">
            Hemen Başlayın, Tamamen Ücretsiz!
          </h3>
          <p className="text-xl text-emerald-100 mb-8">
            Hesap oluşturmak sadece 30 saniye. Kredi kartı gerektirmez.
          </p>
          <Link
            href="/register"
            className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-xl inline-block"
          >
            Ücretsiz Hesap Oluştur
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
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
                <span className="text-xl font-bold">Daily Mate</span>
              </div>
              <p className="text-gray-400 mb-4">
                Günlük çalışma takibinde yeni nesil çözüm. Modern, hızlı ve
                kullanıcı dostu.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="sr-only">Facebook</span>
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="sr-only">Twitter</span>
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Ürün</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/features"
                    className="hover:text-white transition-colors"
                  >
                    Özellikler
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="hover:text-white transition-colors"
                  >
                    Fiyatlandırma
                  </Link>
                </li>
                <li>
                  <Link
                    href="/updates"
                    className="hover:text-white transition-colors"
                  >
                    Güncellemeler
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Destek</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/help"
                    className="hover:text-white transition-colors"
                  >
                    Yardım Merkezi
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-white transition-colors"
                  >
                    İletişim
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-white transition-colors"
                  >
                    Gizlilik
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-white transition-colors"
                  >
                    Kullanım Şartları
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Daily Mate. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
