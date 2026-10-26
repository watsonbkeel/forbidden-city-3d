/** Model-interest latches only: never owns logical actors, route clocks or
 * placement. Metres in the ground XZ plane; all thresholds are engineering
 * choices, not historical/geometric survey claims. */
export const CHARACTER_INTEREST=Object.freeze({ground:Object.freeze({displayIn:40,displayOut:45,prepareIn:60,releaseOut:70}),flight:Object.freeze({displayIn:120,displayOut:140,prepareIn:180,releaseOut:220})});
export class CharacterResidency{
 constructor(){this.states=new Map();}
 update(actors,view){
  const ranges=CHARACTER_INTEREST[view?.mode==='flight'?'flight':'ground'],origin=view?.position,active=new Set();
  for(const actor of actors){
   active.add(actor.id);const previous=this.states.get(actor.id),position=actor.position;
   const distance=origin&&Number.isFinite(origin.x)&&Number.isFinite(origin.z)&&Array.isArray(position)&&Number.isFinite(position[0])&&Number.isFinite(position[2])?Math.hypot(position[0]-origin.x,position[2]-origin.z):Infinity;
   this.states.set(actor.id,{distance,display:distance<=(previous?.display?ranges.displayOut:ranges.displayIn),resident:distance<=(previous?.resident?ranges.releaseOut:ranges.prepareIn)});
  }
  for(const id of this.states.keys())if(!active.has(id))this.states.delete(id);
  return this.states;
 }
 clear(){this.states.clear();}
}
