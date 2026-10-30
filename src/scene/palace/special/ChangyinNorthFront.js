import * as THREE from 'three';
import {createXiqingSurface} from '../../../controls/XiqingRoofSurface.js';
// Official2604/1492/1493: relative frontage forms, never copied original artwork.
export function buildChangyinNorthFront(c){
 const{p,kit,f}=c,w=p.localW,bw=w/3,y=p.ph,z=-p.localD/2;
 const palette={red:0x963c30,gold:0xc1a15e,blue:0x446c99,green:0x3c7567,dark:0x2e3f36};const mats={};for(const[k,color]of Object.entries(palette)){mats[k]=new THREE.MeshStandardMaterial({name:'changyin_north_'+k+'_photo_fit',color,roughness:.88});kit.owned.push(mats[k]);}
 const register=(parts,id,tag)=>{const faces=[];for(const m of parts){m.updateWorldMatrix(true,false);const a=m.geometry.attributes.position,ix=m.geometry.index;for(let j=0;j<(ix?.count??a.count);j+=3)faces.push({source:{mesh:f.children.indexOf(m),triangle:j/3},vertices:[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(a,ix?ix.getX(j+k):j+k).applyMatrix4(m.matrixWorld))});}const contact=createXiqingSurface(faces,id),b=contact.box.clone();b.xiqingRoofSurface=contact;Object.assign(b,tag);kit.colliders.push(b);};
 const build=(parts)=>{
  const put=(role,geo,mat,x,yy,zz)=>{const m=c.tag(kit.mesh(f,geo,mats[mat],x,yy,zz),'changyin-north-'+role,{precision:'SIMPLIFIED_PHOTO_FORM_NOT_ORIGINAL_PAINT_OR_CARVING'});parts.push(m);return m;};
  const box=(role,mat,a,b,d,x,yy,zz)=>put(role,new THREE.BoxGeometry(a,b,d),mat,x,yy,zz);
  const rect=(role,mat,x,yy,zz,a,b,t=.035)=>{for(const s of[-1,1]){box(role,mat,t,b,.045,x+s*(a-t)/2,yy,zz);box(role,mat,a,t,.045,x,yy+s*(b-t)/2,zz);}};
  return{put,box,rect};
 };
 for(const [i,lo,hi]of[[0,-w/2,-1.4],[1,1.4,w/2]]){
  const parts=[],{box,rect}=build(parts),ww=hi-lo,x=(lo+hi)/2;
  box('rail-cap','red',ww,.11,.14,x,y+.99,z);
  box('rail-lower-bar','red',ww,.08,.12,x,y+.15,z);
  const cells=9;
  for(let j=0;j<=cells;j++){const xx=lo+.055+(ww-.11)*j/cells;box('rail-post','red',.11,1.06,.14,xx,y+.53,z);box('rail-post-neck','gold',.105,.055,.145,xx,y+.91,z);}
  for(let j=0;j<cells;j++){const cell=(ww-.11)/cells,xx=lo+.055+(j+.5)*cell;rect('rail-field','red',xx,y+.53,z-.018,cell-.11,.56,.035);const m=box('rail-diamond-fit','gold',.20,.20,.035,xx,y+.53,z-.05);m.rotation.z=Math.PI/4;for(const s of[-1,1])box('rail-field-link','red',.07,.25,.045,xx+s*.21,y+.53,z-.02);}
  register(parts,'changyin-front-rail-'+i,{changyinNorthRail:i});
  const ox=p.x+(i===0?w/2:-w/2),oz=p.z+p.localD/2;
  const owner=kit.colliders.find(q=>Math.abs((q.min.x+q.max.x)/2-ox)<1e-8&&Math.abs((q.min.z+q.max.z)/2-oz)<1e-8&&Math.abs(q.min.y-y)<1e-6&&Math.abs(q.max.y-(y+4.6))<1e-6);
  if(!owner)throw Error('Changyin original outer column scope owner missing');
  const region={minX:i===0?p.x+1.4:p.x-w/2-.6,maxX:i===0?p.x+w/2+.6:p.x-1.4,minZ:oz-1.5,maxZ:oz+1.5};
  owner.furnitureMotionScope={kind:'changyin-front-rails',id:'changyin-front-rail-'+i,groundY:0,minOffsetX:region.minX-owner.min.x,maxOffsetX:region.maxX-owner.min.x,minOffsetZ:region.minZ-owner.min.z,maxOffsetZ:region.maxZ-owner.min.z};
 }
 const heads=[],{put,box,rect}=build(heads),hy=y+4.42;
 for(let i=0;i<3;i++){const x=-w/2+(i+.5)*bw,ww=bw-.28;
  box('painted-field',i%2?'green':'blue',ww,.30,.16,x,hy,z-.40);rect('painted-border','gold',x,hy,z-.505,ww-.05,.26,.025);
  for(let j=0;j<5;j++)rect('painted-plain-panel','gold',x-ww/2+(j+.5)*ww/5,hy,z-.515,ww/5-.13,.19,.018);
  box('hanging-band','dark',ww,.10,.12,x,hy-.23,z-.14);
  for(let j=0;j<7;j++)rect('hanging-grid','red',x-ww/2+(j+.5)*ww/7,hy-.40,z-.205,ww/7-.08,.25,.026);
  for(const s of[-1,1])box('hanging-return','green',.12,.57,.12,x+s*(ww/2-.08),hy-.48,z-.14);
 }
 // Photo1493 is a column-head motif, not proof of a central-bay cartouche; omit unlocated artwork.
 register(heads,'changyin-north-header',{changyinNorthHeader:true});
 const data={object:'FC-82E7771BD4',source:p.source,photos:['2604','1492','1493'],accepted:false,scope:'GROUND_NORTH_STAGE_FRONT_TWO_RAIL_SPANS_THREE_HEADER_FIELDS',dimensions:'MODEL_FIT_NOT_SURVEY',centralGap:'RETAINED_2_8M_MODEL_ROUTE_NOT_PHOTO_VERIFIED_OPENING',pattern:'PLAIN_DIAMOND_FIELDS_AND_COLOR_BLOCKS_NOT_ORIGINAL_GHOST_FACE_SCROLL_OR_DRAGON_PAINT',currentInventoryVerified:false,newWalkables:0,newUpperDestinations:0,retained:['three roofs and aligned stage wells','diagonal support beams','physically guarded rear stairs','side rails and original central route','legacy unverified movable inventory'],missing:['photo1493 column-head motif omitted: bay location unverified','exact original carving painting and calligraphy','surveyed aperture counts and dimensions','photo-verified original central entrance arrangement','current display and upper access']};f.userData.changyinNorthFront=data;return data;
}
