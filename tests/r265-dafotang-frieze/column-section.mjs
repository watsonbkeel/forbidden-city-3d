import {T,fixture,candidate,triangles,beam} from './fixture.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const profile=JSON.parse(fs.readFileSync(new URL('./fixtures/profile.json',import.meta.url))),fx=fixture();
const rows=[];
try{
 const out=(await candidate()).buildDafotangHistoricLayout(fx.context);out.frame.updateWorldMatrix(true,true);
 const columns=out.frame.children.filter(m=>m.userData.dafotangLayoutRole==='lower-column');
 for(const pair of profile.path.plainReturnSegments)for(const side of['leftReturn','rightReturn']){
  const returnSegment=pair[side],anchor=returnSegment.from[1]===4.13?returnSegment.from:returnSegment.to;
  const a=new T.Vector3(Math.fround(anchor[0]),Math.fround(anchor[1]),Math.fround(4.24)).applyMatrix4(beam(out).matrixWorld);
  const col=columns.reduce((best,m)=>{const cb=new T.Box3().setFromObject(m).getCenter(new T.Vector3()),bb=new T.Box3().setFromObject(best).getCenter(new T.Vector3());return Math.abs(cb.x-a.x)<Math.abs(bb.x-a.x)?m:best;});
  const xs=[];
  for(const t of triangles(col.geometry)){
   for(const v of[t.a,t.b,t.c])v.applyMatrix4(col.matrixWorld);
   for(const[p,q]of[[t.a,t.b],[t.b,t.c],[t.c,t.a]])if((p.y<=a.y&&q.y>=a.y)||(q.y<=a.y&&p.y>=a.y)){
    const d=q.y-p.y;if(Math.abs(d)>1e-12)xs.push(p.x+(a.y-p.y)/d*(q.x-p.x));
   }
  }
  assert.ok(xs.length);const min=Math.min(...xs),max=Math.max(...xs),center=(min+max)/2,gap=a.x>center?a.x-max:min-a.x;
  assert.ok(gap>.014&&gap<.015);
  rows.push({bay:pair.bay,side,actualWorldAnchor:a.toArray(),actualWorldColumnXAtAnchorHeight:[min,max],sameHeightHorizontalMeshGap:gap,definition:'actual Float32 column triangle intersections with y=actual Float32 old-bottom seam; horizontal gap, not perspective/GPU or global Euclidean minimum'});
 }
 console.log(JSON.stringify({status:'PASS',rows,usage:process.resourceUsage()},null,2));
}finally{fx.dispose();}
