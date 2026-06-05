/**
 * optimize-images.js — Auto-scan and generate responsive srcset variants for heavy images.
 *
 * Scans directories recursively for WebP images.
 * Files are optimized incrementally: if the original backup file is newer than the source,
 * it is skipped. New source files (> 150KB) are backed up and variants (400w, 800w, 1200w)
 * are generated at quality 95.
 *
 * Usage:
 *   node scripts/optimize-images.js             # Scan all images
 *   node scripts/optimize-images.js public/images/about  # Scan specific folder
 */

import sharp from 'sharp';
import { copyFileSync, existsSync, readdirSync, statSync, utimesSync, writeFileSync } from 'node:fs';
import { join, dirname, basename, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const IMAGES_DIR = join(ROOT, 'public', 'images');

const WIDTHS = [400, 800, 1200];
const QUALITY = 95;

/**
 * Recursively find all source .webp images.
 * Excludes generated variants (-400w, -800w, -1200w) and backup files (.original.webp).
 */
function findImages(dir, results = []) {
  if (!existsSync(dir)) return results;

  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      findImages(fullPath, results);
    } else if (entry.endsWith('.webp')) {
      const isVariant = entry.includes('-400w.webp') ||
                        entry.includes('-800w.webp') ||
                        entry.includes('-1200w.webp') ||
                        entry.endsWith('.original.webp');

      if (!isVariant) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

async function processImage(srcPath) {
  const relPath = relative(IMAGES_DIR, srcPath);
  const dir = dirname(srcPath);
  const name = basename(srcPath, extname(srcPath));
  const originalBackup = join(dir, `${name}.original.webp`);

  const stat = statSync(srcPath);
  const sizeKB = stat.size / 1024;

  // Incremental Build Check:
  // If we already have a backup, compare modification times.
  if (existsSync(originalBackup)) {
    const backupStat = statSync(originalBackup);
    // Use a 10ms tolerance to bypass sub-millisecond APFS filesystem timestamp truncation in Node.js
    if (backupStat.mtimeMs >= stat.mtimeMs - 10) {
      console.log(`  [SKIP] ${relPath} — already optimized`);
      return;
    }
    console.log(`  [RE-OPTIMIZING] ${relPath} — source image was updated`);
  } else {
    // If no backup exists, check size threshold (> 100KB) unless it's in the about folder
    const isAboutImage = srcPath.includes('/about/') || srcPath.includes('\\about\\');
    if (sizeKB < 100 && !isAboutImage) {
      console.log(`  [SKIP] ${relPath} — size (${sizeKB.toFixed(1)} KB) is under threshold`);
      return;
    }
    console.log(`  [OPTIMIZING] ${relPath} — size: ${sizeKB.toFixed(1)} KB`);
  }

  // Backup raw original
  copyFileSync(srcPath, originalBackup);
  console.log(`  [BACKUP] Created ${name}.original.webp`);

  const metadata = await sharp(originalBackup).metadata();
  const srcWidth = metadata.width || 1200;

  for (const width of WIDTHS) {
    if (width > srcWidth * 1.1) {
      console.log(`  [SKIP] ${name}-${width}w.webp — source is only ${srcWidth}px wide`);
      continue;
    }

    const outPath = join(dir, `${name}-${width}w.webp`);
    await sharp(originalBackup)
      .resize({ width, withoutEnlargement: false })
      .webp({ quality: QUALITY })
      .toFile(outPath);
    console.log(`  [GENERATED] ${name}-${width}w.webp`);
  }

  // Re-compress the default image at max width (1200px)
  const tmpPath = join(dir, `${name}.tmp.webp`);
  await sharp(originalBackup)
    .resize({ width: Math.min(srcWidth, 1200), withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(tmpPath);

  // Replace default WebP with compressed one
  copyFileSync(tmpPath, srcPath);
  const { unlink } = await import('node:fs/promises');
  await unlink(tmpPath);
  
  // Synchronize backup file's modification time exactly with the optimized file's modification time
  const finalStat = statSync(srcPath);
  utimesSync(originalBackup, finalStat.atime, finalStat.mtime);
  console.log(`  [RECOMPRESSED] ${name}.webp at q${QUALITY}`);
}

async function main() {
  const args = process.argv.slice(2);
  let targetDir = IMAGES_DIR;

  if (args.length > 0) {
    targetDir = join(ROOT, args[0]);
    console.log(`[optimize-images] Targeting custom path: ${targetDir}`);
  } else {
    console.log(`[optimize-images] Auto-scanning: ${IMAGES_DIR}`);
  }

  const images = findImages(targetDir);
  console.log(`[optimize-images] Found ${images.length} candidate(s) for optimization.`);
  console.log(`[optimize-images] Widths: ${WIDTHS.join(', ')}px | Quality: ${QUALITY}\n`);

  for (const img of images) {
    console.log(`Processing: ${relative(IMAGES_DIR, img)}`);
    try {
      await processImage(img);
    } catch (err) {
      console.error(`  [ERROR] Failed to process ${relative(IMAGES_DIR, img)}:`, err.message);
    }
    console.log('');
  }

  // Generate the optimized images manifest
  try {
    generateManifest();
  } catch (err) {
    console.error('[optimize-images] Failed to generate manifest:', err.message);
  }

  console.log('[optimize-images] Run complete.');
}

function generateManifest() {
  const allImages = findImages(IMAGES_DIR);
  const manifestData = {};
  
  for (const img of allImages) {
    const dir = dirname(img);
    const name = basename(img, extname(img));
    const availableWidths = [];
    
    for (const w of WIDTHS) {
      const variantPath = join(dir, `${name}-${w}w.webp`);
      if (existsSync(variantPath)) {
        availableWidths.push(w);
      }
    }
    
    if (availableWidths.length > 0) {
      const relPath = relative(IMAGES_DIR, img);
      const publicRelPath = join('images', relPath).replace(/\\/g, '/');
      manifestData[publicRelPath] = availableWidths;
    }
  }

  const manifestPath = join(ROOT, 'src', 'app', 'pages', 'optimized-images.ts');
  const content = `// This file is auto-generated by scripts/optimize-images.js. Do not edit manually.
export const OPTIMIZED_IMAGES: Record<string, number[]> = {
${Object.entries(manifestData)
  .map(([path, widths]) => `  '${path}': [${widths.join(', ')}]`)
  .join(',\n')}
};
`;

  writeFileSync(manifestPath, content, 'utf-8');
  console.log(`[optimize-images] Wrote manifest of ${Object.keys(manifestData).length} optimized images to \${manifestPath}`);
}

main().catch(console.error);
