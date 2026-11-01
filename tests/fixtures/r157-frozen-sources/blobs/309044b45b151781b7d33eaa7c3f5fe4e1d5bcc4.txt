import * as THREE from 'three';

// Counts only, not species reconstruction. Dimensions and spacing below are
// retained-model fits, NOT measured historic dimensions. The rider is separate.
const PROFILES = Object.freeze({
  // Huang Ximing, Palace Museum Journal 2014(2), printed p.142: each level
  // independently lists four riders and forty walking beasts, i.e. 10/corner.
  taihe: Object.freeze({id:'taihe-ten-walking-beasts',entityId:'FC-A478209231',counts:Object.freeze({lower:10,upper:10}),type:'wudian',width:63.6,depth:37.6,layers:2,
    source:'https://www.dpm.org.cn/Uploads/File/2018/06/04/u5b1530b6437db.pdf#page=2'}),
  baohe: Object.freeze({id:'baohe-nine-walking-beasts',entityId:'FC-58A3300503',counts:Object.freeze({lower:9,upper:9}),type:'xieshan',width:50.3,depth:25.6,layers:2,
    source:'https://www.dpm.org.cn/explore/building/236434.html'}),
  zhonghe: Object.freeze({id:'zhonghe-seven-walking-beasts',entityId:'FC-5FAA15AE5C',counts:Object.freeze({single:7}),type:'pavilion',width:25.4,depth:25.4,layers:1,height:7.8,overhang:2.2,
    source:'https://young.dpm.org.cn/uploads/1/file/public/202405/20240517091952_sd4txqf5ri.pdf'}),
});

export function resolveWalkingBeastProfile(o) {
  if (o.walkingBeastProfile === undefined) return null;
  if (o._walkingLayer !== undefined) throw Error('Walking-beast layer is internal');
  const p = typeof o.walkingBeastProfile === 'string' ? PROFILES[o.walkingBeastProfile] : null;
  // Actual Baohe caller passes 49.7 + 0.6, one ULP above literal 50.3.
  // Admit arithmetic roundoff only; never round or alter generated dimensions.
  const sameDimension = (a,b) => Number.isFinite(a) && Math.abs(a-b) < 1e-12;
  if (!p || o.type !== p.type || !sameDimension(o.width,p.width) || !sameDimension(o.depth,p.depth) || o.layers !== p.layers ||
      o.height !== p.height || o.overhang !== p.overhang || o.sides !== 4 || o.brackets !== true ||
      !Number.isFinite(o.baseY) || o._lift !== undefined || o.wumenVerticalProfile !== undefined || o.jiaotaiCeilingOpening !== undefined) {
    throw Error('Walking-beast profile requires the exact reviewed Taihe, Baohe or Zhonghe roof inputs');
  }
  return p;
}

export function walkingBeastScope(ctx, level, corner) {
  if (!ctx.walkingProfile) return undefined;
  const count = ctx.walkingProfile.counts[level];
  if (!Number.isInteger(count)) throw Error('Walking-beast profile has no such roof level');
  return {level,corner,count};
}

/** Sample the EXACT CatmullRom path used by the submitted TubeGeometry. */
export function hipArcSampler(path, controlPointCount, divisions = 1024) {
  // The last path control is the old upturned tip extension. The row starts
  // from the old eave control immediately before it, not the extended tip.
  const eaveT = (controlPointCount - 2) / (controlPointCount - 1);
  const ts = [], cum = [0];
  let prev;
  for (let i = 0; i <= divisions; i++) {
    const t = eaveT * (1 - i / divisions), p = path.getPoint(t);
    ts.push(t);
    if (prev) cum.push(cum.at(-1) + p.distanceTo(prev));
    prev = p;
  }
  return {length:cum.at(-1),at(distance) {
    if (!(distance >= 0 && distance <= cum.at(-1))) throw Error('Walking-beast station exceeds hip; never clamp animals together');
    let lo=0,hi=cum.length-1;
    while(hi-lo>1){const mid=(lo+hi)>>1;if(cum[mid]<distance)lo=mid;else hi=mid;}
    const t=THREE.MathUtils.lerp(ts[lo],ts[hi],(distance-cum[lo])/(cum[hi]-cum[lo]||1));
    return {t,point:path.getPoint(t),tangent:path.getTangent(t).normalize()};
  }};
}

/** Feet/base vertices seat on actual submitted ridge triangles, not ideal Y+r. */
function contactProbe(ridge) {
  ridge.updateMatrixWorld(true);
  ridge.geometry.computeBoundingBox();
  const top = ridge.geometry.boundingBox.max.y + 1;
  const ray = new THREE.Raycaster(new THREE.Vector3(),new THREE.Vector3(0,-1,0));
  return (x,z) => {
    ray.ray.origin.set(x,top,z);
    const hit=ray.intersectObject(ridge,false)[0];
    if (!hit) throw Error('Walking-beast base misses actual hip ridge');
    return hit.point;
  };
}

export function addWalkingBeastRow(ctx, g, ridge, pts, r, scope, add) {
  const path=ridge.geometry.parameters.path, arc=hipArcSampler(path,pts.length+1);
  const sb=r*2.6, first=sb*.9, spacing=sb*1.15;
  const halfLength=sb*.29;
  if (first+scope.count*spacing+halfLength > arc.length-r*2) throw Error('Walking-beast row cannot fit without overlap');
  const contact=contactProbe(ridge), stations=[];
  for(let i=1;i<=scope.count;i++) {
    const distance=first+i*spacing,{t,point:p,tangent}=arc.at(distance);
    const yaw=Math.atan2(tangent.x,tangent.z),cos=Math.cos(yaw),sin=Math.sin(yaw);
    const base=new THREE.BoxGeometry(sb*.32,sb*.6,sb*.5),positions=base.attributes.position,feet=[];
    const top=contact(p.x,p.z).y+sb*.6;
    for(let j=0;j<positions.count;j++) {
      const lx=positions.getX(j),lz=positions.getZ(j),x=p.x+cos*lx+sin*lz,z=p.z-sin*lx+cos*lz;
      const foot=positions.getY(j)<0?contact(x,z):null;
      if(foot){feet.push(foot.toArray());if(foot.y>=top)throw Error('Walking-beast base would invert');}
      positions.setXYZ(j,x,foot?foot.y:top,z);
    }
    positions.needsUpdate=true;base.computeVertexNormals();
    const body=add(g,base,ctx.mat.ridge);body.name='walking-beast-body';
    const head=add(g,new THREE.BoxGeometry(sb*.26,sb*.26,sb*.3),ctx.mat.ridge);
    head.name='walking-beast-head';head.rotation.y=yaw;
    head.position.set(p.x-sin*sb*.18,top+sb*.08,p.z-cos*sb*.18);
    stations.push({index:i,distance,t,center:p.toArray(),yaw,footContacts:[...new Map(feet.map(v=>[JSON.stringify(v),v])).values()]});
  }
  return {...scope,radius:r,scale:sb,spacing,arcLength:arc.length,riderDistance:first,
    riderPlacement:'RETAINED_LEGACY_POSITION',stations,
    form:'SIMPLIFIED_BOX_BODY_AND_HEAD_NOT_SPECIES_SCULPTURE',
    contact:'BASE_VERTICES_ON_ACTUAL_SUBMITTED_RIDGE_TRIANGLES',
    animalTriangles:scope.count*24};
}
