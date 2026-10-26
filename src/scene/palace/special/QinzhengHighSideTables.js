import * as THREE from 'three';
const ROLE='r93-qinzheng-high-table', FIT='REVERSIBLE_MODEL_FIT_NOT_SURVEYED';
/** The museum photograph shows two floor-standing square stands outside the
 * kang, in addition to its two low tables. Dimensions are retained-room fits,
 * not antique measurements. No vessels, carvings or inscriptions are inferred. */
export const QINZHENG_HIGH_SIDE_TABLES=Object.freeze({
 role:ROLE,dimensionStatus:FIT,photographyDate:null,photo:'https://img.dpm.org.cn/Uploads/image/2026/04/30/2-stivNCrFc313.jpg',photoUrlDate:'2026-04-30',
 baseY:.62,topY:1.94,topThickness:.055,legWidth:.06,
 tables:Object.freeze([Object.freeze({side:'east',x0:9.355,x1:9.815,z0:-.76,z1:-.30}),Object.freeze({side:'west',x0:13.385,x1:13.845,z0:-.76,z1:-.30})]),
 stage:'PHOTO_SUPPORTED_BASIC_FORM_PARTIAL_NOT_FULL_RESTORATION',
});
export function buildQinzhengHighSideTables(kit,item,f){
 if(item.name!=='养心殿'||item.x!==108.6||item.z!==277.5||item.w!==36||item.d!==12||item.ph!==.6||item.colH!==7.68||![undefined,0,'south'].includes(item.rot))throw Error('R93 high-table identity/envelope mismatch');
 if(!f||f.parent!==kit.root||f.position.x!==item.x||f.position.z!==item.z||f.rotation.y!==0||!f.userData.yangxinWestWarmRooms||!f.userData.qinzhengFootstool)throw Error('R93 high-table retained frame/room/stool identity mismatch');
 if(f.userData.qinzhengHighSideTables)throw Error('R93 high tables already built');
 const p=QINZHENG_HIGH_SIDE_TABLES,mat=new THREE.MeshStandardMaterial({name:ROLE+'-dark-wood',color:0x291e1b,roughness:.66});kit.owned.push(mat);
 for(const t of p.tables){
  const g=new THREE.Group();g.name=`${ROLE}-${t.side}`;g.userData={role:ROLE,side:t.side,source:p.photo,dimensionStatus:FIT};f.add(g);f.updateWorldMatrix(true,true);
  const box=(part,x0,x1,y0,y1,z0,z1)=>{const role=`${ROLE}-${t.side}-${part}`,m=kit.mesh(g,new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0),mat,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2);m.name=role;m.userData={role,solid:true,source:p.photo,dimensionStatus:FIT,representation:'PLAIN_TOP_LEGS_APRON_STRETCHERS_NO_CARVING'};kit.col(f,x0,y0,z0,x1,y1,z1);kit.colliders.at(-1).sourceRole=role;};
  const bottom=p.topY-p.topThickness,l=p.legWidth;
  box('top',t.x0,t.x1,bottom,p.topY,t.z0,t.z1);
  let n=0;for(const x of[t.x0+.01,t.x1-.01-l])for(const z of[t.z0+.01,t.z1-.01-l])box(`leg-${++n}`,x,x+l,p.baseY,bottom,z,z+l);
  // Two shallow front/back aprons and four lower stretchers retain open space,
  // instead of treating each table's complete envelope as an opaque collider.
  for(const z of[t.z0+.02,t.z1-.055])box(`apron-${z===t.z0+.02?'south':'north'}`,t.x0+.02,t.x1-.02,bottom-.10,bottom,z,z+.035);
  const y0=p.baseY+.12,y1=y0+.04;
  for(const z of[t.z0+.02,t.z1-.055])box(`stretcher-${z===t.z0+.02?'south':'north'}`,t.x0+.02,t.x1-.02,y0,y1,z,z+.035);
  for(const x of[t.x0+.02,t.x1-.055])box(`stretcher-${x===t.x0+.02?'east':'west'}`,x,x+.035,y0,y1,t.z0+.02,t.z1-.02);
  kit.walkBox(f,t.x0,t.z0,t.x1,t.z1,p.topY);Object.assign(kit.walkables.at(-1),{rescue:false,sourceRole:`${ROLE}-${t.side}-top`});
 }
 const metadata={...p,streamingOwnership:'PERMANENT_B_NOT_OPTIONAL_S',newMeshes:22,newTriangles:264,newColliders:22,newSupports:2,materialStatus:'PLAIN_DARK_WOOD_PHOTO_COLOR_FIT_NOT_SPECIES_IDENTIFICATION',floorOverlapLimitation:'Feet meet retained B floor 0.62 m; actual unchanged S floor about 0.667337 m embeds lower feet about 0.047337 m. No new floor.',routePolicy:'RETAIN_WALLS_AND_DOORS_USE_SOUTHWARD_APPROACH_AROUND_WEST_TABLE'};
 f.userData.qinzhengHighSideTables=metadata;return metadata;
}
