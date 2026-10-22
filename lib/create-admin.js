
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const eposta = process.env.ADMIN_EMAIL;
const sifre = process.env.ADMIN_PASSWORD;

if (!eposta || !sifre) {
  throw new Error(
    "ADMIN_EMAIL ve ADMIN_PASSWORD .env.local dosyasına eklenmeli."
  );
}

if (sifre.length < 12) {
  throw new Error("Yönetici şifresi en az 12 karakter olmalı.");
}

const sifreHash = await bcrypt.hash(sifre, 12);

await sql`
  INSERT INTO yoneticiler (eposta, sifre_hash)
  VALUES (${eposta}, ${sifreHash})
  ON CONFLICT (eposta)
  DO UPDATE SET sifre_hash = EXCLUDED.sifre_hash
`;

console.log("Yönetici hesabı başarıyla oluşturuldu.");
