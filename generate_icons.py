import os
from PIL import Image, ImageDraw

# Ensure public/icons directory exists
os.makedirs('public/icons', exist_ok=True)

# Icon sizes to generate
sizes = [192, 256, 384, 512]

# Colors (gradient effect)
color_start = (59, 130, 246)  # #3B82F6
color_end = (30, 64, 175)     # #1E40AF

for size in sizes:
    # Create image with gradient
    image = Image.new('RGB', (size, size), color_start)
    draw = ImageDraw.Draw(image)
    
    # Draw gradient effect
    for y in range(size):
        ratio = y / size
        r = int(color_start[0] * (1 - ratio) + color_end[0] * ratio)
        g = int(color_start[1] * (1 - ratio) + color_end[1] * ratio)
        b = int(color_start[2] * (1 - ratio) + color_end[2] * ratio)
        draw.rectangle([(0, y), (size, y + 1)], fill=(r, g, b))
    
    # Add white 'M' text in center
    font_size = int(size * 0.6)
    try:
        from PIL import ImageFont
        # Try to load a system font
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except:
        # Fallback to default font
        font = ImageFont.load_default()
    
    bbox = draw.textbbox((0, 0), 'M', font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (size - text_width) // 2
    y = (size - text_height) // 2
    
    draw.text((x, y), 'M', fill=(255, 255, 255), font=font)
    
    # Save icon
    image.save(f'public/icons/icon-{size}x{size}.png')
    print(f'Created icon-{size}x{size}.png')

    # Create maskable version
    image.save(f'public/icons/icon-maskable-{size}x{size}.png')
    print(f'Created icon-maskable-{size}x{size}.png')

# Create apple-touch-icon (180x180)
size = 180
image = Image.new('RGB', (size, size), color_start)
draw = ImageDraw.Draw(image)

for y in range(size):
    ratio = y / size
    r = int(color_start[0] * (1 - ratio) + color_end[0] * ratio)
    g = int(color_start[1] * (1 - ratio) + color_end[1] * ratio)
    b = int(color_start[2] * (1 - ratio) + color_end[2] * ratio)
    draw.rectangle([(0, y), (size, y + 1)], fill=(r, g, b))

image.save('public/icons/apple-touch-icon.png')
print('Created apple-touch-icon.png')

print('All icons generated successfully!')
