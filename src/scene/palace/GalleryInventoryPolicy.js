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
  'garden/items/14': 'RI-87DE2E82FDF5',
  'garden/items/15': 'RI-09B73001F108',
  'garden/items/16': 'RI-DB7D7CFB0AFA',
  'garden/items/17': 'RI-12444A85424A',
  'garden/items/18': 'RI-A8363464C20C',
  'garden/items/19': 'RI-9C4D84C0C18E',
  'garden/items/20': 'RI-772B9B8AB63B',
  'garden/items/21': 'RI-92BFC7DA5CB0',
  'garden/items/22': 'RI-97F7F553A006',
  'garden/items/23': 'RI-2B882BEB407A',
  'garden/items/24': 'RI-C112A7BE8A39',
  'garden/items/25': 'RI-AEB68F800423',
});

export function validateGalleryInventoryPolicy(policy, { zone, target, kind } = {}) {
  if (policy === undefined) return undefined; // Preserve every existing default.
  const declarationOnly = Object.hasOwn(RUNTIME_INVENTORY_BY_TARGET, target);
  if (!policy || typeof policy !== 'object' || Array.isArray(policy) ||
      Object.keys(policy).sort().join(',') !== (declarationOnly ? 'mode,runtimeInventoryId,target' : 'mode,reviewId,target') ||
      policy.mode !== 'unknown-inventory' || !['axis-courts', 'garden'].includes(zone) ||
      target?.split('/')[0] !== zone || kind !== 'corridor' ||
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
