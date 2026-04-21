/* Klaro! cookie consent config — Quebec Law 25 + GDPR-aligned
   Docs: https://klaro.org */
window.klaroConfig = {
  version: 1,
  elementID: 'klaro',
  styling: { theme: ['light','bottom','wide'] },
  noAutoLoad: false,
  htmlTexts: true,
  embedded: false,
  groupByPurpose: true,
  storageMethod: 'localStorage',
  storageName: 'klaro-consent',
  cookieExpiresAfterDays: 180,
  default: false,
  mustConsent: false,
  acceptAll: true,
  hideDeclineAll: false,
  translations: {
    en: {
      consentModal: {
        title: 'Privacy & Cookie Preferences',
        description: 'We use cookies to measure site performance and improve our services. You can accept all, decline, or manage preferences. Details in our <a href="/privacy.html">Privacy Policy</a>.'
      },
      consentNotice: {
        description: 'We use cookies for analytics and marketing. You can manage preferences below. See our <a href="/privacy.html">Privacy Policy</a>.',
        learnMore: 'Manage'
      },
      purposes: {
        functional: { title: 'Essential', description: 'Required for the site to function.' },
        analytics: { title: 'Analytics', description: 'Help us understand how visitors use the site (Google Analytics, Microsoft Clarity).' },
        marketing: { title: 'Marketing', description: 'Help us reach the right audience and measure ad performance (Google Ads, LinkedIn).' }
      },
      acceptAll: 'Accept all',
      acceptSelected: 'Accept selected',
      decline: 'Decline'
    },
    fr: {
      consentModal: {
        title: 'Préférences de confidentialité',
        description: 'Nous utilisons des témoins pour mesurer la performance du site et améliorer nos services. Vous pouvez tout accepter, refuser ou gérer vos préférences. Détails dans notre <a href="/privacy.html">politique de confidentialité</a>.'
      },
      consentNotice: {
        description: 'Nous utilisons des témoins à des fins d\'analyse et de marketing. Vous pouvez gérer vos préférences ci-dessous. Consultez notre <a href="/privacy.html">politique de confidentialité</a>.',
        learnMore: 'Gérer'
      },
      purposes: {
        functional: { title: 'Essentiels', description: 'Nécessaires au fonctionnement du site.' },
        analytics: { title: 'Analyse', description: 'Nous aident à comprendre l\'usage du site (Google Analytics, Microsoft Clarity).' },
        marketing: { title: 'Marketing', description: 'Nous aident à rejoindre la bonne audience et mesurer la performance publicitaire (Google Ads, LinkedIn).' }
      },
      acceptAll: 'Tout accepter',
      acceptSelected: 'Accepter la sélection',
      decline: 'Refuser'
    }
  },
  services: [
    { name: 'ga4', purposes: ['analytics'], required: false, default: false,
      title: 'Google Analytics 4', cookies: [/^_ga/, '_gid', '_gat'] },
    { name: 'clarity', purposes: ['analytics'], required: false, default: false,
      title: 'Microsoft Clarity', cookies: [/^_clck/, /^_clsk/] },
    { name: 'linkedin', purposes: ['marketing'], required: false, default: false,
      title: 'LinkedIn Insight Tag', cookies: ['li_fat_id','li_sugr','bcookie','bscookie','lidc'] },
    { name: 'google-ads', purposes: ['marketing'], required: false, default: false,
      title: 'Google Ads', cookies: [/^_gcl/,'IDE','DSID','NID','1P_JAR'] }
  ]
};
