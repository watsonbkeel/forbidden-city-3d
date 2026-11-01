import * as THREE from 'three';

const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-6;
const SOURCE='https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efefc7fb9a3d.jpg';

/** One photographed south-facing end bay only. No navigation or door changes.
 * The two original south triangles are the explicit preservation exception.
 * All five other wall faces are copied attribute-for-attribute, not regenerated.
 * Rejected/unmarked/modified instances return false before resource allocation.
 */
export function applyWenhuaGateSouthWindows(kit,frame) {
  const g=frame?.userData.structure;
  if(!g||g.id!=='south-gate:wenhua'||g.profile!=='wenhua'||g.name!=='文华门'||g.wenhuaSouthWindow||
    !near(g.x,-186.3)||!near(g.z,-245.2)||!near(g.w,33.1)||!near(g.d,17)||!near(g.ph,.8)||!near(g.colH,6.5)||
    frame.parent!==kit?.root||!near(frame.position.x,g.x)||!near(frame.position.y,0)||!near(frame.position.z,g.z)||
    frame.rotation.x||frame.rotation.y||frame.rotation.z||!frame.scale.equals(new THREE.Vector3(1,1,1)))return false;
  const all=[];kit.root.traverse(m=>{if(m.isMesh)all.push(m);});
  const candidates=frame.children.filter(m=>m.isMesh&&near(m.position.x,-13.24)&&near(m.position.y,4.05)&&near(m.position.z,0));
  if(candidates.length!==1)return false;
  const old=candidates[0],geometry=old.geometry,a=geometry?.attributes,count=geometry?.index?.count??a?.position?.count;
  if(old.material!==kit.lib.material('wall_red')||old.isInstancedMesh||old.isSkinnedMesh||!old.visible||!old.castShadow||!old.receiveShadow||
    old.rotation.x||old.rotation.y||old.rotation.z||!old.scale.equals(new THREE.Vector3(1,1,1))||count!==36||
    Object.keys(a??{}).sort().join()!=='normal,position,uv'||Object.values(a).some(v=>v.isInterleavedBufferAttribute||v.normalized)||
    Object.keys(geometry.morphAttributes).length||geometry.drawRange.start!==0||(geometry.drawRange.count!==Infinity&&geometry.drawRange.count!==count)||
    all.some(m=>m!==old&&m.geometry===geometry))return false;
  const tile=kit.lib.tileSize('wall_red');
  if(!Number.isFinite(tile)||tile<=0)return false;
  const keep=[],front=[],faces=new Map();
  for(let i=0;i<count;i+=3){
    const ids=[0,1,2].map(j=>geometry.index?geometry.index.getX(i+j):i+j);
    const points=ids.map(j=>new THREE.Vector3().fromBufferAttribute(a.position,j));
    const cross=points[1].clone().sub(points[0]).cross(points[2].clone().sub(points[0]));
    if(cross.lengthSq()<1e-12)return false;cross.normalize();
    const faceKey=cross.toArray().map(v=>Math.round(v)).join(),face=faces.get(faceKey)??{triangles:0,vertices:new Set()};face.triangles++;faces.set(faceKey,face);
    for(const j of ids){
      if(!Object.values(a).every(v=>Array.from(v.array.subarray(j*v.itemSize,(j+1)*v.itemSize)).every(Number.isFinite)))return false;
      const n=new THREE.Vector3().fromBufferAttribute(a.normal,j),p=new THREE.Vector3().fromBufferAttribute(a.position,j);
      face.vertices.add(p.toArray().join());
      const axis=Math.abs(n.y)>.9?'y':Math.abs(n.x)>.9?'x':'z';
      const u=axis==='y'?p.x:axis==='x'?p.z*Math.sign(n.x):p.x*Math.sign(n.z),v=axis==='y'?p.z:p.y;
      if(!near(a.uv.getX(j),u/tile)||!near(a.uv.getY(j),v/tile))return false;
      if(cross.dot(n)<.999999||!near(Math.abs(p.x),2.81)||!near(Math.abs(p.y),3.25)||!near(Math.abs(p.z),.3))return false;
      if(![0,1,2].some(k=>near(Math.abs(n.getComponent(k)),1)&&near(p.getComponent(k)*n.getComponent(k),[2.81,3.25,.3][k])))return false;
    }
    (ids.every(j=>a.normal.getZ(j)<-.99999)?front:keep).push(...ids);
  }
  if(front.length!==6||keep.length!==30||faces.size!==6||[...faces.values()].some(f=>f.triangles!==2||f.vertices.size!==4))return false;

  const body={position:[],normal:[],uv:[]};
  for(const key of Object.keys(body))for(const j of keep)body[key].push(...a[key].array.subarray(j*a[key].itemSize,(j+1)*a[key].itemSize));
  // Disjoint coplanar red margins use the retained original UV mapping. They
  // never cover the recessed window or stone body and do not duplicate a skin.
  for(const rect of [[-2.81,-2.61,-3.25,3.25],[2.61,2.81,-3.25,3.25],[-2.61,2.61,2.90,3.25]]){
    const [x0,x1,y0,y1]=rect;
    for(const [x,y]of [[x0,y0],[x0,y1],[x1,y1],[x0,y0],[x1,y1],[x1,y0]]){body.position.push(x,y,-.3);body.normal.push(0,0,-1);body.uv.push(-x/tile,y/tile);}
  }
  const replacement=new THREE.BufferGeometry();
  for(const [key,values]of Object.entries(body))replacement.setAttribute(key,new THREE.Float32BufferAttribute(values,key==='uv'?2:3));
  replacement.computeBoundingBox();replacement.computeBoundingSphere();
  const makeMaterial=(name,color,roughness)=>{const m=new THREE.MeshStandardMaterial({name,color,roughness,metalness:0});kit.owned.push(m);return m;};
  const red=makeMaterial('wenhua_gate_red_frame',0x8e3327,.82),stone=makeMaterial('wenhua_gate_pale_sill',0xbab3a3,.96),dark=makeMaterial('wenhua_gate_closed_recess',0x352b25,.98);
  const meta={objectId:'FC-5652FA389B',source:SOURCE,photographyDate:null,status:'VERIFY_PENDING',accepted:false,
    scope:'PHOTO_RIGHT_END_BAY_SOUTH_ONLY',dimensionStatus:'REVERSIBLE_PHOTO_FIT_NOT_SURVEYED',
    unknown:'Fine grille repeat-unit topology/count, full joined band widths, window-leaf count and material identity behind grille; no copied template.',
    remainingVisualDifferences:'Fine red crossed grille is a bounded visual fit; exact repeat motif/count, joints and occluded leaves remain unverified.',
    oldGeometryException:'Only two original south-facing skin triangles removed; five other faces retained exactly.',
    localBounds:{min:[-16.05,.8,-.3],max:[-10.43,7.3,.3]},stoneTop:2.66,frameTop:6.95,
    closedWindowNotPassage:true};
  const box=(role,mat,w,h,d,x,y,z,omitBottom=false)=>{
    let geo=new THREE.BoxGeometry(w,h,d);
    if(omitBottom){const ids=[];for(let i=0;i<geo.index.count;i+=3){const tri=[0,1,2].map(j=>geo.index.getX(i+j));if(!tri.every(j=>geo.attributes.normal.getY(j)<-.999))ids.push(...tri);}geo.setIndex(ids);}
    const m=kit.mesh(frame,geo,mat,x,y,z);m.name='wenhua-gate-south-'+role;m.userData.wenhuaGateSouthWindow={...meta,role};return m;
  };
  // All finite solids stay INSIDE the unchanged original wall collider. The
  // stone body's bottom is omitted because the unchanged wall bottom owns it.
  box('stone-lower-body',stone,5.22,1.70,.16,-13.24,1.65,-.20,true);
  box('stone-cap',stone,5.22,.16,.18,-13.24,2.58,-.21);
  const x0=-15.85,x1=-10.63,y0=2.66,y1=6.95,t=.16;
  for(const x of[x0+t/2,x1-t/2])box('red-frame',red,t,y1-y0,.18,x,(y0+y1)/2,-.21);
  for(const y of[y0+t/2,y1-t/2])box('red-frame',red,x1-x0-2*t,t,.18,(x0+x1)/2,y,-.21);
  box('closed-recess',dark,x1-x0-2*t,y1-y0-2*t,.02,(x0+x1)/2,(y0+y1)/2,-.11);
  // Tiny returns close the 2 cm stone recess at each red margin, without an
  // added outside projection or guessed decorative moulding.
  for(const x of[x0,x1])box('stone-edge-return',stone,.02,1.70,.02,x+(x===x0?.01:-.01),1.65,-.29,true);
  // Source pixels are conservative visible red CORES, not the full blurred/
  // joined bands. The right photographic bound is partly tree-obscured. These
  // normalized FIT controls do not establish historical dimensions or leaves.
  const fit={status:'PHOTO_FIT_NOT_SURVEYED',imageSize:[1000,666],fitSpanPx:[768,872],
    spanBoundsPx:[[768,774],[869,876]],centersPx:[792,819,845],centerTolerancePx:2,
    coreWidthsPx:[4,4,3],coreWidthBoundsPx:[[3,5],[3,5],[2,4]],
    widthMeaning:'Conservative visible red cores; broader joined/blurred band widths remain unknown.',
    rightBoundConfidence:'LOW_TREE_OCCLUDED',fineGridModeled:true,windowLeafCount:null};
  const span=fit.fitSpanPx[1]-fit.fitSpanPx[0],innerWidth=x1-x0-2*t;
  fit.normalizedCenters=fit.centersPx.map(p=>(p-fit.fitSpanPx[0])/span);
  fit.normalizedCoreWidths=fit.coreWidthsPx.map(p=>p/span);
  meta.majorDivisions=fit;
  for(let i=0;i<fit.centersPx.length;i++){
    const m=box('red-major-division',red,innerWidth*fit.normalizedCoreWidths[i],y1-y0-2*t,.16,
      x1-t-innerWidth*fit.normalizedCenters[i],(y0+y1)/2,-.20);
    // Retained rail triangles close both ends, and the existing opaque plane
    // closes the back. Omit duplicate contact faces, not the visible extrusion.
    const geo=m.geometry,ids=[];
    for(let k=0;k<geo.index.count;k+=3){const tri=[0,1,2].map(j=>geo.index.getX(k+j));
      if(tri.every(j=>Math.abs(geo.attributes.normal.getY(j))<.5&&geo.attributes.normal.getZ(j)<.5))ids.push(...tri);}
    geo.setIndex(ids);m.userData.wenhuaGateSouthWindow.sourceDivisionIndex=i;
  }
  // Photograph shows repeated fine crossed red work, not blank dark panes.
  // Fit a readable diamond rhythm INSIDE the existing four apertures; this is
  // not a claim about the exact traditional motif, repeat count or leaf count.
  const cores=fit.normalizedCenters.map((c,i)=>({x:x1-t-innerWidth*c,w:innerWidth*fit.normalizedCoreWidths[i]})).sort((a,b)=>a.x-b.x);
  const gaps=[];let left=x0+t;
  for(const core of cores){gaps.push([left,core.x-core.w/2]);left=core.x+core.w/2;}
  gaps.push([left,x1-t]);
  for(let pane=0;pane<gaps.length;pane++){
    const [lo,hi]=gaps[pane],inset=.035,xa=lo+inset,xb=hi-inset,ya=y0+t+inset,yb=y1-t-inset;
    const w=xb-xa,h=yb-ya,slope=h/(4*w),step=h/8;
    for(const sign of [-1,1])for(let k=-2;k<=10;k++){
      const b=k*step,m=sign*slope;
      const ax=Math.max(0,Math.min(-b/m,(h-b)/m)),bx=Math.min(w,Math.max(-b/m,(h-b)/m));
      if(bx-ax<1e-8)continue;
      const ay=m*ax+b,by=m*bx+b,dx=bx-ax,dy=by-ay,len=Math.hypot(dx,dy);
      const bar=box('red-fine-grille',red,len,.028,.055,xa+(ax+bx)/2,ya+(ay+by)/2,-.235);
      bar.rotation.z=Math.atan2(dy,dx);bar.userData.wenhuaGateSouthWindow.pane=pane;
    }
  }
  meta.fineGrille={status:'PHOTO_REASONABLE_FIT_NOT_SURVEYED',pattern:'CROSSED_DIAGONAL_RHYTHM',repeatCountVerified:false,thickness:.028,panes:4};
  old.geometry=replacement;geometry.dispose();
  g.wenhuaSouthWindow=meta;
  return true;
}
