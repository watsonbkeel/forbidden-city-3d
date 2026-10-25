import fs from 'node:fs';import * as THREE from 'three';import{GLTFLoader}from'three/examples/jsm/loaders/GLTFLoader.js';import{cpuDracoLoader}from'../../tests/lib/cpu-draco.mjs';
export async function readAsset(bytes){
 const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12))),loader=new GLTFLoader().setDRACOLoader(await cpuDracoLoader());
 const asset=await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 const rows=[];
 for(let ni=0;ni<json.nodes.length;ni++){const node=json.nodes[ni];if(node.mesh===undefined)continue;if(node.children?.length)throw Error('Expected flat frozen Yangxin node');const mesh=await asset.parser.getDependency('mesh',node.mesh);if(!mesh.isMesh)throw Error('Expected one primitive');const geometry=mesh.geometry,matrix=new THREE.Matrix4();if(node.matrix)matrix.fromArray(node.matrix);else matrix.compose(new THREE.Vector3(...(node.translation??[0,0,0])),new THREE.Quaternion(...(node.rotation??[0,0,0,1])),new THREE.Vector3(...(node.scale??[1,1,1])));rows.push({ni,node,geometry,matrix,primitive:json.meshes[node.mesh].primitives[0]});}
 return{json,rows,asset};
}
export function trianglePositions(row,face){const p=row.geometry.attributes.position,i=row.geometry.index;return[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,i?i.getX(face*3+k):face*3+k).applyMatrix4(row.matrix).toArray());}
