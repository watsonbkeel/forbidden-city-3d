import * as T from 'three';import {createSingleCurlSample} from './single-curl.mjs';
// Diagnostic-only: three existing-size curls, A/C/A. B is deliberately excluded.
export function createScalpPatch(texture,hair){
 if(!hair?.groups?.[0]||hair.groups[0].materialIndex!==5||hair.userData.curlCenters.length!==87)throw Error('exact existing cap required');
 const group=new T.Group(),geometries=[],materials=[],curls=[],positions=[],variants=[0,2,0];let disposed=false;
 const dispose=()=>{if(disposed)return;disposed=true;const errors=[];for(const g of geometries)try{g.dispose();}catch(e){errors.push(e);}for(const m of materials)try{m.dispose();}catch(e){errors.push(e);}if(errors.length)throw new AggregateError(errors,'scalp patch disposal');};
 try{const cap=hair.clone();cap.setIndex(Array.from(hair.index.array.slice(0,hair.groups[0].count)));cap.clearGroups();geometries.push(cap);const cm=new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.88,metalness:.08});materials.push(cm);group.add(new T.Mesh(cap,cm));
 for(let i=0;i<3;i++){const center=hair.userData.curlCenters[40+i],normal=new T.Vector3(center[0]/.18**2,(center[1]-2.005)/.22**2,center[2]/.16**2).normalize(),{geometry:g,material:m}=createSingleCurlSample(texture,variants[i]);geometries.push(g);materials.push(m);g.scale(.014,.013,.0045);const mesh=new T.Mesh(g,m);mesh.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),normal);mesh.position.fromArray(center);group.add(mesh);curls.push(mesh);positions.push([...center]);}
 return{group,curls,positions,variants,dispose};}catch(e){try{dispose();}catch(cleanup){throw new AggregateError([e,cleanup],'patch construction and cleanup');}throw e;}
}
