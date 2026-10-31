import {bridge2ContactOwner,addBridge2Caps} from './InnerJinshuiBridge2Contact.js';
import * as THREE from 'three';
import { JINSHUI_BRIDGES, JINSHUI_BRIDGE_LENGTH } from '../river.js';
import { applyBoxUV } from '../../../utils/GeometryUV.js';
import { mergeByMaterial } from '../../../utils/MergeUtils.js';

/** Official sources establish a south-bowed river and five marble arch bridges.
 * Every metric below is a bounded model fit, not a surveyed river/bridge size.
 * The five existing anchor crossings and individually editable widths survive.
 * The first-entry reach ends before the side-gateway ramp toes; its ends are
 * open modelling boundaries, not masonry dams or a complete palace waterway.
 */
export const INNER_JINSHUI = Object.freeze({
  status: 'OFFICIAL_TOPOLOGY_MODEL_FIT_NOT_SURVEYED',
  reachHalfWidth: 76, bankThickness: .55, bankCapY: .08,
  waterY: -1.1, bedY: -2.4, bridgeCrest: .9,
  vaultCrownY: .36, vaultSpringY: -1.9,
  deckSegments: 24, bankSampleStep: 2,
  railThickness: .22, railHeight: 1.02, bridgeRailEndInset: 1,
  sources: Object.freeze([
    Object.freeze({url:'https://www.dpm.org.cn/explore/building/236439.html',use:'West–east meander; five bridges, not surveyed dimensions'}),
    Object.freeze({url:'https://www.dpm.org.cn/architectural_art/246281.html',use:'Five white-marble arch bridges'}),
    Object.freeze({url:'https://img.dpm.org.cn/Uploads/Picture/2018/01/18/s5a6079fc517e1.jpg',use:'South-facing entry photograph: bow, banks and actual arch openings'}),
    Object.freeze({url:'https://img.dpm.org.cn/static/themes/image/xf/map3.jpg',use:'Official Visit diagram: south-bowed centre and north-turning shoulders; not a measured plan'}),
  ]),
});
const P = INNER_JINSHUI;
const profileCache = new WeakMap();
const smooth = t => { t = Math.max(0, Math.min(1, t)); return t*t*(3-2*t); };
function section(x) {
  const a = Math.abs(x);
  return {
    center: a <= 32 ? .00065*a*a : .00065*32*32+(20-.00065*32*32)*smooth((a-32)/44),
    halfWidth: 7.5-2.5*smooth((a-38)/38),
  };
}
function atX(points, x) {
  if (x <= points[0].x) return points[0].z;
  for (let i=1; i<points.length; i++) if (x <= points[i].x) {
    const a=points[i-1], b=points[i], t=(x-a.x)/(b.x-a.x);
    return a.z+(b.z-a.z)*t;
  }
  return points.at(-1).z;
}
function bounds(points) {
  return {minX:Math.min(...points.map(p=>p.x)),maxX:Math.max(...points.map(p=>p.x)),
    minZ:Math.min(...points.map(p=>p.z)),maxZ:Math.max(...points.map(p=>p.z))};
}

/** Immutable Layout entries are cached. All public profile coordinates are
 * world X/Z; meshes use the same profile translated into one local group. */
