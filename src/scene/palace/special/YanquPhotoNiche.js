import * as THREE from 'three';
import {createXiqingSurface} from '../../../controls/XiqingRoofSurface.js';
import {YANQU_NICHE_FLOOR,YANQU_NICHE_REGION} from '../../../controls/YanquNicheSupport.js';
// Photo2670 establishes this group, NOT its room/floor/orientation or current display.
export function buildYanquPhotoNiche(c){
 const{p,kit,f}=c,y=p.ph,z=2.25,parts=[];
 const palette={wood:0x493c2b,pale:0xb5b786,blue:0x547984,white:0xc8cbb1,gold:0xb3a04b,dark:0x283b30};
 const mats={};for(const[k,color]of Object.entries(palette)){mats[k]=new THREE.MeshStandardMaterial({name:'yanqu_photo_'+k+'_fit',color,roughness:.86});kit.owned.push(mats[k]);}
 const put=(role,geo,mat,x,yy,zz)=>{const m=c.tag(kit.mesh(f,geo,mats[mat],x,yy,zz),role);parts.push(m);return m;};
 const box=(role,mat,w,h,d,x,yy,zz)=>put(role,new THREE.BoxGeometry(w,h,d),mat,x,yy,zz);
 const rect=(role,mat,x,yy,zz,w,h,t=.045)=>{for(const s of[-1,1]){box(role,mat,t,h,.035,x+s*(w-t)/2,yy,zz);box(role,mat,w,t,.035,x,yy+s*(h-t)/2,zz);}};
 const base=box('yanqu-photo-seat-base','wood',3.6,.50,1.45,0,y+.25,z);base.updateWorldMatrix(true,false);const owner=new THREE.Box3().setFromObject(base,true);owner.yanquPhotoNiche=true;kit.colliders.push(owner);
 box('yanqu-photo-woven-front','pale',3.32,.32,.025,0,y+.24,z-.738);rect('yanqu-photo-woven-border','wood',0,y+.24,z-.76,3.36,.35,.045);
 for(let i=0;i<35;i++)box('yanqu-photo-plain-weave','gold',.012,.28,.006,-1.57+i*3.14/34,y+.24,z-.755);
 box('yanqu-photo-mattress','gold',3.4,.075,1.32,0,y+.5375,z);
 box('yanqu-photo-central-cushion','gold',1.75,.065,.76,0,y+.6075,z-.12);
 const back=new THREE.Shape();back.moveTo(-.64,0);back.lineTo(.64,0);back.lineTo(.64,.65);back.lineTo(.54,.88);back.lineTo(.30,1.02);back.lineTo(.22,1.13);back.lineTo(-.22,1.13);back.lineTo(-.30,1.02);back.lineTo(-.54,.88);back.lineTo(-.64,.65);back.closePath();put('yanqu-photo-scalloped-backrest',new THREE.ExtrudeGeometry(back,{depth:.12,bevelEnabled:false}),'gold',0,y+.60,z+.37);
 for(const s of[-1,1]){put('yanqu-photo-bolster',new THREE.CylinderGeometry(.21,.22,.31,12),'gold',s*1.17,y+.73,z-.1);box('yanqu-photo-seat-side-rail','wood',.07,.075,1.42,s*1.75,y+1.04,z);for(let j=0;j<6;j++)box('yanqu-photo-seat-side-spindle','wood',.055,.45,.05,s*1.75,y+.79,z-.61+j*.244);}
 const sz=3.12;
 for(let i=0;i<4;i++){
  const x=(i-1.5)*.78;box('yanqu-photo-screen','pale',.70,2.25,.065,x,y+1.99,sz);rect('yanqu-photo-screen-frame','wood',x,y+1.99,sz-.07,.76,2.34,.075);
  for(let j=0;j<3;j++){
   const yy=y+1.22+j*.75;const disc=(role,mat,r,xx,yyy,zz)=>{const g=new THREE.CylinderGeometry(r,r,.018,8);g.rotateX(Math.PI/2);return put(role,g,mat,xx,yyy,zz);};
   disc('yanqu-photo-flower-centre','blue',.064,x,yy,sz-.095);
   for(let k=0;k<8;k++){const a=k*Math.PI/4;disc('yanqu-photo-flower-petal',k%2?'blue':'white',.047,x+Math.cos(a)*.105,yy+Math.sin(a)*.105,sz-.10);}
   rect('yanqu-photo-flower-field','dark',x,yy,sz-.08,.43,.43,.022);
   if(j<2){const mid=yy+.375;rect('yanqu-photo-plain-inlay-loop','dark',x-.055,mid,sz-.08,.30,.25,.025);rect('yanqu-photo-plain-inlay-loop','dark',x+.055,mid+.045,sz-.081,.30,.25,.025);}
  }
 }
 for(const s of[-1,1])box('yanqu-photo-frame-post','wood',.15,3.55,.18,s*1.95,y+1.775,sz-.04);
 box('yanqu-photo-top-beam','wood',4.05,.18,.18,0,y+3.46,sz-.04);box('yanqu-photo-top-inlay-field','pale',3.68,.27,.05,0,y+3.17,sz-.055);rect('yanqu-photo-top-border','wood',0,y+3.17,sz-.09,3.78,.34,.045);
 for(let i=0;i<7;i++){const xx=(i-3)*.48;for(const s of[-1,1])box('yanqu-photo-top-flower-cue','blue',.075,.075,.025,xx+s*.055,y+3.17,sz-.1);box('yanqu-photo-top-flower-cue','white',.05,.12,.025,xx,y+3.17,sz-.11);}
 // All visible fitted objects except the exact cuboid base share actual triangles.
 const faces=[];for(const m of parts){if(m===base)continue;m.updateWorldMatrix(true,false);const a=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??a.count);i+=3)faces.push({source:{mesh:f.children.indexOf(m),triangle:i/3},vertices:[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(a,ix?ix.getX(i+k):i+k).applyMatrix4(m.matrixWorld))});}
 const contact=createXiqingSurface(faces,'yanqu-photo-niche'),b=contact.box.clone();b.xiqingRoofSurface=contact;b.yanquPhotoNiche=true;kit.colliders.push(b);
 owner.furnitureMotionScope={kind:'yanqu-photo-niche',id:'yanqu-photo-niche',floor:YANQU_NICHE_FLOOR,minOffsetX:YANQU_NICHE_REGION.minX-owner.min.x,maxOffsetX:YANQU_NICHE_REGION.maxX-owner.min.x,minOffsetZ:YANQU_NICHE_REGION.minZ-owner.min.z,maxOffsetZ:YANQU_NICHE_REGION.maxZ-owner.min.z};
 const data={object:'FC-C7215A0EDA',source:'https://www.dpm.org.cn/explore/building/236515.html',photo:'https://img.dpm.org.cn/Uploads/Picture/dc/2670[1024].jpg',accepted:false,scope:'ONE_PHOTOGRAPHED_THRONE_AND_FOUR_INLAID_SCREENS_GROUP',locationVerified:false,floorVerified:false,currentInventoryVerified:false,placement:'FITTED_GROUND_LEVEL_REAR_VIEWING_POSITION_NOT_ORIGINAL_ROOM_OR_ORIENTATION',dimensions:'MODEL_FIT_NOT_SURVEY',pattern:'SIMPLIFIED_PORCELAIN_CLUSTER_AND_TEXTILE_COLOR_RELATIONSHIPS_NOT_ORIGINAL_ARTWORK',newWalkables:0,newUpperDestinations:0,missing:['actual room floor orientation and date','original porcelain painting carving and embroidery','remaining interiors and current exhibition','historic demolished bridge not recreated']};f.userData.yanquPhotoNiche=data;return data;
}
