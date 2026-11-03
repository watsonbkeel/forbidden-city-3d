/** Only an explicit quality selection is saved; defaults and other settings stay independent. */
export const QUALITY_PREFERENCE_KEY = 'fc3d-quality-v1';
export function readQualityPreference(fallback, storage) {
  try {
    const value = (storage ?? globalThis.localStorage)?.getItem(QUALITY_PREFERENCE_KEY);
    return value === 'high' || value === 'low' ? value : fallback;
  } catch { return fallback; }
}
export function writeQualityPreference(quality, storage) {
  if (quality !== 'high' && quality !== 'low') throw new Error(`Unsupported quality: ${quality}`);
  try {
    const target = storage ?? globalThis.localStorage;
    if (!target) return false;
    target.setItem(QUALITY_PREFERENCE_KEY, quality);
    return true;
  } catch { return false; }
}
