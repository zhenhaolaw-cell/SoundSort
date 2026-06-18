import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const root = process.cwd();
const src = join(root, "node_modules", "xml2js");
const dest = join(root, ".next", "standalone", "node_modules", "xml2js");

function copyDir(srcDir, destDir) {
  if (!existsSync(srcDir)) return;
  mkdirSync(destDir, { recursive: true });
  for (const entry of readdirSync(srcDir)) {
    const srcPath = join(srcDir, entry);
    const destPath = join(destDir, entry);
    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

console.log("Copying xml2js to standalone output...");
copyDir(src, dest);
console.log("Done!");
