import * as T from 'three';
import {attachWumenSidePortalFaces} from './WumenSidePortalFaces.js';
import {attachWumenRightLeafStuds} from './WumenRightLeafStuds.js';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
import {cloneOverheadShape} from '../../../utils/OverheadShape.js';

const freeze=o=>{if(o&&typeof o==='object'){Object.values(o).forEach(freeze);Object.freeze(o);}return o;};
// Own north/south photo ratios under retained outer-envelope anchors. Neither
// these dimensions nor the unobserved elbow/soffit are survey reconstruction.
export const WUMEN_LOWER_PROFILE=freeze({id:'wumen-lower-five-mouths',objectId:'FC-AD4377DF51',
 status:'SOURCE_TOPOLOGY_CONDITIONAL_ENGINEERING_NOT_SURVEY',
 bounds:{halfWidth:60,south:-13.3,north:18.6,height:12,wingSouth:-62.4,wingInner:40.6},
 central:[{id:'east-wang',x:-14.5,width:4.7,crown:5.8},{id:'emperor',x:0,width:5.4,crown:6.3},{id:'west-wang',x:14.5,width:4.7,crown:5.8}],
 lateral:[{id:'east-yemen',sign:-1,x:-48,width:3.8,crown:5.4,sideZ:-16.5},{id:'west-yemen',sign:1,x:48,width:3.8,crown:5.4,sideZ:-16.5}],
 headDepth:1.2,lining:.3,arcSegments:32,
 sources:['https://img.dpm.org.cn/Uploads/Picture/2019/12/31/s5e0ad0346e8b3.jpg','https://img.dpm.org.cn/Uploads/Picture/2019/12/31/s5e0aaffe2cc85.jpg','https://www.dpm.org.cn/Uploads/File/2020/10/23/u5f9254d1598ec.pdf','https://www.dpm.org.cn/Uploads/pdf/4884/T00175_00.pdf'],
 unknowns:['exact-side-mouth-retreat','hidden-bend-curvature-and-vault-transitions','current-door-access-policy','south-north-envelope-scale-residual'],
});

export function wumenLowerGeometry(data){
 const d=data?.dimensions,p=WUMEN_LOWER_PROFILE,b=p.bounds;
 if(data?.name!=='午门'||!d||d.platformWidth!==120||d.platformHeight!==12||d.platformSouth!==b.south||d.platformNorth!==b.north||d.wingSouth!==b.wingSouth||d.wingInnerX!==b.wingInner||![data.position?.x,data.position?.z].every(Number.isFinite)||(data.lowerDoorsOpen!==undefined&&typeof data.lowerDoorsOpen!=='boolean'))throw Error('Invalid own Wumen lower-base contract');
 const rect=(x0,x1,z0,z1)=>({x0:Math.min(x0,x1),x1:Math.max(x0,x1),z0,z1});
 const routes=p.central.map(o=>({...o,kind:'central',rects:[rect(o.x-o.width/2,o.x+o.width/2,b.south,b.north)],points:[[o.x,b.south-2],[o.x,b.north+2]]}));
 for(const o of p.lateral){const h=o.width/2;routes.push({...o,kind:'lateral',rects:[rect(o.x-h,o.x+h,o.sideZ-h,b.north),rect(o.sign*b.wingInner,o.x+o.sign*h,o.sideZ-h,o.sideZ+h)],points:[[o.sign*(b.wingInner-2),o.sideZ],[o.x,o.sideZ],[o.x,b.north+2]]});}
 return {profile:p,routes,open:data.lowerDoorsOpen!==false};
}

function triangleBody(builder,mesh,id){
 mesh.updateWorldMatrix(true,false);
 const geometry=mesh.geometry.clone();
 // Preserve the rendered local Float32 vertices plus double-precision object
 // transform. Baking world Y back into Float32 raises the retained12.3 slab
 // by0.19 micrometres and falsely blocks its exact-height ascent entry.
 geometry.setAttribute('position',new T.BufferAttribute(new Float64Array(mesh.geometry.attributes.position.array),3));
 geometry.applyMatrix4(mesh.matrixWorld);
 try{const owner=triangleInstance(createTriangleTemplate(geometry),[builder.ox,0,builder.oz],`axis/wumen-lower/${id}`),box=owner.box.clone();box.triangleSupport=owner;builder.colliders.push(box);}finally{geometry.dispose();}
}

