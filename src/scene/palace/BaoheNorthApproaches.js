import * as THREE from 'three';
import { buildBalustrade } from '../HallKit.js';
import { mergeByMaterial } from '../../utils/MergeUtils.js';
import { applyBoxUV } from '../../utils/GeometryUV.js';
import { closedTerraceStairGeometry } from './ThreeHallTerrace.js';

/** The museum photograph and 1941 plan support three separated approaches.
 * 16.57 x 3.07m is the published exposed bottom stone, NOT the buried block.
 * Existing terrace heights/anchors are retained modelling estimates. Stair
 * widths/offsets/counts below are provisional, not measurements of access. */
export const BAOHE_NORTH_APPROACHES = Object.freeze({
  id: 'baohe-north-separated-approaches', stoneWidth: 3.07, bottomStoneLength: 16.57,
  outerCenters: [-11.5, 11.5], outerWidth: 4.6, outerCheek: .45,
  innerClearWidth: 1.5, innerOuterCheek: .3, bottomTreads: 28,
  lodDistance: 120, lodHysteresis: .1, lodCenterZ: 178,
  dimensionsStatus: 'PUBLISHED_STONE_EXPOSED_SIZE_WITH_PROVISIONAL_STAIRS_AND_LEVELS',
  publicAccessStatus: 'UNKNOWN', stoneWalkingPolicy: 'NO_GAMEPLAY_WALKABLE',
});

export function baoheNorthTier({ zEdge, y0, y1, run, halfWidth, tier }) {
  const p=BAOHE_NORTH_APPROACHES, rise=y1-y0;
  if(![zEdge,y0,y1,run,halfWidth,tier].every(Number.isFinite)||rise<=0||run<=0||![1,2,3].includes(tier))throw Error('Baohe north tier interface');
  if(tier===1)run=Math.sqrt(p.bottomStoneLength**2-rise**2);
  if(!Number.isFinite(run)||run<=0||halfWidth<p.outerCenters[1]+p.outerWidth/2+.5)throw Error('Baohe north tier does not fit');
  const n=tier===1?p.bottomTreads:Math.max(3,Math.round(rise/.16));
  const flights=[];
  for(const side of [-1,1]) {
    const innerMin=p.stoneWidth/2,innerMax=innerMin+p.innerClearWidth;
    flights.push({kind:'inner',side,minX:side>0?innerMin:-innerMax,maxX:side>0?innerMax:-innerMin,
      centerX:side*(innerMin+(p.innerClearWidth+p.innerOuterCheek)/2),width:p.innerClearWidth+p.innerOuterCheek,
      cheekCenters:[side*(innerMax+p.innerOuterCheek/2)],cheekWidth:p.innerOuterCheek});
    const c=side*p.outerCenters[1],w=p.outerWidth,cw=p.outerCheek;
    flights.push({kind:'outer',side,centerX:c,width:w,minX:c-w/2+cw,maxX:c+w/2-cw,
      cheekCenters:[c-w/2+cw/2,c+w/2-cw/2],cheekWidth:cw});
  }
  for(const f of flights) {
    Object.assign(f,{id:`${p.id}:${tier}:${f.kind}:${f.side}`,tier,zEdge,zToe:zEdge+run,y0,y1,run,treadCount:n});
    f.ramp={type:'ramp',axis:'z',minX:f.minX,maxX:f.maxX,minZ:zEdge,maxZ:f.zToe,a0:zEdge,a1:f.zToe,y0:y1,y1:y0};
  }
  const centralHalf=p.stoneWidth/2+p.innerClearWidth+p.innerOuterCheek;
  const openings=[[-p.outerCenters[1]-p.outerWidth/2,-p.outerCenters[1]+p.outerWidth/2],[-centralHalf,centralHalf],[p.outerCenters[1]-p.outerWidth/2,p.outerCenters[1]+p.outerWidth/2]];
  const walls=[];let x=-halfWidth;for(const [a,b]of openings){walls.push([x,a]);x=b;}walls.push([x,halfWidth]);
  return {id:`${p.id}:${tier}`,tier,zEdge,zToe:zEdge+run,y0,y1,run,halfWidth,flights,openings,walls,evidence:p};
}

function wedge(width,run,rise) {
  const s=new THREE.Shape();s.moveTo(0,0);s.lineTo(run,0);s.lineTo(0,rise);s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:width,bevelEnabled:false,steps:1,curveSegments:1});
  g.translate(0,0,-width/2);g.rotateY(-Math.PI/2);return g;
}

export function createBaoheNorthDetail(){return {fine:new THREE.Group(),coarse:new THREE.Group(),tiers:[]};}

