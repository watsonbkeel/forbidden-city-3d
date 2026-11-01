import * as THREE from 'three';

// Actual decoded aligned asset, not surveyed pillar dimensions. Forty-eight
// 0.25 m high component-clipped envelopes, after the asset's baked alignment
// and before the loader frame. Never use the complete gold material bounds.
export const HUANGJI_COLUMN_SEGMENTS = Object.freeze([
  Object.freeze(["columnFrontEast",-4.467000008,0,5.832999897,-3.332731485,0.25,6.967268181]),
  Object.freeze(["columnFrontWest",3.332731724,0,5.832999897,4.467000008,0.25,6.967268181]),
  Object.freeze(["columnRearEast",-4.467000008,0,10.533125114,-3.332731485,0.25,11.666848373]),
  Object.freeze(["columnRearWest",3.332731724,0,10.533125114,4.467000008,0.25,11.666848373]),
  Object.freeze(["columnFrontEast",-4.336196237,0.25,5.963839446,-3.463827334,0.5,6.836208348]),
  Object.freeze(["columnFrontWest",3.463486165,0.25,5.963839446,4.336394601,0.5,6.836208348]),
  Object.freeze(["columnRearEast",-4.336196237,0.25,10.663816352,-3.463827334,0.5,11.536184793]),
  Object.freeze(["columnRearWest",3.463486165,0.25,10.663816352,4.336394601,0.5,11.536184793]),
  Object.freeze(["columnFrontEast",-4.335659609,0.5,5.964376089,-3.281021833,0.75,6.835671721]),
  Object.freeze(["columnFrontWest",3.464040696,0.5,5.964376089,4.519200325,0.75,6.835671721]),
  Object.freeze(["columnRearEast",-4.335659609,0.5,10.66435298,-3.281021833,0.75,11.535648165]),
  Object.freeze(["columnRearWest",3.464040696,0.5,10.66435298,4.519200325,0.75,11.535648165]),
  Object.freeze(["columnFrontEast",-4.335122981,0.75,5.964912732,-3.327832725,1,6.954730313]),
  Object.freeze(["columnFrontWest",3.464595228,0.75,5.964912732,4.47226422,1,6.954730313]),
  Object.freeze(["columnRearEast",-4.335122981,0.75,10.664889607,-3.327832725,1,11.654706766]),
  Object.freeze(["columnRearWest",3.464595228,0.75,10.664889607,4.47226422,1,11.654706766]),
  Object.freeze(["columnFrontEast",-4.334586353,1,5.965449375,-3.465437264,1.25,6.992816162]),
  Object.freeze(["columnFrontWest",3.46514976,1,5.965449375,4.334784718,1.25,6.992816162]),
  Object.freeze(["columnRearEast",-4.334586353,1,10.665426235,-3.465437264,1.25,11.692793083]),
  Object.freeze(["columnRearWest",3.46514976,1,10.665426235,4.334784718,1.25,11.692793083]),
  Object.freeze(["columnFrontEast",-4.482725555,1.25,5.965986018,-3.465973907,1.5,6.970620143]),
  Object.freeze(["columnFrontWest",3.317462972,1.25,5.965986018,4.33424809,1.5,6.970620143]),
  Object.freeze(["columnRearEast",-4.482725555,1.25,10.665962863,-3.465973907,1.5,11.670596227]),
  Object.freeze(["columnRearWest",3.317462972,1.25,10.665962863,4.33424809,1.5,11.670596227]),
  Object.freeze(["columnFrontEast",-4.542412758,1.5,5.966522661,-3.46651055,1.75,6.83352521]),
  Object.freeze(["columnFrontWest",3.257252216,1.5,5.966522661,4.333711462,1.75,6.83352521]),
  Object.freeze(["columnRearEast",-4.542412758,1.5,10.666499491,-3.46651055,1.75,11.533501654]),
  Object.freeze(["columnRearWest",3.257252216,1.5,10.666499491,4.333711462,1.75,11.533501654]),
  Object.freeze(["columnFrontEast",-4.53317094,1.75,5.831187806,-3.467047193,2,6.832988582]),
  Object.freeze(["columnFrontWest",3.267051457,1.75,5.831187806,4.333174834,2,6.832988582]),
  Object.freeze(["columnRearEast",-4.53317094,1.75,10.531196947,-3.467047193,2,11.532965026]),
  Object.freeze(["columnRearWest",3.267051457,1.75,10.531196947,4.333174834,2,11.532965026]),
  Object.freeze(["columnFrontEast",-4.380217607,2,5.771001053,-3.467583836,2.25,6.832451954]),
  Object.freeze(["columnFrontWest",3.420004625,2,5.771001053,4.332638207,2.25,6.832451954]),
  Object.freeze(["columnRearEast",-4.380217607,2,10.47097702,-3.467583836,2.25,11.532428398]),
  Object.freeze(["columnRearWest",3.420004625,2,10.47097702,4.332638207,2.25,11.532428398]),
  Object.freeze(["columnFrontEast",-4.331903215,2.25,5.779821288,-3.399702649,2.5,6.831915326]),
  Object.freeze(["columnFrontWest",3.467922418,2.25,5.779821288,4.40051927,2.5,6.831915326]),
  Object.freeze(["columnRearEast",-4.331903215,2.25,10.479797797,-3.399702649,2.5,11.531891771]),
  Object.freeze(["columnRearWest",3.467922418,2.25,10.479797797,4.40051927,2.5,11.531891771]),
  Object.freeze(["columnFrontEast",-4.331366587,2.5,5.915223436,-3.310118577,2.75,6.831378699]),
  Object.freeze(["columnFrontWest",3.468476949,2.5,5.915223436,4.489629602,2.75,6.831378699]),
  Object.freeze(["columnRearEast",-4.331366587,2.5,10.615199696,-3.310118577,2.75,11.531355143]),
  Object.freeze(["columnRearWest",3.468476949,2.5,10.615199696,4.489629602,2.75,11.531355143]),
  Object.freeze(["columnFrontEast",-4.330829959,2.75,5.969205876,-3.309449196,3,6.879192011]),
  Object.freeze(["columnFrontWest",3.469031481,2.75,5.969205876,4.490215302,3,6.879192011]),
  Object.freeze(["columnRearEast",-4.330829959,2.75,10.669182629,-3.309449196,3,11.579168455]),
  Object.freeze(["columnRearWest",3.469031481,2.75,10.669182629,4.490215302,3,11.579168455]),
]);

export function huangjiColumnSafetyBoxes(frame) {
  frame.updateMatrixWorld(true);
  return HUANGJI_COLUMN_SEGMENTS.map(([component,x0,y0,z0,x1,y1,z1]) => {
    // Production body ends 5 cm below the eye. A local downward safety margin
    // prevents the top of the player's head crossing a projecting carved ring.
    const box = new THREE.Box3(new THREE.Vector3(x0,Math.max(0,y0-.05),z0),new THREE.Vector3(x1,y1,z1));
    return box.applyMatrix4(frame.matrixWorld);
  });
}
