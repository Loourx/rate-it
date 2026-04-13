// scripts/patch-pwa-html.js
// Post-export patcher: injects PWA tags into dist/index.html
// Run via: npm run web:build (expo export + this script)
// Safe to run multiple times — checks for existing tags before injecting.

const fs = require('fs');
const path = require('path');

const INDEX_PATH = path.join(__dirname, '../dist/index.html');

if (!fs.existsSync(INDEX_PATH)) {
  console.error('ERROR: dist/index.html not found. Run expo export --platform web first.');
  process.exit(1);
}

let html = fs.readFileSync(INDEX_PATH, 'utf8');

// Guard: do not inject twice
if (html.includes('rel="manifest"')) {
  console.log('PWA tags already present in dist/index.html — skipping.');
  process.exit(0);
}

const PWA_TAGS = `
  <!-- PWA: manifest link (Android installability) -->
  <link rel="manifest" href="/manifest.json" />
  <!-- PWA: iOS Safari standalone mode -->
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Rate." />
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />`;

if (!html.includes('</head>')) {
  console.error('ERROR: </head> closing tag not found in dist/index.html.');
  process.exit(1);
}

html = html.replace('</head>', PWA_TAGS + '\n</head>');
fs.writeFileSync(INDEX_PATH, html, 'utf8');

console.log('✓ PWA tags injected into dist/index.html');
console.log('  Added: <link rel="manifest">');
console.log('  Added: apple-mobile-web-app-capable');
console.log('  Added: apple-mobile-web-app-status-bar-style');
console.log('  Added: apple-mobile-web-app-title');
console.log('  Added: apple-touch-icon');

// Verify
const result = fs.readFileSync(INDEX_PATH, 'utf8');
const checks = [
  ['manifest link', 'rel="manifest"'],
  ['apple-capable', 'apple-mobile-web-app-capable'],
  ['apple-status-bar', 'apple-mobile-web-app-status-bar-style'],
  ['apple-title', 'apple-mobile-web-app-title'],
  ['apple-touch-icon', 'apple-touch-icon'],
];

console.log('\nVerification:');
let allOk = true;
for (const [label, token] of checks) {
  const ok = result.includes(token);
  console.log(`  ${ok ? '✓' : '✗'} ${label}`);
  if (!ok) allOk = false;
}

if (!allOk) {
  console.error('\nERROR: Some tags were not injected correctly.');
  process.exit(1);
}

console.log('\nAll PWA tags verified OK.');
