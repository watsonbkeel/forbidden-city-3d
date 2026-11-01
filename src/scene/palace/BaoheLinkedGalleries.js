import * as T from 'three';
import {validateGalleryInventoryPolicy} from './GalleryInventoryPolicy.js';

// Museum magazine 2020/10 p54 explicitly shows Baohe east gallery's arched
// cross-firewalls and describes six sections/seven walls in the paired wings.
// Preserve existing axes, overall footprint and low platform. Six game-scale
// sections follow that topology; exact per-side wall stations are NOT surveyed.
export function buildBaoheLinkedGallery(kit,item,index){
 const side=index===31?'east':index===37?'west':null,target=`axis-courts/items/${index}`;
 if(!side||kit.root.name!=='axis-courts'||item?.kind!=='corridor'||item.facing!==(side==='east'?'x+':'x-')||item.from?.[0]!==item.to?.[0]||item.from?.[1]!==-11.7||item.to?.[1]!==122.5)throw Error('Invalid Baohe linked gallery identity');
 validateGalleryInventoryPolicy(item.furnishingPolicy,{zone:'axis-courts',target,kind:'corridor'});
 if(item.furnishingPolicy?.target!==target)throw Error('Baohe gallery requires explicit unknown inventory identity');
 const id=side==='east'?'FC-0D3F161564':'FC-86FF7FC2AB';
 if(kit.root.children.some(c=>c.userData.structure?.id===id))throw Error('Baohe gallery already installed');
 const length=item.to[1]-item.from[1]-1,depth=4.2,floorY=.45,colH=3.6,bays=39,bay=length/bays,verandaCenter=-1.0;
 const f=kit.frame(item.from[0],(item.from[1]+item.to[1])/2,side==='east'?-Math.PI/2:Math.PI/2);f.name=side==='east'?'保和殿东联庑':'保和殿西联庑';
 const stations=[0,6,13,19,26,32,39].map(i=>-length/2+i*bay);
 f.userData.structure={id,kind:'baohe-linked-gallery',side,source:'DPM_MAGAZINE_2020_10_P54',length,depth,floorY,verandaCenter,segmentCount:6,firewalls:stations.map((x,i)=>({id:`${id}/firewall/${i}`,x})),exactSegmentLocationsSurveyed:false,inventory:'UNKNOWN_NOT_BUILT',wholeObjectAccepted:false,sourceLimits:['west individual photograph not restored','exact seven-wall count per side and stations not surveyed','hidden room arrangement and fine carving']};
 const box=(role,mat,w,h,d,x,y,z,physical=false)=>{const m=kit.box(f,mat,w,h,d,x,y,z);m.userData.baoheGalleryPart=role;if(physical)kit.col(f,x-w/2,y-h/2,z-d/2,x+w/2,y+h/2,z+d/2);return m;};
 const mesh=(role,geometry,mat,x=0,y=0,z=0)=>{const m=kit.mesh(f,geometry,kit.lib.material(mat),x,y,z);m.userData.baoheGalleryPart=role;return m;};
 box('visible-platform','wall_brick',length+1,floorY,depth+1,0,floorY/2,0);
 box('stone-paving','stone_slab',length+1.12,.08,depth+1.12,0,floorY-.03,0);kit.walkBox(f,-(length+1)/2,-(depth+1)/2,(length+1)/2,(depth+1)/2,floorY);
 const columns=new T.CylinderGeometry(.22,.24,colH,12);
 for(let i=0;i<=bays;i++){
  const x=-length/2+i*bay;mesh('front-column',columns,'wood_column',x,floorY+colH/2,-depth/2);kit.col(f,x-.24,floorY,-depth/2-.24,x+.24,floorY+colH,-depth/2+.24);
 }
 // Closed rooms remain a visible envelope only: no invented furniture or
 // fictitious visitor access. The source-backed covered front walk is open.
 box('back-wall','wall_red',length,colH,.30,0,floorY+colH/2,depth/2,true);
 box('window-sill-wall','wall_brick',length,.85,.25,0,floorY+.425,.22,true);
 for(let i=0;i<bays;i++){
  const x=-length/2+(i+.5)*bay;
  box('front-window','lattice_doors',bay-.16,1.95,.14,x,floorY+1.825,.22,true);
  box('window-post','wood_column',.16,colH,.24,x-bay/2,floorY+colH/2,.22,true);
 }
 box('front-window-head','wall_red',length,.8,.24,0,floorY+3.2,.22,true);
 box('front-beam','caihua_beam',length+.5,.45,.4,0,floorY+colH-.225,-depth/2);
 box('ceiling','caihua_beam',length,.10,depth,0,floorY+colH-.06,0);
 const opening={center:verandaCenter,radius:1,spring:1.6},thickness=.42;
 const extrude=(shape,thick=thickness)=>{const geo=new T.ExtrudeGeometry(shape,{depth:thick,bevelEnabled:false,curveSegments:12,steps:1});geo.rotateY(-Math.PI/2);geo.translate(thick/2,floorY,0);return geo;};
 for(let i=0;i<stations.length;i++){
  const x=stations[i],c=opening.center,r=opening.radius,h=opening.spring,outer=r+.22;
  // Cut masonry to the ring's OUTER radius. An overlaid ring would leave two
  // coincident intrados faces and visibly shimmer even at ordinary distance.
  const shape=new T.Shape();shape.moveTo(-2.35,0);shape.lineTo(-2.35,3.8);shape.lineTo(0,5.05);shape.lineTo(2.35,3.8);shape.lineTo(2.35,0);shape.lineTo(c+outer,0);shape.lineTo(c+outer,h);shape.absarc(c,h,outer,0,Math.PI,false);shape.lineTo(c-outer,0);shape.closePath();
  const wall=mesh('red-firewall',extrude(shape),'wall_red',x);wall.name=`${id}/firewall/${i}`;
  for(const[a,b]of[[-2.35,c-r],[c+r,2.35]]){
   box('stone-firewall-foot','wall_brick',thickness+.04,.9,b-a,x,floorY+.45,(a+b)/2);
   kit.col(f,x-thickness/2,floorY,a,x+thickness/2,floorY+3.8,b);
  }
  kit.col(f,x-thickness/2,floorY+h+r,c-r,x+thickness/2,floorY+5.05,c+r);
  const ring=new T.Shape();ring.absarc(c,h,r+.22,0,Math.PI,false);ring.lineTo(c-r,h);ring.absarc(c,h,r,Math.PI,0,true);ring.closePath();mesh('stone-arch-ring',extrude(ring,thickness+.08),'stone_slab',x);
  for(const z of[c-r-.11,c+r+.11])box('stone-arch-jamb','stone_slab',thickness+.06,h,.22,x,floorY+h/2,z);
  if(i<stations.length-1){const w=stations[i+1]-x;kit.roof(f,{type:'gable',width:w-.10,depth:depth+.5,baseY:floorY+colH,height:1.2,brackets:false},(x+stations[i+1])/2);}
 }
 kit.mapRect(f,'corridor',f.name,length+1,depth+1,{reviewId:id});
 return f;
}
