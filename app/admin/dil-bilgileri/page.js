import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { dilCopKutusunaTasi } from "./yeni/actions";

export default async function DilBilgileriPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_oturum")?.value;
  if (!token) redirect("/giris");

  const oturum = await sql`
    SELECT yonetici_id FROM oturumlar
    WHERE token = ${token} AND bitis > NOW() LIMIT 1
  `;
  if (oturum.length === 0) redirect("/giris");

  const diller = await sql`
    SELECT d.id, d.dil, d.seviye, d.sinav_adi, d.sinav_puani,
           d.sinav_tarihi, d.yayinda, k.ad AS kurum
    FROM dil_bilgileri d
    LEFT JOIN sinav_kurumlari k ON k.id = d.kategori_id
    WHERE d.silinme_zamani IS NULL
    ORDER BY d.olusturma DESC
  `;

  return (
    <main style={sayfa}>
      <h1>Dil Bilgileri</h1>
      <p>Veritabanındaki aktif dil kayıtları.</p>
      <nav style={nav}>
        <a href="/admin/dil-bilgileri/yeni" style={link}>+ Yeni dil bilgisi ekle</a>
        <a href="/admin/dil-bilgileri/cop-kutusu" style={link}>Çöp kutusu</a>
        <a href="/admin" style={link}>← Yönetim paneli</a>
      </nav>

      {diller.length === 0 ? <p>Henüz dil kaydı bulunmuyor.</p> : (
        <div style={{ overflowX: "auto" }}>
          <table style={tablo}>
            <thead><tr>
              {["Dil", "Seviye", "Sınav", "Puan", "Tarih", "Kurum", "Yayında", "İşlemler"].map((baslik) =>
                <th key={baslik} style={hucre}>{baslik}</th>)}
            </tr></thead>
            <tbody>
              {diller.map((dil) => (
                <tr key={dil.id}>
                  <td style={hucre}>{dil.dil}</td>
                  <td style={hucre}>{dil.seviye}</td>
                  <td style={hucre}>{dil.sinav_adi || "—"}</td>
                  <td style={hucre}>{dil.sinav_puani ?? "—"}</td>
                  <td style={hucre}>{dil.sinav_tarihi ? new Date(dil.sinav_tarihi).toLocaleDateString("tr-TR") : "—"}</td>
                  <td style={hucre}>{dil.kurum || "—"}</td>
                  <td style={hucre}>{dil.yayinda ? "Evet" : "Hayır"}</td>
                  <td style={hucre}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <a style={link} href={`/admin/dil-bilgileri/duzenle?id=${dil.id}`}>Düzenle</a>
                      <form action={dilCopKutusunaTasi}>
                        <input type="hidden" name="id" value={dil.id} />
                        <button style={silButonu} type="submit">Çöp kutusuna taşı</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

const sayfa = { minHeight: "100vh", padding: 32, background: "#0b0b12", color: "#fff" };
const nav = { display: "flex", flexWrap: "wrap", gap: 18, margin: "20px 0" };
const link = { color: "#c4b5fd", textDecoration: "none" };
const tablo = { width: "100%", borderCollapse: "collapse", marginTop: 24 };
const hucre = { padding: 12, textAlign: "left", borderBottom: "1px solid #343442", whiteSpace: "nowrap" };
const silButonu = { background: "transparent", color: "#fca5a5", border: "1px solid #7f1d1d", padding: "6px 8px", borderRadius: 6, cursor: "pointer" };
