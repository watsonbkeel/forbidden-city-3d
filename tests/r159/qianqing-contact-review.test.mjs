import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {library,release,captureModule} from '../lib/r58-hall-beast-fixture.mjs';

const capture=await captureModule();
function fixture(){
  let raw;
  globalThis.__r58HipCapture=g=>{raw=g.children.filter(m=>m.isMesh).map(m=>m.clone());};
  let roof;
  try{roof=capture.buildRoof(library(),{type:'wudian',width:46.6,depth:25.6,layers:2,baseY:9.38,brackets:true,sides:4,walkingBeastProfile:'qianqing'});}
  finally{delete globalThis.__r58HipCapture;}
  return {roof,raw,ridges:raw.filter(m=>m.geometry.type==='TubeGeometry'),bodies:raw.filter(m=>m.name==='walking-beast-body'),heads:raw.filter(m=>m.name==='walking-beast-head')};
}
function observedOutwardDot(body,head,station,ridge){
  const center=new T.Box3().setFromObject(body).getCenter(new T.Vector3()),headCenter=new T.Box3().setFromObject(head).getCenter(new T.Vector3());
  const direction=headCenter.sub(center);direction.y=0;direction.normalize();
  // Independent geometry control: the eave end of the actual submitted curve,
  // not the candidate yaw or a candidate-created direction metadata field.
  const outward=ridge.geometry.parameters.path.getPoint(.98).sub(new T.Vector3(...station.center));outward.y=0;outward.normalize();
  return direction.dot(outward);
}
function bottomGrid(body,ridge,station){
  body.updateMatrixWorld(true);ridge.updateMatrixWorld(true);
  const p=body.geometry.attributes.position,localPoints=[];
  const c=Math.cos(station.yaw),s=Math.sin(station.yaw),center=new T.Vector3(...station.center);
  for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(body.matrixWorld).sub(center);localPoints.push(new T.Vector3(c*v.x-s*v.z,v.y,s*v.x+c*v.z));}
  const localBox=new T.Box3().setFromPoints(localPoints),bodyBox=new T.Box3().setFromObject(body),ridgeBox=new T.Box3().setFromObject(ridge);
  const up=new T.Raycaster(new T.Vector3(),new T.Vector3(0,1,0)),down=new T.Raycaster(new T.Vector3(),new T.Vector3(0,-1,0));
  const errors=[];
  // 7 x 6 = 42 face-interior samples per beast; 3024 across 72 bodies.
  // Interior centres avoid ambiguous shared edges while probing entire base.
  for(let ix=0;ix<7;ix++)for(let iz=0;iz<6;iz++){
    const lx=T.MathUtils.lerp(localBox.min.x,localBox.max.x,(ix+.5)/7),lz=T.MathUtils.lerp(localBox.min.z,localBox.max.z,(iz+.5)/6);
    const x=center.x+c*lx+s*lz,z=center.z-s*lx+c*lz;
    up.ray.origin.set(x,bodyBox.min.y-1,z);down.ray.origin.set(x,ridgeBox.max.y+1,z);
    const foot=up.intersectObject(body,false)[0],support=down.intersectObject(ridge,false)[0];
    assert.ok(foot&&support,'actual underside and actual ridge both cover every interior test point');
    errors.push(foot.point.y-support.point.y);
  }
  return errors;
}

test('R159 reviewer regression: all 72 actual heads face the geometric eave end, not inward along the ridge',t=>{
  const f=fixture();let index=0,min=1;
  for(const [ri,row]of f.roof.userData.walkingBeasts.rows.entries())for(const station of row.stations){
    const dot=observedOutwardDot(f.bodies[index],f.heads[index],station,f.ridges[ri]);min=Math.min(min,dot);index++;
  }
  release(f.roof);assert.equal(index,72);assert.ok(min>.9,`minimum actual outward head dot ${min}`);t.diagnostic(`72 outward heads; minimum horizontal eave-direction dot ${min}`);
});

test('R159 reviewer regression: 3024 actual underside samples match the top ridge surface, not only four corners',t=>{
  const f=fixture();let index=0,samples=0,max=0;
  for(const [ri,row]of f.roof.userData.walkingBeasts.rows.entries())for(const station of row.stations){
    for(const gap of bottomGrid(f.bodies[index++],f.ridges[ri],station)){samples++;max=Math.max(max,Math.abs(gap));}
  }
  release(f.roof);assert.equal(samples,3024);assert.ok(max<4e-6,`maximum actual bottom-to-ridge mismatch ${max}m`);t.diagnostic(`3024 actual underside rays; maximum absolute ridge mismatch ${max}m`);
});

