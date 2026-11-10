import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('pinned baseline host adapter accepts exact source and rejects changes before import', async()=>{
 let adapter;
 await assert.doesNotReject(async()=>{adapter=await import('./baseline-host.mjs');},'pinned baseline adapter must exist');
 const host=fs.readFileSync('src/scene/palace/special/RemainingOuterHalls.js','utf8');
 const old=fs.readFileSync('tests/r265-dafotang-frieze/fixtures/r264-layout.js.txt','utf8');
 const current=fs.readFileSync('src/scene/palace/special/DafotangHistoricLayout.js','utf8');
 const url=adapter.rewritePinnedSources(host,old);
 assert.match(url,/^data:text\/javascript;base64,/);
 assert.throws(()=>adapter.rewritePinnedSources(host+'\n',old));
 assert.throws(()=>adapter.rewritePinnedSources(host,old+'\n'));
 assert.throws(()=>adapter.rewritePinnedSources(host,current));
 assert.throws(()=>adapter.rewritePinnedSources(host.replace("import {buildDafotangHistoricLayout}","import {bad}"),old));
 assert.throws(()=>adapter.rewritePinnedSources(host+"\nimport './extra.js';",old));
});

test('oriented merge contract catches altered UV, normal, winding and triangle counts', async()=>{
 const T=await import('three'), {mergeByMaterial}=await import('../../src/utils/MergeUtils.js');
 let contract; await assert.doesNotReject(async()=>{contract=await import('./host-contract.mjs');});
 function triangle(){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([0,0,0,1,0,0,0,1,0],3));g.setAttribute('normal',new T.Float32BufferAttribute([0,0,1,0,0,1,0,0,1],3));g.setAttribute('uv',new T.Float32BufferAttribute([0,0,1,0,0,1],2));return g;}
 for(const mutation of ['none','uv','normal','reverse','missing','missing-real','duplicate','duplicate-real','material']){
  const root=new T.Group(),mat=new T.MeshStandardMaterial({name:'m'}),other=new T.MeshStandardMaterial({name:'other'}),m=new T.Mesh(triangle(),mat);m.position.set(3,2,1);root.add(m);root.updateMatrixWorld(true);
  const expected=contract.captureMergeExpectation({kit:{root,plaques:[]}}),merged=mergeByMaterial(root);const result=merged.children[0];
  if(mutation==='uv')result.geometry.attributes.uv.array[0]+=.25;
  if(mutation==='normal')result.geometry.attributes.normal.array[0]+=.25;
  if(mutation==='reverse'){for(const a of Object.values(result.geometry.attributes)){for(let k=0;k<a.itemSize;k++){const tmp=a.array[a.itemSize+k];a.array[a.itemSize+k]=a.array[a.itemSize*2+k];a.array[a.itemSize*2+k]=tmp;}}}
  if(mutation==='missing')result.geometry.setDrawRange(0,0);
  if(mutation==='missing-real'){for(const name of Object.keys(result.geometry.attributes)){const a=result.geometry.attributes[name];result.geometry.setAttribute(name,new T.BufferAttribute(new Float32Array(0),a.itemSize));}}
  if(mutation==='duplicate-real'){for(const name of Object.keys(result.geometry.attributes)){const a=result.geometry.attributes[name];result.geometry.setAttribute(name,new T.BufferAttribute(new Float32Array([...a.array,...a.array]),a.itemSize));}}
  if(mutation==='duplicate')merged.add(result.clone());
  if(mutation==='material')result.material=other;
  if(mutation==='none')assert.doesNotThrow(()=>contract.assertMerged(merged,expected));
  else assert.throws(()=>contract.assertMerged(merged,expected),mutation);
  merged.traverse(x=>x.geometry?.dispose());mat.dispose();other.dispose();
 }
});

