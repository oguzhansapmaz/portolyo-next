import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export default async function AdminPage() {
  const store = await cookies();
  const token = store.get("admin_oturum")?.value;
  if (!token) redirect("/giris");
  const session = await sql`SELECT id FROM oturumlar WHERE token=${token} AND bitis > NOW() LIMIT 1`;
  if (!session.length) redirect("/giris");
  const [projeler, makaleler, mesajlar] = await Promise.all([
    sql`SELECT COUNT(*)::int AS toplam FROM projeler WHERE silinme_zamani IS NULL`,
    sql`SELECT COUNT(*)::int AS toplam FROM makaleler WHERE silinme_zamani IS NULL`,
    sql`SELECT COUNT(*)::int AS okunmamis FROM iletisim_mesajlari WHERE okundu=FALSE`
  ]);
  return <main style={page}>
    <a href="/portfolio/index.html" style={link}>← Portföyü görüntüle</a>
    <h1>Portföy Yönetim Paneli</h1><p>Projelerini ve teknik yazılarını buradan yönet.</p>
    <section style={grid}>
      <article style={card}><h2>Projeler</h2><p>Aktif kayıt: {projeler[0].toplam}</p><a href="/admin/projeler" style={link}>Projeleri yönet →</a></article>
      <article style={card}><h2>Makaleler</h2><p>Kayıt: {makaleler[0].toplam}</p><a href="/admin/makaleler" style={link}>Yazıları yönet →</a></article>
      <article style={card}><h2>İletişim mesajları</h2><p>Okunmamış: {mesajlar[0].okunmamis}</p><a href="/admin/mesajlar" style={link}>Mesajları görüntüle →</a></article>
      <article style={card}><h2>Çöp kutusu</h2><p>Silinen projeleri ve yazıları yönet.</p><a href="/admin/cop-kutusu" style={link}>Çöp kutusunu aç →</a></article>
    </section>
    <p style={{marginTop:28}}><a href="/cerez-politikasi" style={link}>Çerez ve gizlilik politikası</a></p>
  </main>;
}
const page={minHeight:"100vh",padding:32,background:"#0b0b12",color:"#fff",fontFamily:"Arial,sans-serif"};
const grid={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:16,marginTop:24};
const card={padding:24,border:"1px solid #343442",borderRadius:12,background:"#15151f"};
const link={color:"#c4b5fd",textDecoration:"none"};
