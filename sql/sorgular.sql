-- Portföy yönetim paneli şeması (PostgreSQL / Neon)
-- Mevcut veritabanında tablolar varsa CREATE TABLE IF NOT EXISTS onları değiştirmez.

CREATE TABLE IF NOT EXISTS sinav_kurumlari (
  id SERIAL PRIMARY KEY,
  ad VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS yoneticiler (
  id SERIAL PRIMARY KEY,
  eposta VARCHAR(254) NOT NULL UNIQUE,
  sifre_hash TEXT NOT NULL,
  olusturma TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS oturumlar (
  id SERIAL PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  yonetici_id INTEGER NOT NULL REFERENCES yoneticiler(id) ON DELETE CASCADE,
  bitis TIMESTAMPTZ NOT NULL,
  olusturma TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dil_bilgileri (
  id SERIAL PRIMARY KEY,
  dil VARCHAR(100) NOT NULL,
  seviye VARCHAR(2) NOT NULL CHECK (seviye IN ('A1','A2','B1','B2','C1','C2')),
  sinav_adi VARCHAR(100),
  sinav_puani NUMERIC(7,2),
  sinav_tarihi DATE,
  kategori_id INTEGER REFERENCES sinav_kurumlari(id) ON DELETE SET NULL,
  yayinda BOOLEAN NOT NULL DEFAULT FALSE,
  olusturma TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  silinme_zamani TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS iletisim_mesajlari (
  id SERIAL PRIMARY KEY,
  ad_soyad VARCHAR(120) NOT NULL,
  eposta VARCHAR(254) NOT NULL,
  mesaj TEXT NOT NULL,
  kvkk_onay BOOLEAN NOT NULL DEFAULT FALSE,
  okundu BOOLEAN NOT NULL DEFAULT FALSE,
  gonderim_zamani TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cerezler (
  id SERIAL PRIMARY KEY,
  ad VARCHAR(150) NOT NULL,
  tur VARCHAR(30) NOT NULL CHECK (tur IN ('zorunlu','işlevsel','analitik','pazarlama')),
  amac TEXT,
  sure VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_oturumlar_token_bitis ON oturumlar(token, bitis);
CREATE INDEX IF NOT EXISTS idx_dil_bilgileri_silinme ON dil_bilgileri(silinme_zamani);
CREATE INDEX IF NOT EXISTS idx_iletisim_mesajlari_tarih ON iletisim_mesajlari(gonderim_zamani DESC);

INSERT INTO sinav_kurumlari (ad)
VALUES ('IELTS'), ('TOEFL'), ('Cambridge')
ON CONFLICT (ad) DO NOTHING;

-- Öğrenci numarası şartını karşılayan örnek dil satırı gerekiyorsa bu INSERT'i bir kez çalıştır.
-- Ödevde istenen özel kayıt zaten varsa tekrarlamayın.
-- INSERT INTO dil_bilgileri (dil, seviye, sinav_adi, yayinda)
-- VALUES ('2516016021 - Örnek Dil', 'B1', 'Örnek', FALSE);


-- Proje ve makale içerik yönetimi
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

CREATE INDEX IF NOT EXISTS idx_projeler_yayin ON projeler(yayin_durumu, olusturma DESC);
CREATE INDEX IF NOT EXISTS idx_makaleler_yayin ON makaleler(yayin_durumu, yayin_tarihi DESC);
CREATE INDEX IF NOT EXISTS idx_projeler_silinme ON projeler(silinme_zamani);
CREATE INDEX IF NOT EXISTS idx_makaleler_silinme ON makaleler(silinme_zamani);
