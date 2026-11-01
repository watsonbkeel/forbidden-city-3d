import * as THREE from 'three';

const FIT='REVERSIBLE_MODEL_FIT_NOT_SURVEYED';
const wenhuaSource={id:'wenhua-front-photo',url:'https://intl.dpm.org.cn/Uploads/Picture/2023/06/26/s64993cd77858c.jpg',context:'https://intl.dpm.org.cn/explore/build_maps.html',uploadPathDate:'2023-06-26',photographyDate:null,use:'Visible trunks flanking the raised approach south of Wenhua hall; not a species identification or census'};
const wuyingSources=[
 {id:'wuying-west-tree',url:'https://file-pano.dpm.org.cn/hotspotImage/2025/08/19/XuiQmR6v5NZ07S0fKNbgazv5bc2h3xWT50Nipxp1.jpg',uploadPathDate:'2025-08-19',photographyDate:null,use:'Tree in lower western front court beside front hall platform'},
 {id:'wuying-east-tree',url:'https://file-pano.dpm.org.cn/hotspotImage/2025/08/19/UhHMUrCB9642hzXeiwTSjcgVX9uxAiI3bCFqioGy.jpg',uploadPathDate:'2025-08-19',photographyDate:null,use:'Tree in lower eastern front court, photograph labelled east side hall'},
];
const tree=(id,x,z,height,crownRadius,trunkRadius,leanX,leanZ,photoLandmark,source)=>({id,x,z,height,crownRadius,trunkRadius,leanX,leanZ,photoLandmark,source,species:'UNKNOWN',dimensionStatus:FIT});
const profiles={
 'outer-east':{id:'wenhua-approach',zone:'outer-east',axisX:-186.4,dimensionStatus:FIT,countStatus:'PARTIAL_REPRESENTATION_NOT_CENSUS',sources:[wenhuaSource],unknowns:['Exact current count and individual species','Surveyed trunk positions, heights, crown extent and planting-pit geometry','Photograph shooting date and current seasonal appearance'],trees:[
  tree('wenhua-west-near',-172.5,-231,16.5,3.5,.48,.24,-.12,'Viewer-left outer foreground trunk around image x=210/1920; west (+X) of approach','wenhua-front-photo'),
  tree('wenhua-west-far',-174.2,-216.5,17.2,3.3,.42,-.3,.15,'Viewer-left inner trunk around image x=500/1920; beside raised approach','wenhua-front-photo'),
  tree('wenhua-east-far',-197.8,-217.8,16.8,3.4,.44,.18,.2,'Viewer-right inner trunk around image x=1470/1920; beside raised approach','wenhua-front-photo'),
  tree('wenhua-west-rear-small',-168.5,-210.5,10.5,2.2,.22,.10,.08,'Additional thin rear-side trunk in official image left background; reversible relative fit','wenhua-front-photo'),
  tree('wenhua-east-rear-small',-204,-211.5,10.0,2.1,.21,-.10,.06,'Additional thin rear-side trunk in official image right background; reversible relative fit','wenhua-front-photo'),
  tree('wenhua-east-near',-200,-231.8,15.8,3.2,.38,-.2,-.12,'Viewer-right outer foreground trunk around image x=1810/1920; east (-X) of approach','wenhua-front-photo'),
 ]},
 'outer-west':{id:'wuying-approach',zone:'outer-west',axisX:219.5,dimensionStatus:FIT,countStatus:'PARTIAL_REPRESENTATION_NOT_CENSUS',sources:wuyingSources,unknowns:['Exact current count and individual species','Surveyed tree geometry and planting-pit dimensions','Low branches and needles are not individually reconstructed','Photograph shooting date'],trees:[
  tree('wuying-west-front',237,-214.7,15.4,4.5,.46,.23,.12,'West lower court beside the west front-hall platform corner, visible stone-edged tree pit','wuying-west-tree'),
  tree('wuying-east-front',202.3,-215.6,15.9,4.4,.44,-.26,.16,'East lower court beside the east front-hall platform corner, visible in east-side-hall photo','wuying-east-tree'),
 ]},
};
/** Returns an independent source/fit record. Not a surveyed tree inventory. */
export function southTreeProfile(zoneId){return profiles[zoneId]?structuredClone(profiles[zoneId]):null;}