test('merge expectation models mirrored geometry with generated normals', async()=>{
 const T=await import('three'),{mergeByMaterial}=await import('../../src/utils/MergeUtils.js'),c=await import('./host-contract.mjs');
 const root=new T.Group(),material=new T.MeshStandardMaterial({name:'mixed'});
 function geo(normal){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([0,0,0,1,0,0,0,1,0],3));if(normal)g.setAttribute('normal',new T.Float32BufferAttribute([0,0,1,0,0,1,0,0,1],3));return g;}
 const a=new T.Mesh(geo(true),material),b=new T.Mesh(geo(false),material);b.scale.x=-1;root.add(a,b);root.updateMatrixWorld(true);
 try{const e=c.captureMergeExpectation({kit:{root,plaques:[]}}),merged=mergeByMaterial(root);try{assert.doesNotThrow(()=>c.assertMerged(merged,e));}finally{merged.traverse(o=>o.geometry?.dispose());}}finally{material.dispose();}
});

test('owner comparison permits one named beam geometry delta only',async()=>{
 const c=await import('./host-contract.mjs');
 const before=[{path:'0',role:'wall',geometry:'same',material:'a',visible:true},{path:'1',role:'lower-front-entablature',geometry:'old',material:'gold',visible:true},{path:'2',role:'column',geometry:'same2',material:'a',visible:true}];
 const after=structuredClone(before);after[1].geometry='new';
 assert.doesNotThrow(()=>c.assertOwnerRows(after,before));
 for(const [i,key,value] of [[0,'geometry','other'],[1,'material','other'],[2,'visible',false],[1,'path','wrong'],[1,'role','wrong']]){
  const broken=structuredClone(after);broken[i][key]=value;assert.throws(()=>c.assertOwnerRows(broken,before),`${i} ${key}`);
 }
 assert.throws(()=>c.assertOwnerRows(after.slice(1),before));
});

test('snapshot observes miniature owner geometry, sharing and actual support references',async()=>{
 const T=await import('three'),{createTriangleTemplate,triangleInstance}=await import('../../src/utils/TriangleSupport.js'),c=await import('./host-contract.mjs');
 const root=new T.Group(),f=new T.Group(),frame=new T.Group(),mat=new T.MeshStandardMaterial({name:'gold'});root.add(f);f.add(frame);frame.name='layout';f.position.set(1,0,2);
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute([0,0,0,1,0,0,0,1,0],3));geo.setIndex([0,1,2]);const m=new T.Mesh(geo,mat);m.userData.dafotangLayoutRole='lower-front-entablature';frame.add(m);root.updateMatrixWorld(true);
 const shape=triangleInstance(createTriangleTemplate(geo),[1,0,2],m.name+'/'+m.uuid),collider=shape.box.clone();collider.triangleSupport=shape;collider.dafotangLayoutMesh=m.uuid;collider.dafotangLayoutRole=m.userData.dafotangLayoutRole;
 const kit={root,colliders:[collider],walkables:[],rooms:[],mapItems:[],regions:[],owned:[mat],ownedTextures:[]};const h={kit,f,g:{historicLayout:{id:'layout'}}};
 try{
  const a=c.snapshotHost(h);assert.equal(a.layout.length,1);assert.equal(a.layout[0].role,'lower-front-entablature');
  const before=JSON.stringify(a);geo.attributes.position.setX(1,2);assert.throws(()=>c.snapshotHost(h),'stale contact');geo.attributes.position.setX(1,1);
  collider.dafotangLayoutMesh='not-a-real-owner';assert.throws(()=>c.snapshotHost(h),'wrong owner reference');collider.dafotangLayoutMesh=m.uuid;
  assert.equal(JSON.stringify(c.snapshotHost(h)),before);
 }finally{geo.dispose();mat.dispose();}
});

