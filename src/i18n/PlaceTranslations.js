const fail = message => { throw Error(`Place translation: ${message}`); };
const sameKeys = (a, b) => JSON.stringify(Object.keys(a).sort()) === JSON.stringify(Object.keys(b).sort());
const object = value => value && typeof value === 'object' && !Array.isArray(value);
function english(value) {
  if (typeof value !== 'string' || !value.trim() || value !== value.trim() || /[<>\u3400-\u9fff]/u.test(value) || /^(?:TODO|TBD|placeholder|translation pending)$/i.test(value)) fail('missing or invalid English text');
}
function keys(value, expected) {
  if (!object(value) || !sameKeys(value, Object.fromEntries(expected.map(k=>[k,true])))) fail('translation fields differ from source');
}
const factKeys = ['summary', 'residenceNote', 'evidenceNote'];
function validateFact(original, translation) {
  if (original.period !== undefined) { keys(translation, ['text', 'period']); english(translation.text); english(translation.period); }
  else english(translation);
}
function matchingArray(original, translated, inspect) {
  if (!Array.isArray(translated) || translated.length !== original.length) fail('translation count differs from source');
  original.forEach((value,index)=>inspect(value,translated[index]));
}
/** Validate text-only overlays. Source and navigation metadata cannot be supplied. */
export function validatePlaceTranslations(base, translations) {
  keys(translations,['schemaVersion','language','translationKind','sources','places']);
  if(translations.schemaVersion!==1||translations.language!=='en'||translations.translationKind!=='project-translation')fail('unsupported translation metadata');
  if(!object(translations.places)||!sameKeys(translations.places,Object.fromEntries(base.places.map(p=>[p.id,true]))))fail('place IDs differ');
  if(!object(translations.sources)||!sameKeys(translations.sources,Object.fromEntries(base.sources.map(p=>[p.id,true]))))fail('source IDs differ');
  for(const source of base.sources){const row=translations.sources[source.id];keys(row,['title','publisher']);english(row.title);if(row.publisher!=='The Palace Museum')fail('source publisher must stay Palace Museum');}
  for(const p of base.places){
    const row=translations.places[p.id],fields=['name','pinyin','functionTag','summary','functions','people','timeline','modelExperience','siteAccess'];
    for(const key of ['residenceNote','canonicalName','aliases','evidenceNote','interiorGuide'])if(p[key]!==undefined)fields.push(key);
    keys(row,fields);english(row.name);english(row.functionTag);
    if(!Array.isArray(row.pinyin)||!row.pinyin.length||row.pinyin.some(x=>typeof x!=='string'||!x.trim()||!/[a-z]/.test(x)||!/^[a-z0-9 '\-]+$/.test(x)))fail('invalid pinyin search names');
    for(const key of factKeys)if(p[key]!==undefined)validateFact(p[key],row[key]);
    matchingArray(p.functions,row.functions,validateFact);
    matchingArray(p.timeline,row.timeline,(a,b)=>{keys(b,['text','period']);english(b.text);english(b.period);});
    matchingArray(p.people,row.people,(a,b)=>{keys(b,['name','period','text']);english(b.name);english(b.period);english(b.text);});
    if(p.canonicalName!==undefined)english(row.canonicalName);
    if(p.aliases!==undefined)matchingArray(p.aliases,row.aliases,(_a,b)=>english(b));
    if(p.interiorGuide){keys(row.interiorGuide,['notice','items']);english(row.interiorGuide.notice);matchingArray(p.interiorGuide.items,row.interiorGuide.items,(_a,b)=>{keys(b,['title','text']);english(b.title);english(b.text);});}
    keys(row.modelExperience,['actionLabel','disclaimer']);english(row.modelExperience.actionLabel);english(row.modelExperience.disclaimer);
    keys(row.siteAccess,['disclaimer',...(p.siteAccess.notice?['notice']:[])]);english(row.siteAccess.disclaimer);if(p.siteAccess.notice)validateFact(p.siteAccess.notice,row.siteAccess.notice);
  }
  return translations;
}
const translatedFact = (fact,text) => ({...fact,...(typeof text==='string'?{text}:text)});
/** name remains the original navigation key. displayName is presentation only. */
export function localizePlace(place,locale,translations) {
  if(locale!=='en')return place;
  const row=translations.places[place.id];if(!row)fail(`English is unavailable for ${place.id}`);
  const result={...place,displayName:row.name,functionTag:row.functionTag,
    summary:translatedFact(place.summary,row.summary),
    functions:place.functions.map((f,i)=>translatedFact(f,row.functions[i])),
    people:place.people.map((f,i)=>({...f,...row.people[i]})),
    timeline:place.timeline.map((f,i)=>({...f,...row.timeline[i]})),
    modelExperience:{...place.modelExperience,...row.modelExperience},
    siteAccess:{...place.siteAccess,disclaimer:row.siteAccess.disclaimer}};
  for(const key of ['residenceNote','evidenceNote'])if(place[key])result[key]=translatedFact(place[key],row[key]);
  if(place.canonicalName!==undefined)result.canonicalName=row.canonicalName;
  if(place.aliases)result.aliases=place.aliases.map((f,i)=>({...f,name:row.aliases[i]}));
  if(place.siteAccess.notice)result.siteAccess.notice=translatedFact(place.siteAccess.notice,row.siteAccess.notice);
  if(place.interiorGuide)result.interiorGuide={notice:row.interiorGuide.notice,items:place.interiorGuide.items.map((f,i)=>({...f,...row.interiorGuide.items[i]}))};
  return result;
}
export const normalizeSearch = value => String(value).normalize('NFKC').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
export function placeSearchTerms(place,translations) {
  const row=translations.places[place.id];
  return [...new Set([place.name,place.canonicalName,...(place.aliases??[]).map(a=>a.name),row?.name,row?.canonicalName,...(row?.aliases??[]),...(row?.pinyin??[])].filter(Boolean).map(normalizeSearch))];
}
