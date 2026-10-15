import * as THREE from 'three';
import { buildRoof } from '../../RoofBuilder.js';
import { applyPlanarUV } from '../../../utils/GeometryUV.js';
import { bindKunningProfile, KUNNING_CONTRACT, KUNNING_PROFILE } from './KunningProfile.js';

/**
 * Permanent B enclosure. S owns furniture only. Dimensional values are inherited
 * or provisional fits; evidence establishes the nine-total/seven-interior
 * topology, recessed southern enclosure, offset plank door and sill windows.
 * This helper never begins/finishes a palace or changes the parent's offsets.
 */
export function buildKunningPalace(builder, parent, data, floorY, source = KUNNING_PROFILE) {
  const binding = bindKunningProfile(data, floorY, source);
  const p = binding.profile, { height: H, beamHeight } = p.body;
  const x0 = data.position.x, z0 = data.position.z;
  const shell = new THREE.Group();
  shell.name = '坤宁宫·入口与围护';
  parent.add(shell);
  shell.userData.structure = {
    id: 'kunninggong', profileId: p.profileId, profileRevision: p.revision,
    profileHash: p.profileHash, ownership: 'B-architecture',
    floorY, outerBayCount: p.outerBays.length, interiorBayCount: p.roomBayIds.length,
    dimensionStatus: 'provisional', topologyStatus: 'source-compared',
    portals: p.portals.map(portal => ({
      id: portal.id, state: portal.state, outerBayId: portal.outerBayId,
      clearBounds: binding.bounds(portal.clearBounds),
    })),
    columnsStatus: p.provenance.columns,
    partitionOpenings: p.provenance.partitionOpenings,
    furnitureContract: KUNNING_CONTRACT,
  };

  function collision(bounds) {
    const b = binding.bounds(bounds);
    builder.col(...b.min, ...b.max);
  }
  function box(id, bounds, material, collide = false, mode = 'box') {
    const b = binding.bounds(bounds);
    const size = b.max.map((v, i) => v - b.min[i]);
    const center = b.min.map((v, i) => (v + b.max[i]) / 2);
    const mesh = builder.libBox(shell, material, ...size, ...center, mode);
    mesh.name = id;
    if (collide) collision(bounds);
    return mesh;
  }
  const bounds = (x0, y0, z0, x1, y1, z1) => ({ min: [x0, y0, z0], max: [x1, y1, z1] });

  // Preserve the previous explicit post positions rather than asserting a new
  // historical column grid. All 40 provisional posts clear the corrected routes.
  const columnMat = builder.library.material('wood_column');
  const geometries = new Map();
  for (const column of p.columns) {
    const { height, radius, position, id } = column;
    const key = `${height}:${radius}`;
    if (!geometries.has(key)) geometries.set(key, new THREE.CylinderGeometry(radius, radius * 1.05, height, 14));
    const [x, y, z] = binding.point(position);
    const mesh = new THREE.Mesh(geometries.get(key), columnMat);
    mesh.name = id;
    mesh.position.set(x, y + height / 2, z);
    mesh.castShadow = true;
    shell.add(mesh);
    builder.col(x - radius, y, z - radius, x + radius, y + 3, z + radius);
  }

  for (const barrier of p.barriers) box(barrier.id, barrier.bounds, barrier.material, barrier.collision);

  for (const portal of p.portals) {
    const t = portal.threshold;
    box(`${portal.id}-threshold`, t.bounds, t.material, true);
    const b = binding.bounds(t.bounds);
    builder.walkBox(b.min[0], b.min[2], b.max[0], b.max[2], b.max[1]);
    for (const leaf of portal.leaves) {
      // Explicit axis-aligned right-angle open pose; geometry and body blocker
      // use the exact same bounds. No historic stud array is invented.
      box(leaf.id, leaf.bounds, 'wood_column', true);
    }
  }

  for (const window of p.windows) {
    const { min, max } = window.bounds;
    const [left,, south] = min, [right, top, north] = max;
    const { sillHeight, lowerTop, frameWidth: fw, barWidth: bw, barCount } = window;
    // The continuous solid sill is the player barrier. Windows never become
    // invisible full-height walls: every collider has matching physical mesh.
    box(`${window.id}-sill`, bounds(left,0,south,right,sillHeight,north), 'wall_brick', true);
    const cx = (left + right) / 2, cz = (south + north) / 2;
    for (const x of [left + fw / 2, right - fw / 2]) {
      box(`${window.id}-stile`, bounds(x-fw/2,sillHeight,cz-.09,x+fw/2,top,cz+.09), 'wood_column', true);
    }
    for (const y of [sillHeight, lowerTop]) {
      box(`${window.id}-rail`, bounds(left,y,cz-.1,right,y+fw,cz+.1), 'wood_column', true);
    }
    // Vertical straight bars are real triangles, not a generic diagonal-door
    // texture. Modest count preserves the original unchanged submission budget.
    for (let i = 1; i <= barCount; i++) {
      const x = left + fw + (right-left-2*fw)*i/(barCount+1);
      box(`${window.id}-vertical-bar-${i}`, bounds(x-bw/2,sillHeight,cz-.045,x+bw/2,lowerTop,cz+.045), 'wood_column', true);
    }
    // The upper hung panel is raised outward toward the south. The real frame
    // and bars rotate around its top edge, leaving the porch below unobstructed.
    const flap = new THREE.Group();
    flap.name = `${window.id}-outward-upper-flap`;
    flap.position.set(x0+cx, floorY+top, z0+cz);
    flap.rotation.x = window.flapAngleRadians;
    shell.add(flap);
    const flapW = right-left-2*fw, flapH = top-lowerTop, thickness = window.flapThickness;
    const part = (w,h,x,y) => builder.libBox(flap,'wood_column',w,h,thickness,x,y,0);
    for(const x of [-(flapW-fw)/2,(flapW-fw)/2]) part(fw,flapH,x,-flapH/2);
    for(const y of [-fw/2,-flapH+fw/2]) part(flapW,fw,0,y);
    for(let i=1;i<=3;i++) part(bw,flapH-2*fw,-flapW/2+flapW*i/4,-flapH/2);
  }

  // Unchanged eave beams, roof outline, nominal body height, floor and ceiling.
  const { width: w, depth: d } = p.modelEnvelope;
  for (const s of [-1,1]) {
    builder.libBox(shell,'caihua_beam',w+.6,beamHeight,.6,x0,floorY+H-beamHeight/2,z0+s*d/2,'band');
    builder.libBox(shell,'caihua_beam',.6,beamHeight,d+.6,x0+s*w/2,floorY+H-beamHeight/2,z0,'band');
  }
  const floorGeo = new THREE.PlaneGeometry(w,d);
  floorGeo.rotateX(-Math.PI/2); applyPlanarUV(floorGeo,'y',1.4);
  const floor = new THREE.Mesh(floorGeo,builder.library.material('stone_slab',{color:0x55524e,roughness:.35}));
  floor.position.set(x0,floorY+.03,z0); floor.receiveShadow=true; shell.add(floor);
  const ceilingGeo = new THREE.PlaneGeometry(w,d);
  ceilingGeo.rotateX(Math.PI/2); applyPlanarUV(ceilingGeo,'y',1.6);
  const ceiling = new THREE.Mesh(ceilingGeo,builder.ceilingMaterial());
  ceiling.position.set(x0,floorY+p.body.ceilingY,z0); shell.add(ceiling);
  const ph = THREE.MathUtils.clamp(H*.32,1.8,3.4);
  // Retain the existing exterior plaque's size and eave position.
  const oldDoorH = (H-beamHeight)*.8;
  const plaque=builder.plaqueMesh(data.name,ph*.62,ph,true);
  plaque.position.set(x0,floorY+oldDoorH+(H-beamHeight-oldDoorH)/2+.2,z0-d/2-.4);
  plaque.rotation.y=Math.PI; shell.add(plaque);
  const roof=buildRoof(builder.library,{...p.roof,baseY:floorY+H});
  roof.position.set(x0,0,z0); shell.add(roof);
  builder.ownedMaterials.push(...(roof.userData.ownedMaterials??[]));
  return shell;
}
