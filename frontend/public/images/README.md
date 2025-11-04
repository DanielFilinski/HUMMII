# Image Assets Directory

This directory contains all image assets for the Hummii landing page.

## Directory Structure

```
images/
├── categories/       # Category card images (305x305px recommended)
│   ├── cleaning.jpg
│   ├── repairs.jpg
│   ├── childcare.jpg
│   └── food.jpg
├── contractors/      # Contractor avatar images (150x150px, circular)
│   └── [placeholder avatars]
├── banners/          # Hero section and CTA banners
│   ├── hero-bg.jpg
│   ├── post-task.jpg
│   └── become-contractor.jpg
└── icons/            # UI icons and checkmarks
    ├── checkmark.svg
    └── arrow.svg
```

## Image Requirements

### Category Images
- **Size**: 305x305px (or larger for retina displays)
- **Format**: JPG or WebP
- **Optimization**: Compressed for web

### Contractor Avatars
- **Size**: 150x150px (circular)
- **Format**: JPG or WebP
- **Aspect Ratio**: 1:1

### Banner Images
- **Hero Background**: 1920x300px
- **Post Task CTA**: 750x450px
- **Become Contractor CTA**: 750x450px
- **Format**: JPG or WebP

### Icons
- **Format**: SVG (preferred) or PNG
- **Size**: Variable, should be scalable

## Current Status

All images are currently using placeholder URLs from Figma.
Replace with actual optimized images before production deployment.

## Notes

- Use Next.js Image component for all images
- Provide alt text for accessibility
- Consider using WebP format for better compression
- Store original high-resolution images separately


