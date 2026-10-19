import * as THREE from 'three';
import { closedTerraceStairGeometry } from '../ThreeHallTerrace.js';
import { INNER_PALACE_LEVELS as L } from './InnerPalaceLevels.js';
import { INNER_GLAZE_LOD } from './InnerPalaceGlazeLOD.js';

/** Current museum photographs establish a central stair at EACH east/west
 * Jiaotai face and grey-brick/yellow-green openwork terrace edges. The outside
 * width5.6/run3.2/13 treads/0.6m low wall are model-fit trials, NOT measurements.
 * The flanking low buildings visible in those photographs remain unmodelled.
 */
export function innerPalaceTerraceProfile(rects, halls) {
  const rectIndex = halls.findIndex(h => h.name === '交泰殿');
  if (rectIndex < 0) throw new Error('Missing Jiaotai terrace registration');
  const centerZ = halls[rectIndex].position.z, width = 5.6, cheekWidth = .45, run = 3.2;
  const openingZ = [centerZ-width/2,centerZ+width/2];
  const walkableCrossZ = [openingZ[0]+cheekWidth,openingZ[1]-cheekWidth];
  return { id:'inner-palace-terrace', nominalDeckY:L.terraceY, dimensionStatus:'PHOTO_FIT_NOT_SURVEY',
    currentAccessStatus:'UNKNOWN', missing:'flanking low rooms; exact brick pattern and dimensions',
    flights:[-1,1].map(dir => {
      const xEdge=dir*rects[rectIndex].hw,xToe=xEdge+dir*run;
      return {id:`jiaotai-side-stair:${dir<0?'east':'west'}`,rectIndex,tier:1,dir,
        xEdge,xToe,centerZ,y0:0,y1:L.terraceY,run,width,cheekWidth,treadCount:13,
        openingZ:[...openingZ],walkableCrossZ:[...walkableCrossZ],
        ramp:{type:'ramp',axis:'x',minX:Math.min(xEdge,xToe),maxX:Math.max(xEdge,xToe),
          minZ:walkableCrossZ[0],maxZ:walkableCrossZ[1],a0:xEdge,a1:xToe,y0:L.terraceY,y1:0}};
    }) };
}

const COLORS = { green:0x387756, yellow:0xb78626 };
function glazedBox(b,g,color,w,h,d,x,y,z,coarse=true) {
  // PalaceBuilder's generic merger deliberately removes vertex colours.
  // Two explicit materials survive that path; account for both draw batches.
  const material=b.ownMat(`inner-palace-glazed-brick:${color}`,{
    name:`inner-palace-glazed-brick:${color}`,color:COLORS[color],roughness:.43,metalness:0});
  const mesh=b.box(g,material,w,h,d,x,y,z);mesh.userData.innerGlazeCoarse=coarse;return mesh;
}

/** Simplified actual open masonry, with holes and depth; no photo texture,
 * invented relief, alpha-cutout sheet or new canvas allocation. Two merged materials.
 */
export function buildInnerTerraceRail(b,parent,x0,z0,x1,z1,y) {
  const len=Math.hypot(x1-x0,z1-z0);if(len<.6)return;
  const g=new THREE.Group();g.name='rear-palace-glazed-low-wall';
  g.position.set((x0+x1)/2,y,(z0+z1)/2);
  g.rotation.y=Math.abs(z1-z0)>Math.abs(x1-x0)?Math.PI/2:0;parent.add(g);
  b.libBox(g,'wall_brick',len,.12,.32,0,.06,0,'box');
  glazedBox(b,g,'green',len,.1,.34,0,.17,0);
  glazedBox(b,g,'green',len,.08,.38,0,.53,0);
  glazedBox(b,g,'yellow',len,.08,.33,0,.61,0);
  const n=Math.max(1,Math.round(len/1.05)),step=len/n;
  for(let i=0;i<n;i++){
    const x=-len/2+(i+.5)*step;
    glazedBox(b,g,'yellow',step*.24,.3,.28,x,.37,0,i%INNER_GLAZE_LOD.moduleStride===0);
    glazedBox(b,g,'green',step*.62,.1,.3,x,.37,0,i%INNER_GLAZE_LOD.moduleStride===0);
  }
  // Bound to the visible wall, rather than retaining the old1.4m invisible rail.
  b.col(Math.min(x0,x1)-.19,y,Math.min(z0,z1)-.19,Math.max(x0,x1)+.19,y+.65,Math.max(z0,z1)+.19);
}

export function buildInnerTerraceStair(b,parent,f) {
  const g=new THREE.Group();g.name=f.id;parent.add(g);
  const {xEdge,xToe,centerZ,dir,y0,y1,run,width,cheekWidth:cw}=f;
  const steps=new THREE.Mesh(closedTerraceStairGeometry(f,b.library.tileSize('marble')),b.library.material('marble'));
  steps.name=f.id+':closed-treads';steps.castShadow=steps.receiveShadow=true;g.add(steps);
  const rise=y1-y0,len=Math.hypot(run,rise),angle=-dir*Math.atan2(rise,run);
  for(const s of [-1,1]){
    const z=centerZ+s*(width/2-cw/2);
    const cheek=b.box(g,b.library.material('marble'),len,.5,cw,(xEdge+xToe)/2,(y0+y1)/2+.12,z);
    cheek.rotation.z=angle;
    const green=glazedBox(b,g,'green',len,.12,cw,(xEdge+xToe)/2,(y0+y1)/2+.42,z);green.rotation.z=angle;
    const cap=glazedBox(b,g,'yellow',len,.09,cw*.65,(xEdge+xToe)/2,(y0+y1)/2+.51,z);cap.rotation.z=angle;
    for(let j=0;j<8;j++)b.col(xEdge+dir*j*run/8,y0,centerZ+s*(width/2-cw),
      xEdge+dir*(j+1)*run/8,y1-j*rise/8+.58,centerZ+s*width/2);
  }
  const r=f.ramp;
  b.walkables.push({...r,minX:r.minX+b.ox,maxX:r.maxX+b.ox,minZ:r.minZ+b.oz,maxZ:r.maxZ+b.oz,
    a0:r.a0+b.ox,a1:r.a1+b.ox,structureId:f.id});
}
