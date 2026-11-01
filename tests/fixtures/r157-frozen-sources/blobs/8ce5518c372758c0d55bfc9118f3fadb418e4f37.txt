import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Museum photographs 2568/1523 support scalloped openwork, not surveyed
// dimensions or exact dragon anatomy. Retain the earlier registered envelope.
export const QIANQING_SCREEN_CREST = Object.freeze({
 revision:'r32-scalloped-openwork-trial',height:.43,depth:.09,
 status:'PHOTO_INFORMED_ORIGINAL_SCROLL_APPROXIMATION_NOT_ARTIFACT_FACSIMILE',
 source:'https://img.dpm.org.cn/Uploads/Picture/dc/2568%5B1024%5D.jpg',
});
function clean(g){
 if(g.index){const source=g;g=g.toNonIndexed();source.dispose();}
 const p=g.attributes.position,keep=[],a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
 for(let i=0;i<p.count;i+=3){a.fromBufferAttribute(p,i);b.fromBufferAttribute(p,i+1);c.fromBufferAttribute(p,i+2);if(b.sub(a).cross(c.sub(a)).lengthSq()>1e-14)keep.push(i,i+1,i+2);}
 for(const[name,v]of Object.entries(g.attributes)){const out=new v.array.constructor(keep.length*v.itemSize);keep.forEach((id,i)=>out.set(v.array.subarray(id*v.itemSize,(id+1)*v.itemSize),i*v.itemSize));g.setAttribute(name,new THREE.BufferAttribute(out,v.itemSize,v.normalized));}
 g.clearGroups();return g;
}
function scaledPath(w,h){
 const p=new THREE.Shape(),M=(x,y)=>p.moveTo(x*w,y*h),L=(x,y)=>p.lineTo(x*w,y*h),Q=(x,y,a,b)=>p.quadraticCurveTo(x*w,y*h,a*w,b*h);
 M(-.5,0);L(.5,0);L(.5,.25);Q(.50,.52,.43,.59);Q(.37,.68,.31,.57);Q(.30,.78,.22,.79);Q(.14,.78,.11,.72);Q(.095,.98,0,1);Q(-.095,.98,-.11,.72);Q(-.14,.78,-.22,.79);Q(-.30,.78,-.31,.57);Q(-.37,.68,-.43,.59);Q(-.5,.52,-.5,.25);L(-.5,0);p.closePath();
 // Four unequal, polygonal apertures. There is deliberately no claim that these
 // generic scroll openings copy individual dragons or a measured carving.
 for(const sign of[-1,1])for(const inner of[false,true]){
  const x=(inner?.18:.375)*sign,y=inner?.40:.31,rx=inner?.064:.072,ry=inner?.16:.115,path=new THREE.Path();
  const pts=[[x-rx,y],[x-rx*.65,y+ry],[x+rx*.30,y+ry*.9],[x+rx,y+ry*.25],[x+rx*.55,y-ry*.7],[x-rx*.1,y-ry]];
  pts.forEach(([a,b],i)=>path[i?'lineTo':'moveTo'](a*w,b*h));path.closePath();p.holes.push(path);
 }
 return p;
}
export function buildQianqingScreenCrest(panelWidth){
 if(!Number.isFinite(panelWidth)||panelWidth<1||panelWidth>1.41)throw Error('Registered Qianqing panel width required');
 const w=panelWidth*1.08,h=QIANQING_SCREEN_CREST.height;
 const slab=clean(new THREE.ExtrudeGeometry(scaledPath(w,h),{depth:.065,bevelEnabled:false,curveSegments:2}));slab.translate(0,0,-.02);
 const parts=[slab];
 // Raised front scroll returns occupy the old solid slab depth. Four-sided
 // low-segment ribs overlap the slab front by at least .009 m at their
 // attachment points, providing relief without a floating disconnected layer.
 for(const sign of[-1,1])for(const inner of[false,true]){
  const cx=inner?.18:.375,cy=inner?.40:.31,rx=inner?.09:.098,ry=inner?.205:.155;
  const pts=[[-.3,-.9],[.8,-.55],[1,.25],[.45,.95],[-.5,.8],[-.9,.10],[-.25,-.15]].map(([x,y],i)=>new THREE.Vector3(sign*(cx+x*rx)*w,(cy+y*ry)*h,-.019-(i%2)*.003));
  parts.push(clean(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),7,.011,4,false)));
 }
 const g=mergeGeometries(parts,false);for(const part of parts)part.dispose();if(!g)throw Error('Crest geometry merge failed');
 g.computeBoundingBox();g.userData={...QIANQING_SCREEN_CREST,envelope:{width:w,height:h,depth:.09},apertures:4,reliefReturns:4};return g;
}
