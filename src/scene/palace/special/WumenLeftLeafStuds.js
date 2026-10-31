import * as T from 'three';
/** LEFT/east gate: only the photograph-right NEAR leaf, never the opposite leaf.
 * 64 visible occupied sites; eight column-8 sites are occluded, not absent.
 * Normalized spacing / uniform gold / 15mm projection fit the retained
 * engineering leaf, not a metric survey or a copy of the photographed patina.
 */
export function attachWumenLeftLeafStuds(builder,leaf,{portalId,side,width,height}){
 if(portalId!=='east-yemen'||side!==-1)return null;
 const p=leaf?.geometry?.parameters,hinge=leaf?.parent;
 if(!leaf?.isMesh||leaf.userData.wumenLowerPart!=='door-solid'||!hinge?.isGroup||hinge.parent?.name!=='wumen-lower-door/east-yemen'||hinge.position.x>=0||!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0||p?.width!==width||p?.height!==height||p?.depth!==.22||!Array.isArray(builder?.ownedMaterials)||!Object.isExtensible(builder.ownedMaterials)||!Object.isExtensible(hinge.children)||Object.getOwnPropertyDescriptor(builder.ownedMaterials,'length')?.writable!==true||Object.getOwnPropertyDescriptor(hinge.children,'length')?.writable!==true)throw Error('Own writable east near leaf required');
 if(hinge.children.some(o=>o.userData.wumenLeftLeafStuds))throw Error('Wumen left leaf studs already installed');
 const group=new T.Group();group.name='wumen-left-yemen-visible-stud-face';
 const unknown=Array.from({length:9},(_,i)=>i+1).filter(r=>r!==8).map(r=>[r,8]);
 group.userData.wumenLeftLeafStuds={portalId,hingeSide:side,leafFace:'LOCAL_MINUS_Z',rows:9,columns:8,visibleSiteCount:64,unobservedSites:unknown,absentSites:[],
  sourcePage:'https://condoret76.wixsite.com/forbiddencity/wu-door',sourceImage:'https://static.wixstatic.com/media/302ccc_242c0358c9724778b428832dad99bb13~mv2_d_1600_1200_s_2.jpg',sourceImageSHA256:'d2e7d060d4c295b59a2d2721d2abffbfb15018e3eed82b6c88e6f1233c7b372e',captureDate:null,
  state:'LEFT_PHOTO_VISIBLE_SITES_ONLY_ENGINEERING_FIT_NOT_SURVEY_OR_CURRENT_CONDITION',occlusion:'COLUMN_8_ROWS_1_TO_7_AND_9_HIDDEN_BY_WALL_OR_STONE_BASE_NOT_CONFIRMED_ABSENT',spacing:'LEFT_NORMALIZED_FIT_ON_RETAINED_ENGINEERING_LEAF',materialFit:'UNIFORM_GOLD_NOT_PHOTOGRAPHED_PATINA',physicalRole:'DECORATIVE_CAP_NO_ADDED_COLLIDER_OR_SUPPORT',wholeObjectAccepted:false};
 group.userData.structure={id:'axis/wumen-lower/east-yemen/visible-studs',objectId:'FC-AD4377DF51',...structuredClone(group.userData.wumenLeftLeafStuds)};
 const material=new T.MeshStandardMaterial({name:'wumen_left_yemen_stud_gold_fit',color:0xbc943a,metalness:.65,roughness:.5}),geometry=new T.SphereGeometry(1,12,6,0,Math.PI*2,0,Math.PI/2),radius=width*.0275;
 for(let row=1;row<=9;row++)for(let column=1;column<=8;column++){
  if(column===8&&row!==8)continue;
  const cap=new T.Mesh(geometry,material);cap.name=`wumen-left-stud/r${row}/c${column}`;cap.userData.site=[row,column];
  const u=.07+(column-1)*.86/7,v=.03+(row-1)*.925/8;
  cap.position.set((.5-u)*width,(.5-v)*height,-.11);cap.rotation.x=-Math.PI/2;cap.scale.set(radius,.015,radius);cap.castShadow=cap.receiveShadow=true;group.add(cap);
 }
 group.position.copy(leaf.position);group.quaternion.copy(leaf.quaternion);group.scale.copy(leaf.scale);
 const ownedCount=builder.ownedMaterials.length,priorChildren=[...hinge.children];
 try{builder.ownedMaterials.push(material);hinge.add(group);return group;}
 catch(error){
  // Restore observers' original host/ownership state before retiring detached resources.
  hinge.children.splice(0,hinge.children.length,...priorChildren);for(const o of priorChildren)o.parent=hinge;group.parent=null;builder.ownedMaterials.length=ownedCount;
  const cleanup=[];for(const resource of [geometry,material])try{resource.dispose();}catch(e){cleanup.push(e);}
  if(cleanup.length&&error&&Object.isExtensible(error))error.wumenLeftStudCleanupErrors=cleanup;
  throw error;
 }
}
