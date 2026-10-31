import { buildSurveyedPavilion } from './SurveyedPavilion.js';

/** Historical entry point. Evidence selects the geometry; old w/d/ph overrides
 * no longer turn provisional V1 proportions into survey measurements. */
export function buildTirenPavilion(kit,opts={}) {
  return buildSurveyedPavilion(kit,{...opts,pavilionProfile:'tiren'});
}
