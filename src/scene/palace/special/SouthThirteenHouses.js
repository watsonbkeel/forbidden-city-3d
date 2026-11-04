import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='south-thirteen-houses',OBJECT='FC-2D04E0B566',GROUP='FC-ABA67505AC',done=new WeakSet();
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
export const SOUTH_THIRTEEN_FIT=Object.freeze({x:-361.6,firstZ:155,pitch:14,count:13,width:8.4,depth:5.4,floorY:.18,wallTop:3.15,roofTop:4.35,westWallX:-357.05,laneX:-355.7});
function validate(kit,zone){
 const r=kit?.root;let exists=false;r?.traverse(o=>{if(o.userData.structure?.sourceObjectId===OBJECT)exists=true});
 if(!r||r.name!=='ningshou'||r.parent||r.position.lengthSq()||!r.quaternion.equals(new T.Quaternion())||!r.scale.equals(new T.Vector3(1,1,1))||!r.matrix.equals(new T.Matrix4())||!r.matrixWorld.equals(new T.Matrix4())||!r.matrixAutoUpdate||!r.matrixWorldAutoUpdate||!mutable(r.children)||['colliders','walkables','owned'].some(k=>!mutable(kit[k]))||JSON.stringify(zone.bounds)!=='{"x0":-366.5,"x1":-222.45,"z0":111.5,"z1":526.5}'||zone.items?.filter(i=>i.kind==='gate'&&i.name==='敛禧门'&&i.x===-354&&i.z===136.8).length!==1||zone.items?.filter(i=>i.kind==='gate'&&i.name==='保泰门'&&i.x===-353.8&&i.z===336.5).length!==1||exists||done.has(kit))throw Error('Exact mutable untransformed South Thirteen host required, once only');
 const reserve=new T.Box3(new T.Vector3(-366.3,.01,148),new T.Vector3(-355.1,6,330));
 if(kit.colliders.some(c=>(c.box??c).intersectsBox(reserve))||kit.walkables.some(w=>w.box?.intersectsBox(reserve)))throw Error('South Thirteen fitted reserve is occupied');
}
/** Official count/form, fitted compact layout. No north group, furniture,
 * unknown annexes, named temporary labels or claim of current museum access. */
