import * as T from'three';
import{CourtKit}from'../kit.js';
import{applyBoxUV}from'../../../utils/GeometryUV.js';
import{createTriangleTemplate,triangleInstance}from'../../../utils/TriangleSupport.js';
const ID='gaoyunqing',done=new WeakSet(),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
const GATE={kind:'gate',name:'重华门',x:120.2,z:460};
const HALL={kind:'hall',name:'重华宫',x:118.9,z:498.3,w:21.5,d:8.6,pad:1,ph:.75,colH:5.49,roof:'xieshan',enter:true,throne:true};
function hostFor(kit,zone){const r=kit?.root,hosts=[],existing=[];r?.traverse(m=>{if(m.userData.structure?.sourceObjectId==='FC-DCA93F15C3')hosts.push(m);if(m.userData.structure?.sourceObjectId==='FC-700739D144')existing.push(m);});if(!r||r.name!=='west-six'||r.parent||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!Object.isExtensible(kit)||!mutable(r.children)||['colliders','walkables','owned','rooms','mapItems','regions'].some(k=>!mutable(kit[k]))||!same(zone.items?.find(i=>i.name==='重华门'),GATE)||!same(zone.items?.find(i=>i.name==='重华宫'),HALL)||hosts.length!==1||existing.length||done.has(kit))throw Error('Exact mutable untransformed Gaoyunqing host required, once only');const h=hosts[0];if(h.parent!==r||h.position.x!==82||h.position.z!==515.6||h.position.y!==0||h.rotation.y!==0||!mutable(h.children))throw Error('Exact retained Jinzhao host frame required');return h;}
/** A game-only closed-glass viewing treatment. It never opens the host wall,
 * changes old physical owners, admits visitors or completes the rear ensemble. */
