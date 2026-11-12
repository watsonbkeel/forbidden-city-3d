import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
/** Independent D26 west-court topology. ALL shape/dimensions engineering-fit,
 * not a measured outline or a mirrored D25 building. West corridor390.2..404
 * independently anchors the proposed longitudinal center397.1. */
export function createXinuanTopologyMassing({enabled=false}={}){
 if(typeof enabled!=='boolean')throw Error('Explicit boolean required');if(!enabled)return null;
 const group=new T.Group();group.name='xinuan-topology-only-massing';group.position.set(35,0,397.1);
 const materials=[],geometries=[],contacts=[];let disposed=false;
 const dispose=()=>{if(disposed)return;disposed=true;group.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());};
 try{
  for(const [role,w,h,d,y,color] of [['engineering-base',7.6,.12,5.6,.06,0x85827a],['closed-unknown-core',7.2,4.2,5.2,2.22,0xa99e8c],['neutral-top-closure-not-historic-roof',8,.22,6,4.43,0x716d61]]){
   const m=new T.MeshStandardMaterial({name:'xinuan-'+role,roughness:.94,color});materials.push(m);
   const g=new T.BoxGeometry(w,h,d).translate(0,y,0);geometries.push(g);
   const mesh=new T.Mesh(g,m);mesh.name=group.name+':'+role;mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);
   const shape=triangleInstance(createTriangleTemplate(g),[35,0,397.1],mesh.name+':'+mesh.uuid),b=shape.box.clone();b.triangleSupport=shape;b.xinuanMesh=mesh.uuid;contacts.push(b);
  }
  const meta={id:group.name,sourceObjectId:'FC-C3BA7692B4',name:'西暖殿（历史拓扑工程体量）',precisionClass:'TOPOLOGY_ONLY_ENGINEERING_MASSING',historicalShapeVerified:false,wholeObjectAccepted:false,defaultEnabled:false,westCorridorStart:390.2,westCorridorEnd:404,independentPlacementBasis:'OWN_NAMED_WEST_COURT_AND_WEST_HOST_NOT_EAST_MIRROR',dimensions:{x:35,z:397.1,maxWidth:8,maxDepth:6,maxHeight:4.54},roofTaxonomy:null,bayCount:null,doorCount:null,windowCount:null,interior:'CLOSED_UNKNOWN',newRooms:0,newMapItems:0,newTravelTargets:0,period:'HISTORICAL_QING_IDENTITY_NOT_2026_REPAIR_APPEARANCE',topClosure:'NEUTRAL_ENGINEERING_CAP_NOT_HISTORICAL_FLAT_ROOF',sourceUrls:['https://img.dpm.org.cn/Uploads/File/2020/02/28/u5e58c21a7153b.pdf','https://www.dpm.org.cn/Uploads/File/2019/07/25/u5d39787cea17e.pdf'],unknown:['all historic dimensions and placement','roof form color openings and bays','interior current use and appearance','full-host visual acceptance']};group.userData.structure=meta;
  return{group,contacts,materials,meta,dispose};
 }catch(e){dispose();throw e;}
}