test('plaque facade admits only fixed local PNG and fails closed on decode/event errors',async()=>{
 let run;await assert.doesNotReject(async()=>{run=await import('./host-run.mjs');});
 const good=fs.readFileSync('public/textures/dafotang/wanshou-wujiang-modern-tc-r259.png');
 const make=(opts={})=>run.createPlaqueFacade({createCanvas:()=>({kind:'canvas'}),decode:async()=>({width:768,height:286}),readAsset:()=>good,...opts});
 {
  const f=make(),doc=f.document,img=doc.createElementNS('http://www.w3.org/1999/xhtml','img');let called=0,receiver;
  img.addEventListener('load',function(){called++;receiver=this;});img.src='/textures/dafotang/wanshou-wujiang-modern-tc-r259.png';await f.settle();assert.equal(called,1);assert.equal(receiver,img);assert.equal(doc.createElement('canvas').kind,'canvas');assert.throws(()=>img.dispatchEvent({type:'load'}));await assert.rejects(()=>f.close());
 }
 for(const opts of [{readAsset:()=>Buffer.from('wrong')},{decode:async()=>{throw Error('bad decode');}},{decode:async()=>({width:1,height:2})}]){
  const f=make(opts),img=f.document.createElementNS('http://www.w3.org/1999/xhtml','img');img.addEventListener('load',()=>{});img.src='/textures/dafotang/wanshou-wujiang-modern-tc-r259.png';await assert.rejects(()=>f.settle());await f.close().catch(()=>{});
 }
 {const f=make(),img=f.document.createElementNS('http://www.w3.org/1999/xhtml','img');assert.throws(()=>{img.src='/unknown.png';});await f.close().catch(()=>{});}
 {const f=make(),img=f.document.createElementNS('http://www.w3.org/1999/xhtml','img');img.src='/textures/dafotang/wanshou-wujiang-modern-tc-r259.png';await assert.rejects(()=>f.settle());await f.close().catch(()=>{});}
});

test('plaque facade bounds an unfinished decode and cleanup',async()=>{
 const {createPlaqueFacade}=await import('./host-run.mjs'),good=fs.readFileSync('public/textures/dafotang/wanshou-wujiang-modern-tc-r259.png');
 const f=createPlaqueFacade({createCanvas:()=>({}),readAsset:()=>good,decode:()=>new Promise(()=>{}),timeoutMs:10});
 const img=f.document.createElementNS('http://www.w3.org/1999/xhtml','img');img.addEventListener('load',()=>{});img.src='/textures/dafotang/wanshou-wujiang-modern-tc-r259.png';
 await assert.rejects(()=>f.settle(),/deadline/);const start=Date.now();await assert.rejects(()=>f.close());assert.ok(Date.now()-start<500,'cleanup must not hang');
});

test('host children run serially and fail closed on bad exit or receipt',async()=>{
 const {EventEmitter}=await import('node:events'),{runSerial}=await import('./host-run.mjs');
 for(const failure of ['none','baseline-exit','baseline-receipt','candidate-exit','candidate-receipt']){
  const calls=[],active=new Set();let overlap=false;
  const spawn=(exe,args,opts)=>{assert.equal(opts.shell,false);assert.equal(opts.detached,false);assert.deepEqual(opts.stdio,['ignore','inherit','inherit']);const mode=args.at(-1);calls.push(mode);if(active.size)overlap=true;active.add(mode);const child=new EventEmitter();queueMicrotask(()=>{active.delete(mode);child.emit('close',failure===mode.slice(2)+'-exit'?1:0,null);});return child;};
  const readReceipt=mode=>failure===mode+'-receipt'?null:{status:'PASS',phase:mode,cleanupComplete:true};
  if(failure==='none')await assert.doesNotReject(()=>runSerial({spawn,readReceipt,script:'fixed'}));
  else await assert.rejects(()=>runSerial({spawn,readReceipt,script:'fixed'}));
  assert.equal(overlap,false);assert.deepEqual(calls,failure.startsWith('baseline')?['--baseline']:['--baseline','--candidate']);
 }
});

