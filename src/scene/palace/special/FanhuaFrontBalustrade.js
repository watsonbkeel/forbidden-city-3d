import * as THREE from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const PHOTO='https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efeecf846027.jpg';
/** Only the front upper rail visible in the official photograph. Counts and
 * curves are fitted, not measured or exact restored decorative patterns. */
export function buildFanhuaFrontBalustrade(c){
 const {p,f,kit}=c;
 if(!f||f.position.x!==p.x||f.position.y!==0||f.position.z!==p.z||f.rotation.x!==0||f.rotation.y!==0||f.rotation.z!==0||f.scale.x!==1||f.scale.y!==1||f.scale.z!==1)throw Error('R139 Fanhua frame transform mismatch');
 if(p.key!=='fanhua'||p.id!=='place-ningshou-d40cef5893'||p.localW!==25.8||p.localD!==8.6||p.upperFloorY!==3.85||p.rot!==0||f.userData.r139FanhuaBalustrade)throw Error('R139 Fanhua front rail binding mismatch');
 const y=p.upperFloorY,z=-(p.localD-.2)/2,w=p.localW-.2,n=Math.ceil(w/.65),step=w/n;
 const pale=new THREE.MeshStandardMaterial({name:'r139-fanhua-pale-baluster-fit',color:0xbfc7a9,roughness:.65});kit.owned.push(pale);
 const tag=m=>{m.userData.r139FanhuaFront=true;return m;};
 const box=(role,mat,ww,hh,dd,x,yy,zz)=>{const m=tag(c.box(role,mat,ww,hh,dd,x,yy,zz,true));kit.colliders.at(-1).r139FanhuaFront=true;return m;};
 // Retain the old front envelope and upper handrail level; replace generic
 // thin sticks with the pictured lower framed panels and waisted upper forms.
 box('r139-front-red-handrail','red',w,.065,.08,0,y+.88,z);
 box('r139-front-red-lower-cap','red',w,.10,.08,0,y+.30,z);
 for(let i=0;i<n;i++){
  const x=-w/2+(i+.5)*step,ww=step-.09;
  box('r139-front-lower-panel','paper',ww,.18,.07,x,y+.115,z);
  for(const yy of [.035,.195])box('r139-front-lower-panel-frame','red',ww,.03,.085,x,y+yy,z);
  for(const sign of [-1,1])box('r139-front-lower-panel-frame','red',.035,.16,.085,x+sign*(ww-.035)/2,y+.115,z);
 }
 const shape=new THREE.Shape();shape.moveTo(-.085,0);shape.lineTo(.085,0);shape.quadraticCurveTo(.12,.05,.065,.12);shape.quadraticCurveTo(.04,.22,.045,.31);shape.bezierCurveTo(.08,.33,.17,.36,.17,.405);shape.quadraticCurveTo(.16,.455,.105,.45);shape.quadraticCurveTo(.04,.39,0,.46);shape.quadraticCurveTo(-.04,.39,-.105,.45);shape.quadraticCurveTo(-.16,.455,-.17,.405);shape.bezierCurveTo(-.17,.36,-.08,.33,-.045,.31);shape.quadraticCurveTo(-.04,.22,-.065,.12);shape.quadraticCurveTo(-.12,.05,-.085,0);shape.closePath();
 const geometry=new THREE.ExtrudeGeometry(shape,{depth:.08,steps:1,curveSegments:5,bevelEnabled:false});geometry.scale(1,.5/.46,1);geometry.translate(0,0,-.04);const template=createTriangleTemplate(geometry);
 for(let i=0;i<=n;i++){
  const x=-w/2+i*step;
  box('r139-front-panel-divider','red',.065,.30,.08,x,y+.15,z);
  if(i===0||i===n)continue; // end columns terminate the photographed rail
  const m=tag(c.tag(kit.mesh(f,geometry.clone(),pale,x,y+.35,z),'r139-front-waisted-petal-baluster'));
  const contact=triangleInstance(template,[p.x+x,y+.35,p.z+z],`r139-fanhua-front-baluster:${i}`),col=contact.box.clone();col.triangleSupport=contact;col.r139FanhuaFront=true;kit.colliders.push(col);
  m.userData.contact='SAME_CLOSED_RENDER_TRIANGLES';
 }
 geometry.dispose(); // templates retain triangle values; each render owner unloads once
 return f.userData.r139FanhuaBalustrade={originalObjectId:'FC-D40CEF5893',source:PHOTO,scope:'UPPER_FRONT_BALUSTRADE_ONLY',dimensionStatus:'PHOTO_RELATIONSHIP_MODEL_FIT_NOT_SURVEYED',ornament:'SIMPLIFIED_WAISTED_PETAL_PROFILE_NOT_EXACT_CARVING',lowerPanels:n,balusters:n-1,countStatus:'RETAINED_ENVELOPE_MODULE_FIT_NOT_PHOTO_COUNT',upperAccess:'VIEW_ONLY_UNVERIFIED_STAIR_NOT_ADDED',wholeObjectAccepted:false,remaining:['Floor-edge carved scroll frieze','Back and side balustrades independently unverified','Complete interior inventory and original decorative patterns']};
}
