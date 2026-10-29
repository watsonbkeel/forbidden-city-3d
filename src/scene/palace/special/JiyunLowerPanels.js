import * as T from 'three';
import {createXiqingSurface} from '../../../controls/XiqingRoofSurface.js';
const SOURCE='https://www.dpm.org.cn/explore/building/236483.html',PHOTO='https://img.dpm.org.cn/Uploads/Picture/2024/06/18/s6670e8aa8f637.jpg';
/** The photograph's opaque low board row only. Upper rail openings stay open.
 * Counts/curves/depth are retained-model fits, not a measured paint pattern. */
export function buildJiyunLowerPanels({kit,f,g,p}){
 if(p.id!=='place-outer-west-e1a6e9852b'||p.key!=='jiyun'||g.w!==29.7||g.d!==12||g.upperY!==4.8||f.parent!==kit.root||f.position.x!==280.1||f.position.y||f.position.z!==116.7||f.rotation.x||f.rotation.y!==Math.PI/2||f.rotation.z||!f.scale.equals(new T.Vector3(1,1,1))||f.userData.jiyunLowerPanels||f.userData.jiyunRailFit?.closedPieces!==180||kit.colliders.filter(c=>c.furnitureMotionScope?.id==='jiyun-upper-front-rail').length!==1)throw Error('Jiyun lower panels require retained audited upper rail domain');
 const posts=f.children.filter(m=>m.userData.role==='jiyun-upper-front-rail-baluster').sort((a,b)=>a.position.x-b.position.x);if(posts.length!==47)throw Error('Jiyun retained post inventory changed');
 const mats={};for(const[name,color]of Object.entries({red:0x994a36,green:0x347b69,blue:0x315b9b,cream:0xe2d5ae})){mats[name]=new T.MeshStandardMaterial({name:'jiyun_lower_panel_'+name+'_photo_fit',color,roughness:.88});kit.owned.push(mats[name]);}
 const panels=[];
 for(let i=0;i<46;i++){
  const left=posts[i],right=posts[i+1],step=right.position.x-left.position.x,w=step-.03,x=(left.position.x+right.position.x)/2,z=-5.88,y=g.upperY,parts=[];
  if(Math.abs(step-29.4/46)>1e-12||left.position.y!==y+.46||right.position.y!==y+.46||left.position.z!==z||right.position.z!==z)throw Error('Jiyun original panel interval changed');
  const add=(role,geo,mat,xx,yy,zz)=>{const m=kit.mesh(f,geo,mats[mat],xx,yy,zz);m.name='jiyun-lower-panel-'+role;m.userData={role:m.name,jiyunLowerPanel:i,source:SOURCE,image:PHOTO,precision:'SIMPLIFIED_COLOR_AND_PAIRED_CURL_FIT_NOT_EXACT_PAINTING'};parts.push(m);return m;};
  const box=(role,mat,ww,hh,dd,xx,yy,zz)=>add(role,new T.BoxGeometry(ww,hh,dd),mat,xx,yy,zz);
  box('backing','red',w,.315,.06,x,y+.1775,z);
  box('field',i%2?'green':'blue',w-.08,.225,.008,x,y+.18,z-.032);
  for(const side of[-1,1]){box('outer-horizontal','red',w,.025,.018,x,y+.1775+side*.145,z-.031);box('outer-vertical','red',.025,.29,.018,x+side*(w/2-.0125),y+.1775,z-.031);box('inner-horizontal','cream',w-.075,.008,.008,x,y+.18+side*.108,z-.035);box('inner-vertical','cream',.008,.216,.008,x+side*(w/2-.0415),y+.18,z-.035);}
  for(const side of[-1,1]){
   const path=new T.Path();path.moveTo(-w*.12,.035);path.bezierCurveTo(-w*.22,.085,w*.12,.09,w*.11,.025);path.bezierCurveTo(w*.11,-.055,-w*.15,-.065,-w*.12,-.01);path.bezierCurveTo(-w*.10,.035,w*.015,.025,-w*.015,-.005);const points=path.getPoints(12),half=.0035,edge=(j,sign)=>{const tangent=points[Math.min(j+1,points.length-1)].clone().sub(points[Math.max(j-1,0)]).normalize();return points[j].clone().add(new T.Vector2(-tangent.y,tangent.x).multiplyScalar(half*sign));},shape=new T.Shape();const a=edge(0,1);shape.moveTo(side*a.x,a.y);for(let j=1;j<points.length;j++){const q=edge(j,1);shape.lineTo(side*q.x,q.y);}for(let j=points.length-1;j>=0;j--){const q=edge(j,-1);shape.lineTo(side*q.x,q.y);}shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth:.008,steps:1,bevelEnabled:false});geo.translate(0,0,-.004);add('paired-curl',geo,'cream',x+side*w*.22,y+.18,z-.035);
  }
  panels.push(parts);
 }
 kit.root.updateWorldMatrix(true,true);const inverse=kit.root.matrixWorld.clone().invert();let sourceFaces=0;
 for(const [panel,parts]of panels.entries()){
  const faces=[];for(const [mesh,m]of parts.entries()){const matrix=new T.Matrix4().multiplyMatrices(inverse,m.matrixWorld),a=m.geometry.attributes.position,ix=m.geometry.index;for(let j=0;j<(ix?.count??a.count);j+=3)faces.push({source:{mesh,triangle:j/3},vertices:[0,1,2].map(k=>{const v=new T.Vector3().fromBufferAttribute(a,ix?ix.getX(j+k):j+k).applyMatrix4(matrix);v.set(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));return v.applyMatrix4(kit.root.matrixWorld);})});}
  const surface=createXiqingSurface(faces,'jiyun-front-lower-panel-'+panel),owner=surface.box.clone();owner.xiqingRoofSurface=surface;owner.jiyunLowerPanel={panel,source:SOURCE};kit.colliders.push(owner);sourceFaces+=faces.length;
 }
 return f.userData.jiyunLowerPanels={source:SOURCE,image:PHOTO,photographyDate:null,panels:46,partsPerPanel:12,sourceFaces,upperAirOpeningRetained:true,acceptedWholeObject:false,visualStatus:'VERIFY_PENDING',precision:'MODEL_INTERVALS_AND_PAIRED_CURL_FIT_NOT_MEASURED_OR_EXACT_PATTERN',newWalkables:0,excluded:['exact paint pattern and weathering','rear/side paint not visible in source','end balcony rails','upper panel paint','new stair or navigation destination']};
}
