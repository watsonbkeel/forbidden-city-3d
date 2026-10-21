import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {TextureLibrary,TEXTURE_SPECS} from '../src/utils/TextureLibrary.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {resourceBudget} from './lib/resource-budget.mjs';
const config=JSON.parse(readFileSync(new URL('../data/zones/outer-west.json',import.meta.url)));
const evidence=JSON.parse(readFileSync(new URL('../data/architecture/wuying-2021-cases.json',import.meta.url)));
const selected=['scene_d102','scene_60'];
const watch=r=>{let n=0;r.addEventListener('dispose',()=>n++);return()=>n;};
function build(lib=library()){
  const builder=new ZoneBase(lib,config),cases=new Map(),source=new Map(),finish=builder.kit.finish;
  builder.kit.finish=function(){
    this.root.updateMatrixWorld(true);
    this.root.traverse(o=>{
      if(o.userData.role!=='wuying-independent-case'||!selected.includes(o.userData.scene))return;
      const parts=[];o.traverse(n=>{if(!n.isMesh)return;parts.push({role:n.userData.role,meta:structuredClone(n.userData),position:n.getWorldPosition(new THREE.Vector3()),box:new THREE.Box3().setFromObject(n),material:n.material,geometry:n.geometry});if(!source.has(n.geometry))source.set(n.geometry,watch(n.geometry));});
      cases.set(o.userData.scene,{meta:structuredClone(o.userData),parts});
    });
    return finish.call(this);
  };
  const data=builder.build();data.group.updateMatrixWorld(true);return{builder,data,cases,source};
}
function hits(f,from,dir,far,material){return new THREE.Raycaster(from,new THREE.Vector3(...dir),0,far).intersectObject(f.data.group,true).filter(h=>h.object.material===material);}
let cached;const fixture=()=>cached??=build();

test('R37 independent: final merged d102 has an open deep cavity, ceramic floor, and physical thick lip',()=>{
  const f=fixture(),c=f.cases.get('scene_d102'),p=c.parts.find(p=>p.role==='wuying-ceramic-form'),base=p.position,height=.44;
  for(const x of [0,.08,-.08]){
    const ray=hits(f,base.clone().add(new THREE.Vector3(x,height+.03,0)),[0,-1,0],height+.04,p.material);
    assert.ok(ray.length>0,'cavity floor must be present in final merged mesh');
    assert.ok(Math.abs(ray[0].point.y-base.y-.044)<1e-5,'opening must not be capped at mouth height');
  }
  const lip=hits(f,base.clone().add(new THREE.Vector3(.29,height+.03,0)),[0,-1,0],height+.04,p.material);
  assert.ok(lip.length>0&&lip[0].point.y-base.y>.40,'actual ceramic rim, not two coincident sheets');
  const side=hits(f,base.clone().add(new THREE.Vector3(0,.22,0)),[1,0,0],.5,p.material);
  assert.ok(side.length>0&&side[0].point.x-base.x>.17&&side[0].point.x-base.x<.23,'inner wall bounds cavity');
});

test('R37 independent: final merged scene60 mouth has a neutral inner floor, not a see-through bottom',()=>{
  const f=fixture(),form=f.cases.get('scene_60').parts.find(p=>p.role==='wuying-ceramic-form');
  for(const x of [0,.025,-.025]){
    const ray=hits(f,form.position.clone().add(new THREE.Vector3(x,.90,0)),[0,-1,0],.91,form.material);
    assert.ok(ray.length>0,'open mouth must terminate at actual inner ceramic surface');
    assert.ok(ray[0].point.y>form.position.y+.01&&ray[0].point.y<form.position.y+.65,'interior floor is neither absent nor a solid cap at the mouth');
  }
});

test('R37 independent: final merged scene60 ear centers are genuinely pierced and their rings remain solid',()=>{
  const f=fixture(),c=f.cases.get('scene_60'),ears=c.parts.filter(p=>p.role==='observed-vessel-ear');assert.equal(ears.length,2);
  for(const ear of ears){
    const center=ear.position;
    assert.equal(hits(f,center.clone().add(new THREE.Vector3(0,0,.15)),[0,0,-1],.3,ear.material).length,0,'ear center is empty, not a labeled solid handle');
    const ring=center.clone().add(new THREE.Vector3(0,.072*.86*1.25,.15));
    assert.ok(hits(f,ring,[0,0,-1],.3,ear.material).length>0,'top of ring is actual merged geometry');
  }
  assert.equal(c.parts.filter(p=>p.role==='observed-vessel-collar').length,4);
});

