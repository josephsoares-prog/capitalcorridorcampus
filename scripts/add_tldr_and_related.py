#!/usr/bin/env python3
"""
Batch-enhance CCC blog articles: add TLDR block at top and Related Insights block at bottom.

- TLDR: pulled from existing <meta name="description"> content. Gives LLMs a self-contained
  answer in the first 200 words — biggest lever for Perplexity/ChatGPT/Claude citation rate.
- Related Insights: 3 randomly-selected articles of same detected language, linked at bottom.
  Builds internal link surface area (big SEO lift; compounds with content moat).

Idempotent: checks for marker classes before injecting, skips if already done.
Language detection: simple heuristic on HTML lang attribute + French pronoun/article presence.
"""

import os
import re
import random
from pathlib import Path

BLOG_DIR = Path(__file__).parent.parent / "blog"
TLDR_MARKER = 'class="ccc-tldr"'
RELATED_MARKER = 'class="ccc-related"'

# French keyword markers for language detection
FR_MARKERS = [r'\blang="fr"', r'\bPerspectives</a>', r'\bAccueil</a>', r'"headline":\s*"L[\'](']
EN_MARKERS = [r'\blang="en"', r'\bInsights</a>', r'\bHome</a>']

TLDR_TEMPLATE_EN = '''
        <div class="ccc-tldr" style="background:#f6f8fb;border-left:4px solid #0C3F6B;padding:18px 22px;margin:24px 0 32px;border-radius:6px;">
            <div style="font-size:11px;letter-spacing:1.2px;color:#0C3F6B;font-weight:600;margin-bottom:8px;">TL;DR</div>
            <p style="margin:0;font-size:16px;line-height:1.55;color:#1a2333;">{summary}</p>
        </div>
'''

TLDR_TEMPLATE_FR = '''
        <div class="ccc-tldr" style="background:#f6f8fb;border-left:4px solid #0C3F6B;padding:18px 22px;margin:24px 0 32px;border-radius:6px;">
            <div style="font-size:11px;letter-spacing:1.2px;color:#0C3F6B;font-weight:600;margin-bottom:8px;">EN BREF</div>
            <p style="margin:0;font-size:16px;line-height:1.55;color:#1a2333;">{summary}</p>
        </div>
'''

RELATED_TEMPLATE_EN = '''
        <aside class="ccc-related" style="margin:56px 0 16px;padding:28px 0 8px;border-top:1px solid #e5e9f0;">
            <h3 style="font-size:13px;letter-spacing:1.5px;text-transform:uppercase;color:#0C3F6B;margin:0 0 20px;font-weight:600;">Related Insights</h3>
            <ul style="list-style:none;padding:0;margin:0;">
{items}
            </ul>
        </aside>
'''

RELATED_TEMPLATE_FR = '''
        <aside class="ccc-related" style="margin:56px 0 16px;padding:28px 0 8px;border-top:1px solid #e5e9f0;">
            <h3 style="font-size:13px;letter-spacing:1.5px;text-transform:uppercase;color:#0C3F6B;margin:0 0 20px;font-weight:600;">Perspectives connexes</h3>
            <ul style="list-style:none;padding:0;margin:0;">
{items}
            </ul>
        </aside>
'''

RELATED_ITEM_TEMPLATE = '''                <li style="margin:0 0 14px;"><a href="{href}" style="color:#0C3F6B;text-decoration:none;font-weight:500;">{title}</a></li>
'''


def detect_language(html: str) -> str:
    """Return 'fr' or 'en' based on HTML lang attribute or content markers."""
    # Primary signal: html lang attribute
    lang_match = re.search(r'<html\s+lang=["\']([a-z]{2})["\']', html, re.IGNORECASE)
    if lang_match:
        return lang_match.group(1).lower()
    # Fallback: check French-specific breadcrumb text
    if 'Accueil</a>' in html or 'Perspectives</a>' in html:
        return 'fr'
    return 'en'


def extract_meta_description(html: str) -> str | None:
    """Pull meta description content. Returns None if missing."""
    match = re.search(
        r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)["\']',
        html,
        re.IGNORECASE
    )
    return match.group(1).strip() if match else None


def extract_article_title(html: str, path: Path) -> str:
    """Pull <title> or filename-derived title."""
    match = re.search(r'<title>([^<]+)</title>', html, re.IGNORECASE)
    if match:
        title = match.group(1).strip()
        # Strip site name suffix if present
        for sep in [' | ', ' — ', ' – ']:
            if sep in title:
                title = title.split(sep)[0].strip()
        return title
    # Fallback: filename humanized
    return path.stem.replace('-', ' ').title()


