import re
import os

files_to_check = [
    'virtual-office.html',
    'flex-space.html',
    'terms.html',
    'cookies.html',
    'thank-you.html'
]

base_path = '/sessions/blissful-intelligent-wozniak/mnt/Documents/Claude/Projects/Capital_Corridor_Campus/'

for filepath in files_to_check:
    full_path = os.path.join(base_path, filepath)
    if not os.path.exists(full_path):
        continue
    
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Pattern 1: <a href="/cookies.html">Cookies Policy</a> at end of a footer line
    # Replace with the same plus privacy policy before it
    pattern1 = r'(<a href="/terms\.html"[^>]*>Terms of Use</a>)\s*\|\s*(<a href="/cookies\.html"[^>]*>Cookies Policy</a>)'
    replacement1 = r'\1 | <a href="/privacy.html">Privacy Policy</a> | \2'
    content = re.sub(pattern1, replacement1, content)
    
    # Pattern 2: With data attributes
    pattern2 = r'(<a href="/terms\.html"[^>]*data-en="Terms of Use"[^>]*>Terms of Use</a>)\s*\|\s*(<a href="/cookies\.html"[^>]*>Cookies Policy</a>)'
    replacement2 = r'\1 | <a href="/privacy.html" data-en="Privacy Policy" data-fr="Politique de confidentialité">Privacy Policy</a> | \2'
    content = re.sub(pattern2, replacement2, content)
    
    # Pattern 3: With more complex data attributes on cookies link
    pattern3 = r'(<a href="/terms\.html"[^>]*>Terms of Use</a>)\s*\|\s*(<a href="/cookies\.html"[^>]*data-[^>]*>Cookies Policy</a>)'
    replacement3 = r'\1 | <a href="/privacy.html">Privacy Policy</a> | \2'
    content = re.sub(pattern3, replacement3, content)
    
    if content != original_content:
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ Updated {filepath}")
    else:
        print(f"- No changes for {filepath}")

