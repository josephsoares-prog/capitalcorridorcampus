import re
import os

files_to_update = [
    'index.html',
    '191-promenade-du-portage.html',
    'virtual-office.html',
    'flex-space.html',
    'terms.html',
    'cookies.html',
    'thank-you.html',
    'corridor.html',
    'josephsoares_index_updated.html'
]

def update_footer(filepath):
    """Update footer in a file with the required changes"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # 1. Change "Terms of Service" to "Terms of Use"
    content = re.sub(
        r'Terms of Service',
        'Terms of Use',
        content
    )
    
    # 2. Fix "IBPROM Society" to "IBPROM Corp" (if present)
    content = re.sub(
        r'IBPROM Society',
        'IBPROM Corp',
        content
    )
    
    # 3. Add Privacy Policy link next to Terms and Cookies links
    # Look for the pattern with Terms and Cookies links in the footer-col
    # Pattern: <a href="/terms.html"...>Terms of Use</a> ... <a href="/cookies.html"...>Cookies Policy</a>
    # Add Privacy Policy after Cookies Policy
    
    # First, find and replace the cookies link section to include privacy policy
    pattern = r'(<li><a href="/cookies.html"[^>]*>Cookies Policy</a></li>)'
    replacement = r'\1\n                    <li><a href="/privacy.html" data-en="Privacy Policy" data-fr="Politique de confidentialité">Privacy Policy</a></li>'
    content = re.sub(pattern, replacement, content)
    
    # 4. Add legal links row in footer-bottom ABOVE the copyright line
    # Look for the footer-bottom div and add the legal links before the copyright
    pattern = r'(<div class="footer-bottom">\s*)(<p data-en="&copy;)'
    legal_links = r'\1<p style="margin-bottom: 1rem; font-size: 0.85rem;"><a href="/terms.html" style="color: var(--gold); text-decoration: none;">Terms of Use</a> | <a href="/privacy.html" style="color: var(--gold); text-decoration: none;">Privacy Policy</a> | <a href="/cookies.html" style="color: var(--gold); text-decoration: none;">Cookies Policy</a></p>\n            \2'
    content = re.sub(pattern, legal_links, content)
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

# Update all files
for filepath in files_to_update:
    full_path = os.path.join(os.getcwd(), filepath)
    if os.path.exists(full_path):
        if update_footer(full_path):
            print(f"✓ Updated {filepath}")
        else:
            print(f"- No changes needed for {filepath}")
    else:
        print(f"✗ File not found: {filepath}")