test('permanent witness detects mutation while allowing photo figure visibility',async()=>{
 const T=await import('three'),{capturePermanentWitness}=await import('./host-run.mjs');
 for(const mutation of ['none','beam-uv','beam-material','beam-hidden','material-hidden','root-hidden','beam-transform','material-property','support-hidden','collider','collider-field','support-ref','figure-hidden']){
  const root=new T.Group(),geo=()=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([0,0,0,1,0,0,0,1,0],3));g.setAttribute('normal',new T.Float32BufferAttribute([0,0,1,0,0,1,0,0,1],3));g.setAttribute('uv',new T.Float32BufferAttribute([0,0,1,0,0,1],2));return g;};
  const beam=new T.Mesh(geo(),new T.MeshStandardMaterial({name:'dafotang_layout_plain_gold_fit'})),support=new T.Mesh(geo(),new T.MeshStandardMaterial({name:'dafotang_principal_fitted_support'}));
  const figure=new T.Mesh(geo(),new T.MeshStandardMaterial({name:'dafotang_principal_worn_gold'}));root.add(beam,support,figure);const ref={},collider={triangleSupport:ref,role:'original'},kit={colliders:[collider],walkables:[],owned:[beam.material,support.material],ownedTextures:[]};
  const witness=capturePermanentWitness(root,kit);if(mutation==='beam-uv')beam.geometry.attributes.uv.array[0]=.2;if(mutation==='beam-material')beam.material=figure.material;if(mutation==='beam-hidden')beam.visible=false;if(mutation==='material-hidden')beam.material.visible=false;if(mutation==='root-hidden')root.visible=false;if(mutation==='beam-transform')beam.position.x=1;if(mutation==='material-property')beam.material.roughness=.1;if(mutation==='support-hidden')support.visible=false;if(mutation==='collider')kit.colliders=[];if(mutation==='collider-field')collider.role='changed';if(mutation==='support-ref')collider.triangleSupport={};if(mutation==='figure-hidden')figure.visible=false;
  if(['none','figure-hidden'].includes(mutation))assert.doesNotThrow(()=>witness.check());else assert.throws(()=>witness.check(),mutation);
  root.traverse(x=>{x.geometry?.dispose();x.material?.dispose();});
 }
});

test('guarded host requires exact supervisor heap flags and rejects loaders',async()=>{
 const {assertHostEnvironment}=await import('./host-run.mjs');const env={CI:'true',GITHUB_ACTIONS:'true',NODE_OPTIONS:'--max-old-space-size=2048 --max-semi-space-size=16'};
 assert.doesNotThrow(()=>assertHostEnvironment(env,[]));
 for(const change of [{NODE_OPTIONS:''},{NODE_OPTIONS:'--max-old-space-size=4096'},{NODE_PATH:'override'},{R265_REPO:'override'},{R262_REPO_ROOT:'override'}])assert.throws(()=>assertHostEnvironment({...env,...change},[]));
 assert.throws(()=>assertHostEnvironment(env,['--import=anything']));
});

test('six photo lifecycle cases preserve a miniature permanent host',async()=>{
 const T=await import('three'),{createDafotangPhotoSession}=await import('../../src/scene/palace/special/DafotangPhotoPresentation.js'),{exercisePhotoSessions}=await import('./host-run.mjs');
 const group=new T.Group();group.name='outer-west';group.userData.architecture=[{id:'place-outer-west-6cae88b6a2',inventory:{status:'UNKNOWN'},historicalPrincipal:{id:'dafotang-shakyamuni-historical-fit'},photoPresentation:{status:'BLOCKED'}}];
 const names=['dafotang_layout_plain_gold_fit','dafotang_principal_fitted_support','dafotang_principal_worn_gold','dafotang_principal_red_lacquer','dafotang_principal_dark_curls'];
 for(const name of names)group.add(new T.Mesh(new T.BoxGeometry(1,1,1),new T.MeshStandardMaterial({name})));
 const kit={colliders:[],walkables:[],owned:group.children.map(m=>m.material),ownedTextures:[]};
 try{const rows=await exercisePhotoSessions({group,kit,T,createDafotangPhotoSession});assert.deepEqual(rows.map(x=>x.case),['missing','success','partial-http','late-decode','cancel-pending','publish-failure']);assert.ok(rows.every(x=>x.status==='PASS'));}
 finally{group.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}
});

