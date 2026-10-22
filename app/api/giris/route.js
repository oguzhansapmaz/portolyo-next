
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const body = await request.json();
    const eposta = body.eposta?.trim().toLowerCase();
    const sifre = body.sifre;

    if (
      typeof eposta !== "string" ||
      typeof sifre !== "string" ||
      !eposta ||
      !sifre ||
      sifre.length > 200
    ) {
      return Response.json(
        { mesaj: "E-posta veya şifre hatalı." },
        { status: 400 }
      );
    }

    const yoneticiler = await sql`
      SELECT id, sifre_hash
      FROM yoneticiler
      WHERE eposta = ${eposta}
      LIMIT 1
    `;

    if (
      yoneticiler.length === 0 ||
      !(await bcrypt.compare(sifre, yoneticiler[0].sifre_hash))
    ) {
      return Response.json(
        { mesaj: "E-posta veya şifre hatalı." },
        { status: 401 }
      );
    }

    const yonetici = yoneticiler[0];
    const token = randomBytes(32).toString("hex");
    const bitis = new Date(Date.now() + 2 * 60 * 60 * 1000);

    await sql`
      INSERT INTO oturumlar (token, yonetici_id, bitis)
      VALUES (${token}, ${yonetici.id}, ${bitis.toISOString()})
    `;

    const cookieStore = await cookies();

    cookieStore.set("admin_oturum", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: bitis,
    });

    return Response.json({ basarili: true, yonlendir: "/admin" });
  } catch (error) {
    console.error("Giriş işlemi başarısız:", error);

    return Response.json(
      { mesaj: "Giriş sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
