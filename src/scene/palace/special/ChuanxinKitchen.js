import * as T from 'three';
export const CHUANXIN_KITCHEN_FIT=Object.freeze({x:-230,z:-182.5,width:6,depth:9,eave:3.4,ridge:4.4});
export function createChuanxinKitchen(){
 const frame=new T.Group(),geometries=[],materials=[],contacts=[];let disposed=false;
 const dispose=()=>{if(disposed)return;disposed=true;frame.removeFromParent();for(const g of geometries)g.dispose();for(const m of materials)m.dispose();};
 try{
  const wall=new T.MeshStandardMaterial({name:'chuanxin-kitchen-fitted-wall',color:0x925849,roughness:1});materials.push(wall);
  const roof=new T.MeshStandardMaterial({name:'chuanxin-kitchen-fitted-roof',color:0x787b75,roughness:1});materials.push(roof);
  frame.name='chuanxin-kitchen-historical-fit';frame.position.set(-230,0,-182.5);
  const mesh=(g,m,name)=>{const o=new T.Mesh(g,m);o.name=name;o.castShadow=o.receiveShadow=true;frame.add(o);frame.updateMatrixWorld(true);const c=new T.Box3().setFromObject(o);c.chuanxinKitchen='FC-D852D8A192';contacts.push(c);};
  for(let i=0;i<3;i++){const g=new T.BoxGeometry(6,3.4,3);geometries.push(g);g.translate(0,1.7,-3+i*3);mesh(g,wall,'bay-'+(i+1));}
  const shape=new T.Shape();shape.moveTo(-3,3.4);shape.lineTo(3,3.4);shape.lineTo(0,4.4);shape.closePath();const g=new T.ExtrudeGeometry(shape,{depth:9,steps:1,bevelEnabled:false});geometries.push(g);g.translate(0,0,-4.5);mesh(g,roof,'fitted-roof-not-historic-roof-identification');
  frame.userData.structure={id:frame.name,sourceObjectId:'FC-D852D8A192',name:'传心殿神厨（历史三间工程拟合）',historicalBays:3,modelStatus:'MODEL_FIT',positionAndDimensionsStatus:'ENGINEERING_FIT_NOT_SURVEYED',roofVerified:false,colorVerified:false,orientationVerified:false,currentExistenceVerified:false,currentPhysicalIdentityVerified:false,lShapedRoomIdentityAdopted:false,boardRoomRebound:false,wholeCourtyardAccepted:false,productionIntegrated:false,interiorImplemented:false,doorwaysImplemented:false,newMapItems:0,newWalkables:0,sourceSupported:['distinct historical kitchen behind Chuanxin hall','three historical bays separate from board room'],fitted:['6 by 9 by 4.4 meters','exact game position and orientation','three solid engineering segments and generic two-slope closure','all material colors'],sourceUrls:['https://img.dpm.org.cn/Uploads/pdf/3718/T00021_00.pdf','https://www.dpm.org.cn/Uploads/File/2020/05/22/u5ec7aa3e2df0c.pdf','https://www.dpm.org.cn/Uploads/File/2020/11/13/u5fae21c07c127.pdf'],unresolved:['modern L-shaped room attribution','extant status and historical survey','own roof and facade details'],reserve:[-233,0,-187,-227,4.4,-178],collision:'INDEPENDENT_CONSERVATIVE_BOXES_CLOSED_BODY'};
  return{frame,geometries,materials,contacts,dispose};
 }catch(e){dispose();throw e;}
}
