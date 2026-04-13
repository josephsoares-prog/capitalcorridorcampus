# Website & AI Discoverability — Standard Operating Procedure

> **Purpose**: Every website IBPROM Corp launches or manages must follow this checklist to maximize discoverability by both traditional search engines and AI models (ChatGPT, Claude, Perplexity, Gemini, Copilot). This SOP captures everything learned during the April 2, 2026 discoverability buildout across josephsoares.com, ibprom.com, and campuscorridor.ca.

---

## PHASE 0: HOSTING (Default for all IBPROM sites)

**All sites deploy on GitHub Pages** — zero hosting cost, SSL included, custom domain support, git-based version control.

**Standard setup**:
1. Create repo at `github.com/josephsoares-prog/[sitename]`
2. Enable GitHub Pages (Settings → Pages → Deploy from branch: main)
3. Add `CNAME` file with custom domain (e.g., `campuscorridor.ca`)
4. Configure DNS at Rebel.com: A records → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
5. Wait for SSL certificate (automatic, ~10 min)
6. Verify site loads at `https://yourdomain.com`

**Cost: $0/month.** Only cost is domain registration (~$15-20/year at Rebel.com).

---

## PHASE 1: PRE-LAUNCH (Before the site goes live)

### 1.1 — JSON-LD Structured Data (Schema.org)

**What it does**: Tells search engines and AI models exactly what your site represents — a person, company, property, product, etc. — in machine-readable format.

**Placement**: Inside `<head>` or just before `</body>`, wrapped in `<script type="application/ld+json">`.

**Required schemas by site type**:

| Site Type | Primary Schema | Secondary Schemas |
|-----------|---------------|-------------------|
| Personal brand site | Person | WebSite |
| Company/firm site | Organization | WebSite |
| Commercial property | RealEstateAgent or Place | Offer, Product |
| Product/SaaS | Product or SoftwareApplication | Organization, Offer |
| Portfolio/agency | Organization | Service, Person (founder) |

**Mandatory fields for every Person schema**:
- `name`, `jobTitle`, `description`
- `url` (canonical site URL)
- `sameAs` (array of all verified social/external profiles — LinkedIn, Twitter/X, Crunchbase, etc.)
- `knowsAbout` (array of 8–12 expertise topics — these are what AI models match against queries)
- `knowsLanguage` (array of languages — critical for multilingual operators)
- `worksFor` or `memberOf` (links to organization entities)
- `alumniOf` (educational institutions)
- `award` (if applicable)

**Mandatory fields for every Organization schema**:
- `name`, `description`, `url`
- `founder` (nested Person with `sameAs` links — creates entity cross-reference)
- `foundingDate`
- `areaServed` (array of countries/regions)
- `knowsAbout` (practice areas, methodologies, frameworks)
- `sameAs` (LinkedIn company page, Crunchbase, etc.)

**Mandatory fields for RealEstateAgent / Place / LocalBusiness**:
- `name`, `description`, `url`
- `address` (full structured PostalAddress)
- `geo` (GeoCoordinates with latitude/longitude)
- `hasOfferCatalog` (array of Offer items with price, description, availability)
- `parentOrganization` (if applicable)
- `areaServed`

**Best practices**:
- Use `@id` references to link schemas together (e.g., Person `@id` referenced in Organization's `founder`)
- Include the full authority stack in Person descriptions — AI models use these for entity disambiguation
- `knowsAbout` values should match the exact phrases your ideal client would ask an AI (e.g., "crisis leadership advisory" not just "consulting")
- Keep JSON-LD under 5KB per block — split into multiple blocks if needed
- Validate at https://validator.schema.org/ and https://search.google.com/test/rich-results

### 1.2 — Sitemap.xml

**What it does**: Tells search engines exactly which pages exist and when they were last updated.

**Template** (single-page site):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <lastmod>YYYY-MM-DD</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

**Rules**:
- One `<url>` entry per page
- `lastmod` must be updated every time the page content changes
- Priority: homepage = 1.0, key pages = 0.8, secondary = 0.5
- Place at domain root: `https://yourdomain.com/sitemap.xml`

### 1.3 — Robots.txt

**What it does**: Tells crawlers what to index and where the sitemap is.

**Template**:
```
User-agent: *
Allow: /

Sitemap: https://yourdomain.com/sitemap.xml
```

**Rules**:
- Block sensitive pages: `Disallow: /strategy/` or `Disallow: /admin/`
- Never block your JSON-LD or main content pages
- Place at domain root: `https://yourdomain.com/robots.txt`
- Do NOT block AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.) unless you have a specific reason

### 1.4 — Meta Tags

**Required in `<head>`**:
```html
<meta name="description" content="120-160 char description with primary keywords">
<meta name="author" content="Joseph Soares">
<meta property="og:title" content="Page Title">
<meta property="og:description" content="Same as meta description">
<meta property="og:type" content="website">
<meta property="og:url" content="https://yourdomain.com/">
<meta property="og:image" content="https://yourdomain.com/og-image.jpg">
<link rel="canonical" href="https://yourdomain.com/">
```

