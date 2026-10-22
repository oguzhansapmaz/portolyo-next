import { sql } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const adSoyad = String(body.ad_soyad || "").trim();
    const eposta = String(body.eposta || "").trim().toLowerCase();
    const mesaj = String(body.mesaj || "").trim();
    const kvkkOnay = body.kvkk_onay === true;

    if (adSoyad.length < 2 || adSoyad.length > 120) {
      return Response.json({ mesaj: "Ad soyad 2-120 karakter olmalıdır." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eposta) || eposta.length > 254) {
      return Response.json({ mesaj: "Geçerli bir e-posta adresi gir." }, { status: 400 });
    }
    if (mesaj.length < 5 || mesaj.length > 5000) {
      return Response.json({ mesaj: "Mesaj 5-5000 karakter olmalıdır." }, { status: 400 });
    }
    if (!kvkkOnay) {
      return Response.json({ mesaj: "Göndermek için KVKK bilgilendirmesini onaylamalısın." }, { status: 400 });
    }

    await sql`
      INSERT INTO iletisim_mesajlari (ad_soyad, eposta, mesaj, kvkk_onay, okundu)
      VALUES (${adSoyad}, ${eposta}, ${mesaj}, ${true}, ${false})
    `;
    return Response.json({ basarili: true, mesaj: "Mesajın kaydedildi. Teşekkürler." });
  } catch (error) {
    console.error("İletişim formu hatası:", error);
    return Response.json({ mesaj: "Mesaj gönderilemedi. Daha sonra tekrar dene." }, { status: 500 });
  }
}
