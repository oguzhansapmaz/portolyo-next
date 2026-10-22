import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { projeKaydet, projeCopKutusu } from "../_actions/content";

export const dynamic = "force-dynamic";
export default async function ProjelerPage({ searchParams }) {
  const params = await searchParams;
  const store = await cookies();
  const token = store.get("admin_oturum")?.value;
  if (!token) redirect("/giris");
  const session = await sql`SELECT id FROM oturumlar WHERE token=${token} AND bitis > NOW() LIMIT 1`;
  if (!session.length) redirect("/giris");
  const editId = Number(params?.duzenle || 0);
  let editing = null;
  if (editId > 0) {
    const rows = await sql`SELECT * FROM projeler WHERE id=${editId} AND silinme_zamani IS NULL LIMIT 1`;
    editing = rows[0] || null;
  }
  const projeler = await sql`SELECT id, baslik, kategori, yayin_durumu, one_cikan, olusturma FROM projeler WHERE silinme_zamani IS NULL ORDER BY olusturma DESC`;
  return <main style={page}>
    <a href="/admin" style={link}>← Yönetim paneli</a>
    <h1>Proje yönetimi</h1><p>Portföyünde göstermek istediğin projeleri buradan yönet.</p>
    <section style={card}><h2>{editing ? "Projeyi düzenle" : "Yeni proje ekle"}</h2>
      <form action={projeKaydet} style={form}>
        {editing && <input type="hidden" name="id" value={editing.id}/>}
        <label>Proje adı<input name="baslik" required maxLength={180} defaultValue={editing?.baslik || ""} style={input}/></label>
        <label>Açıklama<textarea name="aciklama" required minLength={5} maxLength={4000} defaultValue={editing?.aciklama || ""} style={input}/></label>
        <label>Kategori<input name="kategori" maxLength={100} defaultValue={editing?.kategori || ""} placeholder="Veri analizi, Makine öğrenmesi..." style={input}/></label>
        <label>Teknolojiler (virgülle ayır)<input name="teknolojiler" maxLength={500} defaultValue={editing?.teknolojiler || ""} placeholder="Python, Pandas, SQL" style={input}/></label>
        <label>Kapak görseli URL<input name="gorsel" defaultValue={editing?.gorsel || ""} placeholder="https://..." style={input}/></label>
        <label>GitHub URL<input name="github_url" defaultValue={editing?.github_url || ""} placeholder="https://github.com/..." style={input}/></label>
        <label>Canlı demo URL<input name="demo_url" defaultValue={editing?.demo_url || ""} placeholder="https://..." style={input}/></label>
        <label><input type="checkbox" name="yayin_durumu" defaultChecked={editing?.yayin_durumu || false}/> Yayımla</label>
        <label><input type="checkbox" name="one_cikan" defaultChecked={editing?.one_cikan || false}/> Öne çıkar</label>
        <button style={button}>{editing ? "Değişiklikleri kaydet" : "Projeyi ekle"}</button>
        {editing && <a style={link} href="/admin/projeler">Vazgeç</a>}
      </form>
    </section>
    <h2>Kayıtlı projeler ({projeler.length})</h2>
    {projeler.map(p=><article key={p.id} style={row}><div><strong>{p.baslik}</strong><p>{p.kategori || "Kategorisiz"} · {p.yayin_durumu ? "Yayında" : "Taslak"}{p.one_cikan ? " · Öne çıkan" : ""}</p></div><div style={{display:"flex",gap:10,alignItems:"center"}}><a style={link} href={`/admin/projeler?duzenle=${p.id}`}>Düzenle</a><form action={projeCopKutusu}><input type="hidden" name="id" value={p.id}/><button style={danger}>Çöp kutusuna taşı</button></form></div></article>)}
  </main>;
}
const page={minHeight:"100vh",padding:32,background:"#0b0b12",color:"#fff",fontFamily:"Arial,sans-serif"};
const card={maxWidth:760,padding:24,margin:"24px 0",background:"#15151f",border:"1px solid #343442",borderRadius:12};
const form={display:"grid",gap:12};
const input={display:"block",width:"100%",boxSizing:"border-box",padding:11,marginTop:6,borderRadius:6,border:"1px solid #454557",background:"#0b0b12",color:"#fff"};
const button={padding:"10px 14px",borderRadius:7,background:"#8b5cf6",color:"#fff",border:0,cursor:"pointer"};
const danger={padding:"8px 10px",borderRadius:7,cursor:"pointer"};
const row={display:"flex",justifyContent:"space-between",alignItems:"center",gap:18,flexWrap:"wrap",padding:16,margin:"10px 0",background:"#15151f",border:"1px solid #343442",borderRadius:10};
const link={color:"#c4b5fd"};
