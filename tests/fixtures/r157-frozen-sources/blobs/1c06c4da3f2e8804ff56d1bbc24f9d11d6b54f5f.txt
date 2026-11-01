import * as THREE from 'three';
import {buildWallCap} from '../../RoofBuilder.js';
import {createXiqingSurface} from '../../../controls/XiqingRoofSurface.js';
import {qianqingScreenRegion} from '../../../controls/QianqingScreenSupport.js';

export function buildQianqingGateScreens(builder, g, {halfW, d, info, worldPoint}) {
  const glaze = builder.ownMat('qianqing_glaze_green', { name: 'qianqing_glaze_green', color: 0x237b61, roughness: 0.36 });
  const gold = builder.ownMat('qianqing_glaze_gold', { name: 'qianqing_glaze_gold', color: 0xbf922b, roughness: 0.38 });
  const pink = builder.ownMat('qianqing_screen_center', { name: 'qianqing_screen_center', color: 0xa85c4d, roughness: 0.85 });
  for (const side of [-1, 1]) {
    const p0 = { x: side * halfW, z: -d / 2 };
    const p1 = { x: p0.x + side * 3.1, z: p0.z };
    const p2 = { x: p1.x + side * 6.6 * Math.cos(Math.PI / 6), z: p1.z - 6.6 * Math.sin(Math.PI / 6) };
    const thickness = 0.8;
    for (const [part, [a, b]] of [[p0, p1], [p1, p2]].entries()) {
      const height = part === 0 ? 6.4 : 8; // photograph fit, not a surveyed short-wall height
      const drop = 8 - height;
      const dx = b.x - a.x, dz = b.z - a.z, length = Math.hypot(dx, dz);
      const f = new THREE.Group();
      f.position.set((a.x + b.x) / 2, 0, (a.z + b.z) / 2);
      f.rotation.y = -Math.atan2(dz, dx);
      g.add(f);
      builder.libBox(f, 'wall_brick', length, 0.65, thickness + 0.2, 0, 0.325, 0);
      builder.box(f, pink, length, 6.85 - drop, thickness, 0, 4.075 - drop / 2, 0);
      for (const z of [-thickness / 2 - 0.04, thickness / 2 + 0.04]) {
        for (const yy of [0.85, 7.25 - drop]) builder.box(f, gold, length, 0.2, 0.12, 0, yy, z);
        for (const yy of [1.08, 6.98 - drop]) builder.box(f, glaze, length, 0.23, 0.13, 0, yy, z);
        for (const s of [-1, 1]) {
          builder.box(f, gold, 0.16, 6.5 - drop, 0.12, s * (length / 2 - 0.12), 4.05 - drop / 2, z);
          builder.box(f, glaze, 0.22, 6.1 - drop, 0.13, s * (length / 2 - 0.32), 4.05 - drop / 2, z);
        }
        const motif = new THREE.Mesh(new THREE.CircleGeometry(Math.min(1.05, length * 0.24), 24), glaze);
        motif.position.set(0, 4.05 - drop / 2, z + Math.sign(z) * 0.08);
        if (z < 0) motif.rotation.y = Math.PI;
        f.add(motif);
        // Abstract radial glaze, not a claim to reproduce historical relief.
        for (let k = 0; k < 8; k++) {
          const angle = k * Math.PI / 4;
          const m = builder.box(f, gold, 0.18, 0.55, 0.09, Math.cos(angle) * 0.55, 4.05 - drop / 2 + Math.sin(angle) * 0.55, z + Math.sign(z) * 0.1);
          m.rotation.z = angle - Math.PI / 2;
        }
      }
      if (part === 1) buildMainFront(builder, f, {length, front: -side, glaze, gold, pink});
      const cap = buildWallCap(builder.library, { length, thickness });
      cap.position.y = height - cap.userData.topY;
      f.add(cap);
      builder.ownedMaterials.push(...(cap.userData.ownedMaterials ?? []));
      registerCapContact(builder, cap, `qianqing-screen:${side}:${part}`);
      // Short aligned boxes approximate the rotated solid without falsely
      // blocking the triangular empty region behind a large screen-wall AABB.
      const segments = Math.ceil(length / 0.4);
      for (let k = 0; k < segments; k++) {
        const ax = a.x + dx * k / segments, az = a.z + dz * k / segments;
        const bx = a.x + dx * (k + 1) / segments, bz = a.z + dz * (k + 1) / segments;
        builder.col(Math.min(ax, bx) - thickness / 2, 0, Math.min(az, bz) - thickness / 2,
          Math.max(ax, bx) + thickness / 2, height - 0.5, Math.max(az, bz) + thickness / 2);
      }
    }
    const owner=builder.colliders.at(-1),region=qianqingScreenRegion(side);
    owner.furnitureMotionScope={kind:'qianqing-screen-caps',id:side<0?'qianqing-screen-east':'qianqing-screen-west',minOffsetX:region.minX-owner.min.x,maxOffsetX:region.maxX-owner.min.x,minOffsetZ:region.minZ-owner.min.z,maxOffsetZ:region.maxZ-owner.min.z};
    info.screens.push({ start: worldPoint(p0.x, p0.z), fold: worldPoint(p1.x, p1.z), end: worldPoint(p2.x, p2.z),
      segments: [{kind:'connector', fittedHeight:6.4}, {kind:'main', fittedHeight:8}], wholeScreenAccepted:false, thickness, officialHeight: 8, officialLength: 9.7, measurementBasis: 'provisional', angleDegrees: 30 });
  }
  return [glaze, gold, pink];
}

