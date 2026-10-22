
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { dilEkle } from "./actions";

export default async function YeniDilPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_oturum")?.value;

  if (!token) redirect("/giris");

  const oturum = await sql`
    SELECT yonetici_id
    FROM oturumlar
    WHERE token = ${token}
      AND bitis > NOW()
    LIMIT 1
  `;

  if (oturum.length === 0) redirect("/giris");

  const kurumlar = await sql`
    SELECT id, ad FROM sinav_kurumlari ORDER BY ad
  `;

  const alan = {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: 11,
    marginTop: 6,
    marginBottom: 18,
    borderRadius: 7,
    border: "1px solid #454557",
    background: "#15151f",
    color: "white",
  };

  return (
    <main style={{
      minHeight: "100vh",
      padding: 32,
      background: "#0b0b12",
      color: "white",
    }}>
      <h1>Yeni Dil Bilgisi Ekle</h1>
      <p>
        <a href="/admin/dil-bilgileri" style={{ color: "#c4b5fd" }}>
          ← Dil bilgilerine dön
        </a>
      </p>

      <form action={dilEkle} style={{ maxWidth: 500, marginTop: 28 }}>
        <label htmlFor="dil">Dil adı *</label>
        <input id="dil" name="dil" required maxLength={100}
          placeholder="Örn. İngilizce" style={alan} />

        <label htmlFor="seviye">Dil seviyesi *</label>
        <select id="seviye" name="seviye" required defaultValue="B1" style={alan}>
          {["A1", "A2", "B1", "B2", "C1", "C2"].map((seviye) => (
            <option key={seviye} value={seviye}>{seviye}</option>
          ))}
        </select>

        <label htmlFor="sinav_adi">Sınav adı</label>
        <input id="sinav_adi" name="sinav_adi" maxLength={100}
          placeholder="Örn. IELTS" style={alan} />

        <label htmlFor="sinav_puani">Sınav puanı</label>
        <input id="sinav_puani" name="sinav_puani" type="number"
          min="0" max="9999.99" step="0.01" style={alan} />

        <label htmlFor="sinav_tarihi">Sınav tarihi</label>
        <input id="sinav_tarihi" name="sinav_tarihi" type="date" style={alan} />

        <label htmlFor="kategori_id">Sınav kurumu</label>
        <select id="kategori_id" name="kategori_id" defaultValue="" style={alan}>
          <option value="">Seçme / belirtilmemiş</option>
          {kurumlar.map((kurum) => (
            <option key={kurum.id} value={kurum.id}>{kurum.ad}</option>
          ))}
        </select>

        <label style={{ display: "flex", gap: 10, marginBottom: 22 }}>
          <input type="checkbox" name="yayinda" defaultChecked />
          Portföyde yayımlansın
        </label>

        <button type="submit" style={{
          padding: "12px 20px",
          border: 0,
          borderRadius: 8,
          background: "#a78bfa",
          color: "#111",
          fontWeight: "bold",
          cursor: "pointer",
        }}>
          Kaydı ekle
        </button>
      </form>
    </main>
  );
}
