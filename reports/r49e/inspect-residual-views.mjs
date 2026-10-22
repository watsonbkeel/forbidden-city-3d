import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {withDepthScene} from '../../tests/lib/r49d-depth-snapshot.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url)).replace(/\/$/,'');
await withDepthScene(root,{zone:'outer-east',name:'文渊阁'},({T,zone,built,plaque})=>{
 const inv=built.f.matrixWorld.clone().invert(),g=plaque.frame.geometry.parameters,views=[];
 for(const xyz of[[0,1.7,-25],[0,1.7,-30],[0,2.2,-10]]){
  const origin=built.f.localToWorld(new T.Vector3(...xyz)),rows=[];
  for(let iy=0;iy<5;iy++)for(let ix=0;ix<5;ix++){
   const point=new T.Vector3(-g.width/2+.015+(g.width-.03)*ix/4,-g.height/2+.015+(g.height-.03)*iy/4,-g.depth/2-.0001).applyMatrix4(plaque.frame.matrixWorld),dir=point.clone().sub(origin),dist=dir.length(),ray=new T.Raycaster(origin,dir.normalize(),0,dist-.001),hit=ray.intersectObject(zone.kit.root,true).find(h=>h.object!==plaque.mesh&&h.object!==plaque.frame);
   let blocker=null;if(hit){const o=hit.object;o.geometry.computeBoundingBox();const box=o.geometry.boundingBox.clone().applyMatrix4(inv.clone().multiply(o.matrixWorld));blocker={name:o.name,role:o.userData.role,material:o.material?.name,type:o.geometry.type,bounds:{min:box.min.toArray(),max:box.max.toArray()},point:hit.point.clone().applyMatrix4(inv).toArray()};}
   rows.push({sample:[ix,iy],visible:!hit,blocker});
  }
  views.push({camera:xyz,visible:rows.filter(r=>r.visible).length,total:25,rows});
 }
 const file=new URL('./residual-views.json',import.meta.url);writeFileSync(file,JSON.stringify(views,null,2)+'\n');console.log(JSON.stringify(views.map(v=>({...v,rows:v.rows.filter(r=>!r.visible)})),null,2));
});
