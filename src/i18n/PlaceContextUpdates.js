import data from '../../data/places/context-updates.json' with {type:'json'};
const updates=new Map(data.updates.map(row=>[row.id,row]));
/** Narrow, bilingual errata for stale model inventory, not historical rewrites. */
export function applyPlaceContextUpdate(place,locale) {
 const row=updates.get(place.id);if(!row)return place;
 if(place.evidenceNote?.text!==row.before[locale])throw Error(`Place context update source text drift: ${place.id}/${locale}`);
 return {...place,evidenceNote:{...place.evidenceNote,text:row.after[locale]}};
}
