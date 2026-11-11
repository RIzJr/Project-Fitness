// Copies the web app into www/ for the iPhone build. The live website doesn't use this: GitHub Pages serves the repo as it is.
import { cpSync, mkdirSync, rmSync, existsSync } from "node:fs";
const FILES = ["index.html", "demos.js", "foods.js", "privacy.html", "support.html", "terms.html", "manifest.json", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
rmSync("www", { recursive: true, force: true });
mkdirSync("www");
for (const f of FILES) { if (!existsSync(f)) throw new Error("Missing " + f); cpSync(f, "www/" + f); }
console.log("www/ ready: " + FILES.length + " files");
