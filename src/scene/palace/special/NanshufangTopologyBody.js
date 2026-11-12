import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
/** Detached own D31 historical topology volume; not a modern facade survey.
 * Entire metric extent/height/neutral top are engineering choices. Production
 * requires separately reviewed replacement of only a southwest-wall segment. */
export function createNanshufangTopologyBody({enabled=false}={}){
 if(typeof enabled!=='boolean')throw Error('Explicit boolean required');if(!enabled)return null;
 const group=new T.Group();group.name='nanshufang-southwest-topology-body';group.position.set(48.375,0,213.05);
 const material=new T.MeshStandardMaterial({name:'nanshufang-neutral-fit',color:0xa29886,roughness:1}),geometry=new T.BoxGeometry(9.75,4.5,4.5).translate(0,2.25,0);let disposed=false;
 const dispose=()=>{if(disposed)return;disposed=true;group.removeFromParent();geometry.dispose();material.dispose();};
 try{const mesh=new T.Mesh(geometry,material);mesh.castShadow=mesh.receiveShadow=true;mesh.name=group.name+':closed-unknown-core';group.add(mesh);const shape=triangleInstance(createTriangleTemplate(geometry),[48.375,0,213.05],mesh.name),b=shape.box.clone();b.triangleSupport=shape;
 const meta={id:group.name,sourceObjectId:'FC-4110BD4CBE',name:'南书房（西南横庑历史拓扑拟合）',productionIntegrated:false,wholeObjectAccepted:false,precisionClass:'ALL_METRICS_ENGINEERING_FIT_HISTORICAL_TOPOLOGY_ONLY',historicalRoomCount:3,modeledBayCount:null,doorCount:null,windowCount:null,roofTaxonomy:null,interior:'CLOSED_UNKNOWN',eastNeighbor:'敬事房',originalHost:'garden/items/13 WESTERN_PART_ONLY',dimensions:{x:48.375,z:213.05,width:9.75,depth:4.5,height:4.5},normalHook:'PENDING_SCOPED_WALL_REPLACEMENT_REVIEW',sourceUrls:['https://img.dpm.org.cn/Uploads/File/2020/02/28/u5e58c21a7153b.pdf','https://www.dpm.org.cn/Uploads/File/2020/03/06/u5e61ec373d950.pdf'],unknown:['east boundary relative to actual current column line','all metric size and roof/facade form','ground support/full cross-zone contacts','interior/current public admission'],newRooms:0,newMapItems:0,newTravelTargets:0};group.userData.structure=meta;return{group,contacts:[b],materials:[material],meta,dispose};
 }catch(e){dispose();throw e;}
}
