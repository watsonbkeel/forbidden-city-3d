import * as T from 'three';
import {CourtKit} from '../kit.js';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='shufang-stage',done=new WeakSet();
const GATE={kind:'gate',name:'重华门',x:120.2,z:460};
const HALL={kind:'hall',name:'重华宫',x:118.9,z:498.3,w:21.5,d:8.6,pad:1,ph:.75,colH:5.49,roof:'xieshan',enter:true,throne:true};
const COURT={kind:'courtWalls',x0:92.62,x1:145.18,z0:460,z1:505.6,gates:[{side:'s',at:120.2,gate:'重华门'}],source:'estimated'};
export const SHUFANG_STAGE_FIT=Object.freeze({x:82,z:473,rotation:Math.PI,floorWidth:11.25,floorDepth:8,stageY:1.1,bounds:Object.freeze([73.5,0,466.5,90.5,13,479.5])});
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
function validateHost(kit,zone){const r=kit?.root,find=(kind,name)=>zone.items?.filter(i=>i.kind===kind&&i.name===name)??[];let existing=false;r?.traverse(m=>{if(m.userData.structure?.sourceObjectId==='FC-8741AF42DE')existing=true;});if(find('gate','重华门').length!==1||!same(find('gate','重华门')[0],GATE)||find('hall','重华宫').length!==1||!same(find('hall','重华宫')[0],HALL)||zone.items?.filter(i=>same(i,COURT)).length!==1||!r||r.name!=='west-six'||r.parent||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!Object.isExtensible(r)||!mutable(r.children)||!Object.isExtensible(kit)||['colliders','walkables','owned','rooms','mapItems','regions'].some(k=>!mutable(kit[k]))||done.has(kit)||existing)throw Error('Exact untransformed mutable Shufang host required, once only');}
/** Closed curved roof shells. Lower shell is annular around the real attic;
 * the upper shell converges to a tiny closed crown. No guessed beast rows. */
