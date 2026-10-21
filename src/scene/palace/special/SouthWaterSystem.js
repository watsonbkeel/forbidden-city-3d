import * as THREE from 'three';
import { innerJinshuiProfile, innerJinshuiGroundPath, canCrossInnerJinshui, INNER_JINSHUI } from './InnerJinshui.js';
import { applyBoxUV } from '../../../utils/GeometryUV.js';
import { mergeByMaterial } from '../../../utils/MergeUtils.js';

/** R36: +X is WEST, +Z is NORTH. Official diagrams establish topology only.
 * Every coordinate below is an individually reversible model fit. The only
 * officially published bridge dimensions used here are Duanhong's 18.7 m / MAX 9.2 m.
 * This bounded system ends north-west / south-east; it is NOT the entire river.
 */
const FIT='OFFICIAL_TOPOLOGY_REVERSIBLE_MODEL_FIT_NOT_SURVEYED';
const sources=[
 {url:'https://www.dpm.org.cn/explore/building/236575.html',use:'Duanhong east of Wuying; north–south; 18.7 m long, MAXIMUM 9.2 m wide'},
 {url:'https://www.dpm.org.cn/architectural_art/246281.html',use:'Three bridges outside Wuying gate; five before Taihe gate; Xiehe half-bridge has one balustrade'},
 {url:'https://www.dpm.org.cn/explore/building/236513.html',use:'Wenyuan front pond draws Inner Jinshui water; a single bridge'},
 {url:'https://img.dpm.org.cn/Uploads/File/2020/04/27/u5ea6a2bde2722.pdf',use:'pp24–25: river enters north of Xihe, exits north of Xiehe; photograph explicitly identifies Xiehe under-corridor culvert; diagram locates Duanhong north of Wuying gate'},
 {url:'https://www.dpm.org.cn/Uploads/File/2022/03/09/u6228270c815e0.pdf',use:'p202: Wuying gate stair-to-bridge-head separation 4.8 m; NOT centre distance'},
 {url:'https://img.dpm.org.cn/static/themes/image/xf/map3.jpg',use:'Diagrammatic topology, not a scale plan'},
];
const cache=new WeakMap();
const WUYING_GATE_SOUTH_TOE=-249.8-(17.9+1.6)/2-.8*1.6;
const WUYING_BRIDGE_Z=WUYING_GATE_SOUTH_TOE-4.8-18.4/2;
function path(points,hole=false){const s=hole?new THREE.Path():new THREE.Shape();points.forEach((p,i)=>s[i?'lineTo':'moveTo'](p.x,-p.z));s.closePath();return s;}
function flat(points,y){const geo=new THREE.ShapeGeometry(path(points));geo.rotateX(-Math.PI/2);geo.translate(0,y,0);return geo;}
function contains(poly,x,z){let v=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)v=!v;}return v;}
function segmentBox(a,b,x,z,r){let lo=0,hi=1;for(const[p,d,mn,mx]of[[a.x,b.x-a.x,x-r,x+r],[a.z,b.z-a.z,z-r,z+r]]){if(Math.abs(d)<1e-10){if(p<mn||p>mx)return false;}else{let aa=(mn-p)/d,bb=(mx-p)/d;lo=Math.max(lo,Math.min(aa,bb));hi=Math.min(hi,Math.max(aa,bb));if(lo>hi)return false;}}return true;}
function touches(poly,x,z,r){if(contains(poly,x,z))return true;for(const xx of[x-r,x+r])for(const zz of[z-r,z+r])if(contains(poly,xx,zz))return true;return poly.some((a,i)=>segmentBox(a,poly[(i+1)%poly.length],x,z,r));}
// Mitered polyline, sampled <= 1.5 m. Width changes are explicit; no hidden
// global smoothing that moves the bridge/culvert interfaces off their anchors.
function reach(id,controls){
 const corners=controls.map(([x,z,half=4.5],i)=>{const prev=controls[Math.max(0,i-1)],next=controls[Math.min(controls.length-1,i+1)];let a=new THREE.Vector2(x-prev[0],z-prev[1]),b=new THREE.Vector2(next[0]-x,next[1]-z);if(!a.length())a.copy(b);if(!b.length())b.copy(a);a.normalize();b.normalize();const na=new THREE.Vector2(-a.y,a.x),nb=new THREE.Vector2(-b.y,b.x),n=na.clone().add(nb).normalize();const factor=half/Math.max(.5,n.dot(na));return{x,z,half,left:{x:x+n.x*factor,z:z+n.y*factor},right:{x:x-n.x*factor,z:z-n.y*factor}};});
 const centers=[],left=[],right=[];for(let i=1;i<corners.length;i++){const a=corners[i-1],b=corners[i],n=Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/1.5);for(let k=i===1?0:1;k<=n;k++){const t=k/n;centers.push({x:THREE.MathUtils.lerp(a.x,b.x,t),z:THREE.MathUtils.lerp(a.z,b.z,t)});for(const side of['left','right'])(side==='left'?left:right).push({x:THREE.MathUtils.lerp(a[side].x,b[side].x,t),z:THREE.MathUtils.lerp(a[side].z,b[side].z,t)});}}
 return{id,controls,centers,left,right,waterPolygon:[...left,...right.toReversed()],status:FIT};
}
export function southWaterProfile(river){
 if(!river?.southWaterProfile)return null;
 if(river.southWaterProfile!=='r36-south-precinct'||river.position?.x!==0||river.position?.z!==-310.8)throw new Error('South water profile requires the retained finite first-entry anchor');
 if(cache.has(river))return cache.get(river);
 const base=innerJinshuiProfile(river);
 const west=reach('west-wuying',[[76,-290.8,5],[76.6,-290.8,5],[79,-282,4.2],[94,-278,4.2],[98,-278,4.2],[119,-278,4.2],[135,-267,4.2],[142,-234,4.2],[160.6,-234,4.2],[174,-234,4.2],[184,-258,4.2],[198,WUYING_BRIDGE_Z,4.2],[240,WUYING_BRIDGE_Z,4.2],[264,-260,4.2],[270,-240,4.2],[270,-130,4.2]]);
 const east=reach('east-wenhua',[[ -76,-290.8,5],[-78,-290.8,2],[-82,-282,3.5],[-94,-278,4.0],[-98,-278,4.0],[-119,-278,4.0],[-140,-270,4],[-140,-175,4],[-149,-149,3],[-167,-149,3],[-175.5,-149,4.5],[-197.5,-149,4.5],[-220,-149,3],[-300,-149,4],[-320,-180,4],[-320,-280,4],[-308,-350,4],[-300,-408,4]]);
 const bridges=[...[-1,0,1].map((s,i)=>({id:`wuying-${i+1}`,family:'wuying',x:220.8+s*34.9/5,z:WUYING_BRIDGE_Z,axis:'z',length:18.4,width:s?3.8:5,minWidth:s?3.8:5,crest:.45,railSides:[-1,1],stairToHead:4.8,dimensionStatus:FIT})),
  {id:'duanhong',family:'duanhong',x:160.6,z:-234,axis:'z',length:18.7,width:9.2,minWidth:7.8,crest:.7,railSides:[-1,1],dimensionStatus:'OFFICIAL_LENGTH_AND_MAX_WIDTH__OTHER_DIMENSIONS_MODEL_FIT'},
  {id:'xiehe-banbi',family:'half-bridge',x:-140,z:-266,axis:'x',length:16,width:5,minWidth:5,crest:.35,railSides:[-1],dimensionStatus:FIT},
  {id:'wenyuan-pond',family:'pond',railEndInset:1.5,x:-186.5,z:-149,axis:'z',length:13.2,width:3.4,minWidth:3.4,crest:.18,railSides:[-1,1],dimensionStatus:FIT},
  {id:'donghua-inner',family:'east-route',x:-320,z:-257,axis:'x',length:18,width:6.8,minWidth:6.8,crest:.35,railSides:[-1,1],dimensionStatus:FIT}];
 const rawPolygon=[...base.banks.south,...west.right.slice(1),...west.left.toReversed(),...base.banks.north.toReversed().slice(1),...east.right.slice(1),...east.left.toReversed()];
 const polygon=rawPolygon.filter((p,i)=>{const prev=rawPolygon[(i+rawPolygon.length-1)%rawPolygon.length];return Math.hypot(p.x-prev.x,p.z-prev.z)>1e-8;});
 const profile={id:'r36-south-precinct',status:FIT,sources,mainBridgeCount:5,reaches:[west,east],bridges,waterPolygons:[polygon],
  culverts:[{id:'xihe-north',x:110.7,z:-278,axis:'x',length:8,width:8.4,status:'OFFICIAL_NORTH_INTERFACE__VAULT_SHAPE_FIT_NOT_MIRRORED_EVIDENCE'},{id:'xiehe-north',x:-106.47,z:-278,axis:'x',length:8,width:8,status:'OFFICIAL_PHOTOGRAPHED_UNDER_CORRIDOR_CULVERT__DIMENSIONS_FIT'},...[-149.5,-219].map(x=>({id:`wenyuan-wall-${x}`,x,z:-149,axis:'x',length:2,width:6.2,status:'OFFICIAL_POND_FEED_RELATION__UNDER_WALL_INTERFACE_MODEL_FIT'}))],
  ends:'BOUNDED_NORTHWEST_AND_SOUTHEAST_CONTINUATIONS_NOT_COMPLETE_PALACE_DRAINAGE',limitations:['No georeferenced measured plan: channel bends, widths, levels and most bridge sizes are fitted.','Wenyuan pool connection is a diagram-derived interface, not a surveyed hydraulic restoration.','Duanhong width tapers in this model; only its maximum width and length are official figures.']};cache.set(river,profile);return profile;
}
export function palaceWaterGroundPaths(river){const p=southWaterProfile(river);return p?p.waterPolygons.map(v=>path(v,true)):[innerJinshuiGroundPath(river)];}
export function palaceWaterPolygons(river){return southWaterProfile(river)?.waterPolygons??[innerJinshuiProfile(river).waterPolygon];}
function widthAt(b,t){return b.minWidth+(b.width-b.minWidth)*Math.abs(t);}
export function pointOnSouthBridge(b,x,z,r=0){const a=b.axis==='z'?z-b.z:x-b.x,c=b.axis==='z'?x-b.x:z-b.z;return Math.abs(a)+r<=b.length/2&&Math.abs(c)+r<widthAt(b,Math.max(0,(Math.abs(a)-r)/(b.length/2)))/2-.23;}
export function canCrossPalaceWater(river,position,radius=.5){if(!Number.isFinite(radius)||radius<0)throw new Error('South water radius must be non-negative');const p=southWaterProfile(river);if(!p)return canCrossInnerJinshui(river,position,radius);const{x,z}=position;if(!p.waterPolygons.some(poly=>touches(poly,x,z,radius)))return true;return p.bridges.some(b=>pointOnSouthBridge(b,x,z,radius))||canCrossInnerJinshui(river,position,radius)&&innerJinshuiProfile(river).bridges.some(b=>Math.abs(x-b.x)+radius<b.width/2-.22&&Math.abs(z-b.z)+radius<=b.length/2);}

