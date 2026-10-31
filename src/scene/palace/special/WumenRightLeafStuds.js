import * as T from 'three';
/** Only the photographed near leaf of the RIGHT (west) side gate.
 * Row/column order follows the named photo, NOT a generic 72-stud texture.
 * Meter dimensions fit the retained engineering leaf; not a measured restore.
 */
export function attachWumenRightLeafStuds(builder,leaf,{portalId,side,width,height}){
 if(portalId!=='west-yemen'||side!==1)return null;
 const p=leaf?.geometry?.parameters;
 if(!leaf?.parent?.isGroup||!leaf?.isMesh||leaf.userData.wumenLowerPart!=='door-solid'||!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0||p?.width!==width||p?.height!==height||p?.depth!==.22||!Array.isArray(builder?.ownedMaterials))throw Error('Own Wumen leaf required');
 if(leaf.parent.children.some(o=>o.userData.wumenRightLeafStuds))throw Error('Wumen right leaf studs already installed');
 const group=new T.Group();group.name='wumen-right-yemen-visible-stud-face';
 group.userData.wumenRightLeafStuds={portalId,hingeSide:side,leafFace:'LOCAL_MINUS_Z',rows:9,columns:8,
  absentSites:[[7,8],[8,8]],unobservedSites:[[9,1]],visibleSiteCount:69,
  sourcePage:'https://condoret76.wixsite.com/forbiddencity/wu-door',
  sourceImage:'https://static.wixstatic.com/media/302ccc_cd740e3d93b44d84b1a1bc1bff75002f~mv2_d_1600_1200_s_2.jpg',
  sourceImageSHA256:'370f55bedb974ef41d8002bc4fcc35d7dcacc957c3df671e6f6f86d9dbdac51f',
  state:'PHOTO_VISIBLE_SITES_ONLY_ENGINEERING_FIT_NOT_SURVEY_OR_CURRENT_CONDITION',
  spacing:'NORMALIZED_FIT_ON_RETAINED_ENGINEERING_LEAF',captureDate:null,
  physicalRole:'DECORATIVE_CAP_NO_ADDED_COLLIDER_OR_SUPPORT',wholeObjectAccepted:false};
 group.userData.structure={id:'axis/wumen-lower/west-yemen/visible-studs',objectId:'FC-AD4377DF51',...structuredClone(group.userData.wumenRightLeafStuds)};
 const material=new T.MeshStandardMaterial({name:'wumen_right_yemen_stud_gold_fit',color:0xbc943a,metalness:.65,roughness:.5});builder.ownedMaterials.push(material);
 const geometry=new T.SphereGeometry(1,12,6,0,Math.PI*2,0,Math.PI/2),radius=width*.0275;
 for(let row=1;row<=9;row++)for(let column=1;column<=8;column++){
  if((column===8&&(row===7||row===8))||(row===9&&column===1))continue;
  const cap=new T.Mesh(geometry,material);cap.name=`wumen-right-stud/r${row}/c${column}`;cap.userData.site=[row,column];
  // Photo left->right is leaf local +X -> -X for this outward face.
  const u=.065+(column-1)*(.94-.065)/7,v=.035+(row-1)*(.97-.035)/8;
  cap.position.set((.5-u)*width,(.5-v)*height,-.11);cap.rotation.x=-Math.PI/2;cap.scale.set(radius,.015,radius);cap.castShadow=cap.receiveShadow=true;group.add(cap);
 }
 // Separate decorative object: keep the authored solid leaf/body bounds exact.
 group.position.copy(leaf.position);group.quaternion.copy(leaf.quaternion);group.scale.copy(leaf.scale);leaf.parent.add(group);return group;
}
