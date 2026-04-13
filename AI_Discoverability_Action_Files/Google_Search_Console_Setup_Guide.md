# Google Search Console — Verification & Sitemap Guide

## Properties to Set Up

| Property | Status | Action Needed |
|----------|--------|---------------|
| ibprom.com | Verified | Submit sitemap |
| josephsoares.com | Listed but NOT VERIFIED | Verify + submit sitemap |
| campuscorridor.ca | MISSING | Add property + verify + submit sitemap |

---

## Step 1: Add campuscorridor.ca

1. Go to https://search.google.com/search-console
2. Click the property dropdown (top left)
3. Click **Add property**
4. Select **URL prefix** method
5. Enter: `https://campuscorridor.ca`
6. Click **Continue**

### Verification Method — HTML file (recommended for GitHub Pages):
- Google will give you a file named something like `google1234567890abcdef.html`
- Download it
- Add it to your GitHub repo: `josephsoares-prog/capitalcorridorcampus`
- Push to main branch
- Wait 1-2 minutes for GitHub Pages to deploy
- Click **Verify** in GSC

### Alternative — HTML tag method:
- Google gives you a meta tag like: `<meta name="google-site-verification" content="xxxx" />`
- Add it to the `<head>` section of `index.html`
- Push to GitHub
- Click **Verify** in GSC

---

## Step 2: Verify josephsoares.com

1. In GSC, click the property dropdown
2. Click on **josephsoares.com** (already listed)
3. Click **Verify** or go to Settings → Ownership verification
4. Use the same HTML file or meta tag method as above
5. The repo is: `josephsoares-prog/josephsoares-prog.github.io`

---

## Step 3: Submit Sitemaps (all 3 properties)

For EACH verified property:

1. Click the property name in GSC
2. Go to **Sitemaps** in the left sidebar (under Indexing)
3. In the "Add a new sitemap" field, enter: `sitemap.xml`
4. Click **Submit**

### Sitemap URLs:
- https://campuscorridor.ca/sitemap.xml ✅ (already created)
- https://josephsoares.com/sitemap.xml ⚠️ (need to verify this exists)
- https://ibprom.com/sitemap.xml ⚠️ (need to verify this exists)

---

## Step 4: Request Indexing for Key Pages

After sitemaps are submitted:

1. In each property, go to **URL Inspection** (top search bar)
2. Enter the homepage URL
3. Click **Request Indexing**
4. Repeat for any key pages (about, services, etc.)

---

## Post-Setup: What to Monitor

- **Coverage report**: Check for errors after 48-72 hours
- **Performance report**: Will start showing data within 3-5 days
- **Sitemaps status**: Should show "Success" within 24 hours

## Why This Matters

Google Search Console is the only way to tell Google directly about your pages. Without GSC verification, Google discovers your sites only through crawling — which is slower and less reliable. For AI discoverability, GSC ensures your structured data (JSON-LD) is properly parsed and your entities (Person, Organization, RealEstateAgent) are recognized in Google's Knowledge Graph, which feeds into Gemini and other AI models.
