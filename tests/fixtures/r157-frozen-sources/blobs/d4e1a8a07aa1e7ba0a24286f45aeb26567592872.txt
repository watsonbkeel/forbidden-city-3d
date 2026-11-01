import * as THREE from 'three';
import {applyBoxUV}from'../../../utils/GeometryUV.js';
import {cloneOverheadShape}from'../../../utils/OverheadShape.js';
export const YINGHUA_GATE_FIT=Object.freeze({x:277.2,z:454.9,width:6.4,depth:2.8,bodyTop:5.9,floor:.1,radius:1.5,spring:2.9,arcSegments:24});
export function yinghuaGateProfile(item){
 if(item.name!=='英华门'||item.x!==277.2||item.z!==454.9||item.gateProfile!=='yinghua'||item.gateKind!=='single-arched'||(item.rot!==undefined&&item.rot!==0)||item.w!==undefined&&item.w!==3.6||item.h!==undefined&&item.h!==4.4||item.t!==undefined&&item.t!==1)throw Error('Yinghua arch requires exact existing named anchor and retained envelope');
 const p=YINGHUA_GATE_FIT,arc=Array.from({length:p.arcSegments+1},(_,i)=>{const a=Math.PI-i*Math.PI/p.arcSegments;return[i===0?-p.radius:i===p.arcSegments?p.radius:p.radius*Math.cos(a),p.spring+p.radius*Math.sin(a)]});
 return{...p,arc,entityId:'FC-0EACBA1911',source:'https://img.dpm.org.cn/Uploads/Picture/dc/8412.jpg',sourcePage:'https://www.dpm.org.cn/explore/building/236568.html',photographyDate:null,dimensionStatus:'PHOTO_FIT_INSIDE_RETAINED_MAP_ENVELOPE_NOT_SURVEY',accepted:false,openingFitRange:{radius:[1.35,1.65],spring:[2.7,3.1]}};
}
function prism(points,z0,z1){const g=new THREE.ExtrudeGeometry(new THREE.Shape(points.map(([x,y])=>new THREE.Vector2(x,y))),{depth:z1-z0,bevelEnabled:false,curveSegments:1,steps:1});g.translate(0,0,z0);g.clearGroups();return g;}
export function buildYinghuaGate(kit,item){
 const p=yinghuaGateProfile(item),f=kit.frame(p.x,p.z,0),hw=p.width/2,hd=p.depth/2;f.name='英华门';
 const tag=(m,s)=>{m.name=m.userData.role='r66-yinghua-'+s;return m;};
 // The source is the single outer gate, not the separate three-portal shanmen.
 const outline=[[-hw,p.floor],[-hw,p.bodyTop],[hw,p.bodyTop],[hw,p.floor],[p.radius,p.floor],...p.arc.slice().reverse(),[-p.radius,p.floor]];
 tag(kit.mesh(f,applyBoxUV(prism(outline,-hd,hd),kit.lib.tileSize('wall_brick')),kit.lib.material('wall_brick'),0,0,0),'arched-masonry');
 for(const s of[-1,1])kit.col(f,s<0?-hw:p.radius,p.floor,-hd,s<0?-p.radius:hw,p.bodyTop,hd);
 const points=p.arc.map(([x,y])=>[x+p.x,y]),proxy=new THREE.Box3(new THREE.Vector3(points[0][0],Math.min(...points.map(v=>v[1])),p.z-hd),new THREE.Vector3(points.at(-1)[0],p.bodyTop,p.z+hd));
 proxy.overhead=cloneOverheadShape({type:'piecewise-linear-x',points,minZ:proxy.min.z,maxZ:proxy.max.z,topY:p.bodyTop,sourceId:'outer-west/yinghua-arch'},proxy);kit.colliders.push(proxy);
 // Retain original visible low stone threshold; make its real .10 m top a
 // non-rescue support instead of keeping feet below its visible surface.
 tag(kit.box(f,'stone_slab',6.6,.1,3.3,0,.05,0),'retained-threshold');kit.walkBox(f,-3.3,-1.65,3.3,1.65,.1);kit.walkables.at(-1).rescue=false;
 tag(kit.roof(f,{type:'xieshan',width:6.7,depth:3.3,baseY:5.9,brackets:false,height:1.3}),'retained-yellow-roof');
 const open=item.open!==false;
 for(const s of[-1,1]){
  const half=p.arc.filter(([x])=>s*x>=-1e-10),ends=half.map(([x,y])=>[x-s*p.radius,y]);
  const poly=[...ends,[half.at(-1)[0]-s*p.radius,p.floor],[half[0][0]-s*p.radius,p.floor]],leaf=tag(kit.mesh(f,prism(poly,-.05,.05),kit.lacquer,s*p.radius,0,0),'arched-door-leaf');
  leaf.position.x=s*(p.radius+(open?-.015:0));leaf.position.z=-hd-.06;if(open)leaf.rotation.y=-s*Math.PI/2;
  leaf.userData.pose=open?'PLAYABLE_OPEN_NOT_VERIFIED_CURRENT_POSE':'CLOSED';f.updateMatrixWorld(true);kit.colliders.push(new THREE.Box3().setFromObject(leaf));
 }
 kit.mapRect(f,'gate','英华门',6.4,2.8);
 f.userData.structure={...p,id:'outer-west/yinghua-gate',portalCount:1,gateProfile:'yinghua',gateKind:'single-arched',streamLayer:'B',openState:open?'PLAYABLE_OPEN_NOT_VERIFIED_CURRENT_POSE':'CLOSED',plaque:'UNKNOWN_NO_GENERIC_NAMEBOARD_INVENTED',roof:'RETAINED_YELLOW_ROOF_MODEL_FIT',limitations:['Undated archival gallery image proves one arched aperture, not current paint or vegetation.','Old 6.4 x 2.8 m map envelope retained; opening dimensions are reversible photo fit.','No present-day visitor access or hidden interior inventory asserted.']};return p.width;
}
