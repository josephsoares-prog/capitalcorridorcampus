/* ======================================================================
   Capital Corridor Campus — Unified Tracking Stack
   Single source of truth. Update tokens below, not per-page.
   Deployed: 2026-04-20
   ====================================================================== */
(function(){
  'use strict';

  // ------ TOKENS (replace placeholders when accounts are created) ------
  var GA4_ID            = 'G-L3TWNPP48M';               // Google Analytics 4 — LIVE
  var GOOGLE_ADS_ID     = 'AW-PLACEHOLDER';             // TODO: replace after Google Ads account created
  var GOOGLE_ADS_LEAD_LABEL = 'LEAD_CONVERSION_LABEL';  // TODO: replace after conversion action created
  var CLARITY_ID        = 'CLARITY_PROJECT_ID';         // TODO: replace after clarity.microsoft.com signup
  var LINKEDIN_PARTNER  = 'LINKEDIN_PARTNER_ID';        // TODO: replace after LinkedIn Campaign Manager setup

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

  // Load on DOMContentLoaded, gated by consent
  document.addEventListener('DOMContentLoaded', function(){
    // analytics = Clarity + LinkedIn (consent category: 'analytics' and 'marketing')
    if(hasConsent('analytics')){
      loadMicrosoftClarity();
    }
    if(hasConsent('marketing')){
      loadLinkedInInsight();
      loadGoogleAds();
    }
  });

  // Listen for consent change (when user accepts via Klaro banner)
  window.addEventListener('klaro:consent-change', function(){
    if(hasConsent('analytics')) loadMicrosoftClarity();
    if(hasConsent('marketing')){ loadLinkedInInsight(); loadGoogleAds(); }
  });

  // Expose a helper for ad conversion firing (used on thank-you.html)
  window.cccFireLeadConversion = function(){
    if(typeof window.gtag === 'function' && GOOGLE_ADS_ID && GOOGLE_ADS_ID !== 'AW-PLACEHOLDER'){
      window.gtag('event', 'conversion', {
        'send_to': GOOGLE_ADS_ID + '/' + GOOGLE_ADS_LEAD_LABEL,
        'value': 1.0,
        'currency': 'CAD'
      });
    }
    if(typeof window.lintrk === 'function'){
      window.lintrk('track', { conversion_id: 0 }); // update when LinkedIn conversion created
    }
  };

})();
