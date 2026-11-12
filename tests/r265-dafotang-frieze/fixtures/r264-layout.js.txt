import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';

const ID='dafotang-historic-spatial-fit-v1',PLACE='place-outer-west-6cae88b6a2';
const sources=['https://img.dpm.org.cn/Uploads/File/2020/02/26/u5e56176b64d88.pdf','https://img.dpm.org.cn/Uploads/File/2018/06/04/u5b153792a88ab.pdf'];
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
const writable=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);return d?('value' in d&&d.writable):Object.isExtensible(o)&&!(k in o);};
const fitted=(subjectId,position)=>({subjectId,position,dimensionStatus:'MODEL_FIT_NOT_SURVEY',assetId:null});
export const DAFOTANG_SPATIAL_FIT=Object.freeze({shrineWidth:6.5,figureAndLotusHeight:2.25,buddhaCenters:Object.freeze([1.62,0,-1.62]),guardianCenters:Object.freeze([2.83,-2.83]),frontZ:4.4,backZ:7.05,figureZ:5.6,lowerTop:4.35,upperTop:6.45,sidePlatformX:8.48,sidePlatformZ:.6,sidePlatformLength:9,sidePlatformDepth:2.3});
function metadata(){const p=DAFOTANG_SPATIAL_FIT;return{id:ID,status:'PARTIAL_SPATIAL_FIT_NOT_COMPLETE_INVENTORY',sourceUrls:sources,sourcePages:['2015:300-301,306-307','2014:78-80'],sourceShrineWidth:6.5,lowerBays:5,lowerColumnCount:6,upperBays:3,figureAndLotusHeight:2.25,coordinateContract:'POSITIVE_X_WEST__NEGATIVE_X_EAST__NEGATIVE_Z_SOUTH',buddhaSlots:['amitabha','shakyamuni','bhaisajyaguru'].map((s,i)=>fitted(s,[p.buddhaCenters[i],1.7,p.figureZ])),guardianSlots:['heavenly-king','weituo'].map((s,i)=>fitted(s,[p.guardianCenters[i],1.32,p.figureZ])),arhatPlatforms:['west','east'].map((side,i)=>({side,figureCount:9,position:[(i?-1:1)*p.sidePlatformX,.92,p.sidePlatformZ],individualOrder:null,dimensionStatus:'MODEL_FIT_NOT_SURVEY'})),westWallCabinetFrames:6,westWallFrameScope:'SIX_INSET_DISPLAY_FIELDS__OUTER_CABINET_UNMODELED',westWallSourceFigure:'2015:printed307:fig23',newReligiousFigures:0,newPhotographs:0,wholeHallInventory:'UNKNOWN',complete:false,upperVisitorAccess:false,fit:['all coordinates, bay divisions, depths, heights and simplified profiles except cited total shrine width and figure/lotus height','central nonhistorical pedestal footprint reduced to fit its opening; figure and lotus unchanged','plain frame/cabinet outlines omit unknown carving and every religious image'],unknown:['exact measured bay centers and statue depths','eastern individual arhat order','detailed cabinet contents, unseen profiles and present inventory'],notEmptyClaim:true};}
function validate(c){const{kit,f,g,p}=c??{};if(p?.id!==PLACE||p.key!=='dafotang'||g?.id!==PLACE||g.w!==45.7||g.d!==16.2||g.y!==.9||g.front!==-8.1||g.rear!==8.1||g.inventory?.status!=='UNKNOWN'||g.historicLayout||g.historicalPrincipal?.id!=='dafotang-shakyamuni-historical-fit'||f?.parent!==kit?.root||kit.root.name!=='outer-west'||!f.position.equals(new T.Vector3(221.9,0,241.1))||!f.quaternion.equals(new T.Quaternion())||!f.scale.equals(new T.Vector3(1,1,1))||!mutable(f.children)||!mutable(kit.colliders)||!mutable(kit.owned))throw Error('Exact unchanged Dafotang host and single fallback required');
 if(!writable(g,'historicLayout')||!writable(g.historicalPrincipal,'supportDimensions')||!writable(g.historicalPrincipal,'dimensionStatus'))throw Error('Writable Dafotang publication fields required');
 const principal=f.children.find(o=>o.userData.dafotangPrincipal==='dafotang-shakyamuni-historical-fit'),support=[];
 for(const[role,w,h,d,y]of[['support-foot',2.2,.16,1.8,.98],['support-waist',1.9,.46,1.52,1.29],['support-top',2.12,.18,1.72,1.61]]){const ms=[];principal?.traverse(m=>{if(m.isMesh&&m.name==='dafotang-shakyamuni-historical-fit/'+role)ms.push(m)});if(ms.length!==1)throw Error('Exact three original fallback pedestal owners required');const m=ms[0];if(!writable(m,'geometry'))throw Error('Writable Dafotang publication fields required');m.geometry.computeBoundingBox();const b=m.geometry.boundingBox,s=b.getSize(new T.Vector3()),o=b.getCenter(new T.Vector3());if(Math.abs(s.x-w)>1e-6||Math.abs(s.y-h)>1e-6||Math.abs(s.z-d)>1e-6||Math.abs(o.x)>1e-6||Math.abs(o.y-y)>1e-6||Math.abs(o.z-5.6)>1e-6||m.material.name!=='dafotang_principal_fitted_support'||m.position.lengthSq()||!m.quaternion.equals(new T.Quaternion())||!m.scale.equals(new T.Vector3(1,1,1)))throw Error('Original pedestal dimensions/transform/material changed');f.updateWorldMatrix(true,true);const world=new T.Box3().setFromObject(m),cs=kit.colliders.filter(q=>!q.triangleSupport&&q.equals(world));if(cs.length!==1)throw Error('Original pedestal collision owner changed');support.push({m,collider:cs[0]});}
 if(JSON.stringify(g.historicalPrincipal.supportDimensions)!=='[2.2,0.8,1.8]')throw Error('Original pedestal metadata changed');return support;}
