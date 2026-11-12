import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
export const MANTANG_FIT=Object.freeze({x:-144.1,z:-391.9,bodyWidth:14.7,bodyDepth:8.8,roofWidth:16.3,roofDepth:10.4,base:.12,eave:4.32,ridge:5.78,bays:3});
/** Own named Republican-plan historical volume only. Not current restoration,
 * a B23/B24 substitute, a mirrored Hanben facade, or an interactive interior.
 * No installation/room/map/navigation side effects. Caller must review registration.
 */
export function createMantangHistoricalVolume({historicalPreview=false}={}){
 if(typeof historicalPreview!=='boolean')throw Error('Explicit historical preview boolean required');
 if(!historicalPreview)return null;
 const p=MANTANG_FIT,group=new T.Group();group.name='neige-mantang-historical-volume';group.position.set(p.x,0,p.z);
 const geometries=[],materials=[],contacts=[];let disposed=false;
 const mat=(name,color)=>{const m=new T.MeshStandardMaterial({name,color,roughness:.88});materials.push(m);return m;};
 const add=(role,g,m)=>{geometries.push(g);const mesh=new T.Mesh(g,m);mesh.name=group.name+'/'+role;mesh.userData.role=role;mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);return mesh;};
 const box=(role,m,w,h,d,x,y,z)=>add(role,new T.BoxGeometry(w,h,d).translate(x,y,z),m);
 const dispose=()=>{if(disposed)return;disposed=true;group.removeFromParent();for(const g of geometries)g.dispose();for(const m of materials)m.dispose();};
 try{
  const core=mat('mantang-unknown-closed-core-fit',0xa49b87),base=mat('mantang-low-base-fit',0x777367),wood=mat('mantang-plain-bay-lines-fit',0x6b4434),tile=mat('mantang-historical-yellow-tile-plain-fit',0xb18a3b);
  box('low-base-fit',base,p.bodyWidth,.12,p.bodyDepth,0,.06,0);
  box('closed-unknown-core',core,p.bodyWidth,4.2,p.bodyDepth,0,2.22,0);
  // Three equal engineering divisions express the textual bay count only.
  // These plain bars are NOT documented window/door positions or ornament.
  for(let i=0;i<4;i++)box('three-bay-front-post',wood,.12,4.2,.10,-p.bodyWidth/2+i*p.bodyWidth/3,2.22,-p.bodyDepth/2-.05);
  box('plain-front-head-fit',wood,p.bodyWidth,.16,.12,0,4.24,-p.bodyDepth/2-.05);
  // Closed uncertain gabled/pitched cover, not a claimed historic roof type.
  const shape=new T.Shape();const half=p.roofDepth/2;
  [[-half,p.eave],[0,p.ridge],[half,p.eave],[half,p.eave-.18],[-half,p.eave-.18]].forEach(([z,y],i)=>shape[i?'lineTo':'moveTo'](z,y));shape.closePath();
  const roof=new T.ExtrudeGeometry(shape,{depth:p.roofWidth,bevelEnabled:false,steps:1});roof.rotateY(Math.PI/2);roof.translate(-p.roofWidth/2,0,0);add('plain-yellow-roof-closure-fit',roof,tile);
  group.updateMatrixWorld(true);
  for(const mesh of group.children){const support=triangleInstance(createTriangleTemplate(mesh.geometry),[p.x,0,p.z],mesh.name+'/'+mesh.uuid),c=support.box.clone();c.triangleSupport=support;c.mantangMesh=mesh.uuid;c.mantangRole=mesh.userData.role;c.sourceObjectId='FC-4A84B24027';contacts.push(c);}
  const meta={id:group.name,objectId:'FC-4A84B24027',name:'内阁满本堂（历史图示有限体量）',zoneId:'outer-east',period:'REPUBLICAN_MEASURED_PLAN_REPRODUCED_2011_EXACT_SURVEY_YEAR_UNKNOWN',currentSurvival:'OFFICIAL_PAGE_SAYS_LOST_NOT_2026_SURVEY',defaultEnabled:false,wholeObjectAccepted:false,bays:3,front:'south',ownNamedOutline:true,placement:'LOCAL_PLAN_REGISTRATION_ENGINEERING_FIT_NOT_SURVEY',dimensions:{...p},opening:'CLOSED_UNKNOWN_CORE_NO_INFERRED_DOOR_OR_INTERIOR',roofTaxonomy:'PLAIN_PITCHED_ENGINEERING_CLOSURE_NOT_VERIFIED',tileEvidence:'HISTORICAL_TEXT_MANCHU_AND_HAN_HALLS_YELLOW_TILE_NOT_MEASURED_COLOR',facade:'ONLY_THREE_BAY_DIVISIONS_PLAIN_UNVERIFIED_MEMBERS_NO_COPIED_DECORATION',newRooms:0,newWalkables:0,newMapItems:0,sourceImagesCopied:0,sourceUrls:['https://www.dpm.org.cn/explore/building/236523.html','https://www.dpm.org.cn/Uploads/File/pdf/dc/90/c9/dc90c935d785bbdf396ad66173ebf391.pdf','https://www.shidianguji.com/book/CADAL02022806/chapter/1lm4lnafzeeix'],unknown:['precise survey date and demolished date','measured site coordinates and eave footprint','roof taxonomy and height','original doorway, windows, structure and interior','current site condition or reconstruction','cumulative real host, routes, browser and GPU acceptance']};
  group.userData.structure=meta;return{group,meta,contacts,materials,dispose};
 }catch(error){dispose();throw error;}
}
