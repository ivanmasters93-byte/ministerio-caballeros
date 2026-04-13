/**
 * generate-icons.js
 * Generates PWA PNG icons for Gedeones from scratch using jimp.
 * Run with: node scripts/generate-icons.js
 *
 * Uses only jimp (already a project dependency) — 100% free, no external services.
 */

const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const OUT_DIR = path.join(__dirname, '../public/icons');

// Colors
const BG_COLOR = 0x1e40afff;       // #1e40af (blue)
const SHIELD_COLOR = 0x1e3a8aff;   // #1e3a8a (dark blue)
const GOLD_COLOR = 0xc9a84cff;     // #c9a84c (gold)
const WHITE_COLOR = 0xffffffff;    // white

async function generateIcon(size) {
  const img = new Jimp({ width: size, height: size, color: BG_COLOR });

  // Draw rounded corners by painting corners with transparent
  // (Jimp doesn't have built-in rounded rect, so we approximate with circles at corners)
  const radius = Math.round(size * 0.15);

  // Clear corners to simulate rounded rect background
  for (let y = 0; y < radius; y++) {
    for (let x = 0; x < radius; x++) {
      const dx = radius - x;
      const dy = radius - y;
      if (dx * dx + dy * dy > radius * radius) {
        img.setPixelColor(0x00000000, x, y);
        img.setPixelColor(0x00000000, size - 1 - x, y);
        img.setPixelColor(0x00000000, x, size - 1 - y);
        img.setPixelColor(0x00000000, size - 1 - x, size - 1 - y);
      }
    }
  }

  // Shield - filled polygon approximated as a rectangle + triangle top
  const shieldLeft = Math.round(size * 0.22);
  const shieldRight = Math.round(size * 0.78);
  const shieldTop = Math.round(size * 0.14);
  const shieldBottom = Math.round(size * 0.88);
  const shieldMid = Math.round(size * 0.56); // where sides curve inward

  // Draw shield body (simplified as filled rect)
  for (let y = shieldTop; y <= shieldBottom; y++) {
    // Narrow the shield toward the bottom
    let narrowing = 0;
    if (y > shieldMid) {
      narrowing = Math.round(((y - shieldMid) / (shieldBottom - shieldMid)) * (shieldRight - shieldLeft) * 0.28);
    }
    const left = shieldLeft + narrowing;
    const right = shieldRight - narrowing;
    for (let x = left; x <= right; x++) {
      img.setPixelColor(SHIELD_COLOR, x, y);
    }
  }

  // Gold border around shield (2px)
  const borderW = Math.max(2, Math.round(size * 0.012));
  for (let b = 0; b < borderW; b++) {
    for (let y = shieldTop + b; y <= shieldBottom - b; y++) {
      let narrowing = 0;
      if (y > shieldMid) {
        narrowing = Math.round(((y - shieldMid) / (shieldBottom - shieldMid)) * (shieldRight - shieldLeft) * 0.28);
      }
      const left = shieldLeft + narrowing;
      const right = shieldRight - narrowing;
      if (b === 0 || b === borderW - 1 || y === shieldTop + b || y === shieldBottom - b) {
        img.setPixelColor(GOLD_COLOR, left + b, y);
        img.setPixelColor(GOLD_COLOR, right - b, y);
      }
    }
    // Top and bottom lines
    const topY = shieldTop + b;
    const botY = shieldBottom - b;
    let narrowTop = 0;
    let narrowBot = Math.round(((botY - shieldMid) / (shieldBottom - shieldMid)) * (shieldRight - shieldLeft) * 0.28);
    if (narrowBot < 0) narrowBot = 0;
    for (let x = shieldLeft + narrowTop + b; x <= shieldRight - narrowTop - b; x++) {
      img.setPixelColor(GOLD_COLOR, x, topY);
    }
    for (let x = shieldLeft + narrowBot + b; x <= shieldRight - narrowBot - b; x++) {
      img.setPixelColor(GOLD_COLOR, x, botY);
    }
  }

  // Cross - vertical bar
  const crossW = Math.round(size * 0.10);
  const crossCX = Math.round(size * 0.50);
  const crossTop = Math.round(size * 0.25);
  const crossBottom = Math.round(size * 0.80);
  for (let y = crossTop; y <= crossBottom; y++) {
    for (let x = crossCX - crossW / 2; x <= crossCX + crossW / 2; x++) {
      img.setPixelColor(GOLD_COLOR, Math.round(x), y);
    }
  }

  // Cross - horizontal bar
  const crossBarY = Math.round(size * 0.44);
  const crossBarH = Math.round(size * 0.10);
  const crossBarLeft = Math.round(size * 0.30);
  const crossBarRight = Math.round(size * 0.70);
  for (let y = crossBarY; y <= crossBarY + crossBarH; y++) {
    for (let x = crossBarLeft; x <= crossBarRight; x++) {
      img.setPixelColor(GOLD_COLOR, x, y);
    }
  }

  const outPath = path.join(OUT_DIR, `icon-${size}x${size}.png`);
  await img.write(outPath);
  console.log(`Generated: icon-${size}x${size}.png`);
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log('Generating Gedeones PWA icons...');
  for (const size of SIZES) {
    await generateIcon(size);
  }
  console.log('All icons generated successfully.');
}

main().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
