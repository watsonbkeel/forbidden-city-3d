// Narrow evidence-quality fallback, not an empty-room reconstruction.
// These IDs bind the reviewed existing JSON instances, never names or coordinates.
const REVIEW_BY_TARGET = Object.freeze({
  'axis-courts/items/28': 'FC-CA9102BFFB',
  'axis-courts/items/29': 'FC-CA9102BFFB',
  'axis-courts/items/30': 'FC-CA9102BFFB',
  'axis-courts/items/31': 'FC-0D3F161564',
  'axis-courts/items/34': 'FC-B31A272965',
  'axis-courts/items/35': 'FC-B31A272965',
  'axis-courts/items/36': 'FC-B31A272965',
  'axis-courts/items/37': 'FC-86FF7FC2AB',
});

// Declaration identity only: these unnamed runtime records are not verified
// bindings to the candidate named annexes in the historical review crosswalk.
const RUNTIME_INVENTORY_BY_TARGET = Object.freeze({
  'axis-courts/items/26': 'RI-1DCBD55D5B90',
  'axis-courts/items/27': 'RI-BDA7502B3BD6',
  'axis-courts/items/32': 'RI-2555B6BDA0A9',
  'axis-courts/items/33': 'RI-7D8EE589FEA1',
});

export function validateGalleryInventoryPolicy(policy, { zone, target, kind } = {}) {
  if (policy === undefined) return undefined; // Preserve every existing default.
  const declarationOnly = Object.hasOwn(RUNTIME_INVENTORY_BY_TARGET, target);
  if (!policy || typeof policy !== 'object' || Array.isArray(policy) ||
      Object.keys(policy).sort().join(',') !== (declarationOnly ? 'mode,runtimeInventoryId,target' : 'mode,reviewId,target') ||
      policy.mode !== 'unknown-inventory' || zone !== 'axis-courts' || kind !== 'corridor' ||
      policy.target !== target || (declarationOnly
        ? policy.runtimeInventoryId !== RUNTIME_INVENTORY_BY_TARGET[target]
        : !Object.hasOwn(REVIEW_BY_TARGET, target) || policy.reviewId !== REVIEW_BY_TARGET[target])) {
    throw new Error('Invalid explicit gallery inventory policy or target');
  }
  return Object.freeze({ ...policy });
}

export function galleryRoomEvidence(policy) {
  return {
    furnishingPolicy: { ...policy },
    ...(Object.hasOwn(policy, 'runtimeInventoryId') ? {
      namedRoomIdentity: null,
      boundaryValidation: 'NOT_VALIDATED',
      navigationValidation: 'NOT_VALIDATED',
    } : {}),
    inventory: {
      status: 'UNKNOWN', accepted: false, knownEmpty: false, displayDate: null,
      missingEvidence: ['ROOM_OVERVIEW', 'CURRENT_INVENTORY', 'PLACEMENT', 'DISPLAY_DATE'],
    },
    layout: {
      status: 'UNVERIFIED', basis: 'INHERITED_CANDIDATE_BOUNDS', historicalRoomIdentity: null,
      presetUse: 'UNVERIFIED',
    },
  };
}
