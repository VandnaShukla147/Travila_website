/*
  Production build script:
  - Ensures dist/ exists and is clean
  - Runs Tailwind build (assumes npm run build:css executed by package.json)
  - Minifies HTML (index.html and partials/*)
  - Minifies JS in js/ into dist/js (same filenames)
  - Copies data/ (minifies JSON) and assets/ (optionally optimizes images if deps installed)
*/

const fs = require('fs');
const path = require('path');

async function ensureDir(p) {
  await fs.promises.mkdir(p, { recursive: true });
}

async function cleanDir(p) {
  try {
    await fs.promises.rm(p, { recursive: true, force: true });
  } catch {}
  await ensureDir(p);
}

async function read(file) {
  return fs.promises.readFile(file, 'utf8');
}

async function write(file, content) {
  await ensureDir(path.dirname(file));
  return fs.promises.writeFile(file, content);
}

async function copyFile(src, dest) {
  await ensureDir(path.dirname(dest));
  return fs.promises.copyFile(src, dest);
}

async function* walk(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const res = path.join(dir, e.name);
    if (e.isDirectory()) {
      yield* walk(res);
    } else {
      yield res;
    }
  }
}

// Optional dependencies (minifiers)
let htmlMinifier;
let terser;
try {
  htmlMinifier = require('html-minifier-terser');
} catch {}
try {
  terser = require('terser');
} catch {}

async function minifyHtml(html) {
  if (!htmlMinifier) return html;
  return await htmlMinifier.minify(html, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: true,
    minifyCSS: true,
    minifyJS: true,
    keepClosingSlash: true,
    useShortDoctype: true,
  });
}

async function minifyJs(code) {
  if (!terser) return code;
  const result = await terser.minify(code, {
    compress: true,
    mangle: true,
  });
  return result.code || code;
}

async function build() {
  const root = __dirname ? path.join(__dirname, '..') : path.resolve('..');
  const dist = path.join(root, 'dist');

  // 1) Clean dist
  await cleanDir(dist);

  // 2) CSS already built by npm script to dist/output.css
  // Verify and warn if missing
  const cssOut = path.join(dist, 'output.css');
  if (!fs.existsSync(cssOut)) {
    console.warn('Warning: dist/output.css not found. Did you run "npm run build:css"?');
  }

  // 3) Minify and copy HTML
  // index.html: adjust CSS href and minify
  const indexSrc = path.join(root, 'index.html');
  if (fs.existsSync(indexSrc)) {
    let html = await read(indexSrc);
    // When index.html is moved into dist/, CSS should be referenced as output.css (not dist/output.css)
    html = html.replace(/href=["']dist\/output\.css["']/i, 'href="output.css"');
    const minified = await minifyHtml(html);
    await write(path.join(dist, 'index.html'), minified);
  }

  // partials
  const partialsSrc = path.join(root, 'partials');
  const partialsDest = path.join(dist, 'partials');
  if (fs.existsSync(partialsSrc)) {
    for await (const file of walk(partialsSrc)) {
      const rel = path.relative(partialsSrc, file);
      const dest = path.join(partialsDest, rel);
      if (file.endsWith('.html')) {
        const html = await read(file);
        const minified = await minifyHtml(html);
        await write(dest, minified);
      } else {
        await copyFile(file, dest);
      }
    }
  }

  // 4) Minify and copy JS
  const jsSrc = path.join(root, 'js');
  const jsDest = path.join(dist, 'js');
  if (fs.existsSync(jsSrc)) {
    for await (const file of walk(jsSrc)) {
      const rel = path.relative(jsSrc, file);
      const dest = path.join(jsDest, rel);
      if (file.endsWith('.js')) {
        const code = await read(file);
        const min = await minifyJs(code);
        await write(dest, min);
      } else {
        await copyFile(file, dest);
      }
    }
  }

  // 5) Copy and compact data
  const dataSrc = path.join(root, 'data');
  const dataDest = path.join(dist, 'data');
  if (fs.existsSync(dataSrc)) {
    for await (const file of walk(dataSrc)) {
      const rel = path.relative(dataSrc, file);
      const dest = path.join(dataDest, rel);
      if (file.endsWith('.json')) {
        try {
          const content = await read(file);
          if (content.trim().length === 0) {
            // Empty JSON file, copy as-is
            await write(dest, content);
          } else {
            const obj = JSON.parse(content);
            await write(dest, JSON.stringify(obj));
          }
        } catch (e) {
          // Not valid JSON; copy raw to avoid breaking build
          await copyFile(file, dest);
        }
      } else {
        await copyFile(file, dest);
      }
    }
  }

  // 6) Copy assets (no-op image minification to keep visuals identical, but keep hook for future)
  const assetsSrc = path.join(root, 'assets');
  const assetsDest = path.join(dist, 'assets');
  if (fs.existsSync(assetsSrc)) {
    for await (const file of walk(assetsSrc)) {
      const rel = path.relative(assetsSrc, file);
      const dest = path.join(assetsDest, rel);
      await copyFile(file, dest);
    }
  }

  console.log('✅ Build complete. Dist folder is ready.');
}

build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
