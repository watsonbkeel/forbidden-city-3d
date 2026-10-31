import * as THREE from 'three';
import {taihemenSouthProfile} from './TaihemenProfile.js';

// Own Taihemen south-front and two oblique photographs, not another gate's
// contour. The short heel and three shallow scallops simplify the visible
// lower edge only; no unreadable carved/painted motifs are reconstructed.
// x runs from the retained column toward the bay centre, y down from the beam.
const LOWER_EDGE = Object.freeze([
  [1,0],[.96,-.24],[.90,-.18],[.84,-.19],[.78,-.34],
  [.72,-.39],[.66,-.34],[.60,-.42],[.54,-.57],[.48,-.60],
  [.42,-.54],[.36,-.63],[.30,-.74],[.25,-.72],[.22,-.80],
  [.20,-.92],[.13,-.98],[0,-1],
].map(Object.freeze));

export function taihemenSouthKneeProfile({x0,z0,y,w,d,H,beamH,r}) {
  const veranda=taihemenSouthProfile({width:w,depth:d}),bayW=w/veranda.frontageBays;
  if (![x0,z0,y,H,beamH,r].every(Number.isFinite) || H<=3 || beamH<=0 || beamH>=H/2 || r<=0 || r>=bayW/3)
    throw Error('Taihemen south knees require finite retained body dimensions');
  const reach=bayW*.27,drop=r*1.95,depth=.26,topY=y+H-beamH+.025;
  // A conservative legal jump envelope is 1.7m head + 7.2²/(2*14)m jump
  // + 0.5m collision-radius margin. Never lower a member to fit a smaller hall.
  if (topY-drop-y<4.1 || r*.75+reach>=bayW/2)
    throw Error('Taihemen south knees require retained head and central bay clearance');
  return {
    id:'taihemen-south-knees-r58',entityId:veranda.entityId,accepted:false,
    stage:'PARTIAL_PHOTO_SILHOUETTE_FIT_VERIFY_PENDING',
    bays:[...veranda.southOpenBayIndices],bayW,x0,eaveZ:z0+veranda.southEaveZ,
    topY,reach,drop,depth,columnRadius:r,rootInset:r*.75,
    depthStatus:'PHOTO_FIT_UNMEASURED',
    fitting:{reachToBay:.27,dropToColumnDiameter:.975,depthMetres:.26,
      plausibleReachToBay:[.24,.31],plausibleDropToColumnDiameter:[.8,1.2],
      unmeasuredDepthRangeMetres:[.15,.4],
      caution:'Relative photo fit to retained envelope, not measured restoration. Depth and obscured reverse are unknown.'},
    sources:[
      'https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e980c931a533.jpg',
      'https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e980c9308131.jpg',
      'https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e980c9310fb3.jpg',
    ],
    photographyDate:null,colliderDelta:0,supportDelta:0,
  };
}

/** Add only fourteen high, shallow south-veranda knee halves.
 * The existing beam, columns, porch mouths and every navigation registration
 * remain untouched. The small beam/root overlaps are engineering attachment,
 * not a claim about historic joinery. No broad floating collision is created.
 */
export function buildTaihemenSouthKnees(builder,parent,input) {
  const p=taihemenSouthKneeProfile(input); // validate before allocating or writing
  const group=new THREE.Group();group.name=p.id;
  group.userData.structure={id:'axis/taihemen-south-knees',entityId:p.entityId,profile:p};
  const material=builder.ownMat(p.id,{name:'taihemen-south-knee-teal',color:0x316363,roughness:.86});
  for(const bay of p.bays)for(const inward of [1,-1]){
    const columnIndex=bay+(inward===1?0:1),columnX=input.x0-input.w/2+columnIndex*p.bayW;
    const points=[[0,0],...LOWER_EDGE].map(([x,y])=>new THREE.Vector2(inward*x*p.reach,y*p.drop));
    const geometry=new THREE.ExtrudeGeometry(new THREE.Shape(points),{depth:p.depth,steps:1,bevelEnabled:false,curveSegments:1});
    geometry.translate(0,0,-p.depth/2);
    const mesh=new THREE.Mesh(geometry,material);
    mesh.name=`${p.id}:bay-${bay}:inward-${inward}`;
    mesh.position.set(columnX+inward*p.rootInset,p.topY,p.eaveZ);
    mesh.castShadow=true;mesh.receiveShadow=true;
    mesh.userData.taihemenSouthKnee={bay,inward,columnIndex,columnX};
    group.add(mesh);
  }
  parent.add(group);
  return p;
}
