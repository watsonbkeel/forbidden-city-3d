import {fitCanopyToMainRoof} from './CanopyRoofSurfaceJoint.js';
import {fitRegisteredNameboard} from './FittedNameboardMount.js';
import * as THREE from 'three';

const page = n => `https://www.dpm.org.cn/explore/building/${n}.html`;
const HARD_GABLE_PAPER = 'https://www.dpm.org.cn/Uploads/File/2020/11/12/u5facb56c07c8f.pdf';
const FIT = 'REVERSIBLE_MODEL_FIT_NOT_SURVEYED';
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };

/** Exact retained catalog anchors, not name-only rules for every residence.
 * +X is west, +Z is north. Source topology does not measure the coordinates. */
export const REMAINING_RESIDENTIAL_PROFILES = freeze([
  { key: 'chengqian-front', catalogId: 'place-east-six-42d58b9b0d', zone: 'east-six', name: '承乾宫', x: -93.6, z: 381.8, w: 27.7, d: 14.5, mode: 'replace', source: page(236438), shell: { bays: 5 }, window: 'double-cross-four-diamond', ceiling: 'paired-phoenix', inscription: '德成柔顺' },
  { key: 'jingyang-front', catalogId: 'place-east-six-9da5992a78', zone: 'east-six', name: '景阳宫', x: -149.5, z: 432.2, w: 20.7, d: 14.4, mode: 'replace', source: page(236511), shell: { bays: 3 }, window: 'rectangular-glazing', ceiling: 'paired-cranes', inscription: '柔嘉肃敬' },
  { key: 'yongshou-front', catalogId: 'place-west-six-62bf56b1f3', zone: 'west-six', name: '永寿宫', x: 94.9, z: 331, w: 27.1, d: 13.8, mode: 'replace', source: page(236450), shell: { bays: 5, backDoor: true }, window: 'double-cross-four-diamond', inscription: '令仪淑德' },
  { key: 'yongshou-rear', retainedColumnRadiusFit: .262, catalogId: 'place-west-six-2b3dc8fa73', zone: 'west-six', name: '永寿宫后殿', x: 95, z: 349.2, w: 26.2, d: 12.9, mode: 'replace', source: page(236450), roofSource: HARD_GABLE_PAPER, roofSourcePage: 135, shell: { bays: 5, roof: 'gable', hardGableEnd: true, brackets: false } },
  { key: 'xianfu-front', catalogId: 'place-west-six-99f5aa211a', zone: 'west-six', name: '咸福宫', x: 149.8, z: 430.3, w: 20.5, d: 13.8, mode: 'replace', source: page(236507), shell: { bays: 3, backDoor: true }, window: 'sill-lattice', rearSolid: true, ceiling: 'coffer-grid' },
  { key: 'tihe-through-hall', catalogId: 'place-west-six-c08ecd0452', zone: 'west-six', name: '翊坤宫后殿', x: 94, z: 401.5, w: 26.2, d: 12.9, mode: 'replace', source: page(236529), identityMapping: 'Existing 翊坤宫后殿 catalog anchor and 体和殿 plaque; rear of 翊坤宫, south of 储秀宫. Coordinates remain model fits.', shell: { bays: 5, roof: 'gable', hardGableEnd: true, brackets: false, backDoor: true }, window: 'stepped-glazed-window', rearInset: 2.2, boundaries: [{ bay: 2, type: 'partition-door' }, { bay: 3, type: 'partition-door' }], teaSetting: true },
  { key: 'taiji-front', catalogId: 'place-west-six-bbdb208a58', zone: 'west-six', name: '太极殿', x: 150.2, z: 329.9, w: 27.1, d: 13.8, mode: 'replace', source: page(236475), shell: { bays: 5, frontEnclosureInset: 1.6 }, window: 'stepped-glazed-window', rearInset: 2.2, rearAccessSteps: true, moveRetainedThrone: 2.2, ceiling: 'five-bats-longevity', ceilingState: 'LATE_QING_EARLY_REPUBLIC_PLASTER_CEILING_DESCRIBED_BY_MUSEUM', boundaries: [{ bay: 2, type: 'railing-cover', sideMapping: 'UNVERIFIED_MODEL_ASSIGNMENT_NOT_SOURCE_DIRECTION' }, { bay: 3, type: 'floor-openwork-cover', sideMapping: 'UNVERIFIED_MODEL_ASSIGNMENT_NOT_SOURCE_DIRECTION' }] },
  { key: 'tiyuan-through-stage', catalogId: 'place-west-six-5ca8837bae', zone: 'west-six', name: '太极殿后殿', x: 150.1, z: 348.2, w: 26.2, d: 12.9, mode: 'replace', source: page(236544), identityMapping: 'Existing 太极殿后殿 catalog anchor and 体元殿 plaque; between 太极殿 and 长春宫. Model coordinates are not a survey.', shell: { bays: 5, roof: 'gable', hardGableEnd: true, brackets: false, backDoor: true }, window: 'stepped-glazed-window', boundaries: [{ bay: 1, type: 'open-floral-cover', openingWidth: 6.4 }, { bay: 2, type: 'open-floral-cover', openingWidth: 6.4 }, { bay: 3, type: 'open-floral-cover', openingWidth: 6.4 }, { bay: 4, type: 'partition-door' }], northStage: true },
  { key: 'changchun-rear', catalogId: 'place-west-six-93effbb0b8', zone: 'west-six', name: '长春宫后殿', x: 149.8, z: 398.5, w: 26.2, d: 12.9, mode: 'replace', source: page(236436), roofSource: HARD_GABLE_PAPER, roofSourcePage: 135, identityMapping: 'Existing 长春宫后殿 anchor is the catalog model fit for 怡情书史; no front-hall furnishings transferred.', shell: { bays: 5, roof: 'gable', hardGableEnd: true, brackets: false, plaqueText: '怡情书史' } },
  { key: 'chonghua-middle-name-fit', catalogId: 'place-west-six-dc1832baf2', zone: 'west-six', name: '重华宫', x: 118.9, z: 498.3, w: 21.5, d: 8.6, mode: 'replace', source: page(236506), identityMapping: 'CATALOG_NAME_FIT: same-name middle-court main hall only; retained catalog anchor has not been surveyed against the three-court complex. Not 崇敬殿/乐善堂.', shell: { bays: 5, roof: 'gable', hardGableEnd: true, brackets: false, frontSteps: false }, fitRetainedThroneWidth: 3.7, window: 'stepped-glazed-window', boundaries: [{ bay: 2, type: 'gourd-floor-cover', sideMapping: 'SOURCE_EAST_REPLACED_1891_GOURD_COVER' }, { bay: 3, type: 'partition-door', sideMapping: 'SOURCE_WEST_PARTITION_RETAINED' }], frontBaoxia: true },
  { key: 'yangxin-caisson-augmentation', catalogId: 'place-west-six-17d883bce6', zone: 'west-six', name: '养心殿', x: 108.6, z: 277.5, w: 36, d: 12, mode: 'augment', source: page(236442), photoSource: 'https://img.dpm.org.cn/Uploads/image/2026/04/30/yxd-BZJjHldgP313.jpg', caisson: true, frontAssembly: true, facadeSource: 'https://www.dpm.org.cn/Uploads/wenhua/E44/E44c.html', planSource: 'https://img.dpm.org.cn/Uploads/File/2022/01/14/u61e0e7fdd6c3f.pdf' },
  { key: 'yanxi-ruin-reviewed-retained', catalogId: 'place-east-six-1400b5fc62', zone: 'east-six', name: '延禧宫', x: -148.2, z: 324.9, w: 16.3, d: 11.7, mode: 'augment', source: page(236535), reviewedRetained: true, requiredStructure: 'yanxi-ruin' },

]);

// UV helpers may replace a BoxGeometry with a plain BufferGeometry. Shape
// decisions use actual vertices, never the optional constructor parameters.
function geometrySize(geometry) { geometry.computeBoundingBox(); return geometry.boundingBox.getSize(new THREE.Vector3()); }
const tag = (o, role, data = {}) => { o.name = role; Object.assign(o.userData, { role, ...data }); return o; };
const provenance = p => ({ catalogId: p.catalogId, source: p.source, dimensionStatus: FIT, targetState: 'OFFICIAL_DESCRIBED_ARCHITECTURE_NOT_COMPLETE_CURRENT_INVENTORY', photographyDate: null });