export function buildBaoheNorthTier(b,parent,p,detail) {
  const C=BAOHE_NORTH_APPROACHES,marble=b.library.material('marble'),rise=p.y1-p.y0;
  const tile=b.library.tileSize('marble'),length=Math.hypot(p.run,rise),angle=Math.atan2(rise,p.run);
  detail.tiers.push(p);b.baoheNorthTiers.push(p);
  for(const [a,c]of p.walls){b.col(a,p.y0,p.zEdge,c,p.y1,p.zEdge-.5);b.rail(parent,a+.2,p.zEdge-.2,c-.2,p.zEdge-.2,p.y1);}
  for(const f of p.flights) {
    const stairs=closedTerraceStairGeometry({...f,xEdge:0,centerZ:0,dir:1},tile);
    stairs.rotateY(-Math.PI/2);stairs.translate(f.centerX,0,p.zEdge);
    const near=new THREE.Mesh(stairs,marble);near.name=f.id;near.castShadow=true;near.receiveShadow=true;detail.fine.add(near);
    // Beyond120m retain the complete solid stair silhouette; only sub-pixel
    // tread edges are omitted. Collision never switches with visual LOD.
    const ramp=wedge(f.width,p.run,rise);ramp.translate(f.centerX,p.y0,p.zEdge);
    const far=new THREE.Mesh(applyBoxUV(ramp,tile),marble);far.name=f.id+':far-solid';far.castShadow=true;far.receiveShadow=true;detail.coarse.add(far);
    for(const x of f.cheekCenters) {
      const cheek=b.box(parent,marble,f.cheekWidth,.4,length,x,(p.y0+p.y1)/2+.1,(p.zEdge+p.zToe)/2,{box:tile});
      cheek.rotation.x=angle;cheek.name=f.id+':cheek';
      const rail=buildBalustrade(b.library,{length:p.run,height:1.1}),mesh=rail.children[0],a=mesh.geometry.attributes.position;
      for(let i=0;i<a.count;i++)a.setY(i,a.getY(i)-a.getX(i)*rise/p.run);
      a.needsUpdate=true;mesh.geometry.computeVertexNormals();rail.rotation.y=-Math.PI/2;
      rail.position.set(x,(p.y0+p.y1)/2+.25,(p.zEdge+p.zToe)/2);rail.name=f.id+':rail';parent.add(rail);
      for(let j=0;j<16;j++)b.col(x-f.cheekWidth/2,p.y0,p.zEdge+j*p.run/16,x+f.cheekWidth/2,p.y1-j*rise/16+1.35,p.zEdge+(j+1)*p.run/16);
    }
    const at=b.walkables.length;b.walkRampZ(f.minX,f.maxX,p.zEdge,p.zToe,p.y1,p.y0);b.walkables[at].structureId=f.id;
  }
  const base=wedge(C.stoneWidth,p.run,rise);base.translate(0,p.y0,p.zEdge);
  const body=new THREE.Mesh(applyBoxUV(base,tile),marble);body.name=p.id+':solid-stone';body.castShadow=true;body.receiveShadow=true;parent.add(body);
  // One continuous visible face, not overlapping stair boxes or repeated slabs.
  const face=new THREE.PlaneGeometry(C.stoneWidth,length);face.rotateX(-Math.PI/2+angle);
  face.translate(0,(p.y0+p.y1)/2+.04,(p.zEdge+p.zToe)/2);
  const slab=new THREE.Mesh(face,b.library.material('yulu'));slab.name=p.id+':carved-surface';slab.receiveShadow=true;
  slab.userData.walkingPolicy=C.stoneWalkingPolicy;parent.add(slab);
  for(let j=0;j<32;j++)b.col(-C.stoneWidth/2,p.y0,p.zEdge+j*p.run/32,C.stoneWidth/2,p.y1-j*rise/32+.08,p.zEdge+(j+1)*p.run/32);
}

export function installBaoheNorthDetail(root,detail){
  if(detail.tiers.length!==3)throw Error('Baohe north requires three complete tiers');
  const p=BAOHE_NORTH_APPROACHES,near=mergeByMaterial(detail.fine,{name:'baohe-north-near'}),far=mergeByMaterial(detail.coarse,{name:'baohe-north-far'});
  if(near.children.length!==1||far.children.length!==1)throw Error('Baohe stair batches changed');
  const lod=new THREE.LOD();lod.name='baohe-north-stair-detail';lod.position.z=p.lodCenterZ;
  for(const g of[near,far])g.position.z=-p.lodCenterZ;
  lod.addLevel(near,0);lod.addLevel(far,p.lodDistance,p.lodHysteresis);far.visible=false;root.add(lod);
  root.userData.architecture.push(...detail.tiers.map(t=>structuredClone(t)));return lod;
}
