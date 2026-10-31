import * as THREE from 'three';

// A chord through four points on a convex ridge is NOT a seated bottom face.
// Intersect each actual upward-facing Float32 ridge triangle with the retained
// body footprint, then use those exact clipped planes as the body underside.
function seatedBody(ridge,p,yaw,scale,top) {
  const c=Math.cos(yaw),s=Math.sin(yaw),hw=scale*.16,hl=scale*.25;
  const world=v=>[p.x+c*v[0]+s*v[2],v[1],p.z-s*v[0]+c*v[2]];
  const triangles=[],boundary=new Map();let area=0;
  const emit=(a,b,d)=>{triangles.push(...world(a),...world(b),...world(d));};
  const clean=poly=>poly.filter((v,i)=>{const next=poly[(i+1)%poly.length];return Math.hypot(v[0]-next[0],v[1]-next[1],v[2]-next[2])>1e-9;});
  const clip=(input,axis,bound,sign)=>{
    const out=[];
    for(let i=0;i<input.length;i++){
      const a=input[i],b=input[(i+1)%input.length],da=sign*(a[axis]-bound),db=sign*(b[axis]-bound);
      if(da>=0)out.push(a);
      if((da>=0)!==(db>=0)){const t=da/(da-db),v=a.map((x,k)=>x+(b[k]-x)*t);v[axis]=bound;out.push(v);}
    }
    return clean(out);
  };
  ridge.updateMatrixWorld(true);
  const positions=ridge.geometry.attributes.position,index=ridge.geometry.index;
  for(let i=0;i<(index?.count??positions.count);i+=3){
    const raw=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(positions,index?.getX(i+k)??i+k).applyMatrix4(ridge.matrixWorld));
    if(new THREE.Triangle(...raw).getNormal(new THREE.Vector3()).y<=1e-8)continue;
    let poly=raw.map(v=>{const x=v.x-p.x,z=v.z-p.z;return[c*x-s*z,v.y,s*x+c*z];});
    for(const [axis,bound,sign]of[[0,-hw,1],[0,hw,-1],[2,-hl,1],[2,hl,-1]]){
      poly=clip(poly,axis,bound,sign);if(poly.length<3)break;
    }
    if(poly.length<3)continue;
    let polygonArea=0;
    for(let j=1;j<poly.length-1;j++){
      const a=poly[0],b=poly[j],d=poly[j+1],a2=Math.abs((b[0]-a[0])*(d[2]-a[2])-(b[2]-a[2])*(d[0]-a[0]));
      if(a2<=1e-14)continue;
      polygonArea+=a2/2;
      // Reverse the source's upward winding: this is an actual downward face.
      emit(a,d,b);
    }
    if(polygonArea<=1e-14)continue;
    area+=polygonArea;
    for(let j=0;j<poly.length;j++){
      const a=poly[j],b=poly[(j+1)%poly.length];
      if(![[0,-hw],[0,hw],[2,-hl],[2,hl]].some(([axis,bound])=>Math.abs(a[axis]-bound)<1e-8&&Math.abs(b[axis]-bound)<1e-8))continue;
      const key=[a,b].map(v=>v.map(n=>Math.round(n*1e8)).join(',')).sort().join('|');
      boundary.set(key,[a,b]);
    }
  }
  if(Math.abs(area-4*hw*hl)>1e-7||boundary.size<4)throw Error('Qianqing beast footprint must be covered once by actual top ridge triangles');
  const center=[0,top,0];
  for(const [a,b]of boundary.values()){
    if(Math.max(a[1],b[1])>=top)throw Error('Qianqing seated body would invert');
    const at=[a[0],top,a[2]],bt=[b[0],top,b[2]];
    emit(a,b,bt);emit(a,bt,at);emit(at,bt,center);
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(triangles,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(triangles.length/3*2),2));
  geometry.computeVertexNormals();
  return geometry;
}

/** Qianqing-only assembly. Existing Taihe/Baohe/Zhonghe body paths are untouched. */
export function addQianqingWalkingBeastRow(ctx,g,ridge,pts,r,scope,add,sampler) {
  const path=ridge.geometry.parameters.path,arc=sampler(path,pts.length+1);
  const scale=r*2.6,first=scale*.9,spacing=scale*1.15;
  if(first+scope.count*spacing+scale*.29>arc.length-r*2)throw Error('Qianqing walking-beast row cannot fit without overlap');
  ridge.updateMatrixWorld(true);ridge.geometry.computeBoundingBox();
  const ray=new THREE.Raycaster(new THREE.Vector3(),new THREE.Vector3(0,-1,0));
  const contact=(x,z)=>{
    ray.ray.origin.set(x,ridge.geometry.boundingBox.max.y+1,z);
    const hit=ray.intersectObject(ridge,false)[0];if(!hit)throw Error('Qianqing body misses actual ridge');return hit.point;
  };
  const stations=[];let animalTriangles=0;
  for(let i=1;i<=scope.count;i++){
    const distance=first+i*spacing,{t,point:p,tangent}=arc.at(distance),yaw=Math.atan2(tangent.x,tangent.z),c=Math.cos(yaw),s=Math.sin(yaw);
    const top=contact(p.x,p.z).y+scale*.6,bodyGeometry=seatedBody(ridge,p,yaw,scale,top);
    const body=add(g,bodyGeometry,ctx.mat.ridge);body.name='walking-beast-body';
    const head=add(g,new THREE.BoxGeometry(scale*.26,scale*.26,scale*.3),ctx.mat.ridge);head.name='walking-beast-head';head.rotation.y=yaw;
    // Source curve t increases from ridge inward start to the eave: positive
    // tangent is outward. A negative offset points the animal back into the roof.
    head.position.set(p.x+s*scale*.18,top+scale*.08,p.z+c*scale*.18);
    const footContacts=[];
    for(const x of[-scale*.16,scale*.16])for(const z of[-scale*.25,scale*.25])footContacts.push(contact(p.x+c*x+s*z,p.z-s*x+c*z).toArray());
    animalTriangles+=(bodyGeometry.attributes.position.count+(head.geometry.index?.count??head.geometry.attributes.position.count))/3;
    stations.push({index:i,distance,t,center:p.toArray(),yaw,footContacts});
  }
  return {...scope,radius:r,scale,spacing,arcLength:arc.length,riderDistance:first,riderPlacement:'RETAINED_LEGACY_POSITION',stations,
    form:'SIMPLIFIED_BODY_AND_OUTWARD_HEAD_NOT_SPECIES_SCULPTURE',
    contact:'FULL_UNDERSIDE_CLIPPED_FROM_ACTUAL_UPWARD_RIDGE_TRIANGLES',animalTriangles};
}