export function resolveRemainingProfile(zoneId, item) {
  if (!item || item.kind !== 'hall') return null;
  return REMAINING_RESIDENTIAL_PROFILES.find(p => p.zone === zoneId && p.name === item.name && p.x === item.x && p.z === item.z) ?? null;
}
function validate(item, p, mode) {
  if (!REMAINING_RESIDENTIAL_PROFILES.includes(p) || resolveRemainingProfile(p.zone, item) !== p || p.mode !== mode) throw Error('R48 residential identity/profile mismatch');
  if (item.w !== p.w || item.d !== p.d || (item.rot !== undefined && item.rot !== 0 && item.rot !== 'south') || item.open || item.roomBays) throw Error('R48 residential retained envelope mismatch');
  if (mode === 'replace' && item.structure !== undefined) throw Error('R48 residential replacement cannot consume an existing dedicated builder');
  if (mode === 'augment' && item.structure !== p.requiredStructure) throw Error('R48 residential existing builder mismatch');
}
function ownMaterial(kit, name, color, extra = {}) {
  const m = new THREE.MeshStandardMaterial({ name, color, roughness: .82, ...extra }); kit.owned.push(m); return m;
}
function ownCanvas(kit, name, draw, { width = 512, height = 512, ...extra } = {}) {
  const c = typeof document === 'undefined' ? null : document.createElement('canvas');
  if (c) { c.width = width; c.height = height; }
  const ctx = c?.getContext('2d'); if (ctx) draw(ctx, width, height);
  const tex = ctx ? new THREE.CanvasTexture(c) : null;
  if (tex) { tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; }
  const mat = ownMaterial(kit, name, 0xffffff, { map: tex, ...extra });
  mat.addEventListener('dispose', () => tex?.dispose());
  return mat;
}
function block(kit, parent, role, mat, w, h, d, x, y, z, data = {}) {
  return tag(kit.mesh(parent, new THREE.BoxGeometry(w, h, d), mat, x, y, z), role, data);
}
function windowBuilder(kit, p) {
  const wood = kit.lib.material('wood_column');
  const glass = ownMaterial(kit, `r48_${p.key}_window_glass_fit`, 0xacc1bd, { transparent: true, opacity: .48, roughness: .3, depthWrite: false, side: THREE.DoubleSide });
  const paper = ownCanvas(kit, `r48_${p.key}_schematic_lattice`, (c, w, h) => {
    c.fillStyle = '#c8c1a5'; c.fillRect(0, 0, w, h);
    if (p.window === 'stepped-glazed-window') { c.fillStyle = '#c5cfca'; c.fillRect(0, h * .48, w, h * .52); c.strokeStyle = '#633b27'; c.lineWidth = 8; for (const x of [0, 128, 256, 384]) for (const i of [0, 22]) { c.strokeRect(x + 12 + i, 12 + i, 104 - i * 2, h * .44 - i * 2); } return; }
    c.strokeStyle = '#633b27'; c.lineWidth = 7;
    // Repeated geometric description only. This is deliberately not a photo,
    // exact double-cross carving, ageing map or museum artwork reproduction.
    const step = w / 4;
    for (let r = -1; r < 6; r++) for (let col = -1; col < 6; col++) {
      const x = col * step, y = r * step;
      c.beginPath(); c.moveTo(x, y - step / 2); c.lineTo(x + step / 2, y); c.lineTo(x, y + step / 2); c.lineTo(x - step / 2, y); c.closePath(); c.stroke();
      if (p.window === 'double-cross-four-diamond') { c.beginPath(); c.arc(x, y, step * .18, 0, Math.PI * 2); c.stroke(); }
    }
  });
  return ({ f, x, z, width, height, floorY, side, bayIndex }) => {
    if (p.rearSolid && side > 0) {
      block(kit, f, 'r48-residential-rear-solid-bay', kit.lib.material('wall_red'), width + .05, height, .5, x, floorY + height / 2, z, { ...provenance(p), bayIndex });
      return true;
    }
    const g = tag(new THREE.Group(), 'r48-residential-window', { ...provenance(p), pattern: p.window, side, bayIndex, patternStatus: 'SOURCE_TYPE_SCHEMATIC_NOT_EXACT_PATTERN', sillHeight: .95 }); f.add(g);
    const sill = .95, upper = height - sill, mid = floorY + sill + upper / 2;
    block(kit, g, 'r48-residential-window-sill', kit.lib.material('wall_brick'), width, sill, .38, x, floorY + sill / 2, z);
    block(kit, g, 'r48-residential-window-panel', p.window === 'rectangular-glazing' ? glass : paper, width - .12, upper - .08, .06, x, mid, z);
    for (const sx of [-1, 1]) block(kit, g, 'r48-residential-window-jamb', wood, .12, upper, .16, x + sx * (width - .12) / 2, mid, z - .055);
    for (const yy of [floorY + sill + .05, floorY + height - .05]) block(kit, g, 'r48-residential-window-rail', wood, width, .1, .16, x, yy, z - .055);
    const panels = p.window === 'rectangular-glazing' ? 4 : 3;
    for (let k = 1; k < panels; k++) block(kit, g, 'r48-residential-window-mullion', wood, .08, upper, .13, x - width / 2 + k * width / panels, mid, z - .06);
    block(kit, g, 'r48-residential-window-transom', wood, width, .09, .13, x, floorY + sill + upper * .48, z - .06);
    return true;
  };
}
function ceilingBuilder(kit, p) {
  const paint = ownCanvas(kit, `r48_${p.key}_ceiling_schematic`, (c, w, h) => {
    c.fillStyle = '#255653'; c.fillRect(0, 0, w, h);
    if (p.ceiling === 'five-bats-longevity') {
      c.fillStyle = '#ddd8c5'; c.fillRect(0, 0, w, h); c.strokeStyle = '#b7aa8f'; c.lineWidth = 8; c.strokeRect(12, 12, w - 24, h - 24);
      c.beginPath(); c.arc(w / 2, h / 2, 72, 0, Math.PI * 2); c.stroke(); c.fillStyle = '#b3a58c'; c.font = 'bold 92px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('寿', w / 2, h / 2);
      for (let k = 0; k < 5; k++) { c.save(); c.translate(w / 2, h / 2); c.rotate(k * Math.PI * 2 / 5); c.translate(0, -145); c.beginPath(); c.moveTo(0, 8); c.bezierCurveTo(-38, -40, -72, -5, -54, 15); c.lineTo(-22, 8); c.lineTo(0, 25); c.lineTo(22, 8); c.lineTo(54, 15); c.bezierCurveTo(72, -5, 38, -40, 0, 8); c.stroke(); c.restore(); }
      return;
    }
    c.strokeStyle = '#947449'; c.lineWidth = 20; c.strokeRect(12, 12, w - 24, h - 24);
    c.strokeStyle = '#415b64'; c.lineWidth = 8; c.strokeRect(34, 34, w - 68, h - 68);
    if (p.ceiling === 'coffer-grid') return;
    // Small original line drawings identify the documented paired-bird type.
    // Their outlines, colours and repetition are explicitly reversible fits.
    c.strokeStyle = '#c3b786'; c.lineWidth = 7;
    for (const sign of [-1, 1]) {
      c.save(); c.translate(w / 2, h / 2); c.scale(sign, 1);
      c.beginPath(); c.ellipse(60, 5, 29, 56, -.55, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.moveTo(42, -21); c.bezierCurveTo(22, -80, 66, -120, 84, -91); c.bezierCurveTo(104, -65, 83, -52, 70, -62); c.stroke();
      c.beginPath(); c.moveTo(84, -91); c.lineTo(111, -85); c.stroke();
      for (const k of [0, 1, 2]) { c.beginPath(); c.moveTo(60, 5); c.bezierCurveTo(100 + k * 13, -20, 126 + k * 12, 48, 100 + k * 16, 75); c.stroke(); }
      if (p.ceiling === 'paired-phoenix') for (const k of [0, 1, 2]) { c.beginPath(); c.moveTo(50, 45); c.bezierCurveTo(80 + k * 16, 95, 6 + k * 20, 150, 72 + k * 16, 173); c.stroke(); }
      else { c.beginPath(); c.moveTo(52, 51); c.lineTo(38, 112); c.lineTo(70, 122); c.stroke(); }
      c.restore();
    }
  });
  const grid = ownMaterial(kit, `r48_${p.key}_ceiling_grid_fit`, 0x72563a);
  return ({ f, w, d, y, z }) => {
    const g = tag(new THREE.Group(), 'r48-residential-ceiling', { ...provenance(p), ...(p.ceilingState ? { targetState: p.ceilingState } : {}), motif: p.ceiling, motifStatus: 'ORIGINAL_SCHEMATIC_TYPE_NOT_ARTWORK_REPRODUCTION', gridStatus: 'EQUAL_MODEL_SUBDIVISION_NOT_MEASURED' }); f.add(g);
    const nx = p.shell.bays * 2, nz = 4, geom = new THREE.PlaneGeometry(w, d); geom.rotateX(Math.PI / 2);
    if (paint.map) { paint.map.wrapS = paint.map.wrapT = THREE.RepeatWrapping; paint.map.repeat.set(nx, nz); }
    tag(kit.mesh(g, geom, paint, 0, y, z), 'r48-residential-ceiling-painted-plane', { ...provenance(p), motif: p.ceiling });
    for (let i = 0; i <= nx; i++) block(kit, g, 'r48-residential-ceiling-grid', grid, .07, .045, d, -w / 2 + i * w / nx, y - .03, z);
    for (let i = 0; i <= nz; i++) block(kit, g, 'r48-residential-ceiling-grid', grid, w, .045, .07, 0, y - .03, z - d / 2 + i * d / nz);
  };
}
function inscription(kit, f, item, p) {
  const mat = ownCanvas(kit, `r48_${p.key}_native_attested_inscription`, (c, w, h) => {
    c.fillStyle = '#252d2a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#927548'; c.lineWidth = 13; c.strokeRect(8, 8, w - 16, h - 16);
    c.fillStyle = '#d4bf83'; c.font = 'bold 150px "STKaiti","KaiTi","Noto Serif CJK SC",serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p.inscription, w / 2, h / 2 + 4);
  }, { width: 1024, height: 256 });
  const geom = new THREE.PlaneGeometry(3.5, .88); geom.rotateY(Math.PI);
  const y = item.ph + item.colH - 1.05, z = item.d / 2 - .5;
  tag(kit.mesh(f, geom, mat, 0, y, z), 'r48-residential-attested-plaque', { ...provenance(p), text: p.inscription, writingStatus: 'NATIVE_GLYPH_NOT_CALLIGRAPHY_FACSIMILE', placementStatus: 'FITTED_HIGH_CENTRAL_POSITION_NOT_MEASURED' });
}

// Five source-backed bays do not authorize inflating the old fitted post radius.
// Keep the original radius here so the retained north courtyard remains usable.
function retainColumnRadiusFit(kit, item, f, p, colStart) {
  const r=p.retainedColumnRadiusFit,oldR=THREE.MathUtils.clamp(item.w/p.shell.bays*.07,.2,.34),near=(a,b)=>Math.abs(a-b)<1e-6;
  const posts=f.children.filter(m=>m.isMesh&&m.geometry.type==='CylinderGeometry'&&m.material===kit.lib.material('wood_column')&&near(m.position.y,item.ph+item.colH/2)&&near(Math.abs(m.position.z),item.d/2));
  if(posts.length!==12)throw Error('Yongshou retained column radius requires exactly twelve owned posts');
  const matches=posts.map(m=>kit.colliders.slice(colStart).filter(c=>near(c.min.x,item.x+m.position.x-oldR)&&near(c.max.x,item.x+m.position.x+oldR)&&near(c.min.z,item.z+m.position.z-oldR)&&near(c.max.z,item.z+m.position.z+oldR)&&near(c.min.y,item.ph)&&near(c.max.y,item.ph+3)));
  if(matches.some(a=>a.length!==1)||new Set(matches.flat()).size!==12)throw Error('Yongshou retained column collider ownership mismatch');
  const oldGeometries=new Set(posts.map(m=>m.geometry)),geo=new THREE.CylinderGeometry(r,r*1.05,item.colH,12);
  posts.forEach((m,i)=>{m.geometry=geo;m.userData.role='r48-yongshou-retained-radius-column';m.userData.dimensionStatus='PRIOR_MODEL_RADIUS_RETAINED_NOT_SURVEYED';const c=matches[i][0],R=r*1.05;c.min.x=item.x+m.position.x-R;c.max.x=item.x+m.position.x+R;c.min.z=item.z+m.position.z-R;c.max.z=item.z+m.position.z+R;});
  for(const old of oldGeometries)old.dispose();
}

export function buildRemainingHall(kit, item, p) {
  validate(item, p, 'replace');
  const shell = { ...item, ...p.shell, rot: 0 };
  if (p.window) shell.panelBuilder = windowBuilder(kit, p);
  if (p.ceiling) shell.ceilingBuilder = ceilingBuilder(kit, p);
  const roomStart = kit.rooms.length, colStart = kit.colliders.length;
  const built = kit.hall(shell);
  if (p.retainedColumnRadiusFit) retainColumnRadiusFit(kit, item, built.f, p, colStart);
  if (p.rearInset) insetRearEnclosure(kit, item, built.f, p, colStart);
  if (p.rearAccessSteps) buildRearPorchSideSteps(kit, item, built.f, p);
  if (p.moveRetainedThrone) moveRetainedThrone(kit, item, built.f, p, colStart);
  if (p.fitRetainedThroneWidth) fitRetainedThroneWidth(kit, item, built.f, p, colStart);
  if (p.boundaries) buildDomesticBoundaries(kit, item, built.f, p, roomStart);
  if (p.teaSetting) buildTiheTeaSetting(kit, item, built.f, p);
  if (p.northStage) buildTiyuanStage(kit, item, built.f, p);
  if (p.frontBaoxia) buildChonghuaBaoxia(kit, item, built.f, p);
  if (p.inscription) inscription(kit, built.f, item, p);
  // The inherited open-leaf primitive renders a 90-degree solid leaf but
  // never registered its thin collision envelope. Keep its exact visible pose
  // and geometry; only these R48 replacement halls receive matching proxies.
  // These two retained throne screens leave insufficient room for inward-open
  // rear leaves. Reflect only the two rear leaves about the same rear wall;
  // outward-open pose is an access fit, not an attested historical door state.
  if (['yongshou-front', 'xianfu-front'].includes(p.key)) {
    let fittedRearLeaves = 0;
    built.f.traverse(mesh => {
      if (!mesh.isMesh || mesh.material !== kit.lib.material('lattice_doors') || Math.abs(mesh.rotation.y - Math.PI / 2) > 1e-8 || mesh.position.z <= 0) return;
      mesh.position.z = item.d - mesh.position.z;
      mesh.userData.rearDoorPose = 'OUTWARD_OPEN_ACCESS_FIT_NOT_HISTORIC_STATE';
      fittedRearLeaves++;
    });
    if (fittedRearLeaves !== 2) throw Error('R48 rear door pose requires exactly two original leaves');
  }
  built.f.updateWorldMatrix(true, true);
  let openedLeafCollisionCount = 0;
  built.f.traverse(mesh => {
    if (!mesh.isMesh || mesh.material !== kit.lib.material('lattice_doors') || Math.abs(mesh.rotation.y - Math.PI / 2) > 1e-8) return;
    const box = new THREE.Box3().setFromObject(mesh);
    if (box.isEmpty()) throw Error('R48 opened leaf has no physical envelope');
    kit.colliders.push(box); openedLeafCollisionCount++;
  });
  built.f.userData.structure = { ...built.f.userData.structure, id: `${p.zone}/r48-${p.key}`, ...(built.f.userData.nameboardMount?{nameboardMount:built.f.userData.nameboardMount}:{}), profile: p.key, catalogId: p.catalogId, ...provenance(p),
    identityMapping: p.identityMapping ?? 'Exact retained catalog identity; coordinate and envelope are model fits.',
    publicEvidenceWarning: p.key === 'taiji-front' ? '太极两类罩只证明类型存在：当前东西配置未经证实，仅可逆模型拟合。' : null,
    currentInventoryVerified: false, retainedUnverified: ['furnishings', 'exact-column-spacing', 'carving-and-painting'],
    furniturePolicy: 'RETAIN_EXISTING_UNVERIFIED_NOT_INVENTORY',
    openedLeafCollisionCount,
    retainedColumnRadiusFit: p.retainedColumnRadiusFit ? { top: p.retainedColumnRadiusFit, bottom: p.retainedColumnRadiusFit * 1.05, status: 'PRIOR_MODEL_RADIUS_RETAINED_FOR_CONTINUOUS_COURTYARD_CLEARANCE_NOT_SURVEYED' } : null,
    sourceSupportedChanges: { bays: p.shell.bays, roof: p.shell.roof ?? item.roof, rearDoor: p.shell.backDoor ?? item.backDoor ?? false, windows: p.window ?? 'RETAINED_UNVERIFIED', ceiling: p.ceiling ?? 'RETAINED_UNVERIFIED' },
    doorPose: 'MODEL_VIEWING_ACCESS_NOT_CURRENT_OR_HISTORICAL_OPEN_STATE',
    roofSource: p.roofSource ?? p.source, roofSourcePage: p.roofSourcePage ?? null,
    limitations: ['No complete period inventory is asserted.', 'Unspecified pre-existing furnishings are retained as unverified placeholders.', 'All new component dimensions, materials, grid spacing and opening poses are model fits.'] };
  return { ...built, p };
}

export function augmentRemainingHall(kit, item, built, p) {
  validate(item, p, 'augment');
  if (!built?.f || built.f.parent !== kit.root || built.f.position.x !== item.x || built.f.position.z !== item.z) throw Error('R48 residential existing frame mismatch');
  if (built.f.userData.r48ResidentialAugmented) throw Error('R48 residential augment already applied');
  if (p.frontAssembly) buildYangxinFrontAssembly(kit, item, built.f, p);
  if (p.caisson) buildYangxinCaisson(kit, item, built.f, p);
  built.f.userData.r48ResidentialAugmented = true;
  built.f.userData.structure = { ...built.f.userData.structure, id: built.f.userData.structure?.id ?? `${p.zone}/r48-${p.key}`, catalogId: p.catalogId, remainingResidentialProfile: p.key, source: p.source, ...(built.f.userData.nameboardMount?{nameboardMount:built.f.userData.nameboardMount}:{}),
    currentInventoryVerified: false, glbPolicy: p.caisson ? 'UNCHANGED_BYTES_AND_OVERLAY' : 'NOT_APPLICABLE',
    exteriorStatus: p.frontAssembly ? 'actual-change' : 'reviewed-retained', interiorStatus: p.caisson ? 'actual-change' : 'evidence-blocked',
    reviewedOnly: !!p.reviewedRetained,
    limitations: p.reviewedRetained ? ['Existing dedicated stone/iron ruin retained without geometry changes.', 'Historical ceramic-wall wording does not establish surviving tile distribution; no tile patches added.', 'No intact palace or invented interior furnishings.'] : ['Central octagonal caisson is a plain type frame, not a dragon carving or lantern replica.', 'Three primary bays and nine front subdivisions replace the old eleven-grid facade; 36m equal spacing is a retained-envelope fit, not measured spacing.', 'Middle/west contiguous roll-roof baoxia follows the official plan; roof pitch, projection and .35m facade-post clearance shift are model fits.', 'Existing GLB, main roof and furniture are retained; rear entrance, 工字 connection and exact west warm-room inventory have not been rebuilt.'] };
  return { ...built, p };
}

/** Retain the roof, eave columns and platform. Recess only the known rear
 * enclosure, so the porch is genuinely open rather than an extra false room. */
function insetRearEnclosure(kit, item, f, p, colStart) {
  const inset = p.rearInset, rear = item.d / 2, front = -item.d / 2 + (p.shell.frontEnclosureInset ?? 0);
  const red = kit.lib.material('wall_red'), wood = kit.lib.material('wood_column'), lattice = kit.lib.material('lattice_doors');
  const beamH = THREE.MathUtils.clamp(item.colH * .12, .45, .85), H = item.colH - beamH;
  const near = (a, b) => Math.abs(a - b) < 1e-6;
  for (const m of [...f.children]) {
    if (m.userData.role === 'r48-residential-window' && m.userData.side > 0) { m.position.z -= inset; continue; }
    if (!m.isMesh) continue;
    if (m.material === red && near(Math.abs(m.position.x), item.w / 2) && Math.abs(geometrySize(m.geometry).z - item.d) < 1e-5) { f.remove(m); m.geometry.dispose(); continue; }
    const rearRed = m.material === red && near(m.position.z, rear);
    const rearThreshold = m.material === wood && near(m.position.z, rear) && Math.abs(geometrySize(m.geometry).y - .22) < 1e-5 && Math.abs(geometrySize(m.geometry).z - .3) < 1e-5;
    const rearDoor = m.material === lattice && m.position.z > rear - item.w / 5 * .13 - .21;
    if (rearRed || rearThreshold || rearDoor) m.position.z -= inset;
  }
  const kept = kit.colliders.slice(colStart).filter(c => {
    const width = c.max.x - c.min.x, depth = c.max.z - c.min.z;
    const side = near(width, .7) && near(depth, item.d) && near(Math.abs((c.min.x + c.max.x) / 2 - item.x), item.w / 2);
    if (side) return false;
    if (near((c.min.z + c.max.z) / 2, item.z + rear) && (near(depth, .5) || near(depth, .6))) c.translate(new THREE.Vector3(0, 0, -inset));
    return true;
  });
  kit.colliders.splice(colStart, kit.colliders.length - colStart, ...kept);
  for (const s of [-1, 1]) {
    block(kit, f, 'r48-residential-recessed-side-wall', red, .7, H, rear - inset - front, s * item.w / 2, item.ph + H / 2, (front + rear - inset) / 2, provenance(p));
    kit.col(f, s * item.w / 2 - .35, item.ph, front, s * item.w / 2 + .35, item.ph + H, rear - inset);
  }
  tag(f, 'r48-residential-hall', { rearPorchDepthFit: inset });
  // Move navigation door registrations to the visible recessed door plane.
  for (const r of kit.rooms) if (r.name === item.name) for (const q of r.doors) if (near(q.z, item.z + rear)) q.z -= inset;
}
function moveRetainedThrone(kit, item, f, p, colStart) {
  const shift = p.moveRetainedThrone, tz = item.d / 2 - Math.min(2.6, item.d * .3), tw = Math.min(item.w / p.shell.bays * 1.4, 5);
  for (const m of f.children) if (m.isMesh && m.userData.role === 'retained-throne-component') { m.position.z -= shift; m.userData.placementStatus = 'RETAINED_PLACEHOLDER_MOVED_FOR_RECESSED_REAR_WALL_CLEARANCE'; }
  for (const c of kit.colliders.slice(colStart)) if (Math.abs(c.min.x - (item.x - tw / 2)) < 1e-6 && Math.abs(c.min.z - (item.z + tz - 1.2)) < 1e-6 && Math.abs(c.max.y - (item.ph + 3)) < 1e-6) c.translate(new THREE.Vector3(0, 0, -shift));
}
function fitRetainedThroneWidth(kit, item, f, p, colStart) {
  const sourceWidth = Math.min(item.w / p.shell.bays * 1.4, 5), target = p.fitRetainedThroneWidth;
  const tz = item.d / 2 - Math.min(2.6, item.d * .3);
  for (const m of f.children) if (m.isMesh && m.userData.role === 'retained-throne-component' && geometrySize(m.geometry).x > 3) {
    m.geometry.scale(target / sourceWidth, 1, 1);
    m.userData.dimensionStatus = 'RETAINED_PLACEHOLDER_NARROWED_FOR_SOURCE_PARTITION_CLEARANCE_NOT_MEASURED';
  }
  for (const c of kit.colliders.slice(colStart)) if (Math.abs(c.min.x - (item.x - sourceWidth / 2)) < 1e-6 && Math.abs(c.min.z - (item.z + tz - 1.2)) < 1e-6 && Math.abs(c.max.y - (item.ph + 3)) < 1e-6) { c.min.x = item.x - target / 2; c.max.x = item.x + target / 2; }
}
function buildDomesticBoundaries(kit, item, f, p, roomStart) {
  if (kit.rooms.length !== roomStart + 1) throw Error('R48 residential expected one replaceable navigation room');
  kit.rooms.splice(roomStart, 1);
  const wood = ownMaterial(kit, `r48_${p.key}_inner_timber_fit`, p.key === 'tihe-through-hall' ? 0x342a24 : 0x4a3023);
  const paper = ownMaterial(kit, `r48_${p.key}_partition_panel_fit`, 0xbab49d);
  const y = item.ph, H = 4.1, front = -item.d / 2 + (p.shell.frontEnclosureInset ?? 0) + .18, rear = item.d / 2 - (p.rearInset ?? 0) - .18;
  const passageZ = -1.2, bay = item.w / p.shell.bays;
  const solid = (g, role, mat, w, h, d, x, yy, z, data = {}) => { const m = block(kit, g, role, mat, w, h, d, x, yy, z, { ...provenance(p), ...data }); kit.col(f, x - w / 2, yy - h / 2, z - d / 2, x + w / 2, yy + h / 2, z + d / 2); return m; };
  for (const boundary of p.boundaries) {
    const halfOpening = (boundary.openingWidth ?? 2.4) / 2, opening = [passageZ - halfOpening, passageZ + halfOpening];
    const x = -item.w / 2 + boundary.bay * bay;
    const g = tag(new THREE.Group(), 'r48-residential-boundary', { ...provenance(p), ...boundary, x, opening, sideMapping: boundary.sideMapping ?? 'SOURCE_BAY_RELATIONSHIP_DIMENSIONS_FITTED', carvingStatus: 'ABSTRACT_OPENWORK_NOT_EXACT_CARVING' }); f.add(g);
    for (const z of [front, ...opening, rear]) solid(g, 'r48-residential-partition-post', wood, .14, H, .14, x, y + H / 2, z);
    block(kit, g, 'r48-residential-partition-head', wood, .16, .28, rear - front, x, y + H - .14, (front + rear) / 2, provenance(p));
    for (const [a, b] of [[front, opening[0] - .07], [opening[1] + .07, rear]]) {
      const d = b - a, z = (a + b) / 2;
      if (boundary.type === 'partition-door') {
        solid(g, 'r48-residential-partition-panel', paper, .09, H - .28, d, x, y + (H - .28) / 2, z);
        for (let i = 1; i < 4; i++) solid(g, 'r48-residential-partition-leaf-stile', wood, .14, H - .3, .07, x, y + (H - .3) / 2, a + i * d / 4);
        block(kit, g, 'r48-residential-partition-lower-rail', wood, .16, .1, d, x, y + .95, z, provenance(p));
      } else if (boundary.type === 'open-floral-cover') {
        // The official interior views show broad central openings and opaque
        // carved side fields with small rectangular apertures, not a fence of
        // full-height vertical balusters. Only that mass/void relationship is
        // represented; the dense floral carving is deliberately unresolved.
        const slot = Math.min(.75, d * .5), low = 1.15, high = 2.55, sideDepth = (d - slot) / 2;
        solid(g, 'r48-tiyuan-carved-side-type-lower', wood, .12, low, d, x, y + low / 2, z);
        solid(g, 'r48-tiyuan-carved-side-type-upper', wood, .12, H - .28 - high, d, x, y + (H - .28 + high) / 2, z);
        for (const sign of [-1, 1]) solid(g, 'r48-tiyuan-carved-side-type-flank', wood, .12, high - low, sideDepth, x, y + (low + high) / 2, z + sign * (slot + sideDepth) / 2);
        block(kit, g, 'r48-tiyuan-open-cover-head-fit', wood, .12, .5, opening[1] - opening[0], x, y + H - .45, passageZ, { ...provenance(p), motifStatus: 'UNDECORATED_TYPE_OUTLINE_NOT_FLORAL_REPLICA' });
      } else {
        const low = boundary.type === 'railing-cover' ? .8 : .38;
        solid(g, 'r48-residential-cover-low-rail', wood, .12, low, d, x, y + low / 2, z);
        const count = Math.max(2, Math.round(d / .7));
        for (let i = 0; i < count; i++) solid(g, 'r48-residential-cover-open-stile', wood, .1, H - low - .35, .07, x, y + low + (H - low - .35) / 2, a + (i + .5) * d / count);
        block(kit, g, 'r48-residential-cover-upper-rail', wood, .12, .1, d, x, y + 2.9, z, provenance(p));
      }
    }
  }
  if (p.key === 'chonghua-middle-name-fit') buildChonghuaGourdOutline(kit, item, f, p, wood);
  const cuts = [-item.w / 2, ...p.boundaries.map(b => -item.w / 2 + b.bay * bay), item.w / 2];
  for (let i = 0; i < cuts.length - 1; i++) {
    const x0 = cuts[i] + .22, x1 = cuts[i + 1] - .22, doors = [];
    if (i > 0) doors.push({ x: cuts[i], z: passageZ }); if (i < cuts.length - 2) doors.push({ x: cuts[i + 1], z: passageZ });
    if (x0 < 0 && x1 > 0) { doors.push({ x: 0, z: -item.d / 2 + (p.shell.frontEnclosureInset ?? 0) }); if (p.shell.backDoor) doors.push({ x: 0, z: item.d / 2 - (p.rearInset ?? 0) }); }
    kit._lastFurnish = { cover: [], spawns: [{ x: (x0 + x1) / 2, z: passageZ }] };
    kit.registerRoom(f, { name: `${item.name}·观览区${i + 1}`, kind: 'r48-source-domestic-navigation', x0, x1, z0: front, z1: rear, y, h: H, doors });
  }
}
function buildTiheTeaSetting(kit, item, f, p) {
  const photo = 'https://img.dpm.org.cn/Uploads/Picture/dc/8040.jpg';
  const mat = ownMaterial(kit, 'r48_tihe_west_photo_dark_wood_fit', 0x302b25), fabric = ownMaterial(kit, 'r48_tihe_west_plain_seat_fit', 0x95846a);
  const data = { ...provenance(p), photoSource: photo, photographyDate: null, evidence: 'MUSEUM_CAPTION_WEST_ROOM_TWO_CHAIRS_FLANKING_SQUARE_TABLE', furnitureStatus: 'SIMPLIFIED_PHOTO_RELATIONSHIP_NOT_COMPLETE_CURRENT_DISPLAY' };
  const x = item.w * .3, z = 2.4, y = item.ph;
  const solid = (g, role, m, w, h, d, xx, yy, zz) => { block(kit, g, role, m, w, h, d, xx, yy, zz, data); kit.col(f, xx - w / 2, yy - h / 2, zz - d / 2, xx + w / 2, yy + h / 2, zz + d / 2); };
  const table = tag(new THREE.Group(), 'r48-tihe-west-tea-table', data); table.position.x = 0; f.add(table);
  // Absolute coordinates keep the visible solids and colliders identical.
  table.userData.center = { x, z };
  solid(table, 'r48-tihe-tea-table-top', mat, 1.8, .14, 1.25, x, y + .86, z);
  for (const dx of [-.73, .73]) for (const dz of [-.47, .47]) solid(table, 'r48-tihe-tea-table-leg', mat, .12, .79, .12, x + dx, y + .395, z + dz);
  for (const side of [-1, 1]) {
    const chair = tag(new THREE.Group(), 'r48-tihe-west-chair', data); f.add(chair); const xx = x + side * 1.65;
    solid(chair, 'r48-tihe-chair-seat', mat, .8, .12, .8, xx, y + .52, z);
    solid(chair, 'r48-tihe-chair-cushion', fabric, .7, .06, .68, xx, y + .61, z);
    for (const dx of [-.32, .32]) for (const dz of [-.32, .32]) solid(chair, 'r48-tihe-chair-leg', mat, .09, .46, .09, xx + dx, y + .23, z + dz);
    for (const dx of [-.34, .34]) solid(chair, 'r48-tihe-chair-back-post', mat, .09, .8, .09, xx + dx, y + .99, z + .35);
    solid(chair, 'r48-tihe-chair-back-top', mat, .78, .1, .12, xx, y + 1.4, z + .35);
    solid(chair, 'r48-tihe-chair-back-splat', mat, .2, .68, .08, xx, y + 1, z + .36);
  }
}
function curvedRoofGeometry(width, z0, z1, y, rise, reverse = false, trimZ0 = z0) {
  const pos = [], uv = [], index = [], steps = 24;
  for (let i = 0; i <= steps; i++) for (const x of [-width / 2, width / 2]) { const z = trimZ0 + (z1 - trimZ0) * i / steps, t = (z - z0) / (z1 - z0); pos.push(x, y + Math.sin(t * Math.PI) * rise - (reverse ? .075 : 0), z); uv.push((x + width / 2) / 1.2, (z - z0) / 1.2); }
  for (let i = 0; i < steps; i++) { const a = i * 2; index.push(...(reverse ? [a, a + 1, a + 2, a + 1, a + 3, a + 2] : [a, a + 2, a + 1, a + 1, a + 2, a + 3])); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(index); g.computeVertexNormals(); return g;
}
function buildTiyuanStage(kit, item, f, p) {
  const bay = item.w / 5, width = bay * 3, rear = item.d / 2, projection = 3.6, edge = rear + projection;
  const g = tag(new THREE.Group(), 'r48-tiyuan-north-stage', { ...provenance(p), photoSource: 'https://img.dpm.org.cn/Uploads/Picture/dc/3968.jpg', bays: 3, facing: 'north', structure: 'OPEN_ROUND_ROOF_STAGE_FITTED_NOT_THEATRE_MEASUREMENT', joinStatus: 'TRIMMED_TO_EXISTING_REAR_BEAM_OUTER_FACE_FITTED_ABUTMENT' }); f.add(g);
  const wood = kit.lib.material('wood_column'), y = item.ph, top = y + item.colH * .83, start = rear + item.pad + .06, end = edge + .55;
  block(kit, g, 'r48-tiyuan-stage-plinth', kit.lib.material('wall_brick'), width + 1, y, end - start, 0, y / 2, (start + end) / 2, provenance(p));
  block(kit, g, 'r48-tiyuan-stage-floor', kit.lib.material('stone_slab'), width + 1, .08, end - start, 0, y - .03, (start + end) / 2, provenance(p));
  kit.walkBox(f, -(width + 1) / 2, start - .07, (width + 1) / 2, end, y);
  for (let i = 0; i <= 3; i++) { const x = (-1.5 + i) * bay; const m = tag(kit.mesh(g, new THREE.CylinderGeometry(.24, .25, top - y, 12), wood, x, (top + y) / 2, edge), 'r48-tiyuan-stage-column', provenance(p)); kit.col(f, x - .25, y, edge - .25, x + .25, top, edge + .25); }
  const curveY = z => top + Math.sin((z - (rear - .45)) / (edge + .55 - (rear - .45)) * Math.PI) * 1.15;
  const abutZ = rear + .225;
  curvedBearing(kit, g, 'r48-tiyuan-stage-front-beam', kit.lib.material('caihua_beam'), 0, width + .5, edge - .16, edge + .16, top - .35, z => curveY(z) - .075, p);
  for (let i = 0; i <= 3; i++) {
    const x = (-1.5 + i) * bay;
    block(kit, g, 'r48-tiyuan-stage-depth-beam', wood, .26, .36, edge - rear, x, top - .14, (edge + rear) / 2, provenance(p));
    curvedBearing(kit, g, 'r48-tiyuan-stage-plain-roof-strut', wood, x, .22, rear + 1.7, rear + 1.94, top, z => curveY(z) - .075, p);
  }
  tag(kit.mesh(g, curvedRoofGeometry(width + 1.1, rear - .45, edge + .55, top, 1.15, false, abutZ), kit.lib.material('roof_tile'), 0, 0, 0), 'r48-tiyuan-curved-roof', { ...provenance(p), abutZ, joinStatus: 'ROOF_EDGE_CONTACTS_SOLID_REAR_BEAM_SIDE_NOT_HALL_INTERIOR' });
  tag(kit.mesh(g, curvedRoofGeometry(width + 1.1, rear - .45, edge + .55, top, 1.15, true, abutZ), kit.lib.material('rafters'), 0, 0, 0), 'r48-tiyuan-curved-roof-underside', provenance(p));
  for (const x of [-(width + 1.1) / 2 + .045, (width + 1.1) / 2 - .045]) curvedBearing(kit, g, 'r48-tiyuan-stage-plain-gable-fascia', wood, x, .09, abutZ, edge + .55, top - .075, z => curveY(z) - .075, p);
  block(kit, g, 'r48-tiyuan-stage-front-roof-edge', wood, width + 1.1, .075, .08, 0, top - .0375, edge + .55, provenance(p));
  for (let i = 0; i < 3; i++) block(kit, g, 'r48-tiyuan-stage-openwork-head', wood, bay - .36, .35, .12, (i - 1) * bay, top - .52, edge, { ...provenance(p), carvingStatus: 'PLAIN_TYPE_OUTLINE_NOT_EXACT_CARVING' });
}

function buildChonghuaGourdOutline(kit, item, f, p, wood) {
  // Original, deliberately coarse two-lobed outlines identify the documented
  // gourd type. They do not purport to reproduce the 1891 carved foliage.
  const x = -item.w / 10, y = item.ph;
  for (const z of [-3.0, 1.0, 2.8]) {
    const points = [];
    for (let i = 0; i <= 48; i++) {
      const t = i / 48 * Math.PI * 2;
      const width = .26 + .13 * Math.cos(t * 2);
      points.push(new THREE.Vector3(x - .085, y + 2.9 + Math.cos(t) * .62, z + Math.sin(t) * width));
    }
    const curve = new THREE.CatmullRomCurve3(points, true);
    tag(kit.mesh(f, new THREE.TubeGeometry(curve, 48, .035, 6, true), wood, 0, 0, 0), 'r48-chonghua-abstract-gourd-outline', { ...provenance(p), motifStatus: 'ORIGINAL_TYPE_SYMBOL_NOT_HISTORIC_CARVING', side: 'east' });
  }
}
function buildChonghuaBaoxia(kit, item, f, p) {
  const bay = item.w / 5, width = bay * 3, front = -item.d / 2, edge = front - 2.7;
  const g = tag(new THREE.Group(), 'r48-chonghua-three-bay-baoxia', { ...provenance(p), bays: 3, photoSource: 'https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5eff075737310.jpg', envelopeStatus: 'FITTED_PROJECTION_NOT_MEASURED', roofTypeStatus: 'PHOTO_MASSING_FIT_NOT_ATTESTED_ROOF_SUBTYPE' }); f.add(g);
  const y = item.ph, top = 6.45, start = edge - .55, end = -(item.d + 2 * item.pad + .12) / 2;
  block(kit, g, 'r48-chonghua-baoxia-plinth', kit.lib.material('wall_brick'), width + 1.1, y, end - start, 0, y / 2, (end + start) / 2, provenance(p));
  block(kit, g, 'r48-chonghua-baoxia-floor', kit.lib.material('stone_slab'), width + 1.1, .08, end - start, 0, y - .03, (end + start) / 2, provenance(p));
  kit.walkBox(f, -(width + 1.1) / 2, start, (width + 1.1) / 2, end + .07, y);
  kit.col(f, -(width + 1.1) / 2 + .05, 0, start + .05, (width + 1.1) / 2 - .05, y, end);
  kit.steps(f, { zEdge: start, dir: -1, y, width: Math.min(4.6, bay * 1.05) });
  for (let i = 0; i <= 3; i++) {
    const x = (i - 1.5) * bay;
    tag(kit.mesh(g, new THREE.CylinderGeometry(.24, .25, top - y, 12), kit.lib.material('wood_column'), x, (top + y) / 2, edge), 'r48-chonghua-baoxia-column', provenance(p));
    kit.col(f, x - .25, y, edge - .25, x + .25, top, edge + .25);
  }
  block(kit, g, 'r48-chonghua-baoxia-beam', kit.lib.material('caihua_beam'), width + .5, .35, .3, 0, top - .16, edge, provenance(p));
  const roof = kit.roof(g, { type: 'xieshan', width: width + 1.1, depth: 3.7, baseY: top, height: 1.0, brackets: false }, 0, (edge + front) / 2);
  if (roof) {
    const mainRoof=f.children.find(m=>m!==g&&m.name.startsWith('roof_')&&m.userData.eaveY!==undefined);
    const meshes=[];roof.traverse(m=>{if(m.isMesh)meshes.push(m);});
    const joint=fitCanopyToMainRoof({hall:f,mainRoof,meshes,capParent:roof,capMaterial:kit.lib.material('roof_tile')});
    tag(roof,'r48-chonghua-baoxia-roof-fit',{...provenance(p),roofSurfaceJoint:joint,joinStatus:joint.status});
  }
  f.userData.nameboardMount=fitRegisteredNameboard(kit,f,item.plaqueText??item.name,{
    y:y+(item.colH-THREE.MathUtils.clamp(item.colH*.12,.45,.85))*.8+.06+.735,
    z:front-.36,width:.945,height:1.35,
    canopyColumnTop:top,dimensionStatus:'LOCAL_CANOPY_HEIGHT_AND_MOUNT_FIT_NOT_SURVEYED',
    source:'https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5eff075737310.jpg',
    reason:'Official photograph places the complete board above the main door head, behind the nearer baoxia beam. Preserve that depth and natural obstruction; canopy height and plaque position are constrained model fits, not a surveyed inscription facsimile'});
}

function buildYangxinCaisson(kit, item, f, p) {
  const beamH = THREE.MathUtils.clamp(item.colH * .12, .45, .85), ceilingY = item.ph + item.colH - beamH - .02;
  const old = f.children.filter(m => m.isMesh && Math.abs(geometrySize(m.geometry).x - item.w) < 1e-5 && Math.abs(geometrySize(m.geometry).z - item.d) < 1e-5 && geometrySize(m.geometry).y < 1e-5 && Math.abs(m.position.y - ceilingY) < 1e-7);
  if (old.length !== 1) throw Error('R48 Yangxin expected exactly one existing generic ceiling');
  // Replace a pierced flat surface rather than laying a second flat ceiling
  // across the caisson. The GLB is not touched and owns no central ceiling.
  const centerZ = -.4, radius = 2.7, points = Array.from({ length: 8 }, (_, i) => new THREE.Vector2(Math.cos(Math.PI / 8 + i * Math.PI / 4) * radius, centerZ + Math.sin(Math.PI / 8 + i * Math.PI / 4) * radius));
  const outer = new THREE.Shape(); outer.moveTo(-item.w / 2, -item.d / 2); outer.lineTo(item.w / 2, -item.d / 2); outer.lineTo(item.w / 2, item.d / 2); outer.lineTo(-item.w / 2, item.d / 2); outer.closePath();
  const hole = new THREE.Path(); points.forEach((q, i) => i ? hole.lineTo(q.x, q.y) : hole.moveTo(q.x, q.y)); hole.closePath(); outer.holes.push(hole);
  const pierced = new THREE.ShapeGeometry(outer); pierced.rotateX(Math.PI / 2);
  const uv = pierced.attributes.uv, positions = pierced.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (positions.getX(i) + item.w / 2) / item.w, (positions.getZ(i) + item.d / 2) / item.d);
  tag(kit.mesh(f, pierced, old[0].material, 0, ceilingY, 0), 'r48-yangxin-pierced-ceiling', { ...provenance(p), photoSource: p.photoSource, fitting: 'RETAINED_FLAT_CEILING_WITH_FITTED_OCTAGONAL_APERTURE' });
  f.remove(old[0]); old[0].geometry.dispose();
  const g = tag(new THREE.Group(), 'r48-yangxin-octagonal-caisson', { ...provenance(p), photoSource: p.photoSource, photoPublicationPath: '2026-04-30', photographCaptureDate: 'UNKNOWN', evidence: 'OFFICIAL_CENTRAL_HALL_PHOTO_WITH_中正仁和_PLAQUE', decorationStatus: 'FRAME_TYPE_ONLY_NO_DRAGON_OR_LANTERN_REPLICA', relativeEnvelope: { minY: ceilingY - item.ph - .15, maxY: ceilingY - item.ph + .69, radius, centerZ } }); f.add(g);
  const teal = ownMaterial(kit, 'r48_yangxin_caisson_teal_fit', 0x3f7166, { side: THREE.DoubleSide }), gold = ownMaterial(kit, 'r48_yangxin_caisson_plain_ochre_fit', 0xa9904d, { metalness: .12, side: THREE.DoubleSide });
  const levels = [{ r: 2.7, y: ceilingY - .06 }, { r: 2.35, y: ceilingY + .24 }, { r: 1.95, y: ceilingY + .6 }];
  for (const [k,l] of levels.entries()) for (let i = 0; i < 8; i++) {
    const a = Math.PI / 8 + i * Math.PI / 4, b = a + Math.PI / 4, ax = Math.cos(a) * l.r, az = centerZ + Math.sin(a) * l.r, bx = Math.cos(b) * l.r, bz = centerZ + Math.sin(b) * l.r;
    const m = block(kit, g, 'r48-yangxin-octagonal-ring', k % 2 ? gold : teal, Math.hypot(bx - ax, bz - az) + .02, .18, .16, (ax + bx) / 2, l.y, (az + bz) / 2, { ...provenance(p), level: k }); m.rotation.y = -Math.atan2(bz - az, bx - ax);
  }
  for (let k = 0; k < levels.length - 1; k++) {
    const lo = levels[k], hi = levels[k + 1], vertices = [], idx = [];
    for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; for (const l of [lo, hi]) vertices.push(Math.cos(a) * l.r, l.y, centerZ + Math.sin(a) * l.r); }
    for (let i = 0; i < 8; i++) { const a = i * 2, b = ((i + 1) % 8) * 2; idx.push(a,b,a+1,b,b+1,a+1); }
    const geom = new THREE.BufferGeometry(); geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices,3)); geom.setIndex(idx); geom.computeVertexNormals(); tag(kit.mesh(g,geom,gold,0,0,0),'r48-yangxin-caisson-plain-sloped-liner',provenance(p));
  }
  const cap = new THREE.CircleGeometry(1.95,8,Math.PI/8); cap.rotateX(Math.PI/2);
  tag(kit.mesh(g,cap,teal,0,ceilingY+.6,centerZ),'r48-yangxin-caisson-cap',{...provenance(p),decoration:'BLANK_TYPE_PLACEHOLDER_NO_INVENTED_DRAGON'});
}

