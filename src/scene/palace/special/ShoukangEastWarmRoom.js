import * as THREE from 'three';

const SOURCE = Object.freeze({
  url: 'https://img.dpm.org.cn/Uploads/File/2024/09/25/u66f37561e9b76.pdf#page=4',
  publicationYear: 2024, printedPage: 142, pdfPage: 4, photographCredit: '文明',
  photographSize: Object.freeze([399, 381]), photographyDate: null, restorationCampaign: null,
  captionSummary: '寿康宫东暖阁内景；北壁木龛上装饰有毗卢帽',
});

// Every number below is a reversible fit inside the retained R44 east bay.
// The photograph establishes broad visible forms, not surveyed dimensions,
// hidden construction, an inventory, or the precise ornamental profile.
export const SHOUKANG_EAST_WHITE_FIT = Object.freeze({
  sideClearance: .32, northWallZ: 8.7, backZ: 8.50, backDepth: .12,
  baseDepth: 1.32, baseHeight: .44, baseCapHeight: .12, baseZ: 7.90, baseCapZ: 7.87, baseCapDepthExtra: .06,
  frameWidth: 4.20, frameTop: 3.45, postWidth: .18, postDepth: .70,
  postZ: 8.13, railZ: 7.95, railDepth: .34, railHeight: .08,
  railHeights: Object.freeze([2.65, 3.03, 3.43]),
  registerHeights: Object.freeze([2.84, 3.25]), registerHeight: .30, registerDepth: .38, registerZ: 8.25,
  stileWidth: .10, stileHeight: .78, stileOffsetX: .70, stileCenterY: 3.04,
  crownBase: 3.45, crownHeight: .80, crownDepth: .20, crownFrontZ: 7.78,
  crownOutline: Object.freeze([[-.5,0],[-.5,.64],[-.43,.82],[-.35,.72],[-.27,.91],[-.18,.76],[-.08,.94],[0,1],[.08,.94],[.18,.76],[.27,.91],[.35,.72],[.43,.82],[.5,.64],[.5,0]].map(Object.freeze)),
});

// Broad source-supported display fields only. Colors and roughness are reversible
// viewing fits, not measured historic pigments, finish recipes or metallic content.
export const SHOUKANG_EAST_MATERIAL_FIT = Object.freeze({
  timber: Object.freeze({ color: 0x5a4a34, roughness: .84, metalness: 0 }),
  recess: Object.freeze({ color: 0x282d27, roughness: .92, metalness: 0 }),
  gold_field: Object.freeze({ color: 0xb99a4f, roughness: .74, metalness: .18 }),
  base_field: Object.freeze({ color: 0x85754c, roughness: .88, metalness: 0 }),
});

