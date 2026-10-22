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
