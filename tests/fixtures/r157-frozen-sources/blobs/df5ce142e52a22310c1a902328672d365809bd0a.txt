import * as THREE from 'three';
import {mergeByMaterial} from '../../utils/MergeUtils.js';
import {qianqingCentralMaterial,qianqingCentralUV} from './QianqingCentralArt.js';
import {buildQianqingStairRails,qianqingRailRanges,registerQianqingStairRails} from './QianqingStairRails.js';
import {buildQianqingScreenCrest} from './QianqingScreenCrest.js';
export const QIANQING_CENTRAL=Object.freeze({id:'qianqing-five-panel-central-setting',dimensionStatus:'PHOTO_RELATIVE_TRIAL_WITH_RETAINED_PLAN_ENVELOPE_NOT_SURVEY',source:'https://img.dpm.org.cn/Uploads/Picture/dc/1523%5B1024%5D.jpg',daisHeight:.70,stepCount:5,stepRun:1.30,lodDistance:90,lodHysteresis:.1,plaque:{width:4.5,height:1.30,leftToRight:'明光大正'}});
export function qianqingCentralFrame({x0,y,H,ztb0,ztb1,thW,bayW}){
 const v=[x0,y,H,ztb0,ztb1,thW,bayW];if(!v.every(Number.isFinite)||Math.abs(x0)>1e-8||Math.abs(y-2.16)>1e-8||Math.abs(H-7.22)>1e-8||Math.abs(ztb0-317.8)>1e-8||Math.abs(ztb1-324.8)>1e-8||Math.abs(thW-8.177777777777779)>1e-8)throw Error('Unregistered Qianqing core frame');
 return {...structuredClone(QIANQING_CENTRAL),x0,y,H,ztb0,ztb1,thW,bayW,depth:ztb1-ztb0,tz:(ztb0+ztb1)/2+(ztb1-ztb0)*.1,bounds:{minX:x0-thW/2,maxX:x0+thW/2,minZ:ztb0-1.3,maxZ:ztb1}};
}
export function registerQianqingCentral(b,g,args){
 const f=qianqingCentralFrame(args),marker=new THREE.Group();marker.name=f.id;marker.userData.structure=f;g.add(marker);
 // R72 replaces the coarse whole-scene exclusion with actual local solids.
 // Permanent navigation remains independent of decorative LOD / GLB loading.
 const solid=(x0,z0,x1,z1,bottom,top,support=true,pad=0)=>{
  b.col(x0,bottom,z0,x1,top,z1);
  if(support)b.walkables.push({type:'box',rescue:pad>0,box:new THREE.Box3(
   new THREE.Vector3(x0-pad,bottom,z0-pad),new THREE.Vector3(x1+pad,top,z1+pad))});
 };
 const top=f.y+f.daisHeight;
 solid(-f.thW/2,f.ztb0,f.thW/2,f.ztb1,f.y,top,true,.5);
 const stepW=f.thW*.245,run=f.stepRun/f.stepCount;
 for(const x of[-f.thW/3,0,f.thW/3])for(let k=0;k<f.stepCount;k++){
  const z=f.ztb0-f.stepRun+k*run,h=f.y+f.daisHeight*(k+1)/f.stepCount;
  solid(x-stepW/2,z,x+stepW/2,z+run,f.y,h,true,.5);
 }
 // Chair, front table, articulated screen and architectural backing.
 solid(-.825,f.tz-.50,.825,f.tz+.70,top,top+.59);
 solid(-.86,f.tz+.59,.86,f.tz+.71,top+.54,top+1.81);
 for(const x of[-.79,.79])solid(x-.06,f.tz-.455,x+.06,f.tz+.595,top+.70,top+.975);
 solid(-1,f.tz-1.26,1,f.tz-.46,top,top+1.14);
 const xs=[-2.34,-1.26,0,1.26,2.34],ws=[1.04,1.12,1.4,1.12,1.04],hs=[2.55,2.95,3.3,2.95,2.55];
 for(let i=0;i<5;i++){const z=f.ztb1-.56-Math.abs(xs[i])*.045;solid(xs[i]-ws[i]/2-.02,z-.15,xs[i]+ws[i]/2+.02,z+.15,top,top+hs[i]);}
 const fw=Math.min(f.thW-.18,7.4);solid(-fw/2,f.ztb1-.24,fw/2,f.ztb1-.04,top,f.y+f.H-.23);
 return f;
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
 const add=(name,geo,x,y,z,cell=4,solid=true,frontOnly=false)=>{const m=new THREE.Mesh(qianqingCentralUV(geo,cell,{solid,frontOnly,backCell:cell===1?6:5,screenPanel:name.startsWith('qianqing-five-screen-panel-')}),mat);m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;root.add(m);return m;};
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
   const geo=buildQianqingScreenCrest(w),m=add('qianqing-open-carved-crest-'+i,geo,xs[i],dais+h-.04,screenZ-Math.abs(xs[i])*.045);m.rotation.y=panel.rotation.y;
   for(const sign of[-1,1])box('qianqing-screen-upright',.065,h+.09,.19,xs[i]+sign*(w/2-.03),dais+h/2,screenZ-Math.abs(xs[i])*.045-.015);
  }
 }
 // A separate red architectural backing lies behind the screen, not at the front steps.
 const backZ=rear-.15,frameW=Math.min(f.thW-.18,7.4),frameTop=f.H-.23;
 box('qianqing-red-rear-frame',frameW,frameTop-dais,.18,0,(frameTop+dais)/2,backZ,5);
 box('qianqing-high-gilt-frieze',6.0,1.14,.025,0,5.00,backZ-.105,2,true);
 for(const sign of[-1,1])box('qianqing-rear-frame-stile',.09,frameTop-dais,.22,sign*(frameW/2-.045),(frameTop+dais)/2,backZ);
 box('qianqing-zhengdaguangming-plaque',f.plaque.width,f.plaque.height,.13,0,6.29,backZ-.20,3,true);
 // The selected museum photograph shows a low covered front table partly
 // obscuring the chair. Its textile and proportions are display-photo fits.
 box('qianqing-throne-seat',1.65,.16,1.2,0,dais+.51,.10);
 const chairShape=shape(reliefOutline(1.72,1.27));
 if(fine)for(const sign of[-1,1]){const h=new THREE.Path();h.moveTo(sign*.46-.12,.70);h.lineTo(sign*.46+.12,.70);h.lineTo(sign*.46+.09,.91);h.lineTo(sign*.46-.09,.91);h.closePath();chairShape.holes.push(h);}
 const chairGeo=omitCollapsedCapFaces(new THREE.ExtrudeGeometry(chairShape,{depth:.12,bevelEnabled:false,curveSegments:1}));chairGeo.translate(0,0,-.06);
 add('qianqing-throne-articulated-back',chairGeo,0,dais+.54,.65,0,false,true);
 box('qianqing-front-table-top',2.00,.12,.80,0,dais+1.08,-.86,6);
 add('qianqing-front-table-cloth',new THREE.BoxGeometry(1.86,.83,.025),0,dais+.59,-1.28,7,false,true);
 for(const x of[-.72,.72])box('qianqing-front-table-leg',.11,.98,.12,x,dais+.49,-.87,6);
 if(fine){
  for(const x of[-.65,.65])for(const z of[-.40,.52])box('qianqing-throne-leg',.12,.43,.12,x,dais+.215,z);
  for(const x of[-.79,.79]){box('qianqing-throne-arm',.12,.13,1.05,x,dais+.91,.07);box('qianqing-throne-arm-upright',.12,.32,.12,x,dais+.70,-.40);}
  // Low rails flank, rather than cover, the three separate front stair flights.
  const innerGap=f.thW/3-stepW,outerGap=f.thW/2-(f.thW/3+stepW/2),outerX=f.thW/2-outerGap/2;
  const cheeks=[[-outerX,outerGap],[-f.thW/6,innerGap],[f.thW/6,innerGap],[outerX,outerGap]];
  for(const[x,width]of cheeks)for(let k=0;k<5;k++){const height=(k+1)*dais/5;box('qianqing-stair-cheek',width,height,.26,x,height/2,front-1.3+(k+.5)*.26,5);}
  for(const row of buildQianqingStairRails(mat,{front,thW:f.thW,stepW,dais}))root.add(row);
 }
 root.userData.qianqingCentral={id:f.id,fine,dimensionStatus:f.dimensionStatus,fivePanels:true,threeStairRuns:true,photoDateUnknown:true};return root;
}
export function installQianqingCentral(b,root){
 if(b.ox||b.oz||root.userData.qianqingCentral)throw Error('Qianqing installation must be world aligned and unique');const all=root.userData.architecture?.filter(x=>x.id===QIANQING_CENTRAL.id);if(all?.length!==1)throw Error('Missing unique Qianqing frame');const f=all[0],mat=qianqingCentralMaterial(b),lod=new THREE.LOD();lod.name='qianqing-central-setting-detail';lod.userData={displayRevision:'r32-photo-relative-main-scene',displaySummary:{frontTable:true,chairBack:'articulated-outline',screens:5,stairFlights:3},photoDateUnknown:true};lod.position.set(f.x0,f.y,f.tz);
 const nearRaw=buildQianqingCentralLevel(mat,f,true),railSource=qianqingRailRanges(nearRaw);
 lod.addLevel(mergeByMaterial(nearRaw,{name:'qianqing-central-near'}),0);lod.addLevel(mergeByMaterial(buildQianqingCentralLevel(mat,f,false),{name:'qianqing-central-far'}),f.lodDistance,f.lodHysteresis);
 lod.levels[1].object.visible=false;root.add(lod);registerQianqingStairRails(b,lod.levels[0].object,railSource);root.userData.qianqingCentral={...structuredClone(f),navigation:'R72_LOCAL_SOLIDS_STEPS_AND_SIDE_SEAT_APPROACH'};return lod;
}
