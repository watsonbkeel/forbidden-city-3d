import * as THREE from 'three';
import {buildJiaotaiBackdrop} from './JiaotaiCentralInterior.js';
import {installJiaotaiTextileMaps,jiaotaiClothUV} from './JiaotaiTextileSurfaces.js';

/** The official photographs show a present-day display, not an inventory of
 * original seals. These reversible dimensions fit the inherited 19 m shell.
 * R54 base palette follows the neutral blockout; no brocade/hidden contents inferred. */
export const JIAOTAI_DISPLAY = Object.freeze({
  id:'jiaotai-display-setting-r54',
  source:'https://www.dpm.org.cn/explore/building/236467.html',
  images:[
    'https://file-pano.dpm.org.cn/hotspotImage/2026/03/20/13ecc40ac5cb4d2088f3b95fbaf234b7.jpg',
    'https://file-pano.dpm.org.cn/hotspotImage/2026/03/20/4e14d7797d784519a8120f42ac7fd21f.jpg',
  ],
  photographyDate:null, originalSealInventory:null,
  dimensionStatus:'REVERSIBLE_PHOTO_FIT_NOT_MEASURED',
  stage:'SOURCE_BOUNDED_BASE_MATERIALS_PARTIAL_NOT_RESTORATION',
  groups:['central-low-platform','west-covered-row','east-covered-row','rear-covered-row'],
  observation:{rearDistinctShoulders:4,rearPartlyOccludedShoulders:1,
    clockContextDistinctShoulders:3,clockContextEdgeFragments:null,
    sideRowTotal:null,concealedContents:null,
    modelSideLobesPerRow:3,modelRearLobes:5,
    countStatus:'VISIBLE_SILHOUETTE_SAMPLES_NOT_OBJECT_OR_SEAL_INVENTORY'},
});
const PALETTE = {
  pale:{color:0xe4dfca,roughness:.86}, textile:{color:0xcdb352,roughness:.95},
  carpet:{color:0x56665a,roughness:.98},
  dark:{color:0x2d2925,roughness:.62}, red:{color:0x7f261f,roughness:.64},
  metal:{color:0x343c37,roughness:.65,metalness:.22}, blue:{color:0x2f81a3,roughness:.58,metalness:.18},
};

/** Jiaotai-only replacement at authoring time: the generic meshes/collider are
 * never created. Nothing is selected/deleted by colour, material or position. */
