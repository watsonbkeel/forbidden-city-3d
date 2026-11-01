import * as THREE from 'three';
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-6;
const SOURCE='https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efefdd3c1950.jpg';
const unit=new THREE.Vector3(1,1,1);
function inspect(kit,frame,cx){
 const matches=frame.children.filter(m=>m.isMesh&&near(m.position.x,cx)&&near(m.position.y,4.1)&&near(m.position.z,0));if(matches.length!==1)return null;
 const old=matches[0],geometry=old.geometry,a=geometry?.attributes,count=geometry?.index?.count??a?.position?.count,all=[];kit.root.traverse(m=>{if(m.isMesh)all.push(m);});
 if(old.material!==kit.lib.material('wall_red')||old.isInstancedMesh||old.isSkinnedMesh||!old.visible||!old.castShadow||!old.receiveShadow||old.rotation.x||old.rotation.y||old.rotation.z||!old.scale.equals(unit)||count!==36||Object.keys(a??{}).sort().join()!=='normal,position,uv'||Object.values(a).some(v=>v.isInterleavedBufferAttribute||v.normalized)||Object.keys(geometry.morphAttributes).length||geometry.drawRange.start!==0||(geometry.drawRange.count!==Infinity&&geometry.drawRange.count!==count)||all.some(m=>m!==old&&m.geometry===geometry))return null;
 const tile=kit.lib.tileSize('wall_red');if(!Number.isFinite(tile)||tile<=0)return null;
 const keep=[],front=[],faces=new Map();
 for(let i=0;i<count;i+=3){const ids=[0,1,2].map(j=>geometry.index?geometry.index.getX(i+j):i+j),points=ids.map(j=>new THREE.Vector3().fromBufferAttribute(a.position,j)),cross=points[1].clone().sub(points[0]).cross(points[2].clone().sub(points[0]));if(cross.lengthSq()<1e-12)return null;cross.normalize();const key=cross.toArray().map(Math.round).join(),face=faces.get(key)??{triangles:0,vertices:new Set()};face.triangles++;faces.set(key,face);
  for(const j of ids){if(!Object.values(a).every(v=>Array.from(v.array.subarray(j*v.itemSize,(j+1)*v.itemSize)).every(Number.isFinite)))return null;const n=new THREE.Vector3().fromBufferAttribute(a.normal,j),p=new THREE.Vector3().fromBufferAttribute(a.position,j);face.vertices.add(p.toArray().join());const axis=Math.abs(n.y)>.9?'y':Math.abs(n.x)>.9?'x':'z',u=axis==='y'?p.x:axis==='x'?p.z*Math.sign(n.x):p.x*Math.sign(n.z),v=axis==='y'?p.z:p.y;if(!near(a.uv.getX(j),u/tile)||!near(a.uv.getY(j),v/tile)||cross.dot(n)<.999999||!near(Math.abs(p.x),2.99)||!near(Math.abs(p.y),3.3)||!near(Math.abs(p.z),.3)||![0,1,2].some(k=>near(Math.abs(n.getComponent(k)),1)&&near(p.getComponent(k)*n.getComponent(k),[2.99,3.3,.3][k])))return null;}
  (ids.every(j=>a.normal.getZ(j)<-.99999)?front:keep).push(...ids);
 }
 if(front.length!==6||keep.length!==30||faces.size!==6||[...faces.values()].some(f=>f.triangles!==2||f.vertices.size!==4))return null;
 const expected={min:[frame.position.x+cx-2.99,.8,frame.position.z-.3],max:[frame.position.x+cx+2.99,7.4,frame.position.z+.3]};
 const colliderIndices=kit.colliders.map((b,i)=>({b,i})).filter(({b})=>['min','max'].every(k=>expected[k].every((v,j)=>near(b[k].getComponent(j),v)))).map(x=>x.i);if(colliderIndices.length!==1)return null;
 return{old,geometry,a,keep,tile,cx,colliderIndex:colliderIndices[0],beforeCollider:{min:kit.colliders[colliderIndices[0]].min.toArray(),max:kit.colliders[colliderIndices[0]].max.toArray()}};
}
/** Only the two independently photographed south end windows, not Wenhua's
 * asymmetric window/sill. Closed wall physics and five other faces are retained.
 * The two closed end walls and exact proxies move behind the front columns.
 * The obscured lower wall is intentionally NOT replaced with a stone skirt.
 */
