// Read-only QA consumer: one supplied, already-built W, no world constructor,
// registration, clock, source edits, new renderer, or browser-acceptance claim.
import * as THREE from 'three';
import { DIMENSIONS, LAYOUT, PLAYER } from '../../src/config/constants.js';
import {cloneOverheadShape} from '../../src/utils/OverheadShape.js';
import {wumenNorthPortalProfile} from '../../src/scene/palace/special/WumenNorthPortal.js';
const openings=[{x:-17.5,w:5,h:6.5},{x:0,w:9,h:8},{x:17.5,w:5,h:6.5}];
const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
const shown=m=>m&&m.visible!==false&&m.colorWrite!==false&&(!m.transparent||m.opacity>0);
const hitShown=h=>visible(h.object)&&shown(Array.isArray(h.object.material)?h.object.material[h.face?.materialIndex??0]:h.object.material);
function triangleContacts(root,box){
  let count=0;
  root.traverse(m=>{
    if(!m.isMesh||!visible(m))return;
    const g=m.geometry,p=g?.attributes.position;if(!p)return;
    if(!new THREE.Box3().setFromBufferAttribute(p).applyMatrix4(m.matrixWorld).intersectsBox(box))return;
    const idx=g.index;
    for(let i=0;i<(idx?.count??p.count);i+=3){
      const material=Array.isArray(m.material)?m.material[g.groups.find(q=>i>=q.start&&i<q.start+q.count)?.materialIndex??0]:m.material;
      if(!shown(material))continue;
      const t=new THREE.Triangle(...[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,idx?idx.getX(i+k):i+k).applyMatrix4(m.matrixWorld)));
      if(box.intersectsTriangle(t))count++;
    }
  });return count;
}
export function evaluateWumenNorthPortals(W){
  if(!W?.scene?.isScene||!Array.isArray(W.cm?.colliders)||!Array.isArray(W.cm?.walkables))throw TypeError('An existing scene and CollisionManager are required');
  const dm=DIMENSIONS.WUMEN,zN=LAYOUT.WUMEN_Z+dm.platformNorth,zS=LAYOUT.WUMEN_Z+dm.platformSouth;
  const tagged=W.cm.colliders.filter(c=>c.overhead?.sourceId?.startsWith('axis/wumen-north-head/'));
  const overheadCount=tagged.length===3;
  const ray=(x,y,z,d,far)=>new THREE.Raycaster(new THREE.Vector3(x,y,z),new THREE.Vector3(0,0,d),0,far).intersectObject(W.scene,true).filter(hitShown);
  const rows=openings.map(o=>{
    const y=o.h-.8,shoulderX=o.x+o.w*.45;
    const shoulders=[-1,1].map(sign=>({
      sign,front:ray(o.x+sign*o.w*.45,y,zN+1,-1,1.01).some(h=>Math.abs(h.point.z-zN)<1e-5),
      back:ray(o.x+sign*o.w*.45,y,zN-1.3,1,.11).some(h=>Math.abs(h.point.z-(zN-1.2))<1e-5),
    }));
    const north=shoulders.every(s=>s.front),back=shoulders.every(s=>s.back);
    const profile=wumenNorthPortalProfile({x:o.x,width:o.w,tunnelHeight:o.h,platformHeight:dm.platformHeight,southZ:dm.platformSouth,northZ:dm.platformNorth});
    const liningSamples=[3,9,16,23,29].map(i=>{
      const [dx,innerY]=profile.arc[i],x=o.x+dx,y=innerY+.15;
      const hasLining=(z,d,far,targetZ)=>ray(x,y,z,d,far).some(h=>Math.abs(h.point.z-targetZ)<1e-5&&(Array.isArray(h.object.material)?h.object.material[h.face?.materialIndex??0]:h.object.material).name==='wall_brick');
      return {arcIndex:i,front:hasLining(zN+1,-1,1.01,zN),back:hasLining(zN-1.3,1,.11,zN-1.2)};
    });
    const expectedBox=new THREE.Box3(new THREE.Vector3(o.x-o.w/2,profile.springY,profile.headStartZ+LAYOUT.WUMEN_Z),new THREE.Vector3(o.x+o.w/2,dm.platformHeight,zN));
    const expected={type:'piecewise-linear-x',points:profile.arc.map(([x,y])=>[o.x+x,y]),minZ:expectedBox.min.z,maxZ:expectedBox.max.z,topY:dm.platformHeight,sourceId:`axis/wumen-north-head/${o.x}`};
    const matches=tagged.filter(c=>c.overhead.sourceId===expected.sourceId);let overheadIdentity=false;
    try{overheadIdentity=matches.length===1&&JSON.stringify(cloneOverheadShape(matches[0].overhead,matches[0].box))===JSON.stringify(cloneOverheadShape(expected,expectedBox));}catch{}
    const midZ=zN-profile.headDepth/2,highVoid=!W.cm.checkCollision(new THREE.Vector3(o.x,profile.crownY-.1,midZ),.5);
    const shoulderContacts=[-1,1].map(sign=>W.cm.checkCollision(new THREE.Vector3(o.x+sign*(o.w/2-.501),profile.springY+.25,midZ),.5));
    const localized=[zN+1,zN-profile.headDepth-1].every(z=>!W.cm.checkCollision(new THREE.Vector3(o.x+o.w/2-.501,profile.springY+.25,z),.5));
    const overhead={identity:overheadIdentity,highVoid,shoulderContacts,localized,pass:overheadIdentity&&highVoid&&shoulderContacts.every(Boolean)&&localized};
    const centerVoid=ray(o.x,o.h-.4,zN+1,-1,2.3).length===0;
    const deeperRetained=ray(shoulderX,y,zN-1.3,-1,1.7).length===0;
    const body=new THREE.Box3(new THREE.Vector3(o.x-.5,.03,zS-1),new THREE.Vector3(o.x+.5,PLAYER.HEIGHT,zN+1));
    const contacts=triangleContacts(W.scene,body);
    const blockers=W.cm.colliders.filter(c=>(c.box??c).intersectsBox(body)).length;
    const supports=W.cm.getGroundHeight(o.x,zN-.6,0)===0;
    const pass=overhead.pass&&north&&back&&liningSamples.every(s=>s.front&&s.back)&&centerVoid&&deeperRetained&&contacts===0&&blockers===0&&supports;
    return {centerX:o.x,width:o.w,overhead,north,back,shoulders,liningSamples,centerVoid,deeperRetained,bodyTriangleContacts:contacts,bodyProxyContacts:blockers,groundRemainsZero:supports,pass};
  });
  const unchangedLateralSolids=[-35,35].map(x=>ray(x,1.7,zN+1,-1,1.01).length>0);
  return {pass:overheadCount&&rows.every(r=>r.pass)&&unchangedLateralSolids.every(Boolean),overheadCount,objectId:'FC-AD4377DF51',rows,unchangedLateralSolids,
    boundary:'Three existing north heads only; supplied-world CPU geometry, NOT browser or whole-Wumen acceptance.'};
}