/** Reference-guided plain spatial frame only. No religious images, new figures,
 * public assets or arbitrary scene loading. Construction is staged atomically. */
export function buildDafotangHistoricLayout(c){const prior=validate(c),{kit,f,g}=c,p=DAFOTANG_SPATIAL_FIT,frame=new T.Group();frame.name=ID;const materials=[],geometries=[],contacts=[],changed=[],meta=metadata();
 const gold=new T.MeshStandardMaterial({name:'dafotang_layout_plain_gold_fit',color:0x9c7e40,roughness:.78,metalness:.2}),back=new T.MeshStandardMaterial({name:'dafotang_layout_unpictured_back_fit',color:0x66503c,roughness:.9});materials.push(gold,back);const supportMaterial=prior[0].m.material;
 const add=(role,geometry,material=gold)=>{geometries.push(geometry);const m=new T.Mesh(geometry,material);m.name=ID+'/'+role;m.userData.dafotangLayoutRole=role;m.castShadow=m.receiveShadow=true;frame.add(m);return m;};
 const box=(role,w,h,d,x,y,z,mat=gold)=>add(role,new T.BoxGeometry(w,h,d).translate(x,y,z),mat);
 try{
  // Six lower posts form five openings; the3 middle fit widths are equal.
  for(const x of[-3.15,-2.43,-.81,.81,2.43,3.15])add('lower-column',new T.CylinderGeometry(.065,.075,p.lowerTop-.92,12).translate(x,(p.lowerTop+.92)/2,p.frontZ));
  box('lower-front-entablature',6.5,.22,.32,0,p.lowerTop-.11,p.frontZ);
  box('lower-rear-entablature',6.5,.22,.2,0,p.lowerTop-.11,p.backZ);
  for(const x of[-2.43,-.81,.81,2.43])box('rear-bearing-fit',.12,p.upperTop-.92,.12,x,(p.upperTop+.92)/2,p.backZ);
  // Upper three bays and a closed, unwalkable fitted gallery. It is not a
  // claim that the upper shrine was empty, and adds no invented stair access.
  box('upper-gallery-floor',6.5,.16,p.backZ-p.frontZ,0,p.lowerTop+.08,(p.backZ+p.frontZ)/2);
  for(const x of[-2.43,-.81,.81,2.43])add('upper-column',new T.CylinderGeometry(.055,.06,p.upperTop-p.lowerTop-.16,10).translate(x,(p.upperTop+p.lowerTop+.16)/2,p.frontZ+.15));
  box('upper-front-entablature',5.0,.22,.28,0,p.upperTop-.11,p.frontZ+.15);
  box('upper-rear-entablature',5.0,.22,.2,0,p.upperTop-.11,p.backZ);
  box('upper-front-rail',6.5,.08,.08,0,p.lowerTop+.77,p.frontZ-.07);
  for(let i=0;i<17;i++)box('upper-plain-baluster',.035,.53,.045,-3.1+i*6.2/16,p.lowerTop+.465,p.frontZ-.07);
  // Fit only old square courses. The actual figure/lotus geometry and its
  // sourced2.25m height are not transformed or replicated.
  for(const q of prior){const geometry=q.m.geometry.clone();geometries.push(geometry);geometry.translate(0,0,-p.figureZ).scale(1.4/2.2,1,1.5/1.8).translate(0,0,p.figureZ);geometry.computeBoundingBox();changed.push({...q,geometry});for(const x of[p.buddhaCenters[0],p.buddhaCenters[2]]){const copy=geometry.clone().translate(x,0,0);add(q.m.name.endsWith('support-foot')?'new-buddha-pedestal-foot':'new-buddha-pedestal-course',copy,supportMaterial);}}
  for(const x of p.guardianCenters){box('guardian-pedestal-foot',.62,.1,.75,x,.97,p.figureZ);box('guardian-pedestal-waist',.52,.2,.65,x,1.12,p.figureZ);box('guardian-pedestal-top',.60,.1,.73,x,1.27,p.figureZ);}
  for(const x of[p.sidePlatformX,-p.sidePlatformX]){box('arhat-platform-foot',p.sidePlatformDepth,.14,p.sidePlatformLength,x,.99,p.sidePlatformZ);box('arhat-platform-waist',p.sidePlatformDepth-.18,.42,p.sidePlatformLength-.16,x,1.27,p.sidePlatformZ);box('arhat-platform-top',p.sidePlatformDepth-.04,.12,p.sidePlatformLength-.02,x,1.54,p.sidePlatformZ);}
  // West(+X), 2015 printed307 fig23: four tall and two shorter inset display fields.
  // Only these fields/borders are raised; the enclosing long cabinet is unmodeled.
  // All heights are MODEL_FIT_NOT_SURVEY; no invented small figures or empty claim.
  const panels=[[-3.45,1.12,2.2,3.75],[-1.97,1.25,3.8,4.8],[-.65,1.25,3.8,4.8],[.67,1.25,3.8,4.8],[1.99,1.25,3.8,4.8],[3.47,1.12,2.2,3.75]];
  for(const[z,w,h,y]of panels){const x=9.55;box('west-cabinet-unpictured-back',.055,h,w,x,y,z,back);for(const dz of[-w/2,w/2])box('west-cabinet-side-frame',.10,h,.05,x-.04,y,z+dz);for(const dy of[-h/2,h/2])box('west-cabinet-cross-frame',.10,.05,w,x-.04,y+dy,z);}
  frame.updateWorldMatrix(true,true);for(const m of frame.children){const s=triangleInstance(createTriangleTemplate(m.geometry),[221.9,0,241.1],m.name+'/'+m.uuid),c=s.box.clone();c.triangleSupport=s;c.dafotangLayoutMesh=m.uuid;c.dafotangLayoutRole=m.userData.dafotangLayoutRole;contacts.push(c);}
  for(const q of changed){q.nextCollider=q.geometry.boundingBox.clone().translate(new T.Vector3(221.9,0,241.1));q.nextCollider.dafotangPrincipalMesh=q.collider.dafotangPrincipalMesh;q.nextCollider.dafotangPrincipalRole=q.collider.dafotangPrincipalRole;}
  frame.userData.dafotangHistoricLayout=meta;
 }catch(e){for(const x of geometries)x.dispose();for(const m of materials)m.dispose();throw e;}
 const old={children:[...f.children],colliders:[...kit.colliders],owned:[...kit.owned],dimensions:g.historicalPrincipal.supportDimensions,dimensionStatus:g.historicalPrincipal.dimensionStatus};
 try{f.add(frame);kit.colliders.push(...contacts);kit.owned.push(...materials);for(const q of changed){q.oldGeometry=q.m.geometry;q.m.geometry=q.geometry;kit.colliders[kit.colliders.indexOf(q.collider)]=q.nextCollider;}g.historicalPrincipal.supportDimensions=[1.4,.8,1.5];g.historicalPrincipal.dimensionStatus='FIGURE_AND_LOTUS_HEIGHT_SOURCED__SHRINE_PEDESTAL_FOOTPRINT_MODEL_FIT';g.historicLayout=meta;}
 catch(e){f.remove(frame);for(const q of changed)if(q.oldGeometry)q.m.geometry=q.oldGeometry;kit.colliders.splice(0,kit.colliders.length,...old.colliders);kit.owned.splice(0,kit.owned.length,...old.owned);g.historicalPrincipal.supportDimensions=old.dimensions;g.historicalPrincipal.dimensionStatus=old.dimensionStatus;delete g.historicLayout;for(const x of geometries)x.dispose();for(const m of materials)m.dispose();throw e;}
 for(const q of changed)q.oldGeometry.dispose();return{frame,meta,changedPedestals:changed.map(q=>({mesh:q.m,oldCollider:q.collider,newCollider:q.nextCollider})),contacts};
}
