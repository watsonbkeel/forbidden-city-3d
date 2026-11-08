import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
import {createDafotangSideFigure} from './DafotangSideFigures.js';
import {DAFOTANG_SPATIAL_FIT as FIT} from './DafotangHistoricLayout.js';
const ID='dafotang-three-design-figures-v1',PLACE='place-outer-west-6cae88b6a2';
const GOLD_ROLES=['neck','rounded-face','nose','long-ear--1','long-ear-1','covered-shoulders','right-folded-shin','left-draped-sleeve','right-draped-sleeve','left-forearm'];
const mutable=a=>Array.isArray(a)&&Object.isExtensible(a)&&Object.getOwnPropertyDescriptor(a,'length')?.writable;
const writable=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);return d?('value' in d&&d.writable):Object.isExtensible(o)&&!(k in o);};
function validate({kit,f,g,p}={}){
 if(p?.id!==PLACE||p.key!=='dafotang'||g?.id!==PLACE||g.inventory?.status!=='UNKNOWN'||g.historicLayout?.id!=='dafotang-historic-spatial-fit-v1'||g.triadFit||g.historicalPrincipal?.id!=='dafotang-shakyamuni-historical-fit'||!writable(g,'triadFit')||!f||f.parent!==kit?.root||kit.root.name!=='outer-west'||kit.root.parent||kit.root.position.lengthSq()||!kit.root.quaternion.equals(new T.Quaternion())||!kit.root.scale.equals(new T.Vector3(1,1,1))||!f.matrixAutoUpdate||!f.matrixWorldAutoUpdate||!kit.root.matrixAutoUpdate||!kit.root.matrixWorldAutoUpdate||!f.position.equals(new T.Vector3(221.9,0,241.1))||!f.quaternion.equals(new T.Quaternion())||!f.scale.equals(new T.Vector3(1,1,1))||!mutable(f.children)||!mutable(kit.colliders))throw Error('Exact phase1 Dafotang host required before triad');
 const principal=f.children.find(o=>o.userData.dafotangPrincipal==='dafotang-shakyamuni-historical-fit');if(!principal)throw Error('Central source-guided model required');
 const material=name=>{const set=new Set(principal.children.filter(m=>m.isMesh&&m.material.name===name).map(m=>m.material));if(set.size!==1)throw Error('Exact shared figure material required');return [...set][0];};
 const materials={gold:material('dafotang_principal_worn_gold'),red:material('dafotang_principal_red_lacquer'),dark:material('dafotang_principal_dark_curls')};
 const recolor=GOLD_ROLES.map(role=>{const matches=principal.children.filter(m=>m.isMesh&&m.userData.role===role);if(matches.length!==1||matches[0].material!==materials.red||!Object.getOwnPropertyDescriptor(matches[0],'material')?.writable)throw Error('Exact writable central fitted color roles required');return matches[0];});
 if(JSON.stringify(g.historicLayout.buddhaSlots.map(s=>[s.subjectId,s.position]))!==JSON.stringify(['amitabha','shakyamuni','bhaisajyaguru'].map((s,i)=>[s,[FIT.buddhaCenters[i],1.7,FIT.figureZ]])))throw Error('Exact three fitted pedestal positions required');
 return{materials,recolor};
}
/** Two independently authored side figures plus a gold finish on the central
 * source-guided geometry. This is the user's Yuan-inspired design, not a date
 * attribution, artifact hand identification or photographic reconstruction. */
export function buildDafotangTriad(c){const{materials,recolor}=validate(c),{kit,f,g}=c,outputs=[],contacts=[];let published=false;
 try{
  for(const[subjectId,x]of[['amitabha',FIT.buddhaCenters[0]],['bhaisajyaguru',FIT.buddhaCenters[2]]]){
   const out=createDafotangSideFigure({subjectId,materials});outputs.push(out);
   // Bake the fitted translation once so visible and support triangles share
   // the same hall-local coordinates and survive the existing material merge.
   for(const m of out.meshes){m.geometry.translate(x,1.7,FIT.figureZ);m.geometry.computeBoundingBox();const support=triangleInstance(createTriangleTemplate(m.geometry),[221.9,0,241.1],m.name+'/'+m.uuid),box=support.box.clone();box.triangleSupport=support;box.dafotangTriadMesh=m.uuid;box.dafotangTriadSubject=subjectId;box.dafotangTriadRole=m.userData.role;contacts.push(box);}
   out.metadata.geometryStatus='PRODUCTION_NATIVE_DESIGN_FIT_PENDING_ACCEPTANCE';
  }
  const meta={id:ID,status:'USER_DESIGN_FIT_NOT_PHOTO_RECONSTRUCTION',style:'YUAN_INSPIRED_GOLD_BODY',styleOrigin:'USER_DESIGN_BRIEF',dateAttribution:'NOT_RESOLVED_BY_THIS_DESIGN',historicalInventory:'UNKNOWN',completeHistoricalDisplay:false,subjects:[{subjectId:'amitabha',x:FIT.buddhaCenters[0],basis:'INDEPENDENT_USER_DESIGN_FIT'},{subjectId:'shakyamuni',x:0,basis:'RETAINED_SOURCE_GUIDED_GEOMETRY_WITH_FITTED_GOLD_FINISH'},{subjectId:'bhaisajyaguru',x:FIT.buddhaCenters[2],basis:'INDEPENDENT_USER_DESIGN_FIT'}],figureAndLotusHeight:2.25,fitPositionsNotSurvey:true,unverified:['side gestures','facial and back detail','exact drapery','exact gold color'],photographsAdded:0,newWalkables:0,newRooms:0};
  const length=kit.colliders.length,previous=recolor.map(m=>m.material);
  try{for(const out of outputs)f.add(out.group);kit.colliders.push(...contacts);for(const m of recolor)m.material=materials.gold;g.triadFit=meta;published=true;return{meta,outputs,contacts,recolored:recolor};}
  catch(error){for(const out of outputs)out.group.removeFromParent();kit.colliders.length=length;recolor.forEach((m,i)=>m.material=previous[i]);delete g.triadFit;throw error;}
 }finally{if(!published)for(const out of outputs)out.dispose();}
}
