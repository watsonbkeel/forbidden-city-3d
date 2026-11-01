import * as THREE from 'three';
import { applyBoxUV } from '../../utils/GeometryUV.js';

/** Museum text establishes north/south three approaches, central carved stone.
 * Existing 4.6m width / .6m rise / anchors are retained estimates, not surveyed.
 * The reused carving texture is illustrative; the photograph's movable barrier
 * is not copied as permanent architecture or a claim about today's admission. */
export const ZHONGHE_IMPERIAL_APPROACH = Object.freeze({
  id: 'zhonghe-central-imperial-stone',
  source: 'https://www.dpm.org.cn/explore/building/236464.html',
  image: 'https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5eff05cd7866d.jpg',
  evidenceClass: 'OFFICIAL_TOPOLOGY_INHERITED_PROVISIONAL_DIMENSIONS',
  walkingPolicy: 'NO_GAMEPLAY_WALKABLE', currentVisitorAccess: 'UNKNOWN',
});

export function buildZhongheImperialApproach(b, g, { zEdge, dir, y0, y1, run, width }) {
  const rise = y1 - y0, cw = .45, inner = width - 2*cw;
  const id = `${ZHONGHE_IMPERIAL_APPROACH.id}:${dir < 0 ? 'south' : 'north'}`;
  g.name = id; g.userData.imperialApproach = { ...ZHONGHE_IMPERIAL_APPROACH, zEdge, dir, y0, y1, run, width };
  const section = new THREE.Shape();
  section.moveTo(0,0); section.lineTo(run,0); section.lineTo(0,rise); section.closePath();
  const base = new THREE.ExtrudeGeometry(section, {depth:inner,bevelEnabled:false,steps:1,curveSegments:1});
  base.translate(0,0,-inner/2); base.rotateY(-dir*Math.PI/2); base.translate(0,y0,zEdge);
  const body = new THREE.Mesh(applyBoxUV(base,b.library.tileSize('marble')),b.library.material('marble'));
  body.name = `${id}:solid-base`; body.castShadow = body.receiveShadow = true; g.add(body);
  const length = Math.hypot(run,rise), angle = dir*Math.atan2(rise,run), zc = zEdge+dir*run/2;
  const slab = b.box(g,b.library.material('yulu'),inner,.18,length,0,(y0+y1)/2+.06,zc);
  slab.rotation.x = angle; slab.name = `${id}:carved-slab`;
  for (const side of [-1,1]) {
    const cheek = b.box(g,b.library.material('marble'),cw,.3,length,
      side*(width/2-cw/2),(y0+y1)/2+.1,zc,{box:b.library.tileSize('marble')});
    cheek.rotation.x = angle; cheek.name = `${id}:cheek:${side}`;
  }
  // Tight segments follow the actual visible stone, rather than a tall invisible
  // fence. No ramp is registered: players use either adjacent staircase.
  for (let j=0;j<16;j++) b.col(-width/2,y0,zEdge+dir*j*run/16,
    width/2,y1-j*rise/16+.25,zEdge+dir*(j+1)*run/16);
}
