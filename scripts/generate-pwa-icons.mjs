// Generates PWA icons from public/favicon.svg using sharp.
// Run manually after logo changes: `node scripts/generate-pwa-icons.mjs`
import sharp from "sharp";
import { mkdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const sourceSvg = resolve(root, "public/favicon.svg");
const outDir = resolve(root, "public/icons");

const targets = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "icon-maskable-512.png", size: 512, padding: 0.1 },
  { name: "apple-touch-icon.png", size: 180 },
];

await mkdir(outDir, { recursive: true });
const svgBuffer = await readFile(sourceSvg);

for (const { name, size, padding = 0 } of targets) {
  const inner = Math.round(size * (1 - padding * 2));
  const offset = Math.round((size - inner) / 2);

  const rendered = await sharp(svgBuffer, { density: 384 })
    .resize(inner, inner, { fit: "contain", background: "#1A1A1A" })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: "#1A1A1A",
    },
  })
    .composite([{ input: rendered, top: offset, left: offset }])
    .png()
    .toFile(resolve(outDir, name));

  console.log(`✓ ${name} (${size}x${size})`);
}

console.log("\nDone. Icons written to public/icons/");
