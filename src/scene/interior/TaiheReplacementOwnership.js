import {taiheFallbackMeshes} from './TaiheCoreContract.js';
import {proof,proofCurrent} from '../../utils/SceneSourceProof.js';
// Runtime identity only: GLB extras, names or caller userData cannot grant an exemption.
const owners=new WeakMap(), evidence=new WeakMap();
// Exact raw bytes, not a probabilistic hash. Uniform word views keep this bounded
// per-frame source check independent of the GLB's mixed Float32/Uint16 formats.
const sameWords=(a,b)=>{if(a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true;};
const sameTail=(a,b)=>{if(a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true;};
function bytesOf(array){const n=array.byteOffset%4===0?Math.floor(array.byteLength/4):0,words=new Uint32Array(array.buffer,n?array.byteOffset:0,n),tail=new Uint8Array(array.buffer,array.byteOffset+n*4,array.byteLength-n*4);return{words,wordValues:words.slice(),tail,tailValues:tail.slice(),byteLength:array.byteLength};}

export function registerTaiheReplacement(fallback,group,scene){
 const expected=taiheFallbackMeshes(scene);
 if(expected.length!==8||fallback.some(m=>!expected.includes(m))||new Set(fallback).size!==8)throw Error('Taihe fallback scene identity mismatch');
 if(fallback.length!==8||group.parent!==scene||!group.visible||fallback.some(m=>m.visible))throw Error('Taihe replacement is not installed');
 const arrays=[];
 group.traverse(mesh=>{if(!mesh.isMesh)return;for(const key of ['position','normal','index']){const attribute=key==='index'?mesh.geometry.index:mesh.geometry.attributes[key];if(attribute)arrays.push({mesh,key,attribute,version:attribute.version,count:attribute.count,itemSize:attribute.itemSize,array:attribute.array,bytes:bytesOf(attribute.array)});}});
 const record=Object.freeze({group,scene,fallback:Object.freeze([...fallback])});
 evidence.set(record,{proof:proof(group),arrays});
 for(const mesh of fallback)owners.set(mesh,record);
 return record;
}
export function revokeTaiheReplacement(fallback){for(const mesh of fallback??[])owners.delete(mesh);}
export function taiheReplacementFor(mesh){
 const record=owners.get(mesh),source=record&&evidence.get(record);
 return record&&record.group.parent===record.scene&&record.group.visible&&record.fallback.every(m=>!m.visible)&&proofCurrent(source.proof)&&source.arrays.every(r=>{const a=r.key==='index'?r.mesh.geometry.index:r.mesh.geometry.attributes[r.key];return a===r.attribute&&a.version===r.version&&a.count===r.count&&a.itemSize===r.itemSize&&a.array===r.array&&a.array.byteLength===r.bytes.byteLength&&sameWords(r.bytes.words,r.bytes.wordValues)&&sameTail(r.bytes.tail,r.bytes.tailValues);})?record:null;
}
