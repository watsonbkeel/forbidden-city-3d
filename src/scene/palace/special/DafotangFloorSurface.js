import {Triangle,Vector3} from 'three';

// Dafotang's retained platform slab is lowered to the walkable datum by its
// existing host. Its base then has a second, fully covered top at the same
// height. Remove only that hidden render face, not the base or its colliders.
export function removeDafotangCoveredPlatformTop(kit,frame,height){
 const find=key=>{const rows=frame.children.filter(n=>n.isMesh&&n.material===kit.lib.material(key));if(rows.length!==1)throw Error(`Dafotang floor requires one ${key}`);return rows[0];};
 const band=find('sumeru_band'),slab=find('stone_slab');
 for(const mesh of [band,slab])mesh.updateMatrix();
 const bounds=mesh=>{mesh.geometry.computeBoundingBox();return mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrix);};
 const b=bounds(band),s=bounds(slab),epsilon=1e-6;
 if(Math.abs(b.max.y-height)>epsilon||Math.abs(s.max.y-height)>epsilon||s.min.x>b.min.x||s.max.x<b.max.x||s.min.z>b.min.z||s.max.z<b.max.z)throw Error('Dafotang floor covered-top contract changed');
 const g=band.geometry,a=g.attributes.position,index=g.index,keep=[];let removed=0;
 for(let i=0;i<(index?.count??a.count);i+=3){const ids=[0,1,2].map(j=>index?index.getX(i+j):i+j),points=ids.map(id=>new Vector3().fromBufferAttribute(a,id).applyMatrix4(band.matrix));const normal=new Triangle(...points).getNormal(new Vector3());
  if(normal.y>1-epsilon&&points.every(p=>Math.abs(p.y-height)<epsilon))removed++;else keep.push(...ids);
 }
 if(removed!==2||keep.length!==30)throw Error('Dafotang platform must retain ten side/bottom triangles');
 g.setIndex(keep);
}
