// Terminal açılışı kaldırıldı; site doğrudan açılır.
// Navbar bağlantılarını ilgili bölümlere götür
document.querySelectorAll('.nav-links a').forEach(link => {

    link.addEventListener('click', function (event) {

        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);

        if (target) {
            event.preventDefault();

            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }

    });

});
// Mobil menü
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

if (menuToggle && navLinks) {

    menuToggle.addEventListener("click", function () {
        navLinks.classList.toggle("active");
    });

    document.querySelectorAll(".nav-links a").forEach(function (link) {

        link.addEventListener("click", function () {
            navLinks.classList.remove("active");
        });

    });
}
const contactForm = document.querySelector(".contact-form");

if (contactForm) {
    contactForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const formStatus = document.getElementById("form-status");
        const submitButton = contactForm.querySelector(".contact-submit");
        const data = new FormData(contactForm);
        const payload = {
            ad_soyad: String(data.get("name") || "").trim(),
            eposta: String(data.get("email") || "").trim(),
            mesaj: [String(data.get("subject") || "").trim(), String(data.get("message") || "").trim()].filter(Boolean).join("\n\n"),
            kvkk_onay: data.get("kvkk_onay") === "on"
        };
        submitButton.disabled = true;
        submitButton.textContent = "Gönderiliyor...";
        formStatus.textContent = "";
        try {
            const response = await fetch("/api/iletisim", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            formStatus.textContent = result.mesaj || (response.ok ? "Mesajınız gönderildi." : "Mesaj gönderilemedi.");
            formStatus.className = "form-status " + (response.ok ? "success" : "error");
            if (response.ok) contactForm.reset();
        } catch {
            formStatus.textContent = "Bağlantı hatası oluştu. Lütfen tekrar deneyin.";
            formStatus.className = "form-status error";
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "✈ Mesaj Gönder";
        }
    });
}

// Kademeli görünme animasyonları: bölümler kaydırıldıkça yumuşakça açılır.
(function initScrollReveal() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const revealTargets = document.querySelectorAll(
        '#projects .projects-header, #skills .skills-header, #about .about-header, ' +
        '#story .story-header, #contact .contact-content, #contact .contact-form, ' +
        '.about-text, .about-side, .timeline-item'
    );

    revealTargets.forEach((element) => element.classList.add('js-reveal'));

    const staggerGroups = document.querySelectorAll('.projects-grid, .skills-grid, .about-side');
    staggerGroups.forEach((group) => {
        group.classList.add('js-reveal-stagger');
        Array.from(group.children).forEach((item, index) => {
            item.classList.add('js-reveal');
            item.style.setProperty('--reveal-delay', `${Math.min(index * 110, 440)}ms`);
        });
    });

    // İlk ekranda kalan öğeler bekletilmeden görünür; aşağıdakiler kaydırınca açılır.
    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.js-reveal').forEach((element) => element.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                currentObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });

    document.querySelectorAll('.js-reveal').forEach((element) => observer.observe(element));
})();

