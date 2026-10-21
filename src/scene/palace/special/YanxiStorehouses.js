import * as THREE from 'three';
import { applyBoxUV } from '../../../utils/GeometryUV.js';

const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};

/** Only the architectural TYPE is source-closed. The three existing envelopes,
 * short side-wing lengths, roof profiles, window counts and entrance positions
 * are retained game fits, not a measured 1931 or present-day plan. */
export const YANXI_STOREHOUSE_PROFILES = freeze({
  north: { x:-148.2,z:341.6,w:24,d:9.6,pad:.6,ph:.45,colH:6.08,roof:'xieshan',rot:0 },
  east: { x:-164.68,z:313.7,w:11.2,d:7.04,pad:.5,ph:.45,colH:5.44,roof:'gable',rot:'west',brackets:false },
  west: { x:-131.72,z:313.7,w:11.2,d:7.04,pad:.5,ph:.45,colH:5.44,roof:'gable',rot:'east',brackets:false },
});

export function yanxiStorehouseGeometry(item) {
  const p = YANXI_STOREHOUSE_PROFILES[item?.storehouseProfile];
  if (!p || item.structure !== 'yanxi-storehouse') throw new Error('Yanxi storehouse requires an explicit retained profile');
  for (const [key,value] of Object.entries(p)) {
    const actual = key === 'rot' && item[key] === undefined ? 0 : item[key];
    if (actual !== value) throw new Error(`Yanxi storehouse retained ${key} drift`);
  }
  for (const key of ['enter','open','backDoor','throne','interior','bays','roomBays','roofH','layers','eaveCount','storeys','name','plaque','plaqueText']) {
    if (item[key] !== undefined) throw new Error(`Yanxi storehouse override is unsupported: ${key}`);
  }
  const bays = Math.max(3, Math.round(p.w / 3.6) | 1), bay = p.w / bays;
  return { ...p, profile:item.storehouseProfile, rot:p.rot === 'west' ? -Math.PI/2 : p.rot === 'east' ? Math.PI/2 : 0,
    id:`east-six/yanxi-storehouse-${item.storehouseProfile}`, storeys:2, bays, bay,
    doorWidth:bay - 2 * THREE.MathUtils.clamp(bay*.07,.2,.34), doorTop:p.ph+2.9,
    planStatus:'inherited-short-wings-not-closed', currentConditionAccepted:false,
    dimensionStatus:'retained-envelope-photo-fit-not-survey',
    accessStatus:'legacy-central-door-and-interior-retained-for-gameplay-not-site-access',
    roofStatus:'yellow-glaze-supported-shape-and-envelope-retained-unverified',
    sources: [
      'https://www.dpm.org.cn/lemmas/240806.html',
      'https://www.dpm.org.cn/Uploads/pdf/4881/T00097_00.pdf',
      'https://www.dpm.org.cn/research_talk/256929.html',
      'https://www.dpm.org.cn/explore/building/236535.html',
    ],
  };
}

function materials(kit) {
  // Shared only by these three buildings in this kit; no global library edit.
  if (!kit._yanxiStorehouseMaterials) {
    const make = (name,color,roughness,metalness=0) => {
      const m = new THREE.MeshStandardMaterial({name,color,roughness,metalness});kit.owned.push(m);return m;
    };
    kit._yanxiStorehouseMaterials = {
      pale:make('yanxi_storehouse_pale',0xc8c8bc,.94),
      iron:make('yanxi_storehouse_iron',0x454844,.8,.28),
      recess:make('yanxi_storehouse_recess',0x303934,1),
    };
  }
  return kit._yanxiStorehouseMaterials;
}

/** Deliberate compatibility adapter: keep the existing roof, plinth, floor,
 * inner furniture and navigation records, but physically replace ALL direct
 * generic facade meshes. This avoids invisible old furniture colliders, new
 * blocked entrances, duplicated roofs, or a second independent COL formula.
 * Tests compare complete world COL/support/room arrays and visible bounds
 * against the frozen pre-change inputs. No generic interior is source-accepted. */
