import os
from PIL import Image, ImageDraw, ImageFont

os.makedirs('assets/images', exist_ok=True)

def create_cyber_icon(size):
    img = Image.new('RGBA', (size, size), (7, 9, 14, 255))
    draw = ImageDraw.Draw(img)
    
    center = size / 2
    r_outer = size * 0.44
    r_inner = size * 0.32
    r_core = size * 0.16
    
    # Outer HUD Ring
    draw.ellipse([center - r_outer, center - r_outer, center + r_outer, center + r_outer],
                 outline=(0, 255, 200, 220), width=max(2, int(size * 0.035)))
                 
    # Ticks at 0, 90, 180, 270 deg
    tick_len = size * 0.08
    w = max(2, int(size * 0.03))
    draw.line([center, center - r_outer - tick_len * 0.4, center, center - r_outer + tick_len * 0.6], fill=(0, 255, 200, 255), width=w)
    draw.line([center, center + r_outer - tick_len * 0.6, center, center + r_outer + tick_len * 0.4], fill=(0, 255, 200, 255), width=w)
    draw.line([center - r_outer - tick_len * 0.4, center, center - r_outer + tick_len * 0.6, center], fill=(0, 255, 200, 255), width=w)
    draw.line([center + r_outer - tick_len * 0.6, center, center + r_outer + tick_len * 0.4, center], fill=(0, 255, 200, 255), width=w)
    
    # Orbit Ellipse
    orbit_box = [center - r_outer * 1.05, center - r_outer * 0.5, center + r_outer * 1.05, center + r_outer * 0.5]
    draw.arc(orbit_box, 190, 350, fill=(255, 184, 0, 240), width=max(2, int(size * 0.03)))
    draw.arc(orbit_box, 10, 170, fill=(255, 184, 0, 120), width=max(1, int(size * 0.02)))
    
    # Inner Reticle Ring
    draw.ellipse([center - r_inner, center - r_inner, center + r_inner, center + r_inner],
                 outline=(0, 192, 255, 160), width=max(1, int(size * 0.02)))
                 
    # Core Eye Lens / Satellite Pupil (Cyber Red Aperture)
    draw.ellipse([center - r_core, center - r_core, center + r_core, center + r_core],
                 fill=(255, 42, 85, 255), outline=(255, 255, 255, 220), width=max(1, int(size * 0.02)))
                 
    # Center pinpoint glint
    p_size = max(1, int(size * 0.04))
    draw.ellipse([center - p_size, center - p_size, center + p_size, center + p_size],
                 fill=(255, 255, 255, 255))
                 
    # Satellite blip on orbit
    sat_x = center + r_outer * 0.8
    sat_y = center - r_outer * 0.28
    sat_r = max(3, int(size * 0.05))
    draw.ellipse([sat_x - sat_r, sat_y - sat_r, sat_x + sat_r, sat_y + sat_r],
                 fill=(255, 184, 0, 255), outline=(7, 9, 14, 255), width=max(1, int(size * 0.015)))
                 
    return img

print("Generating icons...")
# Generate icons
icon_512 = create_cyber_icon(512)
icon_512.save('assets/images/icon-512.png')

icon_192 = create_cyber_icon(192)
icon_192.save('assets/images/icon-192.png')

icon_180 = create_cyber_icon(180)
icon_180.save('apple-touch-icon.png')
icon_180.save('assets/images/apple-touch-icon.png')

icon_32 = create_cyber_icon(32)
icon_32.save('favicon-32x32.png')

icon_16 = create_cyber_icon(16)
icon_16.save('favicon-16x16.png')

# Generate multi-size favicon.ico
icon_512.save('favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

# Generate SVG favicon
svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="24" fill="#07090e" />
  <circle cx="64" cy="64" r="48" fill="none" stroke="#00ffc8" stroke-width="4" opacity="0.85" />
  <ellipse cx="64" cy="64" rx="54" ry="22" fill="none" stroke="#ffb800" stroke-width="3" stroke-dasharray="6,3" transform="rotate(-20 64 64)" />
  <circle cx="64" cy="64" r="28" fill="#0c1322" stroke="#00c0ff" stroke-width="2" />
  <circle cx="64" cy="64" r="14" fill="#ff2a55" />
  <circle cx="64" cy="64" r="5" fill="#ffffff" />
  <line x1="64" y1="10" x2="64" y2="22" stroke="#00ffc8" stroke-width="3" />
  <line x1="64" y1="106" x2="64" y2="118" stroke="#00ffc8" stroke-width="3" />
  <line x1="10" y1="64" x2="22" y2="64" stroke="#00ffc8" stroke-width="3" />
  <line x1="106" y1="64" x2="118" y2="64" stroke="#00ffc8" stroke-width="3" />
  <circle cx="102" cy="44" r="6" fill="#ffb800" stroke="#07090e" stroke-width="2" />
</svg>'''
with open('favicon.svg', 'w', encoding='utf-8') as f:
    f.write(svg_content)

# Generate Open Graph Social Preview Card (1200x630)
og_img = Image.new('RGB', (1200, 630), (7, 9, 14))
og_draw = ImageDraw.Draw(og_img)

# Cyber Grid lines
for x in range(0, 1200, 50):
    og_draw.line([(x, 0), (x, 630)], fill=(0, 255, 200, 15), width=1)
for y in range(0, 630, 50):
    og_draw.line([(0, y), (1200, y)], fill=(0, 255, 200, 15), width=1)
    
# Outer cyan frame
og_draw.rectangle([(25, 25), (1175, 605)], outline=(0, 255, 200, 120), width=2)
# Reticle corners
c_len = 30
og_draw.line([(25, 25 + c_len), (25, 25), (25 + c_len, 25)], fill=(0, 255, 200), width=4)
og_draw.line([(1175 - c_len, 25), (1175, 25), (1175, 25 + c_len)], fill=(0, 255, 200), width=4)
og_draw.line([(25, 605 - c_len), (25, 605), (25 + c_len, 605)], fill=(0, 255, 200), width=4)
og_draw.line([(1175 - c_len, 605), (1175, 605), (1175, 605 - c_len)], fill=(0, 255, 200), width=4)

# Paste emblem
emblem = create_cyber_icon(360)
og_img.paste(emblem, (740, 135), emblem)

og_img.save('assets/images/og-preview.png', quality=95)
print('All icons generated successfully!')
