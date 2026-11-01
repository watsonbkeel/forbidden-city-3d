import * as T from 'three';
import {buildStuddedDoor} from '../../HallKit.js';
// Fresh 2026-11-01 implementation, NOT the lost/rejected C candidate.
// Five bays and own west/east appearance: official vp3807/vp2017.
// Compact dimensions deliberately retain the existing 13.6 m gallery gap;
// they are engineering fits, not measured architectural dimensions.
export function buildYouyiFreshGate(kit,item,zoneId,index){
 if(zoneId!=='axis-courts'||index!==3||item.name!=='右翼门'||item.x!==110.7||item.z!==-52.8||item.rot!=='west'||item.style!=='hall')throw Error('Unexpected Youyi binding');
 const f=kit.frame(item.x,item.z,-Math.PI/2),ph=.45,top=4.85;
 f.name=item.name;const g={profile:'youyi-five-bay-fresh',objectId:'FC-E2A42F047A',bayCount:5,portalCount:3,portalCenters:[-2.52,0,2.52],clearWidth:2,platformY:ph,width:12.6,depth:6.4,wallGap:13.2,dimensionStatus:'COMPACT_EXISTING_INTERFACE_ENGINEERING_FIT_NOT_SURVEY',wholeObjectAccepted:false};
 f.userData.gateGeometry=g;f.userData.structure={...g,id:'axis-courts/items/3',sourceViews:['3807','2017'],sideConnectionsChanged:false};
 const tag=(o,role)=>{o.name=role;o.userData.role=role;return o;};
 const box=(role,mat,w,h,d,x,y,z)=>tag(kit.box(f,mat,w,h,d,x,y,z),role);
 const solid=(role,mat,w,h,d,x,y,z)=>{const m=box(role,mat,w,h,d,x,y,z);kit.col(f,x-w/2,y-h/2,z-d/2,x+w/2,y+h/2,z+d/2);return m;};
 solid('youyi-platform','wall_brick',13.2,ph,8,0,ph/2,0);
 box('youyi-paving','stone_slab',13.2,.06,8,0,ph-.03,0);kit.walkBox(f,-6.6,-4,6.6,4,ph);kit.walkables.at(-1).rescue=false;
 for(const s of[-1,1]){
  tag(kit.mesh(f,wedge(5.4,s*4,s*7,ph),kit.lib.material('stone_slab'),0,0,0),'youyi-approach');kit.walkRamp(f,-5.4,5.4,s*4,s*7,ph,0);
  // Conservative inscribed solid slices match the visible wedge, no hidden floor.
  for(let i=0;i<15;i++){const z0=s*(4+i*.2),z1=s*(4+(i+1)*.2),y=ph*(1-(i+1)/15);if(y>0)kit.col(f,-5.4,0,z0,5.4,y,z1);}
  for(const x of[-5.55,5.55]){
   // Own public west view: lower stone panels and rounded post heads.
   // Compact visual fit inside the retained rail proxy, not measured carving.
   for(let i=0;i<=4;i++){
    const z=s*(4+i*.75),y=ph*(1-i/4),cy=y+.45;
    // Keep original .18 x .9 x .18 post collision arithmetic exactly.
    kit.col(f,x-.18/2,cy-.9/2,z-.18/2,x+.18/2,cy+.9/2,z+.18/2);
    box('youyi-rail','marble',.13,.72,.13,x,y+.36,z);
    const head=new T.LatheGeometry([[.065,0],[.085,.025],[.09,.07],[.075,.12],[.035,.165],[0,.18]].map(p=>new T.Vector2(...p)),12);
    tag(kit.mesh(f,head,kit.lib.material('marble'),x,y+.72,z),'youyi-stone-head');
   }
   for(let i=0;i<4;i++){
    const z=s*(4+(i+.5)*.75),y=ph*(1-(i+.5)/4);
    const panel=box('youyi-stone-panel','marble',.12,.48,Math.hypot(.57,.57*ph/3),x,y+.34,z);
    panel.rotation.x=s*Math.atan2(ph,3);
   }
   const m=box('youyi-rail','marble',.14,.16,Math.hypot(3,ph),x,ph/2+.72,s*5.5);m.rotation.x=s*Math.atan2(ph,3);
   kit.col(f,x-.09,0,s*4,x+.09,1.3,s*7);
  }
 }
 const col=new T.CylinderGeometry(.16,.18,top-ph,10);
 for(const x of[-6.3,-3.78,-1.26,1.26,3.78,6.3])for(const z of[-3.2,3.2]){
  tag(kit.mesh(f,col,kit.lib.material('wood_column'),x,(top+ph)/2,z),'youyi-main-column');kit.col(f,x-.18,ph,z-.18,x+.18,top,z+.18);
  box('youyi-column-foot','stone_slab',.45,.12,.45,x,ph+.06,z);
 }
 // End rooms remain closed. Three central bays share one open hall: no full-depth piers.
 for(const s of[-1,1]){
  solid('youyi-end-room','wall_red',2.52,top-ph,6.4,s*5.04,(top+ph)/2,0);
  for(const z of[-3.22,3.22]){
   box('youyi-window-sill','wood_column',2.2,.12,.12,s*5.04,1.15,z);
   box('youyi-end-window','wood_column',2.2,.14,.12,s*5.04,3.9,z);
   for(let i=0;i<10;i++)box('youyi-window-lattice','wood_column',.035,2.65,.09,s*5.04-1.05+i*.2333,2.525,z);
   for(let i=0;i<10;i++)box('youyi-window-lattice','wood_column',2.2,.035,.09,s*5.04,1.2+i*.3,z);
  }
 }
 for(const x of g.portalCenters){
  for(const s of[-1,1]){
   solid('youyi-door-jamb','wood_column',.26,3.65,.32,x+s*1.13,ph+1.825,0);
   const leaf=tag(buildStuddedDoor(kit.lib,{width:.97,height:3.5}),'youyi-door-leaf');leaf.position.set(x+s*1.03,ph,.485);leaf.rotation.y=Math.PI/2;f.add(leaf);
   kit.col(f,x+s*1.03-.10,ph,0,x+s*1.03+.10,ph+3.5,.97);
  }
  solid('youyi-door-head','caihua_beam',2.52,top-ph-3.5,.4,x,(top+ph+3.5)/2,0);
 }
 for(const z of[-3.2,3.2])solid('youyi-beam','caihua_beam',12.7,.5,.36,0,top-.25,z);
 const roof=kit.roof(f,{type:'xieshan',width:12,depth:6.8,baseY:top,height:1.8,overhang:.14,brackets:true,layers:1});tag(roof,'youyi-roof');
 kit.mapRect(f,'gate',item.name,13.2,8,{objectId:g.objectId,dimensionStatus:g.dimensionStatus});
 return{width:g.wallGap,geometry:g,frame:f};
}
function wedge(half,z0,z1,y){
 const v=[[-half,0,z0],[half,0,z0],[half,0,z1],[-half,0,z1],[-half,y,z0],[half,y,z0]],ids=[0,2,1,0,3,2,0,1,5,0,5,4,4,5,2,4,2,3,0,4,3,1,2,5];
 if(z1>z0)for(let i=0;i<ids.length;i+=3)[ids[i+1],ids[i+2]]=[ids[i+2],ids[i+1]];
 const a=ids.flatMap(i=>v[i]),uv=ids.flatMap(i=>[v[i][0]/3,v[i][2]/3]);
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(a,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;
}