export function buildYanxiStorehouse(kit,item) {
  const g = yanxiStorehouseGeometry(item); // Reject drift before allocating.
  const built = kit.hall({ ...YANXI_STOREHOUSE_PROFILES[g.profile], rot:g.rot, map:'hall' });
  const f = built.f; f.name = `延禧宫1931库房-${g.profile}`;
  const removed = new Set(), retained = new Set();
  for (const m of [...f.children]) {
    if (m.isMesh && ['wood_column','wall_red','lattice_doors','caihua_beam'].some(key=>m.material===kit.lib.material(key))) {
      removed.add(m.geometry); f.remove(m);
    } else if (m.isGroup) {
      m.name = 'yanxi-storehouse-retained-roof'; m.userData.role = m.name;
    }
  }
  f.traverse(m=>{if(m.geometry)retained.add(m.geometry);});
  for (const geo of removed) if (!retained.has(geo)) geo.dispose();
  const mats = materials(kit);
  function box(parent,role,material,w,h,d,x,y,z,extra={}) {
    const tile = material === red ? kit.lib.tileSize('wall_red') : 1;
    const m = kit.mesh(parent,applyBoxUV(new THREE.BoxGeometry(w,h,d),tile),material,x,y,z);
    m.name = role; Object.assign(m.userData,{role,...extra}); return m;
  }
  const red = kit.lib.material('wall_red'), front = -g.d/2, halfDoor = g.doorWidth/2;
  // Existing side and back wall faces, with continuous masonry to the eaves.
  for (const sign of [-1,1]) box(f,'yanxi-storehouse-wall',red,.7,g.colH,g.d,sign*g.w/2,g.ph+g.colH/2,0);
  box(f,'yanxi-storehouse-wall',red,g.w,g.colH,.6,0,g.ph+g.colH/2,g.d/2);
  for (const sign of [-1,1]) box(f,'yanxi-storehouse-wall',red,g.w/2-halfDoor,g.colH,.5,sign*(g.w/2+halfDoor)/2,g.ph+g.colH/2,front);
  box(f,'yanxi-storehouse-wall',red,g.doorWidth,g.ph+g.colH-g.doorTop,.5,0,(g.ph+g.colH+g.doorTop)/2,front);
  // A plain soffit replaces the previous painted palace ceiling. This is not
  // an invented second-floor walkable or a representation of a surveyed room.
  const beamH = THREE.MathUtils.clamp(g.colH*.12,.45,.85);
  box(f,'yanxi-storehouse-plain-soffit',mats.pale,g.w,.04,g.d,0,g.ph+g.colH-beamH-.02,0);

  const windowW = Math.min(1.3,g.bay*.46), trim=.095, depth=.075;
  for (let level=1;level<=2;level++) for (let bay=0;bay<g.bays;bay++) {
    if (level===1 && bay===Math.floor(g.bays/2)) continue; // retained game doorway
    const x = -g.w/2+(bay+.5)*g.bay;
    const y = level===1 ? g.ph+1.35 : g.ph+g.colH*.77;
    const h = level===1 ? 1.45 : Math.min(1.55,g.colH*.27);
    const win = new THREE.Group();win.name='yanxi-storehouse-window';
    Object.assign(win.userData,{role:win.name,storey:level,countStatus:'inherited-bay-fit-not-measured'});
    win.position.set(x,y,front-.29);f.add(win);
    // Modern official colour photograph has pale closed lower panels. Upper
    // openings show actual iron bars. Do not copy the old photo into both rows.
    box(win,level===1?'yanxi-storehouse-lower-panel':'yanxi-storehouse-upper-recess',level===1?mats.pale:mats.recess,windowW,h,.025,0,0,.021);
    for (const sign of [-1,1]) {
      box(win,'yanxi-storehouse-window-surround',mats.pale,trim,h+trim*2,depth,sign*(windowW+trim)/2,0,0);
      box(win,'yanxi-storehouse-window-surround',mats.pale,windowW,trim,depth,0,sign*(h+trim)/2,0);
    }
    if (level===2) {
      for(let k=1;k<=7;k++)box(win,'yanxi-storehouse-upper-bar',mats.iron,.028,h,.028,-windowW/2+k*windowW/8,0,-.022);
      for(const sign of [-1,1])box(win,'yanxi-storehouse-upper-bar',mats.iron,windowW,.025,.028,0,sign*h*.24,-.022);
    }
  }
  // Modest masonry door surround, wholly inside the retained collision jambs.
  const doorTrim = .09;
  for(const sign of [-1,1])box(f,'yanxi-storehouse-door-surround',mats.pale,doorTrim,g.doorTop-g.ph,.08,sign*(halfDoor+doorTrim/2),(g.ph+g.doorTop)/2,front-.29);
  box(f,'yanxi-storehouse-door-surround',mats.pale,g.doorWidth+doorTrim*2,doorTrim,.08,0,g.doorTop+doorTrim/2,front-.29);
  f.userData.structure = structuredClone(g);
  f.updateMatrixWorld(true);
  return {...built,g};
}
