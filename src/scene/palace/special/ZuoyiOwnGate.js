import {removeCoveredPlatformSurface} from '../../../render/CoveredPlatformSurface.js';
import * as T from 'three';
import {zuoyiNineRowFrontMaterial} from './ZuoyiDoorFront.js';
// Own Zuoyi cover and own 1932 plans establish topology, not modern dimensions.
// Compact engineering fit deliberately retains both existing gallery anchors.
export function buildZuoyiOwnGate(kit,item,zoneId,index){
 if(zoneId!=='axis-courts'||index!==2||item.name!=='左翼门'||item.x!==-106.47||item.z!==-53.1||item.rot!=='east'||item.style!=='hall')throw Error('Changed own Zuoyi binding');
 const f=kit.frame(item.x,item.z,Math.PI/2),ph=1.6,run=11.2,top=6;
 f.name=item.name;const g={profile:'zuoyi-own-five-bay',objectId:'FC-BC06FBAC15',bayWidths:[2.1,2.7,3,2.7,2.1],portalCenters:[-2.85,0,2.85],platformY:ph,approachRun:run,width:12.6,depth:6.4,wallGap:13.2,dimensionStatus:'COMPACT_OWN_PHOTO_ENGINEERING_FIT_NOT_SURVEY',wholeObjectAccepted:false};
 f.userData.gateGeometry=g;f.userData.structure={...g,id:'axis-courts/items/2',sourceGroup:'2013779953911173120',sourceView:'1977',historicalPlanYear:1932,sideConnectionsChanged:false};
 const tag=(o,r)=>{o.name=r;o.userData.role=r;return o;},box=(r,m,w,h,d,x,y,z)=>tag(kit.box(f,m,w,h,d,x,y,z),r),solid=(r,m,w,h,d,x,y,z)=>{const mesh=box(r,m,w,h,d,x,y,z);kit.col(f,x-w/2,y-h/2,z-d/2,x+w/2,y+h/2,z+d/2);return mesh;};
 const platform=solid('zuoyi-platform','wall_brick',13.2,ph,8,0,ph/2,0);const paving=box('zuoyi-paving','stone_slab',13.2,.06,8,0,ph-.03,0);kit.walkBox(f,-6.6,-4,6.6,4,ph);kit.walkables.at(-1).rescue=false;removeCoveredPlatformSurface(platform,paving,ph,{clipCoincidentSides:true});
 for(const s of[-1,1]){
  tag(kit.mesh(f,wedge(5,s*4,s*(4+run),ph),kit.lib.material('stone_slab'),0,0,0),'zuoyi-approach');kit.walkRamp(f,-5,5,s*4,s*(4+run),ph,0);
  for(let i=0;i<56;i++){const y=ph*(1-(i+1)/56);if(y>0)kit.col(f,-5,0,s*(4+i*.2),5,y,s*(4+(i+1)*.2));}
  for(const x of[-5.15,5.15]){
   for(let i=0;i<=16;i++){const z=s*(4+i*.7),y=ph*(1-i/16);box('zuoyi-rail-post','marble',.16,.72,.16,x,y+.36,z);const h=new T.LatheGeometry([[.07,0],[.10,.04],[.08,.11],[0,.18]].map(p=>new T.Vector2(...p)),12);tag(kit.mesh(f,h,kit.lib.material('marble'),x,y+.72,z),'zuoyi-rail-head');kit.col(f,x-.1,y,z-.1,x+.1,y+.9,z+.1);}
   for(let i=0;i<16;i++){const z=s*(4+(i+.5)*.7),y=ph*(1-(i+.5)/16),m=box('zuoyi-rail-panel','marble',.14,.48,Math.hypot(.54,.54*ph/run),x,y+.34,z);m.rotation.x=s*Math.atan2(ph,run);}
   const m=box('zuoyi-rail','marble',.16,.16,Math.hypot(run,ph),x,ph/2+.72,s*(4+run/2));m.rotation.x=s*Math.atan2(ph,run);
   for(let i=0;i<48;i++)kit.col(f,x-.1,ph*(1-(i+1)/48),s*(4+i*run/48),x+.1,ph*(1-i/48)+.9,s*(4+(i+1)*run/48));
  }
  for(const x of[-5.8,5.8])solid('zuoyi-edge-guard','marble',1.4,.85,.18,x,ph+.425,s*3.91);
 }
 for(const x of[-6.51,6.51])solid('zuoyi-edge-guard','marble',.18,.85,8,x,ph+.425,0);
 const col=new T.CylinderGeometry(.16,.18,top-ph,10);
 for(const x of[-6.3,-4.2,-1.5,1.5,4.2,6.3])for(const z of[-3.2,3.2]){tag(kit.mesh(f,col,kit.lib.material('wood_column'),x,(top+ph)/2,z),'zuoyi-main-column');kit.col(f,x-.18,ph,z-.18,x+.18,top,z+.18);box('zuoyi-column-foot','stone_slab',.45,.12,.45,x,ph+.06,z);}
 for(const s of[-1,1]){
  solid('zuoyi-end-room','wall_red',2.1,top-ph,6.4,s*5.25,(top+ph)/2,0);
  for(const z of[-3.22,3.22]){box('zuoyi-end-window','wood_column',1.8,.14,.12,s*5.25,ph+3.7,z);box('zuoyi-window-sill','wood_column',1.8,.12,.12,s*5.25,ph+.65,z);for(let i=0;i<9;i++)box('zuoyi-window-lattice','wood_column',.035,2.9,.09,s*5.25-.82+i*.205,ph+2.15,z);for(let i=0;i<10;i++)box('zuoyi-window-lattice','wood_column',1.8,.035,.09,s*5.25,ph+.7+i*.31,z);}
 }
 const front=zuoyiNineRowFrontMaterial(kit.lib);
 for(const x of g.portalCenters){for(const s of[-1,1]){
  solid('zuoyi-door-jamb','wood_column',.2,3.7,.32,x+s*1.2,ph+1.85,0);
  const geo=new T.BoxGeometry(1,3.6,.25);geo.translate(0,1.8,0);const leaf=tag(kit.mesh(f,geo,kit.lacquer,x+s*1.06,ph,.5),'zuoyi-door-leaf');leaf.rotation.y=Math.PI/2;
  if(front){const ids=[],keep=[];for(let i=0;i<geo.index.count;i+=3){const a=[0,1,2].map(j=>geo.index.getX(i+j));(a.every(j=>geo.attributes.normal.getZ(j)===-s)?ids:keep).push(...a);}const skin=geo.clone();skin.setIndex(ids);skin.clearGroups();geo.setIndex(keep);geo.clearGroups();const mesh=tag(new T.Mesh(skin,front),'zuoyi-own-nine-row-front');mesh.castShadow=mesh.receiveShadow=true;leaf.add(mesh);}
  kit.col(f,x+s*1.06-.125,ph,0,x+s*1.06+.125,ph+3.6,1);
 }solid('zuoyi-door-head','caihua_beam',x===0?3:2.7,top-ph-3.6,.4,x,(top+ph+3.6)/2,0);}
 f.userData.zuoyiDoorFront={objectId:g.objectId,status:front?'SIX_OWN_LEAVES_NINE_ROW_GRAPHIC':'SOURCE_UNAVAILABLE',verticalRows:front?9:null,horizontalCount:'INHERITED_UNVERIFIED',hardware:'INHERITED_IMAGE_FIT_NOT_SURVEY',legacyTwoLeafGuardApplied:false};
 for(const z of[-3.2,3.2])solid('zuoyi-beam','caihua_beam',12.7,.5,.36,0,top-.25,z);
 tag(kit.roof(f,{type:'xieshan',width:12,depth:6.8,baseY:top,height:1.8,overhang:.14,brackets:true,layers:1}),'zuoyi-roof');kit.mapRect(f,'gate',item.name,13.2,8,{objectId:g.objectId,dimensionStatus:g.dimensionStatus});
 return{width:g.wallGap,geometry:g,frame:f};
}
function wedge(half,z0,z1,y){
 const v=[[-half,0,z0],[half,0,z0],[half,0,z1],[-half,0,z1],[-half,y,z0],[half,y,z0]],ids=[0,2,1,0,3,2,0,1,5,0,5,4,4,5,2,4,2,3,0,4,3,1,2,5];
 if(z1>z0)for(let i=0;i<ids.length;i+=3)[ids[i+1],ids[i+2]]=[ids[i+2],ids[i+1]];
 const a=ids.flatMap(i=>v[i]),uv=ids.flatMap(i=>[v[i][0]/3,v[i][2]/3]);
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(a,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;
}
