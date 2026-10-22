import fs from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
export const ROOT=new URL('../../',import.meta.url);
export const config=JSON.parse(fs.readFileSync(new URL('data/interiors/kunning.json',ROOT)));
export const OLD_MODEL='/models/interiors/kunning-v6-0c83b4364eef.glb';
export const hash=value=>crypto.createHash('sha256').update(typeof value==='string'||Buffer.isBuffer(value)?value:JSON.stringify(value)).digest('hex');
export async function actualKunningRoot(model=config.model){const bytes=fs.readFileSync(new URL(`public${model}`,ROOT));return(await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'')).scene;}
export const contract=root=>root.getObjectByName('KUNNING_CONTRACT').userData;
export const inventory=root=>JSON.parse(contract(root).furnitureInventory);
export const isLowStove=(name,points,boxes)=>name==='COL_stove'||/^(merged_)?r55_stove_/.test(name)||boxes.some(b=>points.every(p=>p.every((v,i)=>v>=b.min[i]-1e-6&&v<=b.max[i]+1e-6)));
export function triangles(root){root.updateMatrixWorld(true);const rows=[],boxes=inventory(root).filter(o=>/^stove_/.test(o.name));root.traverse(o=>{if(!o.isMesh)return;const g=o.geometry,keys=Object.keys(g.attributes).sort(),mat=Array.isArray(o.material)?o.material[0]:o.material;for(let i=0;i<(g.index?.count??g.attributes.position.count);i+=3){const vs=Array.from({length:3},(_,j)=>{const id=g.index?.getX(i+j)??i+j;return Object.fromEntries(keys.map(k=>{const a=g.attributes[k];return[k,Array.from({length:a.itemSize},(_,c)=>a.array[id*a.itemSize+c])];}));});const world=vs.map(v=>new THREE.Vector3(...v.position).applyMatrix4(o.matrixWorld).toArray());const canonical=vs.map((_,i)=>JSON.stringify(vs.slice(i).concat(vs.slice(0,i)))).sort()[0];rows.push({name:o.name,material:mat.name,world,vertices:vs,key:JSON.stringify([o.name,mat.name,o.matrixWorld.toArray(),keys.map(k=>[k,g.attributes[k].itemSize,g.attributes[k].normalized,g.attributes[k].array.constructor.name]),canonical]),target:isLowStove(o.name,world,boxes)});}});return rows;}
export function rawGLB(model=config.model){const bytes=fs.readFileSync(new URL(`public${model}`,ROOT));const length=bytes.readUInt32LE(12);return{bytes,gltf:JSON.parse(bytes.toString('utf8',20,20+length)),bin:bytes.subarray(28+length)};}
