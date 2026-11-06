import data from '../../data/i18n/ui-en.json' with {type:'json'};
import {createTextTranslator} from './TextTranslator.js';
import {localizedPlaceName} from './PlaceLocale.js';
import {localeStore} from './LocaleStore.js';
export const missingTranslations = new Set();
const translate=createTextTranslator({messages:Object.fromEntries(Object.entries(data.messages).map(([key,value])=>[key,localizedPlaceName(key,undefined,'en')??value])),name:source=>localizedPlaceName(source,undefined,'en'),onMissing:source=>{if(missingTranslations.size<250)missingTranslations.add(source);}});
export const translateText=(text,locale=localeStore.locale)=>translate(text,locale);
