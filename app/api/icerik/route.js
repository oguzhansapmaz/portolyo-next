import { sql } from "@/lib/db";

export async function GET() {
  try {
    const [projeler, makaleler] = await Promise.all([
      sql`SELECT id, baslik, slug, aciklama, kategori, teknolojiler, gorsel, github_url, demo_url, one_cikan
          FROM projeler WHERE yayin_durumu=TRUE AND silinme_zamani IS NULL
          ORDER BY one_cikan DESC, olusturma DESC LIMIT 30`,
      sql`SELECT id, baslik, slug, ozet, kategori, kapak_gorseli, yayin_tarihi
          FROM makaleler WHERE yayin_durumu=TRUE AND silinme_zamani IS NULL
          ORDER BY yayin_tarihi DESC NULLS LAST, olusturma DESC LIMIT 30`
    ]);
    return Response.json({ projeler, makaleler }, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (error) {
    console.error("İçerik API hatası:", error);
    return Response.json({ projeler: [], makaleler: [] }, { status: 200 });
  }
}
