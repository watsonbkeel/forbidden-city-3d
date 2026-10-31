import assert from 'node:assert/strict';
import fs from 'node:fs';
import {mainObjectState} from './r157-wumen-main-object-state.mjs';
const oldObjectState=JSON.parse(fs.readFileSync(new URL('../fixtures/r157-wumen-main-object-state.json',import.meta.url))).signature;
import {snapshotWidth} from './wumen-main-width-snapshot.mjs';
import {digest} from './wumen-right-leaf-fixture.mjs';
export const expectedWidthAxes=Array.from({length:10},(_,i)=>i<=4?-30.025+i*(60.05/9.43):30.025-(9-i)*(60.05/9.43));
const same=(a,b,label)=>assert.equal(digest(a),digest(b),label);
function boxFit(row,width){
 const pos=row.geometry.attributes.position.array,nor=row.geometry.attributes.normal.array,uv=row.geometry.attributes.uv.array;
 for(let i=0;i<pos.length;i+=3)pos[i]=Math.fround(Math.sign(pos[i])*width/2);
 let lo=Infinity,hi=-Infinity;for(let i=1;i<pos.length;i+=3){lo=Math.min(lo,pos[i]);hi=Math.max(hi,pos[i]);}
 for(let j=0,i=0;i<pos.length;i+=3,j+=2){const [x,y,z]=pos.slice(i,i+3),[nx,ny,nz]=nor.slice(i,i+3),ax=Math.abs(nx),ay=Math.abs(ny),az=Math.abs(nz);let u,v;
  if(row.part==='closed-lattice-panel'){u=ax>ay&&ax>az?z:x;v=ay>ax&&ay>az?.5:(y-lo)/(hi-lo);}
  else if(ay>=ax&&ay>=az){u=x;v=z;}else if(ax>=az){u=z*Math.sign(nx||1);v=y;}else{u=x*Math.sign(nz||1);v=y;}
  uv[j]=Math.fround(u);uv[j+1]=Math.fround(v);
 }
}
export function expectedWidthRows(before){return before.rows.map(input=>{
 const r=structuredClone(input);
 if(r.part==='interior-column'||r.part==='outer-column'){
  const oldAxis=Math.round((r.position[0]+30.025)/(60.05/9));assert.ok(oldAxis>=0&&oldAxis<=9);r.position[0]=expectedWidthAxes[oldAxis];
  r.data.parameterStatus=r.part==='interior-column'?'SOURCE_BOUNDED_WIDTH_AND_DEPTH_SHAFT_PREVIEW_NOT_SURVEYED':'SOURCE_BOUNDED_WIDTH_RETAINED_HEIGHT_NOT_SURVEYED';
 }else if(r.part==='facade-wall'||r.part==='closed-lattice-panel'){
  const i=Number(r.data.facadeBayId.split('-').at(-1))-1;assert.ok(i>=0&&i<9);let a=Math.max(-(60.05-1.6)/2,expectedWidthAxes[i]),b=Math.min((60.05-1.6)/2,expectedWidthAxes[i+1]);
  if(i===4){if(r.position[0]<0)b=-2.5;else a=2.5;}
  r.position[0]=(a+b)/2;boxFit(r,b-a-(r.part==='closed-lattice-panel'?.24:0));
 }
 return r;
});}
export function verifyWidthContract(c,before){
 for(let o=c.tower;o;o=o.parent)assert.equal(o.visible,true,'effective tower ancestor visibility');
 const actual=snapshotWidth(c),expected=expectedWidthRows(before);
 same(actual.outside,before.outside,'all non-main gate geometry/render/physics/supports retained');same(actual.pose,before.pose,'main placement retained');
 same(actual.rows,expected,'only independently specified column/facade X geometry and explicit status delta');
 // Comparison-only cloned hierarchy: restore only previously authenticated X.
 // Actual nodes, flags, matrices, geometry and collision manager are not mutated.
 const view=c.tower.clone(true);view.children.forEach((m,i)=>{m.position.x=before.rows[i].position[0];});
 let child=view;for(let p=c.tower.parent;p;p=p.parent){const ancestor=p.clone(false);ancestor.add(child);child=ancestor;}
 same(mainObjectState(view),oldObjectState,'original all-node/ancestor flags with only permitted X/matrix translation normalized');
 const oldMeta=structuredClone(before.metadata),meta=structuredClone(actual.metadata),reg=meta.horizontalGrid.widthRegistration;
 assert.equal(reg.centreToSide,1.43);assert.equal(reg.retainedEnvelopeM,60.05);assert.equal(reg.columnAxisTotalSurveyed,false);assert.equal(reg.equalSideBaysAreSimplification,true);
 assert.equal(reg.status,'GRAPHICAL_RATIO_FIT_NOT_INDIVIDUAL_BAY_MEASUREMENTS');same(reg.observedRatio,{publication2005:[1.44127,1.44153],publication2021:[1.43001,1.43071]},'source observed ratios');
 assert.match(reg.limitations,/1–2 pixels/);assert.match(reg.limitations,/End side bays/);assert.match(reg.limitations,/may share a base drawing/);assert.match(reg.endpoints,/does not expressly establish column-centre/);
 same(Object.keys(reg).sort(),['centreToSide','retainedEnvelopeM','columnAxisTotalSurveyed','equalSideBaysAreSimplification','status','observedRatio','limitations','endpoints','sources'].sort(),'only defined source fields');
 same(reg.sources,['https://img.dpm.org.cn/Uploads/pdf/4884/T00124_00.pdf','https://www.dpm.org.cn/Uploads/File/2021/11/23/u619c5a27422d3.pdf'],'source URLs');
 delete meta.horizontalGrid.widthRegistration;meta.horizontalGrid.widthBaySpacing=oldMeta.horizontalGrid.widthBaySpacing;
 assert.equal(meta.facadeBays.length,18);for(const b of meta.facadeBays){const i=b.index;assert.equal(b.minX,Math.max(-(60.05-1.6)/2,expectedWidthAxes[i]));assert.equal(b.maxX,Math.min((60.05-1.6)/2,expectedWidthAxes[i+1]));b.minX=oldMeta.facadeBays.find(x=>x.id===b.id).minX;b.maxX=oldMeta.facadeBays.find(x=>x.id===b.id).maxX;}
 same(meta,oldMeta,'all other main metadata retained');
 const solid=new Set(['gable-wall','facade-wall','closed-lattice-panel','open-lattice-leaf','outer-column','interior-column']);
 const real=c.tower.children.filter(m=>solid.has(m.userData.gatePart));assert.equal(real.length,98);assert.equal(c.tower.userData.colliders.length,98);
 real.forEach((m,i)=>{m.updateMatrix();const b=new c.THREE.Box3().setFromBufferAttribute(m.geometry.attributes.position).applyMatrix4(m.matrix);b.min.y=Math.max(0,b.min.y);b.max.y=Math.min(3,b.max.y);assert.ok(b.equals(c.tower.userData.colliders[i]),'actual local solid bounds registered in order');});
 const moved=actual.rows.filter((r,i)=>digest({g:r.geometry,p:r.position})!==digest({g:before.rows[i].geometry,p:before.rows[i].position}));assert.equal(moved.length,88);assert.equal(actual.localColliders.filter((r,i)=>digest(r)!==digest(before.localColliders[i])).length,88);
 return {meshCount:actual.rows.length,changedGeometry:88,localColliders:98,changedColliders:88};
}

