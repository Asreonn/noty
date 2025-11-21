## 📋 PROJE RAPORU: "Cozy Not-To-Do Canvas" (Local & AI-First)

**Amaç:** Kullanıcının zihinsel yükünü hafifleten, verilerin tamamen kullanıcının tarayıcısında (Local Storage) kaldığı, "yapılacaklar" yerine "yapılmayacaklar"a odaklanan, sonsuz ve huzurlu bir çalışma masası (Infinite Canvas) oluşturmak.

### 1. Tasarım Dili ve Atmosfer (The Vibe)

- **Genel His:** Dijital bir yazılım gibi değil, sıcak, yumuşak ve organik bir mantar pano gibi hissettirmeli.
- **Renk Paleti:** "Cozy/Lo-fi" estetiği. Krem rengi arka planlar, 8 adet canlı pastel ton (Yellow, Red, Blue, Green, Purple, Orange, Pink, Cyan) ve **Sınırsız Özel Renk** desteği (Hex/Wheel). Göz yormayan ama canlı bir atmosfer.
- **Tipografi:** Okunabilirliği yüksek ama hafif el yazısı hissi veren, yumuşak hatlı fontlar.

### 2. İçerik Birimleri (Content Units)

Sistemde iki temel yapı taşı olacak, ancak kullanıcı bunları dönüştürebilir:

1.  **Not-To-Do Kartları:** Bir "kaçınma" hedefi. (Örn: "Gece 12'den sonra ekrana bakma"). Görsel olarak daha belirgin, belki minik bir uyarı ikonu veya daha kalın bir çerçeve ile ayrışır.
2.  **Serbest Notlar (Sticky Notes):** Düşünceler, fikirler veya Not-To-Do'yu destekleyen maddeler.
3.  **Bağlantılar (Lines):** İki kart arasındaki ilişkiyi gösteren ipler.

### 3. Kullanıcı Deneyimi ve Etkileşim Kuralları (Core UX)

**A. Yaratım ve Düzenleme (Zero Friction):**

- **Çift Tıklama:** Canvas üzerinde boş bir yere çift tıklandığında hemen yeni bir not oluşur. Notlar **rastgele bir renkle** başlar, böylece ekran tekdüze görünmez.
- **Auto-Focus:** Not oluştuğu salisede "Edit Modu" açılır ve imleç yanıp sönmeye başlar. Kullanıcı tıklamakla uğraşmaz, direk yazar.
- **Markdown Desteği:** Kullanıcı `**bold**` veya `- liste` yaparsa otomatik formatlanır.

**B. Hareket ve Yerleşim (Grid vs Free):**

- **Varsayılan (Free Flow):** Notlar piksel hassasiyetinde, tamamen özgürce her yere sürüklenebilir (kaos sevenler için).
- **Snap-to-Grid (Düzen Sevenler için):** Kullanıcı `CTRL` tuşuna basılı tutarak sürüklerse veya ayarlardan "Grid Mode"u açarsa, notlar görünmez bir ızgaraya "mıknatıs gibi" yapışır. Hızalanmış ve düzenli durur.
- **Görsel İpucu:** Grid modu aktifken arka planda çok silik, nokta nokta (dotted) bir ızgara deseni belirir.

**C. Kontrol Şeması (Hybrid Input):**

- **Tam Klavye Kontrolü:** `N` yeni not, `Del` silme, `Ok Tuşları` notlar arası gezinme, `Esc` düzenlemeden çıkma.
- **Tam Mouse Kontrolü:** Sürükle bırak, **Zen Color Picker** (Gelişmiş renk seçici, özel renkler, açık kalan menü), sağ tık menüsü.

**D. Çoklu Pano Sistemi (Workspaces):**

- Kullanıcının tek bir sayfaya sıkışmaması için sol tarafta gizlenebilir (collapsible) minimal bir menü.
- **Panolar:** "İş", "Kişisel", "Projeler" gibi farklı canvaslar arası geçiş.
- **Veri:** Hepsi local storage'da ayrı 'key'lerde tutulur.

### 4. AI Asistan Özellikleri (Local Context)

_Asistan, kullanıcının girdiği API Key ile çalışır, sunucu yoktur._

1.  **Zeki Gruplama:** Dağınık duran notları seçip "Düzenle" dediğimde, AI bunları konularına göre canvas üzerinde öbekler (Clusters) haline getirir.
2.  **Context Menu AI:** Bir nota sağ tıkladığında;
    - "Bunu daha nazik bir dille yaz."
    - "Bununla ilgili bir 'Not-To-Do' kuralı öner." (Örn: "Çok yorgunum" notuna -> "Bugün yeni sorumluluk alma" önerisi).

### 5. "Cozy Vibe" Ekstraları (Özel İstekler)

Bu özellikler deneyimi "uygulama"dan "yaşam alanı"na dönüştürür:

- **Breath Intro:** Sayfa ilk açıldığında 2 saniyelik bir animasyonla "Derin bir nefes al..." yazısı belirir ve yavaşça kaybolarak notları gösterir.
- **Lofi Station:** Arayüzün bir köşesinde, sadece "Play/Pause" ve ses ayarı olan, gömülü (reklamsız) bir Lofi müzik butonu.
- **Zen Modu:** Tek bir tuşla (örn: `Z`) tüm menüleri, diğer notları gizleyip sadece üzerinde çalıştığın nota odaklanma (Spotlight effect).

### 6. Teknik Altyapı ve Optimizasyon

- **Refactoring:** Bileşenler (Note, ContextDock) modüler klasör yapısına taşındı.
- **Standartlaştırma:** Renk isimlendirmeleri (`yellow`, `red` vb.) standartlaştırıldı ve eski veriler için otomatik migrasyon eklendi.
- **Performans:** Sürükleme işlemleri `requestAnimationFrame` ile optimize edildi.
