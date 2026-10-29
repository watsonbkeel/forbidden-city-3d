import * as THREE from 'three';
import anchors from '../../../data/anchors.json' with {type:'json'};
import {applyBoxUV} from '../../utils/GeometryUV.js';

// Source confirms a real stone arch, not its surveyed dimensions or bore azimuth.
export const FUBI_ARCH_POOL=Object.freeze({x:anchors['浮碧亭'].x,z:anchors['浮碧亭'].z,poolWidth:14.5,poolDepth:9.5,baseWidth:8.4,baseDepth:8.4,mainFloor:.9,archWidth:3.2,archCrown:.6,archSpring:-.45,waterY:-.45,bedY:-1.25,segments:32,status:'PHOTO_INFORMED_MODEL_FIT_NOT_SURVEY',bore:'EAST_WEST_MODEL_ASSUMPTION',accepted:false});
export function fubiPoolRect(){const p=FUBI_ARCH_POOL;return[p.x-p.poolWidth/2,p.x+p.poolWidth/2,p.z-p.poolDepth/2,p.z+p.poolDepth/2];}
export function fubiPoolGroundPath(){const[a,b,c,d]=fubiPoolRect(),s=new THREE.Path();for(const[i,[x,z]]of[[a,c],[a,d],[b,d],[b,c]].entries())s[i?'lineTo':'moveTo'](x,-z);s.closePath();return s;}
/** Local exact rectangle subtraction; unchanged inputs retain identity and coordinates. */
export function clipFubiPoolRectangle(rect){if(!Array.isArray(rect)||rect.length!==4||!rect.every(Number.isFinite)||rect[0]>=rect[1]||rect[2]>=rect[3])throw Error('Finite positive Fubi ground rectangle required');const[a,b,c,d]=rect,[A,B,C,D]=fubiPoolRect(),l=Math.max(a,A),h=Math.min(b,B),s=Math.max(c,C),n=Math.min(d,D);if(l>=h||s>=n)return[rect];return[[a,l,c,d],[h,b,c,d],[l,h,c,s],[l,h,n,d]].filter(([x0,x1,z0,z1])=>x1-x0>1e-9&&z1-z0>1e-9);}
function extrude(shape,depth,x){const g=new THREE.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:false,curveSegments:1});g.rotateY(Math.PI/2);g.translate(x,0,0);return g;}
export function buildFubiArchPool(group,stone){const p=FUBI_ARCH_POOL,half=p.archWidth/2,profile=new THREE.Shape();profile.moveTo(-p.baseDepth/2,p.bedY);profile.lineTo(-half,p.bedY);profile.lineTo(-half,p.archSpring);for(let i=1;i<=p.segments;i++){const t=Math.PI-i*Math.PI/p.segments;profile.lineTo(half*Math.cos(t),p.archSpring+(p.archCrown-p.archSpring)*Math.sin(t));}profile.lineTo(half,p.bedY);profile.lineTo(p.baseDepth/2,p.bedY);profile.lineTo(p.baseDepth/2,p.mainFloor);profile.lineTo(-p.baseDepth/2,p.mainFloor);profile.closePath();
 const add=(name,geometry)=>{const mesh=new THREE.Mesh(geometry,stone);mesh.name=name;mesh.userData.role=name;mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);return mesh;};
 add('fubi-arch-closed-solid',extrude(profile,p.baseWidth,-p.baseWidth/2));
 // Independently closed shallow voussoir faces follow the exact segmented intrados.
 for(const side of[-1,1])for(let i=0;i<p.segments;i++){const a=i*Math.PI/p.segments,b=(i+1)*Math.PI/p.segments,s=new THREE.Shape(),points=[[half*Math.cos(a),p.archSpring+(p.archCrown-p.archSpring)*Math.sin(a)],[half*Math.cos(b),p.archSpring+(p.archCrown-p.archSpring)*Math.sin(b)],[(half+.22)*Math.cos(b),p.archSpring+(p.archCrown-p.archSpring+.18)*Math.sin(b)],[(half+.22)*Math.cos(a),p.archSpring+(p.archCrown-p.archSpring+.18)*Math.sin(a)]];points.forEach(([u,v],j)=>s[j?'lineTo':'moveTo'](u,v));s.closePath();add('fubi-arch-voussoir',extrude(s,.025,side<0?-p.baseWidth/2-.025:p.baseWidth/2));}
 const bed=new THREE.PlaneGeometry(p.poolWidth,p.poolDepth);bed.rotateX(-Math.PI/2);bed.translate(0,p.bedY,0);add('fubi-pool-bed',bed);
 for(const[x,z,w,d]of[[-p.poolWidth/2-.125,0,.25,p.poolDepth+.5],[p.poolWidth/2+.125,0,.25,p.poolDepth+.5],[0,-p.poolDepth/2-.125,p.poolWidth,.25],[0,p.poolDepth/2+.125,p.poolWidth,.25]]){const geo=applyBoxUV(new THREE.BoxGeometry(w,-p.bedY,d),1);geo.translate(x,p.bedY/2,z);add('fubi-pool-bank',geo);}
 group.userData.fubiArchPool=p;return p;
}

/** Bounded non-swimmable-water policy, including airborne attempts over the
 * inherited low guards. No new collider or hidden support surface is created.
 * The retained main bridge, south annex and north 2.4 m deck stay traversable.
 */
export function canCrossFubiPool(position,radius=.5) {
 if(!Number.isFinite(radius)||radius<0)throw Error('Fubi pool radius must be finite and non-negative');
 const p=FUBI_ARCH_POOL,x=position.x-p.x,z=position.z-p.z;
 const X=p.poolWidth/2,Z=p.poolDepth/2,B=p.baseWidth/2,D=p.baseDepth/2;
 const water=[[-X,-B,-Z,Z],[B,X,-Z,Z],[-B,-1.2,D,Z],[1.2,B,D,Z]];
 for(const[x0,x1,z0,z1]of water){const dx=Math.max(x0-x,0,x-x1),dz=Math.max(z0-z,0,z-z1);if((dx===0&&dz===0)||(dx*dx+dz*dz<radius*radius-1e-10))return false;}
 return true;
}
