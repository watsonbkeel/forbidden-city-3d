// Read-only safe-parent census: no pavilion/profile/physics changes.
import fs from 'node:fs';
import {buildWorld} from '../../../tests/lib/world.mjs';
const w=await buildWorld(),region={minX:32.45,maxX:44.15,minZ:457.85,maxZ:469.55};
const near=w.cm.colliders.filter(c=>c.box.max.x>=region.minX&&c.box.min.x<=region.maxX&&c.box.max.z>=region.minZ&&c.box.min.z<=region.maxZ).map(c=>({bounds:[c.box.min.toArray(),c.box.max.toArray()],owner:w.ownerOf(c),keys:Object.keys(c).filter(k=>/surface|support|scope/i.test(k))}));
const report={parent:'1b5adc79',candidate:[38.3,463.7],uncertainty:1,region,scope:'Full-height collider census only; no claim of visible-source coverage or reachable routes',colliders:w.cm.colliders.length,near};
fs.writeFileSync('reports/major-pilots/west-well/preflight.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
