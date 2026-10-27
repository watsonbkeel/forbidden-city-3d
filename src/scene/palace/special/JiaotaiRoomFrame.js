import * as THREE from 'three';
import {JIAOTAI_CENTRAL} from './JiaotaiCeilingFrame.js';
import {jiaotaiRoomMaterial,jiaotaiRoomUV} from './JiaotaiRoomArt.js';
/** Only the existing central bearing and the observed west upper face.
 * Fits stay inside the inherited 19 m shell; no new column grid or east/north
 * perimeter copy is inferred from the photographs. All additions are overhead. */
export function buildJiaotaiRoomFrame(builder,shell,{x0,z0,y,w,d,H}){
 if(shell.userData.structure?.id!=='jiaotaidian'||w!==19||d!==19||H!==6.2)throw Error('Unregistered Jiaotai room frame');
 if(shell.userData.structure.roomAssembly)throw Error('Jiaotai room frame already installed');
 const material=jiaotaiRoomMaterial(builder),members=[];
 function box(name,width,height,depth,x,cy,z,bracket=false){const m=new THREE.Mesh(jiaotaiRoomUV(new THREE.BoxGeometry(width,height,depth),bracket),material);m.name=name;m.position.set(x0+x,y+cy,z0+z);m.castShadow=true;m.receiveShadow=true;shell.add(m);members.push({name,center:m.position.toArray(),size:[width,height,depth]});return m;}
 const cz=JIAOTAI_CENTRAL.centreZ;
 // Same four bearing axes and exact clear 6.2 m opening. The added apron is
 // a reversible section fit, not a claimed historical beam depth.
 for(const s of[-1,1]){
  box('jiaotai-central-painted-apron',6.40,.34,.20,0,H-.33,cz+s*3.20);
  box('jiaotai-central-painted-apron',.20,.34,6.20,s*3.20,H-.33,cz);
 }
 for(const [cy,height]of[[H-1.04,.30],[H-.59,.22]])box('jiaotai-west-inner-frieze',.08,height,18.4,9.24,cy,0);
 // Three tiers of short exposed arms, only on the photographed west face.
 // Their repeat count/section is a model fit, not a structural survey.
 for(let k=0;k<15;k++){
  const u=-8.4+k*1.2;
  box('jiaotai-west-inner-bracket-stem',.10,.44,.12,9.23,H-.26,u,true);
  for(let tier=0;tier<3;tier++){
   const span=.34+tier*.14,depth=.16+tier*.055;
   box('jiaotai-west-inner-bracket',depth,.075,span,9.20-depth/2,H-.49+tier*.105,u,true);
  }
 }
 shell.userData.structure.roomAssembly={id:'jiaotai-room-assembly-r119',source:'https://www.dpm.org.cn/explore/building/236467.html',status:'SOURCE_BOUNDED_SCHEMATIC_PHOTO_FIT_NOT_MEASURED',observedPerimeterFaces:['west'],unmodelledPerimeterDetail:['south','north','east'],members,colliders:'UNCHANGED_OVERHEAD_ONLY'};
}