/** Real masonry arch volumes with tapered deck widths. All walk supports are
 * bounded to the same sampled deck faces, never invisible rectangular pads. */
export function buildSouthWaterSystem(library,river,waterMaterial){
 const profile=southWaterProfile(river);if(!profile)return null;
 const group=new THREE.Group(),masonry=new THREE.Group(),water=new THREE.Group(),colliders=[],walkables=[];group.name='south-water-system';water.name='south-water-surface';
 const marble=library.material('marble'),brick=library.material('wall_brick'),stone=library.material('stone_slab');
 const mesh=(geo,mat)=>{const m=new THREE.Mesh(geo,mat);m.castShadow=m.receiveShadow=true;masonry.add(m);return m;};
 const box=(mat,w,h,d,x,y,z)=>{const m=mesh(applyBoxUV(new THREE.BoxGeometry(w,h,d),library.tileSize('marble')),mat);m.position.set(x,y,z);return m;};
 const col=(x0,y0,z0,x1,y1,z1)=>colliders.push(new THREE.Box3(new THREE.Vector3(Math.min(x0,x1),y0,Math.min(z0,z1)),new THREE.Vector3(Math.max(x0,x1),y1,Math.max(z0,z1))));
 const span=(a,b,w,h,y,mat)=>{const m=box(mat,Math.hypot(b.x-a.x,b.z-a.z),h,w,(a.x+b.x)/2,y,(a.z+b.z)/2);m.rotation.y=-Math.atan2(b.z-a.z,b.x-a.x);return m;};
 for(const reach of profile.reaches){
  mesh(flat(reach.waterPolygon,INNER_JINSHUI.bedY),stone);
  const wm=new THREE.Mesh(flat(reach.waterPolygon,INNER_JINSHUI.waterY),waterMaterial);wm.name=`water:${reach.id}`;wm.userData.isWater=true;water.add(wm);
  for(const bank of[reach.left,reach.right])for(let i=1;i<bank.length;i++){
   const a=bank[i-1],b=bank[i],mid={x:(a.x+b.x)/2,z:(a.z+b.z)/2};
   span(a,b,.55,2.48,-1.16,brick);span(a,b,.67,.1,.13,marble);
   // Arch deck meets bank: no rail/collider sealing either bridge landing.
   if(profile.bridges.some(br=>{const c=br.axis==='z'?mid.x-br.x:mid.z-br.z;const d=br.axis==='z'?mid.z-br.z:mid.x-br.x;return Math.abs(c)<br.width/2+1.65&&Math.abs(d)<br.length/2+1.2;})||profile.culverts.some(c=>Math.abs(mid.x-c.x)<c.length/2+1))continue;
   span(a,b,.2,.45,.48,marble);span(a,b,.2,.12,1.1,marble);
   box(marble,.23,1.14,.23,a.x,.75,a.z);
   col(Math.min(a.x,b.x)-.12,.18,Math.min(a.z,b.z)-.12,Math.max(a.x,b.x)+.12,1.32,Math.max(a.z,b.z)+.12);
  }
 }
 const world=(b,c,a,y)=>b.axis==='z'?new THREE.Vector3(b.x+c,y,b.z+a):new THREE.Vector3(b.x+a,y,b.z+c);
 const face=(list,a,b,c,d)=>{for(const p of[a,b,c,a,c,d])list.push(p.x,p.y,p.z);};
 const buildArch=(b,culvert=false)=>{
  const n=32,verts=[],samples=Array.from({length:n+1},(_,i)=>{const t=-1+2*i/n,a=t*b.length/2,top=culvert?.14:b.crest*(1-t*t),half=culvert?b.width/2:widthAt(b,t)/2;
   // Vault opening is elliptical in length. Ends meet the bed outside the
   // stream, the centre crown is below the walkable deck.
   const u=a/(b.length*.36),under=Math.abs(u)<1?-1.9+2.02*Math.sqrt(1-u*u):-2.4;
   return{a,top,under:Math.min(under,top-.12),half};});
  for(let i=1;i<samples.length;i++){const a=samples[i-1],c=samples[i];face(verts,world(b,-a.half,a.a,a.top),world(b,a.half,a.a,a.top),world(b,c.half,c.a,c.top),world(b,-c.half,c.a,c.top));face(verts,world(b,-c.half,c.a,c.under),world(b,c.half,c.a,c.under),world(b,a.half,a.a,a.under),world(b,-a.half,a.a,a.under));for(const s of[-1,1])face(verts,world(b,s*a.half,a.a,a.under),world(b,s*c.half,c.a,c.under),world(b,s*c.half,c.a,c.top),world(b,s*a.half,a.a,a.top));
   if(!culvert){const bounds={minX:Math.min(b.x-a.half,b.x-c.half),maxX:Math.max(b.x+a.half,b.x+c.half),minZ:b.z+a.a,maxZ:b.z+c.a};const cross0=(b.axis==='z'?b.x:b.z)-a.half+.24,cross1=(b.axis==='z'?b.x:b.z)+a.half-.24,cross2=(b.axis==='z'?b.x:b.z)-c.half+.24,cross3=(b.axis==='z'?b.x:b.z)+c.half-.24;walkables.push({type:'ramp',axis:b.axis,...(b.axis==='z'?bounds:{minX:b.x+a.a,maxX:b.x+c.a,minZ:Math.min(b.z-a.half,b.z-c.half),maxZ:Math.max(b.z+a.half,b.z+c.half)}),a0:(b.axis==='z'?b.z:b.x)+a.a,a1:(b.axis==='z'?b.z:b.x)+c.a,y0:a.top,y1:c.top,crossMin0:cross0,crossMax0:cross1,crossMin1:cross2,crossMax1:cross3,structureId:b.id});}
  }
  for(const a of[samples[0],samples.at(-1)])face(verts,world(b,-a.half,a.a,a.under),world(b,a.half,a.a,a.under),world(b,a.half,a.a,a.top),world(b,-a.half,a.a,a.top));
  if(b.axis==='z')for(let k=0;k<verts.length;k+=9)for(let j=0;j<3;j++){const v=verts[k+3+j];verts[k+3+j]=verts[k+6+j];verts[k+6+j]=v;}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.computeVertexNormals();const m=mesh(applyBoxUV(geo,library.tileSize('marble')),marble);m.userData.bridgeId=b.id;
  if(culvert)return;
  for(const side of b.railSides)for(let i=2;i<samples.length-1;i++){const a=samples[i-1],c=samples[i];if(a.a<-b.length/2+(b.railEndInset??.4)||c.a>b.length/2-(b.railEndInset??.4))continue;const pa=world(b,side*(a.half-.12),a.a,a.top),pc=world(b,side*(c.half-.12),c.a,c.top);for(const[h,off]of[[.44,.4],[.12,1.01]]){const rail=box(marble,.22,h,Math.hypot(pc.x-pa.x,pc.z-pa.z),(pa.x+pc.x)/2,(pa.y+pc.y)/2+off,(pa.z+pc.z)/2);rail.rotation.y=Math.atan2(pc.x-pa.x,pc.z-pa.z);}if(i%3===0)box(marble,.25,1.13,.25,pa.x,pa.y+.56,pa.z);col(Math.min(pa.x,pc.x)-.125,Math.min(pa.y,pc.y),Math.min(pa.z,pc.z)-.125,Math.max(pa.x,pc.x)+.125,Math.max(pa.y,pc.y)+1.13,Math.max(pa.z,pc.z)+.125);}
 };
 for(const b of profile.bridges)buildArch(b);
 // A culvert is a VAULTED TUBE along the flow, not a bridge deck arched along
 // that flow. Its two end faces surround the opening and never cap it.
 for(const c of profile.culverts){const half=c.width/2,shape=new THREE.Shape();
  shape.moveTo(-half-.55,-2.4);shape.lineTo(-half,-2.4);shape.lineTo(-half,-1.9);
  for(let i=1;i<=32;i++){const theta=Math.PI-Math.PI*i/32;shape.lineTo(half*Math.cos(theta),-1.9+1.85*Math.sin(theta));}
  shape.lineTo(half,-2.4);shape.lineTo(half+.55,-2.4);shape.lineTo(half+.55,.16);shape.lineTo(-half-.55,.16);shape.closePath();
  const geo=new THREE.ExtrudeGeometry(shape,{depth:c.length,steps:1,bevelEnabled:false});geo.rotateY(Math.PI/2);geo.translate(c.x-c.length/2,0,c.z);mesh(applyBoxUV(geo,library.tileSize('marble')),marble).userData.culvertId=c.id;
 }

 group.add(mergeByMaterial(masonry,{name:'south-water-masonry'}),water);group.userData.structure={id:profile.id,status:profile.status,bridges:profile.bridges.map(b=>b.id)};group.userData.southWater=profile;return{group,water,profile,colliders,walkables};
}
