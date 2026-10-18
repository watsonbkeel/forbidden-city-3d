import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';import * as THREE from 'three';import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {TAIHE_CORE as P} from '../src/scene/palace/special/TaiheCoreProfile.js';
import {captureTaiheControl} from './lib/taihe-core-fixture.mjs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url)),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const cfg=JSON.parse(read('data/interiors/taihe.json')),bytes=read('public'+cfg.model),gltf=JSON.parse(bytes.toString('utf8',20,20+bytes.readUInt32LE(12))),root=(await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.length),'')).scene;root.updateMatrixWorld(true);
const contract=root.getObjectByName('TAIHE_CORE_CONTRACT').userData,inventory=JSON.parse(contract.inventory),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-5,`${a} != ${b}`);
const item=name=>inventory.find(x=>x.name===name),extent=(item,k)=>item.max[k]-item.min[k];
const vertices=[],referencedVertices=[];root.traverse(o=>{if(o.isMesh){const g=o.geometry,p=g.attributes.position,ids=g.index?new Set(g.index.array):null;for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);vertices.push(v);if(!ids||ids.has(i))referencedVertices.push(v);}}});
function actualCorners(bounds){for(const k of [0,1,2])for(const edge of ['min','max'])assert.ok(referencedVertices.some(v=>Math.abs(v.getComponent(k)-bounds[edge][k])<1e-5&&[0,1,2].every(j=>v.getComponent(j)>=bounds.min[j]-1e-5&&v.getComponent(j)<=bounds.max[j]+1e-5)),`referenced decoded extremum exists for ${bounds.name} ${edge}[${k}]`);}
test('content-versioned S asset, approved card, profile and source digests are current',()=>{assert.match(cfg.model,/taihe-furnishing-surfaces-[a-f0-9]{12}\.glb$/);assert.equal(sha(bytes),cfg.asset.sha256);assert.equal(bytes.length,cfg.asset.encodedBytes);assert.equal(contract.profileSHA256,sha(read('data/architecture/taihe-core.json')));assert.equal(contract.sourceSHA256,sha(read('assets-src/interiors/taihe.py')));assert.equal(contract.approvalCardSHA256,P.approvalCardSHA256);assert.equal(cfg.budget.tris,18000);});
test('decoded integrated asset retains the V17 core allocation plus 3798 display triangles in eight batches, no proxy floor, font or image payload',()=>{let n=0;root.traverse(o=>{if(o.isMesh){assert.ok(!/^(COL_|WALK_)/.test(o.name));n+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;}});assert.equal(n,12128-320+472+2302-296+2980-1736+2240-374+544);assert.equal(n,17940);assert.equal(n-3798-2302-472+320-2980+296-2240+1736-544+374,8330);assert.ok(n-3798-2302-472+320-2980+296-2240+1736-544+374<=8978);assert.ok(n<=P.budgets.sVisibleTriangles);assert.equal(n,cfg.asset.renderableTriangles);assert.equal(gltf.meshes.length,8);assert.equal(gltf.materials.length,8);assert.equal(gltf.images?.length??0,0);assert.equal(gltf.textures?.length??0,0);assert.ok(inventory.every(o=>!o.name.startsWith('floor')));});
test('six actual column bodies retain nominal metre diameter at the two inferred lines',()=>{const columns=inventory.filter(o=>/^gold_column(?:\.\d+)?$/.test(o.name));assert.equal(columns.length,6);for(const v of columns){near(extent(v,0),1);near(extent(v,2),1);assert.ok(P.columns.x.some(x=>Math.abs((v.min[0]+v.max[0])/2-x)<1e-5));assert.ok(P.columns.goldZ.some(z=>Math.abs((v.min[2]+v.max[2])/2-z)<1e-5));actualCorners(v);}for(const v of inventory.filter(o=>/^gold_column_base/.test(o.name))){near(extent(v,0),1.16);actualCorners(v);}});
test('throne part dimensions remain published object dimensions, with no inflated cover boxes',()=>{const seat=item('throne_seat'),lower=item('throne_lower'),foot=item('throne_footstool'),back=item('furniture_throne_crown');near(extent(seat,0),1.585);near(extent(seat,2),.79);near(seat.max[1]-P.throne.baseY,.49);near(back.max[1]-P.throne.baseY,1.725);assert.equal(item('throne_back'),undefined);near(extent(lower,0),1.62);near(extent(lower,2),.995);near(extent(lower,1),.21);near(extent(foot,0),.705);near(extent(foot,2),.42);near(extent(foot,1),.3);for(const v of [seat,lower,foot,back])actualCorners(v);
 const pedestal=item('throne_pedestal');near(pedestal.max[1],P.throne.baseY);assert.ok(foot.min[2]>=pedestal.min[2]);assert.ok(foot.max[2]<=pedestal.max[2]);});
