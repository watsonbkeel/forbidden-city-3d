import * as THREE from 'three';
import { buildBalustrade } from '../HallKit.js';
import { closedTerraceStairGeometry } from './ThreeHallTerrace.js';
import { applyBoxUV } from '../../utils/GeometryUV.js';

/** The separated approaches are supported by museum photographs and Yu's 1960
 * plan. Widths/offsets, inherited heights and tread counts are NOT surveyed.
 * This intentionally does not resolve the moon-platform outline registration. */
export const TAIHE_FRONT_APPROACHES = Object.freeze({
  id: 'taihe-south-separated-approaches', centers: [-10.5, 10.5], width: 5,
  cheekWidth: 0.45, imperialWidth: 6,
  evidenceClass: 'PHOTO_PLAN_TOPOLOGY_WITH_PROVISIONAL_DIMENSIONS',
  currentVisitorAccess: 'UNKNOWN', imperialWalkingPolicy: 'NO_GAMEPLAY_WALKABLE',
  sourceUrls: [
    'https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e9926e6ea567.jpg',
    'https://img.dpm.org.cn/Uploads/Picture/2020/04/17/s5e99275d2689f.jpg',
    'https://img.dpm.org.cn/Uploads/File/pdf/c7/92/ed/c792eddcdca8356377637b90520bce08.pdf',
  ],
});

export function taiheSouthTier({ zEdge, y0, y1, run, halfWidth, tier, plinth = false }) {
  const p = TAIHE_FRONT_APPROACHES;
  const centers = plinth ? [p.centers[0], 0, p.centers[1]] : p.centers;
  const flights = centers.map(centerX => ({
    id: `${p.id}:${plinth ? 'plinth' : tier}:${centerX}`, centerX, zEdge,
    zToe: zEdge - run, y0, y1, run, width: p.width, cheekWidth: p.cheekWidth,
    treadCount: Math.max(3, Math.round((y1 - y0) / 0.16)),
  }));
  const openings = flights.map(f => [f.centerX - f.width / 2, f.centerX + f.width / 2]);
  if (!plinth) openings.push([-p.imperialWidth / 2, p.imperialWidth / 2]);
  openings.sort((a,b) => a[0] - b[0]);
  const wallIntervals = []; let cursor = -halfWidth;
  for (const [a,b] of openings) { wallIntervals.push([cursor,a]); cursor=b; }
  wallIntervals.push([cursor,halfWidth]);
  for(const f of flights) f.ramp={type:'ramp',axis:'z',
    minX:f.centerX-f.width/2+f.cheekWidth,maxX:f.centerX+f.width/2-f.cheekWidth,
    minZ:f.zToe,maxZ:f.zEdge,a0:f.zEdge,a1:f.zToe,y0:f.y1,y1:f.y0};
  return { id: `${p.id}:${plinth ? 'plinth' : tier}`, plinth, tier, zEdge,
    y0,y1,run,halfWidth,flights,openings,wallIntervals, evidence: p };
}

function buildFlight(builder, parent, f, withRail) {
  const { centerX, zEdge, zToe, y0,y1,run,width,cheekWidth:cw }=f;
  const g=new THREE.Group(); g.name=f.id; g.userData.taiheSouthFlight=f; parent.add(g);
  const marble=builder.library.material('marble');
  const geometry=closedTerraceStairGeometry({ ...f, xEdge:0, centerZ:0, dir:1 },builder.library.tileSize('marble'));
  geometry.rotateY(Math.PI/2); geometry.translate(centerX,0,zEdge);
  const steps=new THREE.Mesh(geometry,marble);steps.name=`${f.id}:closed-treads`;
  steps.castShadow=true;steps.receiveShadow=true;g.add(steps);
  const rise=y1-y0, length=Math.hypot(run,rise);
  for(const side of [-1,1]) {
    const x=centerX+side*(width/2-cw/2);
    const cheek=builder.box(g,marble,cw,.4,length,x,(y0+y1)/2+.1,(zEdge+zToe)/2,{box:2});
    cheek.rotation.x=-Math.atan2(rise,run);cheek.name=`${f.id}:cheek:${side}`;
    if(withRail) {
      // Shear the existing texture-backed rail, preserving vertical posts.
      const rail=buildBalustrade(builder.library,{length:run,height:1.1});
      rail.name=`${f.id}:slope-rail:${side}`;
      const mesh=rail.children[0],a=mesh.geometry.attributes.position;
      for(let i=0;i<a.count;i++) a.setY(i,a.getY(i)-a.getX(i)*rise/run);
      a.needsUpdate=true;mesh.geometry.computeVertexNormals();
      rail.rotation.y=Math.PI/2;rail.position.set(x,(y0+y1)/2+.25,(zEdge+zToe)/2);g.add(rail);
    }
    for(let j=0;j<8;j++) builder.col(centerX+side*(width/2-cw),y0,zEdge-j*run/8,
      centerX+side*width/2,y1-j*rise/8+(withRail?1.35:.3),zEdge-(j+1)*run/8);
  }
  const before=builder.walkables.length;
  builder.walkRampZ(centerX-width/2+cw,centerX+width/2-cw,zEdge,zToe,y1,y0);
  builder.walkables[before].structureId=f.id;
}

/** South face only. The imperial stone is a solid separate slab, with bounded
 * shape-following collision and no ramp registration. This is a game protection
 * choice, not a claim about the museum's current admission rules. */
export function buildTaiheSouthTier(builder,parent,p) {
  const {zEdge,y0,y1,run,plinth,wallIntervals}=p;
  builder.taiheSouthTiers.push(p);
  for(const [a,b] of wallIntervals) {
    builder.col(a,y0,zEdge,b,y1,zEdge+.5);
    if(!plinth) builder.rail(parent,a+.2,zEdge+.2,b-.2,zEdge+.2,y1);
  }
  for(const f of p.flights) buildFlight(builder,parent,f,!plinth);
  if(!plinth) {
    const rise=y1-y0,width=TAIHE_FRONT_APPROACHES.imperialWidth,length=Math.hypot(run,rise);
    const section=new THREE.Shape();section.moveTo(0,0);section.lineTo(run,0);section.lineTo(0,rise);section.closePath();
    const base=new THREE.ExtrudeGeometry(section,{depth:width,bevelEnabled:false,steps:1,curveSegments:1});
    base.translate(0,0,-width/2);base.rotateY(Math.PI/2);base.translate(0,y0,zEdge);
    const body=new THREE.Mesh(applyBoxUV(base,builder.library.tileSize('marble')),builder.library.material('marble'));
    body.name=`${p.id}:imperial-stone-solid-base`;body.castShadow=true;body.receiveShadow=true;parent.add(body);
    const stone=builder.box(parent,builder.library.material('yulu'),width,.3,length,
      0,(y0+y1)/2+.05,zEdge-run/2);
    stone.rotation.x=-Math.atan2(rise,run);stone.name=`${p.id}:imperial-stone`;
    stone.userData.walkingPolicy=TAIHE_FRONT_APPROACHES.imperialWalkingPolicy;
    // 32 tight bounds approximate only the visible slab, not a tall invisible wall.
    for(let j=0;j<32;j++) builder.col(-width/2,y0,zEdge-j*run/32,
      width/2,y1-j*rise/32+.2,zEdge-(j+1)*run/32);
  }
}
