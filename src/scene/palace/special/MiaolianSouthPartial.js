import * as T from 'three';
export const MIAOLIAN_ID='FC-5264A545B2';
/** Own named plan node, only its southern partial engineering envelope.
 * Neutral cap is NOT a historical flat roof or a reconstruction of three rolls. */
export function createMiaolianSouthPartial(){
 const group=new T.Group();group.name='miaolian-south-partial';const geometries=[],materials=[];let disposed=false;
 const dispose=()=>{if(disposed)return;disposed=true;group.removeFromParent();for(const g of geometries)g.dispose();for(const m of materials)m.dispose();};
 try{
  for(const [name,color,w,h,d,y]of[['plinth-fit',0x9a958a,9,.24,3.3,.12],['closed-core-fit',0x8c3a30,9,3.6,3.3,2.04],['neutral-cap-not-historic-roof',0x817560,9,.36,3.3,4.02]]){const g=new T.BoxGeometry(w,h,d);geometries.push(g);const m=new T.MeshStandardMaterial({color,roughness:.9});materials.push(m);const mesh=new T.Mesh(g,m);mesh.name=group.name+'/'+name;mesh.position.y=y;group.add(mesh);}
  group.userData.structure={id:group.name,sourceObjectId:MIAOLIAN_ID,name:'妙莲华室',scope:'SOUTH_PARTIAL_CLOSED_MASSING_MODEL_FIT',wholeObjectAccepted:false,historicalDimensions:false,currentAdmissionVerified:false,source:'https://www.dpm.org.cn/explore/building/236492.html',planCaption:'官方建福宫花园平面图2648；来源页面同source',fit:['entire position, width/depth/height, material colors and three primitive courses','neutral cap is a partial engineering closure, not an evidenced roof type'],unknown:['three connected roof rolls direction and full shape','diagonal gallery slope, levels and joins','doors, inscriptions, interior and exact historic/current measured footprint'],excluded:['north part occupying retained z480 route','continuous adjacent gallery/wall restoration','visitor entrance, room, map or teleport'],collision:'ONE_CLOSED_ENVELOPE_PROXY_SAME_FULL_FOOTPRINT',productionIntegrated:false};
  const contact=new T.Box3(new T.Vector3(-4.5,0,-1.65),new T.Vector3(4.5,4.2,1.65));return{group,contact,materials,dispose};
 }catch(e){dispose();throw e;}
}