test('seven stepped replacement screens and open crowns retain the envelope and measured plaque/couplet frames',()=>{
 const panels=inventory.filter(o=>/^screenCrown_screen_\d_replacement_substrate$/.test(o.name)),crowns=inventory.filter(o=>/^screenCrown_screen_\d_open_crown$/.test(o.name));
 assert.equal(panels.length,7);assert.equal(crowns.length,7);assert.equal(inventory.filter(o=>/^screen_\d$/.test(o.name)).length,0);
 near(Math.max(...crowns.map(o=>o.max[1]))-P.screen.baseY,P.screen.height);
 for(let i=0;i<7;i++){const panel=item(`screenCrown_screen_${i}_replacement_substrate`),crown=item(`screenCrown_screen_${i}_open_crown`),top=P.screen.baseY+P.screen.height-Math.abs(i-3)*.33;near(panel.min[1],P.screen.baseY);near(panel.max[1],top-.35);near(crown.max[1],top);near(extent(panel,0),.585);near(extent(panel,2),P.screen.depth);actualCorners(panel);actualCorners(crown);}
 const p=item('plaque_frame');near(extent(p,0),6.8);near(extent(p,1),2.8);actualCorners(p);const q=inventory.filter(o=>/^couplet_frame(?:\.\d+)?$/.test(o.name));assert.equal(q.length,2);for(const v of q){near(extent(v,0),1);near(extent(v,1),7.5);actualCorners(v);}});
test('all exported caisson vertices stay below the retained roof and the exact replacement shell stays inside its envelope',()=>{const caisson=inventory.filter(o=>o.name.startsWith('caisson_'));assert.ok(caisson.length>10);for(const v of caisson)assert.ok(v.max[1]<=P.caisson.topY+1e-5);for(const v of inventory.filter(o=>o.name.startsWith('caisson_shell_'))){assert.ok(v.min[1]>=P.caisson.rimY+.12-1e-5);assert.ok(v.max[1]<=P.caisson.topY-.03+1e-5);for(const k of [0,2]){const centre=k===0?0:P.caisson.z;assert.ok(v.min[k]>=centre-2.84-1e-5);assert.ok(v.max[k]<=centre+2.84+1e-5);}actualCorners(v);}const body=captureTaiheControl('太和殿'),roof=body.group.children.find(o=>o.name==='roof_wudian');for(const v of vertices.filter(v=>v.y>P.caisson.rimY)){const ray=new THREE.Raycaster(new THREE.Vector3(v.x,P.frame.floorY+P.caisson.rimY-.01,v.z),new THREE.Vector3(0,1,0));const hit=ray.intersectObject(roof,true)[0];assert.ok(hit&&hit.point.y-(v.y+P.frame.floorY)>.0498,'actual roof clearance');}assert.equal(inventory.filter(o=>/^caisson_satellite(?:\.\d+)?$/.test(o.name)).length,6);assert.ok(item('caisson_center_sphere'));});
test('every decoded triangle is finite and nondegenerate; glyph faces point south with three bounded atlas regions',()=>{let glyphTriangles=0;root.traverse(o=>{if(!o.isMesh)return;const g=o.geometry,p=g.attributes.position,uv=g.attributes.uv,idx=g.index;for(let i=0;i<idx.count;i+=3){const ids=[idx.getX(i),idx.getX(i+1),idx.getX(i+2)],v=ids.map(j=>new THREE.Vector3().fromBufferAttribute(p,j));assert.ok(v.flatMap(q=>q.toArray()).every(Number.isFinite));const tri=new THREE.Triangle(...v);assert.ok(tri.getArea()>1e-10);if(o.material.name==='taihe_glyph_atlas'&&i<18){glyphTriangles++;assert.ok(tri.getNormal(new THREE.Vector3()).z<-.99);for(const j of ids){assert.ok(uv.getX(j)>=0&&uv.getX(j)<=1);assert.ok(uv.getY(j)>=0&&uv.getY(j)<=1);}}}});assert.equal(glyphTriangles,6);});
test('legacy raw assets and both shared generators remain byte-exact',()=>{const baseline=JSON.parse(read('docs/current-state/taihe-v16-core/geometry-baseline.json'));for(const [name,v]of Object.entries(baseline.assets))assert.equal(sha(read('public/models/interiors/'+name)),v.sha256,name);assert.equal(sha(read('assets-src/interiors/throne_hall.py')),'9f60405e759fc87974d44d035c3480d25ee4f5f2908b3fc1e16b8eff298359b9');assert.equal(sha(read('assets-src/interiors/_common.py')),'b57efc80a2a9ca78fdfbe44330b78bba40302fdd627acd0a800c56328dc111fa');});


