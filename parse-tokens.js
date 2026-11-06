import fs from 'fs';
import path from 'path';

const TOKENS_PATH = path.join(process.cwd(), 'tokens.json');
const CSS_PATH = path.join(process.cwd(), 'src', 'index.css');

function extractTokens(obj, prefix = '') {
  let entries = {};
  for (const [key, value] of Object.entries(obj)) {
    const currentKey = prefix ? `${prefix}-${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if ('$value' in value) entries[currentKey] = value['$value'];
      else Object.assign(entries, extractTokens(value, currentKey));
    }
  }
  return entries;
}

try {
  if (!fs.existsSync(TOKENS_PATH)) {
    console.error(`❌ Error: 'tokens.json' not found.`);
    process.exit(1);
  }

  const tokensJson = JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf8'));
  const flat = extractTokens(tokensJson);

  let primitiveLines = [];
  let darkLines = [];
  let lightLines = [];
  let typoLines = [];

  for (let [name, val] of Object.entries(flat)) {
    let cleanName = name.toLowerCase().replace(/-+/g, '-').replace('-value', '');
    
    if (val && typeof val === 'string') {
      if (val.startsWith('{') && val.endsWith('}')) {
        let ref = val.replace(/[\{\}]/g, '').replace(/\./g, '-').toLowerCase();
        ref = ref.replace('theme-dark-', 'semantic-').replace('theme-light-', 'semantic-').replace('theme-shared-', 'semantic-');
        val = `var(--color-${ref})`;
      }
      if (/^[0-9A-F]{6,8}$/i.test(val) && !val.startsWith('#')) {
        val = `#${val}`;
      }

      // Route parameters cleanly to match strict styles
      if (cleanName.startsWith('primitive-')) {
        primitiveLines.push(`  --color-${cleanName}: ${val};`);
      } else if (cleanName.startsWith('theme-dark-')) {
        darkLines.push(`  --color-${cleanName.replace('theme-dark-', 'semantic-')}: ${val};`);
      } else if (cleanName.startsWith('theme-light-')) {
        lightLines.push(`  --color-${cleanName.replace('theme-light-', 'semantic-')}: ${val};`);
      } else if (cleanName.startsWith('theme-shared-')) {
        let sharedName = cleanName.replace('theme-shared-', 'semantic-');
        darkLines.push(`  --color-${sharedName}: ${val};`);
        lightLines.push(`  --color-${sharedName}: ${val};`);
      } else if (cleanName.includes('typography-')) {
        let tName = cleanName.replace('typography-', '');
        if (tName === 'font-family') typoLines.push(`  --font-portfolio: ${val};`);
        else typoLines.push(`  --text-${tName}: ${val};`);
      }
    }
  }

  // Generate perfect unified Tailwind v4 multi-theme styling sheet blocks
  let cssContent = `@import "tailwindcss";\n\n`;
  
  // Base dark variables mapped under main root properties
  cssContent += `@theme {\n`;
  cssContent += `  /* Primitives Baseline */\n${primitiveLines.join('\n')}\n\n`;
  cssContent += `  /* Typography Scales */\n${typoLines.join('\n')}\n\n`;
  cssContent += `  /* Active Default Semantic Themes (Dark Mode) */\n${darkLines.join('\n')}\n}\n\n`;
  
  // Custom utility override layout for light mode transitions 
  cssContent += `@utility light-theme {\n${lightLines.map(line => line.replace('  ', '  ')).join('\n')}\n}\n`;

  fs.writeFileSync(CSS_PATH, cssContent, 'utf8');
  console.log('🚀 CSS framework successfully re-aligned for Tailwind v4 switching!');
} catch (error) {
  console.error('❌ Compilation failure:', error.message);
}
