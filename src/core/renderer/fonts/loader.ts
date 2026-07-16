import {
  join,
  normalizeFontWeightName,
  splitFontFamily,
} from '../../utils';
import { getFont, getFonts } from './registry';

export function getFontURLs(font: string): string[] {
  const urls = splitFontFamily(font).flatMap((family) => {
    const config = getFont(family);
    if (!config) return [];
    const { baseUrl, fontWeight } = config;
    return Object.values(fontWeight)
      .filter((url): url is string => !!url)
      .map((url) => join(baseUrl, url));
  });

  return Array.from(new Set(urls));
}

export function getWoff2BaseURL(
  font: string,
  fontWeightName: string,
): string | null {
  const families = splitFontFamily(font);
  let config = null as ReturnType<typeof getFont>;
  for (const family of families) {
    config = getFont(family);
    if (config) break;
  }
  if (!config) return null;

  const name = normalizeFontWeightName(fontWeightName);
  const path = config.fontWeight[name];
  if (!path) return null;
  return join(config.baseUrl, path.replace(/\/result.css$/, ''));
}

/**
 * Server-side font URL loader.
 * Returns font URLs for embedding in HTML <link> tags.
 * Does not perform DOM loading - caller handles that.
 */
export function loadFontUrls(svg: SVGSVGElement): string[] {
  const fonts = getFonts();
  const urls: string[] = [];

  for (const font of fonts) {
    const fontUrls = getFontURLs(font.fontFamily);
    urls.push(...fontUrls);
  }

  return Array.from(new Set(urls));
}
