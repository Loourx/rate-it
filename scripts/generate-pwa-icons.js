// scripts/generate-pwa-icons.js
// One-time PWA icon generation script. Run with: node scripts/generate-pwa-icons.js
// Safe to delete after running. Source: assets/icon.png

const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

const SOURCE = path.join(__dirname, '../assets/icon.png');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const BACKGROUND_COLOR = 0x0a0a0aff; // Negro oscuro — fondo de Rate.

async function generateIcons() {
  const source = await Jimp.read(SOURCE);
  console.log(`Source loaded: ${source.bitmap.width}x${source.bitmap.height}`);

  // Standard icons (opaque background)
  const standardSizes = [
    { size: 192, name: 'icon-192.png' },
    { size: 512, name: 'icon-512.png' },
    { size: 180, name: 'apple-touch-icon.png' },
  ];

  for (const { size, name } of standardSizes) {
    const img = source.clone().resize({ w: size, h: size });
    const bg = new Jimp({ width: size, height: size, color: BACKGROUND_COLOR });
    bg.composite(img, 0, 0);
    await bg.write(path.join(OUTPUT_DIR, name));
    console.log(`✓ Generated ${name} (${size}x${size})`);
  }

  // Maskable icons (safe zone = inner 75% of canvas, 12.5% padding each side)
  const maskableSizes = [
    { size: 192, name: 'icon-maskable-192.png' },
    { size: 512, name: 'icon-maskable-512.png' },
  ];

  for (const { size, name } of maskableSizes) {
    const padding = Math.round(size * 0.125);
    const innerSize = size - padding * 2;
    const inner = source.clone().resize({ w: innerSize, h: innerSize });
    const bg = new Jimp({ width: size, height: size, color: BACKGROUND_COLOR });
    bg.composite(inner, padding, padding);
    await bg.write(path.join(OUTPUT_DIR, name));
    console.log(`✓ Generated ${name} (${size}x${size}, inner: ${innerSize}x${innerSize})`);
  }

  console.log('\nDone. Files in public/icons/:');
  fs.readdirSync(OUTPUT_DIR).forEach(f => {
    const stats = fs.statSync(path.join(OUTPUT_DIR, f));
    console.log(`  ${f} — ${stats.size} bytes`);
  });
}

generateIcons().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
