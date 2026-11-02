import {authorizeFengxianFrontContact} from './FengxianFrontContact.js';
import * as T from 'three';
import {CourtKit} from '../kit.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='fengxian-front-photo-side-flights',done=new WeakSet(),built=new WeakSet();
export const isBuiltFengxianFrontSteps=frame=>built.has(frame);
export const FENGXIAN_FRONT_PHOTO='https://img.dpm.org.cn/Uploads/Picture/2021/11/01/s617f4ed051855.jpg';
/** Two exterior side flights and coarse pale rails only. The old centre stair,
 * whole hall, vats, every original support and access policy remain untouched. */
export function finishFengxianFrontSteps(kit){
 if(kit?.root?.name!=='east-six')return false;
 const fs=kit.root.children.filter(f=>f.position.x===-182.3&&f.position.z===253.3&&f.userData?.r143FengxianVats);
 if(fs.length!==1||done.has(kit)||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(new T.Vector3(1,1,1))||['colliders','walkables','owned','rooms','mapItems'].some(k=>!Array.isArray(kit[k])||!Object.isExtensible(kit[k]))||!Object.isExtensible(kit.root.children))throw Error('Exact normally built Fengxian front host and mutable registration required');
 const host=fs[0],map=kit.mapItems.filter(q=>q.name==='奉先殿'&&q.kind==='hall');
 if(host.position.y!==0||host.rotation.toArray().slice(0,3).some(Boolean)||!host.scale.equals(new T.Vector3(1,1,1))||map.length!==1||map[0].x!==-182.3||map[0].z!==253.3||map[0].w!==55||map[0].d!==32.9||!host.children.some(m=>{if(!m.isMesh||m.material?.name!=='sumeru_band_material'||m.position.x!==0||m.position.y!==.6||m.position.z!==0)return false;m.geometry.computeBoundingBox();const s=m.geometry.boundingBox.getSize(new T.Vector3());return Math.abs(s.x-55)<1e-4&&Math.abs(s.y-1.2)<1e-4&&Math.abs(s.z-32.9)<1e-4}))throw Error('Fengxian existing dimensions/platform mismatch');
 const platformTop=kit.walkables.find(w=>w.type==='box'&&w.box.min.x===-209.8&&w.box.max.x===-154.8&&w.box.min.y===1.2&&Math.abs(w.box.min.z-236.85)<1e-8),platformBody=kit.colliders.find(c=>Math.abs(c.min.x+209.75)<1e-8&&Math.abs(c.max.x+154.85)<1e-8&&c.min.y===0&&c.max.y===1.2&&Math.abs(c.min.z-236.9)<1e-8),platformMesh=host.children.find(m=>m.isMesh&&m.material?.name==='sumeru_band_material'&&m.position.x===0&&m.position.y===.6&&m.position.z===0);if(!platformTop||!platformBody||!platformMesh)throw Error('Original platform source/top/body required');
 const staged=new CourtKit(kit.lib,'east-six'),frame=staged.frame(0,0),steps=[],railMeshes=[];frame.name=ID;
 try{
  const box=(name,w,h,d,x,y,z)=>{const m=staged.box(frame,'marble',w,h,d,x,y,z);m.name=ID+'/'+name;return m};
  // Shared Float32 boundaries define visible boxes and their exact registered
  // tops. No relaxation of global footprint/grounding tolerances.
  const edge=236.85,toe=edge-8*.52;
  for(const [side,x]of[['east',-197.3],['west',-167.3]])for(let i=0;i<8;i++){
   const lo=Math.fround(toe+i*.52),hi=Math.fround(i===7?edge+.10:toe+(i+1)*.52),y=Math.fround((i+1)*.15),x0=Math.fround(x-2.5),x1=Math.fround(x+2.5);
   const g=new T.BoxGeometry(1,1,1),p=g.attributes.position;for(let j=0;j<p.count;j++)p.setXYZ(j,p.getX(j)<0?x0:x1,p.getY(j)<0?0:y,p.getZ(j)<0?lo:hi);g.computeVertexNormals();const m=staged.mesh(frame,g,kit.lib.material('marble'),0,0,0);m.name=ID+'/'+side+'-step-'+i;steps.push(m);
   const b=new T.Box3().setFromBufferAttribute(p);b.fengxianStepId=m.name;staged.colliders.push(b);const top=b.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false,fengxianStepId:m.name});
  }
  const post=(x,z,y)=>{railMeshes.push(box('plain-rail-post',.32,1.12,.32,x,y+.56,z));railMeshes.push(box('plain-post-cap',.40,.12,.40,x,y+1.12,z));};
  // Four front fields leave the centre and the two new side stair mouths open.
  // Post count/spacing and all silhouettes are fitted, not dragon carving.
  for(const[a,b]of[[-27,-17.8],[-12.2,-3.0],[3.0,12.2],[17.8,27]]){
   const x0=-182.3+a,x1=-182.3+b,z=236.98,n=Math.ceil((x1-x0)/2.4);
   railMeshes.push(box('front-rail-lower-band',x1-x0,.24,.22,(x0+x1)/2,1.38,z));
   railMeshes.push(box('front-rail-top',x1-x0,.18,.24,(x0+x1)/2,2.15,z));
   for(let i=0;i<=n;i++)post(x0+(x1-x0)*i/n,z,1.2);
   for(let i=0;i<n;i++)railMeshes.push(box('front-rail-open-field-bar',.16,.55,.18,x0+(x1-x0)*(i+.5)/n,1.78,z));
  }
  // Side rails follow the visible steps, not a vertical bounding air wall.
  for(const x of[-197.3,-167.3])for(const sign of[-1,1]){
   const rx=x+sign*2.77,z0=toe+.15,z1=edge+.04,rise=1.2,length=Math.hypot(z1-z0,rise);
   for(const offset of[.25,.94]){const m=box('side-sloped-rail',.24,.18,length,rx,rise/2+offset,(z0+z1)/2);m.rotation.x=-Math.atan2(rise,z1-z0);railMeshes.push(m);}
   for(let i=0;i<4;i++){const u=i/3;post(rx,z0+(z1-z0)*u,rise*u);}
  }
  frame.updateWorldMatrix(true,true);let ownerIndex=0;
  for(const m of railMeshes){const a=m.geometry.attributes.position,ix=m.geometry.index,vertices=[];for(let k=0;k<(ix?.count??a.count);k+=3){const v=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(a,ix?ix.getX(k+j):k+j).applyMatrix4(m.matrixWorld));if(new T.Triangle(...v).getArea()>1e-12)vertices.push(...v.flatMap(p=>p.toArray()));}const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const t=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/rail-'+ownerIndex++),b=t.box.clone();b.triangleSupport=t;staged.colliders.push(b);}finally{g.dispose()}}
  const meta={id:ID,originalObjectId:'FC-D8AEF2E8A9',source:FENGXIAN_FRONT_PHOTO,wholeObjectAccepted:false,newFlights:2,stepsPerFlight:8,rise:.15,tread:.52,platformHeight:1.2,dimensionStatus:'COARSE_OWN_PHOTO_ENGINEERING_FIT_NOT_SURVEYED',photoSupported:['three separate frontal stair approaches','segmented pale platform rails','pale sloping stair side rails'],scope:'ONLY_TWO_OUTER_FLIGHTS_AND_SEGMENTED_FRONT_RAILS',originalCentreStair:'UNCHANGED_EXISTING_DESCENT_GAP_REMAINS_UNRESOLVED',unknown:['precise post/step counts and dimensions','fine dragon/phoenix carving','full 40x12m terrace reconstruction','unseen rear/side rails','photography date and modern public access'],blackBarriersAdded:false,newRooms:0,newMapItems:0,newContactExceptions:1};frame.userData.structure=meta;
  kit.root.add(frame);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);built.add(frame);authorizeFengxianFrontContact(kit,frame,host,[...staged.walkables,platformTop],[...staged.colliders.slice(0,16),platformBody],[...steps,platformMesh]);done.add(kit);return{frame,meta};
 }catch(e){staged.dispose(staged.root);throw e;}
}
