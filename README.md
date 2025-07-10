# Daily Mate - Günlük Çalışma Takip Uygulaması

Modern ve kullanıcı dostu arayüzü ile günlük çalışma saatlerinizi, kazançlarınızı ve iş yerlerinizi kolayca takip edin. Daily Mate, freelancer'lar, part-time çalışanlar ve çoklu iş yerinde çalışan kişiler için tasarlanmış kapsamlı bir çalışma takip platformudur.

![Daily Mate Banner](https://via.placeholder.com/800x400/10b981/ffffff?text=Daily+Mate)

## ✨ Özellikler

### 🎯 Temel Özellikler

- **Günlük Çalışma Takibi**: Tek tıkla günlük çalışma saatlerinizi kaydedin
- **Çoklu İş Yeri Yönetimi**: Birden fazla iş yerini ayrı ayrı takip edin
- **Kazanç Hesaplama**: Otomatik günlük/aylık kazanç hesaplamaları
- **Modern Takvim Arayüzü**: Görsel takvim ile çalışma günlerinizi izleyin
- **Detaylı İstatistikler**: Aylık raporlar ve performans analizleri
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu modern arayüz

### 📊 Analitik ve Raporlama

- Aylık toplam çalışma günü sayısı
- Aylık toplam kazanç miktarı
- İş yeri bazında performans karşılaştırması
- Günlük ortalama kazanç hesaplama
- Çalışma düzeni analizi

### 🔧 Teknik Özellikler

- **Next.js 15**: Modern React framework
- **TypeScript**: Tip güvenliği
- **MongoDB**: NoSQL veritabanı
- **NextAuth.js**: Güvenli kimlik doğrulama
- **TailwindCSS**: Modern ve responsive tasarım
- **PWA Desteği**: Progressive Web App özellikleri
- **SEO Optimizasyonu**: Arama motoru optimizasyonu

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Node.js 18.0 veya üzeri
- MongoDB veritabanı
- npm veya yarn paket yöneticisi

### Kurulum

1. **Depoyu klonlayın**

   ```bash
   git clone https://github.com/yourusername/daily-mate.git
   cd daily-mate
   ```

2. **Bağımlılıkları yükleyin**

   ```bash
   npm install
   # veya
   yarn install
   ```

3. **Ortam değişkenlerini ayarlayın**

   ```bash
   cp .env.example .env.local
   ```

   `.env.local` dosyasını düzenleyin:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Geliştirme sunucusunu başlatın**

   ```bash
   npm run dev
   # veya
   yarn dev
   ```

5. **Tarayıcıda açın**
   [http://localhost:3000](http://localhost:3000) adresine gidin

## 📁 Proje Yapısı

```
daily-mate/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── (auth)/            # Kimlik doğrulama sayfaları
│   │   ├── (main)/            # Ana uygulama sayfaları
│   │   ├── api/               # API rotaları
│   │   └── globals.css        # Global stiller
│   ├── components/            # React bileşenleri
│   ├── lib/                   # Yardımcı kütüphaneler
│   ├── models/                # MongoDB modelleri
│   └── types/                 # TypeScript tip tanımları
├── public/                    # Statik dosyalar
├── next.config.ts            # Next.js konfigürasyonu
├── tailwind.config.ts        # TailwindCSS konfigürasyonu
└── tsconfig.json             # TypeScript konfigürasyonu
```

## 🎨 Tasarım Sistemi

### Renk Paleti

- **Birincil**: Emerald (#10b981)
- **İkincil**: Teal (#0d9488)
- **Vurgu**: Gray (#6b7280)
- **Arka plan**: White (#ffffff)

### Tipografi

- **Ana Font**: Geist Sans
- **Kod Font**: Geist Mono

## 🔐 Güvenlik

- **NextAuth.js**: Güvenli kimlik doğrulama
- **MongoDB**: Güvenli veritabanı bağlantısı
- **Environment Variables**: Hassas bilgilerin güvenli saklanması
- **HTTPS**: Üretim ortamında zorunlu
- **Input Validation**: Tüm kullanıcı girdilerinin doğrulanması

## 📈 SEO Optimizasyonu

### Teknik SEO

- ✅ **Meta Tags**: Kapsamlı meta description ve keywords
- ✅ **Open Graph**: Sosyal medya paylaşımları için
- ✅ **Twitter Cards**: Twitter paylaşımları için
- ✅ **Structured Data**: Schema.org JSON-LD
- ✅ **Sitemap.xml**: Otomatik sitemap oluşturma
- ✅ **Robots.txt**: Arama motoru yönlendirme
- ✅ **Canonical URLs**: Duplicate content önleme
- ✅ **PWA Manifest**: Progressive Web App desteği

### İçerik SEO

- ✅ **Semantic HTML**: Anlamsal HTML yapısı
- ✅ **Alt Texts**: Tüm görseller için alt metinleri
- ✅ **Heading Structure**: H1-H6 hiyerarşisi
- ✅ **Internal Linking**: İç bağlantı yapısı
- ✅ **Mobile-First**: Mobil öncelikli tasarım

### Performans SEO

- ✅ **Core Web Vitals**: LCP, FID, CLS optimizasyonu
- ✅ **Image Optimization**: WebP ve AVIF desteği
- ✅ **Lazy Loading**: Görsel lazy loading
- ✅ **Code Splitting**: Otomatik kod bölme
- ✅ **Compression**: Gzip/Brotli sıkıştırma

## 📱 PWA Özellikleri

- **Offline Çalışma**: Temel işlevler offline erişilebilir
- **Install Prompt**: Uygulamayı cihaza yüklenebilir
- **Push Notifications**: Bildirim desteği (gelecek)
- **Background Sync**: Arka plan senkronizasyonu (gelecek)

## 🧪 Test ve Kalite

### Çalıştırılabilir Testler

```bash
# Linting
npm run lint

# Build testi
npm run build

# Lighthouse analizi
npm run lighthouse

# Bundle analizi
npm run analyze
```

### Kod Kalitesi

- **ESLint**: Kod standartları
- **TypeScript**: Tip güvenliği
- **Prettier**: Kod formatlaması (önerilen)

## 🚀 Deployment

### Vercel (Önerilen)

1. GitHub'a push yapın
2. Vercel'e import edin
3. Environment variables'ları ayarlayın
4. Deploy edin

### Manuel Deployment

```bash
# Production build
npm run build

# Production server
npm start
```

## 📊 Analytics ve Monitoring

### Entegre Edilebilir Araçlar

- **Google Analytics**: Kullanıcı analitikleri
- **Google Search Console**: SEO monitoring
- **Hotjar**: Kullanıcı davranış analizi
- **Sentry**: Hata tracking (gelecek)

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Branch'i push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim

- **Website**: [https://dailymate.app](https://dailymate.app)
- **Email**: support@dailymate.app
- **GitHub**: [https://github.com/yourusername/daily-mate](https://github.com/yourusername/daily-mate)

## 🙏 Teşekkürler

- [Next.js](https://nextjs.org/) - React framework
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [MongoDB](https://mongodb.com/) - Database
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Vercel](https://vercel.com/) - Hosting platform

---

**Daily Mate** ile günlük çalışma takibinizi modernleştirin! 🚀