test('actual shell inventory and retirement identity name only the nineteen approved old parts',()=>{
 const bytes=read('assets-src/interiors/taihe_caisson/retired_shell_faces.json'),mask=JSON.parse(bytes);
 assert.equal(sha(bytes),'231113dd6726175be9de932cbf6c0a36fe7466e88e5910df6aa9660f49ba2079');
 const retired=['caisson_square_to_oct','caisson_oct_to_round','caisson_upper_round',...Array.from({length:16},(_,i)=>'caisson_approx_rib'+(i?'.'+String(i).padStart(3,'0'):''))];
 assert.deepEqual([...mask.parts].sort(),retired.sort());assert.equal(mask.triangles.length,320);
 assert.equal(new Set(mask.triangles.map(t=>t.material+':'+t.triangleOrdinal)).size,320);
 for(const name of retired){assert.equal(mask.triangles.filter(t=>t.part===name).length,name.startsWith('caisson_approx_rib')?8:64);assert.equal(item(name),undefined);}
 assert.equal(contract.caissonRemovedTriangles,320);assert.equal(contract.caissonShellTriangles,472);assert.equal(contract.caissonTriangles,2302);
 assert.equal(contract.caissonShellRetirementSHA256,sha(read('assets-src/interiors/retire_taihe_shell.py')));assert.equal(contract.caissonShellMaskSHA256,'231113dd6726175be9de932cbf6c0a36fe7466e88e5910df6aa9660f49ba2079');
 assert.equal(contract.caissonShellSourceSHA256,sha(read('assets-src/interiors/taihe_caisson/shell.py')));
 const parts=['square_lower_ledge','square_inner_fascia','square_upper_ledge',...Array.from({length:4},(_,i)=>['corner_panel_'+i+'_frame','corner_panel_'+i+'_reveal','corner_panel_'+i+'_floor','side_panel_'+i+'_frame','side_panel_'+i+'_reveal','side_panel_'+i+'_floor']).flat(),'octagonal_fascia','octagonal_ledge','round_transition_panels','round_lower_ledge','round_inner_fascia','middle_round_recess','upper_round_ledge','upper_round_fascia','upper_recess','top_moulding'];
 const actual=inventory.filter(o=>o.name.startsWith('caisson_shell_'));
 assert.deepEqual(actual.map(o=>o.name).sort(),parts.map(n=>'caisson_shell_'+n).sort());assert.equal(actual.length,37);
 near(Math.min(...actual.map(o=>o.min[1])),P.caisson.rimY+.12);near(Math.max(...actual.map(o=>o.max[1])),P.caisson.topY-.03);
 assert.equal(inventory.filter(o=>/^caisson_square_rim(?:\.\d+)?$/.test(o.name)).length,4);assert.ok(item('caisson_top'));assert.ok(item('caisson_center_sphere'));
 assert.equal(cfg.asset.fallbackCaissonShellTriangles,48);assert.equal(P.budgets.fallbackVisibleTriangles,1600);assert.equal(P.budgets.sVisibleTriangles,18000);
});


