import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
// Official1441/1443 support hanging/ceiling relations, not measured joinery or exact carving.
export function buildBiluoLowerCanopy(c,{r,y,h,angles}){
 const{kit,f,p}=c,mats={};for(const[k,color]of Object.entries({wood:0x74654d,relief:0x9b8c6d,field:0x625640})){mats[k]=new T.MeshStandardMaterial({name:'biluo_canopy_'+k+'_photo_fit',color,roughness:.93});kit.owned.push(mats[k]);}
 const put=(parts,role,geo,mat,x,yy,z,rotation=0)=>{const m=c.tag(kit.mesh(f,geo,mats[mat],x,yy,z),'biluo-canopy-'+role,{precision:'SIMPLIFIED_PLUM_FAMILY_NOT_ORIGINAL_RELIEF_OR_SURVEY'});m.rotation.y=rotation;parts.push(m);return m;};
 const flower=(size,depth)=>{const shape=new T.Shape();for(let i=0;i<40;i++){const a=i*Math.PI/20,rr=size*(1+.20*Math.cos(a*5)),x=rr*Math.cos(a),z=rr*Math.sin(a);if(i)shape.lineTo(x,z);else shape.moveTo(x,z);}shape.closePath();return new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false});};

 for(let i=0;i<5;i++){
  const parts=[],a=angles[i],b=angles[(i+1)%5],x0=Math.cos(a)*r,z0=Math.sin(a)*r,x1=Math.cos(b)*r,z1=Math.sin(b)*r,dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz),ux=dx/L,uz=dz/L,cx=(x0+x1)/2,cz=(z0+z1)/2,rot=-Math.atan2(uz,ux),ww=L-.18;
  const place=(role,geo,mat,x,yy,z=0)=>put(parts,role,geo,mat,cx+ux*x-uz*z,yy,cz+uz*x+ux*z,rot);
  const box=(role,w,hh,d,x,yy)=>place(role,new T.BoxGeometry(w,hh,d),'wood',x,yy);
  box('hanging-header',L,.14,.15,0,y+h-.28);
  box('hanging-lower-rim',ww-.18,.065,.11,0,y+h-.65);
  for(const s of[-1,1]){box('hanging-end-return',.095,.53,.13,s*(ww/2-.04),y+h-.48);box('hanging-step-return',.23,.065,.11,s*(ww/2-.15),y+h-.74);}
  const tube=(points)=>place('hanging-branch-fit',new T.TubeGeometry(new T.CatmullRomCurve3(points.map(([x,yy])=>new T.Vector3(x,yy,0))),12,.018,5,false),'relief',0,0,-.07);
  const main=tube([[-ww*.49,y+h-.58],[-ww*.2,y+h-.43],[0,y+h-.54],[ww*.22,y+h-.41],[ww*.49,y+h-.55]]);
  for(const s of[-1,0,1]){const x=s*ww*.27;place('hanging-plum-fit',flower(.068,.025),'relief',x,y+h-.44,-.09);const attach=main.geometry.parameters.path.getPoint((s+2)/4);tube([[attach.x,attach.y],[x-.05,y+h-.47],[x,y+h-.44]]);}
  register(c,parts,'biluo-lower-hanging-'+i);
 }
 const parts=[],cy=y+h-.12;
 const planar=(role,shape,mat,yy,depth=.035)=>{const geo=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false});geo.rotateX(Math.PI/2);return put(parts,role,geo,mat,0,yy,0);};
 const radius=(a,scale)=>r*scale*(1+.045*Math.cos(5*(a+Math.PI/2)));
 const outline=new T.Shape();for(let i=0;i<100;i++){const a=i*Math.PI/50,rr=radius(a,.99);if(i)outline.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);else outline.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);}outline.closePath();planar('ceiling-ground',outline,'wood',cy,.055);
 const stroke=(role,points,rad=.023)=>put(parts,role,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(([x,z])=>new T.Vector3(x,cy-.102,z))),Math.max(10,points.length*2),rad,5,false),'relief',0,0,0);
 for(let i=0;i<5;i++){
  const center=-Math.PI/2+i*2*Math.PI/5;
  for(const[lo,hi]of[[.22,.54],[.59,.91]]){const shape=new T.Shape(),outline=[];for(let j=0;j<=12;j++){const a=center-Math.PI/5+.045+j*(2*Math.PI/5-.09)/12,rr=radius(a,hi);outline.push([Math.cos(a)*rr,Math.sin(a)*rr]);}for(let j=12;j>=0;j--){const a=center-Math.PI/5+.045+j*(2*Math.PI/5-.09)/12,rr=radius(a,lo);outline.push([Math.cos(a)*rr,Math.sin(a)*rr]);}outline.forEach(([x,z],j)=>j?shape.lineTo(x,z):shape.moveTo(x,z));shape.closePath();planar('ceiling-sector',shape,'field',cy-.05,.035);stroke('ceiling-sector-rim',[...outline,outline[0]],.021);
   const mid=(lo+hi)/2;const branch=[];for(let j=0;j<5;j++){const a=center-.32+j*.16,rr=radius(a,mid+(j%2?.035:-.035));branch.push([Math.cos(a)*rr,Math.sin(a)*rr]);}stroke('ceiling-branch-fit',branch,.015);
   for(const delta of[-.22,.22]){const a=center+delta,rr=radius(a,mid),geo=flower(.065,.028);geo.rotateX(Math.PI/2);put(parts,'ceiling-plum-fit',geo,'relief',Math.cos(a)*rr,cy-.09,Math.sin(a)*rr);}
  }
 }
 const center=flower(.28,.045);center.rotateX(Math.PI/2);put(parts,'center-flower',center,'relief',0,cy-.075,0);
 register(c,parts,'biluo-lower-ceiling');
 const data={object:'FC-47EC73915D',source:p.source,photos:['1441','1443'],accepted:false,scope:'FIVE_PIERCED_LOWER_HANGINGS_AND_FIVE_PETAL_TWO_RING_CEILING',dimensions:'MODEL_FIT_NOT_SURVEY',patterns:'SIMPLIFIED_BRANCH_PLUM_GEOMETRY_NOT_ORIGINAL_FINE_CARVING',currentInventoryVerified:false,newWalkables:0,newUpperDestinations:0,contactRepair:'ORIGINAL_LEGACY_NAME_SIGN_GEOMETRY_UNCHANGED_ACTUAL_TRIANGLES_ADDED_AFTER_BASELINE_JUMP_FAILURE',retained:['five columns','both roofs and finial surfaces','stone rails and platform','original low east fitted route'],missing:['exact historic carving and painted patterns','measured dimensions and colorimetry','mountain terrain stone bridge and historic east west stairs']};f.userData.biluoLowerCanopy=data;return data;
}

function register(c,parts,id){const{f,kit}=c,all=[];f.traverse(m=>{if(m.isMesh)all.push(m)});const values=[],source=[];for(const m of parts){m.updateWorldMatrix(true,false);const a=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??a.count);i+=3){source.push({mesh:all.indexOf(m),triangle:i/3});for(let k=0;k<3;k++){const v=new T.Vector3().fromBufferAttribute(a,ix?ix.getX(i+k):i+k).applyMatrix4(m.matrixWorld);values.push(v.x,v.y,v.z);}}}const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float64Array(values),3));const template=createTriangleTemplate(g),owner=triangleInstance(template,[0,0,0],id),b=owner.box.clone();b.triangleSupport=owner;b.biluoCanopy={id,source};kit.colliders.push(b);g.dispose();}
export function registerBiluoRetainedSign(c){const parts=[];c.f.traverse(m=>{if(m.isMesh&&m.userData.role==='legacy-model-name-sign')parts.push(m)});if(parts.length)register(c,parts,'biluo-retained-name-sign');}
