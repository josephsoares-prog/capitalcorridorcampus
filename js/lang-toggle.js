/* lang-toggle.js — campuscorridor.ca EN/FR toggle, added 2026-09-09
   (uniform bilingual SOP; mirrors the mechanism live on josephsoares.com
   and ibprom.com's consent.js).

   Renders a toggle link derived from the hreflang alternates already in
   <head> — any page that declares a real English/French twin gets the
   toggle with no per-page markup. Renders nothing when the page has no
   counterpart, so this is safe to load unconditionally on every page. */
(function () {
  "use strict";
  var PATH = location.pathname.replace(/^\/+/, "");

  function altPath(hl) {
    var l = document.querySelector('link[rel="alternate"][hreflang="' + hl + '"]');
    if (!l) return null;
    var href = l.getAttribute("href") || "";
    if (!href) return null;
    var p;
    try { p = new URL(href, location.origin).pathname; } catch (e) { return null; }
    return p.replace(/^\/+/, "") === PATH ? null : p;
  }

  function run() {
    var lang = (document.documentElement.getAttribute("lang") || "en").toLowerCase();
    var isFr = lang.indexOf("fr") === 0;
    var target = isFr ? altPath("en") : (altPath("fr-CA") || altPath("fr"));
    if (!target) return;

    var navList = document.querySelector(".nav-links");
    if (!navList) return;

    var css = document.createElement("style");
    css.textContent =
      ".lang-toggle-link{font-weight:600;letter-spacing:.5px;text-decoration:none;" +
      "border:1px solid rgba(201,168,76,.4);padding:.3rem .75rem;border-radius:2px;transition:all .3s ease}" +
      ".lang-toggle-link:hover{background:var(--gold,#c9a84c);color:var(--dark,#0c1a2e)}";
    document.head.appendChild(css);

    var li = document.createElement("li");
    var a = document.createElement("a");
    a.className = "lang-toggle-link";
    a.href = target;
    a.setAttribute("hreflang", isFr ? "en" : "fr-CA");
    a.title = isFr ? "Read this page in English" : "Lire cette page en français";
    a.setAttribute("aria-label", a.title);
    a.textContent = isFr ? "EN" : "FR";
    li.appendChild(a);
    navList.appendChild(li);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
