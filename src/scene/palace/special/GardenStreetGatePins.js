import * as T from 'three';
import {CourtKit,FACE} from '../kit.js';
import {TextureLibrary} from '../../../utils/TextureLibrary.js';

// Own photographs, not neighboring-gate templates. Only the four projecting
// red/gold pins are admitted; the existing generic gates remain unaccepted.
const SOURCES = [
 [30,'长康左门',-64,422.7,undefined,'FC-D2B1DB1C8C',-1,'365950','25/9d/e8ed5d964e1aa3e9bf2f12f9264b/7b66d3b6-ef26-4074-8e93-284490793367.jpg'],
 [31,'长康右门',63.7,422.7,undefined,'FC-E18D4B34CA',-1,'365954','43/4a/3879b78b493c8216091f0f1486d2/f22b31c5-79c8-460c-b89f-d00e59c8d119.jpg'],
 [26,'琼苑东门',-68,429.7,'east','FC-4BC6AD858B',1,'365951','0d/dc/7814802445bdb368f81a439b43f0/ca90bc73-1503-4b41-8dcd-13d402c02306.jpg'],
 [27,'琼苑西门',68,429.7,'west','FC-75C4A83F02',1,'365952','e3/9a/5e61fecb49d890e549b06fd61b37/5980073e-4383-47cb-8029-3f5589603773.jpg'],
];
const installed = new WeakSet();
const fail = () => { throw new Error('Garden street pins require an intact, mutable default gate host, once only'); };
const sameArray = (a,b) => a?.length===b?.length && Array.from(a).every((v,i)=>v===b[i]);
const mutableArray = a => Array.isArray(a) && Object.isExtensible(a) && Object.getOwnPropertyDescriptor(a,'length')?.writable && Object.keys(a).every(k=>Object.getOwnPropertyDescriptor(a,k)?.writable);
const identity = o => o?.position?.lengthSq()===0 && o.quaternion.toArray().every((v,i)=>v===[0,0,0,1][i]) && o.scale.toArray().every(v=>v===1);
function materialStream(material) {
 if (!material) return null;
 // Seed texture handles so material serialization never reads image pixels.
 const textures=Object.fromEntries(Object.values(material).filter(v=>v?.isTexture).map(t=>[t.uuid,{uuid:t.uuid}]));
 const json=material.toJSON({textures,images:{}});delete json.uuid;delete json.metadata;
 return JSON.stringify(json);
}
function sameGeometry(a,b) {
 if (!a || !b) return a===b;
 const keys=Object.keys(a.attributes), expected=Object.keys(b.attributes);
 return a.type===b.type && sameArray(keys,expected) && keys.every(k=>{
  const x=a.attributes[k],y=b.attributes[k];
  return x.itemSize===y.itemSize && x.normalized===y.normalized && x.array.constructor===y.array.constructor && sameArray(x.array,y.array);
 }) && (a.index===null&&b.index===null || a.index&&b.index&&sameArray(a.index.array,b.index.array)) && JSON.stringify(a.groups)===JSON.stringify(b.groups) && JSON.stringify(a.drawRange)===JSON.stringify(b.drawRange);
}
function sameTree(a,b) {
 if (!a || a.type!==b.type || a.name!==b.name || a.children.length!==b.children.length || !sameArray(a.position.toArray(),b.position.toArray()) || !sameArray(a.quaternion.toArray(),b.quaternion.toArray()) || !sameArray(a.scale.toArray(),b.scale.toArray()) || a.matrixAutoUpdate!==b.matrixAutoUpdate || JSON.stringify(a.userData)!==JSON.stringify(b.userData) || !sameGeometry(a.geometry,b.geometry) || materialStream(a.material)!==materialStream(b.material)) return false;
 return a.children.every((c,i)=>c.parent===a && sameTree(c,b.children[i]));
}
function validMatrices(node,parentWorld=new T.Matrix4()) {
 const local=new T.Matrix4().compose(node.position,node.quaternion,node.scale),world=new T.Matrix4().multiplyMatrices(parentWorld,local),unit=new T.Matrix4();
 // CourtKit children may still have untouched lazy identity matrices, or may
 // already have been updated normally. Neither state requires writing to them.
 return node.matrixAutoUpdate===true && (node.matrix.equals(unit)||node.matrix.equals(local)) && (node.matrixWorld.equals(unit)||node.matrixWorld.equals(world)) && node.children.every(child=>validMatrices(child,world));
}
function validateHost(kit,frame,source) {
 if (!kit || kit.root?.parent!==null || kit.root?.name!=='garden' || !identity(kit.root) || frame?.parent!==kit.root || !Object.isExtensible(kit.root) || !Object.isExtensible(frame) || installed.has(frame) || !mutableArray(kit.root.children) || !mutableArray(frame.children) || ['owned','colliders','walkables','rooms','mapItems','regions','plaques'].some(k=>!mutableArray(kit[k])) || kit.root.matrixAutoUpdate!==true || !kit.root.matrix.equals(new T.Matrix4()) || !kit.root.matrixWorld.equals(new T.Matrix4()) || !validMatrices(frame)) fail();
 // Independent default materials, but the exact existing texture handles and
 // manifest dimensions. No material() calls, disposal or writes on kit.lib.
 // Replay the production default gate to reject even altered vertex/UV bytes,
 // including roof/door/plaque descendants, without updating old host matrices.
 const lib=new TextureLibrary();lib.colors=new Map(kit.lib.colors);lib.normals=new Map(kit.lib.normals);lib.manifest=kit.lib.manifest;
 const reference=new CourtKit(lib,'garden');
 try {
  reference.gate({x:source[2],z:source[3],rot:FACE[source[4]]??0,name:source[1]});
  if (!sameTree(frame,reference.root.children[0])) fail();
  const plaque=kit.plaques.filter(p=>p.mesh.parent===frame || p.frame.parent===frame);
  if (plaque.length!==1 || plaque[0].text!==source[1] || !frame.children.includes(plaque[0].mesh) || !frame.children.includes(plaque[0].frame)) fail();
 } finally {
  reference.dispose(reference.root);
  // Reference shares texture handles: never call lib.dispose().
  for (const material of lib.materials.values()) material.dispose();
 }
}
function polygon(radius,clockwise=false) {
 const points=Array.from({length:6},(_,i)=>{const a=(clockwise?-1:1)*i*Math.PI/3;return new T.Vector2(radius*Math.cos(a),radius*Math.sin(a));});
 return points;
}
function prism(radius,depth,holeRadius=0) {
 const shape=new T.Shape(polygon(radius));
 if (holeRadius) shape.holes.push(new T.Path(polygon(holeRadius,true)));
 return new T.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:false,curveSegments:1});
}

