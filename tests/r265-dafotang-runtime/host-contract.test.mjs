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

// The receipt checks exercise the same implementation without constructing a host.
async function receiptAPI(){
 const source=fs.readFileSync(new URL('./host-run.mjs',import.meta.url),'utf8').replace('function writeReceipt(', 'export function writeReceipt(').replace('export export function writeReceipt(', 'export function writeReceipt(');
 return import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
}
async function receiptTemp(){const os=await import('node:os'),path=await import('node:path');return fs.mkdtempSync(path.join(os.tmpdir(),'r265-receipt-'));}
test('receipt uses compact whole row without losing any successful owner',async()=>{
 const {writeReceipt}=await receiptAPI(),path=await import('node:path'),dir=await receiptTemp(),file=path.join(dir,'success.json');
 const row={phase:'baseline',status:'PASS',cleanupComplete:true,snapshot:{owners:[{name:'one'},{name:'two'}]}};
 writeReceipt(file,row);const raw=fs.readFileSync(file,'utf8');assert.equal(raw,JSON.stringify(row)+'\n');assert.deepEqual(JSON.parse(raw),row);
});
test('whole receipt cap counts UTF-8 and newline at exact 8 MiB',async()=>{
 const {writeReceipt}=await receiptAPI(),path=await import('node:path'),dir=await receiptTemp(),limit=8*1024*1024;
 const row={payload:''};const base=Buffer.byteLength(JSON.stringify(row)+'\n');row.payload='x'.repeat(limit-base-3)+'汉';
 assert.equal(Buffer.byteLength(JSON.stringify(row)+'\n'),limit);writeReceipt(path.join(dir,'exact.json'),row);
 row.payload+='x';assert.throws(()=>writeReceipt(path.join(dir,'over.json'),row),/8 MiB/);assert.equal(fs.existsSync(path.join(dir,'over.json')),false);
});
test('whole receipt overhead cannot be hidden by snapshot-only size',async()=>{
 const {writeReceipt}=await receiptAPI(),path=await import('node:path'),dir=await receiptTemp(),cap=8*1024*1024;
 const row={snapshot:{owners:['full']},overhead:'x'.repeat(cap)};
 assert.ok(Buffer.byteLength(JSON.stringify(row.snapshot))<cap);assert.throws(()=>writeReceipt(path.join(dir,'over.json'),row),/8 MiB/);assert.equal(fs.existsSync(path.join(dir,'over.json')),false);
});
test('primary host error and cleanup failure outrank receipt write failure',async()=>{
 const {finalizeReceipt}=await receiptAPI(),path=await import('node:path'),dir=await receiptTemp(),file=path.join(dir,'r.json'),primary=Error('original host failure');
 fs.writeFileSync(file+'.tmp','occupied');const row={phase:'baseline',snapshot:{owners:['full']}};const logs=[];
 const result=finalizeReceipt({file,row,problem:primary,cleanupErrors:[{source:'kit disposal',error:Error('cleanup failed')}],stage:'merge',log:x=>logs.push(x)});
 assert.strictEqual(result,primary);assert.equal(fs.existsSync(file),false);const fallback=JSON.parse(fs.readFileSync(file+'.failure.json','utf8'));
 assert.equal(fallback.status,'FAIL');assert.match(fallback.primary.message.value,/original host failure/);assert.equal(fallback.cleanup.count,1);assert.match(fallback.receipt.message.value,/EEXIST/);
});
test('cleanup-only failure outranks a failed writer and fallback is never PASS',async()=>{
 const {finalizeReceipt}=await receiptAPI(),path=await import('node:path'),dir=await receiptTemp(),file=path.join(dir,'r.json');fs.writeFileSync(file+'.tmp','occupied');
 const original=Error('actual cleanup');const result=finalizeReceipt({file,row:{phase:'candidate'},problem:null,cleanupErrors:[{source:'kit disposal',error:original}],stage:'cleanup',log:()=>{}});
 assert.strictEqual(result,original);assert.match(result.message,/actual cleanup/);const fallback=JSON.parse(fs.readFileSync(file+'.failure.json','utf8'));assert.equal(fallback.status,'FAIL');assert.match(fallback.primary.message.value,/actual cleanup/);
});
test('error evidence is bounded, hashed and explicitly marked when truncated',async()=>{
 const {finalizeReceipt}=await receiptAPI(),path=await import('node:path'),dir=await receiptTemp(),file=path.join(dir,'r.json');fs.writeFileSync(file+'.tmp','occupied');
 const e=Error('汉'.repeat(10000));const result=finalizeReceipt({file,row:{phase:'baseline'},problem:e,cleanupErrors:[],stage:'snapshot',log:()=>{}});assert.strictEqual(result,e);
 const fallback=JSON.parse(fs.readFileSync(file+'.failure.json','utf8'));const msg=fallback.primary.message;assert.equal(msg.truncated,true);assert.equal(msg.bytes,30000);assert.match(msg.sha256,/^[0-9a-f]{64}$/);assert.ok(Buffer.byteLength(JSON.stringify(fallback))<16384);
});
test('failed failure-only fallback preserves primary and reports bounded failure',async()=>{
 const {finalizeReceipt}=await receiptAPI(),path=await import('node:path'),dir=await receiptTemp(),file=path.join(dir,'r.json'),original=Error('primary');fs.writeFileSync(file+'.tmp','occupied');fs.writeFileSync(file+'.failure.json.tmp','occupied');const logs=[];
 const result=finalizeReceipt({file,row:{phase:'baseline'},problem:original,cleanupErrors:[],stage:'merge',log:x=>logs.push(x)});assert.strictEqual(result,original);assert.equal(fs.existsSync(file),false);assert.equal(fs.existsSync(file+'.failure.json'),false);assert.ok(logs.some(x=>x.includes('fallback')));assert.ok(logs.every(x=>Buffer.byteLength(x)<16384));
});
test('phase breadcrumbs preserve ordered entered phases and exact mode',async()=>{
 const {createHostPhaseTracker}=await receiptAPI(),logs=[],tracker=createHostPhaseTracker('baseline',x=>logs.push(x));
 tracker.enter('imports');tracker.enter('host-setup');tracker.enter('snapshot');tracker.enter('merge');tracker.enter('try-complete');tracker.enter('cleanup');tracker.enter('receipt');
 assert.equal(tracker.current(),'receipt');assert.deepEqual(logs,['HOST_PHASE baseline imports','HOST_PHASE baseline host-setup','HOST_PHASE baseline snapshot','HOST_PHASE baseline merge','HOST_PHASE baseline try-complete','HOST_PHASE baseline cleanup','HOST_PHASE baseline receipt']);assert.throws(()=>tracker.enter('unknown'));assert.throws(()=>createHostPhaseTracker('invalid',()=>{}));
});
test('failure fallback stays tiny even for escaped diagnostics and many cleanup errors',async()=>{
 const {finalizeReceipt}=await receiptAPI(),path=await import('node:path'),dir=await receiptTemp(),file=path.join(dir,'r.json');fs.writeFileSync(file+'.tmp','occupied');
 const e=Error('\0'.repeat(12000)),aggregate=new AggregateError([],'\0'.repeat(12000));aggregate.errors.push(aggregate);aggregate.stack='\0'.repeat(12000);aggregate.name='\0'.repeat(12000);
 const errors=Array.from({length:12},()=>({source:'kit disposal',error:aggregate}));finalizeReceipt({file,row:{phase:'baseline'},problem:e,cleanupErrors:errors,stage:'snapshot',log:()=>{}});
 const raw=fs.readFileSync(file+'.failure.json');const parsed=JSON.parse(raw);assert.ok(raw.length<=16384);assert.equal(parsed.cleanup.count,12);assert.equal(parsed.cleanup.omitted,10);assert.equal(parsed.cleanup.shown[0].error.causes.shown[0].nestedCauses.omitted,1);assert.equal(parsed.cleanup.shown[1].error.causes.omitted,1);assert.equal(parsed.status,'FAIL');
});
test('atomic receipt cannot overwrite existing evidence',async()=>{
 const {writeReceipt}=await receiptAPI(),path=await import('node:path'),dir=await receiptTemp(),file=path.join(dir,'r.json');writeReceipt(file,{status:'PASS',owner:'original'});
 assert.throws(()=>writeReceipt(file,{status:'PASS',owner:'changed'}),/EEXIST/);assert.equal(JSON.parse(fs.readFileSync(file,'utf8')).owner,'original');
});
test('successful finalization preserves full row and confirms cleanup',async()=>{
 const {finalizeReceipt}=await receiptAPI(),path=await import('node:path'),dir=await receiptTemp(),file=path.join(dir,'host-baseline.json'),snapshot={owners:[{id:1},{id:2}]};const row={phase:'baseline',snapshot,merge:[{full:'data'}]};
 assert.equal(finalizeReceipt({file,row,problem:null,cleanupErrors:[],stage:'try-complete',log:()=>{}}),null);const got=JSON.parse(fs.readFileSync(file,'utf8'));assert.equal(got.status,'PASS');assert.equal(got.cleanupComplete,true);assert.deepEqual(got.cleanupErrors,[]);assert.deepEqual(got.snapshot,snapshot);assert.deepEqual(got.merge,[{full:'data'}]);assert.equal(got.lastWorkPhase,'try-complete');assert.equal(fs.existsSync(file+'.failure.json'),false);
});
test('oversized compact success becomes failure only with exact byte evidence',async()=>{
 const {finalizeReceipt}=await receiptAPI(),path=await import('node:path'),dir=await receiptTemp(),file=path.join(dir,'host-baseline.json'),row={phase:'baseline',snapshot:{owners:[{complete:'x'.repeat(8*1024*1024)}]}};
 const e=finalizeReceipt({file,row,problem:null,cleanupErrors:[],stage:'try-complete',log:()=>{}});assert.equal(e.message,`host receipt exceeds 8 MiB: ${Buffer.byteLength(JSON.stringify(row)+'\n')} bytes`);assert.equal(fs.existsSync(file),false);const fallback=JSON.parse(fs.readFileSync(file+'.failure.json','utf8'));assert.equal(fallback.status,'FAIL');assert.match(fallback.primary.message.value,/exceeds 8 MiB/);
});
test('cleanup-only writer failure preserves original exception identity and forensic fields',async()=>{
 const {finalizeReceipt,recordCleanupError}=await receiptAPI(),path=await import('node:path'),{createHash}=await import('node:crypto'),dir=await receiptTemp(),file=path.join(dir,'host.json'),original=new RangeError('cleanup details');fs.writeFileSync(file+'.tmp','occupied');
 const errors=[];recordCleanupError(errors,'kit disposal',original);assert.strictEqual(errors[0].error,original);const result=finalizeReceipt({file,row:{phase:'baseline'},problem:null,cleanupErrors:errors,stage:'cleanup',log:()=>{}});assert.strictEqual(result,original);
 const f=JSON.parse(fs.readFileSync(file+'.failure.json','utf8')),shown=f.cleanup.shown[0];assert.equal(f.status,'FAIL');assert.equal(shown.source,'kit disposal');assert.equal(shown.error.name.value,'RangeError');
 for(const field of ['name','message','stack']){const text=original[field];assert.equal(shown.error[field].bytes,Buffer.byteLength(text));assert.equal(shown.error[field].sha256,createHash('sha256').update(text).digest('hex'));}
 for(const value of [null,undefined,0]){const captured=[];recordCleanupError(captured,'kit disposal',value);assert.ok(captured[0].error instanceof Error);assert.equal(captured[0].error.message,String(value));const target=path.join(dir,'falsy-'+String(value)+'.json');assert.strictEqual(finalizeReceipt({file:target,row:{phase:'baseline'},problem:null,cleanupErrors:captured,stage:'cleanup',log:()=>{}}),captured[0].error);assert.equal(JSON.parse(fs.readFileSync(target,'utf8')).status,'FAIL');}
});
test('failed merge aggregate retains bounded child diagnostics without recursion',async()=>{
 const {finalizeReceipt,cleanupKit}=await receiptAPI(),path=await import('node:path'),dir=await receiptTemp(),file=path.join(dir,'host.json'),first=new RangeError('source geometry failed'),second=new TypeError('kit disposal failed');
 const geom={dispose(){throw first;}},kit={root:{traverse(fn){fn({geometry:geom});}},dispose(){throw second;}};let aggregate;try{cleanupKit({kit,finishStarted:true,merged:null,sourceCounts:new Map()});}catch(e){aggregate=e;}
 assert.ok(aggregate instanceof AggregateError);assert.deepEqual(aggregate.errors,[first,second]);fs.writeFileSync(file+'.tmp','occupied');
 const result=finalizeReceipt({file,row:{phase:'baseline'},problem:null,cleanupErrors:[{source:'kit disposal',error:aggregate}],stage:'merge',log:()=>{}});assert.strictEqual(result,aggregate);
 const fallback=JSON.parse(fs.readFileSync(file+'.failure.json','utf8')),detail=fallback.cleanup.shown[0].error;assert.equal(detail.name.value,'AggregateError');assert.equal(detail.causes.count,2);assert.equal(detail.causes.omitted,1);assert.equal(detail.causes.shown[0].message.value,'source geometry failed');assert.equal(detail.causes.shown[0].name.value,'RangeError');assert.ok(fs.statSync(file+'.failure.json').size<=16384);
});

