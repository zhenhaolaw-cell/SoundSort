import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";

function copyDir(src, dest) {
  if (!existsSync(src)) { console.log("Source not found:", src); return; }
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const s = join(src, entry);
    const d = join(dest, entry);
    if (statSync(s).isDirectory()) copyDir(s, d);
    else copyFileSync(s, d);
  }
}

const root = process.cwd();
const src = join(root, "node_modules", "xml2js");
const dest = join(root, "node_modules", "netease-cloud-music-api-alger", "node_modules", "xml2js");
console.log("Copying xml2js to netease package...");
copyDir(src, dest);
console.log("Done!");
