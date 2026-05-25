# 🎈 Çocuk Dünyası (Kids Fun Land) - PWA

Çocuk Dünyası; çocukların eğlenerek öğrenmesini amaçlayan, içerisinde eğitici videolar, zeka ve yetenek oyunları barındıran **%100 Çevrimdışı (Offline)** destekli modern bir Web Uygulamasıdır (Progressive Web App - PWA).

Bu proje **Netlify** gibi statik barındırma (hosting) servislerinde tamamen **Sunucusuz (Serverless/Static)** çalışacak şekilde tasarlanmıştır.

## 🌟 Öne Çıkan Özellikler

*   **⚡ %100 Çevrimdışı Destek (PWA):** Service Worker teknolojisi sayesinde uygulama cihaza bir kez yüklendikten sonra HTML, CSS, JavaScript, oyun müzikleri ve resimler internet bağlantısı olmasa dahi kusursuz çalışır.
*   **🎮 Eğlenceli Oyunlar:** 
    *   **Uçan Çiko (Flappy Bird):** HTML5 Canvas tabanlı sevimli bir beceri oyunu.
    *   **Sevimli Köstebek (Whack-A-Mole):** Refleks geliştiren köstebek yakalama oyunu.
    *   **Meyve Yakalama (Fruit Catcher):** Sepetle düşen meyveleri yakalama oyunu.
    *   **Sihirli Ksilofon:** Web Audio API ile canlı ses sentezleyen sanal müzik aleti.
*   **🎵 Gerçek Müzik Kutusu:** Oyunlar esnasında arka planda çalan telifsiz ve neşeli çocuk mp3 müziği.
*   **🎲 Günlük Karıştırıcı (Daily Shuffle):** YouTube üzerinden çekilen 65 özel çocuk videosunun sıralaması her gün (cihazın saatine göre) otomatik olarak karıştırılır. Böylece çocuklara her gün yepyeni bir "ana sayfa" sunulur.
*   **📱 Mobil Tam Uyumluluk (Responsive):** Sistem bir cep telefonu ekranına tam oturacak şekilde CSS Grid ve Flexbox teknolojileri ile tasarlandı. Video izleme ekranında TikTok benzeri "Kaydırma (Swipe)" hareketleri desteklenmektedir.

## 🛠️ Kullanılan Teknolojiler

*   **Önyüz (Frontend):** Vanilla JavaScript, HTML5, Vanilla CSS
*   **Oyun Motoru:** HTML5 `<canvas>`, `requestAnimationFrame`
*   **Ses Motoru:** Web Audio API (`AudioContext`) ve HTML5 `<audio>` (Arka plan müziği için)
*   **Uygulama Mimarisi:** Progressive Web App (PWA), Service Worker (`sw.js`), Manifest (`manifest.json`)
*   **Veritabanı:** JSON objeleri (`video_data.js`)

## 🚀 Netlify'a Kurulum (Deployment)

Bu proje arkada hiçbir Node.js veya veritabanı (SQL) çalıştırmadan sadece statik dosyalarla çalışacak şekilde izole edilmiştir. GitHub deposuna bağlayarak direkt olarak yayına alabilirsiniz:

1. [Netlify](https://app.netlify.com/)'a giriş yapın.
2. **"Add new site"** -> **"Import an existing project"** adımlarını izleyin.
3. GitHub hesabınızı bağlayın ve **`K-DS_GAME`** isimli deponuzu seçin.
4. "Build command" kısmını **boş bırakın**. "Publish directory" kısmını da **boş (veya `/`)** bırakın.
5. **"Deploy Site"** butonuna tıklayın. 

Tebrikler! Siteniz artık tüm dünyada erişilebilir. Siteye telefonundan giren kullanıcılar, tarayıcılarında beliren "Ana Ekrana Ekle" butonuna basarak projeyi cihazlarına normal bir mobil uygulama (APK/IPA) gibi indirebilirler.

## 📁 Klasör Yapısı

```text
/
├── index.html        # Ana uygulama arayüzü ve oyun hub'ı
├── style.css         # Modern, cam efektli ve mobil uyumlu stil dosyası
├── app.js            # PWA kayıt, sayfa yönlendirme ve arama algoritmaları
├── games.js          # Tüm oyun motorları ve MP3 arka plan oynatıcısı
├── videos.js         # Günlük karıştırıcı (Daily Shuffle) ve video oynatıcı (Swipe)
├── video_data.js     # 65 videoluk yerel JSON veritabanı
├── sw.js             # Service Worker (Tüm sistemi çevrimdışı belleğe alır)
├── manifest.json     # Mobil cihaza kurulum (PWA) manifestosu
├── bg-music.mp3      # Oyunlarda çalan neşeli arka plan müziği
└── icon.svg          # Uygulama logosu
```

## 🔒 Güvenlik Notu
Videolar YouTube altyapısından (Iframe) geldiği için, çocukların güvenliği adına parametrelere `rel=0&modestbranding=1` eklenmiştir. Çevrimdışı durumlarda YouTube videoları yerini şık bir "İnternet Gerekli" uyarı ekranına bırakır, ancak **oyunlar ve müzikler her koşulda çalışmaya devam eder.**
