import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
export const WUYING_GATE_ROOM_SOURCE='https://img.dpm.org.cn/Uploads/pdf/5077/T00008_00.pdf';
// Figure 1 shows these named bodies, not the original C12/C13 corridor identity.
// All metric coordinates, heights, generic roof and colors are engineering fits.
export const WUYING_GATE_ROOM_FITS=Object.freeze([
 Object.freeze({id:'wuying-gate-east-duty-room',name:'武英门东值房',x:192.9,z:-250.1,w:18.6,d:5.3}),
 Object.freeze({id:'wuying-gate-west-duty-room',name:'武英门西值房',x:249,z:-250.1,w:18.6,d:5.3}),
]);
/** Detached reusable bodies only. Intentionally no production registration:
 * retained generic court walls intersect the diagram-relative reserve.
 * A separately reviewed dedicated wall join is required before integration.
 * Caller must either adopt geometries/materials into lifecycle or dispose(). */
export function createWuyingGateRoomBodies(){
 const frames=[],colliders=[],geometries=[],materials=[];
 let disposed=false;
 const dispose=()=>{if(disposed)return;disposed=true;for(const g of geometries)g.dispose();for(const m of materials)m.dispose();};
 try{
  const wall=new T.MeshStandardMaterial({name:'wuying-duty-plain-wall-MODEL_FIT',color:0x925849,roughness:1});materials.push(wall);
  const roof=new T.MeshStandardMaterial({name:'wuying-duty-generic-roof-MODEL_FIT',color:0x85754d,roughness:1});materials.push(roof);
  for(const p of WUYING_GATE_ROOM_FITS){
   const frame=new T.Group();frame.name=p.id;frame.position.set(p.x,0,p.z);
   frame.userData.structure={id:p.id,name:p.name,status:'MODEL_FIT',source:WUYING_GATE_ROOM_SOURCE,sourceFigure:'2007 issue4 p8 figure1',original397Item:false,closesC12C13:false,productionIntegrated:false,interior:'CLOSED_UNKNOWN_NO_DOOR_OR_FURNISHING',registration:'BLOCKED_PENDING_DEDICATED_WALL_JOIN',unknown:['metric placement and dimensions','roof form height material color','bay count and facade openings','current scene visual acceptance']};
   const shape=new T.Shape();shape.moveTo(-p.d/2,4.6);shape.lineTo(p.d/2,4.6);shape.lineTo(0,5.8);shape.closePath();
   const rg=new T.ExtrudeGeometry(shape,{depth:p.w,bevelEnabled:false,steps:1});rg.rotateY(Math.PI/2);rg.translate(-p.w/2,0,0);
   const body=new T.BoxGeometry(p.w,4.6,p.d).translate(0,2.3,0);
   for(const [g,m,role] of [[body,wall,'closed-core'],[rg,roof,'generic-pitched-roof']]){
    geometries.push(g);const mesh=new T.Mesh(g,m);mesh.name=p.id+':'+role;mesh.castShadow=mesh.receiveShadow=true;frame.add(mesh);
    const support=triangleInstance(createTriangleTemplate(g),[p.x,0,p.z],mesh.name),box=support.box.clone();box.triangleSupport=support;box.wuyingGateRoom=p.id;colliders.push(box);mesh.userData.collisionOwner=support.id;
   }
   frames.push(frame);
  }
  return{frames,colliders,materials,dispose,productionIntegrated:false};
 }catch(e){dispose();throw e;}
}
