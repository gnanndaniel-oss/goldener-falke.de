// Booking Modal Logic
function closeBookingModal() {
    document.getElementById("bookingModal").classList.remove("active");
    document.body.style.overflow = "";
}

document.addEventListener("DOMContentLoaded", () => {
    const bookingLinks = document.querySelectorAll(
        'a[href="#buchen"], a[href="https://ibev5.hotels-online-buchen.de/ibe/falkeaugsburg"]',
    );
    bookingLinks.forEach((btn) => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            const modal = document.getElementById("bookingModal");
            // Buchungsmaske (IBE, ~11 MB) erst beim Öffnen laden
            const ibe = modal.querySelector("iframe[data-src]");
            if (ibe && !ibe.getAttribute("src")) ibe.setAttribute("src", ibe.dataset.src);
            modal.classList.add("active");
            document.body.style.overflow = "hidden";

            // If the mobile nav is open, close it
            document.getElementById("mobileToggle").classList.remove("active");
            document.getElementById("mobileNav").classList.remove("open");
        });
    });
});

// Mobile Nav
document
    .getElementById("mobileToggle")
    .addEventListener("click", function () {
        this.classList.toggle("active");
        document.getElementById("mobileNav").classList.toggle("open");
    });
document.querySelectorAll(".nav-mobile a").forEach((a) => {
    a.addEventListener("click", () => {
        document.getElementById("mobileToggle").classList.remove("active");
        document.getElementById("mobileNav").classList.remove("open");
    });
});

// Header scroll
window.addEventListener("scroll", () => {
    document
        .querySelector(".header")
        .classList.toggle("scrolled", window.scrollY > 50);
});

// Scroll animations
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) {
                e.target.classList.add("visible");
                observer.unobserve(e.target);
            }
        });
    },
    { threshold: 0.1 },
);
document
    .querySelectorAll(
        ".usp-card, .room-card, .about-text, .about-image, .contact-card, .location-text, .location-map",
    )
    .forEach((el) => {
        el.classList.add("animate-in");
        observer.observe(el);
    });

// ── GA4 + Cookie Consent (DSGVO-konform) ──
const GA4_ID = "G-RJSJ3Y11Z8";

function loadGA4() {
    if (document.getElementById("ga4-script")) return; // already loaded
    const s = document.createElement("script");
    s.id = "ga4-script";
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA4_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA4_ID, { anonymize_ip: true });
}

function acceptCookie() {
    localStorage.setItem("cookie_consent", "accepted");
    document.getElementById("cookieBanner").classList.add("hidden");
    loadGA4();
}

function dismissCookie() {
    localStorage.setItem("cookie_consent", "dismissed");
    document.getElementById("cookieBanner").classList.add("hidden");
}

// On page load: check previous consent
(function checkConsent() {
    const consent = localStorage.getItem("cookie_consent");
    if (consent === "accepted") {
        loadGA4();                       // returning visitor who accepted
    } else if (consent !== "dismissed") {
        // first visit — show banner after short delay
        setTimeout(() => {
            document.getElementById("cookieBanner").classList.add("show");
        }, 1500);
        return; // don't hide banner
    }
    // If accepted or dismissed, keep banner hidden (it starts hidden by default)
})();

// Contact Form Handle
const contactForm = document.getElementById("contactForm");
if (contactForm) {
    contactForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const statusDiv = document.getElementById("formStatus");
        const submitBtn = this.querySelector('button[type="submit"]');
        statusDiv.className = "form-status";
        submitBtn.disabled = true;
        submitBtn.innerText = "Wird gesendet...";

        try {
            const formData = new FormData(this);
            const response = await fetch("contact.php", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Hide form entirely and show big success message
                const wrapper = document.querySelector(".contact-form-wrapper");
                wrapper.innerHTML = `
        <div class="success-big">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <h3>Vielen Dank!</h3>
          <p>${result.message}</p>
        </div>
      `;
            } else {
                statusDiv.innerText =
                    result.message ||
                    "Es gab ein Problem. Bitte versuchen Sie es später erneut.";
                statusDiv.classList.add("error");
                submitBtn.disabled = false;
                submitBtn.innerText = "Nachricht senden";
            }
        } catch (error) {
            statusDiv.innerText =
                "Es gab ein Verbindungsproblem. Bitte versuchen Sie es später erneut.";
            statusDiv.classList.add("error");
            submitBtn.disabled = false;
            submitBtn.innerText = "Nachricht senden";
        }
    });
}
