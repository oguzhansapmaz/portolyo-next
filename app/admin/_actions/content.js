"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";

async function adminKontrol() {
  const store = await cookies();
  const token = store.get("admin_oturum")?.value;
  if (!token) redirect("/giris");
  const rows = await sql`SELECT id FROM oturumlar WHERE token = ${token} AND bitis > NOW() LIMIT 1`;
  if (!rows.length) redirect("/giris");
}

function slugYap(value) {
  return String(value || "").toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u")
    .replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 180);
}
function text(formData, key, max = 5000) {
  const value = String(formData.get(key) || "").trim();
  if (value.length > max) throw new Error(`${key} alanı çok uzun.`);
  return value;
}
function validUrl(value) {
  if (!value) return true;
  try { const url = new URL(value); return url.protocol === "https:" || url.protocol === "http:"; }
  catch { return false; }
}

export async function projeKaydet(formData) {
  await adminKontrol();
  const id = Number(formData.get("id") || 0);
  const baslik = text(formData, "baslik", 180);
  const aciklama = text(formData, "aciklama", 4000);
  const kategori = text(formData, "kategori", 100);
  const teknolojiler = text(formData, "teknolojiler", 500);
  const gorsel = text(formData, "gorsel", 1000);
  const github = text(formData, "github_url", 1000);
  const demo = text(formData, "demo_url", 1000);
  const yayin = formData.get("yayin_durumu") === "on";
  const oneCikan = formData.get("one_cikan") === "on";
  if (baslik.length < 2 || aciklama.length < 5) throw new Error("Başlık ve açıklama zorunludur.");
  if (![gorsel, github, demo].every(validUrl)) throw new Error("Bağlantılar http veya https olmalıdır.");
  const slug = slugYap(baslik) || `proje-${Date.now()}`;
  if (id > 0) {
    await sql`UPDATE projeler SET baslik=${baslik}, slug=${`${slug}-${id}`}, aciklama=${aciklama}, kategori=${kategori || null}, teknolojiler=${teknolojiler || null}, gorsel=${gorsel || null}, github_url=${github || null}, demo_url=${demo || null}, yayin_durumu=${yayin}, one_cikan=${oneCikan}, guncelleme=NOW() WHERE id=${id} AND silinme_zamani IS NULL`;
  } else {
    const uniqueSlug = `${slug}-${Date.now().toString(36)}`;
    await sql`INSERT INTO projeler (baslik, slug, aciklama, kategori, teknolojiler, gorsel, github_url, demo_url, yayin_durumu, one_cikan) VALUES (${baslik}, ${uniqueSlug}, ${aciklama}, ${kategori || null}, ${teknolojiler || null}, ${gorsel || null}, ${github || null}, ${demo || null}, ${yayin}, ${oneCikan})`;
  }
  revalidatePath("/admin/projeler"); revalidatePath("/portfolio/index.html"); redirect("/admin/projeler");
}

export async function projeCopKutusu(formData) {
  await adminKontrol();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id < 1) throw new Error("Geçersiz proje.");
  await sql`UPDATE projeler SET silinme_zamani=NOW(), yayin_durumu=FALSE WHERE id=${id} AND silinme_zamani IS NULL`;
  revalidatePath("/admin/projeler"); revalidatePath("/admin/cop-kutusu"); redirect("/admin/projeler");
}

export async function makaleKaydet(formData) {
  await adminKontrol();
  const id = Number(formData.get("id") || 0);
  const baslik = text(formData, "baslik", 200);
  const ozet = text(formData, "ozet", 1000);
  const icerik = text(formData, "icerik", 50000);
  const kategori = text(formData, "kategori", 100);
  const kapak = text(formData, "kapak_gorseli", 1000);
  const yayin = formData.get("yayin_durumu") === "on";
  if (baslik.length < 2 || icerik.length < 10) throw new Error("Başlık ve içerik en azından kısa bir metin içermeli.");
  if (!validUrl(kapak)) throw new Error("Kapak görseli bağlantısı http veya https olmalıdır.");
  const slug = slugYap(baslik) || `makale-${Date.now()}`;
  if (id > 0) {
    await sql`UPDATE makaleler SET baslik=${baslik}, slug=${`${slug}-${id}`}, ozet=${ozet || null}, icerik=${icerik}, kategori=${kategori || null}, kapak_gorseli=${kapak || null}, yayin_durumu=${yayin}, yayin_tarihi=CASE WHEN ${yayin} THEN COALESCE(yayin_tarihi, NOW()) ELSE NULL END, guncelleme=NOW() WHERE id=${id} AND silinme_zamani IS NULL`;
  } else {
    const uniqueSlug = `${slug}-${Date.now().toString(36)}`;
    await sql`INSERT INTO makaleler (baslik, slug, ozet, icerik, kategori, kapak_gorseli, yayin_durumu, yayin_tarihi) VALUES (${baslik}, ${uniqueSlug}, ${ozet || null}, ${icerik}, ${kategori || null}, ${kapak || null}, ${yayin}, CASE WHEN ${yayin} THEN NOW() ELSE NULL END)`;
  }
  revalidatePath("/admin/makaleler"); revalidatePath("/makaleler"); redirect("/admin/makaleler");
}

export async function makaleCopKutusu(formData) {
  await adminKontrol();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id < 1) throw new Error("Geçersiz makale.");
  await sql`UPDATE makaleler SET silinme_zamani=NOW(), yayin_durumu=FALSE WHERE id=${id} AND silinme_zamani IS NULL`;
  revalidatePath("/admin/makaleler"); revalidatePath("/admin/cop-kutusu"); redirect("/admin/makaleler");
}

export async function icerikGeriYukle(formData) {
  await adminKontrol();
  const id = Number(formData.get("id"));
  const tur = String(formData.get("tur") || "");
  if (!Number.isInteger(id) || id < 1 || !["proje", "makale"].includes(tur)) throw new Error("Geçersiz kayıt.");
  if (tur === "proje") await sql`UPDATE projeler SET silinme_zamani=NULL WHERE id=${id}`;
  else await sql`UPDATE makaleler SET silinme_zamani=NULL WHERE id=${id}`;
  revalidatePath("/admin/cop-kutusu"); revalidatePath("/admin/projeler"); revalidatePath("/admin/makaleler"); redirect("/admin/cop-kutusu");
}

export async function icerikKaliciSil(formData) {
  await adminKontrol();
  const id = Number(formData.get("id"));
  const tur = String(formData.get("tur") || "");
  if (!Number.isInteger(id) || id < 1 || !["proje", "makale"].includes(tur)) throw new Error("Geçersiz kayıt.");
  if (tur === "proje") await sql`DELETE FROM projeler WHERE id=${id} AND silinme_zamani IS NOT NULL`;
  else await sql`DELETE FROM makaleler WHERE id=${id} AND silinme_zamani IS NOT NULL`;
  revalidatePath("/admin/cop-kutusu"); redirect("/admin/cop-kutusu");
}
