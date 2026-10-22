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

        submitButton.disabled = true;
        submitButton.textContent = "Gönderiliyor...";

        try {
            const response = await fetch(contactForm.action, {
                method: "POST",
                body: new FormData(contactForm)
            });

            const url = new URL(response.url);

            if (url.searchParams.get("status") === "success") {
                formStatus.textContent = "✓ Mesajınız başarıyla gönderildi.";
                formStatus.className = "form-status success";
                contactForm.reset();
            } else if (url.searchParams.get("status") === "invalid_email") {
                formStatus.textContent = "✕ Lütfen geçerli bir e-posta adresi girin.";
                formStatus.className = "form-status error";
            } else {
                formStatus.textContent = "✕ Mesaj gönderilemedi. Lütfen tekrar deneyin.";
                formStatus.className = "form-status error";
            }

        } catch (error) {
            formStatus.textContent = "✕ Bir bağlantı hatası oluştu.";
            formStatus.className = "form-status error";
        }

        submitButton.disabled = false;
        submitButton.textContent = "✈ Mesaj Gönder";
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
