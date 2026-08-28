/* ======================================================================
   Capital Corridor Campus — Unified Tracking Stack
   Single source of truth. Update tokens below, not per-page.
   Deployed: 2026-04-20
   ====================================================================== */
(function(){
  'use strict';

  // ------ TOKENS (replace placeholders when accounts are created) ------
  var GA4_ID            = 'G-FNYX4F5BTX';               // Google Analytics 4 — LIVE
  var GOOGLE_ADS_ID            = 'AW-18110302842';        // Google Ads — LIVE 2026-04-21
  var GOOGLE_ADS_LEAD_LABEL    = '4Zl8CLLBt6AcEPqU1btD';  // Lead — Contact Form conversion
  var GOOGLE_ADS_PURCHASE_LABEL = '4WnaCK_Bt6AcEPqU1btD'; // Subscribe (Purchase) conversion
  var GOOGLE_ADS_PHONE_LABEL   = 'AythCLbOq90cEPqU1btD';  // Phone-call conversion ("Click to call", Calls from website visits) — LIVE 2026-08-07
  var CLARITY_ID        = 'wfct56943k';                 // Microsoft Clarity — LIVE 2026-04-21
  var LINKEDIN_PARTNER  = '9068314';                     // LinkedIn Insight Tag — LIVE 2026-05-01 (Campaign Manager account "Campus Corridor", ID 535871013)
  var META_PIXEL_ID     = '1465033893811581';           // Meta Pixel (shared w/ josephsoares.com — unified retargeting) — LIVE 2026-04-21

  // ------ REF ATTRIBUTION CAPTURE (session-scoped, first-party, not consent-gated) ------
  // Captures ?ref=... on landing and persists it for the length of the browser session so
  // outbound campaign links (LinkedIn, newsletter, print, etc.) can be attributed even after
  // the visitor navigates to another page before converting. This is a plain referral-code
  // string, not a cross-site tracker, so it runs independently of the Klaro marketing gate.
  // Added 2026-08-05 — growth-radar audit finding (no ?ref= attribution anywhere on site).
  (function captureRef(){
    try{
      var params = new URLSearchParams(location.search);
      var ref = params.get('ref');
      if(ref){
        sessionStorage.setItem('ccc_ref', ref);
      }
    }catch(e){}
  })();
  window.cccGetRef = function(){
    try{ return sessionStorage.getItem('ccc_ref') || null; }catch(e){ return null; }
  };

  // ------ CONSENT MODE v2 BRIDGE ------
  // The <head> snippet on every page sets all consent types to 'denied' before
  // any Google tag loads. This pushes the 'update' once Klaro has an answer, so
  // Google can (a) honour the visitor's choice and (b) model the conversions it
  // is not allowed to observe. Replaces the 2026-08-06 thank-you.html carve-out,
  // which could never work: the Ads tag never ran on the landing page, so the
  // gclid was never stored and the conversion had nothing to attribute to.
  function pushConsentUpdate(){
    if(typeof window.gtag !== 'function') return;
    var marketing = hasConsent('google-ads');
    var analytics = hasConsent('ga4');
    try{
      window.gtag('consent', 'update', {
        'ad_storage':          marketing ? 'granted' : 'denied',
        'ad_user_data':        marketing ? 'granted' : 'denied',
        'ad_personalization':  marketing ? 'granted' : 'denied',
        'analytics_storage':   analytics ? 'granted' : 'denied'
      });
    }catch(e){}
  }

  // ------ CONSENT GATE (do nothing unless consent given) ------
  function hasConsent(category){
    try{
      var s = localStorage.getItem('klaro-consent');
      if(!s) return false;
      var parsed = JSON.parse(s);
      return parsed && parsed[category] === true;
    }catch(e){ return false; }
  }

  // ------ GA4 CUSTOM EVENTS ------
  // Requires gtag already loaded (it is, from inline script in head on every page).
  function trackEvent(name, params){
    if(typeof window.gtag === 'function'){
      try{ window.gtag('event', name, params || {}); }catch(e){}
    }
  }

  // Phone click tracking
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a');
    if(!a) return;
    var href = a.getAttribute('href') || '';
    if(href.indexOf('tel:') === 0){
      trackEvent('phone_click', {
        phone_number: href.replace('tel:',''),
        link_text: (a.textContent || '').trim().slice(0,80),
        page_path: location.pathname
      });
      if(typeof window.cccFirePhoneConversion === 'function') window.cccFirePhoneConversion();
    } else if(href.indexOf('mailto:') === 0){
      trackEvent('email_click', {
        email_address: href.replace('mailto:','').split('?')[0],
        link_text: (a.textContent || '').trim().slice(0,80),
        page_path: location.pathname
      });
    } else if(/^https?:\/\//i.test(href) && href.indexOf('campuscorridor.ca') === -1){
      trackEvent('outbound_click', {
        outbound_url: href,
        page_path: location.pathname
      });
    } else if(a.classList && (a.classList.contains('btn') || a.classList.contains('cta'))){
      trackEvent('cta_click', {
        cta_text: (a.textContent || '').trim().slice(0,80),
        cta_href: href,
        page_path: location.pathname
      });
    }
  }, true);

  // Form interaction tracking
  document.addEventListener('focusin', function(e){
    var f = e.target.closest && e.target.closest('form');
    if(!f || f.__cccTracked) return;
    f.__cccTracked = true;
    trackEvent('form_start', {
      form_id: f.id || 'unknown',
      page_path: location.pathname
    });
  });

  // Tour request CTA detector (any link whose text matches common tour phrases)
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a, button');
    if(!a) return;
    var text = (a.textContent || '').toLowerCase();
    if(/\btour\b|\bvisit\b|\bvisite\b|book a viewing|schedule a viewing|réservez une visite/.test(text)){
      trackEvent('tour_request_click', {
        cta_text: (a.textContent || '').trim().slice(0,80),
        page_path: location.pathname
      });
    }
  });

  // Scroll-depth milestones (25/50/75/90%) beyond GA4 default (90%)
  var milestones = [25, 50, 75];
  var fired = {};
  window.addEventListener('scroll', function(){
    var h = document.documentElement;
    var pct = Math.round(((h.scrollTop || window.scrollY) + window.innerHeight) / h.scrollHeight * 100);
    milestones.forEach(function(m){
      if(!fired[m] && pct >= m){
        fired[m] = true;
        trackEvent('scroll_depth', { percent: m, page_path: location.pathname });
      }
    });
  }, { passive: true });

  // ------ DEFERRED THIRD-PARTY LOADERS (consent-gated) ------

  function loadMicrosoftClarity(){
    if(!CLARITY_ID || CLARITY_ID === 'CLARITY_PROJECT_ID') return;
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window,document,"clarity","script",CLARITY_ID);
  }

  function loadLinkedInInsight(){
    if(!LINKEDIN_PARTNER || LINKEDIN_PARTNER === 'LINKEDIN_PARTNER_ID') return;
    window._linkedin_partner_id = LINKEDIN_PARTNER;
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(LINKEDIN_PARTNER);
    (function(l){
      if(!l){
        window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
        window.lintrk.q = [];
      }
      var s = document.getElementsByTagName("script")[0];
      var b = document.createElement("script");
      b.type = "text/javascript"; b.async = true;
      b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
      s.parentNode.insertBefore(b, s);
    })(window.lintrk);
  }

  function loadMetaPixel(){
    if(!META_PIXEL_ID || META_PIXEL_ID === 'META_PIXEL_ID') return;
    !function(f,b,e,v,n,t,s){
      if(f.fbq) return; n=f.fbq=function(){n.callMethod ?
        n.callMethod.apply(n,arguments) : n.queue.push(arguments)};
      if(!f._fbq) f._fbq=n; n.push=n; n.loaded=!0; n.version='2.0';
      n.queue=[]; t=b.createElement(e); t.async=!0;
      t.src=v; s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s);
    }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  function loadGoogleAds(){
    if(!GOOGLE_ADS_ID || GOOGLE_ADS_ID === 'AW-PLACEHOLDER') return;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GOOGLE_ADS_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){ dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GOOGLE_ADS_ID);
  }

  // Klaro stores per-service consent, not per-purpose. So hasConsent('clarity')
  // checks the literal 'clarity' key in localStorage. Fixed 2026-05-07.
  function loadConsentedTrackers(){
    if(hasConsent('clarity'))    loadMicrosoftClarity();
    if(hasConsent('linkedin'))   loadLinkedInInsight();

    // 2026-08-25 (audit finding 4.2 — supersedes the 2026-08-06 carve-out):
    // the Google Ads tag now loads on EVERY page unconditionally, because
    // under Consent Mode v2 loading the tag is not the same as storing data.
    // With ad_storage denied it writes no cookies and sends only a cookieless
    // ping; url_passthrough carries the gclid forward in the URL. That is what
    // makes a declined-cookies visitor attributable at all. Storage is governed
    // by the consent state, not by whether the script is present.
    loadGoogleAds();
    pushConsentUpdate();
    fireThankYouConversion();

    // Meta Pixel isn't in klaro-config services list yet — gate on 'linkedin'
    // (same purpose:'marketing' bucket) until/unless it's added explicitly.
    if(hasConsent('linkedin'))   loadMetaPixel();
  }

  // Load on DOMContentLoaded, gated by consent
  document.addEventListener('DOMContentLoaded', loadConsentedTrackers);

  // Listen for consent change (Klaro fires this on accept/decline/update)
  window.addEventListener('klaro:consent-change', loadConsentedTrackers);
  // Klaro v0.7.x also dispatches consent updates as a custom event; subscribe via
  // the manager API for reliability.
  if (window.klaro && typeof window.klaro.getManager === 'function') {
    try {
      var mgr = window.klaro.getManager(window.klaroConfig);
      if (mgr && typeof mgr.watch === 'function') {
        mgr.watch({ update: function(){ loadConsentedTrackers(); } });
      }
    } catch(e) {}
  }

  // ------ THANK-YOU CONVERSION TRIGGER (load-order fix, 2026-07-29) ------
  // The inline <head> script on thank-you.html calls cccFireLeadConversion()
  // before this deferred file has defined it, so the Google Ads conversion
  // never fired. Fire it here instead — after loadGoogleAds() has run and the
  // helpers below are defined. Guarded to fire once per load.
  //
  // UPDATE (2026-08-06, Joseph decision — gate relaxed): prior to this date,
  // this trigger and the Google Ads pixel only fired if the visitor had
  // explicitly granted the 'google-ads' Klaro marketing consent, which fully
  // explained zero recorded Ads conversions (see loadConsentedTrackers()
  // above — the consent requirement is now scoped OFF specifically for
  // /thank-you.html, so this fires on every real thank-you-page load
  // regardless of consent). See project_ccc_website_zero_inquiry_flag.md.
  function fireThankYouConversion(){
    if(!/thank-you/i.test(location.pathname)) return;
    if(window.__cccConversionFired) return;
    window.__cccConversionFired = true;
    var q = new URLSearchParams(location.search);
    var tier = q.get('tier');
    var plan = parseFloat(q.get('plan')) || 0;
    if(tier && plan > 0){
      // Stable transaction id so Google can suppress duplicates on refresh.
      // Prefer Stripe's checkout session id: set each payment link's success URL to
      //   https://campuscorridor.ca/thank-you.html?tier=<tier>&plan=<n>&sid={CHECKOUT_SESSION_ID}
      // Fall back to tier + UTC date, which still dedupes a same-day refresh.
      var sid = q.get('sid');
      var txn = sid ? ('stripe_' + sid)
                    : ('stripe_' + tier + '_' + new Date().toISOString().slice(0,10));
      if(typeof window.cccFirePurchaseConversion === 'function') window.cccFirePurchaseConversion(plan, 'CAD', txn);
    } else {
      if(typeof window.cccFireLeadConversion === 'function') window.cccFireLeadConversion();
    }
  }

  // ------ AD CONVERSION HELPERS (used on /thank-you.html) ------
  // Lead path: contact form submission — fires when /thank-you.html loads with no ?tier= param
  window.cccFireLeadConversion = function(){
    if(typeof window.gtag === 'function' && GOOGLE_ADS_ID && GOOGLE_ADS_ID.indexOf('AW-') === 0){
      window.gtag('event', 'conversion', {
        'send_to': GOOGLE_ADS_ID + '/' + GOOGLE_ADS_LEAD_LABEL,
        'value': 200.0,
        'currency': 'CAD'
      });
    }
    if(typeof window.lintrk === 'function'){
      window.lintrk('track', { conversion_id: 0 }); // update when LinkedIn conversion created
    }
    if(typeof window.fbq === 'function'){
      window.fbq('track', 'Lead', { value: 200.0, currency: 'CAD' });
    }
  };

  // Purchase path: Stripe checkout complete — fires when /thank-you.html loads with ?tier=... param
  window.cccFirePurchaseConversion = function(value, currency, transactionId){
    value = value || 199;
    currency = currency || 'CAD';
    transactionId = transactionId || ('stripe_' + new Date().toISOString().slice(0,10));
    if(typeof window.gtag === 'function' && GOOGLE_ADS_ID && GOOGLE_ADS_ID.indexOf('AW-') === 0){
      window.gtag('event', 'conversion', {
        'send_to': GOOGLE_ADS_ID + '/' + GOOGLE_ADS_PURCHASE_LABEL,
        'value': value,
        'currency': currency,
        'transaction_id': transactionId
      });
    }
    if(typeof window.lintrk === 'function'){
      window.lintrk('track', { conversion_id: 0 }); // update when LinkedIn purchase conversion created
    }
    if(typeof window.fbq === 'function'){
      window.fbq('track', 'Subscribe', { value: value, currency: currency, predicted_ltv: value * 12 });
    }
  };

  // Phone path: click-to-call intent on any tel: link, site-wide.
  // 2026-08-25: no longer suppressed when marketing consent is absent — the tag
  // is always present now and Consent Mode governs storage (see loadConsentedTrackers).
  // LIVE 2026-08-07 — GOOGLE_ADS_PHONE_LABEL now holds the "Phone call lead"
  // (Click to call / Calls from website visits) conversion label created in
  // Google Ads (Tools & Settings > Conversions). Fires the same gtag conversion
  // event pattern as the Lead/Purchase helpers above. Deliberately follows the
  // same consent gate as general Ads tracking (see loadConsentedTrackers note
  // above), not the /thank-you.html carve-out, since a phone click can happen
  // on any page, not just a post-conversion confirmation page.
  window.cccFirePhoneConversion = function(){
    if(!GOOGLE_ADS_PHONE_LABEL) return; // no-op until the label above is set
    if(typeof window.gtag === 'function' && GOOGLE_ADS_ID && GOOGLE_ADS_ID.indexOf('AW-') === 0){
      window.gtag('event', 'conversion', {
        'send_to': GOOGLE_ADS_ID + '/' + GOOGLE_ADS_PHONE_LABEL
      });
    }
  };

})();
