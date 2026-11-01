import path from 'node:path';import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';
const root=process.cwd(),at=p=>pathToFileURL(path.join(root,p)).href;
const {captureGate,meshFingerprint}=await import(at('tests/lib/gate-tower-fixture.mjs'));
const c=captureGate(),T=c.THREE;
// Negative controls mutate only this child process's fresh in-memory capture.
const negative=process.argv[3];
if(negative){const wing=c.group.children.find(o=>o.userData.structure?.id==='FC-B0439D9BED');if(negative==='hide-east-wing')wing.visible=false;else if(negative==='move-ne-column'){const b=c.group.children.find(o=>o.userData.structure?.id==='INSTANCE-A-WUMEN-EAST-NORTH-PAVILION');b.children.find(o=>o.geometry?.type==='CylinderGeometry').position.x+=.1;c.group.updateMatrixWorld(true);}else if(negative==='material-opacity'){let target;wing.traverse(o=>{if(o.isMesh&&!target)target=o;});target.material.opacity=.25;}else throw Error('Unknown negative control');}

const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
function stable(x,key=''){if(x===undefined)return undefined;if(x===null||typeof x!=='object')return x;if(Array.isArray(x))return x.map(v=>stable(v));return Object.fromEntries(Object.keys(x).filter(k=>k!=='uuid'&&k!=='metadata').sort().map(k=>[k,stable(x[k],k)]));}
const material=m=>stable(m.toJSON());
const record=o=>{const gs=new Map(),ms=new Map(),rows=[];o.traverse(m=>{const mats=(Array.isArray(m.material)?m.material:[m.material]).filter(Boolean);if(m.geometry&&!gs.has(m.geometry))gs.set(m.geometry,gs.size);for(const mat of mats)if(!ms.has(mat))ms.set(mat,ms.size);rows.push({kind:m.type,name:m.name,objectRender:{visible:m.visible,renderOrder:m.renderOrder,frustumCulled:m.frustumCulled,matrixAutoUpdate:m.matrixAutoUpdate,matrixWorldAutoUpdate:m.matrixWorldAutoUpdate,layers:m.layers.mask},pose:[m.position.toArray(),m.quaternion.toArray(),m.scale.toArray()],userData:Object.fromEntries(Object.entries(m.userData).map(([k,v])=>[k,k==='ownedMaterials'?v.map(material):stable(v)])),geometry:m.geometry?gs.get(m.geometry):null,materials:mats.map(v=>({sharedIndex:ms.get(v),value:material(v)})),render:m.isMesh?{castShadow:m.castShadow,receiveShadow:m.receiveShadow,visible:m.visible,renderOrder:m.renderOrder,frustumCulled:m.frustumCulled}:null});});return{geometry:meshFingerprint(o),details:digest(rows),meshCount:rows.filter(r=>r.geometry!==null).length,localPhysics:digest(rows.map(r=>r.userData.colliders??null)),metadata:digest(rows.map(r=>r.userData)),sharedGeometryCount:gs.size,sharedMaterialCount:ms.size};};
const mode=process.argv[2];
if(!['wings','neEnclosure'].includes(mode))throw Error('Unknown R157 capture mode');
const provenance={mode,frozenCommit:process.env.R157_FROZEN_SOURCE_COMMIT??null,source:process.env.R157_FROZEN_SOURCE_COMMIT?'EXACT_COMMITTED_SOURCE_CLOSURE':'LIVE_WORKING_TREE_NO_FREEZE'};
const closedNorth=b=>Math.abs(b.min.y-12.3)<1e-5&&Math.abs(b.max.y-15.3)<1e-5&&Math.abs(b.max.x-b.min.x-11)<1e-5&&(Math.abs(b.min.x+53.2)<1e-5||Math.abs(b.min.x-42.2)<1e-5);
function deck(body,columns){let count=0;for(const col of columns){const p=col.getWorldPosition(new T.Vector3());col.geometry.computeBoundingBox();const y=p.y+col.geometry.boundingBox.min.y;if(Math.abs(y-12.3)>2e-7)throw Error('Column foot height');for(const[dx,dz]of[[0,0],[.2,0],[-.2,0],[0,.2],[0,-.2]]){const hits=new T.Raycaster(new T.Vector3(p.x+dx,y+.02,p.z+dz),new T.Vector3(0,-1,0),0,.04).intersectObjects(c.group.children.filter(o=>o!==body),true);if(!hits.some(h=>h.object.material.name==='stone_slab'&&Math.abs(h.point.y-y)<2e-6))throw Error('Actual retained deck contact');count++;}}return count;}
if(mode==='wings'){
 const ids=['FC-B0439D9BED','FC-FB99F593DB',...['EAST','WEST'].flatMap(s=>['NORTH','SOUTH'].map(e=>`INSTANCE-A-WUMEN-${s}-${e}-PAVILION`)),...['EAST','WEST'].map(s=>`INSTANCE-A-WUMEN-${s}-CLOCK-DRUM-REGION`)];
 const targets={};let feet=0;
 for(const id of ids){const a=c.group.children.filter(o=>o.userData.structure?.id===id);if(a.length!==1)throw Error(`Unique target ${id}: ${a.length}`);const o=a[0];targets[id]=record(o);if(o.userData.topY===7.5){const roofs=c.group.children.filter(r=>Math.abs(r.position.x-o.position.x)<1e-7&&r.position.y===0&&Math.abs(r.position.z-o.position.z)<1e-7&&r.userData.topY>20);if(roofs.length!==1)throw Error(`Unique associated roof ${id}: ${roofs.length}`);targets[`${id}/ROOF`]=record(roofs[0]);feet+=deck(o,o.children.filter(m=>m.geometry?.type==='CylinderGeometry'));}}
 const scoped=c.builder.colliders.filter(b=>b.r145WumenLink||closedNorth(b));if(scoped.length!==16)throw Error('Expected 14 tagged link + 2 closed north-body colliders');
 console.log(JSON.stringify({provenance,targets,scopedRuntimePhysics:{count:scoped.length,hash:digest(stable(scoped))},actualDeckFootSamples:feet,wholeRuntimeCounts:{colliders:c.builder.colliders.length,walkables:c.builder.walkables.length},topLevelChildren:c.group.children.length}));
}else{
 const body=c.group.children.find(o=>o.userData.topY===7.5&&Math.abs(o.position.x+47.7)<1e-7&&Math.abs(o.position.z+6)<1e-7);if(!body)throw Error('Unique NE host absent');
 const enclosures=[];body.traverse(o=>{if(o.userData.role==='wumen-ne-north-enclosure')enclosures.push(o);});if(enclosures.length!==1)throw Error('Unique NE enclosure absent');
 const columns=body.children.filter(m=>m.geometry?.type==='CylinderGeometry'&&Math.abs(m.position.z-5.5)<1e-7).sort((a,b)=>a.position.x-b.position.x);if(columns.length!==6)throw Error('NE north six columns absent');
 const closed=c.builder.colliders.filter(b=>closedNorth(b)&&b.min.x<0);if(closed.length!==1)throw Error('NE actual closed-body runtime proxy absent');
 console.log(JSON.stringify({provenance,enclosure:record(enclosures[0]),northColumns:columns.map(record),localProxies:body.userData.colliders.map(stable),closedBodyRuntime:digest(stable(closed)),actualDeckFootSamples:deck(body,columns)}));
}
