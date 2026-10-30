import fs from 'node:fs';import {buildWorld} from '../../../tests/lib/world.mjs';
const world=await buildWorld({realMaterials:true}),region={minX:22.3,maxX:36,minZ:457.1,maxZ:471.1};
const near=world.cm.colliders.filter(c=>c.box.max.x>=region.minX&&c.box.min.x<=region.maxX&&c.box.max.z>=region.minZ&&c.box.min.z<=region.maxZ).map(c=>({bounds:[c.box.min.toArray(),c.box.max.toArray()],owner:world.ownerOf(c),source:c.xiqingRoofSurface?.id??null}));
const report={parent:'71a9d7a5',scope:'Full-height registered collider census, NOT full visible source or route acceptance',region,near};fs.writeFileSync('reports/major-pilots/sishen/preflight.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
