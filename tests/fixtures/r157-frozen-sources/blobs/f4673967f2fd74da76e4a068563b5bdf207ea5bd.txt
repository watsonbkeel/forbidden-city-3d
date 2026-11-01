import * as THREE from 'three';
import { qinanGeometry } from './QinanProfile.js';
import { buildQinanRoof } from './QinanRoof.js';
import { buildQinanNamePlaque } from './QinanNamePlaque.js';
import { buildQinanFrontJoinery } from './QinanFrontJoinery.js';
const tag=(o,role,extra={})=>{o.name=role;Object.assign(o.userData,{role,...extra});return o;};

/** Zone-owned model; virtual side doors use the retained stairs and floor, never a north-through shortcut. */
export function buildQinanHall(kit,item){
 const g=qinanGeometry(item),f=kit.frame(g.x,g.z,g.rot),floor=g.datum.floorY,base=g.datum.columnBaseTopY,b=g.mainBody.columnFootGrid,a=g.mainBody.enclosureApproximation;
 f.name=item.name??g.name;
 const box=(role,mat,w,h,d,x,y,z,extra={})=>tag(kit.box(f,mat,w,h,d,x,y,z,['caihua_beam','lattice_doors'].includes(mat)?'band':'box'),role,extra);
 const solid=(role,mat,w,h,d,x,y,z,extra={})=>{const m=box(role,mat,w,h,d,x,y,z,extra);kit.col(f,x-w/2,y-h/2,z-d/2,x+w/2,y+h/2,z+d/2);return m;};
 for(const s of g.slabs){const w=s.maxX-s.minX,d=s.maxZ-s.minZ,x=(s.minX+s.maxX)/2,z=(s.minZ+s.maxZ)/2,t=g.supportApproximation.pavingThickness;
  solid('qinan-support-body','marble',w,floor-t,d,x,(floor-t)/2,z,{supportId:s.supportId,status:'PROVISIONAL'});
  solid('qinan-support-paving','stone_slab',w,t,d,x,floor-t/2,z,{supportId:s.supportId,status:'PROVISIONAL'});
 }
 for(const s of g.steps)solid('qinan-side-stair-step','stone_slab',s.maxX-s.minX,s.topY,s.maxZ-s.minZ,(s.minX+s.maxX)/2,s.topY/2,(s.minZ+s.maxZ)/2,{supportId:s.supportId,side:s.side,status:'PROVISIONAL_HEIGHT'});
 for(const s of g.supports)kit.walkables.push({type:'box',box:new THREE.Box3(new THREE.Vector3(...s.min),new THREE.Vector3(...s.max)),supportId:s.supportId,rescue:false});
 function column(role,x,z,radius,topY){
  const geo=new THREE.CylinderGeometry(radius,radius,topY-base,6);
  tag(kit.mesh(f,geo,kit.lib.material('wood_column'),x,(topY+base)/2,z),role);
  kit.col(f,x-radius,base,z-radius,x+radius,topY,z+radius);
  solid('qinan-column-base','stone_slab',a.columnFootWidth,base-floor,a.columnFootWidth,x,(base+floor)/2,z);
 }
 for(const p of g.mainBody.perimeterColumns)column('qinan-main-column',p.x,p.z,a.columnRadius,g.levels.eaveColumnTop);
 for(const p of g.mainBody.goldenColumns)column('qinan-golden-column',p.x,p.z,a.columnRadius,g.levels.goldenColumnNetTop);
 for(const x of g.southAnnex.columnXs)column('qinan-annex-column',x,g.southAnnex.frontZ,g.southAnnex.skin.columnRadius,g.southAnnex.columnTopY);
 const wallH=g.levels.eaveColumnTop-floor;
 solid('qinan-north-wall','wall_red',b.width,wallH,a.wallThickness,0,floor+wallH/2,b.zs.at(-1),{evidence:'SOURCE_DERIVED_CONTINUOUS_PLAN_WALL',currentDoorState:'UNKNOWN'});
 for(const sign of [-1,1])solid('qinan-main-side-wall','wall_red',a.wallThickness,wallH,b.depth,sign*b.width/2,floor+wallH/2,0,{status:'PROVISIONAL_EXTERIOR_SKIN'});
 // The south body and annex are connected volumes, sharing the rear boundary.
 // Only the upper main-wall strip is exposed above the low annex's join.
 const stripBottom=g.southAnnex.rearRoofY,stripH=g.levels.eaveColumnTop-stripBottom;
 if(stripH>0)solid('qinan-main-south-upper-strip','wall_red',b.width,stripH,a.wallThickness,0,stripBottom+stripH/2,b.zs[0]);
 const n=g.southAnnex,nh=n.columnTopY-floor,nt=n.skin.wallThickness;
 buildQinanFrontJoinery(kit,f,g);
 // The old unverified side panels sealed the landing of both real stair
 // models. Split only those placeholder skins: a virtual open doorway is not
 // evidence that today's museum opens this route. Keep all exterior dimensions.
 for(const portal of g.portals){
  const {x,z,width,height,sign}=portal,v=g.virtualAccess;
  const z0=z-width/2,z1=z+width/2;
  const data={status:v.status,currentDoorState:'UNKNOWN',portalId:portal.id};
  for(const [a,b] of [[n.frontZ,z0],[z1,n.rearZ]])solid('qinan-annex-side-panel','lattice_doors',nt,nh,b-a,x,floor+nh/2,(a+b)/2,data);
  solid('qinan-virtual-door-header','lattice_doors',nt,nh-height,width,x,floor+height+(nh-height)/2,z,data);
  // Fold the two leaves inward along the passage edges, not across the stair.
  for(const side of [-1,1])solid('qinan-virtual-open-door-leaf','lattice_doors',width/2,height,v.leafThickness,x-sign*width/4,floor+height/2,z+side*(width/2+v.leafInset),data);
 }
 // Plain painted beam/frieze bands convey tier heights without claiming the
 // unresolved complete dougong; four inner columns are separately source-derived.
 for(const z of [b.zs[0],b.zs.at(-1)])box('qinan-main-beam','caihua_beam',b.width+a.beamLengthExtension,a.beamHeight,a.beamWidth,0,g.levels.eaveColumnTop-a.beamHeight/2,z);
 for(const sign of [-1,1])box('qinan-main-beam','caihua_beam',a.beamWidth,a.beamHeight,b.depth,sign*b.width/2,g.levels.eaveColumnTop-a.beamHeight/2,0);
 box('qinan-annex-beam','caihua_beam',b.width+a.beamLengthExtension,a.annexBeamHeight,a.beamWidth,0,n.columnTopY-a.annexBeamHeight/2,n.frontZ);
 const upper=g.upperColumnHeadGrid,drumBottom=base+a.upperDrumBottomRelativeY,drumTop=g.levels.upperEavePurlinBottom;
 for(const z of [-upper.depth/2,upper.depth/2])box('qinan-upper-frieze','wall_red',upper.width,drumTop-drumBottom,a.upperFriezeThickness,0,(drumTop+drumBottom)/2,z,{status:'PROVISIONAL_EXTERIOR_SKIN'});
 for(const sign of [-1,1])box('qinan-upper-frieze','wall_red',a.upperFriezeThickness,drumTop-drumBottom,upper.depth,sign*upper.width/2,(drumTop+drumBottom)/2,0,{status:'PROVISIONAL_EXTERIOR_SKIN'});
 for(const z of [-upper.depth/2,upper.depth/2])for(const x of upper.xs)box('qinan-upper-grid-pilaster','wood_column',a.upperPilasterWidth,drumTop-drumBottom,a.upperPilasterDepth,x,(drumTop+drumBottom)/2,z,{status:'PROVISIONAL_FRIEZE_ARTICULATION_NOT_GOLDEN_COLUMNS'});
 const railPosts=new Set();
 for(const [x0,z0,x1,z1] of g.railSegments){
  const len=Math.hypot(x1-x0,z1-z0),count=Math.max(1,Math.ceil(len/g.supportApproximation.railPostSpacingMax)),t=g.supportApproximation.railThickness,h=g.supportApproximation.railHeight;
  for(let i=0;i<=count;i++){const x=x0+(x1-x0)*i/count,z=z0+(z1-z0)*i/count,key=`${x.toFixed(6)},${z.toFixed(6)}`;if(!railPosts.has(key)){railPosts.add(key);solid('qinan-railing-post','marble',t,h,t,x,floor+h/2,z);}}
  const alongX=Math.abs(x1-x0)>Math.abs(z1-z0);
  solid('qinan-railing-panel','marble',alongX?len:t,g.supportApproximation.railPanelHeight,alongX?t:len,(x0+x1)/2,floor+g.supportApproximation.railPanelCenterAboveFloor,(z0+z1)/2);
  solid('qinan-railing-hand','marble',alongX?len:t,g.supportApproximation.railHandHeight,alongX?t:len,(x0+x1)/2,floor+g.supportApproximation.railHandCenterAboveFloor,(z0+z1)/2);
 }
 // R72 room registration only, preserving architecture and virtual-entry policy.
 kit.registerRoom(f,{name:'钦安殿·主殿',kind:'virtual-tour',x0:-b.width/2+.4,x1:b.width/2-.4,z0:b.zs[0]+.3,z1:b.zs.at(-1)-.4,y:floor,h:g.levels.eaveColumnTop-floor-.3,doors:[]});
 kit.registerRoom(f,{name:'钦安殿·前抱厦',kind:'virtual-tour',x0:-b.width/2+.4,x1:b.width/2-.4,z0:g.southAnnex.frontZ+.3,z1:b.zs[0]-.1,y:floor,h:g.southAnnex.columnTopY-floor-.3,doors:[]});
 buildQinanRoof(kit,f,g);
 buildQinanNamePlaque(kit,f,g);
 f.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(f),roles={};let triangles=0;
 f.traverse(o=>{if(!o.isMesh)return;const role=o.userData.role;const n=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;const r=roles[role]??={meshInstances:0,triangleInstances:0};r.meshInstances++;r.triangleInstances+=n;triangles+=n;});
 const {toWorld,...contract}=g;
 f.userData.structure={...contract,storeys:1,eaveCount:2,annexEaveCount:1,streamLayer:'B',accessStatus:g.navigation.accessStatus,currentConditionAccepted:false,
  bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},roleBudget:{roles,triangleInstances:triangles,oldFullHallTriangles:3382,oldAlternativeSilhouetteTriangles:800,comparison:'Full hall and unloaded roof-only silhouette are alternative states, not additive draw-call savings.'}};
 const minX=Math.min(...g.map.footprints.map(p=>p.x-p.w/2)),maxX=Math.max(...g.map.footprints.map(p=>p.x+p.w/2)),minZ=Math.min(...g.map.footprints.map(p=>p.z-p.d/2)),maxZ=Math.max(...g.map.footprints.map(p=>p.z+p.d/2));
 kit.mapItems.push({kind:'hall',name:item.name??g.name,x:(minX+maxX)/2,z:(minZ+maxZ)/2,w:maxX-minX,d:maxZ-minZ,structure:'qinan-hall',qinanProfile:'qinan',profileId:g.profileId,profileHash:g.profileHash,footprints:g.map.footprints,labelAnchor:g.map.labelAnchor,navigation:g.navigation,dimensionStatus:'mixed-evidence-exterior-prototype'});
 return {f,g,PW:maxX-minX,PD:maxZ-minZ,top:floor};
}
