/** Independent opt-in override; never migrates or writes quality / sound / NPC keys. */
export const PERFORMANCE_MODE_KEY = 'fc3d-performance-mode-v1';
export function readPerformanceMode(storage) {
  try {
    const value = (storage ?? globalThis.localStorage)?.getItem(PERFORMANCE_MODE_KEY);
    return value === 'smooth' ? 'smooth' : 'eco';
  } catch { return 'eco'; }
}
export function writePerformanceMode(mode, storage) {
  if (mode !== 'eco' && mode !== 'smooth') throw new Error(`Unsupported performance mode: ${mode}`);
  try {
    const target = storage ?? globalThis.localStorage;
    if (!target) return false;
    target.setItem(PERFORMANCE_MODE_KEY, mode);
    return true;
  } catch { return false; }
}
export function performancePixelRatio(deviceRatio, qualityCap, mode) {
  return Math.min(deviceRatio || 1, qualityCap, mode === 'smooth' ? Infinity : 1.5);
}
