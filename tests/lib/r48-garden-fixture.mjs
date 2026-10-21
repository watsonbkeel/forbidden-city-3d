import * as THREE from 'three';
export function gardenLibrary(){const materials=new Map();return{material:(name,p={})=>{const key=name+JSON.stringify(p);if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({name,...p}));return materials.get(key)},tileSize:()=>1,aspect:()=>1,color:()=>null,normal:()=>null,owns:m=>[...materials.values()].includes(m)};}
export const meshes=(root,role)=>{const a=[];root.traverse(m=>{if(m.isMesh&&m.userData.role===role)a.push(m)});return a;};
