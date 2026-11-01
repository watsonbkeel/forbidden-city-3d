import * as THREE from 'three';
import {buildDuixiuMountain} from './DuixiuMountain.js';
import {createTriangleTemplate,triangleInstance} from '../../utils/TriangleSupport.js';

/** Physics-only gate: production GardenBuilder does not import this builder yet.
 * Render arrays remain original. All mountain support has one terrain protocol. */
export function buildDuixiuTerrain(options){
  const result=buildDuixiuMountain(options),legacy=result.colliders,[cx,cy,cz]=result.profile.center;
  const owners=[],boxTemplates=new Map();let triangles=0;
  const ownTemplate=(template,offset)=>{
    const shape=triangleInstance(template,offset,`duixiu:terrain:${owners.length}`),box=shape.box.clone();
    box.triangleSupport=shape;box.duixiuTerrain=true;owners.push(box);triangles+=shape.template.triangles.length;
  };
  const own=g=>ownTemplate(createTriangleTemplate(g),[0,0,0]);
  const readonly=template=>{
    for(const q of template.triangles){for(const v of[q.triangle.a,q.triangle.b,q.triangle.c,q.normal,q.box.min,q.box.max])Object.freeze(v);Object.freeze(q.triangle);Object.freeze(q.box);Object.freeze(q);}
    Object.freeze(template.bounds.min);Object.freeze(template.bounds.max);Object.freeze(template.bounds);
    return template;
  };
  for(const box of legacy){
    let g;
    if(box.overhead){
      const o=box.overhead,s=new THREE.Shape();s.moveTo(...o.points[0]);o.points.slice(1).forEach(p=>s.lineTo(...p));
      s.lineTo(o.points.at(-1)[0],o.topY);s.lineTo(o.points[0][0],o.topY);s.closePath();
      g=new THREE.ExtrudeGeometry(s,{depth:o.maxZ-o.minZ,bevelEnabled:false});g.translate(0,0,o.minZ);
    }else{
      const size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
      // Preserve the ORIGINAL world Float32 vertices exactly. Reconstructing
      // ideal local dimensions changes sub-ULP contacts at existing step seams.
      g=new THREE.BoxGeometry(size.x,size.y,size.z);g.translate(center.x,center.y,center.z);g.computeBoundingBox();
      const origin=g.boundingBox.min.clone(),extent=g.boundingBox.getSize(new THREE.Vector3()),key=extent.toArray().join('|');
      let template=boxTemplates.get(key);
      if(!template){
        const p=g.attributes.position,data=new Float64Array(p.count*3);
        for(let i=0;i<p.count;i++){data[i*3]=p.getX(i)-origin.x;data[i*3+1]=p.getY(i)-origin.y;data[i*3+2]=p.getZ(i)-origin.z;}
        const local=new THREE.BufferGeometry();local.setAttribute('position',new THREE.BufferAttribute(data,3));if(g.index)local.setIndex(g.index.clone());
        template=readonly(createTriangleTemplate(local));local.dispose();boxTemplates.set(key,template);
      }
      g.dispose();ownTemplate(template,origin.toArray());continue;
    }
    own(g);g.dispose();
  }
  // Existing visible cave floor, formerly only registered as a box-top walkable.
  own(result.geometries.at(-1));
  // This exact slab is already rendered separately by GardenBuilder.
  const platform=new THREE.BoxGeometry(5.6,.5,5.6);platform.translate(cx,cy+result.profile.topY+.25,cz);own(platform);platform.dispose();
  // makePavilion(size=3.6, baseH=.35) renders these two real marble solids.
  // Its former cap-only walkable must not be a hidden support fallback.
  const pedestal=new THREE.BoxGeometry(5.2,.35,5.2);pedestal.translate(cx,cy+result.profile.summitY+.175,cz);own(pedestal);pedestal.dispose();
  const cap=new THREE.BoxGeometry(5.4,.14,5.4);cap.translate(cx,cy+result.profile.summitY+.28,cz);own(cap);cap.dispose();
  result.profile={...result.profile,terrain:{status:'PHYSICS_ONLY_NOT_PRODUCTION',owners:owners.length,triangles,sharedBoxTemplates:boxTemplates.size,legacyWalkables:result.walkables}};
  result.colliders=owners;result.walkables=[];
  return result;
}