export function buildJiaotaiDisplaySetting(builder,shell,{x0,y,ztb0,ztb1,thW}) {
  if(shell.userData.structure?.id!=='jiaotaidian')throw Error('Jiaotai display requires the registered Jiaotai shell');
  if(shell.userData.structure.displaySetting)throw Error('Jiaotai display already installed');
  const depth=ztb1-ztb0,zc=(ztb0+ztb1)/2,tz=zc+depth*.1;
  const z0=ztb1-6.4;
  const record={...structuredClone(JIAOTAI_DISPLAY),frame:{x:x0,y,z:z0},colliders:[],walkables:[],
    replacement:{call:'SquareHalls/Jiaotai/throneArea',removed:['legacy-double-platform-and-three-stairs','legacy-gold-block-chair','legacy-paired-bronze-tripods','legacy-tall-furniture-collider'],retained:'R28 upper fields/plaque/beam exact; only red screen and two side-frame lower vertices extended to the fitted rear floor' }};
  shell.userData.structure.displaySetting=record;
  const mats=Object.fromEntries(Object.entries(PALETTE).map(([id,p])=>[id,builder.ownMat(`r54-jiaotai-${id}`,{name:`r54-jiaotai-${id}`,...p})]));
  installJiaotaiTextileMaps(mats);
  function add(id,geo,material,x,cy,z,{solid=false}={}) {
    if(material==='textile')jiaotaiClothUV(geo);
    const m=new THREE.Mesh(geo,mats[material]);m.name=`r54-jiaotai-${id}`;
    m.userData.jiaotaiDisplayId=m.name;m.position.set(x0+x,y+cy,z0+z);
    m.castShadow=true;m.receiveShadow=true;shell.add(m);
    if(solid){m.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(m);
      builder.col(b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z);
      record.colliders.push({owner:m.name,min:b.min.toArray(),max:b.max.toArray()});}
    return m;
  }
  const box=(id,material,w,h,d,x,cy,z,solid=false)=>add(id,new THREE.BoxGeometry(w,h,d),material,x,cy,z,{solid});
  const cylinder=(id,material,rt,rb,h,x,cy,z,solid=false)=>add(id,new THREE.CylinderGeometry(rt,rb,h,12),material,x,cy,z,{solid});
  // One low pale rim, not two 0.6 m lacquer tiers. The support matches the exact
  // visible upper surface and explicitly disables height-rescue behaviour.
  const base=box('low-platform','pale',4.8,.20,3.6,0,.13,3.0,true);
  const baseBounds=new THREE.Box3().setFromObject(base);
  const support={type:'box',box:new THREE.Box3(new THREE.Vector3(baseBounds.min.x,baseBounds.max.y,baseBounds.min.z),new THREE.Vector3(baseBounds.max.x,baseBounds.max.y,baseBounds.max.z)),rescue:false};
  builder.walkables.push(support);record.walkables.push({owner:base.name,min:support.box.min.toArray(),max:support.box.max.toArray(),rescue:false});
  const rug=new THREE.PlaneGeometry(4.60,3.36);rug.rotateX(-Math.PI/2);
  add('platform-textile',rug,'carpet',0,.2303,3.0);

  // Dark open-legged chair silhouette and a covered back field. Dimensions,
  // joinery and exposed colour are simple fits, not a carved-ornament replica.
  const seatY=.86,chairZ=4.05;
  for(const sx of [-1,1])for(const sz of [-1,1])box(`chair-leg-${sx}-${sz}`,'dark',.12,.56,.12,sx*.62,.51,chairZ+sz*.38,true);
  box('chair-seat','dark',1.48,.14,1.04,0,seatY,chairZ,true);
  box('chair-lower-front-rail','dark',1.35,.09,.09,0,.42,chairZ-.40,true);
  for(const sx of [-1,1]){
    box(`chair-back-post-${sx}`,'dark',.10,1.10,.12,sx*.67,1.35,chairZ+.43,true);
    box(`chair-arm-${sx}`,'dark',.10,.09,.92,sx*.68,1.19,chairZ,true);
    box(`chair-front-arm-post-${sx}`,'dark',.09,.32,.09,sx*.68,1.02,chairZ-.36,true);
  }
  box('chair-upper-rail','dark',1.44,.10,.14,0,1.89,chairZ+.43,true);
  box('chair-covered-back','textile',1.20,.92,.07,0,1.39,chairZ+.40,true);
  box('chair-footrest','dark',1.12,.19,.55,0,.3253,chairZ-.90,true);

  // Upper cloth shoulders are deliberately plain. Three side lobes are a
  // partial group sample, not a statement that each real row has three objects.
  function coveredLobe(id,x,z,w,d,baseY=1.03,h=1.0) {
    const g=new THREE.BoxGeometry(w,h,d),p=g.attributes.position;
    for(let i=0;i<p.count;i++)if(p.getY(i)>0){p.setX(i,p.getX(i)*.67);p.setZ(i,p.getZ(i)*.67);}
    g.computeVertexNormals();
    add(id,g,'textile',x,baseY+h/2,z,{solid:true});
    cylinder(id+'-visible-tip','textile',.035,.045,.07,x,baseY+h+.035,z);
  }
  for(const [side,s] of [['west',1],['east',-1]]){
    box(`${side}-row-drape`,'textile',1.14,1.0,4.20,s*3.30,.53,3.10,true);
    for(let i=0;i<3;i++)coveredLobe(`${side}-cover-sample-${i+1}`,s*3.30,2.55+i*1.03,1.12,1.01);
    // Red cases are plainly visible at the front of both side rows. No seals,
    // inscriptions, hidden trays or additional rear ornaments are invented.
    box(`${side}-visible-case-support`,'red',.92,.11,.76,s*3.30,1.085,1.35,true);
    for(const dx of [-.32,.32])for(const dz of [-.23,.23])box(`${side}-case-leg-${dx}-${dz}`,'red',.07,.35,.07,s*3.30+dx,1.315,1.35+dz,true);
    box(`${side}-visible-red-case`,'red',.86,.62,.68,s*3.30,1.80,1.35,true);
  }
  box('rear-row-drape','textile',3.15,1.0,.76,0,.53,5.36,true);
  for(let i=0;i<5;i++)coveredLobe(`rear-cover-${i+1}${i===2?'-partly-occluded':''}`,(i-2)*.62,5.36,.60,.74,1.03,i===2?.91:1.0);

  // Four red stands with plain dark vessel silhouettes are visible around the
  // chair. Thin supports stay physical, without one invisible enclosing wall.
  for(const [id,x,z,scale] of [['outer-west',1.70,2.1,1],['outer-east',-1.70,2.1,1],['inner-west',.98,3.4,.72],['inner-east',-.98,3.4,.72]]){
    const bottom=.2303,top=bottom+.51*scale;
    box(`${id}-stand-foot`,'red',.40*scale,.07,.40*scale,x,bottom+.035,z,true);
    for(const dx of [-.15,.15])for(const dz of [-.15,.15])box(`${id}-stand-leg-${dx}-${dz}`,'red',.055*scale,.40*scale,.055*scale,x+dx*scale,bottom+.07+.20*scale,z+dz*scale,true);
    box(`${id}-stand-top`,'red',.44*scale,.07,.44*scale,x,top-.035,z,true);
    cylinder(`${id}-dark-vessel`,'metal',.13*scale,.11*scale,.31*scale,x,top+.155*scale,z,true);
    cylinder(`${id}-vessel-lid`,'metal',.035*scale,.15*scale,.11*scale,x,top+.365*scale,z);
  }
  // Source-supported blue lidded braziers replace the generic bronze tripods.
  for(const [side,s] of [['west',1],['east',-1]]){
    const x=s*4.0,z=-.15;
    cylinder(`${side}-brazier-stand`,'dark',.48,.52,.16,x,.11,z,true);
    for(const a of [Math.PI/2,Math.PI*7/6,Math.PI*11/6])cylinder(`${side}-brazier-leg-${a}`,'blue',.055,.07,.25,x+Math.cos(a)*.23,.315,z+Math.sin(a)*.23,true);
    cylinder(`${side}-brazier-bowl`,'blue',.38,.24,.38,x,.63,z,true);
    cylinder(`${side}-brazier-lid`,'blue',.07,.49,.18,x,.91,z,true);
    cylinder(`${side}-brazier-finial`,'metal',.025,.055,.13,x,1.065,z,true);
  }
  // Retain the R28 upper datum, plaque, fields, beam and material. Its old red
  // screen started atop the removed tall dais. The source shows a continuous
  // red back plane to the rear floor beside the low platform, not a tall box.
  // Only the screen body and its two vertical frames are extended downward;
  // top vertices and all upper details remain exact. This is an explicit R54
  // geometry correction, not a claim that these three meshes are byte-identical.
  buildJiaotaiBackdrop(builder,shell,{x0,ty:y+1.25,tz,depth,thW});
  record.backdropRevision={fit:'CONTINUOUS_RED_SCREEN_TO_REAR_FLOOR_NOT_NEW_PEDESTAL',bottomY:y+.03,sourceMeasured:false,meshes:[]};
  const revised=shell.children.filter(m=>['jiaotai-red-rear-screen','jiaotai-screen-side-frame'].includes(m.name));
  if(revised.length!==3)throw Error('R28 screen correction requires exactly one body and two frames');
  for(const m of revised){
    m.updateMatrixWorld(true);const oldBounds=new THREE.Box3().setFromObject(m),delta=oldBounds.min.y-record.backdropRevision.bottomY;
    const p=m.geometry.attributes.position;
    for(let i=0;i<p.count;i++)if(p.getY(i)<0)p.setY(i,p.getY(i)-delta);
    p.needsUpdate=true;m.geometry.computeBoundingBox();m.geometry.computeBoundingSphere();
    record.backdropRevision.meshes.push({owner:m.name,x:m.position.x,oldBottomY:oldBounds.min.y,newBottomY:record.backdropRevision.bottomY,unchangedTopY:oldBounds.max.y,extension:delta});
  }
  const screen=shell.getObjectByName('jiaotai-red-rear-screen');screen.updateMatrixWorld(true);
  const screenBounds=new THREE.Box3().setFromObject(screen);
  builder.col(...screenBounds.min.toArray(),...screenBounds.max.toArray());
  record.colliders.push({owner:screen.name,min:screenBounds.min.toArray(),max:screenBounds.max.toArray()});
  return record;
}
