import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function MakalePage({ params }) {
  const { slug } = await params;
  let rows = [];
  try { rows = await sql`SELECT baslik, ozet, icerik, kategori, yayin_tarihi FROM makaleler WHERE slug=${slug} AND yayin_durumu=TRUE AND silinme_zamani IS NULL LIMIT 1`; } catch {}
  if (!rows.length) notFound();
  const m=rows[0];
  return <main style={page}><a href="/makaleler" style={link}>← Tüm makaleler</a><article style={article}><p style={{color:"#a78bfa"}}>{m.kategori || "Yazı"}</p><h1>{m.baslik}</h1>{m.ozet && <p style={{fontSize:20,color:"#c4c4d4"}}>{m.ozet}</p>}<hr style={{borderColor:"#343044",margin:"28px 0"}}/><div style={{whiteSpace:"pre-wrap",lineHeight:1.85}}>{m.icerik}</div></article></main>;
}
const page={minHeight:"100vh",background:"#08080d",color:"#f5f3ff",padding:"48px max(20px,8vw)",fontFamily:"Arial,sans-serif"};
const article={maxWidth:850,margin:"36px auto",padding:"clamp(20px,5vw,56px)",border:"1px solid #343044",borderRadius:16,background:"#12111b"};
const link={color:"#c4b5fd"};
