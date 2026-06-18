import { readdirSync, unlinkSync, existsSync, renameSync } from "fs";
import { join } from "path";

const root = process.cwd();
const moduleDir = join(root, "node_modules", "netease-cloud-music-api-alger", "module");

// Only these modules are needed by our routes
const KEEP = new Set([
  "playlist_detail.js",
  "song_detail.js", 
  "cloudsearch.js",
  "song_wiki_summary.js",
  "lyric.js",
]);

if (!existsSync(moduleDir)) {
  console.log("Module dir not found:", moduleDir);
  process.exit(0);
}

const files = readdirSync(moduleDir);
let removed = 0;
for (const file of files) {
  if (!KEEP.has(file)) {
    unlinkSync(join(moduleDir, file));
    removed++;
  }
}
console.log(`Removed ${removed} unused modules from netease package, kept ${KEEP.size}`);
