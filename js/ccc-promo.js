/* ccc-promo.js — site-wide offer card, added 2026-09-16.

   Offer (Joseph, 2026-09-16): three months' free rent for the new tenant of the
   179 ground-floor street-level space (former salon) ONLY - not the rest of the
   building. Shown on every page, pointing to /179-ground-floor.html.
   Terms (Joseph, 2026-09-16): lease signed by December 31, 2026; minimum
   lease term five years. The card switches itself off after that date.
   Loaded by ccc-ux.js, so it reaches every page without editing each one.

   Behaviour
   - Bilingual. Follows the page language (<html lang>) and switches live
     when a visitor uses the page's FR | EN control.
   - Waits until the cookie-consent notice is gone, so the two never overlap.
   - Appears after a short delay; closing it hides it for 7 days (per browser).
   - Not shown on thank-you or 404 pages.
   To end the offer early: set ACTIVE to false. It ends by itself at END. */
(function () {
  "use strict";
  var ACTIVE = true;
  var END = Date.UTC(2027, 0, 1, 5, 0, 0); /* 2026-12-31 24:00 in Gatineau (EST, UTC-5) */
  var DELAY_MS = 4000;
  var SNOOZE_DAYS = 7;
  var KEY = "ccc-promo-3mois-closed";
  if (!ACTIVE || Date.now() >= END || window.__cccPromo) return;
  window.__cccPromo = true;
  if (/(thank-you|404)\.html$/.test(location.pathname)) return;

  try {
    var closed = +localStorage.getItem(KEY);
    if (closed && Date.now() - closed < SNOOZE_DAYS * 864e5) return;
  } catch (e) {}

  var T = {
    en: {
      tag: "Offer ends December 31, 2026",
      title: "3 months free rent",
      body: "Street-level commercial space at 179 Promenade du Portage, Gatineau: about 1,200 sq ft, turnkey, ideal for a salon, spa, studio or shop. The new tenant pays no rent for the first three months. Lease signed by December 31, 2026; minimum term five years.",
      cta: "See the space",
      href: "/179-ground-floor.html?lang=en&ref=promo-3mois",
      close: "Close"
    },
    fr: {
      tag: "Offre valide jusqu’au 31 décembre 2026",
      title: "3 mois de loyer gratuit",
      body: "Local commercial en vitrine au 179, promenade du Portage, à Gatineau : environ 1 200 pi² clé en main, idéal pour un salon, un spa, un studio ou une boutique. Le nouveau locataire ne paie aucun loyer pendant les trois premiers mois. Bail signé au plus tard le 31 décembre 2026, d’une durée minimale de cinq ans.",
      cta: "Voir le local",
      href: "/179-ground-floor.html?lang=fr&ref=promo-3mois",
      close: "Fermer"
    }
  };
  function lang() { return (document.documentElement.lang || "").toLowerCase().indexOf("fr") === 0 ? "fr" : "en"; }

  var st = document.createElement("style");
  st.textContent =
    ".ccc-promo{position:fixed;left:20px;bottom:20px;z-index:900;max-width:360px;background:#0c1a2e;color:#f5f3ee;" +
    "border:1px solid var(--gold,#c9a84c);border-radius:6px;padding:18px 20px 16px;box-shadow:0 12px 32px rgba(0,0,0,.45);" +
    "font-family:Inter,system-ui,sans-serif;line-height:1.45;opacity:0;transform:translateY(16px);transition:opacity .35s ease,transform .35s ease}" +
    ".ccc-promo.show{opacity:1;transform:none}" +
    ".ccc-promo-tag{font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold,#c9a84c);margin:0 0 4px}" +
    ".ccc-promo-title{font-family:'Playfair Display',Georgia,serif;font-size:1.35rem;font-weight:700;margin:0 0 6px;color:#fff}" +
    ".ccc-promo-body{font-size:.88rem;margin:0 0 12px;color:#d9d5cc}" +
    ".ccc-promo-cta{display:inline-block;background:var(--gold,#c9a84c);color:#0c1a2e;text-decoration:none;font-weight:600;" +
    "font-size:.8rem;letter-spacing:.05em;text-transform:uppercase;padding:9px 14px;border-radius:4px}" +
    ".ccc-promo-cta:hover{background:#fff}" +
    ".ccc-promo-x{position:absolute;top:6px;right:8px;background:none;border:0;color:#d9d5cc;font-size:1.4rem;line-height:1;cursor:pointer;padding:4px 6px}" +
    ".ccc-promo-x:hover{color:#fff}" +
    "@media(max-width:600px){.ccc-promo{left:12px;right:12px;bottom:12px;max-width:none;padding:14px 16px 12px}" +
    ".ccc-promo-title{font-size:1.15rem}.ccc-promo-body{font-size:.82rem}}";
  document.head.appendChild(st);

  var box = document.createElement("aside");
  box.className = "ccc-promo";
  box.setAttribute("role", "complementary");
  function render() {
    var t = T[lang()];
    box.setAttribute("aria-label", t.title);
    box.innerHTML =
      '<button type="button" class="ccc-promo-x" aria-label="' + t.close + '">×</button>' +
      '<p class="ccc-promo-tag">' + t.tag + '</p>' +
      '<p class="ccc-promo-title">' + t.title + '</p>' +
      '<p class="ccc-promo-body">' + t.body + '</p>' +
      '<a class="ccc-promo-cta" href="' + t.href + '">' + t.cta + ' →</a>';
  }
  box.addEventListener("click", function (e) {
    if (e.target.closest(".ccc-promo-x")) {
      box.classList.remove("show");
      setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 400);
      try { localStorage.setItem(KEY, String(Date.now())); } catch (err) {}
      if (window.gtag) try { window.gtag("event", "promo_close", { promo: "3mois" }); } catch (err) {}
    } else if (e.target.closest(".ccc-promo-cta")) {
      if (window.gtag) try { window.gtag("event", "promo_click", { promo: "3mois", lang: lang() }); } catch (err) {}
    }
  });

  new MutationObserver(function () { if (box.parentNode) render(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  function consentNoticeOpen() {
    var n = document.querySelector("#klaro .cookie-notice, #klaro .cookie-modal");
    if (!n) return false;
    var s = getComputedStyle(n), r = n.getBoundingClientRect();
    return s.display !== "none" && s.visibility !== "hidden" && r.height > 0;
  }
  function show() {
    if (consentNoticeOpen()) { setTimeout(show, 1500); return; }
    render();
    document.body.appendChild(box);
    requestAnimationFrame(function () { requestAnimationFrame(function () { box.classList.add("show"); }); });
  }
  setTimeout(show, DELAY_MS);
})();
