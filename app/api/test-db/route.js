
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const result = await sql`SELECT NOW() AS zaman`;

    return Response.json({
      basarili: true,
      mesaj: "Neon veritabanı bağlantısı çalışıyor!",
      zaman: result[0].zaman,
    });
  } catch (error) {
    console.error("Veritabanı bağlantı hatası:", error);

    return Response.json(
      { basarili: false, mesaj: "Veritabanı bağlantısı başarısız." },
      { status: 500 }
    );
  }
}