test('failed merge cleanup never redisposes already released source geometry',async()=>{
 const T=await import('three'),{cleanupKit}=await import('./host-run.mjs');
 const root=new T.Group(),a=new T.BoxGeometry(),b=new T.BoxGeometry(),material=new T.MeshStandardMaterial();root.add(new T.Mesh(a,material),new T.Mesh(b,material));let ac=0,bc=0,kitCalls=0;a.addEventListener('dispose',()=>ac++);b.addEventListener('dispose',()=>bc++);a.dispose();
 const kit={root,dispose(group){kitCalls++;assert.equal(group,undefined);material.dispose();}};
 cleanupKit({kit,finishStarted:true,merged:null,sourceCounts:new Map([[a,1],[b,0]])});assert.equal(ac,1);assert.equal(bc,1);assert.equal(kitCalls,1);
});

test('reviewed beam byte contract allows a valid same-stage populated bound',async()=>{
 const {assertBeamGeometry}=await import('./host-contract.mjs');const expected={attributes:{position:'hash'},index:'indices',groups:[],drawRange:{start:0,count:'Infinity'},morphAttributes:{},morphTargetsRelative:false,storedBounds:null,bounds:[[0,0,0],[1,1,1]]};
 const actual={...structuredClone(expected),storedBounds:[[0,0,0],[1,1,1]],sphere:null,worldBounds:[[1,0,2],[2,1,3]]};assert.doesNotThrow(()=>assertBeamGeometry(actual,expected));
 const changed=structuredClone(actual);changed.attributes.position='changed';assert.throws(()=>assertBeamGeometry(changed,expected));
});

test('finished non-axis Float32 normals are read as stored, never renormalized',async()=>{
 const T=await import('three'),{mergeByMaterial}=await import('../../src/utils/MergeUtils.js'),c=await import('./host-contract.mjs');
 const g=new T.BufferGeometry(),v=[.19245009124279022,.9622504711151123,.19245009124279022];g.setAttribute('position',new T.Float32BufferAttribute([0,0,0,1,0,0,0,1,0],3));g.setAttribute('normal',new T.Float32BufferAttribute([...v,...v,...v],3));g.setAttribute('uv',new T.Float32BufferAttribute([0,0,1,0,0,1],2));
 const root=new T.Group(),mat=new T.MeshStandardMaterial({name:'non-axis'}),m=new T.Mesh(g,mat);m.rotation.set(.123,.456,.789);m.scale.set(1.3,.7,2.1);root.add(m);root.updateMatrixWorld(true);
 const e=c.captureMergeExpectation({kit:{root,plaques:[]}}),merged=mergeByMaterial(root);try{
  assert.doesNotThrow(()=>c.assertMerged(merged,e));const n=merged.children[0].geometry.attributes.normal;for(let i=0;i<n.array.length;i++)n.array[i]*=2;assert.throws(()=>c.assertMerged(merged,e),'scaled stored normal must not be normalized away');
 }finally{merged.traverse(o=>o.geometry?.dispose());mat.dispose();}
});

test('same-stage receipt detects changed non-layout support normal with same box and count',async()=>{
 const T=await import('three'),{createTriangleTemplate,triangleInstance}=await import('../../src/utils/TriangleSupport.js'),{snapshotHost}=await import('./host-contract.mjs');
 const root=new T.Group(),layout=new T.Group();layout.name='layout';root.add(layout);const mat=new T.MeshStandardMaterial(),make=()=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([0,0,0,1,0,0,0,1,0],3));g.setIndex([0,1,2]);return g;},lg=make(),other=make(),m=new T.Mesh(lg,mat);m.userData.dafotangLayoutRole='lower-front-entablature';layout.add(m);root.updateMatrixWorld(true);
 const shape=triangleInstance(createTriangleTemplate(lg),[0,0,0],m.name+'/'+m.uuid),lc=shape.box.clone();lc.triangleSupport=shape;lc.dafotangLayoutMesh=m.uuid;lc.dafotangLayoutRole=m.userData.dafotangLayoutRole;
 const s=triangleInstance(createTriangleTemplate(other),[0,0,0],'other-owner'),c=s.box.clone();c.triangleSupport=s;c.dafotangTriadMesh='other';const kit={root,colliders:[lc,c],walkables:[],rooms:[],mapItems:[],regions:[],owned:[mat],ownedTextures:[]};
 try{const before=snapshotHost({kit,g:{historicLayout:{id:'layout'}}});s.template.triangles[0].normal.x=.1;const after=snapshotHost({kit,g:{historicLayout:{id:'layout'}}});assert.notDeepEqual(before.colliders[1],after.colliders[1]);}finally{lg.dispose();other.dispose();mat.dispose();}
});

