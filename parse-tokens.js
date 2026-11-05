import fs from 'fs';
import path from 'path';

const TOKENS_PATH = path.join(process.cwd(), 'tokens.json');
const CSS_PATH = path.join(process.cwd(), 'src', 'index.css');

function extractTokensStudioVariables(obj, prefix = '') {
  let entries = {};
  for (const [key, value] of Object.entries(obj)) {
    const currentKey = prefix ? `${prefix}-${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if ('$value' in value) {
        entries[currentKey] = value['$value'];
      } else {
        Object.assign(entries, extractTokensStudioVariables(value, currentKey));
      }
    }
  }
  return entries;
}

async function fetchFigmaVariables() {
  const token = process.env.FIGMA_ACCESS_TOKEN;
  const fileKey = process.env.FIGMA_FILE_KEY;

  if (!token || !fileKey) {
    console.log('ℹ️ Missing environment credentials. Using local tokens.json fallback.');
    return;
  }

  console.log('📡 Fetching fresh design tokens straight from Figma Cloud API...');
  try {
    const res = await fetch(`https://figma.com{fileKey}/variables/local`, {
      headers: { 'X-Figma-Token': token }
    });
    if (!res.ok) throw new Error(`HTTP status response error: ${res.status}`);
    
    const data = await res.json();
    fs.writeFileSync(TOKENS_PATH, JSON.stringify(data.meta || data, null, 2), 'utf8');
    console.log('✅ Tokens metadata mirrored locally successfully.');
  } catch (err) {
    console.error('⚠️ Cloud fetch failed, relying on disk cache:', err.message);
  }
}

async function run() {
  await fetchFigmaVariables();

  if (!fs.existsSync(TOKENS_PATH)) {
    console.error(`❌ Error: 'tokens.json' not found.`);
    process.exit(1);
  }

  const tokensJson = JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf8'));
  const cleanVariables = extractTokensStudioVariables(tokensJson);

  let themeLines = ['@theme {'];
  for (let [name, val] of Object.entries(cleanVariables)) {
    let cssName = name.toLowerCase().replace(/-+/g, '-');
    if (val && typeof val === 'string') {
      
      // Fix alias translation to include exact structural path matching
      if (val.startsWith('{') && val.endsWith('}')) {
        let reference = val.replace(/[\{\}]/g, '').replace(/\./g, '-').toLowerCase();
        val = `var(--color-${reference})`;
      }
      
      if (/^[0-9A-F]{6,8}$/i.test(val) && !val.startsWith('#')) {
        val = `#${val}`;
      }

      // Handle specific typography allocations while keeping primitives intact
      if (cssName.includes('font-family')) {
        themeLines.push(`  --font-portfolio: ${val};`);
      } else if (cssName.includes('typography-headline') || cssName.includes('typography-body')) {
        themeLines.push(`  --text-${cssName.replace('typography-', '')}: ${val};`);
      } else if (cssName.includes('typography-weight')) {
        themeLines.push(`  --font-weight-${cssName.replace('typography-weight-', '')}: ${val};`);
      } else {
        // Generates all standard color properties seamlessly (both semantic & primitive)
        themeLines.push(`  --color-${cssName}: ${val};`);
      }
    }
  }
  themeLines.push('}');

  fs.writeFileSync(CSS_PATH, `@import "tailwindcss";\n\n${themeLines.join('\n')}\n`, 'utf8');
  console.log('🚀 Tailwind v4 @theme file written with clean baseline colors!');
}

run();
