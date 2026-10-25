import * as THREE from 'three';
export class TaihePlaqueClearanceError extends Error {}

// Conservative complete-box certificate: if the entire declared volume clears,
// every concave arm and inset within it clears too. Never a sampled-ray substitute.
function clip(polygon,axis,value,sign){const out=[];for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length],da=(a[axis]-value)*sign,db=(b[axis]-value)*sign,insideA=da>=-1e-10,insideB=db>=-1e-10;if(insideA)out.push(a);if(insideA!==insideB){const t=da/(da-db);out.push(a.clone().lerp(b,t));}}return out;}
export function verifyTaihePlaqueRoofClearance(plaque,roof,{margin=.03}={}){
 const {width,height,depth}=plaque.geometry.parameters??{};if(![width,height,depth,margin].every(Number.isFinite)||Math.min(width,height,depth)<=0||margin<0)throw new TaihePlaqueClearanceError('Invalid plaque clearance envelope');
 plaque.updateWorldMatrix(true,true);roof.updateWorldMatrix(true,true);const invPlaque=plaque.matrixWorld.clone().invert(),invRoof=roof.matrixWorld.clone().invert(),localBounds=new THREE.Box3(),bounds=new THREE.Box3(),v=new THREE.Vector3();
 plaque.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position,localMatrix=invPlaque.clone().multiply(m.matrixWorld),roofMatrix=invRoof.clone().multiply(m.matrixWorld);for(let i=0;i<a.count;i++){localBounds.expandByPoint(v.fromBufferAttribute(a,i).applyMatrix4(localMatrix));bounds.expandByPoint(v.fromBufferAttribute(a,i).applyMatrix4(roofMatrix));}});
 const expected=new THREE.Box3(new THREE.Vector3(-width/2,-height/2,-depth/2),new THREE.Vector3(width/2,height/2,depth/2));for(const axis of['x','y','z'])for(const edge of['min','max'])if(Math.abs(localBounds[edge][axis]-expected[edge][axis])>1e-5)throw new TaihePlaqueClearanceError('Declared plaque envelope differs from complete actual geometry');
 const padded=bounds.clone();padded.min.y-=margin;padded.max.y+=margin;let testedTriangles=0,overlappingTriangles=0,minimumClearance=Infinity,limiting=null;
 roof.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position,ix=m.geometry.index,matrix=invRoof.clone().multiply(m.matrixWorld);m.geometry.computeBoundingBox();const mb=m.geometry.boundingBox.clone().applyMatrix4(matrix);if(mb.max.x<bounds.min.x||mb.min.x>bounds.max.x||mb.max.z<bounds.min.z||mb.min.z>bounds.max.z)return;
  for(let i=0;i<(ix?.count??a.count);i+=3){const vertices=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(a,ix?ix.getX(i+j):i+j).applyMatrix4(matrix)),triangle=new THREE.Triangle(...vertices);testedTriangles++;if(padded.intersectsTriangle(triangle))throw new TaihePlaqueClearanceError(`Taihe plaque/roof intersection or clearance below margin at ${m.name||m.material?.name}:${i/3}`);
   let polygon=vertices;for(const[axis,value,sign]of[['x',bounds.min.x,1],['x',bounds.max.x,-1],['z',bounds.min.z,1],['z',bounds.max.z,-1]]){polygon=clip(polygon,axis,value,sign);if(!polygon.length)break;}if(!polygon.length)continue;overlappingTriangles++;const low=Math.min(...polygon.map(p=>p.y)),high=Math.max(...polygon.map(p=>p.y)),gap=high<=bounds.min.y?bounds.min.y-high:low>=bounds.max.y?low-bounds.max.y:-1;if(gap<margin-1e-7)throw new TaihePlaqueClearanceError(`Taihe full-region roof clearance insufficient at triangle ${i/3}`);if(gap<minimumClearance){minimumClearance=gap;limiting={mesh:m.name,material:Array.isArray(m.material)?m.material.map(v=>v.name):m.material?.name,triangle:i/3,low,high};}
  }
 });
 if(!overlappingTriangles||!Number.isFinite(minimumClearance))throw new TaihePlaqueClearanceError('No actual overlapping roof triangle region establishes clearance');
 return{method:'ALL_ROOF_TRIANGLES_CLIPPED_TO_COMPLETE_PLAQUE_XZ_ENVELOPE_WITH_SAT',margin,minimumClearance,testedTriangles,overlappingTriangles,limiting,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},scope:'Conservative full envelope; stronger than visible cloud-only clipping, not GPU/photo acceptance'};
}