test('pre-merge witness catches equal-valued collider replacement and ownership changes',async()=>{
 const {captureHostReferences}=await import('./host-run.mjs');const support={},a={role:'stable',triangleSupport:support},owned={},texture={};
 const kit={colliders:[a],walkables:[{x:1}],owned:[owned],ownedTextures:[texture]},w=captureHostReferences(kit);w.check();
 kit.colliders[0]={role:'stable',triangleSupport:support};assert.throws(()=>w.check(),/collider identity/);kit.colliders[0]=a;
 a.role='changed';assert.throws(()=>w.check(),/contact/);a.role='stable';
 kit.ownedTextures[0]={};assert.throws(()=>w.check(),/owned texture/);kit.ownedTextures[0]=texture;w.check();
});

test('plaque deadline begins at image work, not facade construction',async()=>{
 const {createPlaqueFacade}=await import('./host-run.mjs'),good=fs.readFileSync('public/textures/dafotang/wanshou-wujiang-modern-tc-r259.png');
 const f=createPlaqueFacade({createCanvas:()=>({}),readAsset:()=>good,decode:async()=>{await new Promise(r=>setTimeout(r,5));return {width:768,height:286};},timeoutMs:100});
 await new Promise(r=>setTimeout(r,125));const image=f.document.createElementNS('http://www.w3.org/1999/xhtml','img');image.addEventListener('load',()=>{});image.src='/textures/dafotang/wanshou-wujiang-modern-tc-r259.png';await assert.doesNotReject(()=>f.settle());await f.close();
});

test('85-owner same-stage gate rejects role, index, east pedestal, offset and cross-owner drift',async()=>{
 const {assertSameStage}=await import('./host-contract.mjs'),contract=JSON.parse(fs.readFileSync('tests/r265-dafotang-frieze/fixtures/beam-contract.json','utf8'));
 function fixture(candidate){
  const roles=contract.orderedRoles,owners=[],layout=[],colliders=[],seen={};
  for(let i=0;i<roles.length;i++){
   const role=roles[i],path='0/'+i,isBeam=role==='lower-front-entablature';seen[role]=(seen[role]??0)+1;
   const east=role.startsWith('guardian-pedestal-')&&seen[role]===1,geometry=isBeam?structuredClone(candidate?contract.current:contract.baseline):{index:'same-index',bounds:[[east?-3:2,0,0],[east?-2:3,1,1]]};
   owners.push({path,role,material:'m',visible:true,geometry});const support={triangles:isBeam?(candidate?1620:12):1,offset:[221.9,0,241.1],sha256:isBeam?(candidate?'new':'old'):'same'};
   layout.push({path,role,support});colliders.push({box:isBeam?(candidate?'new':'old'):'same',properties:{dafotangLayoutMesh:path,dafotangLayoutRole:role},support:{id:path,count:support.triangles,sha256:support.sha256}});
  }
  return {owners,layout,colliders,materials:[],textures:[],owned:[],ownedTextures:[],walkables:[],rooms:[],mapItems:[],regions:[],metadata:{},beamProfile:candidate?{endTreatment:'PLAIN_MODEL_RETURNS_NOT_SOURCE_CARVING',columnInset:.08,narrowBays:'UNCHANGED_PLAIN',dimensionStatus:'MODEL_FIT_NOT_SURVEY'}:null};
 }
 const current=fixture(true),baseline=fixture(false);assert.doesNotThrow(()=>assertSameStage(current,baseline));
 for(const mutate of [
  x=>{x.layout[6].role='missing';x.owners[6].role='missing';},x=>{x.layout[5].role='lower-front-entablature';x.owners[5].role='lower-front-entablature';},
  x=>{x.owners[0].geometry.index='changed';},x=>{x.owners[43].geometry.bounds[0][0]-=.1;},x=>{x.layout[43].support.offset[0]+=.1;},
  x=>{x.colliders[0].properties.dafotangLayoutMesh=x.layout[1].path;}
 ]){const broken=structuredClone(current);mutate(broken);assert.throws(()=>assertSameStage(broken,baseline));}
});

