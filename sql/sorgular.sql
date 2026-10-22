-- ============================================================
-- BVA 2205 - Siber Güvenlik ve Bilişim Hukuku
-- Portföy yönetim paneli - PostgreSQL / Neon
-- Öğrenci no: 2516016021
--
-- NOT:
-- 1. .env.local dosyasını GitHub'a yüklemeyin.
-- 2. Dil kayıtları bölümündeki örnekleri gerçek bilgilerinizle değiştirin.
-- 3. UPDATE ve DELETE işlemlerini çalıştırmadan önce kayıtları kontrol edin.
-- ============================================================


-- ============================================================
-- GÖREV 1: ORTAK TABLOLAR
-- ============================================================

CREATE TABLE IF NOT EXISTS yoneticiler (
    id SERIAL PRIMARY KEY,
    eposta TEXT UNIQUE NOT NULL,
    sifre_hash TEXT NOT NULL,
    olusturma TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS oturumlar (
    id SERIAL PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    yonetici_id INTEGER NOT NULL
        REFERENCES yoneticiler(id) ON DELETE CASCADE,
    bitis TIMESTAMPTZ NOT NULL,
    olusturma TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS iletisim_mesajlari (
    id SERIAL PRIMARY KEY,
    ad_soyad TEXT NOT NULL,
    eposta TEXT NOT NULL,
    mesaj TEXT NOT NULL,
    kvkk_onay BOOLEAN NOT NULL DEFAULT FALSE,
    okundu BOOLEAN NOT NULL DEFAULT FALSE,
    gonderim_zamani TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- GÖREV 2: ÖĞRENCİYE ÖZEL TABLOLAR
-- Yabancı Dil Bilgisi
-- ============================================================

CREATE TABLE IF NOT EXISTS sinav_kurumlari (
    id SERIAL PRIMARY KEY,
    ad TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS dil_bilgileri (
    id SERIAL PRIMARY KEY,
    dil TEXT NOT NULL,
    seviye TEXT CHECK (seviye IN ('A1','A2','B1','B2','C1','C2')),
    sinav_adi TEXT,
    sinav_puani NUMERIC(7,2),
    sinav_tarihi DATE,
    kategori_id INTEGER
        REFERENCES sinav_kurumlari(id) ON DELETE SET NULL,
    yayinda BOOLEAN NOT NULL DEFAULT TRUE,
    olusturma TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    silinme_zamani TIMESTAMPTZ
);

-- Eski tablolarda soft-delete sütunu yoksa ekler.
ALTER TABLE dil_bilgileri
ADD COLUMN IF NOT EXISTS silinme_zamani TIMESTAMPTZ;

-- Sınav kurumları
INSERT INTO sinav_kurumlari (ad)
VALUES
    ('IELTS'),
    ('TOEFL'),
    ('Cambridge')
ON CONFLICT (ad) DO NOTHING;
INSERT INTO dil_bilgileri (
    dil, seviye, sinav_adi, sinav_puani,
    sinav_tarihi, kategori_id, yayinda
)
SELECT
    o.dil,
    o.seviye,
    o.sinav_adi,
    o.sinav_puani,
    o.sinav_tarihi,
    sk.id,
    o.yayinda
FROM ornekler o
LEFT JOIN sinav_kurumlari sk
    ON sk.ad = o.kategori_ad
WHERE NOT EXISTS (
    SELECT 1
    FROM dil_bilgileri d
    WHERE d.dil = o.dil
      AND d.seviye IS NOT DISTINCT FROM o.seviye
      AND d.sinav_adi IS NOT DISTINCT FROM o.sinav_adi
      AND d.sinav_puani IS NOT DISTINCT FROM o.sinav_puani
      AND d.sinav_tarihi IS NOT DISTINCT FROM o.sinav_tarihi
);


-- ============================================================
-- GÖREV 7: ÇEREZLER
-- ============================================================

CREATE TABLE IF NOT EXISTS cerezler (
    id SERIAL PRIMARY KEY,
    ad TEXT NOT NULL,
    tur TEXT NOT NULL
        CHECK (tur IN ('zorunlu','işlevsel','analitik','pazarlama')),
    amac TEXT,
    sure TEXT
);

-- Yönetici oturumu ve sayfaya eklenmiş Google Analytics için örnek kayıtlar.
-- Analytics çerezlerini gerçek kurulumunuzla karşılaştırın.
INSERT INTO cerezler (ad, tur, amac, sure)
SELECT v.ad, v.tur, v.amac, v.sure
FROM (
    VALUES
      (
        'admin_oturum',
        'zorunlu',
        'Yönetici oturumunun sürdürülmesi',
        '2 saat'
      ),
      (
        '_ga',
        'analitik',
        'Google Analytics ziyaretçi ölçümü',
        'Yapılandırmaya bağlı'
      ),
      (
        '_ga_*',
        'analitik',
        'Google Analytics oturum ve ziyaretçi ölçümü',
        'Yapılandırmaya bağlı'
      )
) AS v(ad, tur, amac, sure)
WHERE NOT EXISTS (
    SELECT 1 FROM cerezler c WHERE c.ad = v.ad
);

-- Çerezleri politika sayfasında listelemek için sorgu
SELECT ad, tur, amac, sure
FROM cerezler
ORDER BY tur, ad;

-- Çerezleri türe göre sayma sorgusu
SELECT tur, COUNT(*) AS cerez_sayisi
FROM cerezler
GROUP BY tur
ORDER BY tur;


-- ============================================================
-- PROJE VE MAKALE YÖNETİMİ
-- Mevcut portföy yönetim paneli tabloları
-- ============================================================

CREATE TABLE IF NOT EXISTS projeler (
    id SERIAL PRIMARY KEY,
    baslik VARCHAR(180) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    aciklama TEXT NOT NULL,
    kategori VARCHAR(100),
    teknolojiler TEXT,
    gorsel TEXT,
    github_url TEXT,
    demo_url TEXT,
    yayin_durumu BOOLEAN NOT NULL DEFAULT FALSE,
    one_cikan BOOLEAN NOT NULL DEFAULT FALSE,
    olusturma TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    guncelleme TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    silinme_zamani TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS makaleler (
    id SERIAL PRIMARY KEY,
    baslik VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    ozet TEXT,
    icerik TEXT NOT NULL,
    kategori VARCHAR(100),
    kapak_gorseli TEXT,
    yayin_durumu BOOLEAN NOT NULL DEFAULT FALSE,
    yayin_tarihi TIMESTAMPTZ,
    olusturma TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    guncelleme TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    silinme_zamani TIMESTAMPTZ
);

ALTER TABLE projeler
ADD COLUMN IF NOT EXISTS silinme_zamani TIMESTAMPTZ;

ALTER TABLE makaleler
ADD COLUMN IF NOT EXISTS silinme_zamani TIMESTAMPTZ;


-- ============================================================
-- İNDEKSLER
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_oturumlar_token_bitis
ON oturumlar(token, bitis);

CREATE INDEX IF NOT EXISTS idx_dil_bilgileri_silinme
ON dil_bilgileri(silinme_zamani);

CREATE INDEX IF NOT EXISTS idx_iletisim_mesajlari_tarih
ON iletisim_mesajlari(gonderim_zamani DESC);

CREATE INDEX IF NOT EXISTS idx_projeler_yayin
ON projeler(yayin_durumu, olusturma DESC);

CREATE INDEX IF NOT EXISTS idx_makaleler_yayin
ON makaleler(yayin_durumu, yayin_tarihi DESC);

CREATE INDEX IF NOT EXISTS idx_projeler_silinme
ON projeler(silinme_zamani);

CREATE INDEX IF NOT EXISTS idx_makaleler_silinme
ON makaleler(silinme_zamani);


-- ============================================================
-- GÖREV 3: SQL SORGULARI
-- ============================================================

-- Görev 3.1: B2 ve üzeri olan dilleri listele
SELECT id, dil, seviye, sinav_adi, sinav_puani, sinav_tarihi
FROM dil_bilgileri
WHERE seviye IN ('B2', 'C1', 'C2')
  AND silinme_zamani IS NULL
ORDER BY seviye, dil;


-- Görev 3.2: En yüksek puanlı 3 sınav kaydı
SELECT id, dil, seviye, sinav_adi, sinav_puani, sinav_tarihi
FROM dil_bilgileri
WHERE sinav_puani IS NOT NULL
  AND silinme_zamani IS NULL
ORDER BY sinav_puani DESC, sinav_tarihi DESC NULLS LAST
LIMIT 3;


-- Görev 3.3: Her seviyeye göre kayıt sayısı
SELECT seviye, COUNT(*) AS dil_sayisi
FROM dil_bilgileri
WHERE silinme_zamani IS NULL
GROUP BY seviye
ORDER BY seviye;


-- Görev 3.4: Her sınav kurumu için dil sayısı.
-- Hiç kaydı olmayan kurumlar da 0 olarak görünür.
SELECT
    sk.ad AS sinav_kurumu,
    COUNT(d.id) AS dil_sayisi
FROM sinav_kurumlari sk
LEFT JOIN dil_bilgileri d
    ON d.kategori_id = sk.id
   AND d.silinme_zamani IS NULL
GROUP BY sk.id, sk.ad
ORDER BY sk.ad;


-- Görev 3.5: Öğrenci numarasını dil alanında ara
SELECT id, dil, seviye, sinav_adi, sinav_puani
FROM dil_bilgileri
WHERE dil ILIKE '%2516016021%'
  AND silinme_zamani IS NULL;


-- Görev 3.6: Beş yıldan eski sınavların puanlarını NULL yap.
-- Önce aşağıdaki SELECT ile etkilenecek kayıtları incele.
SELECT id, dil, sinav_adi, sinav_puani, sinav_tarihi
FROM dil_bilgileri
WHERE sinav_tarihi < CURRENT_DATE - INTERVAL '5 years'
  AND sinav_puani IS NOT NULL
  AND silinme_zamani IS NULL;

-- İnceledikten sonra bu UPDATE sorgusunu ayrı çalıştır:
-- UPDATE dil_bilgileri
-- SET sinav_puani = NULL
-- WHERE sinav_tarihi < CURRENT_DATE - INTERVAL '5 years'
--   AND sinav_puani IS NOT NULL
--   AND silinme_zamani IS NULL;


-- Görev 3.7: A1 kayıtlarını soft-delete ile çöp kutusuna taşı.
-- Önce etkilenecek kayıtları incele.
SELECT id, dil, seviye, olusturma
FROM dil_bilgileri
WHERE seviye = 'A1'
  AND silinme_zamani IS NULL;

-- Kontrol ettikten sonra A1 kayıtlarını çöp kutusuna taşı:
-- UPDATE dil_bilgileri
-- SET silinme_zamani = NOW()
-- WHERE seviye = 'A1'
--   AND silinme_zamani IS NULL;


-- ============================================================
-- GÖREV 6: SOFT DELETE / ÇÖP KUTUSU
-- ============================================================

-- Çöp kutusundaki dil kayıtları
SELECT id, dil, seviye, sinav_adi, sinav_puani, silinme_zamani
FROM dil_bilgileri
WHERE silinme_zamani IS NOT NULL
ORDER BY silinme_zamani DESC;


-- Çöp kutusundan geri alma örneği.
-- <KAYIT_ID> yerine gerçekten geri almak istediğiniz id'yi yazın.
-- UPDATE dil_bilgileri
-- SET silinme_zamani = NULL
-- WHERE id = <KAYIT_ID>
--   AND silinme_zamani IS NOT NULL;


-- Kalıcı silme örneği.
-- Geri getirilemeyeceğinden önce doğru id olduğunu kontrol edin.
-- DELETE FROM dil_bilgileri
-- WHERE id = <KAYIT_ID>
--   AND silinme_zamani IS NOT NULL;


-- 30 günden eski çöp kayıtlarını kalıcı silmeden önce kontrol et
SELECT id, dil, seviye, silinme_zamani
FROM dil_bilgileri
WHERE silinme_zamani < NOW() - INTERVAL '30 days'
ORDER BY silinme_zamani;

-- Yalnızca silinmesi gereken kayıtları doğruladıktan sonra çalıştır:
-- DELETE FROM dil_bilgileri
-- WHERE silinme_zamani < NOW() - INTERVAL '30 days';


-- ============================================================
-- SON KONTROLLER
-- ============================================================

-- Yönetici hesabı mevcut mu?
-- Şifre hash'ini görüntülemiyoruz.
SELECT id, eposta, olusturma
FROM yoneticiler
ORDER BY id;

-- Dil kayıtları ve soft-delete durumu
SELECT id, dil, seviye, yayinda, silinme_zamani
FROM dil_bilgileri
ORDER BY id;

-- Okunmamış iletişim mesajı sayısı
SELECT COUNT(*) AS okunmamis_mesaj_sayisi
FROM iletisim_mesajlari
WHERE okundu = FALSE;