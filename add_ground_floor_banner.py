import os

filepath = '/sessions/blissful-intelligent-wozniak/mnt/Documents/Claude/Projects/Capital_Corridor_Campus/179-promenade-du-portage.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# The banner HTML to insert
banner = '''<section style="background: linear-gradient(135deg, #111827 0%, #1A2236 100%); border: 1px solid rgba(198, 162, 90, 0.3); padding: 2rem; margin: 2rem auto; max-width: 1200px; text-align: center;">
    <p style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; color: #C6A25A; margin-bottom: 0.5rem; font-weight: 600;">New Listing</p>
    <h3 style="font-family: 'Playfair Display', serif; font-size: 1.5rem; color: #F5F3EE; margin-bottom: 0.75rem;">Ground Floor — Street-Level Commercial Space</h3>
    <p style="color: #C9C5BD; margin-bottom: 1rem;">~1,200 sq ft of turnkey street-level space at $4,800/month all-inclusive. Previously operated as a high-end salon. Immediate availability.</p>
    <a href="/179-ground-floor.html" style="display: inline-block; padding: 0.75rem 1.5rem; border: 2px solid #C6A25A; color: #C6A25A; text-decoration: none; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em;">View Listing →</a>
</section>

            '''

# Find the position to insert (right before <div class="floors-grid">)
search_string = '            <div class="floors-grid">'
if search_string in content:
    # Insert the banner before the floors-grid
    new_content = content.replace(search_string, banner + search_string)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("✓ Added 'New Listing' banner to 179-promenade-du-portage.html")
else:
    print("✗ Could not find the insertion point")

