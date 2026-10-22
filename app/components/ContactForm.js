"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ ad_soyad: "", eposta: "", mesaj: "", kvkk_onay: false });
  const [sonuc, setSonuc] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  async function gonder(e) {
    e.preventDefault();
    setSonuc("");
    setYukleniyor(true);
    try {
      const res = await fetch("/api/iletisim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setSonuc(data.mesaj || "İşlem tamamlandı.");
      if (res.ok) setForm({ ad_soyad: "", eposta: "", mesaj: "", kvkk_onay: false });
    } catch {
      setSonuc("Sunucuya bağlanılamadı.");
    } finally {
      setYukleniyor(false);
    }
  }

  const input = { width: "100%", padding: 12, margin: "6px 0 16px", borderRadius: 8, border: "1px solid #454557", background: "#11111a", color: "#fff" };
  return <form onSubmit={gonder} style={{ maxWidth: 600 }}>
    <label htmlFor="ad_soyad">Ad soyad</label>
    <input id="ad_soyad" required maxLength={120} value={form.ad_soyad} onChange={e => setForm({ ...form, ad_soyad: e.target.value })} style={input}/>
    <label htmlFor="eposta">E-posta</label>
    <input id="eposta" type="email" required value={form.eposta} onChange={e => setForm({ ...form, eposta: e.target.value })} style={input}/>
    <label htmlFor="mesaj">Mesaj</label>
    <textarea id="mesaj" required minLength={5} maxLength={5000} rows={5} value={form.mesaj} onChange={e => setForm({ ...form, mesaj: e.target.value })} style={input}/>
    <label style={{ display: "flex", alignItems: "start", gap: 10, marginBottom: 16 }}>
      <input type="checkbox" checked={form.kvkk_onay} onChange={e => setForm({ ...form, kvkk_onay: e.target.checked })}/>
      <span>İletişim bilgilerimin mesajıma yanıt vermek amacıyla işlenmesini kabul ediyorum. <a href="/cerez-politikasi" style={{ color: "#c4b5fd" }}>Gizlilik ve çerez bilgisi</a>.</span>
    </label>
    <button disabled={yukleniyor} style={{ padding: "12px 18px", border: 0, borderRadius: 8, background: "#a78bfa", fontWeight: 700 }}>{yukleniyor ? "Gönderiliyor..." : "Mesajı gönder"}</button>
    {sonuc && <p role="status" style={{ marginTop: 14 }}>{sonuc}</p>}
  </form>;
}
