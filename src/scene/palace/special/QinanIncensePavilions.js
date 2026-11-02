import * as T from 'three';
import {CourtKit} from '../kit.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const done=new WeakSet();
export const QINAN_INCENSE_FIT=Object.freeze({centers:Object.freeze([-11,11]),z:478.4,envelope:2.8,platformTop:.08});
export function buildQinanIncensePavilions(kit,zoneId){
 if(zoneId!=='garden')return false;
 if(kit?.root?.name!=='garden'||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(new T.Vector3(1,1,1))||done.has(kit)||['colliders','walkables','owned','rooms','mapItems'].some(k=>!Array.isArray(kit[k])||!Object.isExtensible(kit[k]))||!Object.isExtensible(kit.root.children))throw Error('Untransformed mutable garden host, once only, required');
 const staged=new CourtKit(kit.lib,'garden'),pavilions=[];
 try{for(const[x,sourceObjectId,side]of[[-11,'FC-30C5E54148','east'],[11,'FC-F3135E4D16','west']]){
  const id='qinan-incense-'+side+'-source-fit',f=staged.frame(x,478.4,0);f.name=id;
  const box=(role,mat,w,h,d,bx,by,bz)=>{const m=staged.box(f,mat,w,h,d,bx,by,bz);m.name=id+'/'+role;return m;};
  box('platform','stone_slab',2.6,.08,2.6,0,.04,0).userData.qinanIncenseStoneTop=true;
  // Deliberate access fit: front supports are set behind the unchanged z477.5
  // lateral route. Column spacing/depth is NOT claimed as surveyed square bays.
  for(const cx of[-.9,.9])for(const cz of[-.15,.9]){const m=staged.mesh(f,new T.CylinderGeometry(.085,.1,2.45,10),kit.lib.material('wood_column'),cx,1.305,cz);m.name=id+'/column';}
  for(const cz of[-.15,.9])box('header','caihua_beam',2,.18,.16,0,2.5,cz);
  for(const cx of[-.9,.9])box('header','caihua_beam',.16,.18,1.2,cx,2.5,.375);
  // Text supports a rear half enclosed on all four sides with partition doors.
  // Closed opaque coarse panels, without invented furniture or accessible room.
  for(const cz of[.3,.95])box('rear-screen-cross','lattice_doors',1.8,2.2,.06,0,1.18,cz);
  for(const cx of[-.87,.87])box('rear-screen-side','lattice_doors',.06,2.2,.65,cx,1.18,.625);
  const roof=staged.roof(f,{type:'pavilion',sides:4,width:1.76,depth:1.76,baseY:2.65,height:1.05,overhang:.06,layers:1,brackets:false});roof.name=id+'/square-pyramidal';
  f.updateWorldMatrix(true,true);let ownerIndex=0;
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.qinanIncenseStoneTop){const b=new T.Box3().setFromObject(m);b.qinanIncenseStoneTop=m.name;staged.colliders.push(b);const top=b.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false});return;}
   const vertices=[],p=m.geometry.attributes.position,ix=m.geometry.index;for(let k=0;k<(ix?.count??p.count);k+=3){const vs=[0,1,2].map(j=>{const v=new T.Vector3().fromBufferAttribute(p,ix?.getX(k+j)??k+j).applyMatrix4(m.matrixWorld);return new T.Vector3(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));});if(new T.Triangle(...vs).getArea()>=1e-12)vertices.push(...vs.flatMap(v=>v.toArray()));}if(!vertices.length)return;const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],id+'/'+ownerIndex++),owner=shape.box.clone();owner.triangleSupport=shape;staged.colliders.push(owner);}finally{g.dispose();}
  });
  const b=new T.Box3().setFromObject(f),safe=new T.Box3(new T.Vector3(x-1.4,-1e-6,477),new T.Vector3(x+1.4,5.5,479.8));if(!safe.containsBox(b))throw Error('Incense pavilion escaped cleared square envelope '+JSON.stringify(b));
  const meta={id,sourceObjectId,name:'香亭',x,source:'https://www.dpm.org.cn/Uploads/pdf/2206/T00019_00.pdf',ownPhoto:null,columns:4,rearScreenSides:4,wholeObjectAccepted:false,currentAdmissionVerified:false,newRooms:0,newMapItems:0,
   sourceSupported:['official text: square pavilions east and west before Qinan, built Qianlong, originally named incense pavilions','four-column pyramidal roof; front half open, rear half partitioned on four sides by screens into small chamber'],
   fit:['regional centres ±11,478.4 and square full envelope2.8, not survey','all dimensions/colors/roof profile/south-facing opening and closed coarse wood panels are engineering fit','front columns set back at z478.25 behind preserved z477.5 approach; rectangular column grid and rear chamber compression preserve actual 1m footprint porch','2.6 square real platform .08 high, no virtual ramp'],
   excluded:['Four Gods shrine illustration is not this pair; no borrowed own photo','furniture, inscriptions, new rooms/maps, landscape cuts, air boxes, global contact permissions'],unknown:['own front/back/roof imagery and precise present appearance','surveyed location/dimensions, original door poses, materials, colors and absolute opening direction','current admission, GPU/mobile appearance']};f.userData.structure=meta;pavilions.push({frame:f,meta});
 }}catch(e){staged.dispose(staged.root);throw e;}
 kit.root.add(...[...staged.root.children]);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);done.add(kit);return{pavilions};
}
