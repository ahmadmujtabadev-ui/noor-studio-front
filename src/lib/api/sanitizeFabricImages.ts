/**
 * sanitizeFabricImages
 *
 * Walks a Fabric.js canvas JSON object and replaces any base64 `src` values
 * with permanent Cloudinary URLs — uploaded ONCE per session per unique image.
 *
 * KEY BEHAVIOURS:
 * - Session cache: each unique base64 image is uploaded exactly once per
 *   browser session. Subsequent saves reuse the cached URL with no network call.
 * - Sequential processing: images are uploaded one at a time (not Promise.all)
 *   to prevent flooding the backend with 30+ concurrent requests.
 * - Already-URL srcs are passed through instantly with zero network activity.
 */

import { reviewApi } from './review.api';

type FabricObject = Record<string, unknown>;
type FabricJson = {
  objects?: FabricObject[];
  backgroundImage?: FabricObject & { src?: string };
  [key: string]: unknown;
};

// ─── Session-level upload cache ───────────────────────────────────────────────
// Maps a base64 "fingerprint" (first 512 chars) → Cloudinary URL.
// Cleared only on page refresh — survives multiple saves within a session so
// the same image is never uploaded more than once per session.
const sessionUploadCache = new Map<string, string>();

function isBase64Src(src: unknown): src is string {
  if (typeof src !== 'string') return false;
  if (src.startsWith('http://') || src.startsWith('https://')) return false;
  return src.startsWith('data:') || src.length > 256;
}

// Fingerprint: first 512 chars is sufficient to uniquely identify an image
// without hashing the entire multi-MB string.
function fingerprint(src: string): string {
  return src.slice(0, 512);
}

async function uploadSrc(
  projectId: string,
  src: string,
  suffix: string,
): Promise<string> {
  const fp = fingerprint(src);

  // Return cached URL immediately — no network call
  const cached = sessionUploadCache.get(fp);
  if (cached) return cached;

  const { url } = await reviewApi.uploadEditorImage(projectId, src, suffix);
  sessionUploadCache.set(fp, url);
  return url;
}

// Sequential sanitize — processes objects one-by-one to avoid concurrent flood
async function sanitizeObject(
  obj: FabricObject,
  projectId: string,
  suffix: string,
): Promise<FabricObject> {
  const result = { ...obj };

  if (result.type === 'image' && isBase64Src(result.src)) {
    result.src = await uploadSrc(projectId, result.src as string, suffix);
  }

  // Groups can nest image objects — sanitize sequentially
  if (result.type === 'group' && Array.isArray(result.objects)) {
    const sanitized: FabricObject[] = [];
    for (let i = 0; i < (result.objects as FabricObject[]).length; i++) {
      sanitized.push(
        await sanitizeObject(
          (result.objects as FabricObject[])[i],
          projectId,
          `${suffix}_${i}`,
        ),
      );
    }
    result.objects = sanitized;
  }

  return result;
}

export async function sanitizeFabricImages(
  fabricJson: object | null | undefined,
  projectId: string,
  pageId: string,
): Promise<object | null | undefined> {
  if (!fabricJson || typeof fabricJson !== 'object') return fabricJson;

  // Only do work if there's actually a base64 src anywhere
  const json = JSON.stringify(fabricJson);
  if (!json.includes('data:') && !json.match(/"src"\s*:\s*"[^h]/)) {
    return fabricJson; // fast-path: nothing to sanitize
  }

  // Deep-clone so we never mutate the caller's state
  const fj: FabricJson = JSON.parse(json);

  // Sanitize canvas objects sequentially
  if (Array.isArray(fj.objects)) {
    const sanitized: FabricObject[] = [];
    for (let i = 0; i < fj.objects.length; i++) {
      sanitized.push(
        await sanitizeObject(fj.objects[i] as FabricObject, projectId, `${pageId}_obj${i}`),
      );
    }
    fj.objects = sanitized;
  }

  // Sanitize backgroundImage
  if (fj.backgroundImage && isBase64Src(fj.backgroundImage.src)) {
    fj.backgroundImage = {
      ...fj.backgroundImage,
      src: await uploadSrc(projectId, fj.backgroundImage.src!, `${pageId}_bg`),
    };
  }

  return fj;
}

/** Call this if you need to force a re-upload (e.g., after clearing book data). */
export function clearSanitizeCache(): void {
  sessionUploadCache.clear();
}
