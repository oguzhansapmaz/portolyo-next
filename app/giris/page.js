
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GirisPage() {
  const router = useRouter();
  const [eposta, setEposta] = useState("");
  const [sifre, setSifre] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  async function girisYap(e) {
    e.preventDefault();
    setMesaj("");
    setYukleniyor(true);

    try {
      const response = await fetch("/api/giris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eposta, sifre }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMesaj(data.mesaj || "Giriş başarısız.");
        return;
      }

      router.push(data.yonlendir || "/admin");
      router.refresh();
    } catch {
      setMesaj("Sunucuya bağlanılamadı. Tekrar dene.");
    } finally {
      setYukleniyor(false);
    }
  }

  const inputStili = {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    margin: "8px 0 20px",
    padding: 12,
    borderRadius: 8,
    border: "1px solid #454557",
    background: "#0b0b12",
    color: "#fff",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#0b0b12",
        color: "#fff",
        padding: 24,
      }}
    >
      <form
        onSubmit={girisYap}
        style={{
          width: "100%",
          maxWidth: 400,
          padding: 32,
          border: "1px solid #343442",
          borderRadius: 16,
          background: "#15151f",
        }}
      >
        <h1>Yönetici Girişi</h1>
        <p style={{ color: "#aaa" }}>
          Portföy yönetim paneline giriş yap.
        </p>

        <label htmlFor="eposta">E-posta</label>
        <input
          id="eposta"
          type="email"
          autoComplete="username"
          required
          value={eposta}
          onChange={(e) => setEposta(e.target.value)}
          style={inputStili}
        />

        <label htmlFor="sifre">Şifre</label>
        <input
          id="sifre"
          type="password"
          autoComplete="current-password"
          required
          value={sifre}
          onChange={(e) => setSifre(e.target.value)}
          style={inputStili}
        />

        <button
          type="submit"
          disabled={yukleniyor}
          style={{
            width: "100%",
            padding: 12,
            border: 0,
            borderRadius: 8,
            background: "#a78bfa",
            color: "#111",
            fontWeight: "bold",
            cursor: yukleniyor ? "wait" : "pointer",
          }}
        >
          {yukleniyor ? "Kontrol ediliyor..." : "Giriş Yap"}
        </button>

        {mesaj && (
          <p role="alert" style={{ color: "#fca5a5" }}>
            {mesaj}
          </p>
        )}
      </form>
    </main>
  );
}
