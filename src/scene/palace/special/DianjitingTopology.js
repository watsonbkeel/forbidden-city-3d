import * as T from 'three';
export const DIANJI_ID='FC-DA0F70A4C4';
/** Named historical office; geometry and placement are explicit engineering assumptions. */
export function createDianjitingTopology(){
 const group=new T.Group();group.name='neige-dianjiting-topology';group.position.set(-168,0,-349);
 const geometries=[],materials=[];let disposed=false;
 const dispose=()=>{if(disposed)return;disposed=true;group.removeFromParent();for(const g of geometries)g.dispose();for(const m of materials)m.dispose();};
 try{
  for(const [name,w,h,d,y,color]of [['ground-plinth',8,.2,6,.1,0x827d73],['closed-unknown-interior',7.8,3.8,5.8,2.1,0xb6b0a1],['neutral-cap-not-historic-roof',8,.2,6,4.1,0x696a65]]){
   const g=new T.BoxGeometry(w,h,d);geometries.push(g);g.translate(0,y,0);
   const m=new T.MeshStandardMaterial({name:'dianjiting-'+name,color,roughness:1});materials.push(m);
   const mesh=new T.Mesh(g,m);mesh.name=group.name+':'+name;mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);
  }
  const contact=new T.Box3(new T.Vector3(-172,0,-352),new T.Vector3(-164,4.2,-346));contact.dianjitingTopologyProxy=true;
  group.userData.structure={id:group.name,sourceObjectId:DIANJI_ID,name:'内阁典籍厅（历史身份与工程拓扑拟合）',historicalIdentity:'TEXT_ATTESTED_OFFICE_NOT_STOREHOUSE',historicalReferenceResolved:false,placementInterpretation:'WEST_OF_ARCHIVE_IS_ENGINEERING_READING_NOT_RESOLVED_HISTORICAL_REFERENCE',lodgingPosition:'UNKNOWN_MAIN_HALL_AXIS_IS_NOT_LODGING_LOCATION',precisionClass:'ALL_POSITION_SCALE_FORM_MODEL_FIT',dimensions:{x:-168,z:-349,width:8,depth:6,height:4.2},roofTaxonomy:null,bays:null,doorCount:null,entranceOrientation:null,interior:'CLOSED_UNKNOWN',wholeObjectAccepted:false,productionIntegrated:false,newMapItems:0,newTravelTargets:0,sourceUrls:['https://www.dpm.org.cn/explore/building/236523.html','https://www.shidianguji.com/book/CADAL02022806/chapter/1lm4lnafzeeix'],unknown:['west relative to lodging or archive remains ambiguous','historical outline/current survival','all metrics and facade/roof form','real scene visual acceptance']};
  return{group,contact,materials,dispose};
 }catch(error){dispose();throw error;}
}
