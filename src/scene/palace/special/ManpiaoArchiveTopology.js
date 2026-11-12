import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
/** Historical lost-layout topology approximation, NOT an identified plan outline.
 * Main hall rear-quarter east placement follows official text. No B24 reuse. */
export function createManpiaoArchiveTopology({enabled=false}={}){
 if(typeof enabled!=='boolean')throw Error('Explicit boolean required');if(!enabled)return null;
 const group=new T.Group();group.name='neige-manpiao-archive-topology';group.position.set(-181,0,-349);
 const materials=[new T.MeshStandardMaterial({name:'archive-neutral-plinth',color:0x827d73,roughness:1}),new T.MeshStandardMaterial({name:'archive-closed-plaster-fit',color:0xb6b0a1,roughness:1}),new T.MeshStandardMaterial({name:'archive-neutral-top-fit',color:0x696a65,roughness:1})],geometries=[],contacts=[];let disposed=false;
 function dispose(){if(disposed)return;disposed=true;group.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
 try{for(const [i,w,h,d,y,role]of [[0,10,.2,6,.1,'thin-ground-plinth'],[1,9.6,3.8,5.6,2.1,'closed-unknown-interior'],[2,10,.24,6,4.12,'neutral-top-not-roof-taxonomy']]){const g=new T.BoxGeometry(w,h,d).translate(0,y,0);geometries.push(g);const m=new T.Mesh(g,materials[i]);m.name=group.name+':'+role;m.castShadow=m.receiveShadow=true;group.add(m);const shape=triangleInstance(createTriangleTemplate(g),[-181,0,-349],m.name),b=shape.box.clone();b.triangleSupport=shape;contacts.push(b);}
 const meta={id:group.name,sourceObjectId:'FC-6555093DAA',name:'内阁满票签档子房（历史拓扑工程拟合）',precisionClass:'OFFICIAL_TEXT_TOPOLOGY_ALL_METRICS_ENGINEERING_FIT',productionIntegrated:false,wholeObjectAccepted:false,modernExistence:'NOT_VERIFIED',historicalOutline:'NOT_IDENTIFIED_FROM_LOW_RES_PLAN',historicalRelationship:'east of rear lodging quarter behind Neige main hall',dimensions:{x:-181,z:-349,width:10,depth:6,height:4.24},roomCount:null,doorCount:null,windowCount:null,entranceOrientation:null,roofTaxonomy:null,interior:'CLOSED_UNKNOWN',excludedIdentities:['FC-12AA4B4366','FC-DA0F70A4C4'],sourceUrls:['https://www.dpm.org.cn/explore/building/236523.html'],unknown:['individual outline and current survival','all dimensions and facade/roof form','exact relationship to unbuilt lodging and Dianjiting','full-zone runtime and visual acceptance'],newMapItems:0,newRooms:0,newTravelTargets:0};group.userData.structure=meta;return{group,contacts,materials,meta,dispose};
 }catch(e){dispose();throw e;}
}
