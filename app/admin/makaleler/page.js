import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { makaleKaydet, makaleCopKutusu } from "../_actions/content";

export const dynamic = "force-dynamic";
export default async function MakalelerAdminPage({ searchParams }) {
  const params = await searchParams;
  const store = await cookies();
  const token = store.get("admin_oturum")?.value;
  if (!token) redirect("/giris");
  const session = await sql`SELECT id FROM oturumlar WHERE token=${token} AND bitis > NOW() LIMIT 1`;
  if (!session.length) redirect("/giris");
  const editId = Number(params?.duzenle || 0);
  let editing = null;
  if (editId > 0) {
    const rows = await sql`SELECT * FROM makaleler WHERE id=${editId} AND silinme_zamani IS NULL LIMIT 1`;
    editing = rows[0] || null;
  }
  const makaleler = await sql`SELECT id, baslik, kategori, yayin_durumu, olusturma FROM makaleler WHERE silinme_zamani IS NULL ORDER BY olusturma DESC`;
  return <main style={page}>
    <a href="/admin" style={link}>← Yönetim paneli</a>
    <h1>Makale ve yazı yönetimi</h1><p>Yazını taslak kaydedebilir veya portföyünde yayımlayabilirsin.</p>
    <section style={card}><h2>{editing ? "Makaleyi düzenle" : "Yeni makale yaz"}</h2>
      <form action={makaleKaydet} style={form}>
        {editing && <input type="hidden" name="id" value={editing.id}/>}
        <label>Başlık<input name="baslik" required maxLength={200} defaultValue={editing?.baslik || ""} style={input}/></label>
        <label>Kısa özet<textarea name="ozet" maxLength={1000} defaultValue={editing?.ozet || ""} style={input}/></label>
        <label>Kategori<input name="kategori" maxLength={100} defaultValue={editing?.kategori || ""} placeholder="Veri bilimi, Python..." style={input}/></label>
        <label>Kapak görseli URL<input name="kapak_gorseli" defaultValue={editing?.kapak_gorseli || ""} placeholder="https://..." style={input}/></label>
        <label>Makale içeriği<textarea name="icerik" required minLength={10} maxLength={50000} rows={14} defaultValue={editing?.icerik || ""} style={input}/></label>
        <p style={{color:"#aaa",fontSize:13}}>Bu editör düz metin ve kod örneklerini korur; biçimlendirme için satır sonlarını kullanabilirsin.</p>
        <label><input type="checkbox" name="yayin_durumu" defaultChecked={editing?.yayin_durumu || false}/> Hemen yayımla</label>
        <button style={button}>{editing ? "Değişiklikleri kaydet" : "Makaleyi kaydet"}</button>
        {editing && <a style={link} href="/admin/makaleler">Vazgeç</a>}
      </form>
    </section>
    <h2>Kayıtlı yazılar ({makaleler.length})</h2>
    {makaleler.map(m=><article key={m.id} style={row}><div><strong>{m.baslik}</strong><p>{m.kategori || "Kategorisiz"} · {m.yayin_durumu ? "Yayında" : "Taslak"}</p></div><div style={{display:"flex",gap:10,alignItems:"center"}}>{m.yayin_durumu && <a style={link} href={`/makaleler/${m.slug}`} target="_blank">Görüntüle</a>}<a style={link} href={`/admin/makaleler?duzenle=${m.id}`}>Düzenle</a><form action={makaleCopKutusu}><input type="hidden" name="id" value={m.id}/><button style={danger}>Çöp kutusuna taşı</button></form></div></article>)}
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
