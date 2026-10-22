-- ==========================================================
-- BVA 2205 - NEON SQL KONTROL VE ÖDEV SORGULARI
-- Öğrenci: 2516016021
-- ==========================================================


-- 1. Gerekli soft-delete sütunlarını güvenli şekilde kontrol et

ALTER TABLE dil_bilgileri
ADD COLUMN IF NOT EXISTS silinme_zamani TIMESTAMPTZ;

ALTER TABLE projeler
ADD COLUMN IF NOT EXISTS silinme_zamani TIMESTAMPTZ;

ALTER TABLE makaleler
ADD COLUMN IF NOT EXISTS silinme_zamani TIMESTAMPTZ;


-- 2. Gerçek dil bilgilerini düzelt
-- İngilizce B1 ve öğrenci numarası
-- Kayıt yayına çıkmaz.

UPDATE dil_bilgileri
SET dil = 'İngilizce - 2516016021',
    seviye = 'B1',
    sinav_adi = NULL,
    sinav_puani = NULL,
    sinav_tarihi = NULL,
    kategori_id = NULL,
    yayinda = FALSE,
    silinme_zamani = NULL
WHERE id = 1;


-- Almanca A2
-- Sınav bilgileri olmadığı için boş bırakılır.

UPDATE dil_bilgileri
SET dil = 'Almanca',
    seviye = 'A2',
    sinav_adi = NULL,
    sinav_puani = NULL,
    sinav_tarihi = NULL,
    kategori_id = NULL,
    yayinda = FALSE,
    silinme_zamani = NULL
WHERE id = 2;


-- 3. Gerçek olmayan test kayıtlarını çöp kutusuna taşı
-- Bu işlem yalnızca daha önce gördüğümüz 3 ve 4 numaralı
-- kayıtları etkiler. Kalıcı olarak silmez.

UPDATE dil_bilgileri
SET yayinda = FALSE,
    silinme_zamani = COALESCE(silinme_zamani, NOW())
WHERE id IN (3, 4);


-- 4. Çerez tablosunu oluştur veya mevcutsa koru

CREATE TABLE IF NOT EXISTS cerezler (
    id SERIAL PRIMARY KEY,
    ad TEXT NOT NULL,
    tur TEXT NOT NULL
        CHECK (tur IN ('zorunlu', 'işlevsel', 'analitik', 'pazarlama')),
    amac TEXT,
    sure TEXT
);


-- 5. Çerezleri ekle
-- Aynı isimde kayıt varsa ikinci kez eklenmez.

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
    SELECT 1
    FROM cerezler c
    WHERE c.ad = v.ad
);


-- ==========================================================
-- GÖREV 3.1: B2 ve üzerindeki dil kayıtları
-- ==========================================================

SELECT id, dil, seviye, sinav_adi, sinav_puani
FROM dil_bilgileri
WHERE seviye IN ('B2', 'C1', 'C2')
  AND silinme_zamani IS NULL
ORDER BY seviye, dil;


-- ==========================================================
-- GÖREV 3.2: En yüksek puanlı 3 kayıt
-- ==========================================================

SELECT id, dil, seviye, sinav_adi, sinav_puani, sinav_tarihi
FROM dil_bilgileri
WHERE sinav_puani IS NOT NULL
  AND silinme_zamani IS NULL
ORDER BY sinav_puani DESC, sinav_tarihi DESC NULLS LAST
LIMIT 3;


-- ==========================================================
-- GÖREV 3.3: Seviyelere göre kayıt sayısı
-- ==========================================================

SELECT seviye, COUNT(*) AS dil_sayisi
FROM dil_bilgileri
WHERE silinme_zamani IS NULL
GROUP BY seviye
ORDER BY seviye;


-- ==========================================================
-- GÖREV 3.4: Her sınav kurumundaki dil sayısı
-- LEFT JOIN sayesinde kaydı olmayan kurumlar da görünür.
-- ==========================================================

SELECT
    sk.ad AS sinav_kurumu,
    COUNT(d.id) AS dil_sayisi
FROM sinav_kurumlari sk
LEFT JOIN dil_bilgileri d
    ON d.kategori_id = sk.id
   AND d.silinme_zamani IS NULL
GROUP BY sk.id, sk.ad
ORDER BY sk.ad;


-- ==========================================================
-- GÖREV 3.5: Öğrenci numarasını dil alanında ara
-- ==========================================================

SELECT id, dil, seviye, yayinda
FROM dil_bilgileri
WHERE dil ILIKE '%2516016021%'
  AND silinme_zamani IS NULL;


-- ==========================================================
-- GÖREV 3.6: Beş yıldan eski sınavlar
-- Önce etkilenecek kayıtları göster.
-- ==========================================================

SELECT id, dil, sinav_adi, sinav_puani, sinav_tarihi
FROM dil_bilgileri
WHERE sinav_tarihi < CURRENT_DATE - INTERVAL '5 years'
  AND sinav_puani IS NOT NULL
  AND silinme_zamani IS NULL;

-- Kayıtları kontrol ettikten sonra puanları NULL yapmak için:
-- UPDATE dil_bilgileri
-- SET sinav_puani = NULL
-- WHERE sinav_tarihi < CURRENT_DATE - INTERVAL '5 years'
--   AND sinav_puani IS NOT NULL
--   AND silinme_zamani IS NULL;


-- ==========================================================
-- GÖREV 3.7: A1 kayıtları
-- Önce etkilenecek kayıtları göster.
-- ==========================================================

SELECT id, dil, seviye, silinme_zamani
FROM dil_bilgileri
WHERE seviye = 'A1'
  AND silinme_zamani IS NULL;

-- Soft-delete görevine uygun şekilde çöp kutusuna taşımak için:
-- UPDATE dil_bilgileri
-- SET silinme_zamani = NOW(),
--     yayinda = FALSE
-- WHERE seviye = 'A1'
--   AND silinme_zamani IS NULL;


-- ==========================================================
-- GÖREV 6: Çöp kutusu
-- ==========================================================

-- Çöp kutusundaki dil kayıtları
SELECT id, dil, seviye, silinme_zamani
FROM dil_bilgileri
WHERE silinme_zamani IS NOT NULL
ORDER BY silinme_zamani DESC;


-- 30 günden eski kayıtları önce kontrol et
SELECT id, dil, silinme_zamani
FROM dil_bilgileri
WHERE silinme_zamani < NOW() - INTERVAL '30 days'
ORDER BY silinme_zamani;

-- Kalıcı silme işlemini yalnızca kayıtları doğruladıktan sonra yap:
-- DELETE FROM dil_bilgileri
-- WHERE silinme_zamani < NOW() - INTERVAL '30 days';


-- ==========================================================
-- GÖREV 7: Çerez kayıtları
-- ==========================================================

-- Çerezleri listele
SELECT ad, tur, amac, sure
FROM cerezler
ORDER BY tur, ad;

-- Türlerine göre say
SELECT tur, COUNT(*) AS cerez_sayisi
FROM cerezler
GROUP BY tur
ORDER BY tur;


-- ==========================================================
-- SON KONTROL: Dil kayıtlarının durumu
-- ==========================================================

SELECT
    id,
    dil,
    seviye,
    yayinda,
    silinme_zamani
FROM dil_bilgileri
ORDER BY id;


-- Öğrenci numarasını içeren kayıt sayısı
SELECT COUNT(*) AS numara_olan_kayit
FROM dil_bilgileri
WHERE dil ILIKE '%2516016021%';