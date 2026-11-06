export const LOCALES = Object.freeze(['zh-CN', 'en']);
export const LOCALE_STORAGE_KEY = 'palace.locale';
const valid = value => LOCALES.includes(value);

/** Presentation preference only. No world, input or navigation side effects. */
export function createLocaleStore({ getStorage = () => globalThis.localStorage } = {}) {
  let locale = 'zh-CN';
  const listeners = new Set();
  try { const saved = getStorage()?.getItem(LOCALE_STORAGE_KEY); if (valid(saved)) locale = saved; } catch { /* Storage is optional. */ }
  return {
    get locale() { return locale; },
    setLocale(value) {
      if (!valid(value) || value === locale) return false;
      locale = value;
      try { getStorage()?.setItem(LOCALE_STORAGE_KEY, value); } catch { /* Keep the in-memory choice. */ }
      for (const callback of [...listeners]) callback(value);
      return true;
    },
    subscribe(callback) {
      if (typeof callback !== 'function') throw TypeError('Locale subscriber must be a function');
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    dispose() { listeners.clear(); },
  };
}
export const localeStore = createLocaleStore();
