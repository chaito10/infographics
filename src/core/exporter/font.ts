import postcss from 'postcss';
import {
  createElement,
  decodeFontFamily,
  fetchWithCache,
  join,
  normalizeFontWeightName,
  splitFontFamily,
} from '../utils';

interface FontFaceAttributes {
  'font-family': string;
  src: string;
  'font-style': string;
  'font-display': string;
  'font-weight': string;
  'unicode-range': string;
}

export async function embedFonts(svg: SVGSVGElement, embedResources = true) {
  const usedFonts = collectUsedFonts(svg);
  if (usedFonts.size === 0) return;

  const parsedFontsFaces: FontFaceAttributes[] = [];

  await Promise.all(
    Array.from(usedFonts).map(async (fontFamily) => {
      const loadedFonts = getActualLoadedFontFace(fontFamily);
      if (!loadedFonts.length) return;

      const cssFontFaces = await parseFontFamily(fontFamily);
      if (!cssFontFaces.length) return;

      const processed = await Promise.all(
        cssFontFaces.map(async (rawFace) => {
          const fontFace = normalizeFontFace(rawFace);

          const unicodeRange = fontFace['unicode-range'].replace(/\s/g, '');
          const subset = loadedFonts.find(
            (font) =>
              font.unicodeRange &&
              font.unicodeRange.replace(/\s/g, '') === unicodeRange,
          );

          if (!subset) return null;

          let getWoff2BaseURL:
            | ((family: string, weight: string) => string | null)
            | undefined;
          try {
            ({ getWoff2BaseURL } = await import('../renderer'));
          } catch {
            return null;
          }

          const baseURL = getWoff2BaseURL(
            fontFace['font-family'],
            normalizeFontWeightName(fontFace['font-weight']),
          );
          if (!baseURL) return null;

          const urlMatch = fontFace.src.match(
            /url\(["']?(.*?\.woff2)[^"']*["']?\)/,
          );
          if (!urlMatch?.[1]) return null;

          const woff2URL = join(baseURL, urlMatch[1]);

          if (embedResources) {
            const woff2DataUrl = await loadWoff2(woff2URL);
            fontFace.src = `url(${woff2DataUrl}) format('woff2')`;
          } else {
            fontFace.src = `url(${woff2URL}) format('woff2')`;
          }

          return fontFace;
        }),
      );

      parsedFontsFaces.push(
        ...((processed.filter(Boolean) as FontFaceAttributes[]) || []),
      );
    }),
  );

  if (parsedFontsFaces.length > 0) {
    insertFontStyle(svg, parsedFontsFaces);
  }
}

function collectUsedFonts(svg: SVGSVGElement) {
  const usedFonts = new Set<string>();

  const addFamilies = (fontFamilyString: string | null | undefined) => {
    if (!fontFamilyString) return;
    splitFontFamily(fontFamilyString).forEach((family) => {
      const decodedFontFamily = decodeFontFamily(family);
      if (decodedFontFamily) usedFonts.add(decodedFontFamily);
    });
  };

  addFamilies(svg.getAttribute('font-family'));

  const textElements =
    svg.querySelectorAll<HTMLSpanElement>('foreignObject span');

  for (const span of textElements) {
    addFamilies(span.style.fontFamily);
  }

  return usedFonts;
}

async function parseFontFamily(fontFamily: string) {
  let getFontURLs: (font: string) => string[];
  try {
    ({ getFontURLs } = await import('../renderer'));
  } catch {
    return [];
  }

  const urls = getFontURLs(fontFamily);
  const fontFaces: Partial<FontFaceAttributes>[] = [];

  await Promise.allSettled(
    urls.map(async (url) => {
      const cssText = await fetchWithCache(url)
        .then((res) => res.text())
        .catch(() => {
          console.error(`Failed to fetch font CSS: ${url}`);
          return null;
        });

      if (!cssText) return;

      try {
        const root = postcss.parse(cssText);

        root.walkAtRules('font-face', (rule) => {
          const fontFace: Record<string, string> = {};

          rule.walkDecls((decl) => {
            fontFace[decl.prop] = decl.value;
          });

          fontFaces.push(fontFace as Partial<FontFaceAttributes>);
        });
      } catch (error) {
        console.error(`Failed to parse CSS: ${url}`, error);
      }
    }),
  );

  return fontFaces;
}

export function getActualLoadedFontFace(fontFamily: string) {
  const fonts: FontFace[] = [];
  const families = splitFontFamily(fontFamily).map((family) =>
    decodeFontFamily(family),
  );

  document.fonts.forEach((font) => {
    if (
      families.includes(decodeFontFamily(font.family)) &&
      font.status === 'loaded'
    ) {
      fonts.push(font);
    }
  });

  return fonts;
}

function normalizeFontFace(
  face: Partial<FontFaceAttributes>,
): FontFaceAttributes {
  return {
    'font-family': face['font-family'] ?? '',
    src: face.src ?? '',
    'font-style': face['font-style'] ?? 'normal',
    'font-display': face['font-display'] ?? 'swap',
    'font-weight': face['font-weight'] ?? '400',
    'unicode-range': face['unicode-range'] ?? 'U+0-FFFF',
  };
}

function insertFontStyle(svg: SVGSVGElement, fontFaces: FontFaceAttributes[]) {
  const unique: FontFaceAttributes[] = [];
  const seen = new Set<string>();

  for (const f of fontFaces) {
    const key = [
      f['font-family'],
      f['font-weight'],
      f['font-style'],
      f['unicode-range'],
      f.src,
    ].join('|');

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(f);
    }
  }

  if (unique.length === 0) return;

  const style = createElement('style', { type: 'text/css' });

  style.innerHTML = unique
    .map((f) =>
      `
@font-face {
  font-family: ${f['font-family']};
  src: ${f.src};
  font-style: ${f['font-style']};
  font-weight: ${f['font-weight']};
  font-display: ${f['font-display']};
  unicode-range: ${f['unicode-range']};
}
`.trim(),
    )
    .join('\n');

  const defs = svg.querySelector('defs');
  if (defs && defs.parentNode) {
    defs.parentNode.insertBefore(style, defs.nextSibling);
  } else {
    svg.insertBefore(style, svg.firstChild);
  }
}

async function loadWoff2(url: string) {
  const response = await fetchWithCache(url);
  if (!response.ok) {
    throw new Error(`Failed to load font: ${url}`);
  }

  const blob = await response.blob();

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  return dataUrl;
}
