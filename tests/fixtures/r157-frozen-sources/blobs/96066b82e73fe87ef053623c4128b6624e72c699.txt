import {CHARACTER_SEAT_VARIANTS} from './CharacterSeatVariants.js';
import { CHARACTER_POSES, CHARACTER_TEMPLATES } from './CharacterKit.js';

const isFemale = templateId => templateId === 'consort-daily' || templateId === 'maid-daily';

/** Geometry follows the actor's route identity, not instantaneous movement.
 * Route pauses intentionally keep hanging arms; fixed posts keep folded hands.
 * This is not a walking/stopping pose blend. */
export function characterGeometryOptionsFor(actor) {
  const options = { seatVariant: actor.behavior?.seatVariant ?? 'standard' };
  if (isFemale(actor.templateId) && (actor.behavior?.basePose ?? 'standing') === 'standing' &&
      actor.placement?.mode === 'path' && actor.placement.pathRef) options.femalePose = 'walking';
  return options;
}

/** Keep legacy keys for omitted/resting options. Validate before cache lookup,
 * so an existing default resource cannot mask an invalid authoring request. */
export function characterResourceKey(templateId, pose, lod, options = {}) {
  if (!Object.hasOwn(CHARACTER_TEMPLATES, templateId)) throw new Error(`Unknown character template: ${templateId}`);
  if (!CHARACTER_POSES.includes(pose)) throw new Error(`Unknown character pose: ${pose}`);
  if (!Number.isInteger(lod) || lod < 0 || lod > 2) throw new Error(`Invalid character LOD: ${lod}`);
  const femalePose = options.femalePose ?? 'resting', seatVariant = options.seatVariant ?? 'standard';
  if (!['resting', 'walking'].includes(femalePose)) throw new Error('Unknown female pose');
  if (femalePose === 'walking' && !isFemale(templateId)) throw new Error('Female walking pose requires a female template');
  if (femalePose === 'walking' && pose !== 'standing') throw new Error('Female walking pose requires standing pose');
  if (!CHARACTER_SEAT_VARIANTS.includes(seatVariant)) throw new Error(`Unknown seat variant: ${seatVariant}`);
  if(seatVariant==='zhonghe-low-foot'&&templateId!=='emperor-ceremonial')throw new Error('Zhonghe seat adaptation is emperor-only');
  if (pose !== 'seated' && seatVariant !== 'standard') throw new Error('A seat variant requires seated pose');
  return `${templateId}|${pose}|${lod}|${seatVariant}${femalePose === 'walking' ? '|femalePose=walking' : ''}`;
}
