import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
export async function capture(root){
const moduleAt=p=>import(pathToFileURL(`${root}/${p}`));
const {ZoneBase}=await moduleAt('src/scene/zones/ZoneBase.js');
const {library}=await moduleAt('tests/lib/inner-palace-fixture.mjs');
const api=await moduleAt('src/scene/palace/special/RemainingOuterHalls.js');
const scope=JSON.parse(readFileSync(`${root}/docs/current-state/r48-remaining/outer-scope.json`));
const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const records=[];
for(const row of scope){if(!api.resolveRemainingProfile(row.zone,row.baselineItem))continue;
 const z=new ZoneBase(library(),{id:row.zone}),b=z.buildHall(row.baselineItem),k=z.kit;k.buildPlaqueAtlas();k.root.updateMatrixWorld(true);
 const mesh=[];b.f.traverse(m=>{if(!m.isMesh)return;mesh.push({name:m.name,world:m.matrixWorld.toArray(),visible:m.visible,material:(Array.isArray(m.material)?m.material:[m.material]).map(a=>({name:a.name,color:a.color?.getHex(),side:a.side,opacity:a.opacity,transparent:a.transparent,depthWrite:a.depthWrite,roughness:a.roughness,metalness:a.metalness,emissive:a.emissive?.getHex(),emissiveIntensity:a.emissiveIntensity})),attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([key,a])=>[key,{itemSize:a.itemSize,array:[...a.array]}])),index:m.geometry.index?[...m.geometry.index.array]:null});});
 records.push({id:row.id,name:row.name,meshCount:mesh.length,mesh:sha(mesh),colliders:sha(k.colliders),walkables:sha(k.walkables),rooms:sha(k.rooms),regions:sha(k.regions),mapItems:sha(k.mapItems),navigation:sha(api.resolveRemainingProfile(row.zone,row.baselineItem).navigation)});k.dispose(k.root);
}
return records;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const records=await capture(process.argv[2]);writeFileSync(process.argv[3],JSON.stringify(records,null,2));console.log(`${records.length} independently captured records -> ${process.argv[3]}`);}
