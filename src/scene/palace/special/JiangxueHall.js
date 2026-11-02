import * as T from 'three';
import {CourtKit} from '../kit.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='jiangxue-source-fit',done=new WeakSet();
export function buildJiangxueHall(kit,zoneId){
 if(zoneId!=='garden')return false;
 if(kit?.root?.name!=='garden'||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(new T.Vector3(1,1,1))||done.has(kit)||['colliders','walkables','owned','rooms','mapItems'].some(k=>!Array.isArray(kit[k])||!Object.isExtensible(kit[k]))||!Object.isExtensible(kit.root.children))throw Error('Untransformed mutable west-six host, once only, required');
 const staged=new CourtKit(kit.lib,'garden');let f,meta;
 try{
  f=staged.frame(-60.1,445.2,-Math.PI/2);f.name=ID;
  const box=(role,mat,w,h,d,x,y,z)=>{const m=staged.box(f,mat,w,h,d,x,y,z);m.name='jiangxue-'+role;return m;};
  const stone=(role,w,h,d,x,y,z)=>{const m=box(role,'stone_slab',w,h,d,x,y,z);m.userData.jiangxueStone=true;return m;};
  stone('main-platform',14.8,.2,5.8,0,.1,0);stone('porch-platform',9.2,.2,3.2,0,.1,-4.1);stone('porch-step',3,.1,.4,0,.05,-5.9);
  box('rear-fit','wall_brick',14,3.1,.24,0,1.75,2.38);
  for(const x of[-6.88,6.88])box('side-fit','wall_brick',.24,3.1,4.76,x,1.75,0);
  box('closed-center','wood_column',2.8,2.85,.2,0,1.625,-2.4);
  for(const x of[-5.6,-2.8,2.8,5.6]){
   box('window-back', 'wood_column',2.8,2.85,.2,x,1.625,-2.4);
   box('lower-window-coarse','stone_slab',2.42,1.14,.04,x,1.34,-2.52);
   box('upper-window-coarse','wood_column',2.42,.9,.04,x,2.46,-2.52);
  }
  for(const x of[-4.2,-1.4,1.4,4.2]){const m=staged.mesh(f,new T.CylinderGeometry(.13,.15,2.95,10),kit.lib.material('stone_slab'),x,1.675,-5.3);m.name='jiangxue-porch-column';}
  box('porch-beam','wood_column',8.8,.25,.24,0,3.15,-5.3);
  staged.roof(f,{type:'gable',hardGableEnd:true,width:14,depth:5,baseY:3.5,height:1.5,overhang:.5,brackets:false});
  const ix=3.8,iz=1.05,ox=4.7,oz=2,cy=-4.1,low=3.3,shoulder=3.85,top=4.4,p=[],uv=[];
  const tri=(a,b,c)=>{p.push(...a,...b,...c);for(const v of[a,b,c])uv.push(v[0],v[2]);},q=(a,b,c,d,reverse=true)=>{if(reverse){tri(a,c,b);tri(a,d,c);}else{tri(a,b,c);tri(a,c,d);}},Y=z=>shoulder+(top-shoulder)*Math.cos(Math.PI*z/(2*iz));
  for(let i=0;i<16;i++){const za=-iz+2*iz*i/16,zb=-iz+2*iz*(i+1)/16;q([-ix,Y(za),cy+za],[ix,Y(za),cy+za],[ix,Y(zb),cy+zb],[-ix,Y(zb),cy+zb]);for(const x of[-ix,ix])q([x,shoulder,cy+za],[x,Y(za),cy+za],[x,Y(zb),cy+zb],[x,shoulder,cy+zb],x<0);}
  const inner=[[-ix,shoulder,cy-iz],[ix,shoulder,cy-iz],[ix,shoulder,cy+iz],[-ix,shoulder,cy+iz]],outer=[[-ox,low,cy-oz],[ox,low,cy-oz],[ox,low,cy+oz],[-ox,low,cy+oz]];for(let i=0;i<4;i++)q(inner[i],outer[i],outer[(i+1)%4],inner[(i+1)%4]);
  const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(p,3)).setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();const roof=staged.mesh(f,g,kit.lib.material('roof_tile'),0,0,0);roof.name='jiangxue-rolled-hipped-porch';
  f.updateWorldMatrix(true,true);let ownerIndex=0;
  // Separate closed wall/leaf/column owners. Roof meshes remain their actual
  // elevated surfaces; no low merged AABB across the open front porch.
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.jiangxueStone){const b=new T.Box3().setFromObject(m);b.jiangxueStone=m.name;staged.colliders.push(b);const top=b.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false});return;}
   const vertices=[],p=m.geometry.attributes.position,ix=m.geometry.index;
   for(let k=0;k<(ix?.count??p.count);k+=3){const vs=[0,1,2].map(j=>{const v=new T.Vector3().fromBufferAttribute(p,ix?.getX(k+j)??k+j).applyMatrix4(m.matrixWorld);return new T.Vector3(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));});if(new T.Triangle(...vs).getArea()>=1e-12)vertices.push(...vs.flatMap(v=>v.toArray()));}
   if(!vertices.length)return;const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],m.userData.jiangxueOwner=m.name+'/'+ownerIndex++),owner=shape.box.clone();owner.triangleSupport=shape;staged.colliders.push(owner);}finally{g.dispose();}
  });
  const b=new T.Box3().setFromObject(f);if(!new T.Box3(new T.Vector3(-63.5,-1e-6,437.7),new T.Vector3(-53.9,5.5,452.7)).containsBox(b))throw Error('Jiangxue actual envelope escaped approved reserve');
  meta={id:ID,name:'绛雪轩',sourceObjectId:'FC-E0E2F06A88',mainBays:5,porchBays:3,source:'https://www.dpm.org.cn/explore/building/236466.html',ownViewpoint:3330,ownGroup:107,wholeObjectAccepted:false,currentAdmissionVerified:false,gameDoorState:'CLOSED_EXTERIOR_ONLY',sourceSupported:['five-bay yellow hard-gable main, three-bay rolled-crest hipped-gable porch, facing west','own cover: pale porch columns, dark closed facade and coarse upper/lower window regions'],fit:['all coordinates, dimensions and compact low roof engineering fit; not surveyed','hidden sides/back and coarse window pattern; no exact wood/bamboo ornament claim'],excluded:['interior/furniture/plaque/flowerpots','modern public admission and GPU verification'],landscapeAdjustment:'Only exact sampled pine0 withheld, two approved procedural bed-top cuts; all 34 samples/other 33 trees unchanged'};f.userData.structure=meta;
 }catch(e){staged.dispose(staged.root);throw e;}
 kit.root.add(...[...staged.root.children]);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);done.add(kit);return{frame:f,meta};
}