function pixel(texture,uv){
  const p=uv.clone();texture.transformUv(p);
  const {data,width,height}=texture.image,x=Math.min(width-1,Math.max(0,Math.floor(p.x*width))),y=Math.min(height-1,Math.max(0,Math.floor(p.y*height)));
  return [data[(y*width+x)*4],data[(y*width+x)*4+1],data[(y*width+x)*4+2]];
}
test('R37 independent: final merged UVs preserve private color maps and neutral unseen sectors',()=>{
  const f=fixture();
  for(const [scene,c]of f.cases){
    const form=c.parts.find(p=>p.role==='wuying-ceramic-form'),neutral=scene==='scene_d102'?[216,223,218]:[214,204,170],texture=form.material.map;
    assert.ok(texture?.isDataTexture,'visible color cues require a real runtime map');
    assert.ok(f.builder.kit.owned.includes(form.material));assert.ok(f.builder.kit.ownedTextures.includes(texture));
    assert.equal(texture.image.width,64);assert.equal(texture.image.height,128);assert.equal(texture.image.data.length,64*128*4);assert.ok(texture.version>0);
    let merged=0;f.data.group.traverse(o=>{if(o.isMesh&&o.material===form.material){merged++;assert.ok(o.geometry.attributes.uv);assert.equal(o.geometry.attributes.uv.count,o.geometry.attributes.position.count);assert.ok([...o.geometry.attributes.uv.array].every(Number.isFinite));}});assert.equal(merged,1);
    const height=scene==='scene_d102'?.44:.86,q=scene==='scene_d102'?.965:.61;
    const front=hits(f,form.position.clone().add(new THREE.Vector3(0,height*q,-1)),[0,0,1],2,form.material);
    const rear=hits(f,form.position.clone().add(new THREE.Vector3(0,height*q,1)),[0,0,-1],2,form.material);
    assert.ok(front.length>0&&rear.length>0,'ray hits actual final merged colored vessel surface');
    assert.notDeepEqual(pixel(texture,front[0].uv),neutral,'front accent must survive final render merge');
    assert.deepEqual(pixel(texture,rear[0].uv),neutral,'unseen reverse must remain neutral');
    const record=evidence.cases.find(e=>e.scene===scene);
    assert.equal(c.meta.source,record.photoFront);assert.equal(form.meta.source,record.photoFront);assert.equal(form.meta.objectIdentity,record.objectIdentity);
    assert.equal(form.meta.actualPeriod,'2021_OPENING_PANORAMA_NOT_2026_INVENTORY');assert.equal(form.meta.photographyDate,null);
    assert.equal(form.meta.unseenSurfacePolicy,'NEUTRAL_NO_INVENTED_REVERSE_DECORATION');
    const labels=c.parts.filter(p=>p.role==='observed-case-label');assert.equal(labels.length,1);assert.equal(labels[0].meta.textPolicy,'NO_UNVERIFIED_LABEL_TRANSCRIPTION');assert.ok(f.builder.kit.owned.includes(labels[0].material));
  }
  assert.notEqual(f.cases.get('scene_d102').parts.find(p=>p.role==='wuying-ceramic-form').material.map,f.cases.get('scene_60').parts.find(p=>p.role==='wuying-ceramic-form').material.map);
});

test('R37 independent: both final blank labels are exposed above plinth and remain inside their cases',()=>{
  const f=fixture();for(const c of f.cases.values()){
    const label=c.parts.find(p=>p.role==='observed-case-label'),glass=c.parts.find(p=>p.role==='independent-case-glass');
    assert.ok(glass.box.containsBox(label.box));
    const x=label.position.x,z=label.position.z;
    const ray=new THREE.Raycaster(new THREE.Vector3(x,label.box.max.y+.03,z),new THREE.Vector3(0,-1,0),0,.1).intersectObject(f.data.group,true).filter(h=>!h.object.material.transparent);
    assert.equal(ray[0]?.object.material,label.material,'label must be first opaque surface rather than buried inside pedestal');
  }
});

test('R37 independent: refined source meshes merge/dispose once and private materials never leak across rebuilds',()=>{
  const lib=new TextureLibrary();for(const n of Object.keys(TEXTURE_SPECS))lib.colors.set(n,new THREE.Texture({width:64,height:64}));
  const seen=new Set(),retired=[],borrowed=new Map();let budget,nav;
  try{for(let i=0;i<3;i++){
    const f=build(lib),owned=f.builder.kit.owned.filter(m=>/^wuying_observed_(form_(60|d102)|label_)/.test(m.name));assert.equal(owned.length,4);
    for(const count of f.source.values())assert.equal(count(),1);
    for(const m of owned){assert.equal(seen.has(m),false);seen.add(m);retired.push(watch(m));assert.equal(lib.owns(m),false);}
    const maps=[...f.cases.values()].map(c=>c.parts.find(p=>p.role==='wuying-ceramic-form').material.map);assert.equal(new Set(maps).size,2);for(const texture of maps){assert.ok(f.builder.kit.ownedTextures.includes(texture));assert.equal(seen.has(texture),false);seen.add(texture);retired.push(watch(texture));}
    f.data.group.traverse(o=>{if(o.geometry)retired.push(watch(o.geometry));});
    for(const m of [...lib.materials.values(),...lib.allTextures()])if(!borrowed.has(m))borrowed.set(m,watch(m));
    const current=resourceBudget([f.data.group]),navigation=JSON.stringify({colliders:f.data.colliders,walkables:f.data.walkables});
    if(i===0){budget=current;nav=navigation;}else{assert.deepEqual(current,budget);assert.equal(navigation,nav);}
    f.builder.dispose();f.builder.dispose();for(const count of retired)assert.equal(count(),1);for(const count of f.source.values())assert.equal(count(),1);for(const count of borrowed.values())assert.equal(count(),0);
  }}finally{lib.dispose();}
});
test.after(()=>cached?.builder.dispose());