export function applyWuyingGateSouthWindows(kit,frame){
 const g=frame?.userData.structure;
 if(!g||g.id!=='south-gate:wuying'||g.profile!=='wuying'||g.name!=='武英门'||g.wuyingSouthWindows||!near(g.x,220.8)||!near(g.z,-249.8)||!near(g.w,34.9)||!near(g.d,17.9)||!near(g.ph,.8)||!near(g.colH,6.6)||frame.parent!==kit?.root||!near(frame.position.x,g.x)||!near(frame.position.y,0)||!near(frame.position.z,g.z)||frame.rotation.x||frame.rotation.y||frame.rotation.z||!frame.scale.equals(unit))return false;
 const targets=[-13.96,13.96].map(cx=>inspect(kit,frame,cx));if(targets.some(x=>!x))return false;
 const facadeOffset=-8.4; // Front face -8.7 m: 0.25 m behind the south column axes.
 const meta={facadeOffset,colliderRevisions:targets.map(t=>({index:t.colliderIndex,before:t.beforeCollider,after:{min:t.beforeCollider.min.map((v,i)=>v+(i===2?facadeOffset:0)),max:t.beforeCollider.max.map((v,i)=>v+(i===2?facadeOffset:0))}})),objectId:'FC-77E2C07341',source:SOURCE,photographyDate:null,status:'VERIFY_PENDING',accepted:false,scope:'TWO_SOUTH_END_WINDOWS_ONLY',dimensionStatus:'REVERSIBLE_PHOTO_FIT_NOT_SURVEYED',closedWindowNotPassage:true,oldGeometryException:'Four south skin triangles replaced. Five other faces retain exact local attributes; both whole end walls and their two exact colliders move -8.4 m in local Z. Other geometry and navigation are exact.',unknown:'Exact lattice repeat count, window leaf count, hidden lower wall and material behind lattice. Depth, colour and diamond spacing are reversible model fits.',lowerWall:'Retained red skin; source lower part is railing-occluded, no invented stone skirt.',majorDivisionsPerWindow:3,windowLeafCount:null,fineGridModeled:true,fineGridRepeatCountStatus:'MODEL_FIT_NOT_SOURCE_COUNT',frameBottom:2.35,frameTop:6.65};
 const makeMaterial=(name,color,roughness)=>{const m=new THREE.MeshStandardMaterial({name,color,roughness,metalness:0});kit.owned.push(m);return m;};
 const red=makeMaterial('wuying_gate_red_window',0x8b3025,.85),dark=makeMaterial('wuying_gate_closed_recess',0x332a23,.98);
 const box=(role,w,h,d,x,y,z,angle=0)=>{const m=kit.mesh(frame,new THREE.BoxGeometry(w,h,d),role==='closed-recess'?dark:red,x,y,z+facadeOffset);m.rotation.z=angle;m.name='wuying-gate-south-'+role;m.userData.wuyingGateSouthWindow={...meta,role};return m;};
 for(const {old,geometry,a,keep,tile,cx,colliderIndex} of targets){
  const body={position:[],normal:[],uv:[]};for(const key of Object.keys(body))for(const j of keep)body[key].push(...a[key].array.subarray(j*a[key].itemSize,(j+1)*a[key].itemSize));
  for(const [x0,x1,y0,y1]of[[-2.99,-2.84,-3.3,3.3],[2.84,2.99,-3.3,3.3],[-2.84,2.84,-3.3,-1.75],[-2.84,2.84,2.55,3.3]])for(const [x,y]of[[x0,y0],[x0,y1],[x1,y1],[x0,y0],[x1,y1],[x1,y0]]){body.position.push(x,y,-.3);body.normal.push(0,0,-1);body.uv.push(-x/tile,y/tile);}
  const replacement=new THREE.BufferGeometry();for(const [key,values]of Object.entries(body))replacement.setAttribute(key,new THREE.Float32BufferAttribute(values,key==='uv'?2:3));replacement.computeBoundingBox();replacement.computeBoundingSphere();old.geometry=replacement;geometry.dispose();old.position.z=facadeOffset;kit.colliders[colliderIndex].translate(new THREE.Vector3(0,0,facadeOffset));
  const x0=cx-2.84,x1=cx+2.84,y0=2.35,y1=6.65,t=.16,division=.13,field=(x1-x0-2*t-3*division)/4;
  for(const x of[x0+t/2,x1-t/2])box('frame',t,y1-y0,.18,x,(y0+y1)/2,-.21);
  for(const y of[y0+t/2,y1-t/2])box('frame',x1-x0-2*t,t,.18,cx,y,-.21);
  box('closed-recess',x1-x0-2*t,y1-y0-2*t,.04,cx,(y0+y1)/2,-.13);
  for(let j=0;j<3;j++)box('major-division',division,y1-y0-2*t,.18,x0+t+(j+1)*field+j*division+division/2,(y0+y1)/2,-.21);
  for(let j=0;j<4;j++){
   const xa=x0+t+j*(field+division)+.018,xb=xa+field-.036,ya=y0+t+.018,yb=y1-t-.018;
   for(const slope of[-1,1]){const ks=[ya-slope*xa,ya-slope*xb,yb-slope*xa,yb-slope*xb],min=Math.min(...ks),max=Math.max(...ks);
    // Global lattice phase is deterministic; clipped end solids remain inside
    // the fitted field. This is not a claim to the photographic repeat count.
    for(let k=Math.ceil(min/.48)*.48;k<max-1e-8;k+=.48){const points=[];for(const x of[xa,xb]){const y=slope*x+k;if(y>=ya-1e-8&&y<=yb+1e-8)points.push([x,y]);}for(const y of[ya,yb]){const x=(y-k)/slope;if(x>=xa-1e-8&&x<=xb+1e-8&&!points.some(p=>Math.hypot(x-p[0],y-p[1])<1e-8))points.push([x,y]);}if(points.length!==2)continue;const [p,q]=points,len=Math.hypot(q[0]-p[0],q[1]-p[1]);if(len<.03)continue;box('fitted-diamond-grille',len,.024,.08,(p[0]+q[0])/2,(p[1]+q[1])/2,-.24,Math.atan2(q[1]-p[1],q[0]-p[0]));}
   }
  }
 }
 g.wuyingSouthWindows=meta;return true;
}