/** Add only the source-bounded partial east north-wall framework. Never replaces the hall. */
export function buildShoukangEastWarmRoom(kit, item, f, hall) {
  const p = SHOUKANG_EAST_WHITE_FIT, axes = hall?.bayAxes;
  if (item.name !== '寿康宫' || item.structure !== 'shoukang-front-hall' ||
      !Array.isArray(axes) || axes.length !== 6 || !axes.every(Number.isFinite) || Math.abs(axes[0] + 13.45) > 1e-7 ||
      Math.abs(axes[1] + 8.224820143884892) > 1e-7 || item.d / 2 !== p.northWallZ ||
      hall.fit?.warmPassageWidth !== 2.6 || hall.fit?.warmPassageZ !== -1.2) {
    throw new Error('Shoukang east framework requires the retained single-hall east bay');
  }
  const cx = (axes[0] + axes[1]) / 2, width = axes[1] - axes[0] - 2 * p.sideClearance;
  const floor = item.ph, baseTop = p.baseHeight + p.baseCapHeight;
  const metadata = {
    role: 'shoukang-east-north-framework', stage: 'PARTIAL_SOURCE_BOUNDED_BASE_MATERIALS_NOT_FINISHED_RESTORATION',
    whiteModelCheckpoint: '8f3f86736fa59dc260eb54cf776882ec15a40a5b',
    materialStatus: 'REVERSIBLE_DISPLAY_PALETTE_NOT_COLORIMETRIC_OR_MATERIAL_SURVEY',
    materialFit: SHOUKANG_EAST_MATERIAL_FIT,
    dimensionStatus: 'REVERSIBLE_MODEL_FIT_NOT_SURVEYED', source: SOURCE,
    currentInventoryVerified: false, fit: p,
    fittedBounds: { minX: cx - width / 2, maxX: cx + width / 2, northWallZ: p.northWallZ },
    separationFromCentralDisplay: '2024_PUBLICATION_PHOTO_NOT_THE_2018_CENTRAL_SEAT_SCREEN_SOURCE',
    withheld: ['Buddhas and ritual objects', 'unreadable carving and inscriptions', 'unseen side and rear construction', 'precise historical dimensions and crown contour'],
  };
  const group = new THREE.Group(); group.name = metadata.role;
  group.userData = { ...metadata, structure: { id: 'outer-west/shoukang-east-north-framework', ...metadata } };
  f.add(group);
  const makeMaterial = key => new THREE.MeshStandardMaterial({ name: `r53_shoukang_east_${key}`, ...SHOUKANG_EAST_MATERIAL_FIT[key] });
  const material = makeMaterial('timber'), recessMaterial = makeMaterial('recess');
  const crownMaterial = makeMaterial('gold_field'), baseMaterial = makeMaterial('base_field');
  kit.owned.push(material, recessMaterial, crownMaterial, baseMaterial);
  const colliderStart = kit.colliders.length;
  function box(role, w, h, d, x, y, z, mat = material) {
    const m = kit.mesh(group, new THREE.BoxGeometry(w, h, d), mat, x, floor + y, z);
    m.name = role; m.userData = { role, dimensionStatus: metadata.dimensionStatus, solid: true };
    kit.col(f, x-w/2, floor+y-h/2, z-d/2, x+w/2, floor+y+h/2, z+d/2);
    return m;
  }
  // The front plinth is the visible photo-supported base. Its unrecorded depth
  // is merely the minimum fitted support for the framework, not a restored altar.
  box('shoukang-east-visible-front-base', width, p.baseHeight, p.baseDepth, cx, p.baseHeight/2, p.baseZ, baseMaterial);
  box('shoukang-east-base-cap-fit', width, p.baseCapHeight, p.baseDepth + p.baseCapDepthExtra, cx, p.baseHeight + p.baseCapHeight/2, p.baseCapZ, baseMaterial);
  box('shoukang-east-recess-back', p.frameWidth, p.frameTop-baseTop, p.backDepth, cx, (baseTop+p.frameTop)/2, p.backZ, recessMaterial);
  for (const sign of [-1, 1]) {
    box('shoukang-east-niche-upright', p.postWidth, p.frameTop-baseTop, p.postDepth,
      cx+sign*(p.frameWidth-p.postWidth)/2, (baseTop+p.frameTop)/2, p.postZ);
  }
  for (const y of p.railHeights) box('shoukang-east-full-width-rail', p.frameWidth, p.railHeight, p.railDepth, cx, y, p.railZ);
  for (const y of p.registerHeights) box('shoukang-east-horizontal-register', p.frameWidth-2*p.postWidth, p.registerHeight, p.registerDepth, cx, y, p.registerZ, recessMaterial);
  for (const sign of [-1, 1]) box('shoukang-east-upper-register-stile', p.stileWidth, p.stileHeight, p.railDepth, cx+sign*p.stileOffsetX, p.stileCenterY, p.railZ);
  // Coarse five-rise outline with a plain gold-toned field only. No tracery,
  // invented text, figures, or literal ornamental edge is attempted.
  const outline = p.crownOutline;
  const shape = new THREE.Shape(); outline.forEach(([x,y],i) => shape[i ? 'lineTo' : 'moveTo'](x*width, y*p.crownHeight)); shape.closePath();
  const crown = kit.mesh(group, new THREE.ExtrudeGeometry(shape, { depth: p.crownDepth, bevelEnabled: false, steps: 1 }), crownMaterial, cx, floor+p.crownBase, p.crownFrontZ);
  crown.name = 'shoukang-east-crown-type-outline'; crown.userData = { role: crown.name, dimensionStatus: metadata.dimensionStatus, solid: false, detailStatus: 'TYPE_OUTLINE_ONLY_NOT_TRACED_ORNAMENT' };
  group.userData.colliderRange = { start: colliderStart, end: kit.colliders.length };
  return group;
}