/** Local deterministic crown silhouette, not a botanical reconstruction. No
 * garden random scatter, species preset, shared merger or shader change. */
export function buildSouthCourtTrees(kit,zone){
 const p=southTreeProfile(zone.id);
 if(!p||zone.southTreeProfile!==p.id)throw Error('South tree profile requires its original explicit zone registration');
 const bark=new THREE.MeshStandardMaterial({name:'south_tree_bark',color:0x655b49,roughness:1});
 const foliage=[0x3e5531,0x4a6038,0x425b35].map((color,i)=>new THREE.MeshStandardMaterial({name:`south_tree_foliage_${i}`,color,roughness:1}));
 kit.owned.push(bark,...foliage);
 const soil=zone.id==='outer-west'?new THREE.MeshStandardMaterial({name:'south_tree_pit_soil',color:0x736b50,roughness:1}):null;
 if(soil)kit.owned.push(soil);
 const f=kit.frame(0,0);f.name='south-court-photo-trees';f.userData.structure={...p,id:`${zone.id}/${p.id}`};
 let triangles=0;const rendered=[];
 const mesh=(geo,material,role,t)=>{const m=new THREE.Mesh(geo,material);m.castShadow=m.receiveShadow=true;m.userData={role,treeId:t.id,source:t.source,dimensionStatus:FIT};f.add(m);triangles+=(geo.index?.count??geo.attributes.position.count)/3;return m;};
 for(const t of p.trees){
  if(soil){
   // Source shows individual stone-edged pits, not a continuous lawn. Only
   // the footprint cue is represented; unknown curb height is not invented
   // as a player obstacle or an invisible raised walkable platform.
   const earth=mesh(new THREE.CylinderGeometry(1.35,1.35,.02,8),soil,'south-tree-pit-soil',t);earth.position.set(t.x,.002,t.z);earth.userData.reconstruction='GROUND_LEVEL_FOOTPRINT_ONLY_CURB_HEIGHT_UNKNOWN';
   const border=mesh(new THREE.RingGeometry(1.35,1.55,8),kit.lib.material('stone_slab'),'south-tree-pit-stone-outline',t);border.rotation.x=-Math.PI/2;border.position.set(t.x,.02,t.z);border.userData.reconstruction='GROUND_LEVEL_FOOTPRINT_ONLY_CURB_HEIGHT_UNKNOWN';
  }
  // Small fitted lean is baked into actual vertices, then collision derives
  // from that geometry. Do not pretend an origin cylinder covers the lean.
  const trunkHeight=t.height*.76;
  const geo=new THREE.CylinderGeometry(t.trunkRadius*.38,t.trunkRadius,trunkHeight,10,5);
  const pos=geo.attributes.position;
  for(let i=0;i<pos.count;i++){const y=pos.getY(i)+trunkHeight/2,q=y/trunkHeight;pos.setXYZ(i,pos.getX(i)+t.x+t.leanX*q,y,pos.getZ(i)+t.z+t.leanZ*q);}
  geo.computeVertexNormals();geo.computeBoundingBox();
  const trunk=mesh(geo,bark,'south-tree-trunk',t);kit.colliders.push(geo.boundingBox.clone());
  // Layered, irregular photograph-fit masses. The source does not establish
  // species, needle morphology, branch counts, or current foliage colour.
  for(let layer=0;layer<5;layer++){
   const crownBase=zone.id==='outer-west'?3.5:5.2;
   const y=crownBase+layer*(t.height-crownBase-1.1)/4;
   const spread=t.crownRadius*(1-layer*.13),angle=layer*2.32+(t.x%3);
   for(let side=0;side<2;side++){
    const a=angle+side*Math.PI;
    const crown=mesh(new THREE.IcosahedronGeometry(1,1),foliage[(layer+side)%3],'south-tree-crown',t);
    crown.position.set(t.x+Math.cos(a)*spread*.35+t.leanX*layer/4,y,t.z+Math.sin(a)*spread*.28+t.leanZ*layer/4);
    crown.scale.set(spread*(side?.74:.86),1.1+layer*.07,spread*(side?.82:.73));
   }
  }
  rendered.push({id:t.id,trunkBounds:{min:geo.boundingBox.min.toArray(),max:geo.boundingBox.max.toArray()}});
 }
 kit.root.userData.southTrees={...p,rendered,triangles};
 return {f,profile:p,trees:rendered,triangles};
}
