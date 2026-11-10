import {englishNameInfo} from './OfficialPlaceNames.js';
import supplemental from '../../data/places/supplemental.json' with {type:'json'};
import {applyPlaceContextUpdate} from './PlaceContextUpdates.js';
import base from '../../data/places/zh-CN.json' with {type:'json'};
import english from '../../data/places/en.json' with {type:'json'};
import {localeStore} from './LocaleStore.js';
import {validatePlaceTranslations,localizePlace,placeSearchTerms,normalizeSearch} from './PlaceTranslations.js';
import {placeDisplayName} from '../ui/PublicPlaceNames.js';
export const PLACE_TRANSLATIONS=validatePlaceTranslations(base,english);
const supplementalById=new Map(supplemental.records.map(row=>[row.id,row]));
const byName=new Map();
for(const place of [...base.places,...supplemental.records]) {
  const previous=byName.get(place.name);
  byName.set(place.name,previous===undefined?place.id:null);
}
function translatedPlace(place,locale=localeStore.locale) {
 if(!place)return null;
 if(place.catalogKind!=='supplemental')return applyPlaceContextUpdate(localizePlace(place,locale,PLACE_TRANSLATIONS),locale);
 const row=place.supplementalText,key=locale==='en'?'en':'zh';
 return {...place,displayName:locale==='en'?row.nameEn:row.displayName,functionTag:row.functionTag[key],summary:{...place.summary,text:row.summary[key]},evidenceNote:{...place.evidenceNote,text:row.evidenceNote[key]},modelExperience:{...place.modelExperience,actionLabel:locale==='en'?'Go to this place':'前往此处',disclaimer:row.modelNote[key]},siteAccess:{...place.siteAccess,disclaimer:row.siteAccess[key]}};
}
export function localizedPlace(place,locale=localeStore.locale) {
 const result=translatedPlace(place,locale);if(!result||locale!=='en')return result;
 const officialName=englishNameInfo(place.id).officialDisplayName;
 return officialName?{...result,displayName:officialName}:result;
}
export function localizedPlaceName(name,id,locale=localeStore.locale) {
  if(locale!=='en')return placeDisplayName(name);
  const key=id??byName.get(name),entry=PLACE_TRANSLATIONS.places[key];
  return englishNameInfo(key).officialDisplayName??entry?.name??supplementalById.get(key)?.nameEn??null;
}
const sourcePublisherEn = new Map([['故宫博物院','The Palace Museum'],['北京市文物局','Beijing Municipal Cultural Heritage Bureau']]);
export const localizedSource = (source,locale=localeStore.locale) => locale!=='en'?source:source.titleEn?{...source,title:source.titleEn,publisher:sourcePublisherEn.get(source.publisher)??source.publisher}:PLACE_TRANSLATIONS.sources[source.id]?{...source,...PLACE_TRANSLATIONS.sources[source.id]}:source;
const projectSearchTerms = place => place.catalogKind==='supplemental'?[place.name,place.supplementalText.displayName,place.supplementalText.nameEn,...place.supplementalText.pinyin,...place.supplementalText.pinyin.map(p=>p.replaceAll(' ',''))].map(normalizeSearch):placeSearchTerms(place,PLACE_TRANSLATIONS);

export const bilingualSearchTerms = place => [...new Set([...projectSearchTerms(place),...englishNameInfo(place.id).searchTerms.map(normalizeSearch)])];
