import {localeStore} from '../i18n/LocaleStore.js';
import {translateText} from '../i18n/Messages.js';
import {localizeDom} from '../i18n/DomLocalization.js';

/** Shared presentation bootstrap, independent of all world/character objects. */
export class TourLocalization {
  constructor({document=globalThis.document,store=localeStore,translate=translateText}={}) {
    const title=document.title??'';
    this.localizer=localizeDom(document.body,{store,translate});
    const updateTitle=()=>{document.title=translate(title,store.locale);};
    this.unsubscribe=store.subscribe(updateTitle);updateTitle();
  }
  dispose(){this.unsubscribe();this.localizer.dispose();}
}
