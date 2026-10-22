import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function MakalelerPage() {
  let makaleler = [];
  try { makaleler = await sql`SELECT baslik, slug, ozet, kategori, yayin_tarihi FROM makaleler WHERE yayin_durumu=TRUE AND silinme_zamani IS NULL ORDER BY yayin_tarihi DESC NULLS LAST`; } catch {}
  return <main style={page}><a href="/portfolio/index.html" style={link}>← Portföye dön</a><h1>Makaleler</h1>{makaleler.length ? makaleler.map(m=><article key={m.slug} style={card}><small>{m.kategori || "Yazı"}</small><h2><a style={link} href={`/makaleler/${encodeURIComponent(m.slug)}`}>{m.baslik}</a></h2><p>{m.ozet}</p></article>) : <p>Henüz yayımlanmış makale yok.</p>}</main>;
}
const page={minHeight:"100vh",background:"#08080d",color:"#f5f3ff",padding:"48px max(20px,8vw)",fontFamily:"Arial,sans-serif"};
const card={maxWidth:800,padding:24,margin:"20px 0",border:"1px solid #343044",borderRadius:14,background:"#12111b"};
const link={color:"#c4b5fd"};
