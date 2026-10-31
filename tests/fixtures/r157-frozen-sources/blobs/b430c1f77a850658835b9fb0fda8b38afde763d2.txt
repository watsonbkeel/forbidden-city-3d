import * as T from 'three';
import {createXiqingSurface} from '../../../controls/XiqingRoofSurface.js';
import {SHOUAN_ENTRY_REGION,validateShouanEntryScope} from '../../../controls/ShouanEntrySupport.js';
import {buildWallCap} from '../../RoofBuilder.js';
export function validateShouanEntryCourtWall(item){if(item?.kind!=='courtWalls'||item.x0!==256.02||item.x1!==297.78||item.z0!==362||item.z1!==450||(item.h!==undefined&&item.h!==6.5)||(item.t!==undefined&&item.t!==1)||!Array.isArray(item.gates)||item.gates.length!==1||item.gates[0].side!=='s'||item.gates[0].at!==277||item.gates[0].gate!=='寿安门')throw Error('Shouan entrance requires its exact retained court boundary and sole south gate reference');return true;}
const SOURCE='https://www.dpm.org.cn/explore/building/236505.html',PHOTO='https://img.dpm.org.cn/Uploads/Picture/dc/4662[1024].jpg',SCREEN_PHOTO='https://img.dpm.org.cn/Uploads/Picture/dc/4674.jpg';
export function shouanEntryGeometry(item,zoneId='outer-west'){
 if(zoneId!=='outer-west'||item.kind!=='gate'||item.name!=='寿安门'||item.x!==277||item.z!==362||item.gateProfile!=='shouan-entry'||item.gateKind!=='three-wall-portals'||item.open!==true||item.rot!=='south'||['w','h','t','layers','eaveCount','roof'].some(k=>item[k]!==undefined))throw Error('Shouan entrance requires the exact retained named gate and explicit playable source profile');
 return {profile:'shouan-entry',id:'outer-west/shouan-entry',x:277,z:362,rot:0,width:20.8,depth:2.8,portalCount:3,portalCenters:[-8,0,8],centralClearWidth:3.6,frontWall:{x0:256.02,x1:297.78,z:362,height:4.4,retainedOtherWallsHeight:6.5,precision:'PHOTO_RELATIONSHIP_FIT_NOT_SURVEY'},portals:[{id:'east',x:-8,clear:2.4,pier:1.2,height:3.9,top:5.2,depth:2,floor:.1},{id:'central',x:0,clear:3.6,pier:1.4,height:4.4,top:5.9,depth:2.8,floor:.36},{id:'west',x:8,clear:2.4,pier:1.2,height:3.9,top:5.2,depth:2,floor:.1}],screen:{z:6,leaves:4,leafWidth:1.15,centralClearWidth:2.2,floor:.24},source:SOURCE,photo:PHOTO,screenPhoto:SCREEN_PHOTO,photographyDate:null,status:'SOURCE_TOPOLOGY_PHOTO_RELATIONSHIP_MODEL_METRICS_FIT_NOT_SURVEY',acceptedWholeObject:false,visualStatus:'VERIFY_PENDING',openState:'MODEL_OPEN_FOUR_LEAF_SCREEN_BASED_ON_CENTRAL_PHOTO_NOT_CURRENT_VISITOR_PERMISSION',unknown:['side portal exact location and details','exact glazed ornament and Manchu inscription','precise roof forms and survey dimensions','current door pose and museum access','rest of Shouan palace compound']};
}
/** Actual closed boxes, with flush color fields on the existing front faces.
 * These coarse fields are NOT a carved relief or an exact historical pattern. */
