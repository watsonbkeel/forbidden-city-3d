import * as THREE from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createXiqingSurface} from '../../../controls/XiqingRoofSurface.js';
// Own Xunyan photograph: dark fields over grey sill walls, not Suichu's
// pale coverings. Tree-obscured ends, repeated joinery and all dimensions fitted.
export function buildXunyanSouthFront(c){
 const{p,box}=c,w=p.localW,bw=w/5,front=-p.localD/2+p.gallery,outer=-p.localD/2,h=p.colH-.42,y=p.ph;
 const dark=new THREE.MeshStandardMaterial({name:'xunyan_south_dark_window_fit',color:0x24312c,roughness:.88});c.kit.owned.push(dark);
 const rect=(role,mat,x,yy,z,ww,hh,t=.06)=>{for(const s of[-1,1]){box(role,mat,t,hh,.06,x+s*(ww-t)/2,yy,z);box(role,mat,ww,t,.06,x,yy+s*(hh-t)/2,z);}};
 for(let i=0;i<5;i++){
  const x=-w/2+(i+.5)*bw,pw=bw-.16;
  if(i===2){const dw=Math.min(pw-.14,3.2),dh=Math.min(3.2,h-.35);
   for(const s of[-1,1]){box('xunyan-south-door-jamb','red',.11,dh,.16,x+s*(dw/2+.06),y+dh/2,front,true);const fill=(pw-dw)/2-.03;if(fill>0)box('xunyan-south-door-filler','red',fill,h,.15,x+s*(dw/2+(pw-dw)/4),y+h/2,front,true);
    for(let j=0;j<2;j++){const xx=x+s*(dw/2+.17+j*.13),z=front+.32;box('xunyan-south-open-leaf','red',.08,dh,.60,xx,y+dh/2,z,true);const m=box('xunyan-south-leaf-field','green',.014,dh*.61,.46,xx-s*.05,y+dh*.65,z);m.material=dark;for(let k=1;k<5;k++)box('xunyan-south-leaf-grid','green',.018,.028,.45,xx-s*.065,y+dh*.36+k*dh*.56/5,z);}
   }
   box('xunyan-south-door-lintel','red',dw+.24,.18,.18,x,y+dh+.09,front,true);const th=h-dh-.18,m=box('xunyan-south-transom-field','green',dw,th,.14,x,y+dh+.18+th/2,front,true);m.material=dark;
   for(let j=0;j<4;j++)rect('xunyan-south-transom-grid','green',x-dw/2+(j+.5)*dw/4,y+dh+.18+th/2,front-.1,dw/4-.08,th-.14,.035);
  }else{
   const sill=.82,split=2.45,top=h-.18;box('xunyan-south-sill','brick',pw,sill,.20,x,y+sill/2,front,true);
   for(const s of[-1,1]){const xx=x+s*pw/4,ww=pw/2-.08;
    const lo=box('xunyan-south-lower-field','paper',ww,split-sill-.08,.055,xx,y+(sill+split)/2,front,true);lo.material=dark;rect('xunyan-south-window-frame','red',xx,y+(sill+split)/2,front-.065,ww+.03,split-sill);
    for(let k=0;k<3;k++)rect('xunyan-south-lower-grid','red',xx-ww/2+(k+.5)*ww/3,y+(sill+split)/2,front-.12,ww/3-.075,split-sill-.20,.028);
    const hi=box('xunyan-south-upper-field','green',ww,top-split-.08,.055,xx,y+(split+top)/2,front,true);hi.material=dark;rect('xunyan-south-window-frame','red',xx,y+(split+top)/2,front-.065,ww+.03,top-split);
    for(let k=0;k<3;k++){const gx=xx-ww/2+(k+.5)*ww/3;rect('xunyan-south-plain-grid','red',gx,y+(split+top)/2,front-.115,ww/3-.07,top-split-.25,.028);for(const t of[-1,1])box('xunyan-south-grid-cross','red',ww/3-.08,.026,.045,gx,y+(split+top)/2+t*(top-split)*.23,front-.12);}
   }
  }
 }
 // Low front railing leaves a generous central gap clear of the existing
 // fitted central five-tread flight. It does not certify a full lateral gallery.
 const gap=3.9,rz=outer+.08;
 for(const s of[-1,1]){const a=s<0?-w/2:gap/2,b=s<0?-gap/2:w/2,ww=b-a,x=(a+b)/2;
  for(const hh of[.12,.58])box('xunyan-south-low-rail','red',ww,.085,.12,x,y+hh,rz,true);
  const n=6;for(let j=0;j<=n;j++)box('xunyan-south-rail-post','red',.08,.63,.12,a+j*ww/n,y+.315,rz,true);
  for(let j=0;j<n;j++)rect('xunyan-south-rail-grid','green',a+(j+.5)*ww/n,y+.35,rz-.055,ww/n-.15,.32,.035);
 }
 for(let i=0;i<5;i++){const x=-w/2+(i+.5)*bw,ww=bw-.35,yy=y+p.colH-.68;box('xunyan-south-hanging-band','green',ww,.10,.08,x,yy,outer-.01);for(let j=0;j<5;j++)rect('xunyan-south-hanging-grid','blue',x-ww/2+(j+.5)*ww/5,yy-.18,outer-.05,ww/5-.05,.28,.027);for(const s of[-1,1])box('xunyan-south-hanging-return','green',.075,.42,.08,x+s*(ww/2-.05),yy-.24,outer-.01);}
 buildXunyanSteps(c);
 const data={object:'FC-9A08E177BC',source:'https://www.dpm.org.cn/explore/building/236546.html',accepted:false,scope:'FIVE_BAY_SOUTH_JOINERY_FRONT_GALLERY_AND_CENTRAL_LOW_STAIR',dimensions:'MODEL_FIT_NOT_SURVEY',windowField:'DARK_PHOTO_FIELD_MATERIAL_UNVERIFIED',doorPose:'FOUR_FOLDED_OPEN_LEAVES_MODEL_FIT_COUNT_UNVERIFIED',galleryAccess:'CENTRAL_THROUGH_ROUTE_TESTED_LATERAL_GALLERY_NOT_CERTIFIED',newGroundRamps:0,newUpperDestinations:0,stair:{count:5,countStatus:'FITTED_SUBDIVISIONS_NOT_MEASURED_ORIGINAL',realTops:true},retained:['roof, side/rear and through-hall','original door width and navigation'],missing:['original step lattice and exact paint','tree-obscured end details','exact leaf count and dimensions','current2025 room exhibition mapping','unseen wing gallery junctions','photo foreground vat exact placement']};c.f.userData.xunyanSouthFront=data;return data;
}
function buildXunyanSteps(c){
 const{kit,p,f}=c,edge=-(p.localD/2+Math.min(c.item.pad??.5,.8)),run=1.35,width=3.6,n=5,mat=kit.lib.material('marble'),tile=kit.lib.tileSize('marble');
 for(let i=0;i<n;i++){
  const top=Math.fround(p.ph*(i+1)/n),depth=run/n,g=new THREE.BoxGeometry(width,1,depth),a=g.attributes.position;
  for(let j=0;j<a.count;j++)a.setY(j,a.getY(j)>0?top:0);
  const m=c.tag(kit.mesh(f,applyBoxUV(g,tile),mat,0,0,edge-run+(i+.5)*depth),'xunyan-south-tread');m.updateWorldMatrix(true,false);const b=new THREE.Box3().setFromObject(m,true);b.xunyanSouthStep=true;kit.colliders.push(b);
  kit.walkBox(f,b.min.x-p.x,b.min.z-p.z,b.max.x-p.x,b.max.z-p.z,b.max.y);Object.assign(kit.walkables.at(-1),{xunyanSouthStep:true,rescue:false});
 }
 for(const sign of[-1,1]){
  const g=new THREE.BoxGeometry(.22,1,run),a=g.attributes.position;
  for(let j=0;j<a.count;j++){const t=(a.getZ(j)+run/2)/run;a.setY(j,a.getY(j)>0?Math.fround(.08+p.ph*t):0);}g.computeVertexNormals();
  const m=c.tag(kit.mesh(f,applyBoxUV(g,tile),mat,sign*(width/2+.11),0,edge-run/2),'xunyan-south-cheek');m.updateWorldMatrix(true,false);const ix=g.index,faces=[];
  for(let i=0;i<ix.count;i+=3)faces.push({source:{mesh:f.children.indexOf(m),triangle:i/3},vertices:[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(a,ix.getX(i+k)).applyMatrix4(m.matrixWorld))});
  const shape=createXiqingSurface(faces,'xunyan-south-cheek-'+(sign<0?'east':'west')),b=shape.box.clone();b.xiqingRoofSurface=shape;b.xunyanSouthStep=true;kit.colliders.push(b);
 }
}
