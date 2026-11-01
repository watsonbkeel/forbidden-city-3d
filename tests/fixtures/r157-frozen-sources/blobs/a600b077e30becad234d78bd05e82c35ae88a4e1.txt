import * as THREE from 'three';
import {createXiqingSurface} from '../../../controls/XiqingRoofSurface.js';
// Own official exterior4750 and east-bridge photo: fitted silhouettes only.
export function buildJingqiSouthGallery(c){
 const{p,kit,f}=c,w=p.localW,bw=w/7,y=p.upperFloorY,z=-p.localD/2+.1;
 const palette={wood:0x704736,dark:0x394737,green:0x53776a,gold:0xb19b58,pale:0xc6c3a7};const mats={};for(const[k,color]of Object.entries(palette)){mats[k]=new THREE.MeshStandardMaterial({name:'jingqi_south_'+k+'_photo_fit',color,roughness:.91});kit.owned.push(mats[k]);}
 const all=[];
 for(let i=0;i<7;i++){
  const x=-w/2+(i+.5)*bw,ww=bw-.22,parts=[];
  const put=(role,geo,mat,xx,yy,zz)=>{const m=c.tag(kit.mesh(f,geo,mats[mat],xx,yy,zz),role,{panel:i,precision:'SIMPLIFIED_PHOTO_FIT_NOT_ORIGINAL_CARVING'});parts.push(m);all.push(m);return m;};
  const box=(role,mat,a,b,d,xx,yy,zz)=>put('jingqi-south-'+role,new THREE.BoxGeometry(a,b,d),mat,xx,yy,zz);
  const rect=(role,mat,xx,yy,zz,a,b,t=.04)=>{for(const s of[-1,1]){box(role,mat,t,b,.035,xx+s*(a-t)/2,yy,zz);box(role,mat,a,t,.035,xx,yy+s*(b-t)/2,zz);}};
  box('rail-cap','wood',ww,.11,.15,x,y+1.02,z);
  box('rail-lower-bar','wood',ww,.085,.13,x,y+.20,z);
  box('rail-middle-bar','wood',ww,.075,.12,x,y+.58,z);
  for(const s of[-1,1])box('rail-post','wood',.12,1.06,.15,x+s*(ww/2-.06),y+.53,z);
  // Three central supports and framed plain lower fields: real open air above.
  for(let j=0;j<3;j++){const xx=x+(j-1)*ww/3;box('rail-spindle','wood',.07,.8,.10,xx,y+.59,z);box('rail-painted-neck','pale',.095,.12,.12,xx,y+.91,z);}
  for(let j=0;j<4;j++){const xx=x-ww/2+(j+.5)*ww/4;rect('rail-lower-field','wood',xx,y+.38,z-.055,ww/4-.14,.25,.045);}
  const fy=y-.25;box('fascia-field','green',bw,.38,.20,x,fy,z-.5675);for(const sign of[-1,1])box('fascia-border','gold',bw,.025,.035,x,fy+sign*.17,z-.685);
  // Explicitly simplified continuous scroll-like line; not copied original art.
  for(let j=0;j<5;j++){const xx=x-bw/2+(j+.5)*bw/5,r=.115;for(const s of[-1,1]){const curve=new THREE.EllipseCurve(0,0,r,.10,0,Math.PI*1.65,false);const points=curve.getPoints(10).map(v=>new THREE.Vector3(v.x*s,v.y,0));const path=new THREE.CatmullRomCurve3(points);put('jingqi-south-fascia-scroll-fit',new THREE.TubeGeometry(path,10,.012,4,false),'gold',xx+s*.105,fy,z-.71);}}
  const hy=p.ph+p.colH-.42;box('hanging-band','wood',ww,.12,.09,x,hy,z);
  for(let j=0;j<6;j++)rect('hanging-grid-fit','wood',x-ww/2+(j+.5)*ww/6,hy-.18,z-.02,ww/6-.08,.22,.025);
  for(const s of[-1,1])box('hanging-return','wood',.11,.38,.09,x+s*(ww/2-.08),hy-.25,z);
  const faces=[];for(const m of parts){m.updateWorldMatrix(true,false);const pp=m.geometry.attributes.position,ix=m.geometry.index;for(let j=0;j<(ix?.count??pp.count);j+=3)faces.push({source:{mesh:f.children.indexOf(m),triangle:j/3},vertices:[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(pp,ix?ix.getX(j+k):j+k).applyMatrix4(m.matrixWorld))});}
  const contact=createXiqingSurface(faces,'jingqi-south-gallery-'+i),b=contact.box.clone();b.xiqingRoofSurface=contact;b.jingqiSouthGallery=i;kit.colliders.push(b);
 }
 // Existing original platform Box owns dispatch; no added solid scope volume.
 const owner=kit.colliders.find(b=>Math.abs(b.max.y-p.ph)<1e-8&&b.min.x<p.x-w/2&&b.max.x>p.x+w/2&&b.min.z<p.z-p.localD/2);
 if(!owner)throw Error('Jingqi retained platform scope owner missing');
 owner.furnitureMotionScope={kind:'jingqi-south-gallery',id:'jingqi-south-gallery',groundY:0,minOffsetX:p.x-w/2-.7-owner.min.x,maxOffsetX:p.x+w/2+.7-owner.min.x,minOffsetZ:p.z+z-2-owner.min.z,maxOffsetZ:p.z+z+.7-owner.min.z};
 const data={object:'FC-15C0D4E6BC',source:p.source,photo:'https://img.dpm.org.cn/Uploads/Picture/dc/4750[1024].jpg',accepted:false,scope:'SEVEN_BAY_UPPER_SOUTH_GALLERY_RAIL_HANGING_AND_FASCIA',dimensions:'MODEL_FIT_NOT_SURVEY',pattern:'SIMPLIFIED_OPEN_RAIL_AND_SCROLL_RELATIONSHIPS_NOT_ORIGINAL_PAINT_OR_CARVING',currentPaintVerified:false,newUpperDestinations:0,retained:['original upper windows and central door','ground facade and interiors','east staircase and floor void','side rear rails and bridge interface','roofs and original navigation'],missing:['original carved kui-dragon and painted gold-dragon artwork','surveyed rail dimensions and exact aperture count','current interior exhibition','full gallery and bridge traversal certification']};f.userData.jingqiSouthGallery=data;return data;
}
