import { createCharacterGeometry, createCharacterGeometrySteps } from './CharacterKit.js';
import { characterResourceKey } from './CharacterGeometryOptions.js';
/** Bounded shared immutable geometry cache. A released entry stays cached until dispose. */
export class CharacterResourcePool {
 constructor({maxEntries=63}={}){this.maxEntries=maxEntries;this.entries=new Map();this.disposed=false;}
 acquire(templateId,pose='standing',lod=0,options={}){
  if(this.disposed)throw new Error('CharacterResourcePool is disposed');
  const key=characterResourceKey(templateId,pose,lod,options);let entry=this.entries.get(key);
  if(!entry){if(this.entries.size>=this.maxEntries){const idle=[...this.entries].find(([,e])=>e.references===0);if(!idle)throw new Error('Character resource cache capacity reached with all assets referenced');idle[1].geometry.dispose();this.entries.delete(idle[0]);}entry={key,geometry:createCharacterGeometry(templateId,pose,lod,options),references:0};this.entries.set(key,entry);}
  entry.references++;return {key,geometry:entry.geometry};
 }
 /** Prepare without acquiring a live rendering reference. No half-built entry
  * is published; cancellation propagates into the authoring generator. */
 *prepare(templateId,pose='standing',lod=0,options={}){
  if(this.disposed)throw new Error('CharacterResourcePool is disposed');
  const key=characterResourceKey(templateId,pose,lod,options);
  if(this.entries.has(key))return this.entries.get(key);
  const geometry=yield* createCharacterGeometrySteps(templateId,pose,lod,options);
  if(this.disposed){geometry.dispose();throw new Error('CharacterResourcePool disposed during preparation');}
  if(this.entries.has(key)){geometry.dispose();return this.entries.get(key);}
  if(this.entries.size>=this.maxEntries){const idle=[...this.entries].find(([,e])=>e.references===0);if(!idle){geometry.dispose();throw new Error('Character resource cache capacity reached with all assets referenced');}idle[1].geometry.dispose();this.entries.delete(idle[0]);}
  const entry={key,geometry,references:0};this.entries.set(key,entry);return entry;
 }
 release(key){const entry=this.entries.get(key);if(entry&&entry.references>0)entry.references--;}
 stats(){let references=0,geometryBytes=0;for(const e of this.entries.values()){references+=e.references;for(const a of Object.values(e.geometry.attributes))geometryBytes+=a.array.byteLength;geometryBytes+=e.geometry.index?.array.byteLength??0;}return {entries:this.entries.size,geometries:this.entries.size,references,geometryBytes,textureBytes:0};}
 dispose(){if(this.disposed)return;for(const e of this.entries.values())e.geometry.dispose();this.entries.clear();this.disposed=true;}
}