// Contact is derived from the actual generated cap, not an invisible flat shelf.
function registerCapContact(builder, cap, id) {
  cap.updateWorldMatrix(true, true);
  const faces = []; let meshIndex = 0;
  cap.traverse(m => {
    if (!m.isMesh) return;
    const mesh = meshIndex++, p = m.geometry.attributes.position, index = m.geometry.index;
    for (let i = 0; i < (index?.count ?? p.count); i += 3) {
      faces.push({source:{mesh,triangle:i/3},vertices:[0,1,2].map(k=>{
        const v=new THREE.Vector3().fromBufferAttribute(p,index?index.getX(i+k):i+k).applyMatrix4(m.matrixWorld);
        // mergeByMaterial writes local transformed positions to Float32 before
        // the building's world translation. Reproduce that exact rendering stage.
        return new THREE.Vector3(Math.fround(v.x)+builder.ox,Math.fround(v.y),Math.fround(v.z)+builder.oz);
      })});
    }
  });
  const surface=createXiqingSurface(faces,id),box=surface.box.clone();
  box.xiqingRoofSurface=surface;
  builder.colliders.push(box);
}

// South face only: clipped pink field and glazed corner zones visible in both
// official photographs. Sizes and abstract rosettes are fitted, not carved replicas.
function buildMainFront(builder, f, {length, front, glaze, gold, pink}) {
  const half = length / 2 - 0.48, low = 1.35, high = 6.75, clip = 1.0;
  builder.box(f, glaze, half * 2, high - low, 0.02, 0, (low + high) / 2, front * 0.415);
  const points = [[-half+clip,low],[half-clip,low],[half,low+clip],[half,high-clip],
    [half-clip,high],[-half+clip,high],[-half,high-clip],[-half,low+clip]];
  const shape = new THREE.Shape(points.map(([x,y]) => new THREE.Vector2(x,y)));
  const panel = new THREE.Mesh(new THREE.ShapeGeometry(shape), pink);
  panel.position.z = front * 0.432;
  // ShapeGeometry is +Z facing; reflect X for the -Z face without changing its
  // symmetrical outline. No mirrored winding or one-sided east/west omission.
  if (front < 0) panel.rotation.y = Math.PI;
  f.add(panel);
  for (let i = 0; i < points.length; i++) {
    const [x,y] = points[i], [xx,yy] = points[(i+1)%points.length];
    const edge = builder.box(f, gold, Math.hypot(xx-x,yy-y), 0.065, 0.035, (x+xx)/2, (y+yy)/2, front*0.45);
    edge.rotation.z = Math.atan2(yy-y,xx-x);
  }
  for (const sx of [-1,1]) for (const sy of [-1,1]) {
    const x=sx*(half-0.23), y=sy<0?low+0.23:high-0.23;
    const flower = new THREE.Mesh(new THREE.CircleGeometry(0.14, 8), gold);
    flower.position.set(x,y,front*0.443);
    if(front<0)flower.rotation.y=Math.PI;
    f.add(flower);
  }
  // New tiers stay inside the actual 0.8 m wall blockers; the original 1 m-wide bottom plinth remains unchanged.
  for (const [y,h,depth,material] of [[0.14,0.14,0.8,gold],[0.34,0.12,0.74,glaze],
    [0.54,0.12,0.8,gold],[0.76,0.14,0.7,glaze],[1.02,0.14,0.76,gold]]) {
    builder.box(f,material,length,h,depth,0,y,0);
  }
}
