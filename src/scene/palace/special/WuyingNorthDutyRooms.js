import * as T from 'three';
export const WUYING_NORTH_DUTY_FITS=Object.freeze([
 Object.freeze({id:'wuying-east-north-duty-room',name:'东配北值房（东库房）',x:192.2,z:-199.8,w:6,d:24}),
 Object.freeze({id:'wuying-west-north-duty-room',name:'西配北值房（总管办事西房）',x:250.6,z:-202.8,w:6,d:18}),
]);
export function createWuyingNorthDutyRooms(){
 const frames=[],geometries=[],materials=[],contacts=[];let disposed=false;
 const dispose=()=>{if(disposed)return;disposed=true;for(const f of frames)f.removeFromParent();for(const g of geometries)g.dispose();for(const m of materials)m.dispose();};
 try{
  const wall=new T.MeshStandardMaterial({name:'wuying-north-duty-fit-wall',color:0x925849,roughness:1});materials.push(wall);const roof=new T.MeshStandardMaterial({name:'wuying-north-duty-fit-roof',color:0x85754d,roughness:1});materials.push(roof);
  for(const p of WUYING_NORTH_DUTY_FITS){
   const f=new T.Group();f.name=p.id;f.position.set(p.x,0,p.z);frames.push(f);
   const core=new T.BoxGeometry(p.w,4.6,p.d);geometries.push(core);core.translate(0,2.3,0);const shape=new T.Shape();shape.moveTo(-p.w/2,4.6);shape.lineTo(p.w/2,4.6);shape.lineTo(0,5.8);shape.closePath();const top=new T.ExtrudeGeometry(shape,{depth:p.d,steps:1,bevelEnabled:false});geometries.push(top);top.translate(0,0,-p.d/2);
   for(const[g,m,role]of[[core,wall,'closed-core'],[top,roof,'fitted-triangular-roof']]){const mesh=new T.Mesh(g,m);mesh.name=p.id+':'+role;mesh.castShadow=mesh.receiveShadow=true;f.add(mesh);f.updateMatrixWorld(true);const c=new T.Box3().setFromObject(mesh);c.wuyingNorthDutyRoom=p.id;contacts.push(c);}
   f.userData.structure={id:p.id,name:p.name,source:'https://img.dpm.org.cn/Uploads/pdf/5077/T00008_00.pdf',sourceFigure:'2007issue4 p8 Fig1 and adjoining named text',dimensionStatus:'ENGINEERING_FIT_NOT_SURVEYED',reserve:[p.x-p.w/2,0,p.z-p.d/2,p.x+p.w/2,5.8,p.z+p.d/2],sourceSupported:['own distinct north-duty-room name and footprint north of its side hall','unequal east/west north-body lengths in named plan'],fitted:['all metric coordinates heights widths lengths and generic roof slopes','solid hidden core and coarse colors, not own facade photograph'],newRooms:0,newMapItems:0,interiorImplemented:false,wholeCorridorGroupAccepted:false,partialGroupSourceObjectId:p.id==='wuying-east-north-duty-room'?'FC-C62B05256F':'FC-9DABF33837',partialGroupScope:'ONLY_NAMED_NORTH_DUTY_SUBBODY_NOT_WHOLE_SIDE_GROUP_OR_63_ROOMS',wholeObjectAccepted:false,original397Mapping:'PARTIAL_GROUP_ATTRIBUTION_PENDING_NORMAL_INTEGRATION_REVIEW',productionIntegrated:false,collision:'INDEPENDENT_CONSERVATIVE_PRIMITIVE_BOXES'};
  }
  return{frames,geometries,materials,contacts,dispose};
 }catch(e){dispose();throw e;}
}
