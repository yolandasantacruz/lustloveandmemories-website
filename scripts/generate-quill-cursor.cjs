const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processQuill() {
  const inputPath = '/Users/yolanda/.gemini/antigravity-ide/brain/8480f849-5e02-4c83-9b3b-dd82aaa96835/.user_uploaded/media_1792104042320.png';
  const outDir = path.resolve(__dirname, '../public/images');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  const outputData = Buffer.alloc(width * height * 4);

  let minX = width, maxX = 0, minY = height, maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      let alpha = 0;
      if (lum < 195) {
        if (lum <= 50) {
          alpha = 255;
        } else {
          alpha = Math.round(255 * (1 - (lum - 50) / (195 - 50)));
        }
      }

      const outIdx = (y * width + x) * 4;
      if (alpha > 15) {
        outputData[outIdx] = 20;     // ink #141312
        outputData[outIdx + 1] = 19;
        outputData[outIdx + 2] = 18;
        outputData[outIdx + 3] = alpha;

        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      } else {
        outputData[outIdx] = 0;
        outputData[outIdx + 1] = 0;
        outputData[outIdx + 2] = 0;
        outputData[outIdx + 3] = 0;
      }
    }
  }

  console.log(`Bounding box: x[${minX}, ${maxX}] y[${minY}, ${maxY}] (W: ${maxX - minX + 1}, H: ${maxY - minY + 1})`);

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;

  // Extract cropped region into a new RGBA buffer
  const croppedData = Buffer.alloc(cropW * cropH * 4);
  for (let cy = 0; cy < cropH; cy++) {
    const srcY = minY + cy;
    for (let cx = 0; cx < cropW; cx++) {
      const srcX = minX + cx;
      const srcIdx = (srcY * width + srcX) * 4;
      const dstIdx = (cy * cropW + cx) * 4;
      croppedData[dstIdx] = outputData[srcIdx];
      croppedData[dstIdx + 1] = outputData[srcIdx + 1];
      croppedData[dstIdx + 2] = outputData[srcIdx + 2];
      croppedData[dstIdx + 3] = outputData[srcIdx + 3];
    }
  }

  // Target sizes:
  // Cursor size ~38px height
  const cursorImg = await sharp(croppedData, {
    raw: { width: cropW, height: cropH, channels: 4 }
  })
    .resize({ height: 38, fit: 'inside' })
    .png()
    .toBuffer({ resolveWithObject: true });

  const finalOutPath = path.join(outDir, 'quill-cursor.png');
  fs.writeFileSync(finalOutPath, cursorImg.data);
  console.log(`Saved cursor: ${finalOutPath} (${cursorImg.info.width}x${cursorImg.info.height})`);

  // Retina 2x cursor ~76px height
  const retinaCursor = await sharp(croppedData, {
    raw: { width: cropW, height: cropH, channels: 4 }
  })
    .resize({ height: 76, fit: 'inside' })
    .png()
    .toBuffer({ resolveWithObject: true });

  const retinaOutPath = path.join(outDir, 'quill-cursor@2x.png');
  fs.writeFileSync(retinaOutPath, retinaCursor.data);
  console.log(`Saved retina cursor: ${retinaOutPath} (${retinaCursor.info.width}x${retinaCursor.info.height})`);
}

processQuill().catch(err => {
  console.error(err);
  process.exit(1);
});
