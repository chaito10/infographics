import { fetchWithCache } from '../utils';
import { parseSVG } from '../utils';

const ICON_SERVICE_URL = 'https://www.weavefox.cn/api/v1/infographic/icon';

// ============================================================================
// SVG Loader
// ============================================================================

function isSVGResource(resource: string): boolean {
  const trimmedResource = resource.trim();
  return (
    /^(?:<\?xml[^>]*>\s*)?<svg[\s>]/i.test(trimmedResource) ||
    trimmedResource.startsWith('<symbol')
  );
}

export function loadSVGResource(data: string) {
  if (!data || !isSVGResource(data)) return null;
  const str = data
    .replace(/<svg(?=[\s/>])/i, '<symbol')
    .replace(/<\/svg>/i, '</symbol>');
  return parseSVG(str);
}

// ============================================================================
// Image Base64 Loader
// ============================================================================

function isImageBase64Resource(resource: string): boolean {
  return resource.startsWith('data:');
}

export async function loadImageBase64Resource(data: string) {
  if (!data || !isImageBase64Resource(data)) return null;

  const mimeType = data.match(/^data:([^;]+)/)?.[1];
  if (!mimeType) return null;

  const analysis = () => {
    return new Promise<{ width: number; height: number; hasAlpha: boolean }>(
      (resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const width = img.naturalWidth;
          const height = img.naturalHeight;

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            return resolve({ width, height, hasAlpha: false });
          }
          if (
            ['image/jpeg', 'image/jpg', 'image/webp', 'image/gif'].includes(
              mimeType,
            )
          ) {
            return resolve({ width, height, hasAlpha: false });
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0);

          let hasAlpha = false;
          const step = 10;

          for (let x = 0; x < width; x += step) {
            if (hasAlpha) break;
            for (let y = 0; y < height; y += step) {
              const imageData = ctx.getImageData(x, y, 1, 1);
              if (imageData.data[3] < 255) {
                hasAlpha = true;
                break;
              }
            }
          }

          resolve({ width, height, hasAlpha });
        };
        img.onerror = () => reject(new Error('Failed to analysis image'));
        img.src = data;
      },
    );
  };

  const { width, height, hasAlpha } = await analysis();

  const getPreserveAspectRatio = () => {
    if (hasAlpha) return 'xMidYMid meet';

    if (mimeType?.includes('image/gif') || mimeType?.includes('image/svg')) {
      return 'xMidYMid meet';
    }

    const minDimension = Math.min(width, height);
    if (minDimension <= 200) return 'xMidYMid meet';

    const aspectRatio = width / height;
    if (aspectRatio >= 0.6 && aspectRatio <= 1.67) return 'xMidYMid meet';
    if (aspectRatio < 0.3 || aspectRatio > 3.33) return 'xMidYMid meet';

    return 'xMidYMid slice';
  };

  const preserveAspectRatio = getPreserveAspectRatio();

  return parseSVG<SVGSymbolElement>(`
<symbol xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="${preserveAspectRatio}">
  <image href="${data}" width="${width}" height="${height}" />
</symbol>`);
}

// ============================================================================
// Remote Resource Loader
// ============================================================================

function isRemoteResource(resource: string): boolean {
  try {
    return Boolean(new URL(resource));
  } catch {
    return false;
  }
}

function shouldParseAsSVG(contentType: string, format?: string) {
  const normalized = contentType.toLowerCase();
  if (normalized.includes('image/svg')) return true;
  if (!contentType && format === 'svg') return true;
  return false;
}

export async function loadRemoteResource(resource: string, format?: string) {
  if (!resource || !isRemoteResource(resource)) return null;

  const response = await fetchWithCache(resource);
  if (!response.ok) throw new Error('Failed to load resource');

  const contentType = response.headers.get('Content-Type') || '';

  if (shouldParseAsSVG(contentType, format)) {
    const svgText = await response.text();
    return loadSVGResource(svgText);
  }

  const blob = await response.blob();
  const base64 = await blobToBase64(blob);

  return loadImageBase64Resource(base64);
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ============================================================================
// Search Resource Loader
// ============================================================================

const queryIcon = async (query: string): Promise<string | null> => {
  try {
    const params = new URLSearchParams({ text: query, topK: '1' });
    const url = `${ICON_SERVICE_URL}?${params.toString()}`;
    const response = await fetchWithCache(url);
    if (!response.ok) return null;
    const result = await response.json();
    if (!result?.success || !Array.isArray(result.data)) return null;
    return (result.data[0] as string) || null;
  } catch (error) {
    console.error(`Failed to query icon for "${query}":`, error);
    return null;
  }
};

function isDataURI(resource: string): boolean {
  return resource.startsWith('data:');
}

function looksLikeSVGSearch(resource: string): boolean {
  const str = resource.trim();
  return str.startsWith('<svg') || str.startsWith('<symbol');
}

export async function loadSearchResource(query: string, format?: string) {
  if (!query) return null;
  const result = await queryIcon(query);
  if (!result) return null;

  if (looksLikeSVGSearch(result)) return loadSVGResource(result);

  if (isDataURI(result)) {
    const mimeType = result.match(/^data:([^;]+)/)?.[1] || '';
    const isBase64 = result.includes(';base64,');
    if (mimeType === 'image/svg+xml' && !isBase64) {
      const commaIndex = result.indexOf(',');
      const svgText = commaIndex >= 0 ? result.slice(commaIndex + 1) : result;
      return loadSVGResource(svgText);
    }
    return loadImageBase64Resource(result);
  }

  return loadRemoteResource(result, format);
}
