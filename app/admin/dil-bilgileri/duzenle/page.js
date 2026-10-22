
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { dilGuncelle } from "../yeni/actions";
export default async function DilDuzenlePage({ searchParams }) {
  const params = await searchParams;
  const id = Number(params.id);

  if (!Number.isInteger(id) || id <= 0) {
    redirect("/admin/dil-bilgileri");
  }

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

  const sonuc = await sql`
    SELECT *
    FROM dil_bilgileri
    WHERE id = ${id}
      AND silinme_zamani IS NULL
    LIMIT 1
  `;

  if (sonuc.length === 0) redirect("/admin/dil-bilgileri");

  const dil = sonuc[0];

  const kurumlar = await sql`
    SELECT id, ad
    FROM sinav_kurumlari
    ORDER BY ad
  `;

  const tarih = dil.sinav_tarihi
    ? new Date(dil.sinav_tarihi).toISOString().slice(0, 10)
    : "";

  return (
    <main style={sayfa}>
      <h1>Dil Bilgisini Düzenle</h1>
      <p>Bilgileri değiştir ve kaydet.</p>

      <form action={dilGuncelle} style={form}>
        <input type="hidden" name="id" value={dil.id} />

        <label>Dil</label>
        <input name="dil" defaultValue={dil.dil} required style={alan} />

        <label>Seviye</label>
        <select name="seviye" defaultValue={dil.seviye} style={alan}>
          {["A1", "A2", "B1", "B2", "C1", "C2"].map((seviye) => (
            <option key={seviye} value={seviye}>{seviye}</option>
          ))}
        </select>

        <label>Sınav adı</label>
        <input name="sinav_adi" defaultValue={dil.sinav_adi || ""} style={alan} />

        <label>Sınav puanı</label>
        <input
          name="sinav_puani"
          type="number"
          step="0.01"
          defaultValue={dil.sinav_puani ?? ""}
          style={alan}
        />

        <label>Sınav tarihi</label>
        <input name="sinav_tarihi" type="date" defaultValue={tarih} style={alan} />

        <label>Kurum</label>
        <select name="kategori_id" defaultValue={dil.kategori_id ?? ""} style={alan}>
          <option value="">Kurum seçme</option>
          {kurumlar.map((kurum) => (
            <option key={kurum.id} value={kurum.id}>{kurum.ad}</option>
          ))}
        </select>

        <label>Yayında mı?</label>
        <select name="yayinda" defaultValue={String(dil.yayinda)} style={alan}>
          <option value="true">Evet</option>
          <option value="false">Hayır</option>
        </select>

        <button type="submit" style={buton}>Değişiklikleri Kaydet</button>
      </form>

      <p>
        <a href="/admin/dil-bilgileri" style={{ color: "#c4b5fd" }}>
          ← Dil listesine dön
        </a>
      </p>
    </main>
  );
}

const sayfa = {
  minHeight: "100vh",
  padding: 32,
  background: "#0b0b12",
  color: "#fff",
};

const form = {
  display: "grid",
  gap: 12,
  maxWidth: 480,
  marginTop: 24,
};

const alan = {
  padding: 12,
  borderRadius: 6,
  border: "1px solid #343442",
};

const buton = {
  padding: 12,
  marginTop: 12,
  borderRadius: 6,
  cursor: "pointer",
};