test('screen crown contract pins its frozen base, exact retirement and appended source identities',()=>{
 const identities={
  screenCrownSourceSHA256:sha(read('assets-src/interiors/taihe_screen_crowns/geometry.py')),
  screenCrownBaseAssetSHA256:sha(read('public/models/interiors/taihe-furniture-0bfa52b758cb.glb')),
  screenCrownIntegrationSHA256:sha(read('assets-src/interiors/append_taihe_screen.py')),
  screenCrownRetirementSHA256:sha(read('assets-src/interiors/taihe_screen_crowns/retire.py')),
  screenCrownMaskSHA256:sha(read('assets-src/interiors/taihe_screen_crowns/retired_screen_header_faces.json')),
  screenCrownTriangles:2240,screenCrownRemovedTriangles:1736
 };
 assert.equal(identities.screenCrownBaseAssetSHA256,'0bfa52b758cba052b0b8258ebc338cb9b0f80129e00d0bb5970ef343758432ea');
 assert.equal(identities.screenCrownMaskSHA256,'7231ffb388115f3cf3f9e9745de82e645bd9cda091a2d352c795d54479490805');
 for(const [key,value] of Object.entries(identities)){assert.equal(contract[key],value,key);assert.equal(cfg.asset[key],value,key);}
 const mask=JSON.parse(read('assets-src/interiors/taihe_screen_crowns/retired_screen_header_faces.json'));
 assert.equal(mask.triangles.length,1736);assert.equal(new Set(mask.triangles.map(t=>t.material+':'+t.triangleOrdinal)).size,1736);
 assert.equal(mask.retiredInventoryNames.length,70);assert.equal(mask.partialInventoryNames.length,7);
 for(const name of mask.retiredInventoryNames)assert.equal(item(name),undefined,name);
 for(const name of mask.partialInventoryNames)assert.ok(item(name),name);
 const parts=['replacement_substrate','replacement_panel','replacement_panel.001','replacement_stile','replacement_stile.001','replacement_stile.002','replacement_stile.003','replacement_rail.001','replacement_rail.003','replacement_cap_frame','open_crown'];
 const expected=Array.from({length:7},(_,i)=>parts.map(part=>`screenCrown_screen_${i}_${part}`)).flat().sort();
 assert.deepEqual(inventory.filter(o=>o.name.startsWith('screenCrown_')).map(o=>o.name).sort(),expected);
 for(const name of expected)actualCorners(item(name));
});


test('enamel crane contract pins the frozen crown base and all replacement identities',()=>{
 const identities={
  enamelCraneSourceSHA256:sha(read('assets-src/interiors/taihe_cranes/crane_replacement.py')),
  enamelCraneBaseAssetSHA256:sha(read('public/models/interiors/taihe-screen-crowns-22c6acdf581d.glb')),
  enamelCraneIntegrationSHA256:sha(read('assets-src/interiors/append_taihe_cranes.py')),
  enamelCraneRetirementSHA256:sha(read('assets-src/interiors/taihe_cranes/retire.py')),
  enamelCraneMaskSHA256:sha(read('assets-src/interiors/taihe_cranes/retired_crane_faces.json')),
  enamelCraneTriangles:544,enamelCraneRemovedTriangles:374
 };
 assert.equal(identities.enamelCraneBaseAssetSHA256,'22c6acdf581dc7779b876963fd935ee482bd22e2a6671b486f9571debc14ac19');
 for(const [key,value] of Object.entries(identities)){assert.equal(contract[key],value,key);assert.equal(cfg.asset[key],value,key);}
});
