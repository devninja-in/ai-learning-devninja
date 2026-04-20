# Public Directory

Static assets for the AI learning platform.

## Asset Structure

```
/public
├── images/            # Images, diagrams, and illustrations
├── icons/             # SVG icons and favicons
├── fonts/             # Custom fonts (if needed)
├── data/              # Static data files (JSON, CSV)
└── docs/              # Downloadable resources
```

## Asset Guidelines
- **Images**: Optimized for web (WebP, AVIF when supported)
- **Icons**: SVG format for scalability and theming
- **Accessibility**: Alt text, proper contrast ratios
- **Performance**: Compressed and appropriately sized
- **Responsive**: Multiple sizes for different screen densities

## File Naming Convention
- Use kebab-case for filenames
- Include descriptive names
- Add size indicators for images (e.g., `logo-256x256.png`)
- Version assets when necessary (e.g., `diagram-v2.svg`)

Assets will be optimized based on the chosen framework's asset handling capabilities.