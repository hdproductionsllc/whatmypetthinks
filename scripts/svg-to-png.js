const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const publicDir = path.join(__dirname, "..", "public");

async function convert(svgPath, pngPath, width) {
  const svgBuffer = fs.readFileSync(svgPath);
  await sharp(svgBuffer).resize(width, width).png().toFile(pngPath);
  console.log(`✓ ${path.relative(path.join(__dirname, ".."), pngPath)}`);
}

async function main() {
  await convert(
    path.join(publicDir, "icons", "icon-192.svg"),
    path.join(publicDir, "icons", "icon-192.png"),
    192
  );
  await convert(
    path.join(publicDir, "icons", "icon-512.svg"),
    path.join(publicDir, "icons", "icon-512.png"),
    512
  );

  // OG image
  const ogSvg = fs.readFileSync(path.join(publicDir, "og-image.svg"));
  await sharp(ogSvg).resize(1200, 630).png().toFile(path.join(publicDir, "og-image.png"));
  console.log("✓ public/og-image.png");

  // Sample images (skip if SVGs don't exist — replaced by JPGs)
  for (let i = 1; i <= 3; i++) {
    const svgPath = path.join(publicDir, "samples", `sample-${i}.svg`);
    if (fs.existsSync(svgPath)) {
      const svgBuf = fs.readFileSync(svgPath);
      await sharp(svgBuf).resize(400, 500).png().toFile(path.join(publicDir, "samples", `sample-${i}.png`));
      console.log(`✓ public/samples/sample-${i}.png`);
    }
  }

  console.log("\nAll PNGs generated!");
}

main().catch(console.error);
