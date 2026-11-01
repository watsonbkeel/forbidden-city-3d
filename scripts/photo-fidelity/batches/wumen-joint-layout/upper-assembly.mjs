import * as T from 'three';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {PalaceBuilder} from '../../../../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../../../../src/scene/Layout.js';
import {applyBoxUV,applyBandUV,scaleCylinderUV} from '../../../../src/utils/GeometryUV.js';
import {createWumenAssemblyContract,verifyAssemblyInputs} from './assembly-contract.mjs';
import {upperPredecessorSignature,verifyUpperPredecessor,decodeUpperPredecessorBaseline} from './upper-baseline.mjs';
import {createRoofSection} from './roof-section-evaluator.mjs';
import {buildRoofSectionSurfaces} from './roof-section-surfaces.mjs';
import {buildRoofSectionTrims} from './roof-section-trims.mjs';
import {buildWumenJointVisiblePlatform} from './visible-platform.mjs';
const baseline=decodeUpperPredecessorBaseline(readFileSync(new URL('../../../../tests/fixtures/wumen-joint-layout/upper-predecessor-a32-v2.json.gz',import.meta.url))).signature;
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const get=(g,p)=>p.reduce((o,i)=>o.children[i],g);
const resources=root=>{const set=new Set();root.traverse(o=>{if(o.geometry)set.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[]){set.add(m);for(const v of Object.values(m))if(v?.isTexture)set.add(v);}});return set;};
/** Own-object graph, never prototypes or functions. Typed-array backing buffers
 * are writable identities too. PALACE_LAYOUT is deliberately outside this graph. */
function captureWritableObjects(c){const seen=new Map();function walk(v,path){if(!v||typeof v!=='object'||seen.has(v))return;seen.set(v,path);if(ArrayBuffer.isView(v)){walk(v.buffer,path+'.buffer');return;}if(v instanceof ArrayBuffer)return;for(const key of Object.keys(v)){if(key==='_listeners')continue;walk(v[key],path+'.'+key);}}walk(c.group,'group');walk(c.builder.colliders,'colliders');walk(c.builder.walkables,'walkables');return seen;}
function detachSharedMetadata(a,b){const left=captureWritableObjects(a),memo=new Map();function detach(v){if(!v||typeof v!=='object')return v;if(memo.has(v))return memo.get(v);const shared=left.has(v);if(shared&&!Array.isArray(v)&&Object.getPrototypeOf(v)!==Object.prototype)throw Error('unexpected shared non-plain metadata');const out=shared?(Array.isArray(v)?[]:{}):v;memo.set(v,out);for(const key of Object.keys(v)){const next=detach(v[key]);if(shared)Object.defineProperty(out,key,{...Object.getOwnPropertyDescriptor(v,key),value:next});else if(next!==v[key])v[key]=next;}return out;}b.group.traverse(o=>{o.userData=detach(o.userData);});}
export function verifyAssemblyCaptureIsolation(a,b){const left=captureWritableObjects(a),right=captureWritableObjects(b);for(const [v,path]of right)if(left.has(v))throw Error('assembly writable alias '+path+' / '+left.get(v));return{sharedLayoutOnly:a.data===b.data,writableAliases:0,checkedObjects:right.size};}
/** Same actual PalaceBuilder fixture inputs, with an explicit owner for its
 * material cache. Original captureGate overrides finish and hides that cache. */
