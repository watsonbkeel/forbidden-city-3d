import * as T from 'three';
import {createXiqingSurface} from '../../controls/XiqingRoofSurface.js';
// Only the unchanged, deterministic tree touching the new sishen circulation.
// No new tree, pruning, canopy solid, random consumption, or synthetic barrier.
export function sishenRetainedTreeSource(geometry,matrix,kind){
 const at=new T.Vector3().setFromMatrixPosition(matrix);
 if(Math.abs(at.x-24.889232903160156)>1e-9||Math.abs(at.z-460.8040235625114)>1e-9)return null;
 const expected=[-0.8039048314094543,0,-0.681109607219696,0,0,1.0695018768310547,0,0,0.6967077255249023,0,-0.8223151564598083,0,24.889232635498047,0.30000001192092896,460.80401611328125,1],actual=new Float32Array(matrix.elements);
 const hash=a=>{let h=2166136261;for(const byte of new Uint8Array(a.buffer,a.byteOffset,a.byteLength))h=Math.imul(h^byte,16777619)>>>0;return h.toString(16)};
 if(kind!=='cypress'||actual.some((v,i)=>v!==expected[i])||geometry.index!==null||geometry.drawRange.start!==0||geometry.drawRange.count!==Infinity||geometry.groups.length!==0||geometry.attributes.position?.count!==2622||geometry.attributes.position?.itemSize!==3||!(geometry.attributes.position.array instanceof Float32Array)||hash(geometry.attributes.position.array)!=='7ce09eff'||geometry.attributes.normal?.count!==2622||hash(geometry.attributes.normal.array)!=='e60a5443')throw Error('Sishen retained tree source contract changed');
 // InstancedMesh.setMatrixAt stores Float32 instance transforms. Use precisely
 // those values and final F32 world vertices, not the unrounded sampler matrix.
 const mx=new T.Matrix4().fromArray(new Float32Array(matrix.elements)),p=geometry.attributes.position,ix=geometry.index,faces=[];
 for(let i=0;i<(ix?.count??p.count);i+=3){const vertices=[0,1,2].map(k=>{const v=new T.Vector3().fromBufferAttribute(p,ix?ix.getX(i+k):i+k).applyMatrix4(mx);return v.set(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));});faces.push({source:{mesh:0,triangle:i/3},vertices});}
 const surface=createXiqingSurface(faces,'sishen-retained-tree-trunk'),box=surface.box.clone();box.xiqingRoofSurface=surface;box.sishenRetainedTree={kind:'actual-unchanged-instanced-trunk',originalAnchor:[at.x,at.z],sourceFaces:faces.length};return box;
}

export function validateSishenTreeCount(count){if(count!==1)throw Error('Sishen requires exactly one retained tree source');}
