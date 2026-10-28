import * as THREE from 'three';
import {addYujingSouthRail} from './GardenSilhouetteDetails.js';
import anchors from '../../../data/anchors.json' with {type:'json'};
import {applyBoxUV} from '../../utils/GeometryUV.js';
import {buildBalustrade} from '../HallKit.js';
import {FUBI_ARCH_POOL,buildFubiArchPool} from './FubiArchPool.js';
import {addBridgeCeilingRelief} from './BridgeCeilingRelief.js';

const SOURCES={浮碧亭:'https://www.dpm.org.cn/explore/building/236498.html',澄瑞亭:'https://www.dpm.org.cn/explore/building/236443.html'};
export function bridgeGardenProfile(name){
 if(!SOURCES[name])throw Error('Bridge pavilion exact identity required');
 const a=anchors[name];return {id:`garden-procedural-${name}`,name,x:a.x,z:a.z,source:SOURCES[name],mainBays:3,mainColumnWidth:7.6,annexDirection:'south',annexDepth:2.4,mainFloor:.9,annexFloor:.5,poolWidth:15,poolDepth:10,dimensionStatus:'PHOTO_INFORMED_FIT_NOT_SURVEY',accepted:false,currentInventoryVerified:false,photographyDate:null,removedWallBoardsRecreated:false,altarRecreated:false,ceilingPattern:name==='浮碧亭'?'FLOWER_TYPE_ATTESTED_PLAIN_GEOMETRY':'DRAGON_TYPE_ATTESTED_PLAIN_GEOMETRY',caisson:'OCTAGONAL_CONTOUR_ONLY_NO_COPIED_ARTWORK',access:'MODEL_ROUTE_NOT_SITE_OPENING_PERMISSION'};
}
function triangles(ts){const p=ts.flat(2),g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.computeVertexNormals();const uv=[];for(let i=0;i<p.length;i+=3)uv.push(p[i],p[i+2]);g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));return g;}
function roofMesh(g,role,ts,mat,under){
 // Close only the actual boundary of this .12 m fitted roof shell. Internal
 // triangle seams are not duplicated, and the existing tile/underside stay put.
 const boundary=new Map(),key=p=>p.join(',');for(const t of ts)for(let i=0;i<3;i++){const a=t[i],b=t[(i+1)%3],k=[key(a),key(b)].sort().join('|');if(boundary.has(k))boundary.delete(k);else boundary.set(k,[a,b]);}
 const edgeFaces=[];for(const[a,b]of boundary.values()){const loA=[a[0],a[1]-.12,a[2]],loB=[b[0],b[1]-.12,b[2]];edgeFaces.push([a,loA,loB],[a,loB,b]);}
 for(const [suffix,material,faces]of [['tiles',mat,ts],['underside',under,ts.map(t=>t.map(p=>[p[0],p[1]-.12,p[2]]).reverse())],['edge-closure',under,edgeFaces]]){const m=new THREE.Mesh(triangles(faces),material);m.name=role+'-'+suffix;m.userData.role=m.name;m.castShadow=m.receiveShadow=true;g.add(m);}
}
function assembly(builder,root,{name,x,z,y=0}){const g=new THREE.Group();g.name=name;g.position.set(x,y,z);root.add(g);const lib=builder.library;
 const wood=lib.material('wood_column'),stone=lib.material('marble',{roughness:.7}),beam=lib.material('caihua_beam'),green=builder.own(new THREE.MeshStandardMaterial({name:'r48_garden_green_glaze',color:0x246d59,roughness:.48})),yellow=builder.own(new THREE.MeshStandardMaterial({name:'r48_garden_yellow_edge',color:0xc69531,roughness:.45}));
 const box=(role,w,h,d,px,py,pz,mat=wood,solid=true)=>{if(![w,h,d,px,py,pz].every(Number.isFinite)||Math.min(w,h,d)<=0)throw Error('Garden invalid box');const m=new THREE.Mesh(applyBoxUV(new THREE.BoxGeometry(w,h,d),1),mat);m.name=role;m.userData.role=role;m.position.set(px,py,pz);m.castShadow=m.receiveShadow=true;g.add(m);if(solid)builder.addCollider(new THREE.Box3(new THREE.Vector3(x+px-w/2,y+py-h/2,z+pz-d/2),new THREE.Vector3(x+px+w/2,y+py+h/2,z+pz+d/2)));return m;};
 const col=(role,x,z,floor,top)=>box(role,.30,top-floor,.30,x,(floor+top)/2,z,wood);
 const walk=(x0,x1,z0,z1,h)=>builder.walkBox(x+x0,z+z0,x+x1,z+z1,y+h);
 const ramp=(x0,x1,z0,z1,h0,h1)=>builder.walkRampZ(x+x0,x+x1,z+z0,z+z1,y+h0,y+h1);
 return{g,lib,wood,stone,beam,green,yellow,box,col,walk,ramp};
}
export function buildBridgeGardenPavilion(builder,root,input){const p=bridgeGardenProfile(input.name);if(input.x!==p.x||input.z!==p.z)throw Error('Bridge pavilion exact anchor required');const {x,z}=p;
 const a=assembly(builder,root,{name:`bridge_pavilion_${p.name}`,x,z}),{g,lib,wood,stone,beam,green,yellow,box,col,walk,ramp}=a;
 // Retain the original 15 by 10 metre pool perimeter. Internal support and water
 // exclusions intentionally follow the new, visible two-level architectural fit.
 const pw=15,pd=10,rimH=.55,rimT=.5,BW=2.4,half=1.3,seg=(pw+rimT)/2-half;
 const rims=[[-pw/2,0,rimT,pd-rimT],[pw/2,0,rimT,pd-rimT]];
 for(const s of[-1,1])for(const zz of[-pd/2,pd/2])rims.push([s*(half+seg/2),zz,seg,rimT]);
 for(const [xx,zz,w,d]of rims)box('bridge-pool-rim',w,rimH,d,xx,rimH/2,zz,stone,false);
 const water=new THREE.Mesh(new THREE.PlaneGeometry(14.5,9.5),lib.material('water',{roughness:.12,metalness:.15}));water.name='bridge-pool-water';water.rotation.x=-Math.PI/2;water.position.y=p.name==='浮碧亭'?FUBI_ARCH_POOL.waterY:.3;g.add(water);
 const rails=[[-pw/2,0,pd,Math.PI/2],[pw/2,0,pd,-Math.PI/2]];
 for(const s of[-1,1])rails.push([s*(half+(pw/2-half)/2),-pd/2,pw/2-half,0],[s*(half+(pw/2-half)/2),pd/2,pw/2-half,Math.PI]);
 for(const [xx,zz,len,rot]of rails){const r=buildBalustrade(lib,{length:len,height:.85});r.position.set(xx,rimH,zz);r.rotation.y=rot;g.add(r);}
 const obstruction=(x0,x1,z0,z1)=>builder.addCollider(new THREE.Box3(new THREE.Vector3(x+x0,0,z+z0),new THREE.Vector3(x+x1,1.6,z+z1)));
 obstruction(-7.8,-4.2,-5.3,5.3);obstruction(4.2,7.8,-5.3,5.3);obstruction(-4.2,-1.2,4.2,5.3);obstruction(1.2,4.2,4.2,5.3);
 // Each registered support has a real top face. No invisible extension over water.
 if(p.name==='浮碧亭')p.archPool=buildFubiArchPool(g,stone);else box('bridge-main-plinth',8.4,.9,8.4,0,.45,0,stone,false);walk(-4.2,4.2,-4.2,4.2,.9);
 box('bridge-annex-plinth',8.4,.5,2.4,0,.25,-5.4,stone,false);walk(-4.2,4.2,-6.6,-4.2,.5);
 box('bridge-north-deck',2.4,.5,2.6,0,.25,5.5,stone,false);walk(-1.2,1.2,4.2,6.8,.5);
 function stairs(role,from,to,low,high,count){const step=(to-from)/count;for(let i=0;i<count;i++){const h=low+(high-low)*(i+1)/count;box(role,2.4,h,Math.abs(step),0,h/2,from+(i+.5)*step,stone,false);}ramp(-1.2,1.2,from,to,low,high);}
 stairs('bridge-south-ground-step',-7.5,-6.6,0,.5,3);stairs('bridge-south-main-step',-4.6,-4.2,.5,.9,2);
 // The retained garden bed has grass at .29 and its north stone edge at .32.
 // A narrow visible fitted landing crosses it; only the actual bridge mouth is
 // supported, not the whole bed. Do not hide a low stair inside retained grass.
 const edgeSouth=506.4-z,edgeNorth=506.7-z,landingStart=7.2;
 stairs('bridge-north-deck-step',landingStart,6.8,.32,.5,1);
 box('bridge-north-bed-crossing',2.4,.32,edgeSouth-landingStart,0,.16,(edgeSouth+landingStart)/2,stone,false);
 walk(-1.2,1.2,landingStart,edgeSouth,.32);
 walk(-1.2,1.2,edgeSouth,edgeNorth,.32); // exact retained visible marble edge
 stairs('bridge-north-ground-step',507.6-z,edgeNorth,0,.32,2);
 stairs('bridge-north-main-step',4.6,4.2,.5,.9,2);
 p.northApproach={retainedBedEdgeWorldZ:[506.4,506.7],retainedEdgeTop:.32,groundToeWorldZ:507.6,width:2.4,status:'LOCAL_VISIBLE_ACCESS_FIT_NOT_HISTORICAL_STAIR_MEASUREMENT'};
 // Low edge blockers match the plinth's visible sides, with true central gaps.
 for(const s of[-1,1]){if(p.name==='浮碧亭'){/* Retain body guard, but do not cap the photographed low arch with a visible box. */builder.addCollider(new THREE.Box3(new THREE.Vector3(x+s*4.12-.08,0,z-4.2),new THREE.Vector3(x+s*4.12+.08,.9,z+4.2)));}else box('bridge-main-edge',.16,.9,8.4,s*4.12,.45,0,stone);box('bridge-annex-edge',.16,.5,2.4,s*4.12,.25,-5.4,stone);for(const zz of[-4.12,4.12])box('bridge-main-edge',2.92,.9,.16,s*2.66,.45,zz,stone);box('bridge-annex-front-edge',2.92,.5,.16,s*2.66,.25,-6.52,stone);}
 const xs=[-3.8,-1.4,1.4,3.8],top=4.7;
 for(const xx of xs)for(const zz of[-3.8,3.8])col('bridge-main-column',xx,zz,.9,top);
 for(const xx of[-3.8,3.8])for(const zz of[-1.4,1.4])col('bridge-main-column',xx,zz,.9,top);
 for(const xx of xs)col('bridge-annex-column',xx,-6.2,.5,4.3);
 for(const zz of[-3.8,3.8])box('bridge-main-beam',7.9,.36,.32,0,4.52,zz,beam,false);
 for(const xx of[-3.8,3.8])box('bridge-main-beam',.32,.36,7.9,xx,4.52,0,beam,false);
 box('bridge-annex-front-beam',7.9,.36,.32,0,4.12,-6.2,beam,false);
 for(const xx of[-3.8,3.8])box('bridge-annex-side-beam',.32,.36,2.4,xx,4.12,-5,beam,false);
 // Current open pavilions: neither the removed enclosure boards nor altar returns.
 for(const s of[-1,1]){
  box('bridge-main-stone-rail',.20,.75,7.4,s*3.8,1.275,0,stone);
  for(const zz of[-3.8,3.8])box('bridge-end-seat',2.35,.12,.42,s*2.6,1.43,zz,wood);
  box('bridge-annex-seat',2.35,.12,.42,s*2.6,1.03,-6.2,wood);
  for(const xx of[s*1.7,s*3.5])box('bridge-annex-seat-support',.3,.47,.40,xx,.735,-6.2,stone);
  // Uprights stop careless lateral exit while retaining the central 2.8m opening.
  for(const zz of[-3.8,3.8])box('bridge-end-stone-panel',2.35,.6,.18,s*2.6,1.2,zz,stone);
 }
 // Main roof is square pyramidal. Annex is a transverse gable, not a second pyramid.
 const corners=[[-4.25,4.85,-4.25],[4.25,4.85,-4.25],[4.25,4.85,4.25],[-4.25,4.85,4.25]],peak=[0,7.4,0];
 const main=corners.map((v,i)=>[v,peak,corners[(i+1)%4]]);roofMesh(g,'bridge-main-roof',main,green,beam);
 const q=[[-4.25,4.55,-6.65],[4.25,4.55,-6.65],[-4.25,5.65,-4.8],[4.25,5.65,-4.8],[-4.25,4.55,-2.95],[4.25,4.55,-2.95]];
 roofMesh(g,'bridge-annex-roof',[[q[0],q[2],q[1]],[q[1],q[2],q[3]],[q[2],q[4],q[3]],[q[3],q[4],q[5]]],green,beam);
 function beamBetween(role,start,end,thick,mat){const v=new THREE.Vector3(...end).sub(new THREE.Vector3(...start)),m=box(role,thick,thick,v.length(),...(new THREE.Vector3(...start).add(new THREE.Vector3(...end)).multiplyScalar(.5).toArray()),mat,false);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),v.normalize());}
 for(let i=0;i<4;i++){beamBetween('bridge-main-yellow-edge',corners[i],corners[(i+1)%4],.16,yellow);beamBetween('bridge-main-yellow-hip',corners[i],peak,.12,yellow);}
 for(const pair of[[0,1],[2,3],[4,5],[0,2],[2,4],[1,3],[3,5]])beamBetween('bridge-annex-yellow-edge',q[pair[0]],q[pair[1]],.14,yellow);
 // Fitted plain bearing tops meet roof planes at the column axes. Small caps are
 // non-decorative supports, not a claim about the original dougong carving.
 const mainY=(xx,zz)=>4.85+(7.4-4.85)*(1-Math.max(Math.abs(xx),Math.abs(zz))/4.25)-.12;
 function cap(role,cx,cz,bottom,height){const pts=[[-.16,-.16],[.16,-.16],[.16,.16],[-.16,.16]].map(([dx,dz])=>[cx+dx,height(cx+dx,cz+dz),cz+dz]),lo=pts.map(v=>[v[0],bottom,v[2]]),mid=[cx,height(cx,cz),cz],ts=pts.map((v,i)=>[v,mid,pts[(i+1)%4]]);ts.push([lo[0],lo[1],lo[2]],[lo[0],lo[2],lo[3]]);for(let i=0;i<4;i++){const j=(i+1)%4;ts.push([lo[i],pts[i],pts[j]],[lo[i],pts[j],lo[j]]);}const m=new THREE.Mesh(triangles(ts),wood);m.name=role;m.userData.role=role;g.add(m);}
 for(const xx of xs)for(const zz of[-3.8,3.8])cap('bridge-main-bearing',xx,zz,top,mainY);
 for(const xx of[-3.8,3.8])for(const zz of[-1.4,1.4])cap('bridge-main-bearing',xx,zz,top,mainY);
 const annexY=(xx,zz)=>4.55+1.1*(1-Math.abs(zz+4.8)/1.85)-.12;
 for(const xx of xs)cap('bridge-annex-bearing',xx,-6.2,4.3,annexY);
 // Plain ceiling and octagonal raised well distinguish the source-described interior.
 const ceilingShape=new THREE.Shape();ceilingShape.moveTo(-3.8,-3.8);ceilingShape.lineTo(3.8,-3.8);ceilingShape.lineTo(3.8,3.8);ceilingShape.lineTo(-3.8,3.8);ceilingShape.closePath();
 const hole=new THREE.Path();for(let i=0;i<8;i++){const q=i*Math.PI/4,xx=Math.sin(q)*1.4,zz=Math.cos(q)*1.4;if(i===0)hole.moveTo(xx,zz);else hole.lineTo(xx,zz);}hole.closePath();ceilingShape.holes.push(hole);
 const ceilingGeo=new THREE.ShapeGeometry(ceilingShape);ceilingGeo.rotateX(Math.PI/2);const ceiling=new THREE.Mesh(ceilingGeo,beam);ceiling.position.y=4.525;ceiling.name='bridge-main-ceiling';ceiling.userData.role=ceiling.name;g.add(ceiling);
 const caissonGeo=new THREE.CylinderGeometry(.65,1.4,.75,8,1,true),ci=caissonGeo.index;for(let i=0;i<ci.count;i+=3){const j=ci.getX(i+1);ci.setX(i+1,ci.getX(i+2));ci.setX(i+2,j);}caissonGeo.computeVertexNormals();
 const caisson=new THREE.Mesh(caissonGeo,beam);caisson.name='bridge-main-caisson';caisson.userData.role=caisson.name;caisson.position.set(0,4.9,0);g.add(caisson);
 const lidGeo=new THREE.CircleGeometry(.65,8);lidGeo.rotateX(Math.PI/2);const lid=new THREE.Mesh(lidGeo,beam);lid.position.y=5.275;lid.name='bridge-caisson-lid';g.add(lid);
 box('bridge-annex-ceiling',7.6,.1,2.4,0,4.02,-5,beam,false);
 const finial=new THREE.Mesh(new THREE.SphereGeometry(.25,12,8),yellow);finial.name='bridge-finial';finial.position.set(0,7.65,0);g.add(finial);
 addBridgeCeilingRelief(builder,g,p);
 g.userData.bridgePavilion=p;builder.group.userData.bridgePavilions??=[];builder.group.userData.bridgePavilions.push(p);return g;
}

