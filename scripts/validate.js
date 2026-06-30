const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const htmlFiles = ["index.html", "about.html", "services.html", "projects.html", "contact.html"];
const localRefPattern = /\b(?:href|src)=["']([^"']+)["']/gi;
const duplicateIdPattern = /\bid=["']([^"']+)["']/gi;
const targetBlankPattern = /<a\b(?=[^>]*\btarget=["']_blank["'])(?![^>]*\brel=["'][^"']*\bnoopener\b[^"']*["'])[^>]*>/gi;
const inlineScriptPattern = /<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/gi;
const inlineStylePattern = /\sstyle=["'][^"']*["']/gi;

const failures = [];

const read = (filePath) => fs.readFileSync(path.join(root, filePath), "utf8");

const isExternalRef = (ref) =>
    /^(?:https?:|mailto:|tel:|data:|#)/i.test(ref) || ref.startsWith("//");

const hasBalancedBraces = (content) => {
    let depth = 0;
    for (const char of content) {
        if (char === "{") depth += 1;
        if (char === "}") depth -= 1;
        if (depth < 0) return false;
    }
    return depth === 0;
};

for (const file of htmlFiles) {
    const content = read(file);

    if (!content.includes("<meta name=\"description\"")) {
        failures.push(`${file}: missing meta description.`);
    }

    if (!content.includes("Content-Security-Policy")) {
        failures.push(`${file}: missing Content Security Policy.`);
    }

    for (const match of content.matchAll(inlineScriptPattern)) {
        if (match[0].replace(/<[^>]+>/g, "").trim()) {
            failures.push(`${file}: contains inline script content.`);
        }
    }

    if (inlineStylePattern.test(content)) {
        failures.push(`${file}: contains inline style attributes.`);
    }
    inlineStylePattern.lastIndex = 0;

    for (const match of content.matchAll(targetBlankPattern)) {
        failures.push(`${file}: target=\"_blank\" link is missing rel=\"noopener\" near ${match[0]}.`);
    }

    const ids = new Set();
    for (const match of content.matchAll(duplicateIdPattern)) {
        if (ids.has(match[1])) {
            failures.push(`${file}: duplicate id "${match[1]}".`);
        }
        ids.add(match[1]);
    }

    for (const match of content.matchAll(localRefPattern)) {
        const ref = match[1];
        if (isExternalRef(ref)) continue;

        const [cleanRef] = ref.split(/[?#]/);
        if (!cleanRef || cleanRef === ".") continue;

        const resolved = path.resolve(root, cleanRef);
        if (!resolved.startsWith(root) || !fs.existsSync(resolved)) {
            failures.push(`${file}: local reference not found: ${ref}.`);
        }
    }
}

for (const file of ["styles.css", "script.js", "README.md"]) {
    if (!fs.existsSync(path.join(root, file))) {
        failures.push(`Missing required file: ${file}.`);
    }
}

const css = read("styles.css");
if (!hasBalancedBraces(css)) {
    failures.push("styles.css: braces are not balanced.");
}

const js = read("script.js");
for (const forbidden of ["Phtyon", "ð", "👋"]) {
    if (js.includes(forbidden)) {
        failures.push(`script.js: contains stale or corrupted text "${forbidden}".`);
    }
}

if (failures.length > 0) {
    console.error(failures.join("\n"));
    process.exit(1);
}

console.log("Static validation passed.");
