import * as T from 'three';
import {SHOUKANG_PERIMETER,shoukangPerimeterId,validateShoukangPerimeterScope} from '../../../controls/ShoukangRetainedPerimeterSupport.js';
import {createXiqingSurface} from '../../../controls/XiqingRoofSurface.js';
/** Add exact physics to unchanged complete retained walls; never clip a tall wall
 * into an invisible endpoint box. Keep original proxies and render sources. */
export function registerShoukangRetainedPerimeter(kit,frames){
 if(frames.length!==3)throw Error('Shoukang retained perimeter requires three complete original walls');
 kit.root.updateWorldMatrix(true,true);const inverse=kit.root.matrixWorld.clone().invert();
 const point=(m,p,i)=>{const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,m.matrixWorld));v.set(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));return v.applyMatrix4(kit.root.matrixWorld);};
 const additions=[];
 for(const [index,[side,c]]of Object.entries(SHOUKANG_PERIMETER).entries()){
  const f=frames[index],id=shoukangPerimeterId(side);if(f.parent!==kit.root||f.position.toArray().some((v,i)=>v!==c.frame[i])||f.rotation.x!==0||f.rotation.y!==c.rotation||f.rotation.z!==0||f.scale.toArray().some(v=>v!==1)||f.children.length!==3)throw Error('Shoukang retained wall frame changed');
  for(const [part,[height,depth,y,material]]of [[1,1.12,.5,'wall_brick'],[5.5,1,3.75,'wall_red']].entries()){
   const m=f.children[part],p=m.geometry?.attributes.position;if(!m.isMesh||m.material!==kit.lib.material(material)||m.position.x!==0||m.position.y!==y||m.position.z!==0||m.rotation.toArray().slice(0,3).some(v=>v!==0)||m.scale.toArray().some(v=>v!==1)||!p||p.count!==36||m.geometry.index)throw Error('Shoukang retained complete closed wall source changed');
   // Compare every triangle and winding to the exact kit box, not just its AABB.
   const expected=new T.BoxGeometry(c.length,height,depth).toNonIndexed(),ep=expected.attributes.position;
   try{if(p.array.length!==ep.array.length||Array.from(p.array).some((v,i)=>v!==ep.array[i]))throw Error('Shoukang retained closed box vertices changed');}finally{expected.dispose();}
   const b=new T.Box3();for(let i=0;i<p.count;i++)b.expandByPoint(point(m,p,i));b.shoukangEntry={kind:'visible-box',role:id+(part?'-body':'-base')};m.userData.shoukangRetainedBox=b.shoukangEntry.role;
   if(part){const r=c.region,scope={kind:'shoukang-entry',id,minOffsetX:r.minX-b.min.x,maxOffsetX:r.maxX-b.min.x,minOffsetZ:r.minZ-b.min.z,maxOffsetZ:r.maxZ-b.min.z};validateShoukangPerimeterScope(scope,b,r);b.furnitureMotionScope=scope;}additions.push(b);
  }
  const cap=f.children[2];if(!cap.isGroup||cap.position.x!==0||cap.position.y!==6.5||cap.position.z!==0||cap.rotation.toArray().slice(0,3).some(v=>v!==0)||cap.scale.toArray().some(v=>v!==1))throw Error('Shoukang retained original cap frame changed');
  const faces=[];let mesh=0;cap.traverse(m=>{if(!m.isMesh)return;const p=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??p.count);i+=3)faces.push({source:{mesh,triangle:i/3},vertices:[0,1,2].map(k=>point(m,p,ix?ix.getX(i+k):i+k))});m.userData.shoukangRetainedSurface={id:id+'-cap',mesh};mesh++;});
  const surface=createXiqingSurface(faces,id+'-cap'),b=surface.box.clone();b.xiqingRoofSurface=surface;b.shoukangEntry={kind:'visible-surface',id:id+'-cap'};additions.push(b);
 }
 kit.colliders.push(...additions);
}