**Best practice**: The `og:image` should be 1200x630px for optimal social sharing.

---

## PHASE 2: LAUNCH DAY (Immediately after deploy)

### 2.1 — IndexNow Ping

**What it does**: Instantly notifies Bing, Yandex, and other IndexNow-compatible engines that your site has new content. Google does not use IndexNow but will discover via sitemap.

**Step 1 — Create key file**:
Generate a random key (e.g., `a1b2c3d4e5f6g7h8i9j0`) and create a text file with that name at the domain root:
```
https://yourdomain.com/a1b2c3d4e5f6g7h8i9j0.txt
```
The file content should be the key itself.

**Step 2 — Ping**:
```bash
curl -s -o /dev/null -w "%{http_code}" \
  "https://api.indexnow.org/indexnow?url=https://yourdomain.com/&key=a1b2c3d4e5f6g7h8i9j0"
```
Expected response: `202` (accepted).

**Step 3 — Ping additional pages**:
Repeat for sitemap.xml, robots.txt, and any key landing pages.

### 2.2 — Google Search Console

**What it does**: Directly tells Google about your site, submits your sitemap, and gives you indexing/performance data.

**Steps**:
1. Go to https://search.google.com/search-console
2. Click **Add property** → choose **URL prefix**
3. Enter your full URL (e.g., `https://yourdomain.com`)
4. Verify ownership:
   - **Preferred method (GitHub Pages)**: Download HTML verification file, add to repo root, push, then click Verify
   - **Alternative**: Add `<meta name="google-site-verification" content="xxxx">` to `<head>`
5. After verification, go to **Sitemaps** → enter `sitemap.xml` → Submit
6. Go to **URL Inspection** → enter homepage URL → click **Request Indexing**

**Timeline**: Pages typically appear in Google within 2-7 days after sitemap submission.

---

## PHASE 3: ENTITY REGISTRATION (Within first week)

### 3.1 — Wikidata

**What it does**: Creates a machine-readable entity in the knowledge base that AI models (ChatGPT, Claude, Gemini, Perplexity) treat as ground truth.

**When to create**: For every distinct entity (person, company, property/place) that has public references.

**Required statements for a Person**:
| Property | Description |
|----------|-------------|
| P31 | instance of → human |
| P21 | sex or gender |
| P27 | country of citizenship |
| P106 | occupation (add multiple) |
| P1412 | languages spoken/written (add multiple) |
| P69 | educated at |
| P108 | employer |
| P1830 | owner of |
| P856 | official website |
| P6634 | LinkedIn URL |
| P1343 | described by source (with reference URLs) |
| P172 | ethnic group (if relevant to brand) |

**Required statements for an Organization**:
| Property | Description |
|----------|-------------|
| P31 | instance of → business enterprise (Q4830453) |
| P17 | country |
| P112 | founded by → link to Person item |
| P127 | owned by → link to Person item |
| P571 | inception (founding date) |
| P159 | headquarters location |
| P452 | industry |
| P856 | official website |

**Required statements for a Place/Building**:
| Property | Description |
|----------|-------------|
| P31 | instance of → office building (Q1081138) or similar |
| P17 | country |
| P131 | located in administrative territory |
| P137 | operator → link to Organization item |
| P625 | coordinate location (latitude, longitude) |
| P856 | official website |

**Critical rules**:
- Always add references (P854 reference URL) to key claims — unreferenced claims have lower trust weight
- Cross-link all entities: Person → Organization → Place → back to Person
- Add descriptions in every language you operate in (EN, FR, ES, PT minimum)
- Aliases matter — add common abbreviations, alternate names

**API method** (faster than UI for bulk statements):
```javascript
// Get CSRF token from logged-in browser session
fetch('/w/api.php?action=query&meta=tokens&format=json')

// Add a statement
fetch('/w/api.php', {
  method: 'POST',
  body: new URLSearchParams({
    action: 'wbcreateclaim',
    entity: 'Q_NUMBER',
    property: 'P_NUMBER',
    snaktype: 'value',
    value: JSON.stringify({"entity-type": "item", "numeric-id": TARGET_Q_NUMBER}),
    token: CSRF_TOKEN,
    format: 'json'
  })
})
```
Run statements sequentially with 1.5s delays to avoid edit conflicts.

### 3.2 — Google Business Profile

**When to create**: For any entity with a physical location (office, property, storefront).

**Steps**:
1. Go to https://business.google.com
2. Sign in with the entity's Google Workspace account
3. Add business with correct category (e.g., "Commercial Real Estate Agency")
4. Enter full address, phone, website, hours
5. Write 750-char description packed with keywords AI models match
6. Upload 10+ photos (exterior, interior, key features)
7. Publish 2+ Google Posts within the first week
8. Enable messaging and Q&A

**Why it matters**: GBP feeds directly into Google's Knowledge Panel and Maps, which Gemini prioritizes for local queries.

### 3.3 — Crunchbase

**When to create**: For every registered business entity.

