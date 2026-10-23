import fs from 'node:fs';
import * as THREE from 'three';
import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {library,hash} from '../lib/inner-palace-fixture.mjs';
import {restoreFrozenAxisFirewallBaseline} from './baseline-inverse.mjs';
import {TEXTURE_SPECS} from '../../src/utils/TextureLibrary.js';

export function axisFirewallBaseline() {
  const lib=library(),oldMat=lib.material;
  lib.material=(name,params={})=>oldMat(name,{color:TEXTURE_SPECS[name]?.fallback??'#b6afa1',...params});
  const scene=new THREE.Scene(),builder=new PalaceBuilder(scene,lib);
  builder.finish=g=>{g.userData.architecture=[];scene.add(g);return g;};
  let builderData;const build=builder.buildTerraceUnion.bind(builder);builder.buildTerraceUnion=(g,rects,options)=>{builderData={halls:PALACE_LAYOUT.filter(h=>['太和殿','中和殿','保和殿'].includes(h.name)),rects,options};return build(g,rects,options);};
  builder.buildComplex(PALACE_LAYOUT.filter(h=>['太和殿','中和殿','保和殿'].includes(h.name)),{name:'三台',apron:14,margin:4,bottom:{halfW:65,z0:-54,z1:178}});
  const kit=new CourtKit(lib,'axis-firewall-candidates');
  const axis=JSON.parse(fs.readFileSync(new URL('../../data/zones/axis-courts.json',import.meta.url)));
  const gates=axis.items.filter(i=>['中左门','中右门'].includes(i.name));
  const gateWidths=new Map();for(const gate of gates)gateWidths.set(gate.name,kit.gate(gate));
  for(const index of [13,15]) {const i=axis.items[index];kit.wall(...i.from,...i.to,{h:i.h,gaps:i.gaps.map(g=>({at:g.at,w:gateWidths.get(g.gate)}))});}
  const i=axis.items[31];kit.corridor(...i.from,...i.to,i.facing);
  kit.buildPlaqueAtlas();scene.add(kit.root);scene.updateMatrixWorld(true);
  // Explicit QA-only inverse. Production consumers never call this fixture.
  const inverseDelta=restoreFrozenAxisFirewallBaseline({scene,builder,kit,axis,builderData,qaAxisFirewallBaseline:true});
  const meshes=[];scene.traverse(m=>{if(m.isMesh){const box=new THREE.Box3().setFromObject(m);meshes.push({name:m.name,material:m.material.name,min:box.min.toArray(),max:box.max.toArray(),triangles:(m.geometry.index?.count??m.geometry.attributes.position.count)/3});}});
  const corridor=kit.root.children.at(-1),partitions=[];
  corridor.traverse(m=>{if(!m.isMesh||m.material.name!=='wall_red')return;m.geometry.computeBoundingBox();const size=m.geometry.boundingBox.getSize(new THREE.Vector3());if(Math.abs(size.x-.3)<1e-5&&Math.abs(size.z-4)<1e-5)partitions.push(new THREE.Box3().setFromObject(m));});
  const geometryHash=hash(meshes);
  return{scene,builder,kit,axis,meshes,partitions,geometryHash,builderData,qaAxisFirewallBaseline:true,fullGeometryHash:inverseDelta.after.fullGeometryHash,inverseDelta};
}
if(process.argv[1]===new URL(import.meta.url).pathname){
 const W=axisFirewallBaseline(),out=process.argv[2]??'/tmp/r58-firewall-baseline.json';
 fs.writeFileSync(out,JSON.stringify({baseCommit:'755dd9ac5c6f8a8766c1db3e8e4f8fe17fa142da',geometryHash:W.geometryHash,fullGeometryHash:W.fullGeometryHash,inverseDelta:W.inverseDelta,stats:{meshes:W.meshes.length,triangles:W.meshes.reduce((n,m)=>n+m.triangles,0),colliders:W.builder.colliders.length+W.kit.colliders.length,walkables:W.builder.walkables.length+W.kit.walkables.length},candidate31:{item:W.axis.items[31],solidRoomPartitions:W.partitions.map(b=>({min:b.min.toArray(),max:b.max.toArray()}))},meshes:W.meshes},null,2)+'\n');
 console.log(JSON.stringify({out,meshes:W.meshes.length,partitions:W.partitions.length,geometryHash:W.geometryHash}));
}