export function innerJinshuiProfile(river) {
  if (profileCache.has(river)) return profileCache.get(river);
  const x=river?.position?.x, z=river?.position?.z;
  if (!Number.isFinite(x)||!Number.isFinite(z)) throw new Error('Inner Jinshui requires finite world x/z anchors');
  const entries=river.bridges??JINSHUI_BRIDGES;
  if(entries.length!==5)throw new Error('Inner Jinshui first-entry reach requires five bridge entries');
  const bridges=entries.map((b,i)=>{
    const length=b.length??JINSHUI_BRIDGE_LENGTH;
    if(!Number.isFinite(b.dx)||!Number.isFinite(b.width)||b.width<2||b.width>12||!Number.isFinite(length)||length<18||length>30)
      throw new Error('Invalid fitted Inner Jinshui bridge width, run or anchor');
    return {id:`inner-jinshui:bridge-${i+1}`,x:x+b.dx,z,width:b.width,length,
      minZ:z-length/2,maxZ:z+length/2,railX:b.width/2-.11,
      dimensionStatus:'RETAINED_INDEPENDENT_MODEL_FIT_NOT_SURVEYED'};
  });
  const xs=new Set();
  for(let lx=-P.reachHalfWidth;lx<=P.reachHalfWidth;lx+=P.bankSampleStep)xs.add(lx);
  // Put rail-gap edges into the SAME sampled polygon, so bank geometry cannot
  // cross a bridge entrance merely because it falls inside a sampling cell.
  for(const b of bridges)for(const s of [-1,1])xs.add(b.x-x+s*(b.width/2+.16));
  const samples=[...xs].sort((a,b)=>a-b).map(lx=>({x:x+lx,...section(lx)}));
  const north=samples.map(s=>({x:s.x,z:z+s.center+s.halfWidth}));
  const south=samples.map(s=>({x:s.x,z:z+s.center-s.halfWidth}));
  for(const b of bridges){
    const left=b.x-b.width/2,right=b.x+b.width/2;
    const inWidth=[left,right,...samples.filter(s=>s.x>left&&s.x<right).map(s=>s.x)];
    b.opening=[Math.min(...inWidth.map(v=>atX(south,v)))-.03,Math.max(...inWidth.map(v=>atX(north,v)))+.03];
    if(b.opening[0]-b.minZ<1||b.maxZ-b.opening[1]<1)throw new Error('Fitted bridge run does not span both banks with landing overlap');
    b.deck=Array.from({length:P.deckSegments+1},(_,i)=>{
      const dz=-b.length/2+b.length*i/P.deckSegments;
      return {z:b.z+dz,y:P.bridgeCrest*(1-(2*dz/b.length)**2)};
    });
  }
  const waterPolygon=[...south,...north.slice().reverse()];
  const result={id:'inner-jinshui:first-entry',status:P.status,origin:{x,z},sources:P.sources,
    banks:{north,south},waterPolygon,bounds:bounds(waterPolygon),bridges,
    ends:'OPEN_MODEL_BOUNDARIES_NOT_COMPLETE_WATER_SYSTEM',
    limitations:['Diagrammatic bow fit; bank plan, vault rise, water level and rail detail are not measured.',
      'The western/eastern continuations and junctions at the side gateways are outside this bounded reach.',
      'Retained equal bridge widths are independently configurable, not a claim of equal historical dimensions.']};
  profileCache.set(river,result);return result;
}

function planPath(points, hole=false) {
  const shape=hole?new THREE.Path():new THREE.Shape();
  points.forEach((p,i)=>shape[i?'lineTo':'moveTo'](p.x,-p.z));shape.closePath();return shape;
}
export function innerJinshuiGroundPath(river) { return planPath(innerJinshuiProfile(river).waterPolygon,true); }

/** Split the decorative axial road around this interval as well as cutting
 * the main ground. Otherwise a y=.01 road sheet seals the true arch opening. */
export function innerJinshuiRoadGap(river, halfWidth=4) {
  const p=innerJinshuiProfile(river),left=-halfWidth,right=halfWidth;
  if(p.bounds.maxX<left||p.bounds.minX>right)return null;
  const xs=[Math.max(left,p.bounds.minX),Math.min(right,p.bounds.maxX),
    ...p.banks.north.filter(v=>v.x>left&&v.x<right).map(v=>v.x)];
  return {minZ:Math.min(...xs.map(x=>atX(p.banks.south,x))),maxZ:Math.max(...xs.map(x=>atX(p.banks.north,x)))};
}
function pointInPolygon(points,x,z) {
  let inside=false;
  for(let i=0,j=points.length-1;i<points.length;j=i++){
    const a=points[i],b=points[j];
    if(((a.z>z)!==(b.z>z))&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)inside=!inside;
  }
  return inside;
}
function segmentTouchesBox(a,b,minX,maxX,minZ,maxZ) {
  let lo=0,hi=1;
  for(const [start,delta,min,max] of [[a.x,b.x-a.x,minX,maxX],[a.z,b.z-a.z,minZ,maxZ]]){
    if(Math.abs(delta)<1e-12){if(start<min||start>max)return false;continue;}
    const ta=(min-start)/delta,tb=(max-start)/delta;lo=Math.max(lo,Math.min(ta,tb));hi=Math.min(hi,Math.max(ta,tb));
    if(lo>hi)return false;
  }
  return true;
}
function footprintTouchesWater(p,x,z,r) {
  const minX=x-r,maxX=x+r,minZ=z-r,maxZ=z+r,b=p.bounds;
  if(maxX<b.minX||minX>b.maxX||maxZ<b.minZ||minZ>b.maxZ)return false;
  if(pointInPolygon(p.waterPolygon,x,z))return true;
  for(const xx of [minX,maxX])for(const zz of [minZ,maxZ])if(pointInPolygon(p.waterPolygon,xx,zz))return true;
  return p.waterPolygon.some((a,i)=>segmentTouchesBox(a,p.waterPolygon[(i+1)%p.waterPolygon.length],minX,maxX,minZ,maxZ));
}
/** Same sampled polygon as water and ground. Radius uses the production
 * player's square XZ footprint; bridges only exempt their bounded decks. */
