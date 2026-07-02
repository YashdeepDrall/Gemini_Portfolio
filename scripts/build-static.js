const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "dist");
const files = [
    "index.html",
    "about.html",
    "services.html",
    "projects.html",
    "contact.html",
    "styles.css",
    "script.js",
    "IIRIS_LOGO.png",
    "developer.png",
    "photoshop.png",
    "blender.png",
    "python.png",
    "DSA.png",
    "Yashdeep_resume.pdf",
];

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const file of files) {
    const source = path.join(root, file);
    const target = path.join(outDir, file);

    if (!fs.existsSync(source)) {
        throw new Error(`Build asset missing: ${file}`);
    }

    fs.copyFileSync(source, target);
}

console.log(`Static site built to ${path.relative(root, outDir)}.`);
