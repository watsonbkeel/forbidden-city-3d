import * as T from 'three';
// Front finishes only: independently read left eleven yellow face divisions;
// right eleven is a fit with two stain-obscured end boundaries. Both stone
// inscription surrounds are visible. Width/height fit the retained
// opening; the 15mm skin is NOT a measured lintel depth or a new physical ledge.
const SOURCES={
 'east-yemen':{image:'302ccc_242c0358c9724778b428832dad99bb13~mv2_d_1600_1200_s_2.jpg',sha:'d2e7d060d4c295b59a2d2721d2abffbfb15018e3eed82b6c88e6f1233c7b372e',width:5.48,height:.55,plaqueWidth:1.40,plaqueHeight:.61},
 'west-yemen':{image:'302ccc_cd740e3d93b44d84b1a1bc1bff75002f~mv2_d_1600_1200_s_2.jpg',sha:'370f55bedb974ef41d8002bc4fcc35d7dcacc957c3df671e6f6f86d9dbdac51f',width:5.36,height:.55,plaqueWidth:1.36,plaqueHeight:.56},
};
export function attachWumenSidePortalFaces(builder,root,profile){
 if(root?.name!=='wumen-lower-five-portals'||!Array.isArray(root.children)||!Object.isExtensible(root.children)||root.position.lengthSq()!==0||root.rotation.toArray().slice(0,3).some(Boolean)||root.scale.toArray().some(v=>v!==1)||profile?.id!=='wumen-lower-five-mouths'||profile.bounds?.wingInner!==40.6||!Array.isArray(builder?.ownedMaterials)||!Object.isExtensible(builder.ownedMaterials)||profile.lateral?.length!==2)throw Error('Own Wumen side-portal host required');
 for(const id of Object.keys(SOURCES)){const o=profile.lateral.find(o=>o.id===id);if(!o||o.width!==3.8||o.crown!==5.4||o.sideZ!==-16.5||o.sign!==(id==='east-yemen'?-1:1))throw Error('Own Wumen side-portal dimensions required');}
 if(root.children.some(g=>g.userData.wumenSidePortalFace))throw Error('Wumen side-portal finishes already installed');
 const geometry=new T.BoxGeometry(1,1,1),materials=[
  new T.MeshStandardMaterial({name:'wumen_side_portal_yellow_face_fit',color:0xc68d3b,roughness:.65}),
  new T.MeshStandardMaterial({name:'wumen_side_portal_stone_frame_fit',color:0xc8bfb0,roughness:.9}),
  new T.MeshStandardMaterial({name:'wumen_side_portal_unreconstructed_inscription_field',color:0xbab2a5,roughness:.9}),
 ];
 const groups=[];
 for(const o of profile.lateral){const q=SOURCES[o.id],g=new T.Group();g.name=`wumen-side-portal-face/${o.id}`;g.position.set(o.sign*profile.bounds.wingInner,0,o.sideZ);g.rotation.y=-o.sign*Math.PI/2;
  const metadata={portalId:o.id,panelCount:11,panelCountEvidence:o.id==='east-yemen'?'ELEVEN_VISIBLE_DIVISIONS':'ELEVEN_FIT_RIGHTMOST_TWO_BOUNDARIES_WEAK_STAIN_OVERLAP',sourceImage:`https://static.wixstatic.com/media/${q.image}`,sourceImageSHA256:q.sha,photoPage:'https://condoret76.wixsite.com/forbiddencity/wu-door',captureDate:null,
   status:'SEPARATELY_PHOTOGRAPHED_FRONT_FINISH_ENGINEERING_FIT_NOT_SURVEY',equalPanelWidths:'SIMPLIFIED_NOT_INDIVIDUAL_TILE_MEASUREMENTS',inscription:'UNRECONSTRUCTED_NO_GLYPHS',skinDepth:.015,physicalRole:'DECORATIVE_SKIN_NO_ADDED_COLLIDER_OR_SUPPORT',wholeObjectAccepted:false};
  g.userData.wumenSidePortalFace=metadata;g.userData.structure={id:`axis/wumen-lower/${o.id}/exterior-front-finish`,objectId:'FC-AD4377DF51',...metadata};
  const box=(w,h,d,x,y,z,material,part,index)=>{const m=new T.Mesh(geometry,materials[material]);m.name=`${o.id}/${part}/${index}`;m.position.set(x,y,z);m.scale.set(w,h,d);m.castShadow=false;m.receiveShadow=true;m.userData={portalFacePart:part,index};g.add(m);};
  const span=q.width/11,seam=.004;
  for(let i=0;i<11;i++)box(span-seam,q.height,.015,-q.width/2+(i+.5)*span,o.crown+q.height/2,.0075,0,'yellow-panel',i);
  const pw=q.plaqueWidth,ph=q.plaqueHeight,t=.045,cy=o.crown+q.height+.12+ph/2;
  box(pw, t,.015,0,cy-ph/2+t/2,.0075,1,'stone-frame',0);
  box(pw, t,.015,0,cy+ph/2-t/2,.0075,1,'stone-frame',1);
  box(t,ph-2*t,.015,-pw/2+t/2,cy,.0075,1,'stone-frame',2);
  box(t,ph-2*t,.015,pw/2-t/2,cy,.0075,1,'stone-frame',3);
  // Neutral recessed field deliberately leaves the unverified engraving absent.
  box(pw-2*t,ph-2*t,.008,0,cy,.004,2,'unreconstructed-inscription-field',0);groups.push(g);
 }
 const ownedStart=builder.ownedMaterials.length,oldChildren=[...root.children];
 try{builder.ownedMaterials.push(...materials);root.add(...groups);}catch(error){
  // Commit is the only scene/registry mutation. Restore direct state before
  // retirement so disposal listeners cannot observe a half-installed owner.
  for(const g of groups)g.parent=null;
  root.children.splice(0,root.children.length,...oldChildren);
  builder.ownedMaterials.splice(ownedStart);
  const cleanupErrors=[];for(const resource of [geometry,...materials])try{resource.dispose();}catch(e){cleanupErrors.push(e);}
  if(cleanupErrors.length&&Object.isExtensible(error))error.wumenPortalCleanupErrors=cleanupErrors;
  throw error;
 }
 return groups;
}
