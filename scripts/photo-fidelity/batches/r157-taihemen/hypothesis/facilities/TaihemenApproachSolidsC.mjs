// C-only visible southern solids. Central115px is a COMPOSITE,not all stone.
import * as T from'three';
import{buildBalustrade}from'../../../../../../src/scene/HallKit.js';
import{closedTerraceStairGeometry}from'../../../../../../src/scene/palace/ThreeHallTerrace.js';
import{applyBoxUV}from'../../../../../../src/utils/GeometryUV.js';
import{createTriangleTemplate,triangleInstance}from'../../../../../../src/utils/TriangleSupport.js';

export function validateCentralGroupC(p){
 const c=p?.centralGroup;
 if(!c||![c.width,c.stoneWidth,c.run,c.zToe,c.outerCurbWidth,c.treadCount].every(Number.isFinite)||c.stoneWidth<=0||c.stoneWidth>=c.width||c.zToe>=p.zToe||c.shoulders?.length!==2||c.fences?.length!==2||c.physicsOwnerIds?.length!==10)throw Error('Taihemen C central composite source profile invalid');
}
function ownExactMesh(builder,mesh,id){
 mesh.updateWorldMatrix(true,false);
 const a=mesh.geometry.attributes.position,positions=new Float64Array(a.count*3);for(let i=0;i<a.count;i++){const v=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(mesh.matrixWorld);positions.set(v.toArray(),i*3);}const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(positions,3));if(mesh.geometry.index)geometry.setIndex([...mesh.geometry.index.array]);const template=createTriangleTemplate(geometry),shape=triangleInstance(template,[0,0,0],id),box=shape.box.clone();
 geometry.dispose();box.triangleSupport={template,offset:new T.Vector3(),id};builder.colliders.push(box);
 mesh.userData.centralPart={...(mesh.userData.centralPart??{}),exactPhysicsOwner:id};
}
function ownExactAssembly(builder,group,id){
 group.updateWorldMatrix(true,true);const positions=[];
 group.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position,ix=m.geometry.index,n=ix?.count??a.count;for(let i=0;i<n;i++){const v=new T.Vector3().fromBufferAttribute(a,ix?ix.getX(i):i).applyMatrix4(m.matrixWorld);positions.push(...v.toArray());}});
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float64Array(positions),3));const template=createTriangleTemplate(g),shape=triangleInstance(template,[0,0,0],id),box=shape.box.clone();g.dispose();box.triangleSupport={template,offset:new T.Vector3(),id};builder.colliders.push(box);
}
function addOuterStairs(builder,parent,p,marble){
 const {zEdge,zToe,y0,y1,run,width,halfWidth,cheekWidth:cw}=p,rise=y1-y0,length=Math.hypot(run,rise);
 for(const[a,b]of[[-halfWidth,-width/2],[width/2,halfWidth]]){builder.col(a,y0,zEdge,b,y1,zEdge+.5);builder.rail(parent,a+.2,zEdge+.2,b-.2,zEdge+.2,y1);}
 for(const f of p.flights){
  const g=new T.Group();g.name=f.id;parent.add(g);
  const geo=closedTerraceStairGeometry({...f,xEdge:0,centerZ:0,dir:1},builder.library.tileSize('marble'));geo.rotateY(Math.PI/2);geo.translate(f.centerX,0,zEdge);
  const m=new T.Mesh(geo,marble);m.name=f.id+':closed-treads';m.castShadow=m.receiveShadow=true;g.add(m);
  for(const side of[-1,1]){const x=f.centerX+side*(f.width/2-cw/2),cheek=builder.box(g,marble,cw,.4,length,x,(y0+y1)/2+.1,(zEdge+zToe)/2,{box:2});cheek.rotation.x=-Math.atan2(rise,run);
   const rail=buildBalustrade(builder.library,{length:run,height:1.1});rail.name=f.id+':sloped-rail:'+side;const mesh=rail.children[0],a=mesh.geometry.attributes.position;for(let i=0;i<a.count;i++)a.setY(i,a.getY(i)-a.getX(i)*rise/run);a.needsUpdate=true;mesh.geometry.computeVertexNormals();rail.rotation.y=Math.PI/2;rail.position.set(x,(y0+y1)/2+.25,(zEdge+zToe)/2);g.add(rail);
   for(let j=0;j<8;j++)builder.col(f.centerX+side*(f.width/2-cw),y0,zEdge-j*run/8,f.centerX+side*f.width/2,y1-j*rise/8+1.35,zEdge-(j+1)*run/8);
  }
  const n=builder.walkables.length;builder.walkRampZ(f.ramp.minX,f.ramp.maxX,zEdge,zToe,y1,y0);builder.walkables[n].structureId=f.id;
 }
 // These closures correspond to existing rendered vertical sumeru faces.
 for(const r of p.frontGapClosures)builder.col(r.minX,r.minY,r.minZ,r.maxX,r.maxY,r.maxZ);
}
function addPhotoFence(builder,parent,p,f,material){
 const c=p.centralGroup,g=new T.Group();g.name=f.id;g.userData.structure={id:f.id,entityId:'FC-B3B12CF397',accepted:false,profile:f};parent.add(g);
 const box=(w,h,d,x,y,z)=>{const m=builder.box(g,material,w,h,d,x,y,z);m.userData.centralPart={role:'photographed-barrier-member',accepted:false};return m;};
 for(const y of[f.baseY+.20,f.baseY+f.height])box(c.width,.045,.08,0,y,f.z);
 const count=Math.ceil(c.width/.24);for(let i=0;i<=count;i++)box(.028,f.height,.045,-c.width/2+i*c.width/count,f.baseY+f.height/2,f.z);
 ownExactAssembly(builder,g,f.id);
}
export function buildTaihemenApproachSolidsC(builder,parent,p){
 validateCentralGroupC(p);parent.userData.taihemenSouth=p;
 const c=p.centralGroup,marble=builder.library.material('marble'),rise=p.y1-p.y0,length=Math.hypot(c.run,rise),angle=Math.atan2(rise,c.run),group=new T.Group();group.name='taihemen-c-central-composite';parent.add(group);
 addOuterStairs(builder,parent,p,marble);
 const section=new T.Shape();section.moveTo(0,0);section.lineTo(c.run,0);section.lineTo(0,rise);section.closePath();
 const base=new T.ExtrudeGeometry(section,{depth:c.stoneWidth,bevelEnabled:false,steps:1,curveSegments:1});base.translate(0,0,-c.stoneWidth/2);base.rotateY(Math.PI/2);base.translate(0,p.y0,p.zEdge);
 const body=new T.Mesh(applyBoxUV(base,builder.library.tileSize('marble')),marble);body.name='taihemen-c-central-stone-body';body.userData.centralPart={role:'stone-body',accepted:false};body.castShadow=body.receiveShadow=true;group.add(body);ownExactMesh(builder,body,c.physicsOwnerIds[0]);
 // Top surface exactly follows the rendered ramp plane;thickness is below it.
 const th=.12,slab=builder.box(group,builder.library.material('yulu'),c.stoneWidth,th,length,0,(p.y0+p.y1)/2-th*Math.cos(angle)/2,(p.zEdge+c.zToe)/2+th*Math.sin(angle)/2,{box:2});slab.rotation.x=-angle;slab.name='taihemen-c-central-carved-stone-placeholder';slab.userData.centralPart={role:'stone-cap-carving-unreproduced',accepted:false};ownExactMesh(builder,slab,c.physicsOwnerIds[1]);
 for(const[i,f]of c.shoulders.entries()){
  const g=new T.Group();g.name=f.id;g.userData.structure={id:f.id,entityId:'FC-B3B12CF397',accepted:false,profile:f};group.add(g);
  const geo=closedTerraceStairGeometry({...f,xEdge:0,centerZ:0,dir:1},builder.library.tileSize('marble'));geo.rotateY(Math.PI/2);geo.translate(f.centerX,0,p.zEdge);const m=new T.Mesh(geo,marble);m.name=f.id+':closed-treads';m.castShadow=m.receiveShadow=true;m.userData.centralPart={role:'shoulder-treads',accepted:false};g.add(m);ownExactMesh(builder,m,c.physicsOwnerIds[2+i]);
  const x=f.side*(c.width/2-c.outerCurbWidth/2),curb=builder.box(g,marble,c.outerCurbWidth,.4,length,x,(p.y0+p.y1)/2+.1,(p.zEdge+c.zToe)/2,{box:2});curb.rotation.x=-angle;curb.name=f.id+':outer-stone-cheek';curb.userData.centralPart={role:'shoulder-cheek',accepted:false};ownExactMesh(builder,curb,c.physicsOwnerIds[4+i]);
  const rail=buildBalustrade(builder.library,{length:c.run,height:1.1}),mesh=rail.children[0],a=mesh.geometry.attributes.position;for(let j=0;j<a.count;j++)a.setY(j,a.getY(j)-a.getX(j)*rise/c.run);a.needsUpdate=true;mesh.geometry.computeVertexNormals();rail.rotation.y=Math.PI/2;rail.position.set(x,(p.y0+p.y1)/2+.25,(p.zEdge+c.zToe)/2);mesh.userData.centralPart={role:'shoulder-outer-rail',accepted:false};g.add(rail);ownExactMesh(builder,mesh,c.physicsOwnerIds[6+i]);
 }
 // Both barriers are visible in the selected official front photo. Their bar
 // count/height are coarse fits,not a statement about post2026 works/access.
 const metal=builder.ownMat('taihemen-c-photo-barrier',{name:'taihemen-c-photo-barrier',color:0x292d2b,roughness:.8,metalness:.25});for(const f of c.fences)addPhotoFence(builder,group,p,f,metal);
}
