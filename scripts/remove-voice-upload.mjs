import { unlinkSync, existsSync } from "fs";
import { join } from "path";

const root = process.cwd();
const target = join(root, "node_modules", "netease-cloud-music-api-alger", "module", "voice_upload.js");
if (existsSync(target)) {
  unlinkSync(target);
  console.log("Removed voice_upload.js from netease package");
} else {
  console.log("voice_upload.js not found at:", target);
}
