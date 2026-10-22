# Oğuzhan Sapmaz Portföyü — Proje ve Makale Yönetimi

Bu paket mevcut HTML/CSS/JavaScript portföy tasarımını `public/portfolio/` altında korur.  Bu paket mevcut HTML/CSS/JavaScript portföy tasarımını `public/portfolio/` altında korur. Ana sayfa (`/`), `/portfolio/index.html` dosyasını bir iframe içinde gösterir. Statik tasarımın CSS ve JavaScript dosyaları `public/portfolio/` altında bulunur. Yönetim paneli Next.js App Router, Neon PostgreSQL ve sunucu tarafı işlemlerle çalışır.

## Kurulum

1. Projeyi bir klasöre çıkarın.
2. Terminalde proje kökünde `npm.cmd install` çalıştırın.
3. `.env.local` dosyasını kendiniz oluşturun. Bu dosyayı GitHub'a yüklemeyin:

```env
DATABASE_URL=Neon_PostgreSQL_baglanti_adresiniz
ADMIN_EMAIL=yonetici_eposta_adresiniz
ADMIN_PASSWORD=uzun_ve_benzersiz_bir_sifre
```

4. Neon SQL Editor'de `sql/sorgular.sql` dosyasının tamamını bir kez çalıştırın. Dosya mevcut eski dil/iletişim tablolarını koruyacak şekilde `IF NOT EXISTS` kullanır ve ayrıca `projeler` ile `makaleler` tablolarını oluşturur.
5. Yönetici hesabını oluşturun:

```powershell
npm.cmd run create-admin
```

6. Geliştirme sunucusunu başlatın:

```powershell
npm.cmd run dev
```

7. Portföy: `http://localhost:3000/`
8. Yönetici girişi: `http://localhost:3000/giris`
9. Yönetim paneli: `http://localhost:3000/admin`

## Yönetim paneli

- `/admin/projeler`: Proje ekleme, düzenleme, yayımlama/taslak, öne çıkarma ve çöp kutusuna taşıma.
- `/admin/makaleler`: Makale oluşturma, düzenleme, taslak/yayın ve çöp kutusuna taşıma. İçerik alanı düz metin/kod örneklerini ve satır sonlarını korur; görsel zengin metin editörü değildir.
- `/admin/cop-kutusu`: İçeriği geri yükleme veya kalıcı silme. 30 günden eski kayıtlar bu sayfa açıldığında temizlenir.
- `/admin/mesajlar`: İletişim mesajlarını görüntüleme, okundu işaretleme ve silme.
- `/cerez-politikasi`: Çerez/gizlilik bilgilendirmesi.

Yayımlanmış projeler `/api/icerik` üzerinden eski portföyün proje kartlarına yüklenir; yayımlanmış makaleler de mevcut tasarımın içinde eklenen “Yazılar” bölümünde listelenir. Makale sayfası `/makaleler/[slug]` adresindedir.

## Güvenlik notları

- `.env.local` ve veritabanı kimlik bilgilerini paylaşmayın veya depoya commit etmeyin.
- Yönetici parolası bcrypt ile hashlenir; oturum çerezi `HttpOnly`, `SameSite=Lax` ve üretimde `Secure` olarak ayarlanır.
- Canlıya almadan önce güçlü ve benzersiz parola kullanın, Neon/Vercel ortam değişkenlerini tanımlayın, üretim ortamında test edin.
- Bu paket yerel ortamda uçtan uca Neon bağlantısıyla test edilememiştir. Dağıtımdan önce `npm.cmd run build`, giriş, proje/makale CRUD ve iletişim formu test edilmelidir.

## Tasarım varlıkları hakkında

Portföy tasarımında kullanılan `profile.png`, `kedivideo.mp4` ve `dünya.png` dosyaları `public/portfolio/` klasöründe tutulur. Bu dosyalar profil görseli, hareketli logo ve dünya haritası arka planı için kullanılır. Görsellerin ve videonun yüklenebilmesi için dosya adları ve kod içindeki referansları birbiriyle eşleşmelidir.

## Son tasarım düzenlemesi

Makale bölümü Yetenekler bölümünün arkasına taşındı; menü sırasıyla eşleştirildi. Makale alanının genişliği, kenar boşlukları, başlık ve boş durum kartı mevcut Projeler bölümünün tasarım ölçülerine uyarlandı.