/** One narrowly registered augmentation of the existing Yangxin shell. The
 * documented 3 structural bays / apparent 9 frontage divisions are different
 * grids. Neither equal model spacing nor the GLB clearance offset is a survey. */
function buildYangxinFrontAssembly(kit, item, f, p) {
  const near = (a, b) => Math.abs(a - b) < 1e-5;
  const wood = kit.lib.material('wood_column'), red = kit.lib.material('wall_red'), lattice = kit.lib.material('lattice_doors');
  const primaryX = [-18, -6, 6, 18], secondaryX = [-14, -10, -2, 2, 10, 14];
  const oldN = 11, oldBay = item.w / oldN, oldR = oldBay * .07, rear = item.d / 2;
  const frontZ = -rear - .30, columnFront = -rear - .35, columnRear = rear + .35;
  const beamH = .85, clearH = item.colH - beamH, doorH = clearH * .8, y = item.ph;
  const mainRoof = f.children.find(o => o.name === 'roof_xieshan');
  if (!mainRoof) throw Error('R48 Yangxin expected retained main xieshan roof');
  const removed = [], geometries = new Set();
  for (const m of [...f.children]) {
    if (!m.isMesh) continue;
    const size = geometrySize(m.geometry);
    const oldColumn = m.material === wood && near(size.y, item.colH) && near(Math.abs(m.position.z), rear) && size.x < 1 && size.z < 1;
    const oldWindowOrDoor = m.material === lattice && m.position.z < -rear + oldBay * .13 + .21;
    const oldFrontHead = m.material === red && near(m.position.z, -rear) && near(size.x, item.w) && near(size.z, .3);
    const oldThreshold = m.material === wood && near(m.position.z, -rear) && near(size.y, .22) && near(size.z, .3);
    const oldSteps = m.material === kit.lib.material('marble') && m.position.z < -(item.d + 2 * item.pad) / 2 && m.position.z > -9 && m.position.y < y;
    if (oldColumn || oldWindowOrDoor || oldFrontHead || oldThreshold || oldSteps) { removed.push(m); geometries.add(m.geometry); f.remove(m); }
  }
  if (removed.filter(m => m.geometry.type === 'CylinderGeometry').length !== 24) throw Error('R48 Yangxin expected complete eleven-grid column removal');
  for (const geometry of geometries) geometry.dispose();
  // Only old hall-local post/window collision boxes are replaced. The source
  // rear wall, side walls, furniture and other buildings remain untouched.
  kit.colliders = kit.colliders.filter(c => {
    const cx = (c.min.x + c.max.x) / 2 - item.x, cz = (c.min.z + c.max.z) / 2 - item.z;
    const w = c.max.x - c.min.x, d = c.max.z - c.min.z;
    const oldColumn = near(w, oldR * 2) && near(d, oldR * 2) && near(Math.abs(cz), rear) && cx >= -18.01 && cx <= 18.01 && near(c.min.y, y);
    const oldWindow = near(w, oldBay) && near(d, .5) && near(cz, -rear) && cx >= -18 && cx <= 18 && near(c.min.y, y);
    return !oldColumn && !oldWindow;
  });
  const oldEdge = item.z - (item.d + 2 * item.pad) / 2;
  kit.walkables = kit.walkables.filter(w => !(w.type === 'ramp' && w.axis === 'z' && near(w.a0, oldEdge) && near((w.minX + w.maxX) / 2, item.x)));
  for (const x of primaryX) for (const z of [columnFront, columnRear]) {
    tag(kit.mesh(f, new THREE.CylinderGeometry(.34, .357, item.colH, 16), wood, x, y + item.colH / 2, z), 'r48-yangxin-primary-column', { ...provenance(p), structuralBayCount: 3, axisShift: '0.35m_OUTWARD_GLB_CLEARANCE_MODEL_FIT' });
    kit.col(f, x - .357, y, z - .357, x + .357, y + 3, z + .357);
  }
  for (const x of secondaryX) {
    block(kit, f, 'r48-yangxin-secondary-front-post', wood, .28, clearH, .28, x, y + clearH / 2, columnFront, { ...provenance(p), roleEvidence: 'ADDED_FRONT_POSTS_SOURCE_TYPE_SQUARE_SECTION_FIT' });
    kit.col(f, x - .14, y, columnFront - .14, x + .14, y + 3, columnFront + .14);
  }
  const windowMat = ownMaterial(kit, 'r48_yangxin_front_window_glass_fit', 0x8d9c94, { transparent: true, opacity: .62, roughness: .35, depthWrite: false, side: THREE.DoubleSide });
  const bounds = [-18, -14, -10, -6, -2, 2, 6, 10, 14, 18];
  for (let i = 0; i < 9; i++) {
    if (i === 4) continue;
    const a = bounds[i] + (primaryX.includes(bounds[i]) ? .34 : .14), b = bounds[i + 1] - (primaryX.includes(bounds[i + 1]) ? .34 : .14), width = b - a, x = (a + b) / 2;
    const g = tag(new THREE.Group(), 'r48-yangxin-front-window', { ...provenance(p), subdivision: i, windowDesignStatus: 'PLAIN_GEOMETRIC_SILL_WINDOW_NOT_EXACT_PANE_INVENTORY' }); f.add(g);
    block(kit, g, 'r48-yangxin-front-sill', kit.lib.material('wall_brick'), width, 1, .22, x, y + .5, frontZ, provenance(p));
    block(kit, g, 'r48-yangxin-front-glazing', windowMat, width - .08, doorH - 1.08, .045, x, y + 1 + (doorH - 1) / 2, frontZ, provenance(p));
    for (const xx of [a + .04, b - .04, x]) block(kit, g, 'r48-yangxin-front-window-stile', wood, .08, doorH - 1, .12, xx, y + 1 + (doorH - 1) / 2, frontZ - .04);
    for (const yy of [y + 1.04, y + 1 + (doorH - 1) / 2, y + doorH - .04]) block(kit, g, 'r48-yangxin-front-window-rail', wood, width, .08, .12, x, yy, frontZ - .04);
    kit.col(f, a, y, frontZ - .11, b, y + 3, frontZ + .11);
  }
  block(kit, f, 'r48-yangxin-front-head-wall', red, item.w, clearH - doorH, .3, 0, y + doorH + (clearH - doorH) / 2, frontZ, provenance(p));
  block(kit, f, 'r48-yangxin-front-threshold', wood, 3.72, .22, .3, 0, y + .11, frontZ, provenance(p));
  for (const sign of [-1, 1]) {
    const leaf = block(kit, f, 'r48-yangxin-front-open-door-leaf', lattice, 1.05, doorH, .1, sign * 1.78, y + doorH / 2, frontZ - .59, { ...provenance(p), doorPose: 'MODEL_VIEWING_ACCESS_NOT_CURRENT_OR_HISTORICAL_OPEN_STATE' }); leaf.rotation.y = Math.PI / 2;
  }
  for (const room of kit.rooms) if (room.name === item.name) for (const door of room.doors) if (near(door.z, item.z - rear)) door.z = item.z + frontZ;
  buildYangxinBaoxia(kit, item, f, p, mainRoof);
  f.userData.nameboardMount=fitRegisteredNameboard(kit,f,item.plaqueText??item.name,{z:frontZ-.3,source:p.facadeSource,reason:'Retained model label and backing outside the replacement head wall, not embedded in it'});
  f.userData.yangxinFrontAssembly = { source: p.facadeSource, planSource: p.planSource, mainBays: 3, frontSubdivisions: 9, primaryX, secondaryX, frontZ, columnFront, columnRear, retainedMainWidth: 36, spacingStatus: FIT, rearDoor: 'NOT_REBUILT', rearConnector: 'NOT_REBUILT', removedMeshCount: removed.length };
}