export function canCrossInnerJinshui(river,position,radius=.5) {
  if(!Number.isFinite(radius)||radius<0)throw new Error('Inner Jinshui footprint radius must be non-negative');
  const p=innerJinshuiProfile(river),{x,z}=position;
  if(!footprintTouchesWater(p,x,z,radius))return true;
  return p.bridges.some(b=>Math.abs(x-b.x)+radius<b.width/2-P.railThickness &&
    z-radius>=b.minZ&&z+radius<=b.maxZ);
}

function extrudeYZ(points,width,x0,tile) {
  const shape=new THREE.Shape();points.forEach((p,i)=>shape[i?'lineTo':'moveTo'](-p.z,p.y));shape.closePath();
  const geo=new THREE.ExtrudeGeometry(shape,{depth:width,steps:1,bevelEnabled:false,curveSegments:1});
  geo.rotateY(Math.PI/2);geo.translate(x0,0,0);return applyBoxUV(geo,tile);
}
function flatPlan(points,y,tile) {
  const geo=new THREE.ShapeGeometry(planPath(points));geo.rotateX(-Math.PI/2);geo.translate(0,y,0);
  const uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/tile,uv.getY(i)/tile);return geo;
}
function ribbonPlan(inner,sign,width,bottom,top,tile) {
  const outer=inner.map(p=>({x:p.x,z:p.z+sign*width}));
  const shape=planPath([...inner,...outer.reverse()]);
  const geo=new THREE.ExtrudeGeometry(shape,{depth:top-bottom,steps:1,bevelEnabled:false,curveSegments:1});
  geo.rotateX(-Math.PI/2);geo.translate(0,bottom,0);return applyBoxUV(geo,tile);
}
function deckAt(b,z) {
  for(let i=1;i<b.deck.length;i++)if(z<=b.deck[i].z){const a=b.deck[i-1],c=b.deck[i],t=(z-a.z)/(c.z-a.z);return a.y+(c.y-a.y)*t;}
  return 0;
}

/** Returns a normally disposable merged Group, world colliders/walkables, and
 * the shared shape profile. Materials remain owned by library/PalaceBuilder.
 * The caller must REPLACE the old buildRiver body, never add both builders. */
