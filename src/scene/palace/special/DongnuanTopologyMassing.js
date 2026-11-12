import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
/** A reversible research mass, not a historical roof/facade reconstruction.
 * Named map topology supports identity and east courtyard only. All dimensions
 * and the plain closure below are explicitly engineering choices. */
export function createDongnuanTopologyMassing({enabled=false}={}){
 if(typeof enabled!=='boolean')throw Error('Explicit research enable boolean required');if(!enabled)return null;
 const group=new T.Group();group.name='dongnuan-topology-only-massing';group.position.set(-35,0,396);
 const materials=[],geometries=[],contacts=[];let disposed=false;
 const dispose=()=>{if(disposed)return;disposed=true;group.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());};
 try{
 const material=(name,color)=>{const m=new T.MeshStandardMaterial({name,color,roughness:.94});materials.push(m);return m;};
 const box=(role,w,h,d,y,mat)=>{const g=new T.BoxGeometry(w,h,d).translate(0,y,0);geometries.push(g);const m=new T.Mesh(g,mat);m.name=group.name+'/'+role;m.userData.role=role;m.castShadow=m.receiveShadow=true;group.add(m);};
 box('engineering-low-base',7.6,.12,5.6,.06,material('dongnuan-neutral-base-fit',0x85827a));
 box('closed-unknown-volume',7.2,4.2,5.2,2.22,material('dongnuan-neutral-core-fit',0xa99e8c));
 // Flat top is a neutral geometry closure, NOT evidence of a historic flat roof.
 box('nonhistorical-neutral-top-closure',8,.22,6,4.43,material('dongnuan-neutral-closure-fit',0x716d61));
 group.updateMatrixWorld(true);for(const m of group.children){const s=triangleInstance(createTriangleTemplate(m.geometry),[-35,0,396],m.name+'/'+m.uuid),c=s.box.clone();c.triangleSupport=s;c.dongnuanMesh=m.uuid;contacts.push(c);}
 const meta={id:group.name,sourceObjectId:'FC-0651110E09',name:'东暖殿（历史拓扑工程体量）',precisionClass:'TOPOLOGY_ONLY_ENGINEERING_MASSING',defaultEnabled:false,historicalShapeVerified:false,wholeObjectAccepted:false,scope:'NAMED_EAST_COURTYARD_IDENTITY_ONLY_ALL_SHAPE_AND_DIMENSIONS_FITTED',period:'HISTORICAL_QING_MAP_IDENTITY_NOT_2026_REPAIR_APPEARANCE',placement:'PROPOSED_ENGINEERING_RESERVE_NOT_SURVEY',dimensions:{x:-35,z:396,maxWidth:8,maxDepth:6,maxHeight:4.54},roofTaxonomy:null,bayCount:null,doorCount:null,windowCount:null,interior:'CLOSED_UNKNOWN_NO_ADMISSION_CLAIM',newRooms:0,newMapItems:0,newTravelTargets:0,oppositeHallGenerated:false,sourceUrls:['https://img.dpm.org.cn/Uploads/File/2020/02/28/u5e58c21a7153b.pdf','https://www.dpm.org.cn/Uploads/File/2019/07/25/u5d39787cea17e.pdf'],unknown:['all measured footprint dimensions and precise placement','historic roof taxonomy, colors, bays, doors and windows','interior and current visitor access','2026 repair appearance','full host routes and visual acceptance'],topClosure:'NEUTRAL_ENGINEERING_CAP_NOT_HISTORICAL_FLAT_ROOF'};
 group.userData.structure=meta;return{group,meta,contacts,materials,dispose};
 }catch(e){dispose();throw e;}
}
