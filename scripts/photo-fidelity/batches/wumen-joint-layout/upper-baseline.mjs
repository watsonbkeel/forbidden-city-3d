import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const typed=a=>({type:a.constructor.name,byteLength:a.byteLength,sha256:sha(Buffer.from(a.buffer,a.byteOffset,a.byteLength))});
const attr=a=>a?{...typed(a.array),itemSize:a.itemSize,count:a.count,normalized:a.normalized,usage:a.usage,gpuType:a.gpuType,flags:Object.fromEntries(Object.entries(a).filter(([k])=>k.startsWith('is')))}:null;
/** Read-only listed fields of the actual white/tile1 component fixture.
 * This is not a TextureLibrary/GPU/shader security contract. Object/material
 * UUIDs are canonicalized by stable traversal identity, not blindly discarded. */
export function upperPredecessorSignature(c){
 if(!c?.group?.isGroup||!c.builder||!c.THREE)throw Error('upper predecessor requires actual gate capture');
 c.group.updateWorldMatrix(true,true);
 const ids=new Map();let next=0;
 const label=o=>{if(o?.uuid&&!ids.has(o.uuid))ids.set(o.uuid,'fixture-resource-'+next++);};
 c.group.traverse(o=>{label(o);label(o.geometry);for(const m of (Array.isArray(o.material)?o.material:o.material?[o.material]:[])){label(m);for(const v of Object.values(m))if(v?.isTexture){label(v);label(v.source);}}});
 const generated=new WeakSet(),token=x=>{generated.add(x);return x;};
 const canonical=value=>JSON.parse(JSON.stringify(value,(k,v)=>{if(v===undefined)return token({primitive:'undefined'});if(typeof v==='string'&&ids.has(v))return ids.get(v);if(typeof v==='number'&&(Object.is(v,-0)||!Number.isFinite(v)))return token({numeric:Object.is(v,-0)?'-0':String(v)});if(v&&typeof v==='object'&&!Array.isArray(v)&&!generated.has(v)&&['numeric','primitive','escapedRecord'].some(k=>Object.hasOwn(v,k)))return token({escapedRecord:Object.entries(v)});return v;}));
 const state=o=>({type:o.type,name:o.name,position:o.position.toArray(),quaternion:o.quaternion.toArray(),scale:o.scale.toArray(),localMatrix:o.matrix.toArray(),worldMatrix:o.matrixWorld.toArray(),flags:{visible:o.visible,castShadow:o.castShadow,receiveShadow:o.receiveShadow,frustumCulled:o.frustumCulled,renderOrder:o.renderOrder,matrixAutoUpdate:o.matrixAutoUpdate,matrixWorldAutoUpdate:o.matrixWorldAutoUpdate},layers:o.layers.mask,executionFlags:Object.fromEntries(Object.entries(o).filter(([k])=>k.startsWith('is'))),userData:o.userData});
 const material=m=>{const entries=Object.entries(m).filter(([,v])=>v?.isTexture),meta={textures:Object.fromEntries(entries.map(([,t])=>[t.uuid,{}])),images:{}};return{data:m.toJSON(meta),textures:Object.fromEntries(entries.map(([k,t])=>[k,{type:t.type,name:t.name,mapping:t.mapping,channel:t.channel,wrapS:t.wrapS,wrapT:t.wrapT,magFilter:t.magFilter,minFilter:t.minFilter,anisotropy:t.anisotropy,format:t.format,internalFormat:t.internalFormat,colorSpace:t.colorSpace,generateMipmaps:t.generateMipmaps,premultiplyAlpha:t.premultiplyAlpha,flipY:t.flipY,unpackAlignment:t.unpackAlignment,repeat:t.repeat.toArray(),offset:t.offset.toArray(),center:t.center.toArray(),rotation:t.rotation,matrix:t.matrix.toArray(),matrixAutoUpdate:t.matrixAutoUpdate,imageShape:{width:t.image?.width??null,height:t.image?.height??null},imagePixels:'NOT_CAPTURED_FIXTURE_CANVAS_NO_GPU'}])),executionFlags:Object.fromEntries(Object.entries(m).filter(([k])=>k.startsWith('is')))};};
 const nodes=[];let shafts=0;
 function visit(o,path){const row={path,...state(o),childCount:o.children.length};if(o.geometry){const g=o.geometry;row.geometry={type:g.type,attributes:Object.fromEntries(Object.entries(g.attributes).map(([k,a])=>[k,attr(a)])),index:attr(g.index),groups:g.groups,drawRange:g.drawRange,morphTargetsRelative:g.morphTargetsRelative,morphAttributes:Object.fromEntries(Object.entries(g.morphAttributes).map(([k,as])=>[k,as.map(attr)])),userData:g.userData};if(g.type==='CylinderGeometry'){const b=new c.THREE.Box3().setFromObject(o);if(b.min.y<12.31&&b.max.y>12.31)shafts++;}}
 if(o.material)row.materials=(Array.isArray(o.material)?o.material:[o.material]).map(material);nodes.push(row);o.children.forEach((q,i)=>visit(q,[...path,i]));}
 visit(c.group,[]);const ancestors=[];for(let o=c.group.parent;o;o=o.parent)ancestors.push(state(o));
 return canonical({scope:'ACTUAL_GATE_FIXTURE_LISTED_FIELDS_TILE1_BASECOLOR_NOT_TEXTURE_LIBRARY_OR_GPU',anchor:c.data,nodes,ancestors,shaftCountAtPlatform:shafts,colliders:c.builder.colliders,walkables:c.builder.walkables});
}
/** Compare already captured signatures, avoiding hidden recapture or mutation. */
export function verifyUpperPredecessor(actual,baseline){if(!isDeepStrictEqual(actual,baseline))throw Error('upper predecessor recorded fields differ');return true;}

export function decodeUpperPredecessorBaseline(bytes){
 if(sha(bytes)!=='b582e5625227fbd5983e8dcca8800734e280451e3494a2da4fc83a3b5643b329')throw Error('upper predecessor baseline compressed byte pin mismatch');
 const raw=gunzipSync(bytes);if(sha(raw)!=='fdcb51be87aa0a8f237f3cfd4d239f78cb49d11c7ec6a239f0b33639e95cf31c')throw Error('upper predecessor baseline raw byte pin mismatch');
 return JSON.parse(raw);
}
