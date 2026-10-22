import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { mesajOkundu, mesajSil } from "./actions";

export default async function MesajlarPage() {
  const store = await cookies();
  const token = store.get("admin_oturum")?.value;
  if (!token) redirect("/giris");
  const session = await sql`SELECT id FROM oturumlar WHERE token = ${token} AND bitis > NOW() LIMIT 1`;
  if (!session.length) redirect("/giris");

  const mesajlar = await sql`
    SELECT id, ad_soyad, eposta, mesaj, kvkk_onay, okundu, gonderim_zamani
    FROM iletisim_mesajlari
    ORDER BY gonderim_zamani DESC
    LIMIT 200
  `;

  return <main style={page}>
    <h1>İletişim Mesajları</h1>
    <p><a href="/admin" style={link}>← Yönetim paneli</a></p>
    {mesajlar.length === 0 ? <p>Henüz mesaj yok.</p> : <div style={{ overflowX: "auto" }}>
      <table style={table}>
        <thead><tr>{["Tarih", "Ad Soyad", "E-posta", "Mesaj", "KVKK", "Durum", "İşlemler"].map(x => <th key={x} style={cell}>{x}</th>)}</tr></thead>
        <tbody>{mesajlar.map(m => <tr key={m.id}>
          <td style={cell}>{new Date(m.gonderim_zamani).toLocaleString("tr-TR")}</td>
          <td style={cell}>{m.ad_soyad}</td>
          <td style={cell}><a href={`mailto:${m.eposta}`} style={link}>{m.eposta}</a></td>
          <td style={{ ...cell, whiteSpace: "normal", minWidth: 240 }}>{m.mesaj}</td>
          <td style={cell}>{m.kvkk_onay ? "Onaylandı" : "Onay yok"}</td>
          <td style={cell}>{m.okundu ? "Okundu" : "Okunmadı"}</td>
          <td style={cell}><div style={{ display: "flex", gap: 8 }}>
            {!m.okundu && <form action={mesajOkundu}><input type="hidden" name="id" value={m.id}/><button type="submit">Okundu yap</button></form>}
            <form action={mesajSil}><input type="hidden" name="id" value={m.id}/><button type="submit">Sil</button></form>
          </div></td>
        </tr>)}</tbody>
      </table>
    </div>}
  </main>;
}
const page = { minHeight: "100vh", padding: 32, background: "#0b0b12", color: "#fff" };
const link = { color: "#c4b5fd" };
const table = { width: "100%", borderCollapse: "collapse", marginTop: 24 };
const cell = { padding: 12, textAlign: "left", verticalAlign: "top", borderBottom: "1px solid #343442" };