// QA-only prior-state comparison. Authentication above happens BEFORE any
// reconstruction. Never pass this object to a controller or a collision query.
export function priorWidthComparison(c,before){
 verifyWidthContract(c,before);
 const original=digest(snapshotWidth(c)),group=c.group.clone(true),index=c.group.children.indexOf(c.tower);assert.ok(index>=0);
 const tower=group.children[index],owned=[];
 for(let i=0;i<tower.children.length;i++){
  const m=tower.children[i],row=before.rows[i];m.position.x=row.position[0];m.userData=structuredClone(row.data);
  if(['facade-wall','closed-lattice-panel'].includes(row.part)){
   const g=m.geometry.clone();for(const[k,a]of Object.entries(row.geometry.attributes))g.setAttribute(k,new c.THREE.Float32BufferAttribute(a.array,a.itemSize));g.setIndex(row.geometry.index);g.groups=structuredClone(row.geometry.groups);m.geometry=g;owned.push(g);
  }
 }
 tower.userData.structure=structuredClone(before.metadata);
 const box=r=>new c.THREE.Box3(new c.THREE.Vector3().fromArray(r.min),new c.THREE.Vector3().fromArray(r.max));
 tower.userData.colliders=before.localColliders.map(box);
 const offset=new c.THREE.Vector3(c.data.position.x,c.tower.position.y,c.data.position.z),indices=new Set(),colliders=[...c.builder.colliders];
 c.tower.userData.colliders.forEach((b,i)=>{const world=b.clone().translate(offset),j=colliders.findIndex((x,k)=>!indices.has(k)&&x.equals(world));assert.ok(j>=0,'real main registration');indices.add(j);colliders[j]=box(before.localColliders[i]).translate(offset);});
 assert.equal(indices.size,98);group.updateMatrixWorld(true);same(digest(snapshotWidth(c)),original,'comparison must not mutate actual source objects or physical state');
 return {view:{...c,group,tower,builder:{colliders,walkables:c.builder.walkables}},dispose(){for(const g of owned)g.dispose();}};
}