function paintedBox(w,h,d,pattern){
 const geo=new T.BoxGeometry(w,h,d,pattern?24:1,pattern?32:1,1),p=geo.attributes.position,n=geo.attributes.normal,colors=[];
 const palette={red:new T.Color(0xa34e3d),green:new T.Color(0x497967),gold:new T.Color(0xc8a449),blue:new T.Color(0x284c81)};
 for(let i=0;i<p.count;i++){
  const oldY=p.getY(i),y=Math.max(0,Math.min(h,oldY+h/2));p.setY(i,y);let color=palette.red;
  if(n.getZ(i)<-.9&&pattern){const u=p.getX(i)/w+.5,v=y/h;
   if(pattern==='pier'){const dx=(u-.5)/.32,dy=(v-.5)/.28,r=Math.hypot(dx,dy),edge=1+.08*Math.cos(6*Math.atan2(dy,dx));if(u<.06||u>.94||v<.04||v>.96)color=palette.gold;else if(r<edge){color=r>edge-.1?palette.gold:palette.green;for(const [cx,cy]of[[.5,.5],[.5,.37],[.5,.63],[.37,.5],[.63,.5]])if(Math.hypot((u-cx)/.052,(v-cy)/.042)<1)color=palette.gold;}else if(Math.min(u,1-u)/.3+Math.min(v,1-v)/.24<1)color=palette.green;}
   else if(pattern==='leaf'){const row=v<.2?0:v<.43?1:2,lo=[.035,.225,.46][row],hi=[.175,.405,.96][row];if(u>.06&&u<.94&&v>lo&&v<hi&&(u<.085||u>.915||v<lo+.012||v>hi-.012))color=palette.gold;}
   else {color=palette.green;if(v<.08||v>.92||u<.03||u>.97)color=palette.gold;}
  }
  colors.push(color.r,color.g,color.b);
 }
 geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));return geo;
}
export function buildShouanEntry(kit,item,zoneId){
 const g=shouanEntryGeometry(item,zoneId),f=kit.frame(g.x,g.z,0);f.name='寿安门入口群';f.userData.structure=g;f.userData.gateGeometry=g;
 const painted=new T.MeshStandardMaterial({name:'shouan_entry_flush_photo_fit',color:0xffffff,vertexColors:true,roughness:.78});painted.userData.shouanEntryVertexColors=true;kit.owned.push(painted);
 const solids=[],surfaces=[],tag=(m,role)=>{m.name='shouan-entry-'+role;m.userData.role=m.name;m.userData.shouanEntry=true;return m;};
 const block=(role,w,h,d,x,y,z,material='wall_red',pattern=null,walk=false)=>{const m=pattern?kit.mesh(f,paintedBox(w,h,d,pattern),painted,x,y,z):kit.mesh(f,paintedBox(w,h,d,null),kit.lib.material(material),x,y,z);tag(m,role);solids.push({m,walk});return m;};
 const slab=(role,w,h,d,x,z)=>block(role,w,h,d,x,0,z,'stone_slab',null,true);
 for(const p of g.portals){
  const body=p.clear+2*p.pier,central=p.id==='central',base=central?.9:.7;
  slab(p.id+'-platform',central?4.6:3.2,p.floor,central?3.3:2.6,p.x,0);
  if(central)for(const side of[-1,1])for(const [i,h]of[.12,.24].entries())slab('central-step-'+side+'-'+i,4.6,h,.6,0,side*(2.55-i*.6));
  for(const side of[-1,1]){
   const x=p.x+side*(p.clear/2+p.pier/2);
   block(p.id+'-stone-base',p.pier+.1,base,p.depth+.1,x+side*.05,0,0,'stone_slab');
   block(p.id+'-pier',p.pier,p.top-base,p.depth,x,base,0,'wall_red',central?'pier':null);
  }
  block(p.id+'-header',p.clear,p.top-p.floor-p.height,p.depth,p.x,p.floor+p.height,0,'wall_red',central?'beam':null);
  // Open leaf cuboids stand north of the piers, never buried inside masonry.
  for(const side of[-1,1]){const leaf=block(p.id+'-open-leaf',p.clear/2-.05,p.height-.08,.09,p.x+side*(p.clear/2+.06),p.floor,p.depth/2+(p.clear/2-.05)/2,'wood_column','leaf');leaf.rotation.y=Math.PI/2;}
  const roof=tag(kit.roof(f,{type:'xieshan',width:body+.3,depth:p.depth+.5,baseY:p.top,height:central?1.3:.9,brackets:false,detail:'low'},p.x,0),p.id+'-roof');surfaces.push({root:roof,id:p.id+'-roof'});
 }
 // Actual wall between the independent openings replaces the middle part of
 // the larger court-wall cut. Outer court wall remains its original source.
 for(const [i,[lo,hi]]of [[256.02-g.x,-10.4],[-5.6,-3.2],[3.2,5.6],[10.4,297.78-g.x]].entries()){
  block('front-wall-'+i,hi-lo,4.4,1,(lo+hi)/2,0,0,'wall_red');const cap=tag(kit.adopt(buildWallCap(kit.lib,{length:hi-lo,thickness:1})),'front-wall-cap-'+i);cap.position.set((lo+hi)/2,4.4,0);f.add(cap);surfaces.push({root:cap,id:'wall-cap-'+i});
 }
 const s=g.screen;
 slab('screen-platform',5.8,s.floor,2.2,0,s.z);
 for(const side of[-1,1])slab('screen-step-'+side,3.2,.12,.6,0,s.z+side*1.4);
 for(const side of[-1,1]){block('screen-stone-base',.68,.55,.72,side*2.65,0,s.z,'stone_slab');block('screen-post',.32,3.95,.34,side*2.65,.55,s.z,'wood_column');}
 for(const [i,x]of[-1.725,-.575,.575,1.725].entries()){
  const open=i===1||i===2,side=i<2?-1:1,leaf=block('screen-leaf-'+i,s.leafWidth,3.2,.08,open?side*1.15:x,s.floor,open?s.z+s.leafWidth/2:s.z,'wood_column','leaf');if(open)leaf.rotation.y=Math.PI/2;leaf.userData.screenLeaf={index:i,open};
 }
 block('screen-header',5.3,.77,.4,0,3.73,s.z,'wood_column','beam');
 // Source-visible transom stays an open timber grid, not opaque invented glass.
 for(const side of[-1,1])block('screen-transom-edge',5.3,.08,.16,0,3.47+side*.18,s.z,'wood_column');
 for(let i=0;i<=12;i++)block('screen-transom-divider',.04,.36,.16,-2.65+i*5.3/12,3.29,s.z,'wood_column');
 const screenRoof=tag(kit.roof(f,{type:'xieshan',width:5.8,depth:2.2,baseY:4.5,height:.85,brackets:false,detail:'low'},0,s.z),'screen-roof');surfaces.push({root:screenRoof,id:'screen-roof'});
 const board=block('nameboard-backing',.85,1.28,.12,0,4.65,-1.47,'wood_column');kit.plaque(f,'寿安门',0,5.29,-1.535,.78,1.2);const plaqueFrame=tag(kit.plaques.at(-1).frame,'nameboard-frame');solids.push({m:plaqueFrame,walk:false});const text=kit.plaques.at(-1).mesh;tag(text,'nameboard-text');surfaces.push({root:text,id:'nameboard'});
 kit.root.updateWorldMatrix(true,true);const inverse=kit.root.matrixWorld.clone().invert(),toVertex=(m,p,i)=>{const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,m.matrixWorld));v.set(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));return v.applyMatrix4(kit.root.matrixWorld);};
 let anchor;
 for(const [index,{m,walk}]of solids.entries()){const a=m.geometry.attributes.position,box=new T.Box3();for(let i=0;i<a.count;i++)box.expandByPoint(toVertex(m,a,i));box.shouanEntry={kind:'visible-box',index,role:m.userData.role};kit.colliders.push(box);m.userData.shouanSolidIndex=index;if(m.userData.role==='shouan-entry-central-platform')anchor=box;if(walk){const top=box.clone();top.min.y=top.max.y;kit.walkables.push({type:'box',box:top,rescue:false});}}
 for(const {root,id}of surfaces){const faces=[];let mesh=0;root.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??a.count);i+=3)faces.push({source:{mesh,triangle:i/3},vertices:[0,1,2].map(k=>toVertex(m,a,ix?ix.getX(i+k):i+k))});m.userData.shouanSurface={id,mesh};mesh++;});const surface=createXiqingSurface(faces,'shouan-entry-'+id),box=surface.box.clone();box.xiqingRoofSurface=surface;box.shouanEntry={kind:'visible-surface',id};kit.colliders.push(box);}
 const scope={kind:'shouan-entry',id:'shouan-entry',minOffsetX:SHOUAN_ENTRY_REGION.minX-anchor.min.x,maxOffsetX:SHOUAN_ENTRY_REGION.maxX-anchor.min.x,minOffsetZ:SHOUAN_ENTRY_REGION.minZ-anchor.min.z,maxOffsetZ:SHOUAN_ENTRY_REGION.maxZ-anchor.min.z};validateShouanEntryScope(scope,anchor,SHOUAN_ENTRY_REGION);anchor.furnitureMotionScope=scope;
 kit.mapRect(f,'gate','寿安门',g.width,2.8,{gateProfile:g.profile,portalCount:3,source:SOURCE,precision:g.status});return{width:g.width,geometry:g,frame:f};
}
