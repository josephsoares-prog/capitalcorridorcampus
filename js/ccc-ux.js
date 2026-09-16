/* ccc-ux.js — campuscorridor.ca cross-cutting UX, added 2026-09-14.

   Two jobs, both found by rendering every page at 375x812 rather than by
   reading markup:

   1. MOBILE GUARD. Five blog posts ran their nav as a non-wrapping flex row
      (`nav{display:flex;gap:30px}` with no media query at all), so the nav
      measured 519px on a 375px screen and the whole page scrolled sideways.
      Two more overflowed on a wide table, and the blog index on an inline
      three-column footer grid. Eight pages in total.

   2. LANGUAGE SECTION LINK. 176 of 181 pages offer the reader no way to reach
      the site's other language. The blog index is bilingual and lists all 167
      posts, English and French together, so there is somewhere honest to send
      them — but nothing on a post says so.

      What this does NOT do is claim a translation. campuscorridor.ca's blog is
      two parallel monolingual publications, not a bilingual one: no English
      post is a mutual best match for any French post above 0.30 term overlap
      (measured 2026-09-14, all 92 EN against all 74 FR). So the control reads
      "our English insights", pointing at the index, never "this page in
      English", which would be false. The 72 hreflang tags that did make that
      false claim were removed in PR #10.

   Loaded by every page. Idempotent, and it renders nothing on a page that
   already carries its own working language toggle. */