function ownedCapture(){
 const ctx=new Proxy({},{get:()=>()=>({data:[]}),set:()=>true});globalThis.document??={createElement:()=>({getContext:()=>ctx,width:0,height:0}),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
 const materials=new Set(),cache=new Map(),lib={material:(name,params={})=>{const key=name+JSON.stringify(params);if(!cache.has(key)){const m=new T.MeshStandardMaterial({name,...params});cache.set(key,m);materials.add(m);}return cache.get(key);},tileSize:()=>1,aspect:()=>1};
 const data=PALACE_LAYOUT.find(d=>d.name==='午门'),builder=new PalaceBuilder(new T.Scene(),lib);let group;builder.finish=g=>{group=g;g.updateMatrixWorld(true);return g;};builder.buildGate(data);return{THREE:T,group,tower:group.children.find(o=>o.userData.structure?.id==='axis/wumen-upper-tower'),builder,data,lib,libraryMaterials:materials};
}
/** Complete uninstalled diagnostic assembly. No CollisionManager registration.
 * Source/reference disposal is NEVER delegated to candidate ownership. */
export function buildWumenAssemblyCandidate({reference,contract=createWumenAssemblyContract(),failAt=null,onResource=null}={}){
 verifyAssemblyInputs(contract);contract=createWumenAssemblyContract();if(!reference?.group)throw Error('assembly reference required');verifyUpperPredecessor(upperPredecessorSignature(reference),baseline);
 const referenceBefore=digest(upperPredecessorSignature(reference)),aResources=resources(reference.group),manual=new Set(),external=new Set(),handles=[],all=new Set(),retirementEvents=new Map(),retirementListeners=new Map();let disposed=false,B;
 const register=(r,own=true,notify=true)=>{if(aResources.has(r))throw Error('assembly writable resource aliases reference');if(own)manual.add(r);else external.add(r);if(!all.has(r)){all.add(r);retirementEvents.set(r,0);const listener=()=>retirementEvents.set(r,retirementEvents.get(r)+1);retirementListeners.set(r,listener);r.addEventListener('dispose',listener);if(notify)onResource?.(r);}return r;};
 const own=g=>register(g),addHandle=h=>{handles.push(h);for(const r of resources(h.group)){if(r.isBufferGeometry)register(r,false);else register(r);}return h;};
 const collectSource=()=>{const captured=new Set([...resources(B.group),...(B.builder.ownedMaterials??[]),...B.libraryMaterials]);for(const r of captured)register(r,true,false);for(const r of captured)onResource?.(r);};
 const dispose=()=>{if(disposed)return;disposed=true;const errors=[];for(const h of handles)try{h.dispose();}catch(e){errors.push(e);}for(const r of [...manual].sort((a,b)=>Number(!!b.isMaterial)-Number(!!a.isMaterial)))if(!external.has(r)&&retirementEvents.get(r)===0)try{r.dispose();}catch(e){errors.push(e);}for(const [r,listener]of retirementListeners)r.removeEventListener('dispose',listener);if(errors.length)throw new AggregateError(errors,'assembly resource retirement');};
 const phase=name=>{if(failAt===name)throw Error('assembly injected failure '+name);};
 try{
  B=ownedCapture();detachSharedMetadata(reference,B);verifyUpperPredecessor(upperPredecessorSignature(B),baseline);collectSource();
  const isolation=verifyAssemblyCaptureIsolation(reference,B);
  if(B.group===reference.group||B.builder.colliders===reference.builder.colliders||B.builder.walkables===reference.builder.walkables)throw Error('assembly reference capture aliases');
  const nodeByPath=new Map();function visit(o,p=[]){nodeByPath.set(JSON.stringify(p),o);o.children.forEach((n,i)=>visit(n,[...p,i]));}visit(B.group);
  const root=new T.Group();root.name='UNINSTALLED-WUMEN-INTEGRATED-ASSEMBLY';root.userData={scope:'FULL_VISIBLE_DIAGNOSTIC_NO_PHYSICAL_REGISTRATION',accepted:false,runtimeInstalled:false,routeAccepted:false};
  const platform=addHandle(buildWumenJointVisiblePlatform(B));root.add(platform.group);
  const retained={mainBody:get(B.group,[2]),mainRoof:get(B.group,[3]),plaque:get(B.group,[4])},retiredTargets=[...B.group.children].filter(o=>!Object.values(retained).includes(o));for(const o of Object.values(retained))root.add(o);for(const o of retiredTargets)o.removeFromParent();
  const upperInstances=[],shafts=[],links=[],interfaceMarkers=[],roofConstructionRoles=[],roofLayers=[];
  const mat=name=>{const m=B.lib.material(name);register(m);return m;};
  const box=(parent,name,material,size,pos,band=false,copy=null)=>{const geo=own((band?applyBandUV:applyBoxUV)(new T.BoxGeometry(...size),1)),m=new T.Mesh(geo,material);m.castShadow=m.receiveShadow=true;if(copy){m.castShadow=copy.castShadow;m.receiveShadow=copy.receiveShadow;m.visible=copy.visible;m.layers.mask=copy.layers.mask;m.renderOrder=copy.renderOrder;}m.name=name;m.position.set(...pos);parent.add(m);return m;};
  for(const t of contract.targetGroups.filter(t=>t.kind!=='link')){
   const old=nodeByPath.get(JSON.stringify(t.originalBTargetPaths[0])),oldBody=t.kind==='wing'?old.children[0]:old;
   const g=new T.Group();g.name=t.id;g.position.set(...t.bodyFrame.translationXYZ);g.rotation.y=t.bodyFrame.rotationY;g.userData={structure:{id:t.id,status:'UNINSTALLED_REGISTERED_ENGINEERING_BODY',wholeObjectAccepted:false},sourceStructure:structuredClone(old.userData.structure??{}),localPhysicsStatus:'NOT_REGISTERED_TASK4_PENDING'};root.add(g);
   const height=t.bodyHeight,beamH=T.MathUtils.clamp(height*.12,.6,2),wallH=height-beamH,[w,d]=t.columnAxisSize;
   const body=box(g,'closed-body',oldBody.children[0].material,[w-1.6,wallH,d-1.6],[0,wallH/2,0],false,oldBody.children[0]);
   const facade=oldBody.children[1];box(g,'south-closed-facade',facade.material,[w-1.6+.02,wallH*.9,.2],[0,wallH*.45,-(d/2-.8)-.1],true,facade);
   let north;
   if(t.id==='INSTANCE-A-WUMEN-EAST-NORTH-PAVILION')north=buildNE(g,nodeByPath.get('[8,2]'),contract.enclosure.NE.northEnclosure,own);
   else{north=box(g,'north-closed-facade',facade.material,[w-1.6+.02,wallH*.9,.2],[0,wallH*.45,(d/2-.8)+.1],true,facade);north.rotation.y=Math.PI;}
   const beamSource=oldBody.children.find(o=>o.isMesh&&o.material.name==='caihua_beam');const beam=box(g,'retained-height-wide-beam',beamSource.material,[w+.4,beamH,d+.4],[0,wallH+beamH/2,0],true,beamSource);
   const ownRows=contract.shafts.filter(r=>r.owner===t.id&&['MOVE_ONLY_PRESERVE_COLUMN_GEOMETRY_MATERIAL','ADD_SOURCE_READ_NON_INTERFACE_SHAFT'].includes(r.action));
   const template=oldBody.children.find(m=>m.geometry?.type==='CylinderGeometry');
   for(const r of ownRows){let m;if(r.path){m=nodeByPath.get(JSON.stringify(r.path));m.removeFromParent();}else{m=new T.Mesh(own(template.geometry.clone()),template.material);m.castShadow=template.castShadow;m.receiveShadow=template.receiveShadow;m.position.y=template.position.y;}const [x,z]=r.proposedAxisXZ;const dx=x-t.positionXZ[0],dz=z-t.positionXZ[1];m.position.x=t.kind==='wing'?-dz:dx;m.position.z=t.kind==='wing'?dx:dz;g.add(m);shafts.push({mesh:m,role:r});}
   upperInstances.push({id:t.id,group:g,source:old,closedBody:body,beam,northFacade:north});if(upperInstances.length===1)phase('body0');
  }
  // Borrow actual B-owned source materials, including RoofBuilder's explicit
  // ridge/finial colours. A remains independent; the B fixture ledger owns them.
  const sourceMaterial=(t,name)=>{const old=nodeByPath.get(JSON.stringify(t.originalBTargetPaths[t.kind==='wing'?0:1]));let found;old.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[])if(m.name===name)found??=m;});if(!found&&name==='roof_finial_gold')for(const r of all)if(r.isMaterial&&r.name===name){found=r;break;}if(!found)throw Error('missing actual source roof material '+t.id+'/'+name);return found;};
  const paletteFor=t=>({tile:sourceMaterial(t,'roof_tile'),soffit:sourceMaterial(t,'rafters'),fascia:sourceMaterial(t,'rafters'),ridge:sourceMaterial(t,'roof_ridge_glaze'),gold:sourceMaterial(t,'roof_finial_gold')});
  for(const t of contract.targetGroups.filter(t=>t.kind!=='link'))for(const layer of t.kind==='pavilion'?['lower','upper']:['single']){
   const palette=paletteFor(t),section=createRoofSection(t.id,layer,'proposal'),surface=addHandle(buildRoofSectionSurfaces(section,palette)),trim=addHandle(buildRoofSectionTrims(section,palette));for(const g of [surface.group,trim.group])g.traverse(m=>{if(m.isMesh)m.castShadow=m.receiveShadow=true;});root.add(surface.group,trim.group);roofLayers.push({instanceId:t.id,layer,section,surface,trim});if(roofLayers.length===1)phase('roof0');
  }
  for(const r of contract.roofConstructionRoles){const t=contract.targetGroups.find(t=>t.id===r.instance),layer=r.layer==='inter-eave'?'upper':r.layer,q=createRoofSection(r.instance,layer,'proposal');const g=own(buildRoleGeometry(r,q));const m=new T.Mesh(g,sourceMaterial(t,{rafters:'rafters',dougong:'dougong_band',wood:'wood_column',caihua:'caihua_beam'}[r.materialRole]));m.name=r.id;m.castShadow=m.receiveShadow=true;const frame=t.roofFrame;m.position.set(...frame.translationXYZ);m.rotation.y=frame.rotationY;root.add(m);roofConstructionRoles.push({mesh:m,role:r});}
  for(const l of contract.links){const g=new T.Group();g.name=l.id;g.userData={structure:{id:l.id,status:'ENGINEERING_LINK_NO_RUNTIME_AUTHORITY'}};root.add(g);const posts=[];const geo=own(scaleCylinderUV(new T.CylinderGeometry(.19,.22,4.1,12),.22,4.1,1));for(const p of l.posts){const m=new T.Mesh(geo,mat('wood_column'));m.position.set(...p);m.castShadow=m.receiveShadow=true;g.add(m);posts.push(m);}const sign=l.side==='east'?-1:1,[x0,,,x1]=l.absXKnots,[z0,,,z1]=l.zKnots;for(const z of[z0,z1])box(g,'longitudinal-beam',mat('caihua_beam'),[x1-x0+.45,.66,.38],[sign*(x0+x1)/2,16.39,z]);for(const x of l.absXKnots)box(g,'transverse-beam',mat('caihua_beam'),[.38,.66,z1-z0+.38],[sign*x,16.39,(z0+z1)/2]);const roof=new T.Mesh(own(buildLinkRoof(l)),mat('roof_tile'));roof.name='mapped-low-link-roof';roof.castShadow=roof.receiveShadow=true;g.add(roof);links.push({id:l.id,group:g,posts,roof});}
  const markerMat=own(new T.LineBasicMaterial({color:0x1688cb}));for(const r of contract.interfaceMarkers){const geo=own(new T.BufferGeometry().setFromPoints([new T.Vector3(-.15,0,0),new T.Vector3(.15,0,0),new T.Vector3(0,0,-.15),new T.Vector3(0,0,.15)])),m=new T.LineSegments(geo,markerMat);m.position.set(...r.positionXYZ);m.name=r.id;m.userData={reference:r};root.add(m);interfaceMarkers.push(m);}
  for(const m of B.libraryMaterials)register(m);root.updateMatrixWorld(true);
  if([...retirementEvents.values()].some(n=>n!==0))throw Error('assembly retired a retained or live resource during construction');
  if(digest(upperPredecessorSignature(reference))!==referenceBefore)throw Error('assembly mutated caller reference');
  return{group:root,originalReference:reference,candidateSource:B,contract,retained,retiredTargets,platform,upperInstances,shafts,links,interfaceMarkers,roofConstructionRoles,roofLayers,physics:{status:'UNREGISTERED_TASK2_GEOMETRY_ONLY',installed:false,sourceRegisteredRows:B.builder.colliders,sourceWalkables:B.builder.walkables},ownership:{isolation,resources:[...all],sourceDataSharedReadOnly:B.data===reference.data,sourceOwnedObjectTraversalReplacedByExplicitLedger:true},accepted:false,runtimeInstalled:false,routeAccepted:false,dispose};
 }catch(error){try{dispose();}catch(cleanup){if(error instanceof Error)Object.defineProperty(error,'cleanupErrors',{value:cleanup.errors});}throw error;}
}
function buildNE(parent,old,fit,own){
 const root=new T.Group();root.name=old.name;root.userData=structuredClone(old.userData);root.position.z=fit.faceCenterZ;parent.add(root);
 const boxes=[];old.traverse(m=>{if(m.isMesh)boxes.push(m);});const source=(name,index=0)=>boxes.filter(m=>m.name===name)[index];
 const box=(p,role,x0,x1,y0,y1,depth=.2,z=0)=>{const oldMesh=source(role),m=new T.Mesh(oldMesh.geometry,oldMesh.material);m.name=role;m.userData=structuredClone(oldMesh.userData);m.scale.set(x1-x0,y1-y0,depth);m.position.set((x0+x1)/2,(y0+y1)/2,z);m.castShadow=oldMesh.castShadow;m.receiveShadow=oldMesh.receiveShadow;p.add(m);return m;};
 const frame=(p,role,[x0,x1,y0,y1],w)=>{box(p,role,x0,x0+w,y0,y1);box(p,role,x1-w,x1,y0,y1);box(p,role,x0+w,x1-w,y0,y0+w);box(p,role,x0+w,x1-w,y1-w,y1);return[x0+w,x1-w,y0+w,y1-w];};
 const b=fit.boundariesX,[lo,hi]=fit.outerX;box(root,'wumen-ne-north-stone-foot',lo,hi,0,.42);box(root,'wumen-ne-north-top-band',lo,hi,5.65,5.94);box(root,'wumen-ne-north-end-strip',lo,b[0],.42,5.65);box(root,'wumen-ne-north-end-strip',b[3],hi,.42,5.65);
 for(let i=0;i<3;i++){const group=new T.Group();group.name='wumen-ne-north-window-group';group.userData=structuredClone(old.children.find(o=>o.userData.groupIndex===i).userData);root.add(group);const inner=frame(group,'wumen-ne-north-red-frame',[b[i],b[i+1],.42,5.65],.12),[x0,x1,y0,y1]=frame(group,'wumen-ne-north-gold-frame',inner,.035);box(group,'wumen-ne-north-closed-pane',x0,x1,y0,y1,.1,-.05);box(group,'wumen-ne-north-crossband-gold',x0,x1,4.19,4.235);box(group,'wumen-ne-north-crossband',x0,x1,4.235,4.365);box(group,'wumen-ne-north-crossband-gold',x0,x1,4.365,4.41);for(let j=1;j<[2,3,2][i];j++){const x=x0+(x1-x0)*j/[2,3,2][i];box(group,'wumen-ne-north-lower-coarse-divider',x-.0225,x+.0225,y0,4.19);}}
 return root;
}
function buildRoleGeometry(r,q){
 const p=[],uv=[],ix=[],poly=r.footprintHalf,ys=r.Y,n=q.recipe.sampleCounts.nU;
 const corners=[[-poly[0],-poly[1]],[poly[0],-poly[1]],[poly[0],poly[1]],[-poly[0],poly[1]]];let perimeter=0;
 for(let face=0;face<4;face++){const a=corners[face],b=corners[(face+1)%4],len=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let j=0;j<n;j++){const s0=(1-Math.cos(Math.PI*j/n))/2,s1=(1-Math.cos(Math.PI*(j+1)/n))/2,A=[a[0]+(b[0]-a[0])*s0,a[1]+(b[1]-a[1])*s0],B=[a[0]+(b[0]-a[0])*s1,a[1]+(b[1]-a[1])*s1],start=p.length/3;
  if(r.kind==='fan'){p.push(0,ys[0],0,A[0],ys[0],A[1],B[0],ys[0],B[1]);uv.push(0,0,...A,...B);ix.push(start,start+1,start+2);}else{p.push(A[0],ys[0],A[1],B[0],ys[0],B[1],B[0],ys[1],B[1],A[0],ys[1],A[1]);const band=r.uv.mode==='band-height-times-aspect',den=band?(r.uv.height??r.uv.caihuaHeight):1,u0=(perimeter+s0*len)/den,u1=(perimeter+s1*len)/den;uv.push(u0,band?0:ys[0],u1,band?0:ys[0],u1,band?1:ys[1],u0,band?1:ys[1]);ix.push(start,start+2,start+1,start,start+3,start+2);}}
 perimeter+=len;}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return g;
}
function buildLinkRoof(l){const p=l.roofMapping.samples.flatMap(s=>s.proposalXYZ),uv=l.roofMapping.samples.flatMap(s=>s.proposalUV),ix=[],at=(layer,i,j)=>layer*42+i*7+j,quad=(a,b,c,d)=>ix.push(a,b,c,a,c,d);for(let i=0;i<5;i++)for(let j=0;j<6;j++){quad(at(0,i,j),at(0,i,j+1),at(0,i+1,j+1),at(0,i+1,j));quad(at(1,i,j),at(1,i+1,j),at(1,i+1,j+1),at(1,i,j+1));}for(let i=0;i<5;i++){quad(at(0,i,0),at(0,i+1,0),at(1,i+1,0),at(1,i,0));quad(at(0,i,6),at(1,i,6),at(1,i+1,6),at(0,i+1,6));}for(let j=0;j<6;j++){quad(at(0,0,j),at(1,0,j),at(1,0,j+1),at(0,0,j+1));quad(at(0,5,j),at(0,5,j+1),at(1,5,j+1),at(1,5,j));}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return g;}
