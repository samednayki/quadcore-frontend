# Otel Rezervasyon Sistemi

Modern ve kullanıcı dostu bir otel rezervasyon sistemi. React, TypeScript ve Tailwind CSS kullanılarak geliştirilmiştir.

## 🚀 Özellikler

- **Arama Sayfası**: Gelişmiş arama kriterleri (lokasyon, tarih, misafir sayısı, para birimi)
- **Arama Sonuçları**: Filtreleme ve sıralama seçenekleri
- **Otel Detay Sayfası**: Detaylı otel bilgileri ve oda seçenekleri
- **Rezervasyon Sistemi**: Adım adım rezervasyon süreci
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu
- **Modern UI/UX**: Tailwind CSS ile modern tasarım

## 🛠️ Teknolojiler

- **React 18** - Modern React hooks ve functional components
- **TypeScript** - Tip güvenliği
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Sayfa yönlendirme
- **React Query** - Server state management
- **Axios** - HTTP client
- **React Hook Form** - Form yönetimi
- **React DatePicker** - Tarih seçimi
- **React Select** - Gelişmiş select bileşenleri

## 📁 Proje Yapısı

```
src/
├── components/          # Yeniden kullanılabilir bileşenler
│   ├── Layout/         # Layout bileşenleri
│   └── ...
├── pages/              # Sayfa bileşenleri
│   ├── SearchPage/     # Arama sayfası
│   ├── SearchResultsPage/ # Arama sonuçları
│   ├── HotelDetailPage/   # Otel detay sayfası
│   └── ReservationPage/   # Rezervasyon sayfası
├── hooks/              # Custom React hooks
├── services/           # API servisleri
├── types/              # TypeScript tip tanımları
├── utils/              # Yardımcı fonksiyonlar
├── constants/          # Sabit değerler
└── styles/             # CSS dosyaları
```

## 🚀 Kurulum

1. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

2. **Geliştirme sunucusunu başlatın:**
   ```bash
   npm start
   ```

3. **Tarayıcıda açın:**
   ```
   http://localhost:3000
   ```

## 📋 Kullanım

### Arama Yapma
1. Ana sayfada lokasyon seçin
2. Giriş ve çıkış tarihlerini belirleyin
3. Misafir sayısını ve yaşlarını girin
4. Para birimi ve uyruk seçin
5. "Otel Ara" butonuna tıklayın

### Rezervasyon Yapma
1. Arama sonuçlarından bir otel seçin
2. Oda tipini belirleyin
3. Misafir bilgilerini girin
4. Ödeme bilgilerini tamamlayın
5. Rezervasyonu onaylayın

## 🎨 Tasarım Sistemi

### Renkler
- **Primary**: Mavi tonları (#3B82F6)
- **Secondary**: Gri tonları (#64748B)
- **Accent**: Sarı tonları (#EAB308)

### Bileşenler
- **Cards**: Beyaz arka plan, yumuşak gölgeler
- **Buttons**: Primary ve secondary varyantlar
- **Forms**: Tutarlı input stilleri
- **Typography**: Inter font ailesi

## 🔧 Geliştirme

### Yeni Sayfa Ekleme
1. `src/pages/` altında yeni klasör oluşturun
2. Sayfa bileşenini oluşturun
3. `App.tsx`'te route ekleyin

### Yeni Bileşen Ekleme
1. `src/components/` altında uygun klasöre ekleyin
2. TypeScript interface'lerini tanımlayın
3. Tailwind CSS sınıflarını kullanın

### API Entegrasyonu
1. `src/services/api.ts`'te yeni endpoint ekleyin
2. Tip tanımlarını `src/types/` altında güncelleyin
3. React Query ile state yönetimi yapın

## 📱 Responsive Tasarım

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

## 🧪 Test

```bash
# Testleri çalıştır
npm test

# Test coverage
npm test -- --coverage
```

## 📦 Build

```bash
# Production build
npm run build

# Build analizi
npm run build -- --analyze
```

## 🌐 Deployment

```bash
# Netlify
netlify deploy

# Vercel
vercel

# GitHub Pages
npm run deploy
```

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 İletişim

- **Email**: info@otelrez.com
- **Website**: https://otelrez.com
- **GitHub**: https://github.com/otelrez

---

**OtelRez** - En iyi otel rezervasyon deneyimi için tasarlandı. 🏨✨