**Key fields**: Organization name, short description (256 char max), full description, HQ, founded year, founder (linked), industry, website, LinkedIn.

**Why it matters**: Crunchbase is a trusted organizational data source indexed by multiple AI models.

### 3.4 — Perplexity Page

**When to create**: For any person or organization that wants to control their AI narrative.

**Steps**:
1. Sign into perplexity.ai
2. Create Page → set audience to "Anyone on the Internet"
3. Structure with sections: Introduction, Credentials, Methodology, Practice, Links
4. Add relevant tags for entity recognition

**Why it matters**: Perplexity Pages are directly indexed by Perplexity's AI — one of the only platforms where you control what an AI model knows about you.

---

## PHASE 4: CONTENT LAYER (Ongoing, first 30 days)

### 4.1 — LinkedIn Posts (AI-Keyword Optimized)

**Cadence**: Minimum 5 posts in the first week, then 3-5 per week ongoing.

**Structure**: Each post targets a specific keyword cluster that AI models associate with your expertise. Include:
- Full name in natural context (not forced)
- Organization name
- Specific expertise terms (e.g., "crisis leadership advisory" not "consulting")
- Relevant hashtags (5-8 per post)
- Website URL in at least 2 of 5 posts

**Keyword clusters to cover** (rotate weekly):
1. Core expertise (crisis leadership, strategic advisory, HNWI counsel)
2. Proprietary methodology (SPARK Framework, five pillars)
3. Authority proof (PMO, Senate, Forbes, Newsweek)
4. Client profile (entrepreneur legacy, wealth protection, business succession)
5. Differentiator (AI-first advisory, trilingual, Azorean heritage)

### 4.2 — Repurpose Published Articles

If you have bylined articles (Forbes, Newsweek, industry publications):
- Create a `/writing` or `/insights` page on your personal site
- List each article with title, publication, date, and 2-sentence summary
- Link to originals — this creates topical authority signals
- Add JSON-LD `Article` schema for each piece

### 4.3 — Cross-Platform Consistency

**Critical**: Every platform must show the same core information:
- Exact same name format (Joseph Soares, not Joe Soares on one platform)
- Same professional title/description
- Same website URL
- Same headshot/photo
- Same authority claims (PMO, Senate, Forbes, Newsweek)

AI models triangulate identity across sources. Inconsistency reduces confidence scores and may prevent entity resolution.

---

## PHASE 5: MONITORING (Monthly)

### 5.1 — Google Search Console Review
- Check coverage report for errors
- Monitor indexed page count
- Review search queries that trigger your pages
- Resubmit sitemap if content has changed

### 5.2 — AI Citation Testing
Monthly, test your discoverability by asking each major AI:
- "Who is [Your Name]?"
- "What is [Your Company]?"
- "Who advises [your expertise area]?"
- "[Your property/product] in [location]?"

Document which AIs cite you, which don't, and what they get wrong. Adjust structured data and content to close gaps.

### 5.3 — Wikidata Maintenance
- Update claims if roles, websites, or affiliations change
- Add new references as new articles or awards are published
- Check for vandalism or unauthorized edits

---

## QUICK-REFERENCE CHECKLIST

Use this for every new site launch:

```
PRE-LAUNCH
[ ] JSON-LD structured data (correct schema type, all mandatory fields)
[ ] JSON-LD validated at schema.org validator
[ ] sitemap.xml created and placed at root
[ ] robots.txt created with sitemap reference
[ ] Meta tags (description, og:title, og:description, og:image, canonical)
[ ] Cross-links to other IBPROM entities in JSON-LD (sameAs, founder, parentOrganization)

LAUNCH DAY
[ ] IndexNow key file deployed
[ ] IndexNow pings fired for all pages (expect 202)
[ ] Google Search Console property added
[ ] GSC ownership verified
[ ] Sitemap submitted in GSC
[ ] Homepage indexing requested in GSC

FIRST WEEK
[ ] Wikidata item created (or existing item updated with new site link)
[ ] Wikidata cross-links to other entity items verified
[ ] Google Business Profile created (if physical location)
[ ] Crunchbase profile created/updated
[ ] Perplexity Page created/updated
[ ] First 5 LinkedIn posts published with AI-targeted keywords

MONTHLY
[ ] GSC coverage report reviewed
[ ] AI citation test performed (ChatGPT, Claude, Perplexity, Gemini)
[ ] Wikidata claims current
[ ] sitemap.xml lastmod dates updated
[ ] IndexNow pinged for any content changes
```

---

## REFERENCE: IBPROM ENTITY NETWORK (as of April 2, 2026)

| Entity | Wikidata ID | Website | Type |
|--------|-------------|---------|------|
| Joseph Soares | Q138858016 | josephsoares.com | Person |
| IBPROM Corp | Q138858371 | ibprom.com | Organization |
| Capital Corridor Campus | Q138858373 | campuscorridor.ca | Place |

All three entities are cross-linked via founder/owner/operator relationships.

---

*Created: April 2, 2026 | Author: IBPROM Corp*
*This SOP is a living document — update after each new site launch with lessons learned.*