function buildYangxinBaoxia(kit, item, f, p, mainRoof) {
  const y = item.ph, front = -11.5, rear = -6.35, eaveZ = -12.05, top = 6.9;
  const g = tag(new THREE.Group(), 'r48-yangxin-middle-west-baoxia', { ...provenance(p), planSource: p.planSource, planPage: 73, photoSource: 'https://img.dpm.org.cn/Uploads/Picture/2017/01/06/s586f3eba40de4.jpg', sections: [{ name: '明间前抱厦', x0: -6, x1: 6 }, { name: '西次间前抱厦', x0: 6, x1: 18 }], geometryStatus: 'CONTIGUOUS_TWO_SECTION_PLAN_TYPE_MODEL_ENVELOPE_FIT', projection: 5.5 }); f.add(g);
  const platformFront = eaveZ, platformRear = -(item.d + 2 * item.pad + .12) / 2;
  const width = 25.1, cx = 6, wood = kit.lib.material('wood_column');
  block(kit, g, 'r48-yangxin-baoxia-plinth', kit.lib.material('wall_brick'), width, y - .07, platformRear - platformFront, cx, (y - .07) / 2, (platformFront + platformRear) / 2, provenance(p));
  block(kit, g, 'r48-yangxin-baoxia-floor', kit.lib.material('stone_slab'), width, .08, platformRear - platformFront, cx, y - .03, (platformFront + platformRear) / 2, provenance(p));
  kit.walkBox(f, cx - width / 2, platformFront, cx + width / 2, platformRear + .07, y);
  kit.col(f, cx - width / 2 + .05, 0, platformFront + .05, cx + width / 2 - .05, y, platformRear);
  const stairStart = f.children.length;
  kit.steps(f, { zEdge: platformFront, dir: -1, y, width: 4.4 });
  for (const m of f.children.slice(stairStart)) tag(m, 'r48-yangxin-baoxia-visible-step', provenance(p));
  for (const x of [-6, -2, 2, 6, 10, 14, 18]) {
    tag(kit.mesh(g, new THREE.CylinderGeometry(.24, .25, top - y, 16), wood, x, (top + y) / 2, front), 'r48-yangxin-baoxia-front-column', { ...provenance(p), subtype: [-6, 6, 18].includes(x) ? 'SECTION_BOUNDARY' : 'ADDED_FRONT_SUBDIVISION' });
    kit.col(f, x - .25, y, front - .25, x + .25, y + 3, front + .25);
  }
  const curveY = z => top + Math.sin((z - eaveZ) / (-6.1 - eaveZ) * Math.PI) * 2.4;
  curvedBearing(kit, g, 'r48-yangxin-baoxia-front-beam', kit.lib.material('caihua_beam'), cx, 24.5, front - .20, front + .20, top - .40, z => curveY(z) - .10, p);
  // Three depth beams physically connect front support and retained shell posts.
  for (const x of [-6, 6, 18]) block(kit, g, 'r48-yangxin-baoxia-depth-beam', wood, .28, .38, rear - front, x, top - .15, (front + rear) / 2, provenance(p));
  for (const x of [-6, 6, 18]) for (const z of [-10.1, -8.4]) curvedBearing(kit, g, 'r48-yangxin-baoxia-plain-roof-strut', wood, x, .24, z - .12, z + .12, top, zz => curveY(zz) - .10, p);
  f.updateMatrixWorld(true);
  const roofMeshes = []; mainRoof.traverse(o => { if (o.isMesh && o.material === kit.lib.material('roof_tile')) roofMeshes.push(o); });
  if (!roofMeshes.length) throw Error('R48 Yangxin requires real main roof tile surfaces for join');
  const ray = new THREE.Raycaster(), down = new THREE.Vector3(0, -1, 0);
  const mainY = (x, z) => { ray.set(new THREE.Vector3(item.x + x, 30, item.z + z), down); const hit = ray.intersectObjects(roofMeshes, false)[0]; return hit ? hit.point.y : null; };
  const seam = [];
  for (let i = 0; i <= 50; i++) {
    const x = -6.55 + 25.1 * i / 50;
    let a = null, b = null;
    for (let z = -8.2; z <= rear; z += .02) { const roofY = mainY(x, z); if (roofY === null) continue; if (curveY(z) >= roofY) a = z; else if (a !== null) { b = z; break; } }
    if (a === null || b === null) throw Error(`R48 Yangxin no supported roll-roof intersection at x=${x}`);
    for (let n = 0; n < 20; n++) { const z = (a + b) / 2; if (curveY(z) > mainY(x, z)) a = z; else b = z; }
    const z = (a + b) / 2; seam.push({ x, z, y: mainY(x, z) });
  }
  const pos = [], uv = [], idx = [], nz = 24;
  for (const q of seam) for (let j = 0; j <= nz; j++) { const z = eaveZ + (q.z - eaveZ) * j / nz; pos.push(q.x, curveY(z), z); uv.push((q.x + 6.55) / 1.2, (z - eaveZ) / 1.2); }
  for (let i = 0; i < seam.length - 1; i++) for (let j = 0; j < nz; j++) { const a = i * (nz + 1) + j, b = a + nz + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geometry.setIndex(idx); geometry.computeVertexNormals();
  tag(kit.mesh(g, geometry, kit.lib.material('roof_tile'), 0, 0, 0), 'r48-yangxin-roll-roof', { ...provenance(p), seam, joinStatus: 'TRIMMED_TO_ACTUAL_RETAINED_ROOF_INTERSECTION_NOT_FULL_OVERLAPPING_ROOF' });
  const under = geometry.clone(); under.translate(0, -.10, 0); const reverse = [...idx]; for (let i = 0; i < reverse.length; i += 3) [reverse[i + 1], reverse[i + 2]] = [reverse[i + 2], reverse[i + 1]]; under.setIndex(reverse); under.computeVertexNormals();
  tag(kit.mesh(g, under, kit.lib.material('rafters'), 0, 0, 0), 'r48-yangxin-roll-roof-underside', provenance(p));
  // Original plain fascia, not copied carvings. It closes the two end profiles
  // down to the supported depth beam, including the short strip below main roof.
  for (const q of [seam[0], seam.at(-1)]) {
    const points = [], indices = [], count = 40;
    for (let j = 0; j <= count; j++) { const z = eaveZ + (rear - eaveZ) * j / count, yy = z <= q.z ? curveY(z) : mainY(q.x, z); points.push(q.x, top - .10, z, q.x, yy - .10, z); }
    for (let j = 0; j < count; j++) { const a = j * 2; indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    if (q === seam[0]) for (let i = 0; i < indices.length; i += 3) [indices[i + 1], indices[i + 2]] = [indices[i + 2], indices[i + 1]];
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3)); geo.setIndex(indices); geo.computeVertexNormals();
    tag(kit.mesh(g, geo, ownMaterial(kit, `r48_yangxin_baoxia_plain_fascia_${q.x}`, 0x772d24), 0, 0, 0), 'r48-yangxin-baoxia-plain-gable-fascia', provenance(p));
  }
  block(kit, g, 'r48-yangxin-baoxia-front-roof-edge', wood, 25.1, .10, .08, 6, top - .05, eaveZ, provenance(p));
  // A raised narrow seam cover bridges real surfaces with no coplanar duplicate.
  const capPos = [], capIndex = [];
  for (const q of seam) for (const dz of [-.10, 0, .10]) capPos.push(q.x, (dz < 0 ? curveY(q.z + dz) : mainY(q.x, q.z + dz)) + .025, q.z + dz);
  for (let i = 0; i < seam.length - 1; i++) for (let j = 0; j < 2; j++) { const a = i * 3 + j; capIndex.push(a, a + 1, a + 3, a + 1, a + 4, a + 3); }
  const cap = new THREE.BufferGeometry(); cap.setAttribute('position', new THREE.Float32BufferAttribute(capPos, 3)); cap.setIndex(capIndex); cap.computeVertexNormals();
  tag(kit.mesh(g, cap, ownMaterial(kit, 'r48_yangxin_plain_join_cap_fit', 0xa87e37), 0, 0, 0), 'r48-yangxin-roof-seam-cap', { ...provenance(p), heightOffset: .025, function: 'FITTED_NON_COPLANAR_JOIN_COVER_NOT_SURVEYED_TILE_DETAIL' });
}

