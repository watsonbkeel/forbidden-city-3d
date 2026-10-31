// WITHDRAWN HYPOTHESIS ONLY — no production import or hook. Source-space registration is unproven.
import * as THREE from 'three';
import {taihemenSouthProfile} from '../../../../../src/scene/palace/special/TaihemenProfile.js';

/** Visible south porch only. The own photograph looking toward Wumen shows
 * transverse downstands and recessed, near-square coffer fields. The retained
 * column/eave axes register this reversible fit; neither a four-depth framing
 * reconstruction nor an exact panel/painting inventory is inferred from it.
 * No photograph is redistributed, no hidden caisson or furniture is invented.
 */
export function buildTaihemenSouthCeiling(builder,parent,{x0,z0,y,w,d,H,beamH,r}) {
  const veranda=taihemenSouthProfile({width:w,depth:d}),bayW=w/veranda.frontageBays;
  if(![x0,z0,y,H,beamH,r].every(Number.isFinite)||H<=3||beamH<=0||beamH>=H/2||r<=0||r>=bayW/3||H-beamH<4.1)
    throw Error('Taihemen south ceiling requires finite retained dimensions and jump clearance');
  const minZ=z0+veranda.southEaveZ,maxZ=z0+veranda.innerEnclosureZ;
  const primaryWidth=.42,secondaryWidth=.09,secondaryHeight=Math.min(.18,beamH*.5),trimWidth=.025,trimHeight=.012;
  const clearWidth=bayW-primaryWidth,clearDepth=maxZ-minZ-.6,columnsPerBay=5,rowsPerBay=6;
  if(clearWidth<=0||clearDepth<=0)
    throw Error('Taihemen south ceiling requires a positive retained porch frame');
  const topY=y+H-.025,fieldBottom=topY-.08,gridBottom=topY-secondaryHeight;
  const p={id:'taihemen-south-ceiling-r157',entityId:veranda.entityId,accepted:false,
    bays:[...veranda.southOpenBayIndices],minZ,maxZ,primaryWidth,secondaryWidth,
    columnsPerBay,rowsPerBay,cellWidth:clearWidth/columnsPerBay,cellDepth:clearDepth/rowsPerBay,
    topY,fieldBottom,gridBottom,minimumHeadroom:H-beamH,
    dimensionStatus:'PHOTO_TOPOLOGY_RETAINED_AXIS_FIT_NOT_SURVEY',exactPanelCountVerified:false,
    artworkStatus:'PLAIN_GREEN_GOLD_COLOUR_ZONES_NOT_DRAGON_PAINTING_RECONSTRUCTION',
    fullHallReconstructed:false,northAndEndRooms:'UNCHANGED_UNVERIFIED',
    sources:[{url:'https://www.dpm.org.cn/explore/building/236439.html',photographyDate:null,
      use:'Own identity and painted beam description; no occupied-column survey'},
      {url:'https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e9837bfea847.jpg',photographyDate:null,
        uploadPathDate:'2020-04-16',use:'Foreground Taihemen south porch: transverse beams, shallow grid below dark recessed fields; Wumen is background only'}]};
  // Validation completes before material/geometry allocation or parent writes.
  const group=new THREE.Group();group.name=p.id;
  group.userData.structure={id:'axis/taihemen-south-ceiling',entityId:p.entityId,
    stage:'SOUTH_PORCH_PHOTO_TOPOLOGY_FIT_VERIFY_PENDING',profile:p};
  const frame=builder.ownMat(p.id+':frame',{name:'taihemen-south-ceiling-frame',color:0x28544d,roughness:.86});
  const field=builder.ownMat(p.id+':field',{name:'taihemen-south-ceiling-field',color:0x18392e,roughness:.9});
  const gold=builder.ownMat(p.id+':trim',{name:'taihemen-south-ceiling-trim',color:0xb49850,roughness:.72});
  const add=(role,material,W,D,bottom,height,x,z,bay=null)=>{
    const m=builder.box(group,material,W,height,D,x,bottom+height/2,z);
    m.name=`${p.id}:${role}${bay===null?'':':'+bay}`;m.userData.taihemenSouthCeiling={role,bay};return m;
  };
  // Eight beams connect the unchanged front/inner column axes enclosing the
  // seven open bays. They meet the existing eave/recessed beams by real volume.
  for(let axis=1;axis<=8;axis++)
    add('primary-frame',frame,primaryWidth,maxZ-minZ,y+H-beamH,beamH,x0-w/2+axis*bayW,(minZ+maxZ)/2);
  for(const bay of p.bays){
    const x=x0-w/2+(bay+.5)*bayW,z=(minZ+maxZ)/2;
    // Opaque backing is below the inherited ceiling plane, eliminating any
    // coplanar overlay; the unobserved central/north/end ceiling stays intact.
    add('field',field,clearWidth,clearDepth,fieldBottom,.08,x,z,bay);
    for(let ix=1;ix<columnsPerBay;ix++){
      const xx=x-clearWidth/2+ix*p.cellWidth;
      add('coffer-x',frame,secondaryWidth,clearDepth,gridBottom,secondaryHeight,xx,z,bay);
      add('trim-x',gold,trimWidth,clearDepth,gridBottom-trimHeight,trimHeight,xx,z,bay);
    }
    for(let iz=1;iz<rowsPerBay;iz++){
      const zz=z-clearDepth/2+iz*p.cellDepth;
      add('coffer-z',frame,clearWidth,secondaryWidth,gridBottom,secondaryHeight,x,zz,bay);
      // End at the transverse frames; no painted motif or unknown inscription.
      add('trim-z',gold,clearWidth,trimWidth,gridBottom-trimHeight,trimHeight,x,zz,bay);
    }
  }
  parent.add(group);return p;
}
