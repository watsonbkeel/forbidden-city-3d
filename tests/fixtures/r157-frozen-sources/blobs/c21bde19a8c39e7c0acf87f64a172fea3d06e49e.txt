import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
const unit=new T.Vector3(1,1,1),close=(a,b)=>Math.abs(a-b)<1e-8;
const rect=(x0,x1,y0,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
const clipped=(x,w,lo,hi,c)=>[[x-w/2+c,lo],[x+w/2-c,lo],[x+w/2,lo+c],[x+w/2,hi-c],[x+w/2-c,hi],[x-w/2+c,hi],[x-w/2,hi-c],[x-w/2,lo+c]];
const path=(points,C=T.Shape)=>{const s=new C();s.moveTo(...points[0]);for(const p of points.slice(1))s.lineTo(...p);s.closePath();return s;};
/** Stage exact south-face replacement, retaining side/back attributes. */
export function stageJingrenSouthFace(kit,frame,same,reject){
 const targets=[],all=[];kit.root.traverse(m=>{if(m.isMesh)all.push(m);});
 for(const[w,h,x,y]of[[1.4,4.9,-2.5,3.45],[1.4,4.9,2.5,3.45],[3.6,1.5,0,5.15]]){
  const found=frame.children.filter(m=>m.isMesh&&close(m.position.x,x)&&close(m.position.y,y)&&m.position.z===0);if(found.length!==1)reject();const m=found[0],ref=applyBoxUV(new T.BoxGeometry(w,h,2.8),kit.lib.tileSize('wall_red'));let ok;try{ok=Object.getOwnPropertyDescriptor(m,'geometry')?.writable&&m.visible&&m.matrixAutoUpdate&&m.material===kit.lib.material('wall_red')&&m.scale.equals(unit)&&!m.rotation.toArray().slice(0,3).some(Boolean)&&same(m.geometry,ref)&&!all.some(q=>q!==m&&q.geometry===m.geometry);}finally{ref.dispose();}if(!ok)reject();targets.push(m);
 }
 const group=new T.Group();group.name='jingren-south-color-fields';const geometries=[],materials=[],replacement=[];
 try{
  const green=new T.MeshStandardMaterial({name:'jingren_fitted_green',color:0x3b6556,roughness:.45}),yellow=new T.MeshStandardMaterial({name:'jingren_fitted_yellow',color:0xb38b38,roughness:.45});materials.push(green,yellow);
  const add=(points,holes,material,role)=>{const s=path(points);for(const h of holes)s.holes.push(path(h,T.Path));const geo=new T.ShapeGeometry(s,1);geo.rotateY(Math.PI);geo.translate(0,0,-1.4);geometries.push(geo);const m=kit.mesh(group,geo,material,0,0,0);m.userData.jingrenFace={role};m.name='jingren-south-'+role;};
  for(const x of[-2.5,2.5]){const outer=rect(x-.7,x+.7,1,5.9),inner=rect(x-.54,x+.54,1.08,5.17),red=clipped(x,1.02,1.12,5.10,.32);add(outer,[inner],yellow,'yellow-border');add(inner,[red],green,'green-corner');add(red,[],kit.lib.material('wall_red'),'red-core');}
  const outer=rect(-1.8,1.8,4.4,5.9),inner=rect(-1.8,1.8,4.54,5.76);add(outer,[inner],yellow,'yellow-header');add(inner,[],green,'green-header');
  for(const m of targets){const g=new T.BufferGeometry(),src=m.geometry,ids=[];for(let i=0;i<src.attributes.position.count;i+=3)if(![0,1,2].every(k=>src.attributes.normal.getZ(i+k)<-.99))ids.push(i,i+1,i+2);if(ids.length!==30)reject();for(const[k,a]of Object.entries(src.attributes)){const values=[];for(const i of ids)for(let n=0;n<a.itemSize;n++)values.push(a.array[i*a.itemSize+n]);g.setAttribute(k,new T.Float32BufferAttribute(values,a.itemSize,a.normalized));}g.computeBoundingBox();g.computeBoundingSphere();geometries.push(g);replacement.push(g);}
 }catch(error){for(const g of geometries)g.dispose();for(const m of materials)m.dispose();throw error;}
 return{group,geometries,materials,targets,replacement,old:targets.map(m=>m.geometry)};
}
