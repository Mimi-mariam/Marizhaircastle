const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const OUTPUT = path.join(DIR, 'design-tokens.css');

const readJson = (name) =>
  JSON.parse(fs.readFileSync(path.join(DIR, name), 'utf8'));

const colorData = readJson('color-token.json');
const typeData = readJson('design-tokens.tokens.json');

const lines = [];
const pad = (n) => '  '.repeat(n);

// CSS custom-property identifiers cannot contain '.', so map to '-'.
const toVarName = (k) => k.replace(/[^a-zA-Z0-9_-]/g, '-');

// Values for font-family must be quoted when they contain spaces.
const formatValue = (k, v) =>
  typeof v === 'string' &&
  k.startsWith('font-family') &&
  !/^['"]/.test(v) &&
  v.includes(' ')
    ? `'${v}'`
    : v;

// Emit "--key: value;" declarations for a flat object of scalars.
const declarations = (obj, indent) =>
  Object.entries(obj)
    .filter(([, v]) => v !== null && typeof v !== 'object')
    .map(
      ([k, v]) =>
        `${pad(indent)}--${toVarName(k)}: ${formatValue(k, v)};`
    );

// ---- Color roles (UI only uses color roles: light on :root, dark on [data-theme="dark"]) ----
lines.push(':root {');
lines.push(`${pad(1)}/* Color roles - light */`);
lines.push(...declarations(colorData.color.light, 1));
lines.push('');
lines.push(`${pad(1)}/* Base typography */`);
lines.push(...declarations(colorData.typography, 1));
lines.push('');
lines.push(`${pad(1)}/* Spacing */`);
lines.push(...declarations(colorData.spacing, 1));
lines.push('');
lines.push(`${pad(1)}/* Border radius */`);
lines.push(...declarations(colorData.borderRadius, 1));
lines.push('');
lines.push(`${pad(1)}/* Shadows */`);
lines.push(...declarations(colorData.shadows, 1));
lines.push('');
lines.push(`${pad(1)}/* Elevation */`);
lines.push(...declarations(colorData.elevation, 1));
lines.push('}');
lines.push('');

lines.push('[data-theme="dark"] {');
lines.push(`${pad(1)}/* Color roles - dark */`);
lines.push(...declarations(colorData.color.dark, 1));
lines.push('}');
lines.push('');

// ---- Typography type-scale (composite font styles) ----
const rem = (px) => `${(px / 16).toFixed(3)}rem`;
const em = (px) => `${(px / 16).toFixed(4)}em`;
const kebab = (name) => name.trim().replace(/\s+/g, '-').toLowerCase();

for (const [styleName, props] of Object.entries(typeData.typography)) {
  const { fontSize, lineHeight, letterSpacing, fontFamily, fontWeight } = props;
  const cls = `.text-${kebab(styleName)}`;
  lines.push(`${cls} {`);
  lines.push(`${pad(1)}font-family: '${fontFamily.value}', 'Open Sans', sans-serif;`);
  lines.push(`${pad(1)}font-size: ${rem(fontSize.value)};`);
  lines.push(`${pad(1)}font-weight: ${fontWeight.value};`);
  lines.push(`${pad(1)}line-height: ${(lineHeight.value / fontSize.value).toFixed(2)};`);
  lines.push(`${pad(1)}letter-spacing: ${em(letterSpacing.value)};`);
  lines.push('}');
  lines.push('');
}

fs.writeFileSync(OUTPUT, lines.join('\n'), 'utf8');
console.log('Wrote ' + OUTPUT);