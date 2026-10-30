import '../../tests/lib/inner-palace-fixture.mjs';import fs from 'node:fs';import{buildWorld}from'../../tests/lib/world.mjs';
const W=await buildWorld({realMaterials:true}),centers=[[-256.25,415.8],[-249.95,415.8]],rows=[];
for(const c of W.cm.colliders){if(centers.some(([x,z])=>c.box.min.x<x+.75&&c.box.max.x>x-.75&&c.box.min.z<z+.75&&c.box.max.z>z-.75)&&c.box.max.y>0&&c.box.min.y<2)rows.push({bounds:[c.box.min.toArray(),c.box.max.toArray()],owner:W.ownerOf(c)});}
fs.writeFileSync('reports/followup-suichu/existing-world.json',JSON.stringify({scope:'Actual full static world collision ownership near two proposed ground-level front facilities; not GPU or all mesh identification',centers,rows},null,2));console.log(JSON.stringify({count:rows.length,rows}));
