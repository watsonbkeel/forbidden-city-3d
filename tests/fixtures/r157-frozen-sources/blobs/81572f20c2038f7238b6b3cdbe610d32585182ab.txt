import * as THREE from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';

// Topology is museum-attested; every numerical fit below is model-space, not survey.
export const LINXI_BRIDGE_POOL = Object.freeze({
  x:259.2, z:46.7, width:20, depth:9, bridgeWidth:9.6, bridgeDepth:9,
  deckY:.5, bedY:-1.15, waterY:-.55, archSpan:6, archSpring:-.72,
  archCrown:.10, archTop:.46, segments:32, bankThickness:.24,
});
export function linxiPoolGroundPath() {
  const p=LINXI_BRIDGE_POOL, path=new THREE.Path();
  for (const [i,[x,z]] of [[p.x-p.width/2,p.z-p.depth/2],[p.x-p.width/2,p.z+p.depth/2],
    [p.x+p.width/2,p.z+p.depth/2],[p.x+p.width/2,p.z-p.depth/2]].entries()) path[i?'lineTo':'moveTo'](x,-z);
  path.closePath();
  return path;
}
/** Same non-swimmable-water policy as the palace rivers, bounded to this pool.
 * Height does not grant a walking/jumping route over water; no hidden solid is added.
 */