(function () {
  "use strict";

  var CSS_ID = "ccc-ux-css";

  function css() {
    if (document.getElementById(CSS_ID)) return;
    var st = document.createElement("style");
    st.id = CSS_ID;
    st.textContent =
      /* The nav is a flex row with no narrow-screen rule on most blog posts.
         Let it wrap rather than push the page sideways. */
      "@media(max-width:760px){" +
      "nav{flex-wrap:wrap;gap:12px 18px;justify-content:center}" +
      "nav ul,nav .nav-links{flex-wrap:wrap;justify-content:center;gap:10px 16px;padding-left:0}" +
      /* The footer grid is an inline style, so this needs !important to reach it. */
      "footer>div[style*=grid]{grid-template-columns:1fr !important}" +
      "footer *{min-width:0}" +
      "}" +
      /* A table wider than the screen scrolls in its own box, not the page. */
      ".ccc-tscroll{overflow-x:auto;-webkit-overflow-scrolling:touch;max-width:100%}" +
      /* The language-section link, sized to sit inside the existing nav. */
      ".ccc-langlink{display:inline-flex;align-items:center;white-space:nowrap;" +
      "border:1px solid var(--gold,#c9a84c);border-radius:2px;padding:.3rem .7rem;" +
      "font-size:.78rem;letter-spacing:.04em;text-decoration:none;" +
      "color:var(--gold,#c9a84c);transition:background .25s ease,color .25s ease}" +
      ".ccc-langlink:hover{background:var(--gold,#c9a84c);color:#0c1a2e}" +
      /* Both controls stay on screen on the pages that hide the nav list. */
      ".ccc-langpair{display:inline-flex;gap:4px;margin-left:.75rem;vertical-align:middle}" +
      ".ccc-langpair a{border:1px solid var(--gold,#c9a84c);border-radius:2px;padding:.22rem .55rem;" +
      "font-size:.74rem;letter-spacing:.06em;text-decoration:none;color:var(--gold,#c9a84c)}" +
      ".ccc-langpair a[aria-current]{background:var(--gold,#c9a84c);color:#0c1a2e}" +
      "@media(max-width:768px){nav>.ccc-langlink,nav>.ccc-langkeep,header>.ccc-langpair,nav>.ccc-langpair" +
      "{display:inline-flex !important;align-items:center;margin:4px auto 0}}";
    document.head.appendChild(st);
  }

  function wrapWideTables() {
    var ts = document.querySelectorAll("table"), i, t, host, d;
    for (i = 0; i < ts.length; i++) {
      t = ts[i];
      host = t.parentNode;
      if (!host || host.className === "ccc-tscroll") continue;
      if (t.scrollWidth <= host.clientWidth + 2) continue;
      css();
      d = document.createElement("div");
      d.className = "ccc-tscroll";
      host.insertBefore(d, t);
      d.appendChild(t);
    }
  }

  /* An existing toggle that sits inside the nav list is hidden along with it on
     the pages that do `.nav-links{display:none}` below 768px — present, correct
     and unreachable on a phone, the same fault closed on josephsoares.com. Move
     it out of the list so it survives, rather than adding a second control. */
  function rescueOwnToggle() {
    var own = document.querySelector(".lang-toggle, .lang-buttons");
    if (!own) return false;
    if (visible(own)) return true;
    var nav = mountPoint();
    if (!nav || own.parentNode === nav) return true;
    css();
    own.className += " ccc-langkeep";
    nav.appendChild(own);
    return true;
  }

  function visible(e) {
    if (!e) return false;
    var s = getComputedStyle(e);
    if (s.display === "none" || s.visibility === "hidden") return false;
    var r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  /* Not every page has a <nav>: privacy.html carries a <header> instead, which
     is why it was one of the three pages left with no control at all. */
  function mountPoint() {
    return document.querySelector("nav")
        || document.querySelector("header .header-nav")
        || document.querySelector("header");
  }


  /* Some pages carry both languages inline as data-en / data-fr and swap on load
     from ?lang=. Two were failing in different ways, both found by rendering:
     corridor.html swaps correctly but ships no control, so its 61 French strings
     were unreachable; privacy.html carries 116 French strings and no swap at all,
     so the French privacy policy never rendered for anyone. This handles both,
     and does nothing on a page that already swaps and already has a control. */
  function inlineBilingual() {
    var els = document.querySelectorAll("[data-en][data-fr]");
    if (els.length < 4) return false;
    var want = new URLSearchParams(location.search).get("lang") === "en" ? "en" : "fr";
    var i, e, v, swapped = true;

    for (i = 0; i < els.length && i < 12; i++) {
      e = els[i];
      v = e.getAttribute("data-" + want);
      if (v === null || e.tagName === "IMG" || e.tagName === "INPUT" || e.tagName === "TEXTAREA") continue;
      if (e.innerHTML.trim() !== v.trim()) { swapped = false; break; }
    }
    if (!swapped) {
      for (i = 0; i < els.length; i++) {
        e = els[i];
        v = e.getAttribute("data-" + want);
        if (v === null) continue;
        if (e.tagName === "IMG") e.src = v;
        else if (e.tagName === "INPUT" || e.tagName === "TEXTAREA") e.placeholder = v;
        else e.innerHTML = v;
      }
      document.documentElement.lang = want;
    }

    var host = mountPoint();
    if (!host) return true;
    css();
    var wrap = document.createElement("span");
    wrap.className = "ccc-langpair";
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "Langue / Language");
    wrap.innerHTML =
      '<a href="?lang=fr" lang="fr"' + (want === "fr" ? ' aria-current="true"' : "") + ">FR</a>" +
      '<a href="?lang=en" lang="en"' + (want === "en" ? ' aria-current="true"' : "") + ">EN</a>";
    host.appendChild(wrap);
    return true;
  }

  /* A page that declares a real counterpart in the other language gets a real
     toggle to it, derived from its own hreflang tags - the same mechanism used
     on josephsoares.com. Returns the counterpart's path, or null. */
  function declaredTwin(isFr) {
    var want = isFr ? "en" : "fr";
    var links = document.querySelectorAll('link[rel="alternate"][hreflang]');
    var here = location.pathname.replace(/^\/+/, "");
    for (var i = 0; i < links.length; i++) {
      var hl = (links[i].getAttribute("hreflang") || "").toLowerCase();
      if (hl.indexOf(want) !== 0) continue;
      var href = links[i].getAttribute("href") || "";
      if (!href) continue;
      var path;
      try { path = new URL(href, location.origin).pathname; } catch (e) { continue; }
      if (path.replace(/^\/+/, "") === here) continue;
      return path;
    }
    return null;
  }

  function mountLanguageLink() {
    if (document.querySelector(".ccc-langlink, .ccc-langpair")) return;
    /* A page that switches its own language keeps its own control. */
    if (rescueOwnToggle()) return;
    if (inlineBilingual()) return;
    var nav = mountPoint();
    if (!nav) return;

    var lang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
    var isFr = lang.indexOf("fr") === 0;

    /* Prefer a declared counterpart over the section link: this page really does
       exist in the other language, so say so. */
    var twin = declaredTwin(isFr);
    if (twin) {
      css();
      var tw = document.createElement("a");
      tw.className = "ccc-langlink";
      tw.href = twin;
      tw.setAttribute("lang", isFr ? "en" : "fr");
      tw.setAttribute("hreflang", isFr ? "en-CA" : "fr-CA");
      tw.textContent = isFr ? "EN" : "FR";
      tw.title = isFr ? "Read this article in English" : "Lire cet article en fran\u00e7ais";
      tw.setAttribute("aria-label", tw.title);
      nav.appendChild(tw);
      return;
    }

    css();
    var a = document.createElement("a");
    a.className = "ccc-langlink";
    a.href = isFr ? "/blog/?lang=en" : "/blog/?lang=fr";
    a.setAttribute("lang", isFr ? "en" : "fr");
    a.textContent = isFr ? "English insights \u2192" : "Perspectives en fran\u00e7ais \u2192";
    a.title = isFr ? "Our English-language insights" : "Nos analyses en fran\u00e7ais";
    a.setAttribute("aria-label", a.title);
    /* Direct child of <nav>, never inside the link list: several pages hide that
       list entirely on a phone, which would hide this with it. */
    nav.appendChild(a);
  }

  function run() {
    css();
    mountLanguageLink();
    wrapWideTables();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