export function buildWumenLowerBase(builder,parent,data){
 const g=wumenLowerGeometry(data),p=g.profile,b=p.bounds;
 if(parent?.name!=='午门'||parent.position.lengthSq()||parent.rotation.toArray().slice(0,3).some(Boolean)||parent.scale.toArray().some(v=>v!==1)||builder.ox!==data.position.x||builder.oz!==data.position.z)throw Error('Invalid own Wumen lower-base host/origin');
 if(parent.children.some(c=>c.userData.structure?.id==='axis/wumen-lower-base'))throw Error('Wumen lower-base already installed');
 const root=new T.Group();root.name='wumen-lower-five-portals';parent.add(root);
 root.userData.structure={id:'axis/wumen-lower-base',objectId:p.objectId,status:p.status,wholeObjectAccepted:false,profile:p.id,sources:p.sources,unknowns:p.unknowns,doorState:'GAMEPLAY_STATE_NOT_VERIFIED_CURRENT_ACCESS'};
 root.userData.wumenLower={routes:g.routes,open:g.open};
 const box=(mat,x0,x1,y0,y1,z0,z1,role)=>{const m=builder.libBox(root,mat,x1-x0,y1-y0,z1-z0,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2,mat==='sumeru_band'?'band':'box');m.userData.wumenLowerPart=role;return m;};
 const col=(x0,x1,y0,y1,z0,z1,overhead=false)=>{builder.col(x0,y0,z0,x1,y1,z1);if(overhead){const q=builder.colliders.at(-1);q.overhead=cloneOverheadShape({type:'piecewise-linear-x',sourceId:'axis/wumen-lower/flat-soffit',points:[[q.min.x,y0],[q.max.x,y0]],minZ:q.min.z,maxZ:q.max.z,topY:y1},q);}};
 const inside=(r,x,z)=>x>r.x0-1e-8&&x<r.x1+1e-8&&z>r.z0-1e-8&&z<r.z1+1e-8;
 const xs=[...new Set([-60,-40.6,40.6,60,...g.routes.flatMap(r=>r.rects.flatMap(q=>[q.x0,q.x1]))])].sort((a,c)=>a-c);
 const zs=[...new Set([b.wingSouth,b.south,b.north-p.headDepth,b.north,...g.routes.flatMap(r=>r.rects.flatMap(q=>[q.z0,q.z1]))])].sort((a,c)=>a-c);
 // A finite partition of the actual concave base minus the five connected
 // voids. Adjacent equal cells are merged along X; no black hole decals.
 for(let j=1;j<zs.length;j++){
  const z0=zs[j-1],z1=zs[j],z=(z0+z1)/2,segments=[];
  for(let i=1;i<xs.length;i++){
   const x0=xs[i-1],x1=xs[i],x=(x0+x1)/2;
   if(!(z>=b.south||Math.abs(x)>=b.wingInner))continue;
   const route=g.routes.find(r=>r.rects.some(q=>inside(q,x,z)));
   if(route&&z>=b.north-p.headDepth)continue; // own curved north masonry below
   const low=route?route.crown:0,last=segments.at(-1);
   if(last&&last.low===low&&Math.abs(last.x1-x0)<1e-8)last.x1=x1;else segments.push({x0,x1,low});
  }
  for(const s of segments){
   if(s.low===0){
    // Only the photographed north neck has a registered brick jamb. Split
    // the existing wall faces, not a coplanar decal or a narrower aperture;
    // deep hidden tunnel masonry and all physical bounds stay unchanged.
    const jambs=z0===b.north-p.headDepth&&z1===b.north?g.routes.flatMap(o=>{
     const spring=o.crown-o.width/2,out=[];
     if(Math.abs(s.x1-(o.x-o.width/2))<1e-8)out.push({face:0,spring});
     if(Math.abs(s.x0-(o.x+o.width/2))<1e-8)out.push({face:1,spring});
     return out;
    }):[];
    const ys=[...new Set([0,1.2,b.height,...jambs.map(j=>j.spring)])].sort((a,b)=>a-b);
    for(let k=1;k<ys.length;k++){
     const y0=ys[k-1],y1=ys[k],m=box(y1<=1.2?'sumeru_band':'wall_red',s.x0,s.x1,y0,y1,z0,z1,y1<=1.2?'base-band':'solid-base');
     const faces=new Set(jambs.filter(j=>y1<=j.spring).map(j=>j.face));
     if(faces.size){
      const indices=m.geometry.index?Array.from(m.geometry.index.array):Array.from({length:m.geometry.attributes.position.count},(_,i)=>i),selected=[],retained=[];
      for(const group of m.geometry.groups)(faces.has(group.materialIndex)?selected:retained).push(...indices.slice(group.start,group.start+group.count));
      let geo=m.geometry.clone();geo.setIndex(selected);geo.clearGroups();geo=applyBoxUV(geo,builder.library.tileSize('wall_brick'),{offsetV:m.position.y/builder.library.tileSize('wall_brick')});
      m.geometry.setIndex(retained);m.geometry.clearGroups();
      const lining=new T.Mesh(geo,builder.library.material('wall_brick'));lining.position.copy(m.position);lining.castShadow=lining.receiveShadow=true;lining.userData.wumenLowerPart='north-vertical-jamb-lining';root.add(lining);
     }
    }
    col(s.x0,s.x1,0,b.height,z0,z1);
   }
   else{box('wall_brick',s.x0,s.x1,s.low,s.low+p.lining,z0,z1,'unverified-flat-inner-soffit');box('wall_red',s.x0,s.x1,s.low+p.lining,b.height,z0,z1,'tunnel-cap');col(s.x0,s.x1,s.low,b.height,z0,z1,true);}
  }
 }
 // Restore the original base band's0.1m perimeter projection without
 // expanding each new cell across a doorway or duplicating interior seams.
 const band=(x0,x1,z0,z1)=>{box('sumeru_band',x0,x1,0,1.2,z0,z1,'retained-perimeter-band');col(x0,x1,0,1.2,z0,z1);};
 const without=(lo,hi,holes)=>{const out=[];let a=lo;for(const[q0,q1]of holes.sort((x,y)=>x[0]-y[0])){if(q0>a)out.push([a,q0]);a=Math.max(a,q1);}if(a<hi)out.push([a,hi]);return out;};
 for(const side of[-1,1]){
  const outer=[side*60,side*60.1].sort((a,c)=>a-c);band(...outer,b.wingSouth-.1,b.north+.1);
  const inner=[side*40.5,side*40.6].sort((a,c)=>a-c),o=p.lateral.find(q=>q.sign===side);
  for(const[z0,z1]of without(b.wingSouth-.1,b.south,[[o.sideZ-o.width/2,o.sideZ+o.width/2]]))band(...inner,z0,z1);
  const wing=[side*40.5,side*60].sort((a,c)=>a-c);band(...wing,b.wingSouth-.1,b.wingSouth);
 }
 for(const[x0,x1]of without(-60,60,g.routes.map(o=>[o.x-o.width/2,o.x+o.width/2])))band(x0,x1,b.north,b.north+.1);
 for(const[x0,x1]of without(-40.6,40.6,p.central.map(o=>[o.x-o.width/2,o.x+o.width/2])))band(x0,x1,b.south-.1,b.south);
 const prism=(points,z0,z1,material,role,id)=>{
  const shape=new T.Shape(points.map(q=>new T.Vector2(...q))),geo=new T.ExtrudeGeometry(shape,{depth:z1-z0,bevelEnabled:false,steps:1,curveSegments:1});geo.translate(0,0,z0);geo.clearGroups();
  const mesh=new T.Mesh(applyBoxUV(geo,builder.library.tileSize(material)),builder.library.material(material));mesh.name=role;mesh.castShadow=mesh.receiveShadow=true;mesh.userData.wumenLowerPart=role;root.add(mesh);triangleBody(builder,mesh,id);return mesh;
 };
 for(const o of g.routes){
  const h=o.width/2,spring=o.crown-h,arc=Array.from({length:p.arcSegments+1},(_,i)=>{const a=Math.PI-i*Math.PI/p.arcSegments;return[o.x+h*Math.cos(a),spring+h*Math.sin(a)];}),outer=arc.map(([x,y])=>[x,y+p.lining]);
  prism([...outer,[o.x+h,b.height],[o.x-h,b.height]],b.north-p.headDepth,b.north,'wall_red','north-arched-cap',`${o.id}/north-cap`);
  prism([...arc,...outer.slice().reverse()],b.north-p.headDepth,b.north,'wall_brick','north-arched-lining',`${o.id}/north-lining`);
 }
 // These three retained solids are exactly axis-aligned boxes, not curved
 // portals. Register their authored bounds directly: this preserves the
 // exact12.3 floor and the existing link/furniture box-sweep interface.
 // Three actual top-face supports replace the former triangle support; the
 // original13 ascent/main records remain intact. Same-height main overlap
 // is explicit (max-height query), with no rescue/hidden elevated floor.
 // A redundant Float32 triangle floor would raise it by6e-9 and introduces
 // an unsupported shape into that interface. No empty space is box-filled.
 const top=(x0,x1,z0,z1,role,id)=>{const mesh=box('stone_slab',x0,x1,12,12.3,z0,z1,role);col(x0,x1,12,12.3,z0,z1);builder.colliders.at(-1).wumenLowerSlab=`axis/wumen-lower/${id}`;builder.walkables.push({type:'box',rescue:false,wumenLowerSlab:`axis/wumen-lower/${id}`,box:new T.Box3(new T.Vector3(x0+builder.ox,12.3,z0+builder.oz),new T.Vector3(x1+builder.ox,12.3,z1+builder.oz))});return mesh;};
 const platform=top(-60.2,60.2,b.south-.2,b.north+.2,'retained-main-top','main-top');
 for(const s of[-1,1]){const x0=Math.min(s*40.6,s*60),x1=Math.max(s*40.6,s*60);top(x0-.2,x1+.2,b.wingSouth-.2,b.south,'retained-wing-top',`wing-top/${s}`);}
 const lacquer=new T.MeshStandardMaterial({name:'wumen_lower_lacquer',color:0x8a2419,roughness:.8});builder.ownedMaterials.push(lacquer);
 for(const o of g.routes){
  const frame=new T.Group();frame.name=`wumen-lower-door/${o.id}`;
  frame.position.set(o.kind==='central'?o.x:o.sign*b.wingInner,0,o.kind==='central'?b.south+1:o.sideZ);
  if(o.kind==='lateral')frame.rotation.y=o.sign*Math.PI/2;
  frame.userData.structure={id:`axis/wumen-lower/${o.id}`,objectId:p.objectId,kind:o.kind,doorOpen:g.open,hiddenVault:'UNVERIFIED_ENGINEERING_VOLUME'};root.add(frame);
  const width=(o.width-.24)/2,height=o.crown-.2;
  for(const side of[-1,1]){
   const hinge=new T.Group();hinge.position.x=side*(o.width/2-.12);hinge.rotation.y=g.open?side*Math.PI/2:0;frame.add(hinge);
   const leaf=new T.Mesh(new T.BoxGeometry(width,height,.22),lacquer);leaf.position.set(-side*width/2,height/2,0);leaf.userData.wumenLowerPart='door-solid';leaf.castShadow=leaf.receiveShadow=true;hinge.add(leaf);
   // Central generic type retained. Only one separately registered lateral
   // photo face is detailed below; never mirror hardware to hidden backs.
   if(o.kind==='central'){const face=new T.Mesh(new T.PlaneGeometry(width,height),builder.library.material('door_studded'));face.position.set(-side*width/2,height/2,-.111);face.rotation.y=Math.PI;hinge.add(face);}
   attachWumenRightLeafStuds(builder,leaf,{portalId:o.id,side,width,height});
   triangleBody(builder,leaf,`${o.id}/leaf/${side}`);
  }
 }
 attachWumenSidePortalFaces(builder,root,p);
 return {...g,root,platform};
}

export function buildWumenLowerSouthCanopies(builder,parent,geometry){
 if(geometry?.profile!==WUMEN_LOWER_PROFILE)throw Error('Own Wumen lower profile required');
 const root=new T.Group();root.name='wumen-south-three-canopies';root.userData.structure={id:'axis/wumen-south-three-canopies',objectId:WUMEN_LOWER_PROFILE.objectId,status:'SOURCE_TYPE_ENGINEERING_DIMENSIONS'};
 for(const o of geometry.profile.central){const depth=1.14,geo=new T.BoxGeometry(o.width+1.4,.18,depth),a=geo.attributes.position;
  for(let i=0;i<a.count;i++){const t=(a.getZ(i)+depth/2)/depth;a.setY(i,o.crown+.1+.2*t+a.getY(i)+.09);}geo.computeVertexNormals();
  const mesh=new T.Mesh(applyBoxUV(geo,builder.library.tileSize('roof_tile')),builder.library.material('roof_tile'));mesh.position.set(o.x,0,-13.83);mesh.userData.wumenLowerPart='south-protective-canopy';mesh.castShadow=mesh.receiveShadow=true;root.add(mesh);
 }
 parent.add(root);return root;
}
