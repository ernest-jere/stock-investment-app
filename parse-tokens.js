import fs from 'fs';
import path from 'path';

// Target the correct local tokens file exported from the plugin
const TOKENS_PATH = path.join(process.cwd(), 'tokens.json');
const CSS_PATH = path.join(process.cwd(), 'src', 'index.css');

function extractTokensStudioVariables(obj, prefix = '') {
  let entries = {};

  for (const [key, value] of Object.entries(obj)) {
    const currentKey = prefix ? `${prefix}-${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Tokens Studio specific handler: If an object contains a structural '$value' property, extract it immediately
      if ('$value' in value) {
        entries[currentKey] = value['$value'];
      } else {
        // Otherwise, continue traversing down the object tree
        Object.assign(entries, extractTokensStudioVariables(value, currentKey));
      }
    }
  }
  return entries;
}

try {
  if (!fs.existsSync(TOKENS_PATH)) {
    console.error(`❌ Error: 'tokens.json' not found in root directory.`);
    process.exit(1);
  }

  const tokensJson = JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf8'));
  const cleanVariables = extractTokensStudioVariables(tokensJson);

  let themeLines = ['@theme {'];

  for (let [name, val] of Object.entries(cleanVariables)) {
    let cssName = name.toLowerCase().replace(/-+/g, '-');

    if (val && typeof val === 'string') {
      // 1. Properly translate Tokens Studio alias notation {primitive.slate-950} into valid CSS variables
      if (val.startsWith('{') && val.endsWith('}')) {
        let reference = val.replace(/[\{\}]/g, '').replace(/\./g, '-').toLowerCase();
        val = `var(--color-${reference})`;
      }

      // 2. Ensure raw hex codes have a '#' prefix
      if (/^[0-9A-F]{6,8}$/i.test(val) && !val.startsWith('#')) {
        val = `#${val}`;
      }

      themeLines.push(`  --color-${cssName}: ${val};`);
    }
  }
  themeLines.push('}');

  fs.writeFileSync(CSS_PATH, `@import "tailwindcss";\n\n${themeLines.join('\n')}\n`, 'utf8');
  console.log('🚀 Clean Tailwind v4 theme built with zero metadata residue!');

} catch (error) {
  console.error('❌ Compilation failed:', error.message);
}
