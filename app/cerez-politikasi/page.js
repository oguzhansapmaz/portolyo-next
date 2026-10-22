
export const metadata = {
  title: "Gizlilik, KVKK ve Çerez Politikası",
  description:
    "Portföy sitesi, iletişim formu, kişisel verilerin korunması ve çerez kullanımı hakkında bilgilendirme.",
};

export default function CerezPolitikasiPage() {
  return (
    <main style={page}>
      <p style={eyebrow}>GİZLİLİK VE GÜVENLİK</p>

      <h1>Gizlilik ve Çerez Politikası</h1>

      <p style={intro}>
        Bu sayfa, portföy web sitesinin kullanımı sırasında işlenebilecek
        kişisel veriler, iletişim formu ve çerez kullanımı hakkında
        bilgilendirme amacıyla hazırlanmıştır.
      </p>

      <p style={muted}>Son güncelleme: 22 Ekim 2026</p>

      <section style={section}>
        <h2>1. Amaç ve kapsam</h2>
        <p>
          Bu politika, web sitesinin çalışma biçimi ve kişisel verilerin
          kullanımı hakkında bilgi vermek amacıyla hazırlanmıştır. Sitedeki
          veri işleme faaliyetleri veya kullanılan hizmetler değiştiğinde
          bu metnin güncellenmesi gerekebilir.
        </p>
      </section>

      <section style={section}>
        <h2>2. İşlenen kişisel veriler</h2>
        <p>
          İletişim formu üzerinden ad soyad, e-posta adresi ve mesaj içeriği
          gönderilebilir. Bu bilgiler, iletişim taleplerini değerlendirmek
          ve mesajlara yanıt vermek amacıyla işlenebilir.
        </p>
        <p>
          Kullanılan barındırma ve altyapı hizmetlerine bağlı olarak bazı
          teknik erişim kayıtları da oluşabilir. Bu kayıtların kapsamı,
          ilgili hizmetlerin yapılandırmasına bağlıdır.
        </p>
      </section>

      <section style={section}>
        <h2>3. Verilerin işlenme amaçları</h2>
        <ul style={list}>
          <li>İletişim taleplerini incelemek ve yanıtlamak.</li>
          <li>Web sitesinin ve yönetici panelinin çalışmasını sağlamak.</li>
          <li>Yönetici oturumunun güvenliğini desteklemek.</li>
          <li>Teknik sorunları tespit etmek ve gidermek.</li>
          <li>Uygulanabilir yasal yükümlülükleri yerine getirmek.</li>
        </ul>
        <p>
          Kişisel veriler, ilgili amaçlarla sınırlı ve gerekli olduğu ölçüde
          işlenmelidir.
        </p>
      </section>

      <section style={section}>
        <h2>4. Verilerin saklanması ve güvenliği</h2>
        <p>
          İletişim mesajları uygulamanın veritabanında saklanabilir ve
          yetkili yönetici tarafından görüntülenebilir. Mesajların ne kadar
          süre saklanacağı belirlenmeli; amaç ortadan kalktığında veya
          uygulanabilir mevzuat gerektirdiğinde silme ya da imha süreçleri
          değerlendirilmelidir.
        </p>
        <p>
          Yönetici hesabının korunması, güçlü parola kullanılması,
          erişimin yetkili kişilerle sınırlandırılması ve veritabanı
          bağlantı bilgilerinin gizli tutulması önemlidir. Uygulanan teknik
          ve idari önlemler, gerçek sistem yapılandırmasına göre
          değerlendirilmelidir.
        </p>
      </section>

      <section style={section}>
        <h2>5. Çerez kullanımı</h2>
        <p>
          Yönetici panelinde oturumun sürdürülmesi amacıyla bir oturum
          çerezi kullanılabilir. Bu çerezin amacı, yönetici girişinin
          ardından oturumun devam etmesini sağlamaktır.
        </p>
        <p>
          Çerezin HttpOnly, Secure ve SameSite gibi güvenlik özellikleri
          uygulamanın yapılandırmasına bağlıdır. Bu özelliklerin etkinliği
          yayına alma öncesinde kontrol edilmelidir.
        </p>
        <p>
          Bu metin hazırlanırken uygulamanın mevcut sürümünde reklam veya
          pazarlama çerezlerinin eklenmediği belirtilmiştir. İleride
          analiz, reklam ya da başka üçüncü taraf çerezleri eklenirse
          politika güncellenmelidir.
        </p>
      </section>

      <section style={section}>
        <h2>6. Üçüncü taraf hizmetler</h2>
        <p>
          Uygulama, çalışması ve verilerin saklanması için Neon gibi
          veritabanı hizmetlerinden ve yayına alma aşamasında Vercel gibi
          barındırma hizmetlerinden yararlanabilir. Bu hizmetlerin veri
          işleme koşulları, saklama uygulamaları ve teknik kayıtları
          kullanılan ayarlara ve ilgili hizmetlerin politikalarına bağlıdır.
        </p>
      </section>

      <section style={section}>
        <h2>7. Kişisel verilerle ilgili haklar</h2>
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında
          uygulanabilir olduğu ölçüde ilgili kişiler; kişisel verilerinin
          işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme,
          işleme amacını öğrenme ve kanunda belirtilen diğer haklarını
          kullanma amacıyla başvuruda bulunabilir.
        </p>
        <p>
          Başvurular, yürürlükteki mevzuatta belirtilen usul ve koşullara
          uygun şekilde değerlendirilir.
        </p>
      </section>

      <section style={section}>
        <h2>8. Politika değişiklikleri</h2>
        <p>
          Web sitesinin işleyişinde, kullanılan teknolojilerde veya kişisel
          veri işleme faaliyetlerinde değişiklik olması hâlinde bu politika
          güncellenebilir. Güncel metin bu sayfada yayımlanır.
        </p>
      </section>

      <section style={section}>
        <h2>9. İletişim</h2>
        <p>
          Gizlilik ve kişisel verilerle ilgili soru ve talepleriniz için
          web sitesinin iletişim bölümünde belirtilen kanallardan site
          sahibiyle iletişime geçebilirsiniz.
        </p>
      </section>

      <p style={notice}>
        Not: Bu metin genel bilgilendirme taslağıdır; hukuki danışmanlık
        niteliğinde değildir ve tek başına KVKK uyumluluğunu garanti etmez.
        Yayımlanmadan önce gerçek veri işleme süreçleri ve yasal
        yükümlülükler doğrultusunda gözden geçirilmelidir.
      </p>

      <p style={back}>
        <a href="/" style={link}>← Ana sayfaya dön</a>
      </p>
    </main>
  );
}

const page = {
  minHeight: "100vh",
  padding: "32px 24px 64px",
  maxWidth: 900,
  margin: "0 auto",
  background: "#0b0b12",
  color: "#fff",
  lineHeight: 1.8,
};

const eyebrow = {
  color: "#a78bfa",
  fontSize: 12,
  letterSpacing: 4,
  fontWeight: 700,
};

const intro = {
  color: "#d1d1dc",
  fontSize: 17,
  marginBottom: 12,
};

const muted = {
  color: "#9999aa",
  fontSize: 13,
  marginBottom: 32,
};

const section = {
  marginTop: 28,
};

const list = {
  paddingLeft: 24,
  lineHeight: 2,
};

const notice = {
  marginTop: 36,
  padding: 16,
  border: "1px solid #352354",
  borderRadius: 12,
  color: "#b9b2c9",
  fontSize: 13,
};

const back = {
  marginTop: 32,
};

const link = {
  color: "#c4b5fd",
  textDecoration: "none",
};