export function buildYujingEnclosure(builder,root,{x,z,y,playableExit=false}){
 const a=assembly(builder,root,{name:'yujing_four_door_enclosure',x,z,y}),{g,lib,wood,stone,box}=a;
 for(let k=0;k<4;k++){
  const horizontal=k%2===0,sign=k<2?-1:1,at=sign*1.8;
  for(let j=0;j<4;j++){const pos=-1.2+j*.8;if(playableExit&&k===0&&(j===1||j===2))box('yujing-open-door-leaf-gameplay',.14,2.25,.78,j===1?-.81:.81,1.475,-1.41,lib.material('lattice_doors'),true);else box('yujing-closed-door-leaf',horizontal?.78:.14,2.25,horizontal?.14:.78,horizontal?pos:at,1.475,horizontal?at:pos,lib.material('lattice_doors'),playableExit);}
  box('yujing-door-header',horizontal?3.6:.22,.4,horizontal?.22:3.6,horizontal?0:at,2.8,horizontal?at:0,wood,playableExit);
  // Surrounding stone rail is an exterior silhouette only; no invented summit route.
  if(k===0){if(playableExit){for(const xx of[-2.4,-.8,.8,2.4])box('yujing-south-rail-post',.18,.85,.2,xx,.775,-2.4,stone,true);for(const yy of[.40,.86])for(const xx of[-1.6,1.6])box('yujing-south-rail-horizontal-gameplay-opening',1.6,.1,.18,xx,yy,-2.4,stone,true);}else addYujingSouthRail(box,stone);}
  else box('yujing-stone-balustrade',horizontal?4.8:.2,.65,horizontal?.2:4.8,horizontal?0:sign*2.4,.675,horizontal?sign*2.4:0,stone,playableExit);
 }
 if(playableExit){builder.walkables.push({type:'box',rescue:false,box:new THREE.Box3(new THREE.Vector3(x-2.7,y+.35,z-2.7),new THREE.Vector3(x+2.7,y+.35,z+2.7))});for(const xx of[-1.8,1.8])for(const zz of[-1.8,1.8])builder.addCollider(new THREE.Box3(new THREE.Vector3(x+xx-.2,y+.35,z+zz-.2),new THREE.Vector3(x+xx+.2,y+3.15,z+zz+.2)));}
 const profile={id:'garden-procedural-御景亭',name:'御景亭',source:'https://www.dpm.org.cn/explore/building/236490.html',externalDoorGroups:4,columns:4,doorPose:'CLOSED_FIT_PHOTO_INFORMED_NOT_ACCESS_PERMISSION',dimensions:'RETAINED_FITTED_MOUNTAIN_PLATFORM',rail:'SOUTH_VISIBLE_POSTS_AND_OPEN_RAILS_PHOTO_FIT_THREE_OTHER_SLABS_UNVERIFIED_RETAINED',interior:'UNRECONSTRUCTED_THRONE_LOCATION_AND_INVENTORY_UNKNOWN',access:'NO_NEW_SUMMIT_SUPPORT_OR_TELEPORT',accepted:false};if(playableExit){profile.doorPose='SOUTH_TWO_LEAVES_OPEN_GAMEPLAY_ADAPTATION_OTHER_GROUPS_CLOSED';profile.access='EXPLICIT_GAMEPLAY_SOUTH_DOOR_AND_RAIL_OPENING_NOT_HISTORICAL_PUBLIC_ACCESS';profile.rail='SOUTH_CENTER_GAP_GAMEPLAY_ADAPTATION_OTHER_GEOMETRY_RETAINED';profile.minimumExitWidth=1.42;}g.userData.yujingProfile=profile;builder.group.userData.yujingProfile=profile;return g;
}
