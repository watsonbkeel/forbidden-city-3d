import { localeStore } from '../i18n/LocaleStore.js';
import { TourHudLayout } from './TourHudLayout.js';

/** Native select preserves keyboard/touch behavior; selecting never reloads. */
export class LanguageControl {
  constructor({ store = localeStore, document = globalThis.document, container = document.body, id = 'tour-language' } = {}) {
    this.store = store;
    this.element = document.createElement('label');
    this.element.className = 'language-control'; this.element.id = `${id}-control`;
    this.element.setAttribute('for', id);
    this.element.setAttribute('translate', 'no');
    const label = document.createElement('span'); label.textContent = '语言 / Language';
    this.select = document.createElement('select'); this.select.id = id;
    this.select.setAttribute('aria-label', '语言 / Language');
    this.select.setAttribute('data-language-control', 'true');
    for (const [value, text] of [['zh-CN', '中文'], ['en', 'English']]) {
      const option = document.createElement('option'); option.value = value;
      option.setAttribute('value', value); option.textContent = text; this.select.appendChild(option);
    }
    this.select.value = store.locale;
    const setDocumentLanguage = value => { if (id === 'tour-language') document.documentElement?.setAttribute('lang', value); };
    setDocumentLanguage(store.locale);
    this.element.append(label, this.select); container.appendChild(this.element);
    this.onChange = () => { store.setLocale(this.select.value); this.select.value = store.locale; };
    this.stop = event => event.stopPropagation();
    this.select.addEventListener('change', this.onChange);
    this.events = ['click', 'pointerdown', 'touchstart', 'keydown', 'keyup'];
    for (const type of this.events) this.element.addEventListener(type, this.stop);
    this.unsubscribe = store.subscribe(value => { this.select.value = value; setDocumentLanguage(value); });
    if(id==='tour-language'&&document.head)this.hudLayout=new TourHudLayout(this.element,{document});
  }
  dispose() {
    this.hudLayout?.dispose();
    this.unsubscribe(); this.select.removeEventListener('change', this.onChange);
    for (const type of this.events) this.element.removeEventListener(type, this.stop);
    this.element.remove();
  }
}
