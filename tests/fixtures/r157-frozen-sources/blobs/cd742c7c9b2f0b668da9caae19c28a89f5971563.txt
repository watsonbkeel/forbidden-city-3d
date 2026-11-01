import profile from '../../../../data/architecture/kunning.json' with { type: 'json' };

const freeze = value => {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

/** Shared explicit model-fit coordinates. No value in this file is a survey. */
export const KUNNING_PROFILE = freeze(profile);
export const KUNNING_CONTRACT = freeze({
  profileId: profile.profileId,
  profileRevision: profile.revision,
  profileHash: profile.profileHash,
  ownership: 'furniture-only',
});
export const KUNNING_INTERIOR_FRAME = freeze({
  x: profile.frameExpectation.x, z: profile.frameExpectation.z,
  rot: profile.frameExpectation.rot,
  w: profile.modelEnvelope.width, d: profile.modelEnvelope.depth,
});

/** Named lookup, deliberately independent of uniform spacing or envelope/9. */
export function kunningBay(id, source = KUNNING_PROFILE) {
  const bay = source.outerBays.find(b => b.id === id);
  if (!bay) throw new Error(`Unknown Kunning bay: ${id}`);
  const [a, b] = bay.lineIndices;
  const minX = source.outerXLines[a], maxX = source.outerXLines[b];
  if (!Number.isFinite(minX) || !(maxX > minX)) throw new Error(`Invalid Kunning bay interval: ${id}`);
  return { ...bay, minX, maxX, centerX: (minX + maxX) / 2 };
}

/** Bind the existing Layout/plinth interface, without resetting builder offsets. */
export function bindKunningProfile(data, floorY, source = KUNNING_PROFILE) {
  const f = source.frameExpectation, e = source.modelEnvelope;
  const rotation = data.rotation ?? data.rot ?? 0;
  if (!Number.isFinite(data.position?.x) || !Number.isFinite(data.position?.z) ||
      !Number.isFinite(rotation) || Math.abs(data.position.x - f.x) > 1e-7 ||
      Math.abs(data.position.z - f.z) > 1e-7 || Math.abs(rotation - f.rot) > 1e-7) {
    throw new Error('Kunning frame drift: preserve the existing world anchor and rotation');
  }
  if (!Number.isFinite(floorY) || Math.abs(floorY - f.floorY) > 1e-7) throw new Error('Kunning floor interface drift');
  if (data.dimensions.width !== e.width || data.dimensions.depth !== e.depth || data.dimensions.height !== e.height) {
    throw new Error('Kunning inherited provisional envelope drift');
  }
  return {
    profile: source, floorY,
    point: ([x, y, z]) => [data.position.x + x, floorY + y, data.position.z + z],
    bounds: ({ min, max }) => ({
      min: [data.position.x + min[0], floorY + min[1], data.position.z + min[2]],
      max: [data.position.x + max[0], floorY + max[1], data.position.z + max[2]],
    }),
  };
}

export function kunningNavigationPoint(id, data, floorY = KUNNING_PROFILE.frameExpectation.floorY) {
  const point = KUNNING_PROFILE.navigation.points[id];
  if (!point) throw new Error(`Unknown Kunning navigation point: ${id}`);
  return bindKunningProfile(data, floorY).point(point);
}
