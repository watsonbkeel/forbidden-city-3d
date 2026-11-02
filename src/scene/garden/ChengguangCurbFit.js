import*as T from'three';
import{applyBoxUV}from'../../utils/GeometryUV.js';
/** Only the generated north-axis east curb under the actual new pillar foot.
 * No road surface/old tree/body owner is removed. Unmatched meshes are identical. */
export function splitChengguangCurb(m,tile){
 if(!m?.isMesh||Math.abs(m.position.x-1.8)>1e-9||Math.abs(m.position.y-.04)>1e-9||Math.abs(m.position.z-511.95)>1e-9)return[m];
 const g=m.geometry;g.computeBoundingBox();const size=g.boundingBox.getSize(new T.Vector3());
 if(Math.abs(size.x-.16)>1e-6||Math.abs(size.y-.08)>1e-6||Math.abs(size.z-12.7)>1e-6||m.rotation.toArray().slice(0,3).some(Boolean)||!m.scale.equals(new T.Vector3(1,1,1))||!(tile>0))throw Error('Chengguang approved generated curb source drift');
 const out=[];for(const[lo,hi]of[[505.6,512.3999999761581],[513.6000000238419,518.3]]){
  const geo=applyBoxUV(new T.BoxGeometry(.16,.08,hi-lo),tile),q=new T.Mesh(geo,m.material);q.position.set(1.8,.04,(lo+hi)/2);const dz=q.position.z-m.position.z,n=geo.attributes.normal,uv=geo.attributes.uv;
  for(let i=0;i<uv.count;i++){if(Math.abs(n.getY(i))>.9)uv.setY(i,uv.getY(i)+dz/tile);else if(Math.abs(n.getX(i))>.9)uv.setX(i,uv.getX(i)+dz*Math.sign(n.getX(i))/tile)}out.push(q);
 }
 g.dispose();return out;
}