test('actual receipt roundtrips signed zeros for strict same-stage owner comparison',async()=>{
 const {writeReceipt}=await receiptAPI(),{assertOwnerRows}=await import('./host-contract.mjs'),path=await import('node:path'),dir=await receiptTemp(),file=path.join(dir,'baseline.json');
 const common={role:null,userData:{structure:{navigation:{outwardNormal:{x:-0,z:-1}}}},nested:[0,-0,{number:-0,text:'-0'}],literal:'-0'};
 const baseline={owners:[common,{role:'lower-front-entablature',geometry:{data:'baseline'},literal:'-0'}]};writeReceipt(file,baseline);const parsed=JSON.parse(fs.readFileSync(file,'utf8'));
 assert.ok(Object.is(parsed.owners[0].userData.structure.navigation.outwardNormal.x,-0));assert.ok(Object.is(parsed.owners[0].nested[0],0));assert.ok(Object.is(parsed.owners[0].nested[1],-0));assert.ok(Object.is(parsed.owners[0].nested[2].number,-0));assert.equal(parsed.owners[0].nested[2].text,'-0');assert.equal(parsed.owners[0].literal,'-0');
 const current=structuredClone(baseline.owners);current[1].geometry={data:'candidate'};assert.doesNotThrow(()=>assertOwnerRows(current,parsed.owners));current[0].userData.structure.navigation.outwardNormal.x=0;assert.throws(()=>assertOwnerRows(current,parsed.owners),/unchanged owner 0/);
});
test('actual signed-zero receipt counts emitted UTF-8 bytes and newline at 8 MiB',async()=>{
 const {writeReceipt}=await receiptAPI(),path=await import('node:path'),dir=await receiptTemp(),cap=8*1024*1024,file=path.join(dir,'exact.json');
 const row={negative:-0,positive:0,literal:'-0',payload:''},expected=x=>JSON.stringify(x,(_key,value)=>Object.is(value,-0)?JSON.rawJSON('-0'):value)+'\n';
 const overhead=Buffer.byteLength(expected(row));row.payload='x'.repeat(cap-overhead-3)+'汉';assert.equal(Buffer.byteLength(expected(row)),cap);writeReceipt(file,row);assert.equal(fs.statSync(file).size,cap);assert.equal(fs.readFileSync(file,'utf8'),expected(row));
 row.payload+='x';const over=path.join(dir,'over.json');assert.throws(()=>writeReceipt(over,row),/host receipt exceeds 8 MiB: 8388609 bytes/);assert.equal(fs.existsSync(over),false);
});
