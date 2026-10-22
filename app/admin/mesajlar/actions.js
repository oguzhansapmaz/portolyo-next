"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";

async function yetkiKontrol() {
  const store = await cookies();
  const token = store.get("admin_oturum")?.value;
  if (!token) redirect("/giris");
  const rows = await sql`SELECT id FROM oturumlar WHERE token = ${token} AND bitis > NOW() LIMIT 1`;
  if (!rows.length) redirect("/giris");
}

export async function mesajOkundu(formData) {
  await yetkiKontrol();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id < 1) throw new Error("Mesaj numarası geçersiz.");
  await sql`UPDATE iletisim_mesajlari SET okundu = TRUE WHERE id = ${id}`;
  revalidatePath("/admin");
  revalidatePath("/admin/mesajlar");
  redirect("/admin/mesajlar");
}

export async function mesajSil(formData) {
  await yetkiKontrol();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id < 1) throw new Error("Mesaj numarası geçersiz.");
  await sql`DELETE FROM iletisim_mesajlari WHERE id = ${id}`;
  revalidatePath("/admin");
  revalidatePath("/admin/mesajlar");
  redirect("/admin/mesajlar");
}