function roofGeometry(rings,closedCentre=false){
 const v=[],uv=[],tri=(a,b,c)=>{v.push(...a,...b,...c);for(const p of[a,b,c])uv.push(p[0]/2,p[2]/2);},quad=(a,b,c,d)=>{tri(a,b,c);tri(a,c,d);},N=8;
 const point=(r,s,u,down=0)=>{const[hx,hz,y,lift]=r,t=2*u-1;let x,z;if(s===0){x=hx*t;z=-hz;}else if(s===1){x=hx;z=hz*t;}else if(s===2){x=-hx*t;z=hz;}else{x=-hx;z=-hz*t;}return[x,y+lift*Math.pow(Math.abs(t),8)-down,z];};
 for(let k=0;k<rings.length-1;k++)for(let s=0;s<4;s++)for(let j=0;j<N;j++){const a=j/N,b=(j+1)/N;quad(point(rings[k],s,a),point(rings[k+1],s,a),point(rings[k+1],s,b),point(rings[k],s,b));}
 const bottomStart=v.length/9;
 for(let k=0;k<rings.length-1;k++)for(let s=0;s<4;s++)for(let j=0;j<N;j++){const a=j/N,b=(j+1)/N;quad(point(rings[k],s,b,.16),point(rings[k+1],s,b,.16),point(rings[k+1],s,a,.16),point(rings[k],s,a,.16));}
 const bottomCount=v.length/9-bottomStart;
 for(const[end,inner]of[[rings[0],false],[rings.at(-1),true]])for(let s=0;s<4;s++)for(let j=0;j<N;j++){const a=point(end,s,j/N),b=point(end,s,(j+1)/N),A=point(end,s,j/N,.16),B=point(end,s,(j+1)/N,.16);if(inner)quad(a,A,B,b);else quad(a,b,B,A);}
 if(closedCentre){const r=rings.at(-1),a=[0,1,2,3].map(s=>point(r,s,0)),b=a.map(p=>[p[0],p[1]-.16,p[2]]);tri(a[0],a[2],a[1]);tri(a[0],a[3],a[2]);tri(b[0],b[1],b[2]);tri(b[0],b[2],b[3]);}
 const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3)).setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();g.userData={bottomStart,bottomCount};return g;
}
export function buildShufangStage(kit,zoneJson){
 if(zoneJson?.id!=='west-six')return false;validateHost(kit,zoneJson);
 const staged=new CourtKit(kit.lib,'west-six');let f,meta;
 try{
  const cache=new Map(),material=(name,color)=>{const key=name+':'+(color??'');if(!cache.has(key)){const m=kit.lib.material(name).clone();m.name='r163_shufang_stage_'+key.replace(':','_');if(color!==undefined){m.color.setHex(color);m.map=null;m.normalMap=null;}cache.set(key,m);staged.owned.push(m);}return cache.get(key);};
  f=staged.frame(82,473,Math.PI);f.name=ID;
  const mesh=(role,g,m,x=0,y=0,z=0)=>{const q=staged.mesh(f,g,m,x,y,z);q.name=ID+'/'+role;return q;};
  const box=(role,name,w,h,d,x,y,z,color)=>{const m=material(name,color),tile=kit.lib.tileSize(name),g=applyBoxUV(new T.BoxGeometry(w,h,d),tile);return mesh(role,g,m,x,y,z);};
  box('real-stone-foundation','stone_slab',11.8,.95,8.6,0,.475,0);
  const deck=box('real-stage-deck','wood_column',11.25,.15,8,0,1.025,0,0x57605a);deck.userData.shufangStageTop=true;
  const green=material('wood_column',0x285c4d),xs=[-5.625,-1.875,1.875,5.625],zs=[-4,-4/3,4/3,4];
  for(const x of xs)for(const z of zs)if(Math.abs(x)===5.625||Math.abs(z)===4)mesh('perimeter-column-fit',new T.CylinderGeometry(.16,.19,4.6,12),green,x,3.4,z);
  box('closed-backstage-boundary-fit','wall_red',11.25,4.5,.24,0,3.35,3.88,0x365b49);
  for(const x of[-5.505,5.505])box('closed-side-rear-fit','wall_red',.24,4.5,5.33,x,3.35,1.335,0x365b49);
  for(const z of[-4,4])box('visible-top-beam','caihua_beam',11.55,.42,.35,0,5.53,z);
  for(const x of[-5.625,5.625])box('visible-top-beam','caihua_beam',.35,.42,8.3,x,5.53,0);
  box('plain-stage-ceiling-fit','wood_column',11.25,.1,8,0,5.62,0,0x254e69);
  // Front rail has no guessed public stair opening; actual stage access and
  // attached south range remain unverified rather than invented backstage.
  const red=0x8d352c;
  for(const y of[1.33,2.04])box('front-low-red-rail-fit','wood_column',11.25,.1,.1,0,y,-4.1,red);
  for(let k=0;k<=12;k++)box('front-low-red-rail-fit','wood_column',.07,.7,.08,-5.625+k*11.25/12,1.68,-4.1,red);
  for(const x of[-5.7,5.7])for(const y of[1.33,2.04])box('side-low-red-rail-fit','wood_column',.1,.1,2.7,x,y,-2.75,red);
  for(const z of[-2.4,2.4])box('attic-cross-bearing-fit','wood_column',11.25,.18,.24,0,5.65,z,0x285c4d);
  for(const x of[-3,3])for(const z of[-2.4,2.4])box('attic-bearing-post-fit','wood_column',.24,1.72,.24,x,6.56,z,0x285c4d);
  // Keep the observed window/body bottom; a plain fitted upper closure bears
  // directly into the upper roof (small local overlap), not a floating eave.
  box('closed-upper-clerestory-not-floor','wall_red',6.7,2,5.5,0,8.4,0,0x4b6b57);
  for(let k=0;k<5;k++){const x=-2.68+k*1.34;box('front-clerestory-window-fit','wood_column',1.09,.82,.06,x,8.2,-2.79,0x244b4b);for(const dx of[-.3,0,.3])box('clerestory-coarse-grid-fit','wood_column',.04,.82,.07,x+dx,8.2,-2.83,0x8c5140);}
  const tile=material('roof_tile');
  const lowerRoof=mesh('lower-annular-roof',roofGeometry([[8,6,5.9,.28],[6.6,5,6.12,.17],[4.8,3.7,6.75,.08],[3.25,2.65,7.45,0]]),tile);
  mesh('upper-convergent-roof',roofGeometry([[4.55,3.95,8.92,.23],[3.7,3.2,9.17,.16],[2.45,2.1,9.8,.08],[1.15,.98,10.7,.02],[.1,.085,11.5,0]],true),tile);
  // Coarse fitted bearing blocks close the real gap above every perimeter
  // post. Height follows this new roof only, never a historical bracket count.
  f.updateWorldMatrix(true,true);
  for(const x of xs)for(const z of zs)if(Math.abs(x)===5.625||Math.abs(z)===4){const start=f.localToWorld(new T.Vector3(x,20,z)),hit=new T.Raycaster(start,new T.Vector3(0,-1,0)).intersectObject(lowerRoof,false)[0];if(!hit)throw Error('Missing fitted stage roof bearing');const top=hit.point.y-.16,h=top-5.7;if(!(h>0&&h<2))throw Error('Stage roof bearing escaped local fit');box('coarse-roof-bearing-fit','wood_column',.43,h,.43,x,5.7+h/2,z,0x285c4d);}
  const gold=material('roof_tile',0xc9a747);mesh('coarse-finial-fit',new T.CylinderGeometry(.13,.23,.6,10),gold,0,11.78,0);mesh('coarse-finial-cap-fit',new T.SphereGeometry(.17,10,6),gold,0,12.12,0);
  f.updateWorldMatrix(true,true);let n=0;
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.shufangStageTop){const b=new T.Box3().setFromObject(m);b.shufangStageTop=true;staged.colliders.push(b);const top=b.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false});return;}
   const vertices=[],a=m.geometry.attributes.position,ix=m.geometry.index;for(let k=0;k<(ix?.count??a.count);k+=3){const v=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(a,ix?.getX(k+j)??k+j).applyMatrix4(m.matrixWorld)).map(v=>new T.Vector3(...v.toArray().map(Math.fround)));if(new T.Triangle(...v).getArea()>1e-12)vertices.push(...v.flatMap(v=>v.toArray()));}if(!vertices.length)throw Error('Empty Shufang owned mesh');const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const t=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+n+++'/'+m.name.slice(ID.length+1)),b=t.box.clone();b.triangleSupport=t;staged.colliders.push(b);}finally{g.dispose();}
  });
  const b=new T.Box3().setFromObject(f);if(!new T.Box3(new T.Vector3(73.5,-1e-6,466.5),new T.Vector3(90.5,13,479.5)).containsBox(b))throw Error('Shufang escaped fitted clear envelope '+JSON.stringify(b));
  meta={id:ID,sourceObjectId:'FC-8741AF42DE',name:'漱芳斋院内戏台',bayGrid:[3,3],performanceLevels:1,eaveCount:2,front:'NORTH_MODEL_ROTATION_PI',dimensionStatus:'ENGINEERING_FIT_NOT_SURVEYED',wholeObjectAccepted:false,currentAdmissionVerified:false,newRooms:0,newMapItems:0,stageAdmission:'NO_VERIFIED_ENTRANCE_OR_STAGE_DESTINATION',upperBody:'CLOSED_CLERESTORY_AND_ROOF_ATTIC_NOT_SECOND_PERFORMANCE_FLOOR',source:'https://www.dpm.org.cn/explore/building/236449.html',ownPhoto:'https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efefa882002c.jpg',ownPhotoSHA256:'5d8d96eeae2022d72b41df3ddda4944b8eedbfcd572b614c3d5be132d1b8a46a',photographyDate:null,sourceSupported:['official text: three bays across/deep, yellow-glazed double-eave four-corner convergent roof, approximately90m² and a single performance stage','own front photograph: raised stone base, green open frame, front red low rail, two eaves and upper clerestory body','north-facing front inferred from official south-range/north-side attachment opposite main front hall'],fit:['all coordinates, dimensions/heights and rectangular11.25x8 floor ratio, not surveyed despite approximate90m² textual area','twelve perimeter posts and twelve plain roof bearings/two attic crossbearings, plain ceiling/hidden rear-side closure and attic supports/upper bearing closure; all structural fit, not detailed original bracket inventory; coarse rail/window repeats and generic painted-beam material','roof ring curves, underside, convergence/finial and all unseen details'],excluded:['室内风雅存小戏台身份, second performance floor/upstairs destination','guessed stair, southern attached range/backstage/gallery, room/map or public-stage access','fine original lettering, sculpture/ornament count, furniture and exhibition fixtures','global physics, moving old structures, remote/main/Pages'],unknown:['surveyed exact stage footprint and relative coordinate','real backstage/performer entry and current admission','full interior/truss/paint and roof details','GPU/mobile/full streaming acceptance']};f.userData.structure=meta;
 }catch(e){staged.dispose(staged.root);throw e;}
 kit.root.add(f);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);done.add(kit);return{frame:f,meta};
}
