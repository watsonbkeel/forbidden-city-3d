import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { applyBoxUV } from '../../../utils/GeometryUV.js';
import { cloneOverheadShape } from '../../../utils/OverheadShape.js';

// FC-AD4377DF51 / R58-A N2. Photo fit, NOT a survey: only the visible
// northern 1.2 m head is curved. The deeper vault and two lateral routes are
// unknown. Inherited passage centres, widths and crown datums are retained.
export const WUMEN_NORTH_PORTAL_FIT = Object.freeze({
  headDepth: 1.2, liningThickness: 0.3, arcSegments: 32,
  source: 'https://img.dpm.org.cn/Uploads/Picture/2019/12/31/s5e0ad0346e8b3.jpg',
  evidence: 'north-head-only-photo-fit; dimensions-not-measured',
});
const OPENINGS = Object.freeze([[-17.5,5,6.5],[0,9,8],[17.5,5,6.5]].map(Object.freeze));

/** Pure profile for the three already-existing central Wumen passages. */
export function wumenNorthPortalProfile({x,width,tunnelHeight,platformHeight,southZ,northZ}) {
  if (!OPENINGS.some(o=>o[0]===x&&o[1]===width&&o[2]===tunnelHeight)
    || platformHeight!==12 || southZ!==-13.3 || northZ!==18.6) {
    throw new Error('Wumen north portal requires its retained three-mouth geometry');
  }
  const f=WUMEN_NORTH_PORTAL_FIT, crownY=tunnelHeight-f.liningThickness;
  const springY=crownY-width/2;
  // Entire new masonry is above the existing 3 m body-proxy ceiling. No new
  // whole-opening AABB or walkable is registered; existing physics is retained.
  if (springY<3) throw new Error('Wumen north head would reduce retained body clearance');
  const arc=Object.freeze(Array.from({length:f.arcSegments+1},(_,i)=>{
    const theta=Math.PI-Math.PI*i/f.arcSegments;
    return Object.freeze([width/2*Math.cos(theta),springY+width/2*Math.sin(theta)]);
  }));
  return Object.freeze({x,width,tunnelHeight,platformHeight,southZ,northZ,crownY,springY,
    headStartZ:northZ-f.headDepth,headDepth:f.headDepth,liningThickness:f.liningThickness,arc,
    deeperVault:'retained-flat-unverified',lateralRoutes:'not-added-unverified'});
}

function prism(points,z0,z1) {
  const shape=new THREE.Shape(points.map(([x,y])=>new THREE.Vector2(x,y)));
  const g=new THREE.ExtrudeGeometry(shape,{depth:z1-z0,bevelEnabled:false,steps:1,curveSegments:1});
  g.translate(0,0,z0);g.clearGroups();return g;
}
function box(w,h,d,x,y,z) {
  const g=new THREE.BoxGeometry(w,h,d);g.translate(x,y,z);g.clearGroups();return g;
}
function joined(parts,origin,tile) {
  const flat=parts.map(g=>g.index?g.toNonIndexed():g);
  const g=mergeGeometries(flat,false);
  for(const p of new Set([...parts,...flat]))p.dispose();
  g.translate(-origin.x,-origin.y,-origin.z);
  return applyBoxUV(g,tile);
}

/** Replace the caller's two flat cap/soffit calls with two genuine closed
 * masonry meshes. No parent mutation beyond adding these two meshes; material,
 * lifecycle, original slot count, doors, colliders and supports stay caller-owned.
 */
export function buildWumenNorthPortal(builder,parent,options) {
  const p=wumenNorthPortalProfile(options),f=WUMEN_NORTH_PORTAL_FIT;
  const zc=(p.southZ+p.northZ)/2, rearZ=(p.southZ+p.headStartZ)/2;
  const outer=p.arc.map(([x,y])=>[x+p.x,y+f.liningThickness]);
  const inner=p.arc.map(([x,y])=>[x+p.x,y]);
  const capOrigin=new THREE.Vector3(p.x,(p.tunnelHeight+p.platformHeight)/2,zc);
  const soffitOrigin=new THREE.Vector3(p.x,p.tunnelHeight-.15,zc);
  const capParts=[
    box(p.width,p.platformHeight-p.tunnelHeight,p.headStartZ-p.southZ,p.x,capOrigin.y,rearZ),
    prism([...outer,[p.x+p.width/2,p.platformHeight],[p.x-p.width/2,p.platformHeight]],p.headStartZ,p.northZ),
  ];
  const soffitParts=[
    // Retain the south soffit's original 0.1 m inset; trim only its north end.
    box(p.width,.3,p.headStartZ-(p.southZ+.1),p.x,soffitOrigin.y,(p.southZ+.1+p.headStartZ)/2),
    prism([...inner,...outer.slice().reverse()],p.headStartZ,p.northZ),
  ];
  const add=(parts,origin,material,part)=>{
    const mesh=new THREE.Mesh(joined(parts,origin,builder.library.tileSize(material)),builder.library.material(material));
    mesh.position.copy(origin);mesh.name=`wumen-north-portal-${p.x}-${part}`;
    mesh.castShadow=mesh.receiveShadow=true;
    mesh.userData.wumenNorthPortal={part,centerX:p.x,width:p.width,crownY:p.crownY,springY:p.springY,
      headStartZ:p.headStartZ,northZ:p.northZ,evidence:f.evidence,deeperVault:p.deeperVault,lateralRoutes:p.lateralRoutes};
    parent.add(mesh);return mesh;
  };
  return {profile:p,cap:add(capParts,capOrigin,'wall_red','masonry'),soffit:add(soffitParts,soffitOrigin,'wall_brick','lining')};
}

/** Separate registration: exactly the three newly modeled 1.2 m north heads.
 * Legacy wall/door/support proxies stay intact. Never treat the broadphase box
 * as solid: CollisionManager must use its validated piecewise-linear overhead.
 */
export function registerWumenNorthPortalOverheads(builder,{openings,southZ,northZ,platformHeight}) {
  if(!Array.isArray(builder.colliders)||!Number.isFinite(builder.ox)||!Number.isFinite(builder.oz))throw new TypeError('Finite builder origin and collider array required');
  if(!Array.isArray(openings)||openings.length!==3||openings.some((o,i)=>o.x!==OPENINGS[i][0]||o.w!==OPENINGS[i][1]))throw new TypeError('Exactly the retained three north openings are required');
  const boxes=openings.map(o=>{
    const p=wumenNorthPortalProfile({x:o.x,width:o.w,tunnelHeight:o.w>=8?8:6.5,platformHeight,southZ,northZ});
    const points=p.arc.map(([x,y])=>[builder.ox+o.x+x,y]);
    const box=new THREE.Box3(new THREE.Vector3(points[0][0],p.springY,p.headStartZ+builder.oz),new THREE.Vector3(points.at(-1)[0],platformHeight,northZ+builder.oz));
    box.overhead=cloneOverheadShape({type:'piecewise-linear-x',points,minZ:box.min.z,maxZ:box.max.z,topY:platformHeight,sourceId:`axis/wumen-north-head/${o.x}`},box);
    return box;
  });
  if(builder.colliders.some(c=>boxes.some(b=>c.overhead?.sourceId===b.overhead.sourceId)))throw new Error('Duplicate Wumen north overhead registration');
  builder.colliders.push(...boxes);return Object.freeze(boxes);
}