export function buildInnerJinshui(library,river,waterMaterial) {
  if(!waterMaterial?.isMaterial)throw new Error('Inner Jinshui requires the caller-owned water material');
  const profile=innerJinshuiProfile(river),{x:ox,z:oz}=profile.origin;
  const local=point=>({x:point.x-ox,z:point.z-oz});
  const root=new THREE.Group();root.name='金水河';root.position.set(ox,0,oz);
  const masonry=new THREE.Group();masonry.name='inner-jinshui-masonry';
  const colliders=[],walkables=[];
  const precise=bridge2ContactOwner(colliders,ox,oz),caps=[];
  const marble=library.material('marble'),brick=library.material('wall_brick'),stone=library.material('stone_slab');
  const tile=name=>library.tileSize(name);
  const mesh=(geo,mat)=>{const m=new THREE.Mesh(geo,mat);m.castShadow=m.receiveShadow=true;masonry.add(m);return m;};
  const box=(mat,w,h,d,x,y,z)=>{const m=mesh(applyBoxUV(new THREE.BoxGeometry(w,h,d),tile('marble')),mat);m.position.set(x,y,z);return m;};
  const col=(x0,y0,z0,x1,y1,z1)=>colliders.push(new THREE.Box3(new THREE.Vector3(Math.min(x0,x1)+ox,y0,Math.min(z0,z1)+oz),new THREE.Vector3(Math.max(x0,x1)+ox,y1,Math.max(z0,z1)+oz)));
  mesh(flatPlan(profile.waterPolygon.map(local),P.bedY,tile('stone_slab')),stone);
  for(const [name,sign] of [['north',1],['south',-1]]){
    const bank=profile.banks[name].map(local);
    mesh(ribbonPlan(bank,sign,P.bankThickness,P.bedY,P.bankCapY,tile('wall_brick')),brick);
    mesh(ribbonPlan(bank,sign,P.bankThickness+.12,P.bankCapY,P.bankCapY+.1,tile('marble')),marble);
    for(let i=1;i<bank.length;i++){
      const a=bank[i-1],b=bank[i],middle=(a.x+b.x)/2;
      if(profile.bridges.some(br=>Math.abs(middle-(br.x-ox))<br.width/2+.16))continue;
      const az=a.z+sign*.3,bz=b.z+sign*.3,dx=b.x-a.x,dz=bz-az,len=Math.hypot(dx,dz),angle=-Math.atan2(dz,dx);
      for(const [h,y] of [[.45,.485],[.12,1.1]]){const rail=box(marble,len,h,P.railThickness,middle,y,(az+bz)/2);rail.rotation.y=angle;}
      box(marble,.24,1.14,.24,a.x,.75,az);
      col(a.x-.12,.18,Math.min(az,bz)-.12,b.x+.12,1.32,Math.max(az,bz)+.12);
    }
  }
  for(const worldBridge of profile.bridges){
    const b={...worldBridge,x:worldBridge.x-ox,z:worldBridge.z-oz,minZ:worldBridge.minZ-oz,maxZ:worldBridge.maxZ-oz,
      opening:worldBridge.opening.map(z=>z-oz),deck:worldBridge.deck.map(v=>({z:v.z-oz,y:v.y}))};
    const [south,north]=b.opening,center=(south+north)/2,half=(north-south)/2;
    // A closed stone cross-section surrounds an actual open underside; there
    // is no opaque bridge box or black semi-circle pretending to be an arch.
    const sectionPoints=[...b.deck,{z:b.maxZ,y:P.bedY},{z:north,y:P.bedY},{z:north,y:P.vaultSpringY}];
    for(let i=1;i<=P.deckSegments;i++){
      const theta=Math.PI*i/P.deckSegments;
      sectionPoints.push({z:center+half*Math.cos(theta),y:P.vaultSpringY+(P.vaultCrownY-P.vaultSpringY)*Math.sin(theta)});
    }
    sectionPoints.push({z:south,y:P.bedY},{z:b.minZ,y:P.bedY});
    mesh(extrudeYZ(sectionPoints,b.width,b.x-b.width/2,tile('marble')),marble);
    const railMin=b.minZ+P.bridgeRailEndInset,railMax=b.maxZ-P.bridgeRailEndInset;
    const railPoints=[{z:railMin,y:deckAt(b,railMin)},...b.deck.filter(v=>v.z>railMin&&v.z<railMax),{z:railMax,y:deckAt(b,railMax)}];
    for(const s of [-1,1]){
      const rx=b.x+s*b.railX;
      for(const [low,high] of [[.14,.65],[.92,1.04]]){
        const band=[...railPoints.map(v=>({z:v.z,y:v.y+low})),...railPoints.slice().reverse().map(v=>({z:v.z,y:v.y+high}))];
        const rail=mesh(extrudeYZ(band,P.railThickness,rx-P.railThickness/2,tile('marble')),marble);
        if(b.id==='inner-jinshui:bridge-2')precise(rail,`band:${s}:${low}`);
      }
      for(let i=0;i<=10;i++){const z=railMin+(railMax-railMin)*i/10,y=deckAt(b,z);const shaft=box(marble,.26,1.17,.26,rx,y+.585,z);if(b.id==='inner-jinshui:bridge-2'){precise(shaft,`shaft:${s}:${i}`);caps.push({x:rx,y:y+1.17,z});}}
      for(let i=1;i<railPoints.length;i++){
        const a=railPoints[i-1],c=railPoints[i];
        if(b.id!=='inner-jinshui:bridge-2')col(rx-.13,Math.min(a.y,c.y),a.z,rx+.13,Math.max(a.y,c.y)+1.17,c.z);
      }
    }
    for(let i=1;i<b.deck.length;i++){
      const a=b.deck[i-1],c=b.deck[i];
      walkables.push({type:'ramp',axis:'z',minX:worldBridge.x-b.width/2+.24,maxX:worldBridge.x+b.width/2-.24,
        minZ:a.z+oz,maxZ:c.z+oz,a0:a.z+oz,a1:c.z+oz,y0:a.y,y1:c.y,structureId:b.id});
    }
  }
  root.add(mergeByMaterial(masonry,{name:'inner-jinshui-masonry'}));
  addBridge2Caps(root,marble,caps,colliders,ox,oz);
  const water=new THREE.Mesh(flatPlan(profile.waterPolygon.map(local),P.waterY,1),waterMaterial);
  water.name='inner-jinshui-water';water.userData.isWater=true;water.receiveShadow=true;root.add(water);
  root.userData.structure={id:profile.id,status:profile.status,bridgeCount:5,ends:profile.ends};
  root.userData.innerJinshui=profile;
  return {group:root,water,profile,colliders,walkables};
}