def load_all_articles(blog_dir: Path) -> list[dict]:
    """Inventory all blog HTML files with metadata for relatedness selection."""
    articles = []
    for path in sorted(blog_dir.glob('*.html')):
        if path.name == 'index.html':
            continue
        try:
            html = path.read_text(encoding='utf-8', errors='ignore')
        except Exception:
            continue
        articles.append({
            'path': path,
            'filename': path.name,
            'lang': detect_language(html),
            'title': extract_article_title(html, path),
            'description': extract_meta_description(html) or '',
        })
    return articles


def already_has_tldr(html: str) -> bool:
    return TLDR_MARKER in html


def already_has_related(html: str) -> bool:
    return RELATED_MARKER in html


def inject_tldr(html: str, lang: str, summary: str) -> str:
    """Insert TLDR block after <h1 class="article-title">...</h1>. Falls back to after article-subtitle."""
    if not summary:
        return html
    tldr = TLDR_TEMPLATE_FR.format(summary=summary) if lang == 'fr' else TLDR_TEMPLATE_EN.format(summary=summary)
    # Prefer insertion after article-subtitle if present (preserves visual hierarchy)
    pattern_subtitle = re.compile(
        r'(<p\s+class="article-subtitle"[^>]*>.*?</p>)',
        re.IGNORECASE | re.DOTALL
    )
    if pattern_subtitle.search(html):
        return pattern_subtitle.sub(lambda m: m.group(1) + tldr, html, count=1)
    # Fallback: after h1 article-title
    pattern_h1 = re.compile(
        r'(<h1\s+class="article-title"[^>]*>.*?</h1>)',
        re.IGNORECASE | re.DOTALL
    )
    if pattern_h1.search(html):
        return pattern_h1.sub(lambda m: m.group(1) + tldr, html, count=1)
    return html  # skip if no anchor found


def inject_related(html: str, lang: str, related_articles: list[dict]) -> str:
    """Insert Related Insights block before </article>."""
    items = ''.join(
        RELATED_ITEM_TEMPLATE.format(
            href=a['filename'],
            title=a['title'].replace('"', '&quot;')
        )
        for a in related_articles
    )
    related_block = (RELATED_TEMPLATE_FR if lang == 'fr' else RELATED_TEMPLATE_EN).format(items=items)
    # Insert before </article>
    if '</article>' in html:
        return html.replace('</article>', related_block + '\n    </article>', 1)
    return html


def pick_related(all_articles: list[dict], current: dict, count: int = 3) -> list[dict]:
    """Pick N random same-language articles, excluding the current one."""
    pool = [a for a in all_articles if a['lang'] == current['lang'] and a['filename'] != current['filename']]
    if len(pool) <= count:
        return pool
    return random.sample(pool, count)


def process_article(article: dict, all_articles: list[dict]) -> dict:
    """Apply TLDR + Related to one article. Returns action record."""
    html = article['path'].read_text(encoding='utf-8', errors='ignore')
    original_len = len(html)
    actions = []

    if not already_has_tldr(html) and article['description']:
        new_html = inject_tldr(html, article['lang'], article['description'])
        if new_html != html:
            html = new_html
            actions.append('tldr')

    if not already_has_related(html):
        related = pick_related(all_articles, article, count=3)
        if related:
            new_html = inject_related(html, article['lang'], related)
            if new_html != html:
                html = new_html
                actions.append('related')

    if actions:
        article['path'].write_text(html, encoding='utf-8')

    return {
        'file': article['filename'],
        'lang': article['lang'],
        'actions': actions,
        'size_delta': len(html) - original_len,
    }


def main() -> None:
    random.seed(42)  # deterministic related-article selection
    articles = load_all_articles(BLOG_DIR)
    print(f'Found {len(articles)} articles in {BLOG_DIR}')
    lang_counts = {}
    for a in articles:
        lang_counts[a['lang']] = lang_counts.get(a['lang'], 0) + 1
    print(f'Language mix: {lang_counts}')

    stats = {'tldr': 0, 'related': 0, 'skipped': 0, 'no_meta': 0}
    for article in articles:
        result = process_article(article, articles)
        if 'tldr' in result['actions']:
            stats['tldr'] += 1
        if 'related' in result['actions']:
            stats['related'] += 1
        if not result['actions']:
            stats['skipped'] += 1
        if not article['description']:
            stats['no_meta'] += 1

    print(f'\nResults:')
    print(f'  TLDR injected: {stats["tldr"]}')
    print(f'  Related injected: {stats["related"]}')
    print(f'  Already had both or skipped: {stats["skipped"]}')
    print(f'  Missing meta description (no TLDR source): {stats["no_meta"]}')


if __name__ == '__main__':
    main()