/** Plain fitted bearing prism whose top follows the real curved roof underside.
 * It avoids hanging a roof above a low rectangular beam or poking a square
 * strut through the outer tile surface. This is not a historical joinery claim. */
function curvedBearing(kit, parent, role, material, x, width, z0, z1, bottom, topAt, p) {
  const outline = new THREE.Shape(); outline.moveTo(-z0, bottom); outline.lineTo(-z1, bottom);
  for (let j = 8; j >= 0; j--) { const z = z0 + (z1 - z0) * j / 8; outline.lineTo(-z, topAt(z)); }
  outline.closePath();
  const geometry = new THREE.ExtrudeGeometry(outline, { depth: width, bevelEnabled: false, steps: 1 });
  geometry.rotateY(Math.PI / 2); geometry.translate(x - width / 2, 0, 0);
  return tag(kit.mesh(parent, geometry, material, 0, 0, 0), role, { ...provenance(p), framingStatus: 'PLAIN_SUPPORTED_MODEL_FIT_NOT_MEASURED_JOINERY' });
}

/** Clip an auxiliary roof only. No main-roof mutation, hidden duplicate rear
 * slope or extra drawing layer. All vertex attributes are interpolated so the
 * retained UV and outward normals survive the join. */
function clipRoofToHallPlane(roof, hall, plane) {
  hall.updateMatrixWorld(true);
  const inverseHall = hall.matrixWorld.clone().invert();
  roof.traverse(m => {
    if (!m.isMesh) return;
    const geometry = m.geometry, attrs = Object.entries(geometry.attributes), index = geometry.index;
    const localToHall = inverseHall.clone().multiply(m.matrixWorld), localPlane = plane.clone().applyMatrix4(localToHall.clone().invert());
    const arrays = Object.fromEntries(attrs.map(([name]) => [name, []]));
    const position = new THREE.Vector3();
    const distance = v => localPlane.distanceToPoint(position.fromArray(v.position));
    const vertex = i => Object.fromEntries(attrs.map(([name, a]) => [name, Array.from(a.array.slice(i * a.itemSize, (i + 1) * a.itemSize))]));
    const blend = (a, b, t) => Object.fromEntries(attrs.map(([name]) => [name, a[name].map((value, k) => value + (b[name][k] - value) * t)]));
    for (let i = 0; i < (index?.count ?? geometry.attributes.position.count); i += 3) {
      const input = [0, 1, 2].map(j => vertex(index ? index.getX(i + j) : i + j)), output = [];
      for (let j = 0; j < input.length; j++) {
        const a = input[j], b = input[(j + 1) % input.length], da = distance(a), db = distance(b);
        if (da >= -1e-7) output.push(a);
        if ((da >= 0) !== (db >= 0)) output.push(blend(a, b, da / (da - db)));
      }
      for (let j = 1; j < output.length - 1; j++) for (const v of [output[0], output[j], output[j + 1]]) for (const [name] of attrs) arrays[name].push(...v[name]);
    }
    const clipped = new THREE.BufferGeometry();
    for (const [name, a] of attrs) clipped.setAttribute(name, new THREE.Float32BufferAttribute(arrays[name], a.itemSize));
    clipped.normalizeNormals(); m.geometry = clipped; geometry.dispose();
  });
}

/** Explicit reversible visitor-access fit. These two visible steps are not
 * evidence of historic stair positions and do not alter the source main door. */
function buildRearPorchSideSteps(kit, item, f, p) {
  const edgeX = (item.w + 2 * item.pad) / 2, z = item.d / 2 - p.rearInset / 2;
  for (const side of [-1, 1]) {
    const g = tag(new THREE.Group(), 'r48-residential-rear-porch-access-step', { ...provenance(p), side, width: 1.5, purpose: 'REVERSIBLE_VISITOR_ACCESS_NOT_ATTESTED_HISTORIC_STAIR', porchDepth: p.rearInset });
    g.position.set(side * edgeX, 0, z); g.rotation.y = -side * Math.PI / 2; f.add(g); f.updateMatrixWorld(true);
    kit.steps(g, { zEdge: 0, dir: -1, y: item.ph, width: 1.5 });
    for (const m of g.children) tag(m, 'r48-residential-rear-porch-visible-tread', { ...provenance(p), side, purpose: 'VISITOR_ACCESS_FIT' });
  }
}
