import {ciningGatePaint} from './CiningGatePaint.js';
import {CINING_GATE_REGION,validateCiningGateScope} from '../../../controls/CiningGateSupport.js';
import * as T from 'three';
import {createXiqingSurface} from '../../../controls/XiqingRoofSurface.js';
const SOURCE='https://www.dpm.org.cn/explore/building/236527.html',PHOTO='https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d43cd533c5.jpg';
export function ciningGateGeometry(item,zoneId='outer-west'){
 if(zoneId!=='outer-west'||item.kind!=='gate'||item.name!=='慈宁门'||item.x!==222.2||item.z!==155.7||item.w!==25.3||item.style!=='hall'||item.gateKind!=='five-bay'||item.gateProfile!=='cining-entry'||item.rot!=='south'||item.open!==true||['h','t','roof','layers','eaveCount'].some(k=>item[k]!==undefined))throw Error('Cining gate requires its exact original five-bay entrance identity');
 return{profile:'cining-entry',id:'outer-west/cining-entry',source:SOURCE,photo:PHOTO,photographyDate:null,x:222.2,z:155.7,width:25.3,depth:7.59,platformY:.45,portalCenters:[-25.3/5,0,25.3/5],clearWidth:25.3/5-1,rearInnerLine:1.265,retainedOriginalColumns:18,acceptedWholeObject:false,visualStatus:'VERIFY_PENDING',precision:'SOURCE_RELATIONSHIP_MODEL_FIT_NOT_SURVEY',openState:'MODEL_OPEN_NOT_PHOTOGRAPHED_CLOSED_STATE_OR_VISITOR_PERMISSION',unknown:['eight-shaped screen walls and corner-wing connection not yet safely resolved','rear high causeway not extended','exact dragon-phoenix carving and auspicious beasts','Manchu Mongolian seal-script inscription not reproduced','original .46 visible paving versus .45 walk datum retained','original roof and column collision not fully source-audited']};
}
export function buildCiningGate(kit,item,zoneId){
 const g=ciningGateGeometry(item,zoneId),start=kit.colliders.length,walkStart=kit.walkables.length;
 const width=kit.gate({x:g.x,z:g.z,w:g.width,style:'hall',gateKind:'five-bay',name:item.name}),f=kit.root.children.at(-1),old=[...f.children],oldBoxes=kit.colliders.slice(start);
 if(width!==25.3||old.length!==53||oldBoxes.length!==26||kit.walkables.length-walkStart!==1||old.slice(2,20).some(m=>m.geometry?.type!=='CylinderGeometry')||old[50].type!=='Group'||old[0].material!==kit.lib.material('sumeru_band')||old[1].material!==kit.lib.material('stone_slab'))throw Error('Cining retained original gate source changed');
 // Validate every removable source before the first disposal; positional array
 // indices are not permission to discard an arbitrary same-sized child list.
 const B=25.3/5,Depth=7.59,ColH=6.6;
 function expectOld(i,mat,w,h,d,x,y,z,door=false){const m=old[i],expected=new T.BoxGeometry(w,h,d);if(door)expected.translate(0,h/2,0);expected.computeBoundingBox();m.geometry?.computeBoundingBox();const valid=m.isMesh&&m.children.length===0&&m.material===kit.lib.material(mat)&&m.position.equals(new T.Vector3(x,y,z))&&m.scale.equals(new T.Vector3(1,1,1))&&m.rotation.x===0&&m.rotation.z===0&&m.rotation.y===(door?Math.PI/2:0)&&m.geometry.boundingBox.equals(expected.boundingBox);expected.dispose();if(!valid)throw Error('Cining original gate source component changed before pruning');}
 for(const [i,x]of[-1.5*B,-.5*B,.5*B,1.5*B].entries()){expectOld(20+2*i,'wall_red',1,ColH,Depth-.8,x,.45+ColH/2,0);expectOld(21+2*i,'wall_brick',1.1,1,Depth-.7,x,.95,0);}
 for(const [i,side]of[-1,1].entries()){expectOld(28+3*i,'wall_red',B-1,ColH,.6,side*2*B,.45+ColH/2,0);expectOld(29+3*i,'wall_brick',B-.95,1,.7,side*2*B,.95,0);}
 for(const [i,x]of[-B,0,B].entries()){const clear=B-1,leaf=Math.min(clear/2-.05,Depth/2-.6);expectOld(34+4*i,'wall_red',clear,ColH-4.8,.6,x,.45+4.8+(ColH-4.8)/2,0);expectOld(35+4*i,'wood_column',clear,.2,.4,x,.55,0);for(const [j,side]of[-1,1].entries())expectOld(36+4*i+j,'door_studded',leaf,4.8,.25,x+side*(clear/2-.14),.45,.3+leaf/2,true);}
 // Retain foundation/paving, all 18 original columns, both gables, beams/roof.
 // Remove all four fictitious tunnel piers, both middle end-bay walls and the
 // complete old middle door line together, not an added second door line.
 const removed=new Set([...Array.from({length:10},(_,i)=>20+i),31,32,...Array.from({length:12},(_,i)=>34+i)]);
 const liveGeometries=new Set();old.forEach((o,i)=>{if(!removed.has(i))o.traverse(m=>{if(m.geometry)liveGeometries.add(m.geometry)})});const retired=new Set();for(const i of removed){old[i].traverse(m=>{if(m.geometry&&!liveGeometries.has(m.geometry))retired.add(m.geometry)});f.remove(old[i]);}for(const geo of retired)geo.dispose();
 kit.colliders.splice(start+18,8,oldBoxes[23],oldBoxes[25]);
 const tag=(m,role)=>{m.name=role;m.userData={...m.userData,role,ciningGate:true,source:SOURCE,photo:PHOTO,precision:g.precision};return m;};
 const boxes=[],curved=[],paint=ciningGatePaint(kit);
 const block=(role,mat,w,h,d,x,y,z)=>{const m=tag(kit.mesh(f,new T.BoxGeometry(w,h,d),typeof mat==='string'?kit.lib.material(mat):mat,x,y,z),role);boxes.push(m);return m;};
 const b=g.width/5,D=g.depth,H=6.6,y=g.platformY,rear=g.rearInnerLine,front=-D/2;
 // Source gives rear-inner-post door relationship, not these fitted coordinates.
 for(let k=0;k<=5;k++){const m=tag(kit.mesh(f,new T.CylinderGeometry(.26,.273,H,12),kit.lib.material('wood_column'),-g.width/2+k*b,y+H/2,rear),'cining-gate-rear-inner-column');curved.push(m);}
 for(const side of[-1,1]){
  const x=side*2*b;
  block('cining-gate-rear-end-wall','wall_red',b-.52,H,.50,x,y+H/2,rear);
  block('cining-gate-window-sill','stone_slab',b-.52,.9,.30,x,y+.45,front);
  const leafW=(b-.64)/4,leafH=3.42;
  for(let k=0;k<4;k++)paint.window(block('cining-gate-window-leaf',paint.body.red,leafW-.025,leafH,.16,x-(b-.64)/2+(k+.5)*leafW,y+.9+leafH/2,front));
  paint.beam(block('cining-gate-window-transom',paint.body.green,b-.52,.6,.24,x,y+4.70,front),3);
  block('cining-gate-window-lintel','wood_column',b-.52,.16,.28,x,y+4.32+.08,front);
 }
 for(let i=0;i<5;i++)paint.beam(block('cining-gate-front-painted-beam',paint.body.green,b-.52,.68,.30,-g.width/2+(i+.5)*b,y+5.65,front),3);
 paint.beam(tag(old[46],'cining-gate-retained-front-beam'),10);boxes.push(old[46]);
 // The original visible plinth had only a walkable, no riser body. Register
 // that unchanged closed source so kinematic callers can step onto it too.
 tag(old[0],'cining-gate-retained-foundation');boxes.push(old[0]);
 for(const x of g.portalCenters){
  block('cining-gate-rear-door-head','wall_red',g.clearWidth,H-4.8,.60,x,y+4.8+(H-4.8)/2,rear);
  // Low horizontal threshold is deliberately flush with the retained datum.
  for(const side of[-1,1])block('cining-gate-rear-door-leaf',paint.body.red,.25,4.8,g.clearWidth/2-.05,x+side*(g.clearWidth/2+.175),y+2.4,rear+(g.clearWidth/2-.05)/2);
 }
 // Move the original Chinese identification plaque with the door header;
 // it is not a reproduction of the source multilingual seal-script board.
 for(const m of old.slice(51,53)){m.position.z+=rear;tag(m,'cining-gate-retained-identification');curved.push(m);}
 // Source three front flights. Heights and count are retained-datum fits.
 const edge=-(D+1.6)/2;
 for(const x of g.portalCenters)for(let i=0;i<2;i++){const h=(i+1)*.15,m=block('cining-gate-front-step','stone_slab',3.6,h,.32,x,h/2,edge-.64+(i+.5)*.32);m.userData.walkable=true;m.userData.stepTier=i;const p=m.geometry.attributes.position;for(let j=0;j<p.count;j++)p.setY(j,Math.max(0,Math.min(h,p.getY(j)+h/2)));m.position.y=0;}
 // Interrupted frontal railing, never a solid broad box over the three flights.
 const gaps=g.portalCenters.map(x=>[x-1.9,x+1.9]),segments=[[-(g.width+1.6)/2,gaps[0][0]],[gaps[0][1],gaps[1][0]],[gaps[1][1],gaps[2][0]],[gaps[2][1],(g.width+1.6)/2]];
 for(const [lo,hi]of segments){const n=Math.max(1,Math.ceil((hi-lo)/1.4));for(let i=0;i<=n;i++)block('cining-gate-front-rail-post','stone_slab',.16,1.05,.16,lo+(hi-lo)*i/n,y+.525,edge+.15);for(let i=0;i<n;i++){const x=lo+(hi-lo)*(i+.5)/n,w=(hi-lo)/n-.16;block('cining-gate-front-rail-panel','stone_slab',w,.50,.10,x,y+.32,edge+.15);block('cining-gate-front-rail-top','stone_slab',w,.12,.14,x,y+.80,edge+.15);}}
 kit.root.updateWorldMatrix(true,true);const inverse=kit.root.matrixWorld.clone().invert(),point=(m,p,i)=>{const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,m.matrixWorld));v.set(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));return v.applyMatrix4(kit.root.matrixWorld)};
 // Remove only exactly collapsed painted triangles in the actual final Float32 bake.
 let omittedPaintTriangles=0;f.traverse(m=>{if(!m.userData.ciningGatePaint)return;const old=m.geometry,p=old.attributes.position,keep=[];for(let i=0;i<p.count;i+=3){const points=[0,1,2].map(k=>point(m,p,i+k));if(new T.Triangle(...points).getArea()===0){omittedPaintTriangles++;continue;}for(let k=0;k<3;k++)keep.push(p.getX(i+k),p.getY(i+k),p.getZ(i+k));}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(keep,3));geo.computeVertexNormals();m.geometry=geo;old.dispose();});g.omittedExactlyZeroPaintTriangles=omittedPaintTriangles;
 let anchor;
 for(const [index,m]of boxes.entries()){const p=m.geometry.attributes.position,bounds=new T.Box3();for(let i=0;i<p.count;i++)bounds.expandByPoint(point(m,p,i));bounds.ciningGate={kind:'visible-box',index,role:m.userData.role};m.userData.ciningGateBox=index;m.traverse(n=>{if(n.isMesh)n.userData.ciningGateOwner=index;});kit.colliders.push(bounds);if(m.userData.walkable&&m.userData.stepTier===0&&m.position.x===0)anchor=bounds;if(m.userData.walkable){const top=bounds.clone();top.min.y=top.max.y;kit.walkables.push({type:'box',box:top,rescue:false});}}
 for(const [index,m]of curved.entries()){const p=m.geometry.attributes.position,ix=m.geometry.index,faces=[];for(let i=0;i<(ix?.count??p.count);i+=3)faces.push({source:{mesh:0,triangle:i/3},vertices:[0,1,2].map(k=>point(m,p,ix?ix.getX(i+k):i+k))});const surface=createXiqingSurface(faces,'cining-gate-source-'+index),box=surface.box.clone();box.xiqingRoofSurface=surface;box.ciningGate={kind:'visible-surface',index,role:m.userData.role};m.userData.ciningGateSurface=index;kit.colliders.push(box);}
 const scope={kind:'cining-gate',id:'cining-gate',minOffsetX:CINING_GATE_REGION.minX-anchor.min.x,maxOffsetX:CINING_GATE_REGION.maxX-anchor.min.x,minOffsetZ:CINING_GATE_REGION.minZ-anchor.min.z,maxOffsetZ:CINING_GATE_REGION.maxZ-anchor.min.z};validateCiningGateScope(scope,anchor,CINING_GATE_REGION);anchor.furnitureMotionScope=scope;
 f.name='慈宁门门厅';f.userData.ciningGate=g;f.userData.structure={...f.userData.structure,...g};f.userData.gateGeometry=g;return{width,g,frame:f};
}