// Yönetim panelinde yayımlanan projeler ve makaleleri portföye yükle.
(async function loadManagedContent() {
    try {
        const response = await fetch("/api/icerik");
        if (!response.ok) return;
        const data = await response.json();
        const projectGrid = document.querySelector("#projects .projects-grid");
        if (projectGrid && Array.isArray(data.projeler) && data.projeler.length) {
            projectGrid.innerHTML = data.projeler.map((p, index) => `
              <article class="project-card">
                <div class="project-top"><span>${String(index + 1).padStart(2, "0")}</span><span>${escapeHtml(p.kategori || "PROJE")}</span></div>
                ${p.gorsel ? `<img class="managed-project-image" src="${escapeHtml(p.gorsel)}" alt="${escapeHtml(p.baslik)}" loading="lazy">` : ""}
                <h3>${escapeHtml(p.baslik)}</h3>
                <p>${escapeHtml(p.aciklama)}</p>
                ${p.teknolojiler ? `<div class="project-tags">${p.teknolojiler.split(",").map(t => `<span>${escapeHtml(t.trim())}</span>`).join("")}</div>` : ""}
                <div class="managed-project-links">
                  ${p.github_url ? `<a class="project-button" href="${escapeHtml(p.github_url)}" target="_blank" rel="noopener noreferrer">GitHub'da İncele →</a>` : ""}
                  ${p.demo_url ? `<a class="project-button" href="${escapeHtml(p.demo_url)}" target="_blank" rel="noopener noreferrer">Canlı Demo ↗</a>` : ""}
                </div>
              </article>`).join("");
        }
        const articleGrid = document.getElementById("articles-grid");
        if (articleGrid && Array.isArray(data.makaleler) && data.makaleler.length) {
            articleGrid.innerHTML = data.makaleler.map(a => `
              <article class="project-card">
                <div class="project-top"><span>YAZI</span><span>${escapeHtml(a.kategori || "MAKALE")}</span></div>
                ${a.kapak_gorseli ? `<img class="managed-project-image" src="${escapeHtml(a.kapak_gorseli)}" alt="${escapeHtml(a.baslik)}" loading="lazy">` : ""}
                <h3>${escapeHtml(a.baslik)}</h3><p>${escapeHtml(a.ozet || "")}</p>
                <a class="project-button" href="/makaleler/${encodeURIComponent(a.slug)}">Makaleyi oku →</a>
              </article>`).join("");
        }
    } catch (error) { console.warn("Portföy içerikleri yüklenemedi.", error); }
})();
function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[char]));
}
// PORTFOLIO_LANGUAGE_CONSENT_MODULE
// Dil kayıtları yalnızca /api/icerik API'sinin yayında ve soft-delete edilmemiş
// olarak döndürdüğü satırlardan çizilir.
(async function loadLanguageSections() {
  const languageGrid = document.getElementById("languages-grid");
  const featuredGrid = document.getElementById("featured-languages-grid");
  if (!languageGrid || !featuredGrid) return;

  const emptyMessage = (message) => `<p class="article-empty">${escapeHtml(message)}</p>`;
  const dateText = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("tr-TR");
  };
  const card = (item, index, featured) => {
    const details = [];
    if (item.sinav_adi) details.push(item.sinav_adi);
    if (item.sinav_puani !== null && item.sinav_puani !== undefined) {
      details.push(`Puan: ${Number(item.sinav_puani).toLocaleString("tr-TR")}`);
    }
    const examDate = dateText(item.sinav_tarihi);
    if (examDate) details.push(examDate);
    return `<article class="project-card">
      <div class="project-top"><span>${featured ? "ÖNE ÇIKAN" : String(index + 1).padStart(2, "0")}</span><span>${escapeHtml(item.seviye || "Seviye belirtilmemiş")}</span></div>
      <h3>${escapeHtml(item.dil)}</h3>
      <p>${featured ? "Sınav başarısı" : "Yabancı dil seviyesi"}${details.length ? ` · ${details.map(escapeHtml).join(" · ")}` : " · Sınav bilgisi belirtilmemiş"}</p>
    </article>`;
  };

  try {
    const response = await fetch("/api/icerik", { cache: "no-store" });
    if (!response.ok) throw new Error(`İçerik API HTTP ${response.status}`);
    const data = await response.json();
    const diller = Array.isArray(data.diller) ? data.diller : [];
    const featured = Array.isArray(data.oneCikanDiller) ? data.oneCikanDiller : [];
    languageGrid.innerHTML = diller.length
      ? diller.map((item, index) => card(item, index, false)).join("")
      : emptyMessage("Henüz yayımlanmış dil kaydı bulunmuyor. Kayıtları yönetim panelinden ekleyip yayınlayabilirsin.");
    featuredGrid.innerHTML = featured.length
      ? featured.map((item, index) => card(item, index, true)).join("")
      : emptyMessage("Henüz yayımlanmış sınav puanı bulunmuyor.");
  } catch (error) {
    console.warn("Yabancı dil kayıtları yüklenemedi.", error);
    languageGrid.innerHTML = emptyMessage("Dil bilgileri şu anda yüklenemiyor.");
    featuredGrid.innerHTML = emptyMessage("Öne çıkan sınav sonuçları şu anda yüklenemiyor.");
  }
})();

// Google Analytics only starts after the visitor explicitly accepts analytics cookies.
(function setupAnalyticsConsent() {
  const key = "portfolio-analytics-consent-v1";
  const measurementId = "G-DGVYG3122M";

  function loadAnalytics() {
    if (window.__portfolioAnalyticsLoaded) return;
    window.__portfolioAnalyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", measurementId);
    const analyticsScript = document.createElement("script");
    analyticsScript.async = true;
    analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(analyticsScript);
  }

  let storedChoice = null;
  try { storedChoice = window.localStorage.getItem(key); } catch { /* storage may be blocked */ }
  if (storedChoice === "accepted") {
    loadAnalytics();
    return;
  }
  if (storedChoice === "rejected") return;

  const banner = document.createElement("aside");
  banner.id = "analytics-consent-banner";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-label", "Çerez tercihi");
  banner.style.cssText = "position:fixed;left:16px;right:16px;bottom:16px;z-index:999999;max-width:900px;margin:0 auto;padding:18px;border:1px solid #5b3b88;border-radius:16px;background:#0b0b12;color:#f5f3ff;box-shadow:0 12px 40px rgba(0,0,0,.5);display:flex;gap:18px;align-items:center;justify-content:space-between;flex-wrap:wrap;font:14px/1.5 system-ui,sans-serif";

  const copy = document.createElement("div");
  copy.style.cssText = "flex:1;min-width:220px";
  const heading = document.createElement("strong");
  heading.textContent = "Çerez tercihin";
  heading.style.cssText = "display:block;margin-bottom:4px;color:#c4b5fd;font-size:16px";
  const message = document.createElement("p");
  message.textContent = "Zorunlu oturum çerezleri siteyi çalıştırmak için kullanılır. Google Analytics analitik çerezleri yalnızca kabul edersen etkinleştirilir. Tercihini daha sonra tarayıcı depolamasını temizleyerek sıfırlayabilirsin.";
  message.style.cssText = "margin:0;color:#d1d1dc";
  copy.append(heading, message);

  const actions = document.createElement("div");
  actions.style.cssText = "display:flex;gap:8px;flex-wrap:wrap";
  function makeButton(label, primary) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.style.cssText = `border:1px solid ${primary ? "#a78bfa" : "#595568"};border-radius:9px;padding:10px 13px;background:${primary ? "#a78bfa" : "transparent"};color:${primary ? "#100a1e" : "#f5f3ff"};font-weight:700;cursor:pointer`;
    return button;
  }
  function clearAnalyticsCookies() {
    document.cookie.split(";").forEach((part) => {
      const name = part.split("=")[0].trim();
      if (name === "_ga" || name === "_gid" || name === "_gat" || name.startsWith("_ga_")) {
        document.cookie = `${name}=; Max-Age=0; path=/`;
        document.cookie = `${name}=; Max-Age=0; path=/; domain=.oguzhansapmaz.com`;
      }
    });
  }
  const rejectButton = makeButton("Reddet", false);
  const acceptButton = makeButton("Kabul et", true);
  rejectButton.addEventListener("click", () => {
    try { window.localStorage.setItem(key, "rejected"); } catch { /* choice still applies for this view */ }
    clearAnalyticsCookies();
    banner.remove();
  });
  acceptButton.addEventListener("click", () => {
    try { window.localStorage.setItem(key, "accepted"); } catch { /* choice still applies for this view */ }
    banner.remove();
    loadAnalytics();
  });
  actions.append(rejectButton, acceptButton);
  banner.append(copy, actions);
  document.body.appendChild(banner);
})();