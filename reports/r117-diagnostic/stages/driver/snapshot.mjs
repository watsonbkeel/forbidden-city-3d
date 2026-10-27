import {sha256,resourceInventory} from './measurement.mjs';
function bytes(a){return Buffer.from(a.buffer,a.byteOffset,a.byteLength);}
function attribute(a){return a?{itemSize:a.itemSize,normalized:a.normalized,usage:a.usage,gpuType:a.gpuType,count:a.count,type:a.array.constructor.name,bytes:a.array.byteLength,sha256:sha256(bytes(a.array))}:null;}
// Stable value record for collision/room metadata, without runtime UUIDs or
// function closures. Object references are explicit, never silently dropped.
function semantic(value,seen=new Map()){
 if(value===null||typeof value!=='object')return typeof value==='bigint'?`${value}n`:typeof value==='function'?'FUNCTION_NOT_SERIALIZED':Number.isNaN(value)?'NaN':value;
 if(seen.has(value))return{$ref:seen.get(value)};seen.set(value,seen.size);
 if(ArrayBuffer.isView(value))return{type:value.constructor.name,bytes:value.byteLength,sha256:sha256(bytes(value))};
 if(value instanceof Map)return[...value].map(([k,v])=>[semantic(k,seen),semantic(v,seen)]);
 if(value instanceof Set)return[...value].map(v=>semantic(v,seen));
 if(Array.isArray(value))return value.map(v=>semantic(v,seen));
 const r={};for(const k of Object.keys(value).sort()){if(k==='uuid'||typeof value[k]==='function')continue;r[k]=semantic(value[k],seen);}return r;
}
export function snapshotWorld({scene,builders=[],zoneManager,collisionManager,characters,createCanvas}){
 const textureCache=new Map(),materialCache=new Map();
 function texture(t){if(!t)return null;if(textureCache.has(t))return textureCache.get(t);
  const i=t.image;let pixelHash=null,pixelStatus='UNKNOWN';
  if(i?.data&&ArrayBuffer.isView(i.data)){pixelHash=sha256(bytes(i.data));pixelStatus='actual-data-texture-bytes';}
  else if(i?.width>0&&i?.height>0&&createCanvas){const c=createCanvas(i.width,i.height),ctx=c.getContext('2d');ctx.drawImage(i,0,0);pixelHash=sha256(bytes(ctx.getImageData(0,0,i.width,i.height).data));pixelStatus='actual-native-canvas-image-rgba';}
  const v={name:t.name,width:i?.width,height:i?.height,pixelHash,pixelStatus,colorSpace:t.colorSpace,type:t.type,format:t.format,wrapS:t.wrapS,wrapT:t.wrapT,minFilter:t.minFilter,magFilter:t.magFilter,generateMipmaps:t.generateMipmaps,anisotropy:t.anisotropy,flipY:t.flipY,premultiplyAlpha:t.premultiplyAlpha,unpackAlignment:t.unpackAlignment,repeat:t.repeat?.toArray(),offset:t.offset?.toArray(),center:t.center?.toArray(),rotation:t.rotation,matrix:t.matrix?.toArray()};textureCache.set(t,v);return v;
 }
 function material(m){if(!m)return null;if(materialCache.has(m))return materialCache.get(m);const v={};
  for(const k of Object.keys(m).sort()){if(['id','uuid','version','_listeners'].includes(k)||typeof m[k]==='function')continue;const x=m[k];if(x?.isTexture)v[k]=texture(x);else if(x?.isColor)v[k]=x.toArray();else if(x?.isVector2||x?.isVector3||x?.isMatrix3)v[k]=x.toArray();else if(x===null||['string','number','boolean'].includes(typeof x))v[k]=x;else if(k==='uniforms'){v[k]={};for(const [key,u]of Object.entries(x))v[k][key]=u.value?.isTexture?texture(u.value):u.value?.toArray?u.value.toArray():semantic(u.value);}}
  materialCache.set(m,v);return v;
 }
 const roots=[['scene',scene],...[...(zoneManager?.prebuilt??[])].map(([id,e])=>['prebuilt:'+id,e.data.group]),...[...(zoneManager?.inactiveCache?.entries??[])].map(([id,e])=>['inactive:'+id,e.entry?.data?.group])].filter(([,r])=>r);
 const records=[];for(const [label,root]of roots){root.updateWorldMatrix(true,true);const visit=(o,p)=>{const r={path:p,type:o.type,name:o.name,visible:o.visible,matrixWorld:o.matrixWorld.toArray(),castShadow:o.castShadow,receiveShadow:o.receiveShadow,renderOrder:o.renderOrder,layers:o.layers.mask,userData:semantic(Object.fromEntries(Object.entries(o.userData).filter(([k])=>k!=='zoneManager')))};
   if(o.geometry){const g=o.geometry;r.geometry={attributes:Object.fromEntries(Object.entries(g.attributes).sort().map(([k,a])=>[k,attribute(a)])),index:attribute(g.index),groups:g.groups,drawRange:g.drawRange,boundingBox:semantic(g.boundingBox),boundingSphere:semantic(g.boundingSphere)};r.material=Array.isArray(o.material)?o.material.map(material):material(o.material);if(o.isInstancedMesh){r.count=o.count;r.instanceMatrix=attribute(o.instanceMatrix);r.instanceColor=attribute(o.instanceColor);}}
   if(o.isLOD)r.levels=o.levels.map(v=>({distance:v.distance,hysteresis:v.hysteresis,index:o.children.indexOf(v.object)}));records.push(r);o.children.forEach((c,i)=>visit(c,p+'/'+i));};visit(root,label);}
 const metadata=semantic({rooms:zoneManager?.allRooms,mapItems:zoneManager?.allMapItems,regions:zoneManager?.allRegions});
 // Scene userData references manager and native renderer state: record only
 // mesh-local userData above; world ownership is covered by explicit roots.
 const render={objects:records.length,sha256:sha256(JSON.stringify(records)),textures:[...textureCache.values()].map(v=>sha256(JSON.stringify(v))).sort(),unknownTextures:[...textureCache.values()].filter(v=>v.pixelStatus==='UNKNOWN').length};
 const zonePhysics={};for(const [kind,entries]of [['loaded',zoneManager?.loaded],['prebuilt',zoneManager?.prebuilt],['inactive',zoneManager?.inactiveCache?.entries]])for(const [id,row]of entries??[]){const d=(kind==='inactive'?row.entry:row).data;zonePhysics[kind+':'+id]={sha256:sha256(JSON.stringify(semantic({colliders:d.colliders,walkables:d.walkables}))),colliders:d.colliders.length,walkables:d.walkables.length};}
 const physics={sha256:sha256(JSON.stringify(semantic({colliders:collisionManager?.colliders,walkables:collisionManager?.walkables}))),colliders:collisionManager?.colliders.length,walkables:collisionManager?.walkables.length,zones:zonePhysics};
 return{render,physics,metadata:{sha256:sha256(JSON.stringify(metadata))},actors:characters?{registered:characters.snapshot().registered,configurationValid:characters.validation?.valid}:null,resources:resourceInventory([scene,...builders,zoneManager,collisionManager,characters]),scope:'actual rendered attributes/world matrices/material pixels plus all active collision records; not GPU rendering or character simulation'};
}