test('two real owner UUID references remain distinguishable after canonicalization',async()=>{
 const T=await import('three'),{createTriangleTemplate,triangleInstance}=await import('../../src/utils/TriangleSupport.js'),{snapshotHost}=await import('./host-contract.mjs');const root=new T.Group(),layout=new T.Group();layout.name='layout';root.add(layout);const mat=new T.MeshStandardMaterial(),geometries=[];
 const meshes=[0,1].map(()=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([0,0,0,1,0,0,0,1,0],3));g.setIndex([0,1,2]);geometries.push(g);const m=new T.Mesh(g,mat);m.name='same-role';m.userData.dafotangLayoutRole='other';layout.add(m);return m;});root.updateMatrixWorld(true);
 const colliders=meshes.map(m=>{const s=triangleInstance(createTriangleTemplate(m.geometry),[0,0,0],m.name+'/'+m.uuid),c=s.box.clone();c.triangleSupport=s;c.dafotangLayoutMesh=m.uuid;c.dafotangLayoutRole='other';return c;});const kit={root,colliders,walkables:[],rooms:[],mapItems:[],regions:[],owned:[mat],ownedTextures:[]};
 try{const before=snapshotHost({kit,g:{historicLayout:{id:'layout'}}});for(let i=0;i<2;i++){const other=meshes[1-i];colliders[i].dafotangLayoutMesh=other.uuid;colliders[i].triangleSupport.id=other.name+'/'+other.uuid;}const after=snapshotHost({kit,g:{historicLayout:{id:'layout'}}});assert.notDeepEqual(after.colliders,before.colliders,'distinct real owner paths remain visible');}finally{geometries.forEach(g=>g.dispose());mat.dispose();}
});
test('reference witness permits only the one expected plaque atlas ownership append',async()=>{
 const {captureHostReferences}=await import('./host-run.mjs'),oldMaterial={},oldTexture={},kit={colliders:[],walkables:[],owned:[oldMaterial],ownedTextures:[oldTexture]};const w=captureHostReferences(kit),texture={},material={name:'kit_plaques',map:texture};kit.owned.push(material);kit.ownedTextures.push(texture);assert.doesNotThrow(()=>w.check({afterFinish:true}));kit.ownedTextures[1]={};assert.throws(()=>w.check({afterFinish:true}));kit.ownedTextures[1]=texture;
 const replacementTexture={},replacementMaterial={name:'kit_plaques',map:replacementTexture};kit.owned[1]=replacementMaterial;kit.ownedTextures[1]=replacementTexture;assert.throws(()=>w.check({afterFinish:true}),'paired replacement must not replace the admitted atlas');
});

test('plaque deadline excludes synchronous host work after src but before decode begins',async()=>{
 const {createPlaqueFacade}=await import('./host-run.mjs'),good=fs.readFileSync('public/textures/dafotang/wanshou-wujiang-modern-tc-r259.png');const f=createPlaqueFacade({createCanvas:()=>({}),readAsset:()=>good,decode:async()=>{await new Promise(r=>setTimeout(r,5));return {width:768,height:286};},timeoutMs:100});
 const image=f.document.createElementNS('http://www.w3.org/1999/xhtml','img');image.addEventListener('load',()=>{});image.src='/textures/dafotang/wanshou-wujiang-modern-tc-r259.png';Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,125);await assert.doesNotReject(()=>f.settle());await f.close();
});
