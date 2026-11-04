import fs from'node:fs';import assert from'node:assert/strict';
const old=JSON.parse(fs.readFileSync(new URL('./frozen/profiles.ee19.json',import.meta.url)));
export function normalizeQingshouNavigationForEE19(p){
 if(!['xunyan','qingshou'].includes(p.key))return p;
 const before=old.find(x=>x.key===p.key),index=p.key==='xunyan'?1:0;
 assert.equal(p.id,before.id);assert.equal(p.name,before.name);
 const expected=structuredClone(before.portals[index].approachPoints);for(const q of expected.slice(0,2))q.feetY=.5;
 const lists=[p.portals[index].approachPoints,p.navigation.portals[index].approachPoints];if(index===0)lists.push(p.navigation.approachPoints);if(p.groundNavigation){lists.push(p.groundNavigation.portals[index].approachPoints);if(index===0)lists.push(p.groundNavigation.approachPoints)}
 for(const list of lists)assert.deepEqual(list,expected,'only two exact covered point heights may change');
 for(const list of new Set(lists))for(const q of list.slice(0,2))q.feetY=0;
 return p;
}
export function normalizeArchitectureForEE19(records){for(const key of['xunyan','qingshou'])assert.equal(records.filter(p=>p.key===key).length,1);for(const p of records)normalizeQingshouNavigationForEE19(p);return records}
