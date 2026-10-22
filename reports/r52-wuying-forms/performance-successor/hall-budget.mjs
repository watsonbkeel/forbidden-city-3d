import fs from 'node:fs';
import { ZoneBase } from '../../../src/scene/zones/ZoneBase.js';
import { library } from '../../../tests/lib/inner-palace-fixture.mjs';
const config=JSON.parse(fs.readFileSync(new URL('../../../data/zones/outer-west.json',import.meta.url)));
const builder=new ZoneBase(library(),config);
for(const item of config.items.filter(i=>i.southCourtProfile?.startsWith('wuying')))builder.buildHall(item);
let triangles=0,meshes=0;builder.kit.root.traverse(n=>{if(n.isMesh){triangles+=(n.geometry.index?.count??n.geometry.attributes.position.count)/3;meshes++;}});
console.log(JSON.stringify({scope:'R36 Wuying front/rear/connector actual buildHall fixture, not full world',triangles,meshes,strictLimit:150000,pass:triangles<150000}));