export function canCrossLinxiPool(position,radius=.5) {
  if(!Number.isFinite(radius)||radius<0)throw Error('Linxi pool radius must be finite and non-negative');
  const p=LINXI_BRIDGE_POOL,x=position.x-p.x,z=position.z-p.z;
  for(const [lo,hi] of [[-p.width/2,-p.bridgeWidth/2],[p.bridgeWidth/2,p.width/2]]) {
    const dx=Math.max(lo-x,0,x-hi),dz=Math.max(-p.depth/2-z,0,z-p.depth/2);
    if((dx===0&&dz===0)||(dx*dx+dz*dz<radius*radius-1e-10))return false;
  }
  return true;
}
function profileExtrusion(shape,depth,x) {
  const geometry=new THREE.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:false,curveSegments:1});
  geometry.rotateY(Math.PI/2);geometry.translate(x,0,0);
  return geometry;
}
function isOldPlinth(m,kit) {
  if(!m.isMesh||m.material!==kit.lib.material('wall_brick')||!m.position.equals(new THREE.Vector3(0,.25,0))||
    m.rotation.x!==0||m.rotation.y!==0||m.rotation.z!==0||!m.scale.equals(new THREE.Vector3(1,1,1)))return false;
  const pos=m.geometry.attributes.position;
  if(m.geometry.index||pos?.count!==36)return false;
  m.geometry.computeBoundingBox();const b=m.geometry.boundingBox;
  return Math.abs(b.min.x+4.8)<1e-6&&Math.abs(b.max.x-4.8)<1e-6&&b.min.y===-.25&&b.max.y===.25&&b.min.z===-4.5&&b.max.z===4.5&&
    Array.from({length:pos.count},(_,i)=>Math.abs(Math.abs(pos.getX(i))-4.8)<1e-6&&Math.abs(pos.getY(i))===.25&&Math.abs(pos.getZ(i))===4.5).every(Boolean);
}
export function applyLinxiBridgePool(kit,frame,item,record) {
  if (kit.linxiBridgePool===false) return null;
  const p=LINXI_BRIDGE_POOL;
  if (kit.root.name!=='outer-west'||item.name!=='临溪亭'||item.enclosureProfile!=='linxi-enclosed-flat-ceiling-fit-v1'||
    item.x!==p.x||item.z!==p.z||item.w!==9||item.d!==8.4||item.ph!==p.deckY||item.pad!==.3||
    (item.rot??0)!==0||frame.parent!==kit.root||frame.position.x!==p.x||frame.position.y!==0||frame.position.z!==p.z||
    frame.rotation.x!==0||frame.rotation.y!==0||frame.rotation.z!==0||!frame.scale.equals(new THREE.Vector3(1,1,1))||record.key!=='linxi') {
    throw Error('Linxi bridge pool requires exact retained host');
  }
  if (record.bridgePool||frame.children.some(o=>o.name==='linxi-bridge-pool')) throw Error('Linxi bridge pool duplicate');
  const old=frame.children.filter(m=>isOldPlinth(m,kit));
  if (old.length!==1) throw Error('Linxi bridge pool exact brick plinth required');
  let owners=0;kit.root.traverse(o=>{if(o.geometry===old[0].geometry)owners++});
  if (owners!==1) throw Error('Linxi bridge pool plinth geometry must be exclusive');

  const group=new THREE.Group();group.name='linxi-bridge-pool';
  const marble=kit.lib.material('marble'),stone=kit.lib.material('wall_brick');
  const water=new THREE.MeshStandardMaterial({name:'linxi_static_water_fit',color:0x465b51,roughness:.28,metalness:.08});
  const colliders=[];
  const add=(role,geometry,material=marble,x=0,y=0,z=0)=>{
    const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.name=role;
    m.userData={role,linxiBridgePool:true,dimensionStatus:'PHOTO_INFORMED_FIT_NOT_SURVEY'};
    m.castShadow=m.receiveShadow=true;group.add(m);return m;
  };
  const box=(role,w,h,d,x,y,z,solid=false,material=marble)=>{
    const tile=kit.lib.tileSize(material===marble?'marble':'wall_brick');
    const m=add(role,applyBoxUV(new THREE.BoxGeometry(w,h,d),tile),material,x,y,z);
    if(solid)colliders.push([x-w/2,y-h/2,z-d/2,x+w/2,y+h/2,z+d/2]);return m;
  };
  let evidence;
  try {
  const half=p.archSpan/2,profile=new THREE.Shape();
  profile.moveTo(-p.bridgeDepth/2,p.bedY);profile.lineTo(-half,p.bedY);profile.lineTo(-half,p.archSpring);
  for(let i=1;i<=p.segments;i++){
    const t=Math.PI-i*Math.PI/p.segments;
    profile.lineTo(half*Math.cos(t),p.archSpring+(p.archCrown-p.archSpring)*Math.sin(t));
  }
  profile.lineTo(half,p.bedY);profile.lineTo(p.bridgeDepth/2,p.bedY);
  profile.lineTo(p.bridgeDepth/2,p.archTop);profile.lineTo(-p.bridgeDepth/2,p.archTop);profile.closePath();
  add('linxi-single-arch',profileExtrusion(profile,p.bridgeWidth,-p.bridgeWidth/2),stone);
  // Shallow voussoir seams on both exposed faces: fitted courses, not a measured bond.
  for(const side of[-1,1])for(let i=0;i<p.segments;i++){
    const a=i*Math.PI/p.segments,b=(i+1)*Math.PI/p.segments,s=new THREE.Shape();
    const points=[[half*Math.cos(a),p.archSpring+(p.archCrown-p.archSpring)*Math.sin(a)],
      [half*Math.cos(b),p.archSpring+(p.archCrown-p.archSpring)*Math.sin(b)],
      [(half+.16)*Math.cos(b),p.archSpring+(p.archCrown-p.archSpring+.16)*Math.sin(b)],
      [(half+.16)*Math.cos(a),p.archSpring+(p.archCrown-p.archSpring+.16)*Math.sin(a)]];
    points.forEach(([u,v],j)=>s[j?'lineTo':'moveTo'](u,v));s.closePath();
    add('linxi-arch-face-course',profileExtrusion(s,.018,side<0?-p.bridgeWidth/2-.018:p.bridgeWidth/2));
  }
  box('linxi-pool-bed',p.width,.10,p.depth,0,p.bedY-.05,0,false,stone);
  const waterGeometry=new THREE.PlaneGeometry(p.width,p.depth);waterGeometry.rotateX(-Math.PI/2);
  add('linxi-pool-water',waterGeometry,water,0,p.waterY,0);
  const t=p.bankThickness;
  for(const[x,z,w,d]of[[-p.width/2-t/2,0,t,p.depth+2*t],[p.width/2+t/2,0,t,p.depth+2*t],
    [0,-p.depth/2-t/2,p.width,t],[0,p.depth/2+t/2,p.width,t]]) {
    box('linxi-pool-bank',w,-p.bedY+.06,d,x,(p.bedY+.06)/2,z);
  }
  const posts=new Set();
  const post=(x,z)=>{
    const key=x.toFixed(6)+','+z.toFixed(6);if(posts.has(key))return;posts.add(key);
    box('linxi-stone-rail-post',.24,1.16,.24,x,.64,z,true);
    box('linxi-stone-post-base',.34,.12,.34,x,.12,z,true);
    add('linxi-stone-post-cap',new THREE.SphereGeometry(.15,12,8),marble,x,1.25,z);
    colliders.push([x-.15,1.10,z-.15,x+.15,1.40,z+.15]);
  };
  const rail=(a,b,n)=>{
    const dx=(b[0]-a[0])/n,dz=(b[1]-a[1])/n,alongX=dx!==0,step=Math.hypot(dx,dz);
    for(let i=0;i<=n;i++)post(a[0]+i*dx,a[1]+i*dz);
    for(let i=0;i<n;i++){
      const x=a[0]+(i+.5)*dx,z=a[1]+(i+.5)*dz,len=step-.24;
      box('linxi-stone-rail-lower-panel',alongX?len:.14,.43,alongX?.14:len,x,.365,z,true);
      box('linxi-stone-rail-top',alongX?len:.19,.12,alongX?.19:len,x,1.04,z,true);
      box('linxi-stone-rail-foot',alongX?len:.23,.08,alongX?.23:len,x,.11,z,true);
      const vase=new THREE.LatheGeometry([new THREE.Vector2(.09,0),new THREE.Vector2(.06,.07),new THREE.Vector2(.13,.20),new THREE.Vector2(.15,.25),new THREE.Vector2(.08,.31),new THREE.Vector2(.10,.40)],12);
      add('linxi-stone-rail-baluster',vase,marble,x,.58,z);
      colliders.push([x-.15,.58,z-.15,x+.15,.98,z+.15]);
    }
  };
  for(const side of[-1,1]){
    rail([side*(p.width/2+t/2),-p.depth/2-t/2],[side*(p.width/2+t/2),p.depth/2+t/2],6);
    for(const end of[-1,1])rail([side*p.bridgeWidth/2,end*(p.depth/2+t/2)],[side*(p.width/2+t/2),end*(p.depth/2+t/2)],3);
  }
  evidence={id:'FC-00B009500F',source:'https://www.dpm.org.cn/explore/building/236537.html',
    photos:['https://img.dpm.org.cn/Uploads/Picture/2020/07/15/s5f0ebf845b521.jpg','https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efee59eb65f0.jpg'],
    topology:'RECTANGULAR_POOL_SINGLE_MASONRY_ARCH_EW_WATER_NS_STEPS_STONE_PERIMETER_RAILS',
    dimensions:'PHOTO_INFORMED_MODEL_FIT_NOT_SURVEY',waterState:'STATIC_LEVEL_FIT_NOT_CURRENT_OBSERVATION',
    archBore:'EW_PHOTO_INFORMED_FIT_HIDDEN_SECTION_UNKNOWN',railCarving:'PLAIN_MASSING_NO_INVENTED_CARVED_MOTIFS',
    accepted:false,photographyDate:null,siteAccessVerified:false,fit:{...p},
    retained:'Existing pavilion, floor slab, NS stairs and all original physical rows',
    limitations:['Exact dimensions, submerged intrados and masonry bond unmeasured.','No present water state, interior painting or garden inventory acceptance.']};
  } catch(error) {
    group.traverse(o=>o.geometry?.dispose());water.dispose();throw error;
  }
  // Publish only after validating and constructing the complete bounded package.
  old[0].removeFromParent();old[0].geometry.dispose();frame.add(group);kit.owned.push(water);
  for(const c of colliders)kit.col(frame,...c);
  record.bridgePool=evidence;group.userData.bridgePool=evidence;
  return evidence;
}
