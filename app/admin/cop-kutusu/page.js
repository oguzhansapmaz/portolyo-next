import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { icerikGeriYukle, icerikKaliciSil } from "../_actions/content";

export const dynamic = "force-dynamic";
export default async function CopKutusuPage() {
  const store = await cookies();
  const token = store.get("admin_oturum")?.value;
  if (!token) redirect("/giris");
  const session = await sql`SELECT id FROM oturumlar WHERE token=${token} AND bitis > NOW() LIMIT 1`;
  if (!session.length) redirect("/giris");
  // 30 günden eski çöp kayıtlarını bu sayfa açıldığında kalıcı olarak temizle.
  await sql`DELETE FROM projeler WHERE silinme_zamani < NOW() - INTERVAL '30 days'`;
  await sql`DELETE FROM makaleler WHERE silinme_zamani < NOW() - INTERVAL '30 days'`;
  const [projeler, makaleler] = await Promise.all([
    sql`SELECT id, baslik, silinme_zamani FROM projeler WHERE silinme_zamani IS NOT NULL ORDER BY silinme_zamani DESC`,
    sql`SELECT id, baslik, silinme_zamani FROM makaleler WHERE silinme_zamani IS NOT NULL ORDER BY silinme_zamani DESC`
  ]);
  const items = [...projeler.map(x=>({...x,tur:"proje"})), ...makaleler.map(x=>({...x,tur:"makale"}))].sort((a,b)=>new Date(b.silinme_zamani)-new Date(a.silinme_zamani));
  return <main style={page}><a href="/admin" style={link}>← Yönetim paneli</a><h1>Çöp kutusu</h1><p>Silinen içerikler 30 gün sonra kalıcı olarak temizlenir. Temizleme bu sayfa açıldığında çalışır.</p>
    {!items.length ? <p>Çöp kutusu boş.</p> : items.map(item=><article key={`${item.tur}-${item.id}`} style={row}><div><strong>{item.baslik}</strong><p>{item.tur==="proje"?"Proje":"Makale"} · {new Date(item.silinme_zamani).toLocaleString("tr-TR")}</p></div><div style={{display:"flex",gap:10}}><form action={icerikGeriYukle}><input type="hidden" name="id" value={item.id}/><input type="hidden" name="tur" value={item.tur}/><button>Geri yükle</button></form><form action={icerikKaliciSil}><input type="hidden" name="id" value={item.id}/><input type="hidden" name="tur" value={item.tur}/><button>Kalıcı sil</button></form></div></article>)}
  </main>;
}
const page={minHeight:"100vh",padding:32,background:"#0b0b12",color:"#fff",fontFamily:"Arial,sans-serif"};
const row={display:"flex",justifyContent:"space-between",alignItems:"center",gap:18,flexWrap:"wrap",padding:16,margin:"10px 0",background:"#15151f",border:"1px solid #343442",borderRadius:10};
const link={color:"#c4b5fd"};
