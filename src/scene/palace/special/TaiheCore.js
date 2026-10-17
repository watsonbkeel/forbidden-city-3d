import * as THREE from 'three';
import { applyTaiheColumnResponse } from './TaiheColumnResponse.js';
import { attachTaiheColumnTextures, mapTaiheGoldSurfaces } from './TaiheColumnSurface.js';
import { appendTaiheDisplayPairs } from './TaiheDisplayPairs.js';
import { appendTaiheCaissonDetail } from './TaiheCaissonDetail.js';
import { mergeByMaterial } from '../../../utils/MergeUtils.js';
import { TAIHE_CORE as P, TAIHE_CORE_CONTRACT, TAIHE_FALLBACK_OWNER } from './TaiheCoreProfile.js';
import { taiheCeilingMaterial } from './TaiheCeilingMaterial.js';

// Self-authored simplified forms, not facsimiles of historical carving.
export function taiheGlyphMaterial(sharedTexture = null) {
  if (sharedTexture) {
    const material = new THREE.MeshStandardMaterial({ name: 'taihe_glyph_atlas', map: sharedTexture, roughness: .8, metalness: 0 });
    return material;
  }
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1024;
  const c = canvas.getContext('2d');
  c.fillStyle = '#b99644'; c.fillRect(0, 0, 1024, 1024);
  c.fillStyle = '#252015'; c.textAlign = 'center'; c.textBaseline = 'middle';
  const font = '"STKaiti","KaiTi","Kaiti SC","Songti SC","SimSun",serif';
  c.font = `bold 224px ${font}`;
  [...P.plaque.canvasLeftToRight].forEach((ch, i) => c.fillText(ch, 128 + i * 256, 192));
  for (const [text, x] of [[P.couplets.viewerRightText, 40], [P.couplets.viewerLeftText, 120]]) {
    const step = 620 / [...text].length; c.font = `${Math.floor(step * .85)}px ${font}`;
    [...text].forEach((ch, i) => c.fillText(ch, x, 394 + step * (i + .5)));
  }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshStandardMaterial({ name: 'taihe_glyph_atlas', map: texture, roughness: .8, metalness: 0 });
  let disposed = false;
  material.addEventListener('dispose', () => { if (!disposed) { disposed = true; texture.dispose(); } });
  return material;
}
function materials(b) {
  const make = (key, color, roughness, metalness=0) => b.ownMat(`taihe_${key}`, { name: `taihe_${key}`, color, roughness, metalness });
  return { gold: make('gold', 0xb79a51, .52, .55), darkGold: make('dark_gold', 0x80602d, .67, .32),
    red: make('lacquer', 0x622b22, .65), teal: make('teal', 0x31564c, .8),
    dark: make('dark_wood', 0x292a26, .65), stone: make('stone', 0x77756d, .85),
    pearl: make('pearl', 0x8e9290, .3, .6), glyph: taiheGlyphMaterial() };
}
function put(g, geo, mat, x=0, y=0, z=0, part='') { const mesh=new THREE.Mesh(geo,mat); mesh.position.set(x,y,z); mesh.userData.taihePart=part; g.add(mesh); return mesh; }
function box(g,m,w,h,d,x,y,z,part='') { return put(g,new THREE.BoxGeometry(w,h,d),m,x,y,z,part); }
function cylinder(g,m,r,h,x,y,z,n=12) { return put(g,new THREE.CylinderGeometry(r,r,h,n),m,x,y,z); }
function glyph(g,m,w,h,x,y,z,rect) {
  const geo=new THREE.PlaneGeometry(w,h),uv=geo.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,rect[0]+uv.getX(i)*(rect[2]-rect[0]),rect[1]+uv.getY(i)*(rect[3]-rect[1]));
  const mesh=put(g,geo,m,x,y,z); mesh.rotation.y=Math.PI; return mesh;
}
function tier(g,m,lower,upper,y0,y1,z,n=8) {
  const vertices=[],indices=[];
  for(const [shape,y] of [[lower,y0],[upper,y1]])for(let k=0;k<n;k++) {
    const a=k*Math.PI*2/n, r=shape.square ? shape.radius/Math.max(Math.abs(Math.cos(a)),Math.abs(Math.sin(a))) : shape.radius;
    vertices.push(r*Math.cos(a),y,z+r*Math.sin(a));
  }
  for(let k=0;k<n;k++){const j=(k+1)%n;indices.push(k,k+n,j,k+n,j+n,j);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();
  const mesh=put(g,geo,m);mesh.material.side=THREE.DoubleSide;return mesh;
}
export function buildTaiheCoreFallback(builder, parent, { x0, z0, y }) {
  const g=new THREE.Group(),m=materials(builder),d=P.dais,c=P.caisson,t=P.throne,s=P.screen;
  // Four-sided platform and shallow seven-step approach. Navigation is permanent.
  box(g,m.red,d.width,d.height,d.z1-d.z0,0,d.height/2,(d.z0+d.z1)/2);
  box(g,m.darkGold,d.width+.04,.06,d.z1-d.z0+.04,0,d.height+.03,(d.z0+d.z1)/2);
  for(let k=0;k<d.steps;k++)box(g,m.red,d.stepWidth,d.height*(k+1)/d.steps,d.stepRun,0,d.height*(k+1)/d.steps/2,d.z0-d.stepRun*(d.steps-k)+d.stepRun/2);
  for(const sign of [-1,1]) {
    box(g,m.dark,.06,d.railHeight,d.z1-d.z0,sign*(d.width/2-.12),d.height+d.railHeight/2,(d.z0+d.z1)/2);
  }
  for(const x of P.columns.x) for(const z of P.columns.goldZ) {
    cylinder(g,m.gold,P.columns.radius,P.columns.height-.2,x,(P.columns.height+.2)/2,z,12);
    cylinder(g,m.stone,P.columns.baseRadius,.2,x,.1,z,8);
  }
  box(g,m.red,1.84,.21,1.70,0,2.165,t.z-.28);
  box(g,m.darkGold,t.lowerWidth,t.lowerHeight,t.lowerDepth,0,t.baseY+t.lowerHeight/2,t.z);
  box(g,m.gold,t.seatWidth,.12,t.seatDepth,0,t.baseY+t.seatHeight-.06,t.z);
  box(g,m.teal,t.seatWidth-.12,.16,t.seatDepth-.08,0,t.baseY+.34,t.z);
  // The highest back crest is exactly the published object height above its base.
  box(g,m.gold,1.35,t.overallHeight-t.seatHeight,.12,0,t.baseY+(t.overallHeight+t.seatHeight)/2,t.z+.41);
  for(const sign of [-1,1])box(g,m.gold,.09,.48,.75,sign*.75,t.baseY+t.seatHeight+.24,t.z);
  box(g,m.darkGold,t.footstoolWidth,t.footstoolHeight,t.footstoolDepth,0,t.baseY+t.footstoolHeight/2,t.z-.83);
  for(let i=0;i<7;i++) {
    const w=s.width/7,h=s.height-(Math.abs(i-3)*.33),x=(i-3)*w;
    box(g,m.red,w-.015,h,s.depth,x,s.baseY+h/2,s.z);
    box(g,m.darkGold,w-.09,h-.22,.025,x,s.baseY+h/2,s.z-s.depth/2-.016);
  }
  // Upward recess, all geometry below the retained roof underside.
  const outer=c.nominalSpan/2;
  for(const sign of [-1,1]) {box(g,m.darkGold,c.nominalSpan,.12,.16,0,c.rimY+.06,c.z+sign*(outer-.08));box(g,m.darkGold,.16,.12,c.nominalSpan-.32,sign*(outer-.08),c.rimY+.06,c.z);}
  // The three approximate ramps are replaced by the bounded generated shell below.
  // Retain their existing shared-material side state; new shell winding is independently tested.
  m.gold.side=THREE.DoubleSide;m.darkGold.side=THREE.DoubleSide;
  const cap=put(g,new THREE.CircleGeometry(1.12,8),m.darkGold,0,c.topY-.03,c.z);cap.rotation.x=Math.PI/2;
  put(g,new THREE.OctahedronGeometry(c.sphereRadius),m.pearl,0,c.sphereY,c.z);
  for(let k=0;k<6;k++){const a=k*Math.PI/3;put(g,new THREE.OctahedronGeometry(c.satelliteRadius),m.pearl,Math.cos(a)*c.satelliteRing,c.sphereY+.2,c.z+Math.sin(a)*c.satelliteRing);}
  // South-facing native text atlas; no downloaded imagery/font is embedded.
  const p=P.plaque,q=P.couplets;
  box(g,m.dark,p.width,p.height,.16,0,p.bottomY+p.height/2,p.z);
  glyph(g,m.glyph,p.width-.18,p.height-.18,0,p.bottomY+p.height/2,p.z-.081,[0,.625,1,1]);
  for(const [x,rect] of [[q.viewerRightX,[0,0,.078125,.625]],[-q.viewerRightX,[.078125,0,.15625,.625]]]) {
    box(g,m.dark,q.width,q.height,.14,x,q.bottomY+q.height/2,q.z);
    glyph(g,m.glyph,q.width-.12,q.height-.12,x,q.bottomY+q.height/2,q.z-.071,rect);
  }
  appendTaiheDisplayPairs(g,m);
  appendTaiheCaissonDetail(g,m);
  const merged=mergeByMaterial(g,{castShadow:false,receiveShadow:true,name:'taihe-core-fallback'});
  mapTaiheGoldSurfaces(merged);
  attachTaiheColumnTextures(m.gold);
  merged.traverse(applyTaiheColumnResponse);
  // Mark meshes, not a parent group: the shared batcher must preserve only these owners.
  for(const mesh of [...merged.children]) {mesh.userData.noMerge=true;mesh.userData.taiheCoreOwner=TAIHE_FALLBACK_OWNER;mesh.userData.taiheCoreContract={...TAIHE_CORE_CONTRACT};mesh.position.add(new THREE.Vector3(x0,y,z0));parent.add(mesh);}
  builder.ownedMaterials.push(m.glyph);
}
export function buildTaiheCeiling(builder,g,{x0,z0,y,w,d}) {
  const h=P.caisson.nominalSpan/2,cz=P.caisson.z,regions=[[-w/2,-d/2,-h,d/2],[h,-d/2,w/2,d/2],[-h,-d/2,h,cz-h],[-h,cz+h,h,d/2]];
  for(const [a,b,c,e] of regions) {const geo=new THREE.PlaneGeometry(c-a,e-b);geo.rotateX(Math.PI/2);const uv=geo.attributes.uv,pos=geo.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,(pos.getX(i)+(a+c)/2)/1.6,(pos.getZ(i)+(b+e)/2)/1.6);const mesh=put(g,geo,taiheCeilingMaterial(builder),x0+(a+c)/2,y+P.ceilingY,z0+(b+e)/2,'ceiling-opening');mesh.userData.taihePermanent='ceiling';}
}
export function buildTaiheNavigation(builder,{x0,z0,y}) {
  const d=P.dais;
  for(const x of P.columns.x)for(const z of P.columns.goldZ){const r=Math.max(P.columns.clearanceRadius,P.columns.baseRadius);builder.col(x0+x-r,y,z0+z-r,x0+x+r,y+P.columns.height,z0+z+r);}
  // Platform is a closed exhibition support, not a route through the throne.
  builder.col(x0-d.width/2,y,z0+d.z0,x0+d.width/2,y+4,z0+d.z1);
  for(let k=0;k<d.steps;k++){const za=z0+d.z0-d.stepRun*(d.steps-k);builder.walkables.push({type:'box',rescue:false,box:new THREE.Box3(new THREE.Vector3(x0-d.stepWidth/2,y,za),new THREE.Vector3(x0+d.stepWidth/2,y+d.height*(k+1)/d.steps,za+d.stepRun))});}
  for(const sign of [-1,1]){const a=sign*(d.stepWidth/2),b=sign*(d.stepWidth/2+.12);builder.col(x0+a,y,z0+d.z0-d.steps*d.stepRun,x0+b,y+1,z0+d.z0);}
}
