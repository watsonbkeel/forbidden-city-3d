import assert from'node:assert/strict';
export const remainingImport="import {fitFanhuaStairApproach} from './FanhuaStairContact.js';\n",remainingCall=' fitFanhuaStairApproach(p);\n';
export function stripFanhuaRemaining(s){assert.equal(s.split(remainingImport).length,2,'unique Fanhua import');assert.equal(s.split(remainingCall).length,3,'exact two profile factory calls');return s.replace(remainingImport,'').replaceAll(remainingCall,'')}
export const frontLines=["import {addFanhuaStairContacts} from './FanhuaStairContact.js';\n",' addFanhuaStairContacts(c);\n'];
export function stripFanhuaFront(s){for(const line of frontLines){assert.equal(s.split(line).length,2,'unique Fanhua contact delta');s=s.replace(line,'')}return s}
