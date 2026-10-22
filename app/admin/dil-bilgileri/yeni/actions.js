"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";

async function oturumKontrol() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_oturum")?.value;
  if (!token) redirect("/giris");

  const oturum = await sql`
    SELECT yonetici_id FROM oturumlar
    WHERE token = ${token} AND bitis > NOW()
    LIMIT 1
  `;
  if (oturum.length === 0) redirect("/giris");
}

async function formBilgileriniKontrolEt(formData) {
  const dil = String(formData.get("dil") || "").trim();
  const seviye = String(formData.get("seviye") || "");
  const sinavAdi = String(formData.get("sinav_adi") || "").trim();
  const puanMetni = String(formData.get("sinav_puani") || "").trim();
  const tarihMetni = String(formData.get("sinav_tarihi") || "").trim();
  const kurumMetni = String(formData.get("kategori_id") || "").trim();
  const yayindaMetni = String(formData.get("yayinda") || "");
  const seviyeler = ["A1", "A2", "B1", "B2", "C1", "C2"];

  if (!dil || dil.length > 100 || !seviyeler.includes(seviye)) {
    throw new Error("Dil adı veya seviye geçersiz.");
  }

  let puan = null;
  if (puanMetni !== "") {
    puan = Number(puanMetni);
    if (!Number.isFinite(puan) || puan < 0 || puan > 9999.99) {
      throw new Error("Sınav puanı geçersiz.");
    }
  }

  let tarih = null;
  if (tarihMetni !== "") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(tarihMetni)) {
      throw new Error("Sınav tarihi geçersiz.");
    }
    tarih = tarihMetni;
  }

  let kategoriId = null;
  if (kurumMetni !== "") {
    kategoriId = Number(kurumMetni);
    if (!Number.isInteger(kategoriId) || kategoriId < 1) {
      throw new Error("Sınav kurumu geçersiz.");
    }
    const kurum = await sql`
      SELECT id FROM sinav_kurumlari WHERE id = ${kategoriId} LIMIT 1
    `;
    if (kurum.length === 0) throw new Error("Sınav kurumu bulunamadı.");
  }

  return {
    dil, seviye, sinavAdi, puan, tarih, kategoriId,
    yayinda: yayindaMetni === "on" || yayindaMetni === "true",
  };
}

export async function dilEkle(formData) {
  await oturumKontrol();
  const bilgi = await formBilgileriniKontrolEt(formData);

  await sql`
    INSERT INTO dil_bilgileri
      (dil, seviye, sinav_adi, sinav_puani, sinav_tarihi, kategori_id, yayinda)
    VALUES
      (${bilgi.dil}, ${bilgi.seviye}, ${bilgi.sinavAdi || null},
       ${bilgi.puan}, ${bilgi.tarih}, ${bilgi.kategoriId}, ${bilgi.yayinda})
  `;
  revalidatePath("/admin/dil-bilgileri");
  redirect("/admin/dil-bilgileri");
}

export async function dilGuncelle(formData) {
  await oturumKontrol();
  const id = Number(String(formData.get("id") || ""));
  if (!Number.isInteger(id) || id < 1) throw new Error("Dil kaydı numarası geçersiz.");

  const bilgi = await formBilgileriniKontrolEt(formData);
  const sonuc = await sql`
    UPDATE dil_bilgileri
    SET dil = ${bilgi.dil}, seviye = ${bilgi.seviye},
        sinav_adi = ${bilgi.sinavAdi || null}, sinav_puani = ${bilgi.puan},
        sinav_tarihi = ${bilgi.tarih}, kategori_id = ${bilgi.kategoriId},
        yayinda = ${bilgi.yayinda}
    WHERE id = ${id} AND silinme_zamani IS NULL
    RETURNING id
  `;
  if (sonuc.length === 0) throw new Error("Kayıt bulunamadı veya çöp kutusuna taşınmış.");
  revalidatePath("/admin/dil-bilgileri");
  revalidatePath("/admin/dil-bilgileri/cop-kutusu");
  redirect("/admin/dil-bilgileri");
}

export async function dilCopKutusunaTasi(formData) {
  await oturumKontrol();
  const id = Number(String(formData.get("id") || ""));
  if (!Number.isInteger(id) || id < 1) throw new Error("Kayıt numarası geçersiz.");

  await sql`
    UPDATE dil_bilgileri SET silinme_zamani = NOW(), yayinda = FALSE
    WHERE id = ${id} AND silinme_zamani IS NULL
  `;
  revalidatePath("/admin/dil-bilgileri");
  revalidatePath("/admin/dil-bilgileri/cop-kutusu");
  redirect("/admin/dil-bilgileri");
}

export async function dilGeriYukle(formData) {
  await oturumKontrol();
  const id = Number(String(formData.get("id") || ""));
  if (!Number.isInteger(id) || id < 1) throw new Error("Kayıt numarası geçersiz.");

  await sql`
    UPDATE dil_bilgileri SET silinme_zamani = NULL
    WHERE id = ${id} AND silinme_zamani IS NOT NULL
  `;
  revalidatePath("/admin/dil-bilgileri");
  revalidatePath("/admin/dil-bilgileri/cop-kutusu");
  redirect("/admin/dil-bilgileri/cop-kutusu");
}

export async function dilKaliciSil(formData) {
  await oturumKontrol();
  const id = Number(String(formData.get("id") || ""));
  if (!Number.isInteger(id) || id < 1) throw new Error("Kayıt numarası geçersiz.");

  await sql`
    DELETE FROM dil_bilgileri
    WHERE id = ${id} AND silinme_zamani IS NOT NULL
  `;
  revalidatePath("/admin/dil-bilgileri/cop-kutusu");
  redirect("/admin/dil-bilgileri/cop-kutusu");
}
