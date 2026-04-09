const fs      = require("fs");
const path    = require("path");
const { execSync } = require("child_process");

const MAX_SIZE = 512 * 1024; // 512KB
const dir      = path.join(__dirname, "stickers");

function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
        const full = path.join(d, entry.name);
        if (entry.isDirectory()) { walk(full); continue; }
        if (!entry.name.endsWith(".gif")) continue;
        const size = fs.statSync(full).size;
        if (size <= MAX_SIZE) continue;

        console.log(`Compressing ${entry.name} (${(size/1024).toFixed(0)}KB)…`);
        try {
            execSync(`gifsicle -O3 --lossy=80 -o "${full}" "${full}"`);
            const newSize = fs.statSync(full).size;
            console.log(`  → ${(newSize/1024).toFixed(0)}KB ${newSize <= MAX_SIZE ? "✓" : "⚠ still over 512KB"}`);
        } catch (e) {
            console.log(`  ✗ failed: ${e.message}`);
        }
    }
}

walk(dir);
console.log("\nDone. Run generate-manifest.js and push when ready.");