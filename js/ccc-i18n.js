/* ccc-i18n.js — French for campuscorridor.ca pages authored in English. 2026-09-16.

   Loaded with   <script src="/js/ccc-i18n.js" defer data-i18n="/i18n/PAGE.fr.json">
   placed BEFORE ccc-ux.js, so the FR | EN control below already exists when
   ccc-ux.js looks for a page's own toggle and it adds nothing of its own.

   English is the default; ?lang=fr selects French. The JSON maps each English
   text fragment (whitespace-collapsed) to its French. Matching is by exact
   text, so a fragment edited later in English simply stays English until its
   translation is updated — it never shows the wrong sentence.

   JSON shape: { "title": "", "description": "", "text": {en: fr}, "attrs": {en: fr} } */
(function () {
  "use strict";
  var me = document.currentScript;
  var src = me && me.getAttribute("data-i18n");
  if (!src) return;

  var params = new URLSearchParams(location.search);
  var want = params.get("lang") === "fr" ? "fr" : "en";
  var map = null, swaps = null, attrSwaps = null;
  var EN = { title: document.title, desc: "" };
  var md = document.querySelector('meta[name="description"]');
  if (md) EN.desc = md.getAttribute("content") || "";

  /* ---- the control ---- */
  var st = document.createElement("style");
  st.textContent =
    ".lang-toggle.ccc-i18n{display:inline-flex;gap:4px;margin:0 .75rem;align-items:center;flex:0 0 auto;vertical-align:middle}" +
    ".lang-toggle.ccc-i18n a{border:1px solid var(--gold,#c9a84c);border-radius:2px;padding:.22rem .55rem;font-size:.74rem;" +
    "font-weight:600;letter-spacing:.06em;text-decoration:none;color:var(--gold,#c9a84c);line-height:1.4;font-family:inherit}" +
    ".lang-toggle.ccc-i18n a[aria-current]{background:var(--gold,#c9a84c);color:#0c1a2e}";
  document.head.appendChild(st);

  var box = document.createElement("div");
  box.className = "lang-toggle ccc-i18n";
  box.setAttribute("role", "group");
  box.setAttribute("aria-label", "Langue / Language");
  box.innerHTML =
    '<a href="?lang=fr" hreflang="fr-CA" data-setlang="fr" title="Français">FR</a>' +
    '<a href="?lang=en" hreflang="en-CA" data-setlang="en" title="English">EN</a>';
  var right = document.querySelector(".nav-right");
  var host = right || document.querySelector(".nav-container") || document.querySelector("nav") || document.querySelector("header");
  if (host) {
    if (right && right.firstChild) right.insertBefore(box, right.firstChild);
    else host.appendChild(box);
  }

  /* ---- the swap ---- */
  var norm = function (s) { return s.replace(/\s+/g, " ").trim(); };
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEMPLATE: 1 };

  function collect() {
    swaps = []; attrSwaps = [];
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        for (var p = n.parentNode; p && p !== document.body; p = p.parentNode) {
          if (SKIP[p.nodeName] || p === box) return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n, v, k, fr, m;
    while ((n = w.nextNode())) {
      v = n.nodeValue; k = norm(v);
      if (!k || !Object.prototype.hasOwnProperty.call(map.text, k)) continue;
      m = v.match(/^(\s*)[\s\S]*?(\s*)$/);
      fr = m[1] + map.text[k] + m[2];
      swaps.push([n, v, fr]);
    }
    var els = document.body.querySelectorAll("[placeholder],[alt],[aria-label],[title]"), i, j, a, names = ["placeholder", "alt", "aria-label", "title"];
    for (i = 0; i < els.length; i++) {
      if (box.contains(els[i])) continue;
      for (j = 0; j < names.length; j++) {
        a = els[i].getAttribute(names[j]);
        if (a && map.attrs && Object.prototype.hasOwnProperty.call(map.attrs, norm(a))) {
          attrSwaps.push([els[i], names[j], a, map.attrs[norm(a)]]);
        }
      }
    }
  }

  function setLang(l, push) {
    if (l === "fr" && !map) return;
    var fr = l === "fr", i, s;
    if (map) {
      if (!swaps) collect();
      for (i = 0; i < swaps.length; i++) { s = swaps[i]; s[0].nodeValue = fr ? s[2] : s[1]; }
      for (i = 0; i < attrSwaps.length; i++) { s = attrSwaps[i]; s[0].setAttribute(s[1], fr ? s[3] : s[2]); }
      document.title = fr && map.title ? map.title : EN.title;
      if (md) md.setAttribute("content", fr && map.description ? map.description : EN.desc);
    }
    /* Blocks a page already carries in both languages, marked data-lang. */
    var dl = document.querySelectorAll("[data-lang]");
    for (i = 0; i < dl.length; i++) {
      if (dl[i].closest(".lang-toggle")) continue;
      dl[i].style.display = dl[i].getAttribute("data-lang") === l ? "" : "none";
    }
    document.documentElement.lang = fr ? "fr-CA" : "en-CA";
    var links = box.querySelectorAll("[data-setlang]");
    for (i = 0; i < links.length; i++) {
      if (links[i].getAttribute("data-setlang") === l) links[i].setAttribute("aria-current", "true");
      else links[i].removeAttribute("aria-current");
    }
    if (push) { try { var u = new URL(location.href); u.searchParams.set("lang", l); history.replaceState(null, "", u); } catch (e) {} }
  }

  box.addEventListener("click", function (e) {
    var a = e.target.closest("[data-setlang]");
    if (!a) return;
    e.preventDefault();
    var l = a.getAttribute("data-setlang");
    if (l === "fr" && !map) { location.href = "?lang=fr"; return; }
    setLang(l, true);
  });

  setLang("en");
  fetch(src).then(function (r) { return r.json(); }).then(function (j) {
    map = j; map.text = map.text || {};
    if (want === "fr") setLang("fr");
  }).catch(function () {});
})();
