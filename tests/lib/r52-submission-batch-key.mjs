import {characterGeometryOptionsFor} from '../../src/scene/characters/CharacterGeometryOptions.js';
// Test evidence must address the exact live production batch, including the
// original seated and female-route variants when they appear as occluders.
export function submissionBatchKey(actor){
 const options=characterGeometryOptionsFor(actor);
 return [actor.templateId,actor.pose,actor.lod,actor.zoneRef,options.seatVariant].join('|')+(options.femalePose?'|femalePose='+options.femalePose:'');
}