export function buildGaoyunqing(kit,zone){
 if(zone?.id!=='west-six')return false;const host=hostFor(kit,zone),windowChanges=[];
 host.traverse(m=>{if(!m.isMesh)return;const backing=m.name==='jinzhao-yucui/side-sill-window-group-fit'&&Math.abs(m.position.x+5.6)<1e-9,pane=m.name==='jinzhao-yucui/closed-window-pane-fit'&&[-6.44,-5.6,-4.76].some(x=>Math.abs(m.position.x-x)<1e-9);if(backing||pane)windowChanges.push({mesh:m,oldMaterial:m.material,kind:backing?'backing':'pane'});});
 if(windowChanges.length!==4||windowChanges.filter(q=>q.kind==='backing').length!==1||windowChanges.some(q=>!q.oldMaterial.name.startsWith('r163_jinzhao_rear_')))throw Error('Exact four easternmost original pane bindings required');
 const s=new CourtKit(kit.lib,'west-six'),cache=new Map();let f,meta;
 const material=(name,color)=>{const key=name+':'+(color??'');if(!cache.has(key)){const m=kit.lib.material(name).clone();m.name='r163_gaoyun_'+key.replace(':','_');if(color!==undefined){m.color.setHex(color);m.map=null;m.normalMap=null;}cache.set(key,m);s.owned.push(m);}return cache.get(key);};
 try{
  f=s.frame(77.1,515.6,Math.PI/2);f.name=ID;
  const mesh=(role,g,m,x=0,y=0,z=0,parent=f)=>{const q=s.mesh(parent,g,m,x,y,z);q.name=ID+'/'+role;return q;};
  const box=(role,w,h,d,x,y,z,color=0x37251c,parent=f)=>mesh(role,applyBoxUV(new T.BoxGeometry(w,h,d),kit.lib.tileSize('wood_column')),material('wood_column',color),x,y,z,parent);
  const finish=(role,w,h,d,x,y,z,color)=>{const m=box(role,w,h,d,x,y,z,color);m.userData.cosmeticSupportedFinish=true;return m;};
  // Millimetre-supported finishes only. The retained real .3m host slab,
  // outer walls and ceiling remain the structural/collision substrate.
  const floor=mesh('supported-dark-floor-finish',applyBoxUV(new T.PlaneGeometry(3.98,3.8),1),material('stone_slab',0x41413d),0,.303,.1);floor.rotation.x=-Math.PI/2;floor.userData.cosmeticSupportedFinish=true;
  finish('supported-east-wall-finish',3.98,4.6,.012,0,2.6,-1.834,0xc5b99b);
  finish('supported-north-wall-finish',.012,4.6,3.8,-2.134,2.6,.1,0xc5b99b);
  finish('supported-ceiling-finish',4.05,.012,3.86,0,4.932,.1,0xc9bea6);
  const wood=0x3d281b,blue=0x174c96;
  box('partition-closed-backing-fit',3.98,4.6,.12,0,2.6,1.88,wood);
  for(let j=0;j<6;j++){const x=-1.65+j*.66;box('blue-partition-panel-fit',.55,3.13,.035,x,2.355,1.797,blue);for(const dx of[-.29,.29])box('partition-wood-mullion-fit',.055,3.25,.075,x+dx,2.355,1.755,wood);for(const y of[.8,1.52,2.55,3.92])box('partition-geometric-cross-fit',.58,.045,.08,x,y,1.75,wood);for(const y of[1,3.7]){box('partition-geometric-grid-fit',.27,.025,.08,x,y,1.74,0x6f4b2c);for(const dx of[-.13,.13])box('partition-geometric-grid-fit',.025,.19,.08,x+dx,y+.08,1.74,0x6f4b2c);}}
  for(const y of[.64,4.02,4.85])box('partition-main-cross-beam-fit',3.98,.1,.18,0,y,1.78,wood);
  for(const x of[-1.96,0,1.96])box('partition-main-post-fit',.1,4.6,.18,x,2.6,1.78,wood);
  // The photograph's three-character board is legible. Keep lettering source-
  // positive, but frame/shape/font are coarse fits, not replicated carving.
  box('interior-nameboard-fit',1.45,.48,.07,0,4.43,1.7,wood);
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=192;const c=canvas.getContext('2d');c.clearRect(0,0,768,192);c.fillStyle='#b39750';c.textAlign='center';c.textBaseline='middle';c.font='bold 132px "Noto Serif CJK SC","Songti SC","SimSun",serif';['情','云','高'].forEach((ch,i)=>c.fillText(ch,128+i*256,99));
  const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;(s.ownedTextures??=[]).push(tex);const sign=new T.MeshStandardMaterial({name:'r163_gaoyun_source_nameboard_glyphs',map:tex,transparent:true,roughness:.8,side:T.DoubleSide});s.owned.push(sign);const label=mesh('verified-interior-nameboard-glyphs',new T.PlaneGeometry(1.4,.35),sign,0,4.43,1.659);label.rotation.y=Math.PI;label.userData.cosmeticSupportedFinish=true;
  // Round table and four separately legged coarse high-back chairs.
  const tableZ=-.3;mesh('round-tabletop-fit',new T.CylinderGeometry(.68,.68,.08,32),material('wood_column',0x34251c),0,1.08,tableZ);
  for(const x of[-.35,.35])for(const z of[tableZ-.35,tableZ+.35])box('table-leg-fit',.065,.74,.065,x,.67,z,wood);
  for(const z of[tableZ-.35,tableZ+.35])box('table-low-stretcher-fit',.76,.045,.045,0,.48,z,wood);
  for(const x of[-.35,.35])box('table-low-stretcher-fit',.045,.045,.76,x,.48,tableZ,wood);
  for(let i=0;i<4;i++){const a=i*Math.PI/2,g=new T.Group();g.position.set(Math.sin(a)*1.03,0,tableZ+Math.cos(a)*1.03);g.rotation.y=a;f.add(g);box('chair-seat-fit',.48,.07,.5,0,.755,0,wood,g);for(const x of[-.19,.19])for(const z of[-.2,.2])box('chair-leg-fit',.045,.42,.045,x,.51,z,wood,g);for(const x of[-.2,.2])box('chair-back-post-fit',.045,.93,.05,x,1.25,.2,wood,g);box('chair-high-back-panel-fit',.38,.72,.055,0,1.4,.2,0x4b3120,g);box('chair-top-crest-fit',.48,.12,.07,0,1.79,.2,wood,g);for(const x of[-.24,.24]){box('chair-arm-fit',.045,.05,.43,x,1.04,0,wood,g);box('chair-front-arm-post-fit',.035,.27,.035,x,.9,-.18,wood,g);}for(const x of[-.2,.2])box('chair-low-side-stretcher-fit',.035,.035,.45,x,.48,0,wood,g);}
  // Console and covered clock are a restrained readable silhouette; fine case,
  // carving, dial numbering and the exact displayed time are not reconstructed.
  box('clock-console-top-fit',1.55,.08,.48,0,1.09,1.15,wood);for(const x of[-.68,.68])for(const z of[.98,1.32])box('console-leg-fit',.06,.75,.06,x,.675,z,wood);
  const gold=0xb29242;box('clock-base-fit',.5,.1,.33,0,1.18,1.14,gold);box('clock-body-fit',.39,.86,.22,0,1.66,1.18,0x8c7234);
  for(const x of[-.21,.21])for(const z of[1.03,1.32])box('clock-gold-upright-fit',.035,.96,.035,x,1.7,z,gold);
  mesh('clock-gold-crown-fit',new T.CylinderGeometry(.13,.24,.22,10),material('wood_column',gold),0,2.25,1.18);mesh('clock-small-finial-fit',new T.SphereGeometry(.065,10,6),material('wood_column',gold),0,2.42,1.18);
  const face=mesh('clock-white-face-fit',new T.CircleGeometry(.17,32),material('wood_column',0xe4dfc9),0,1.68,1.049);face.rotation.y=Math.PI;
  const rim=mesh('clock-dial-rim-fit',new T.TorusGeometry(.178,.018,6,32),material('wood_column',gold),0,1.68,1.047);rim.rotation.y=Math.PI;
  const hand=box('clock-hand-fit',.015,.12,.018,0,1.715,1.035,0x28251e);hand.rotation.z=-.5;const h2=box('clock-hand-fit',.12,.014,.018,.04,1.68,1.035,0x28251e);h2.rotation.z=.2;
  const glass=material('wood_column',0xaac1c8).clone();glass.name='r163_gaoyun_clock_glass';glass.transparent=true;glass.opacity=.1;glass.depthWrite=false;glass.side=T.DoubleSide;glass.roughness=.25;s.owned.push(glass);
  for(const z of[.82,1.51])mesh('clock-glass-cover-fit',new T.BoxGeometry(.73,1.6,.012),glass,0,1.94,z);
  for(const x of[-.37,.37])mesh('clock-glass-cover-fit',new T.BoxGeometry(.012,1.6,.69),glass,x,1.94,1.165);
  for(const x of[-.39,.39])for(const z of[.8,1.53])box('clock-cover-wood-edge-fit',.028,1.66,.028,x,1.94,z,0x755332);
  for(const y of[1.12,2.76]){for(const z of[.8,1.53])box('clock-cover-wood-edge-fit',.81,.035,.035,0,y,z,0x755332);for(const x of[-.39,.39])box('clock-cover-wood-edge-fit',.035,.035,.76,x,y,1.165,0x755332);}
  // Offset the clock/console together to keep its dial clear of a cover edge
  // and the foreground chair from the actual south-window viewer.
  f.traverse(m=>{if(m.isMesh&&/gaoyunqing\/(clock-|console-)/.test(m.name)){m.position.x+=.4;m.position.z+=.15;}});
  // Dedicated clones: no shared host material, geometry or collider changes.
  const glassByKind=new Map();for(const q of windowChanges){if(!glassByKind.has(q.kind)){const m=q.oldMaterial.clone();m.name='r163_gaoyun_view_glass_'+q.kind;m.color.setHex(0xb8c7c7);m.transparent=true;m.opacity=.065;m.depthWrite=false;m.roughness=.25;m.side=T.DoubleSide;s.owned.push(m);glassByKind.set(q.kind,m);}q.newMaterial=glassByKind.get(q.kind);}
  f.updateWorldMatrix(true,true);let n=0;f.traverse(m=>{if(!m.isMesh||m.userData.cosmeticSupportedFinish)return;const v=[],a=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??a.count);i+=3){const q=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(a,ix?.getX(i+j)??i+j).applyMatrix4(m.matrixWorld)).map(p=>new T.Vector3(...p.toArray().map(Math.fround)));if(new T.Triangle(...q).getArea()>1e-12)v.push(...q.flatMap(p=>p.toArray()));}if(!v.length)throw Error('Empty Gaoyunqing solid owner');const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+n+++'/'+m.name.slice(ID.length+1)),b=shape.box.clone();b.triangleSupport=shape;b.gaoyunMesh=m.uuid;s.colliders.push(b);}finally{g.dispose();}});
  if(!new T.Box3(new T.Vector3(75.25,.29,513.35),new T.Vector3(79.21,4.941,517.75)).containsBox(new T.Box3().setFromObject(f)))throw Error('Gaoyunqing escaped retained east host fit');
  meta={id:ID,sourceObjectId:'FC-700739D144',hostObjectId:'FC-DCA93F15C3',name:'高云情东室可观景局部',viewerAdmission:'OUTSIDE_CLOSED_GLAZING_ONLY_GAME_FIT',currentAdmissionVerified:false,wholeObjectAccepted:false,fengyacunComplete:false,completeRearHall:false,newRooms:0,newMapItems:0,source:'https://www.dpm.org.cn/explore/building/236449.html',ownPhoto:'https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efefa881acd4.jpg',ownPhotoSHA256:'1f836ba93e7656d7fce15b31556b60a3687ed6b15a6345af6216b9e9773d3f83',sourceSupported:['captioned Gaoyunqing rear-east interior: deep wood framed blue partitions, round table and high-back chairs','gold-toned clock within tall transparent cover behind table; exact carving and time not reproduced','legible three-character interior nameboard, source-positive text only; font/frame shape are fitted'],fit:['all coordinates,4chair count,scale/material colors and west-edge partition placement/camera orientation','coarse backed panels, table/chair/console/clock geometry, curtain-free muted interior finishes; hidden details omitted','game-only transparent visual material for one pre-existing south window backing plus three panes; every original physical owner and mesh geometry stays closed and unchanged','supported cosmetic floor/lining finish, no new physical floor or artificial walk support'],excluded:['visitor entry or verified real window/public opening state','new exterior building/roof/corridor, Fengyacun, complete rear hall or new room/map teleport','historic painting, detailed carving, couplet calligraphy, exact dial/time, invented furniture inventory','old outside routes/walls/physics/streaming edits, remote/main/Pages'],unknown:['surveyed room dimensions/orientation/full layout and hidden furniture','GPU/browser/mobile alpha appearance, real present access and complete object acceptance','outside512.1 direct teleport remains unsupported by original zone bounds']};f.userData.structure=meta;
 }catch(e){s.dispose(s.root);throw e;}
 // All fallible preparation is complete. Attach the component under its actual
 // host while preserving world geometry, then publish only the four clones.
 s.root.remove(f);f.position.set(-4.9,0,0);host.add(f);for(const q of windowChanges)q.mesh.material=q.newMaterial;
 kit.colliders.push(...s.colliders);kit.owned.push(...s.owned);if(s.ownedTextures)(kit.ownedTextures??=[]).push(...s.ownedTextures);done.add(kit);return{frame:f,meta,windowChanges};
}