export function buildSouthThirteenHouses(kit,zone){
 if(zone?.id!=='ningshou')return false;validate(kit,zone);
 const frame=new T.Group();frame.name='南十三排';frame.userData.southThirteenFeature=true;
 const geometries=[],materials=[],colliders=[],walkables=[],rows=[],courts=[],P=SOUTH_THIRTEEN_FIT;
 const own=g=>{geometries.push(g);return g};
 const material=(name,color,borrow)=>{const m=new T.MeshStandardMaterial();materials.push(m);if(borrow)m.copy(kit.lib.material(borrow));m.name='r164_south_thirteen_'+name;m.color.setHex(color);m.roughness=.9;return m};
 const mesh=(host,role,g,mat,x,y,z,solid=false)=>{const m=new T.Mesh(g,mat);m.name=role;m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;m.userData.southThirteenFeature=true;m.userData.southThirteenSolid=solid;host.add(m);return m};
 const box=(host,role,mat,w,h,d,x,y,z,solid=false)=>{let g=own(new T.BoxGeometry(w,h,d));if(mat.name==='r164_south_thirteen_grey_brick_fit'){const raw=g;g=own(new T.BufferGeometry());
    // Register the replacement before copying any attribute. toNonIndexed()
    // returns only after copy and can strand its temporary geometry on error.
    for(const [key,a]of Object.entries(raw.attributes)){const values=new a.array.constructor(raw.index.count*a.itemSize);for(let i=0;i<raw.index.count;i++)for(let j=0;j<a.itemSize;j++)values[i*a.itemSize+j]=a.array[raw.index.getX(i)*a.itemSize+j];g.setAttribute(key,new T.BufferAttribute(values,a.itemSize,a.normalized))}
    g.groups=raw.groups.map(q=>({...q}));raw.dispose();geometries.splice(geometries.indexOf(raw),1);applyBoxUV(g,kit.lib.tileSize('wall_brick'))}return mesh(host,role,g,mat,x,y,z,solid)};
 try{
  const brick=material('grey_brick_fit',0x8a8880,'wall_brick'),wood=material('red_timber_fit',0x762e25),window=material('window_dark_fit',0x303d37),paper=material('pale_window_field_fit',0xc7c7b7),roof=material('roof_tile_grey_fit',0x5e615e),green=material('painted_beam_fit',0x34564b),stone=kit.lib.material('stone_slab');
  for(let i=0;i<P.count;i++){
   const f=new T.Group(),z=P.firstZ+i*P.pitch,rot=i<12&&i%2===0?Math.PI:0;f.name='南十三排排房';f.position.set(P.x,0,z);f.rotation.y=rot;f.userData.southThirteenFeature=true;frame.add(f);
   box(f,'stone-platform',stone,8.6,P.floorY,5.6,0,P.floorY/2,0);
   const y=(P.floorY+P.wallTop)/2,h=P.wallTop-P.floorY;
   for(const x of[-4.1,4.1])box(f,'hard-gable-side-wall',brick,.2,h,4.1,x,y,.65,true);
   box(f,'rear-wall',brick,8.4,h,.2,0,y,2.6,true);
   // Central open doorway in the middle of three bays. Opaque side fields
   // are a simple architectural shell, not a present office inventory.
   for(const x of[-2.625,2.625]){
    box(f,'front-sill-wall',brick,3.15,.8,.2,x,P.floorY+.4,-1.3,true);
    box(f,'front-window-field',paper,3.03,1.65,.12,x,P.floorY+1.625,-1.32,true);
    for(const dx of[-1.53,0,1.53])box(f,'window-vertical-frame',wood,.07,1.65,.08,x+dx,P.floorY+1.625,-1.41);
    for(const yy of[P.floorY+.8,P.floorY+1.35,P.floorY+2.45])box(f,'window-horizontal-frame',wood,3.13,.065,.08,x,yy,-1.41);
    for(const dx of[-.75,.75])box(f,'upper-dark-window',window,1.4,.63,.02,x+dx,P.floorY+2.1,-1.39);
   }
   for(const x of[-1.1,1.1])box(f,'central-door-jamb',wood,.1,2.55,.2,x,P.floorY+1.275,-1.3,true);
   box(f,'central-door-lintel',wood,2.3,.15,.2,0,P.floorY+2.625,-1.3,true);
   box(f,'front-upper-wall',brick,8.4,P.wallTop-(P.floorY+2.7),.2,0,(P.wallTop+P.floorY+2.7)/2,-1.3,true);
   // Four posts establish three front-gallery bays without closing the door.
   for(const x of[-4.1,-1.4,1.4,4.1])box(f,'front-gallery-post',wood,.16,h,.16,x,y,-2.6,true);
   box(f,'front-gallery-beam',green,8.5,.22,.18,0,P.wallTop-.11,-2.6,true);
   const shape=new T.Shape();shape.moveTo(-2.9,3.05);shape.lineTo(2.9,3.05);shape.lineTo(2.9,P.wallTop);shape.lineTo(0,P.roofTop);shape.lineTo(-2.9,P.wallTop);shape.closePath();
   const g=own(new T.ExtrudeGeometry(shape,{depth:8.9,bevelEnabled:false,steps:1}));g.translate(0,0,-4.45);g.rotateY(Math.PI/2);mesh(f,'grey-hard-gable-roof',g,roof,0,0,0,true);
   box(f,'grey-ridge',roof,8.9,.13,.14,0,P.roofTop+.035,0);
   // Coarse longitudinal tile ribs show the roof type; their count is fitted.
   for(let j=0;j<=18;j++)for(const s of[-1,1]){const dy=P.roofTop-P.wallTop,dz=2.9,len=Math.hypot(dy,dz),m=box(f,'coarse-grey-tile-rib',roof,.045,.04,len,-4.45+j*8.9/18,P.wallTop+dy/2+.025,s*dz/2);m.rotation.x=s*Math.atan2(dy,dz)}
   f.updateMatrix();const floor=new T.Box3(new T.Vector3(-4.3,P.floorY,-2.8),new T.Vector3(4.3,P.floorY,2.8)).applyMatrix4(f.matrix);walkables.push({type:'box',box:floor,rescue:false,southThirteenFeature:true});
   rows.push({index:i+1,x:P.x,z,front:rot?'north':'south',bays:3,depthBays:1,frontGallery:true,floorY:P.floorY,doorLocalX:0,doorLocalZ:-1.3,doorWidth:2.1});
  }
  // Six paired courts have west-side gaps. The through lane remains outside
  // this new boundary, clear of both existing Lianxi and BaoTai exits.
  const west=P.westWallX,east=-366.05,start=151.9,end=327.1,gaps=Array.from({length:6},(_,i)=>162+i*28),wall=(axis,from,to,at)=>{if(to-from<=0)return;if(axis==='z')box(frame,'court-boundary',brick,.18,2.7,to-from,at,1.35,(from+to)/2,true);else box(frame,'court-boundary',brick,to-from,2.7,.18,(from+to)/2,1.35,at,true)};
  let cursor=start;for(const z of gaps){wall('z',cursor,z-1.3,west);cursor=z+1.3;courts.push({index:courts.length+1,westDoor:{x:west,z,width:2.6},southRow:2*courts.length+1,northRow:2*courts.length+2})}wall('z',cursor,311.8,west);wall('z',start,end,east);
  // The unpaired northern row uses an open west approach beyond the sixth
  // court. That gap is a game circulation fit, not a seventh historic gate.
  // Separate paired courts from the unassigned service gaps between rows.
  for(let i=0;i<6;i++){const a=P.firstZ+i*28-2.8,b=P.firstZ+i*28+14+2.8;wall('x',east,west,a);wall('x',east,west,b)}
  frame.updateWorldMatrix(true,true);
  for(const m of frame.children.flatMap(f=>f.isMesh?[f]:f.children).filter(m=>m.isMesh&&m.userData.southThirteenSolid)){
   if(m.name==='grey-hard-gable-roof'){
    const g=new T.BufferGeometry();geometries.push(g);try{g.copy(m.geometry);g.applyMatrix4(m.matrixWorld);const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/roof/'+colliders.length),b=shape.box.clone();b.triangleSupport=shape;b.southThirteenFeature=true;colliders.push(b)}finally{g.dispose();geometries.splice(geometries.indexOf(g),1)}
   }else{const b=new T.Box3().setFromObject(m);if(['central-door-lintel','front-gallery-beam'].includes(m.name))b.overhead={type:'piecewise-linear-x',sourceId:ID+'/'+m.name+'/'+colliders.length,points:[[b.min.x,b.min.y],[b.max.x,b.min.y]],minZ:b.min.z,maxZ:b.max.z,topY:b.max.y};b.southThirteenFeature=true;colliders.push(b)}
  }
 }catch(e){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();throw e}
 const meta={id:ID,sourceObjectId:OBJECT,aggregateGroupId:GROUP,name:'南十三排',scope:'SOUTH_GROUP_THIRTEEN_MAIN_ROW_HOUSE_SHELLS_AND_SIX_WEST_COURT_GAPS',wholeObjectAccepted:false,surveyed:false,currentAdmissionVerified:false,source:'https://www.dpm.org.cn/explore/building/236528.html',sourceImages:['https://img.dpm.org.cn/Uploads/Picture/dc/8283%5B1024%5D.jpg','https://img.dpm.org.cn/Uploads/Picture/dc/8285%5B1024%5D.jpg'],rows,courts,fit:{...P,colour:'SIMPLIFIED_GREY_TILE_BRICK_AND_RED_GALLERY_FIT',interior:'OPEN_GAME_SHELL_INVENTORY_UNKNOWN',doorPose:'GAME_CIRCULATION_NOT_CURRENT_OPENING',northEndApproach:'OPEN_FITTED_WEST_ACCESS_NOT_A_SEVENTH_HISTORIC_COURT_GATE'},notBuilt:['North Thirteen group','Two small south annex rooms at the north end','South hanging-flower gate and precise courtyard inventory','Original decorative patterns, current offices/vegetation and museum access'],newMapItems:0,newRooms:0,newTeleportTargets:0,upperDestinations:false};
 frame.userData.structure=meta;kit.root.add(frame);kit.colliders.push(...colliders);kit.walkables.push(...walkables);kit.owned.push(...materials);done.add(kit);return{frame,meta,colliders,walkables,materials};
}
