import {RGBAFormat,UnsignedByteType} from 'three';
/** Retained idle GPU/CPU resources, not a cache of disposed objects. This budget
 * includes geometry arrays and owned RGBA/mip storage estimates, NOT JS heap or
 * the pre-existing initial prebuilt/active/shared-library allocations. */
export function zoneRetainedResourceCost(entry,library){
 const kit=entry.builder?.kit,geometries=new Set(),textures=new Set(kit?.ownedTextures??[]),buffers=new Set();
 const material=m=>{if(m)for(const value of Object.values(m))if(value?.isTexture&&!library.owns?.(value))textures.add(value);};
 const visit=root=>root?.traverse?.(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of(Array.isArray(o.material)?o.material:[o.material]))material(m);});
 visit(entry.data.group);visit(kit?.root);
 for(const p of kit?.plaques??[]){visit(p.mesh);visit(p.frame);}
 for(const m of kit?.owned??[])material(m);
 let geometryBytes=0,geometryAttributeBytes=0,textureBytes=0;
 for(const g of geometries){const arrays=[...Object.values(g.attributes),...Object.values(g.morphAttributes??{}).flat(),...(g.index?[g.index]:[])];for(const a of arrays){geometryAttributeBytes+=a.array.byteLength;buffers.add(a.array.buffer);}}
 // Typed-array views retain their whole backing buffer, even when the GPU only
 // uploads a subrange. Count each CPU allocation once, not just view lengths.
 for(const buffer of buffers)geometryBytes+=buffer.byteLength;
 for(const t of textures){if(library.owns?.(t))continue;let w=t.image?.width,h=t.image?.height;const rgba8=t.format===RGBAFormat&&t.type===UnsignedByteType&&(!t.internalFormat)&&!t.mipmaps?.length&&(t.isCanvasTexture||(t.isDataTexture&&t.image?.data instanceof Uint8Array&&t.image.data.byteLength===w*h*4));if(!rgba8||!Number.isSafeInteger(w)||!Number.isSafeInteger(h)||w<=0||h<=0)return{cacheable:false,reason:'unknown-texture-size',geometryBytes,geometryAttributeBytes,textureBytes,accountedBytes:Infinity,geometries:geometries.size,textures:textures.size};do{textureBytes+=w*h*4;if(!t.generateMipmaps||(w===1&&h===1))break;w=Math.max(1,Math.floor(w/2));h=Math.max(1,Math.floor(h/2));}while(true);}
 const accountedBytes=geometryBytes+textureBytes;return{cacheable:Number.isSafeInteger(accountedBytes),geometryBytes,geometryAttributeBytes,textureBytes,accountedBytes,geometries:geometries.size,textures:textures.size};
}
export class InactiveZoneCache{
 constructor({maxEntries=2,maxBytes=32*1024*1024,ttlMs=120000,now=()=>performance.now()}={}){
  if(!Number.isInteger(maxEntries)||maxEntries<0||!Number.isFinite(maxBytes)||maxBytes<0||!Number.isFinite(ttlMs)||ttlMs<0||typeof now!=='function')throw new TypeError('Invalid inactive zone budget');
  this.maxEntries=maxEntries;this.maxBytes=maxBytes;this.ttlMs=ttlMs;this.now=now;this.entries=new Map();this.bytes=0;
 }
 release(id){const row=this.entries.get(id);if(!row)return false;this.entries.delete(id);this.bytes-=row.entry.cost.accountedBytes;row.entry.builder.dispose();return true;}
 prune(){const now=this.now();for(const[id,row]of this.entries)if(now-row.at>=this.ttlMs)this.release(id);}
 has(id,config,quality){this.prune();const row=this.entries.get(id);if(!row)return false;if(row.entry.config!==config||row.entry.detailQuality!==quality){this.release(id);return false;}return true;}
 take(id,config,quality){if(!this.has(id,config,quality))return null;const {entry}=this.entries.get(id);this.entries.delete(id);this.bytes-=entry.cost.accountedBytes;return entry;}
 put(id,entry,pending=new Set()){
  this.prune();if(this.entries.has(id))throw new Error('Duplicate retained zone owner');
  const bytes=entry.cost?.accountedBytes;
  if(!this.maxEntries||!Number.isFinite(bytes)||bytes<0||bytes>this.maxBytes||entry.cost.cacheable===false){entry.builder.dispose();return false;}
  const candidates=[...this.entries.keys()].filter(key=>!pending.has(key)).sort((a,b)=>this.entries.get(a).used-this.entries.get(b).used),victims=[];
  let size=this.entries.size,total=this.bytes;
  while(size>=this.maxEntries||total+bytes>this.maxBytes){
    const victim=candidates.shift();
    if(victim===undefined||(entry.lastUsedAt??this.now())<this.entries.get(victim).used){entry.builder.dispose();return false;}
    victims.push(victim);size--;total-=this.entries.get(victim).entry.cost.accountedBytes;
  }
  // Admission is settled before releasing anything: a later pinned/newer owner
  // cannot cause a rejected entry to have already evicted useful resources.
  for(const victim of victims)this.release(victim);
  this.entries.set(id,{entry,at:this.now(),used:entry.lastUsedAt??this.now()});this.bytes+=bytes;return true;
 }
 clear(){for(const id of [...this.entries.keys()])this.release(id);}
}
