import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { dilGeriYukle, dilKaliciSil } from "../yeni/actions";

export default async function CopKutusuPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_oturum")?.value;
  if (!token) redirect("/giris");

  const oturum = await sql`
    SELECT yonetici_id FROM oturumlar
    WHERE token = ${token} AND bitis > NOW() LIMIT 1
  `;
  if (oturum.length === 0) redirect("/giris");

  const diller = await sql`
    SELECT id, dil, seviye, sinav_adi, silinme_zamani
    FROM dil_bilgileri
    WHERE silinme_zamani IS NOT NULL
    ORDER BY silinme_zamani DESC
  `;

  return (
    <main style={sayfa}>
      <h1>Dil Bilgileri - Çöp Kutusu</h1>
      <p>Buradaki kayıtları geri yükleyebilir veya kalıcı olarak silebilirsin.</p>
      <p style={{ margin: "20px 0" }}>
        <a href="/admin/dil-bilgileri" style={link}>← Aktif dil kayıtlarına dön</a>
      </p>
      {diller.length === 0 ? <p>Çöp kutusu boş.</p> : (
        <div style={{ overflowX: "auto" }}>
          <table style={tablo}>
            <thead><tr>{["Dil", "Seviye", "Sınav", "Silinme tarihi", "İşlemler"].map((x) =>
              <th key={x} style={hucre}>{x}</th>)}</tr></thead>
            <tbody>{diller.map((dil) => (
              <tr key={dil.id}>
                <td style={hucre}>{dil.dil}</td>
                <td style={hucre}>{dil.seviye}</td>
                <td style={hucre}>{dil.sinav_adi || "—"}</td>
                <td style={hucre}>{new Date(dil.silinme_zamani).toLocaleString("tr-TR")}</td>
                <td style={hucre}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <form action={dilGeriYukle}>
                      <input type="hidden" name="id" value={dil.id} />
                      <button type="submit" style={button}>Geri yükle</button>
                    </form>
                    <form action={dilKaliciSil}>
                      <input type="hidden" name="id" value={dil.id} />
                      <button type="submit" style={danger}>Kalıcı sil</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </main>
  );
}

const sayfa = { minHeight: "100vh", padding: 32, background: "#0b0b12", color: "#fff" };
const link = { color: "#c4b5fd" };
const tablo = { width: "100%", borderCollapse: "collapse", marginTop: 24 };
const hucre = { padding: 12, textAlign: "left", borderBottom: "1px solid #343442", whiteSpace: "nowrap" };
const button = { padding: "8px 12px", borderRadius: 6, cursor: "pointer" };
const danger = { ...button, color: "#b91c1c" };
