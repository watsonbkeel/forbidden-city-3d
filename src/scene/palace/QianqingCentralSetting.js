import * as THREE from 'three';
import {mergeByMaterial} from '../../utils/MergeUtils.js';
import {qianqingCentralMaterial,qianqingCentralUV} from './QianqingCentralArt.js';
export const QIANQING_CENTRAL=Object.freeze({id:'qianqing-five-panel-central-setting',dimensionStatus:'PHOTO_RELATIVE_TRIAL_WITH_RETAINED_PLAN_ENVELOPE_NOT_SURVEY',source:'https://img.dpm.org.cn/Uploads/Picture/dc/1523%5B1024%5D.jpg',daisHeight:.70,stepCount:5,stepRun:1.30,lodDistance:90,lodHysteresis:.1,plaque:{width:3.8,height:1.25,leftToRight:'明光大正'}});
export function qianqingCentralFrame({x0,y,H,ztb0,ztb1,thW,bayW}){
 const v=[x0,y,H,ztb0,ztb1,thW,bayW];if(!v.every(Number.isFinite)||Math.abs(x0)>1e-8||Math.abs(y-2.16)>1e-8||Math.abs(H-7.22)>1e-8||Math.abs(ztb0-317.8)>1e-8||Math.abs(ztb1-324.8)>1e-8||Math.abs(thW-8.177777777777779)>1e-8)throw Error('Unregistered Qianqing core frame');
 return {...structuredClone(QIANQING_CENTRAL),x0,y,H,ztb0,ztb1,thW,bayW,depth:ztb1-ztb0,tz:(ztb0+ztb1)/2+(ztb1-ztb0)*.1,bounds:{minX:x0-thW/2,maxX:x0+thW/2,minZ:ztb0-1.3,maxZ:ztb1}};
}
export function registerQianqingCentral(b,g,args){
 const f=qianqingCentralFrame(args),marker=new THREE.Group();marker.name=f.id;marker.userData.structure=f;g.add(marker);
 // Retain the entire inherited exclusion, including its height and order.
 // The photographed steps are a visual display detail, not a new public route.
 b.col(f.bounds.minX,f.y,f.bounds.minZ,f.bounds.maxX,f.y+3,f.bounds.maxZ);return f;
}
function shape(points){const s=new THREE.Shape();points.forEach(([x,y],i)=>s[i?'lineTo':'moveTo'](x,y));s.closePath();return s;}
function reliefOutline(w,h){return [[-w/2,0],[w/2,0],[w/2,h*.52],[w*.37,h*.7],[w*.27,h*.64],[w*.18,h*.87],[0,h],[-w*.18,h*.87],[-w*.27,h*.64],[-w*.37,h*.7],[-w/2,h*.52]];}
// Aligned perforations can make Earcut emit collinear cap bridges. Keep every
// nonzero face and its existing attributes; zero-area faces have no surface.
function omitCollapsedCapFaces(g){
 if(g.index)throw Error('Qianqing extruded caps must be non-indexed');const p=g.attributes.position,keep=[],a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
 for(let i=0;i<p.count;i+=3){a.fromBufferAttribute(p,i);b.fromBufferAttribute(p,i+1);c.fromBufferAttribute(p,i+2);if(b.sub(a).cross(c.sub(a)).lengthSq()>1e-14)keep.push(i,i+1,i+2);}
 if(keep.length===p.count)return g;for(const[name,attribute]of Object.entries(g.attributes)){const out=new attribute.array.constructor(keep.length*attribute.itemSize);keep.forEach((id,i)=>out.set(attribute.array.subarray(id*attribute.itemSize,(id+1)*attribute.itemSize),i*attribute.itemSize));g.setAttribute(name,new THREE.BufferAttribute(out,attribute.itemSize,attribute.normalized));}g.clearGroups();return g;
}
export function buildQianqingCentralLevel(mat,f,fine){
 if(typeof fine!=='boolean'||f.id!==QIANQING_CENTRAL.id)throw Error('Explicit registered Qianqing level required');const root=new THREE.Group();root.name=fine?'qianqing-central-near':'qianqing-central-far';const floor=0,front=f.ztb0-f.tz,rear=f.ztb1-f.tz,dais=.7;
 const add=(name,geo,x,y,z,cell=4,solid=true,frontOnly=false)=>{const m=new THREE.Mesh(qianqingCentralUV(geo,cell,{solid,frontOnly,backCell:cell===1?6:5}),mat);m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;root.add(m);return m;};
 const box=(name,w,h,d,x,y,z,cell=4,frontOnly=false)=>add(name,new THREE.BoxGeometry(w,h,d),x,y,z,cell,cell>=4,frontOnly);
 // A low, broad single platform replaces the unsupported second rectangular tier.
 box('qianqing-low-dais',f.thW,dais,f.depth,0,dais/2,(front+rear)/2,5);
 if(fine)box('qianqing-dais-gilt-upper-lip',f.thW,.045,f.depth,0,dais-.0225,(front+rear)/2);
 const stepW=f.thW*.245,centres=[-f.thW/3,0,f.thW/3];
 for(let flight=0;flight<3;flight++){
  if(fine)for(let k=0;k<QIANQING_CENTRAL.stepCount;k++){const rise=dais/QIANQING_CENTRAL.stepCount*(k+1),run=QIANQING_CENTRAL.stepRun/QIANQING_CENTRAL.stepCount;box('qianqing-three-stairs-'+flight+'-'+k,stepW,rise,run,centres[flight],rise/2,front-QIANQING_CENTRAL.stepRun+(k+.5)*run,1,true);}
  else box('qianqing-three-stairs-coarse-'+flight,stepW,dais,.90,centres[flight],dais/2,front-.45,1,true);
 }
 // Five independently articulated panels. Exact folds and carving are not measured.
 const panelWidths=[1.04,1.12,1.40,1.12,1.04],panelHeights=[2.55,2.95,3.3,2.95,2.55],xs=[-2.34,-1.26,0,1.26,2.34];
 const screenZ=rear-.56;
 for(let i=0;i<5;i++){
  const w=panelWidths[i],h=panelHeights[i],panel=box('qianqing-five-screen-panel-'+i,w,h,.15,xs[i],dais+h/2,screenZ-Math.abs(xs[i])*.045,0,true);panel.rotation.y=Math.sign(xs[i])*.12;
  if(fine){
   const crest=shape(reliefOutline(w*1.08,.43));for(const sign of[-1,1]){const hole=new THREE.Path();for(let k=0;k<6;k++){const a=k/6*Math.PI*2,x=sign*w*.22+Math.cos(a)*w*.105,y=.17+Math.sin(a)*.065;hole[k?'lineTo':'moveTo'](x,y);}hole.closePath();crest.holes.push(hole);}
   const geo=omitCollapsedCapFaces(new THREE.ExtrudeGeometry(crest,{depth:.09,bevelEnabled:false,curveSegments:1}));geo.translate(0,0,-.045);const m=add('qianqing-open-carved-crest-'+i,geo,xs[i],dais+h-.04,screenZ-Math.abs(xs[i])*.045);m.rotation.y=panel.rotation.y;
   for(const sign of[-1,1])box('qianqing-screen-upright',.065,h+.09,.19,xs[i]+sign*(w/2-.03),dais+h/2,screenZ-Math.abs(xs[i])*.045-.015);
  }
 }
 // A separate red architectural backing lies behind the screen, not at the front steps.
 const backZ=rear-.15,frameW=Math.min(f.thW-.18,7.4),frameTop=f.H-.23;
 box('qianqing-red-rear-frame',frameW,frameTop-dais,.18,0,(frameTop+dais)/2,backZ,5);
 box('qianqing-high-gilt-frieze',frameW-.24,.85,.025,0,4.86,backZ-.105,2,true);
 for(const sign of[-1,1])box('qianqing-rear-frame-stile',.09,frameTop-dais,.22,sign*(frameW/2-.045),(frameTop+dais)/2,backZ);
 box('qianqing-zhengdaguangming-plaque',f.plaque.width,f.plaque.height,.13,0,6.08,backZ-.20,3,true);
 // Conservative seat structure; the reference partly obscures the chair.
 box('qianqing-throne-seat',1.8,.22,1.3,0,dais+.51,0);
 box('qianqing-throne-back',1.9,1.35,.16,0,dais+1.15,.58);
 if(fine){
  for(const x of[-.70,.70])for(const z of[-.46,.46])box('qianqing-throne-leg',.14,.40,.14,x,dais+.20,z);
  for(const x of[-.84,.84]){box('qianqing-throne-arm',.14,.15,1.12,x,dais+.93,.02);box('qianqing-throne-arm-upright',.14,.37,.14,x,dais+.72,-.46);}
  const crest=new THREE.ExtrudeGeometry(shape(reliefOutline(1.9,.35)),{depth:.12,bevelEnabled:false,curveSegments:1});crest.translate(0,0,-.06);add('qianqing-chair-crest-approximate',crest,0,dais+1.80,.58);
  // Low rails flank, rather than cover, the three separate front stair flights.
  const innerGap=f.thW/3-stepW,outerGap=f.thW/2-(f.thW/3+stepW/2),outerX=f.thW/2-outerGap/2;
  const cheeks=[[-outerX,outerGap],[-f.thW/6,innerGap],[f.thW/6,innerGap],[outerX,outerGap]];
  for(const[x,width]of cheeks)for(let k=0;k<5;k++){const height=(k+1)*dais/5;box('qianqing-stair-cheek',width,height,.26,x,height/2,front-1.3+(k+.5)*.26,5);}
  const posts=cheeks.map(c=>c[0]);
  for(const x of posts){const railPoints=[];for(const z of[front-.98,front-.28,front+.7]){const k=Math.min(5,Math.max(1,Math.floor((z-front+1.3)/.26)+1)),base=k*dais/5;box('qianqing-stair-rail-post',.075,.70,.075,x,base+.35,z);add('qianqing-stair-rail-finial',new THREE.SphereGeometry(.085,6,4),x,base+.74,z);railPoints.push(new THREE.Vector3(x,base+.65,z));}
   for(let i=0;i<railPoints.length-1;i++){const a=railPoints[i],c=railPoints[i+1],v=c.clone().sub(a),mid=a.clone().add(c).multiplyScalar(.5),m=box('qianqing-stair-rail',.07,.075,v.length(),...mid.toArray(),5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),v.normalize());}
  }
 }
 root.userData.qianqingCentral={id:f.id,fine,dimensionStatus:f.dimensionStatus,fivePanels:true,threeStairRuns:true,photoDateUnknown:true};return root;
}
export function installQianqingCentral(b,root){
 if(b.ox||b.oz||root.userData.qianqingCentral)throw Error('Qianqing installation must be world aligned and unique');const all=root.userData.architecture?.filter(x=>x.id===QIANQING_CENTRAL.id);if(all?.length!==1)throw Error('Missing unique Qianqing frame');const f=all[0],mat=qianqingCentralMaterial(b),lod=new THREE.LOD();lod.name='qianqing-central-setting-detail';lod.position.set(f.x0,f.y,f.tz);
 for(const fine of[true,false])lod.addLevel(mergeByMaterial(buildQianqingCentralLevel(mat,f,fine),{name:fine?'qianqing-central-near':'qianqing-central-far'}),fine?0:f.lodDistance,fine?0:f.lodHysteresis);
 lod.levels[1].object.visible=false;root.add(lod);root.userData.qianqingCentral={...structuredClone(f),navigation:'INHERITED_EXCLUSION_IDENTICAL_NO_NEW_STEP_ROUTE'};return lod;
}