function faces(mesh){
  mesh.updateMatrixWorld(true);const p=mesh.geometry.attributes.position,index=mesh.geometry.index,out=[];
  for(let i=0;i<(index?.count??p.count);i+=3)out.push(new T.Triangle(...[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(p,index?.getX(i+k)??i+k).applyMatrix4(mesh.matrixWorld))));
  return out;
}
const vertices=tri=>[tri.a,tri.b,tri.c];
const faceKey=tri=>{const v=vertices(tri).map(p=>p.toArray().join(','));return [v.join('|'),[v[1],v[2],v[0]].join('|'),[v[2],v[0],v[1]].join('|')].sort()[0];};
test('R159 entire underside triangles lie within individual actual ridge triangles and survive final batching',t=>{
  const f=fixture(),finalFaces=new Set();f.roof.traverse(m=>{if(m.isMesh)for(const tri of faces(m))finalFaces.add(faceKey(tri));});
  let bi=0,count=0,maxError=0;
  for(const [ri,row]of f.roof.userData.walkingBeasts.rows.entries()){
    const ridgeFaces=faces(f.ridges[ri]).filter(t=>t.getNormal(new T.Vector3()).y>0);
    for(const station of row.stations){
      const bottom=faces(f.bodies[bi++]).filter(t=>t.getNormal(new T.Vector3()).y<-.01);assert.ok(bottom.length>2,'not a four-corner chord');
      for(const tri of bottom){
        const error=Math.min(...ridgeFaces.map(support=>Math.max(...vertices(tri).map(v=>support.closestPointToPoint(v,new T.Vector3()).distanceTo(v)))));
        maxError=Math.max(maxError,error);assert.ok(error<4e-6,'all three vertices lie inside one convex support triangle, proving the full bottom face is supported');
        assert.ok(finalFaces.has(faceKey(tri)),'actual oriented underside triangle persists after production final merge');count++;
      }
    }
  }
  release(f.roof);assert.equal(bi,72);assert.ok(count>144);t.diagnostic(`${count} full underside triangles; maximum support-plane containment error ${maxError}m`);
});

test('R159 geometric negative controls reject reversed heads and sagging bottoms while original corner metadata is unchanged',()=>{
  const f=fixture(),row=f.roof.userData.walkingBeasts.rows[0],station=row.stations[0],body=f.bodies[0],head=f.heads[0],ridge=f.ridges[0];
  const originalCorners=JSON.stringify(station.footContacts);
  assert.ok(observedOutwardDot(body,head,station,ridge)>.9,'positive original before mutation');
  const center=new T.Box3().setFromObject(body).getCenter(new T.Vector3());head.position.x=2*center.x-head.position.x;head.position.z=2*center.z-head.position.z;
  assert.ok(observedOutwardDot(body,head,station,ridge)<-.9,'actual inward head rejected independently of metadata');
  const geometry=body.geometry.clone();body.geometry=geometry;
  const position=geometry.attributes.position,index=geometry.index;
  for(let t=0;t<(index?.count??position.count);t+=3){
    const ids=[0,1,2].map(k=>index?.getX(t+k)??t+k),v=ids.map(i=>new T.Vector3().fromBufferAttribute(position,i));
    if(new T.Triangle(...v).getNormal(new T.Vector3()).y>=-.01)continue;
    for(const i of ids){const point=new T.Vector3().fromBufferAttribute(position,i);if(!station.footContacts.some(x=>point.distanceTo(new T.Vector3(...x))<4e-6))position.setY(i,position.getY(i)-.03);}
  }
  geometry.computeBoundingBox();geometry.computeBoundingSphere();
  for(const xyz of station.footContacts){let present=false;for(let i=0;i<position.count;i++)if(new T.Vector3().fromBufferAttribute(position,i).distanceTo(new T.Vector3(...xyz))<4e-6)present=true;assert.ok(present,'actual original corner geometry remains in the negative control');}
  assert.ok(bottomGrid(body,ridge,station).some(gap=>gap<-.02),'real underside sag must fail although all actual corners and metadata still claim contact');
  assert.equal(JSON.stringify(station.footContacts),originalCorners);geometry.dispose();release(f.roof);
});
