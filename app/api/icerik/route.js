import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [projeler, makaleler, diller, oneCikanDiller] = await Promise.all([
      sql`SELECT id, baslik, slug, aciklama, kategori, teknolojiler, gorsel, github_url, demo_url, one_cikan
          FROM projeler WHERE yayin_durumu = TRUE AND silinme_zamani IS NULL
          ORDER BY one_cikan DESC, olusturma DESC LIMIT 30`,
      sql`SELECT id, baslik, slug, ozet, kategori, kapak_gorseli, yayin_tarihi
          FROM makaleler WHERE yayin_durumu = TRUE AND silinme_zamani IS NULL
          ORDER BY yayin_tarihi DESC NULLS LAST, olusturma DESC LIMIT 30`,
      sql`SELECT id, dil, seviye, sinav_adi, sinav_puani, sinav_tarihi
          FROM dil_bilgileri
          WHERE yayinda = TRUE AND silinme_zamani IS NULL
          ORDER BY olusturma DESC`,
      sql`SELECT id, dil, seviye, sinav_adi, sinav_puani, sinav_tarihi
          FROM dil_bilgileri
          WHERE yayinda = TRUE
            AND sinav_puani IS NOT NULL
            AND silinme_zamani IS NULL
          ORDER BY sinav_puani DESC, sinav_tarihi DESC NULLS LAST
          LIMIT 3`
    ]);

    return Response.json(
      { projeler, makaleler, diller, oneCikanDiller },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("PortfÃ¶y iÃ§erikleri API hatasÄ±:", error);
    return Response.json(
      { projeler: [], makaleler: [], diller: [], oneCikanDiller: [] },
      { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}