export function applyGardenStreetGatePins(kit,frame,{zoneId,itemIndex,item}={}) {
 if (zoneId!=='garden') return false;
 const source=SOURCES.find(s=>s[0]===itemIndex && item?.kind==='gate' && item.name===s[1] && item.x===s[2] && item.z===s[3] && item.rot===s[4]);
 if (!source) return false;
 const defaults={w:3.6,h:4.4,t:1,style:'wall',gateKind:'wall',roof:'xieshan',brackets:true,layers:1,eaveCount:1};
 if(Object.entries(defaults).some(([k,v])=>item[k]!==undefined&&item[k]!==v) || ['gateProfile','open','plaque'].some(k=>item[k]!==undefined)) fail();
 validateHost(kit,frame,source);
 const side=source[6],id='garden-street-front-pins-'+source[5];
 const meta={id,sourceObjectId:source[5],name:source[1],wholeObjectAccepted:false,scope:'FOUR_SOURCE_FRONT_DOOR_PINS_ONLY',dimensions:'ENGINEERING_FIT_NOT_SURVEY',
  source:'https://arch.seu.edu.cn/hcsj/2021/0325/c33106a'+source[7]+'/page.htm',ownPhoto:'https://arch.seu.edu.cn/_upload/article/images/'+source[8],sourceAuthority:'故宫博物院与东南大学联合策展',
  photoFaceLocalZ:side,photoFaceCardinalStatus:side<0?'UNKNOWN_ENGINEERING_TRANSFER':'CONTEXTUAL_INFERENCE_NOT_SURVEY',
  photoFaceReason:side<0?'Camera cardinal face UNKNOWN; own-photo pins transferred only to retained plaque/front local -Z as engineering fit, not a north/south identification':'Own-photo adjacent buildings and opposite street wall imply garden-inside face local +Z; contextual inference, not surveyed compass metadata',
  sourceSupported:['four projecting door pins in one row','red center/body and gold-colored polygonal edge'],
  fit:{nominalCentersX:[-1.5,-.5,.5,1.5],centersX:[-1.5,-.57,.57,1.5],centerY:4.70,wallFaceZ:side*1.4,outerRadius:.14,bodyRadius:.118,projection:.21,outlineSides:6,plaqueClearance:.01,
   note:'Inner centers shifted outward by .07m to clear actual retained plaque frame X ±.42 by .01m. Dimensions, colors and six-sided coarse outline are engineering fits; Changkang exact corner count is NOT asserted.'},
  excluded:['new gate body/roof/plaque','hidden or opposite-face copying','carved/flower/corner/figure ornament','rooms/maps/physics changes','whole-gate or R162 acceptance'],
 };
 const group=new T.Group();group.name=id;group.userData.structure=meta;
 const red=new T.MeshStandardMaterial({name:'r162_garden_street_pins_red_private',color:0x8f211c,roughness:.57,metalness:.03});
 const gold=new T.MeshStandardMaterial({name:'r162_garden_street_pins_gold_private',color:0xdab34f,roughness:.38,metalness:.25});
 const pins=[];
 try {
  for (const [index,x] of meta.fit.centersX.entries()) {
   const pin=new T.Group();pin.name=id+'/pin-'+index;pin.position.set(x,4.70,side*1.4);if(side<0)pin.rotation.y=Math.PI;group.add(pin);
   const body=new T.Mesh(prism(.118,.20),red);body.name=pin.name+'/red-body-face';body.userData.role='red-body-face';body.castShadow=body.receiveShadow=true;pin.add(body);
   const rimGeometry=prism(.14,.03,.118);rimGeometry.translate(0,0,.18);
   const rim=new T.Mesh(rimGeometry,gold);rim.name=pin.name+'/gold-rim';rim.userData.role='gold-rim';rim.castShadow=rim.receiveShadow=true;pin.add(rim);
   pins.push(pin);
  }
 } catch(error) {
  group.traverse(o=>o.geometry?.dispose());red.dispose();gold.dispose();throw error;
 }
 // Commit only after every identity/host/geometry/resource check and staging.
 kit.owned.push(red,gold);frame.add(group);installed.add(frame);
 return {frame:group,pins,meta};
}
