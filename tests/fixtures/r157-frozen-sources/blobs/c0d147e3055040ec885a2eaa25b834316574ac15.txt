/** Source-bounded correction for the existing unnamed Fengxian rear hall.
 * The museum text proves nine bays and a single-eave wudian roof, not the
 * retained model dimensions, equal bay widths, facade opening layout or props.
 * Do not reuse the front-hall photograph or front-hall double-eave treatment.
 */
const ORIGINAL = Object.freeze({
  kind: 'hall', x: -182.5, z: 283.4, w: 51.6, d: 20,
  pad: 1, ph: 0.9, colH: 7.36, roof: 'wudian', map: 'hall',
});

export function resolveFengxianRearProfile(zoneId, item, itemIndex) {
  if (zoneId !== 'east-six' || itemIndex !== 54) return null;
  const keys = Object.keys(ORIGINAL);
  if (!item || Reflect.ownKeys(item).length !== keys.length ||
      keys.some(key => !Object.hasOwn(item, key) || item[key] !== ORIGINAL[key])) {
    throw new Error('Fengxian rear profile requires the exact retained east-six/items/54 declaration');
  }
  return {
    id: 'east-six/fengxian-rear', profile: 'fengxian-rear-nine-bays',
    objectId: 'AUX-BF1091B523A8', inventoryId: 'RI-BF1091B523A8',
    binding: 'data/zones/east-six.json#/items/54', canonicalName: '奉先殿后殿',
    x: ORIGINAL.x, z: ORIGINAL.z, w: ORIGINAL.w, d: ORIGINAL.d,
    pad: ORIGINAL.pad, ph: ORIGINAL.ph, colH: ORIGINAL.colH,
    roof: 'wudian', storeys: 1, eaveCount: 1, bays: 9,
    source: 'https://www.dpm.org.cn/explore/building/236430.html',
    sourceScope: 'OFFICIAL_TEXT_NINE_BAYS_SINGLE_EAVE_WUDIAN_ONLY',
    dimensionsStatus: 'RETAINED_MODEL_ENVELOPE_NOT_SURVEYED',
    baySpacingStatus: 'EQUAL_SUBDIVISION_PROVISIONAL',
    interiorStatus: 'EXISTING_GENERIC_INTERIOR_UNVERIFIED',
    facadeStatus: 'EXISTING_GENERIC_CLOSURES_UNVERIFIED',
    photographyDate: null, status: 'VERIFY_PENDING', accepted: false,
    unknowns: [
      'rear-hall facade/window geometry and actual bay-width distribution',
      'rear-hall nine-room layout and shrine inventory',
      'connecting passage geometry and current display/opening state',
      'rear/side photographic comparison and native-browser inspection',
    ],
  };
}

/** Early ZoneBase dispatch only. Returning null leaves every other hall alone.
 * Only bays is overridden. Existing south entrance, single roof, unnamed map,
 * room registration, and UNVERIFIED generic furnishings remain the kit defaults.
 * The bay dependency also changes columns/radii, closure widths, folded leaves,
 * threshold and stair width. This is not a columns-only geometry delta.
 */
export function buildFengxianRearHall(kit, item, itemIndex) {
  const profile = resolveFengxianRearProfile(kit.root.name, item, itemIndex);
  if (!profile) return null;
  const { kind, ...options } = ORIGINAL;
  const built = kit.hall({ ...options, bays: profile.bays });
  built.f.userData.structure = { ...built.f.userData.structure, ...profile };
  return built;
}
