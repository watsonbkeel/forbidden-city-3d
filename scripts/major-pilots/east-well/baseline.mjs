import fs from 'node:fs';
import {buildWorld} from '../../../tests/lib/world.mjs';
// Capture-before harness: do not overwrite the preserved parent report from a candidate.
if(JSON.parse(fs.readFileSync('data/zones/garden.json')).eastWellProfile!==undefined)throw Error('Parent baseline must be captured before east-well profile installation');
const w=await buildWorld();
const region={minX:-53.65,maxX:-43.15,minZ:454.55,maxZ:465.05};
const near=w.cm.colliders.filter(c=>c.box.max.x>=region.minX&&c.box.min.x<=region.maxX&&c.box.max.z>=region.minZ&&c.box.min.z<=region.maxZ).map(c=>({bounds:[c.box.min.toArray(),c.box.max.toArray()],owner:w.ownerOf(c),keys:Object.keys(c).filter(k=>/surface|support|scope/i.test(k))}));
const report={parent:'8ad8c90',region,colliders:w.cm.colliders.length,near};
fs.writeFileSync('reports/major-pilots/east-well/baseline-world.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
