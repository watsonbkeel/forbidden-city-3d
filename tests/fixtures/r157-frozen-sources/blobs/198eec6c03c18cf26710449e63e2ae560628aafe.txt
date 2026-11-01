import {CIYIN_FACADE_REGION,validateCiyinFacadeScope} from '../../../controls/CiyinFacadeSupport.js';
import * as T from 'three';
const SOURCE='https://www.dpm.org.cn/explore/building/236574.html';
const GALLERY='https://www.dpm.org.cn/explore/building/236536.html';
const PHOTO='https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efee59ec132b.jpg';
const PLAQUE='https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efee59ebf97e.jpg';
/** Whole source-facing facade. Painted motifs are coplanar colored geometry on
 * closed solid backing, not photographs, holes, relief scans or hidden planes.
 * The stepped rail drops are deliberately rectilinear silhouette fits: every
 * protruding block has its own exact visible Float32 cuboid collision owner. */
export function buildCiyinFacade(c){
 const {kit,f,g,p}=c;
 if(p.id!=='place-outer-west-930b046fd0'||p.key!=='ciyin'||g.w!==24.2||g.d!==11.8||g.bays!==5||g.y!==.6||g.upperY!==4.8||f.parent!==kit.root||f.position.x!==258.5||f.position.z!==128.1||f.rotation.y!==0||f.userData.ciyinFacade)throw Error('Ciyin facade requires the exact retained two-storey five-bay source binding');
 const colors={red:0x8d3828,dark:0x412d22,gold:0xc7a55a,green:0x397b68,blue:0x345c85,ivory:0xd5d1ac,stone:0xa9aaa1};
 const mats={};for(const [name,color]of Object.entries(colors)){mats[name]=new T.MeshStandardMaterial({name:'ciyin_'+name+'_photo_fit',color,roughness:.84});kit.owned.push(mats[name]);}// Semantic depth layers survive material merge: dark/blue/green bases, red lattice, gold overlay.
 const paint={};for(const [name,color]of Object.entries(colors)){paint[name]=new T.MeshStandardMaterial({name:'ciyin_flush_'+name+'_photo_field',color,roughness:.84,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:name==='gold'?-3:name==='red'?-2:-1,polygonOffsetUnits:name==='gold'?-3:name==='red'?-2:-1});kit.owned.push(paint[name]);}
 const solids=[],A=g.w/2,bay=g.w/5,front=g.front+.10,railZ=-g.d/2+.12;
 const tag=(m,role,extra={})=>{m.name=role;m.userData={...m.userData,role,ciyinFacade:true,source:SOURCE,gallery:GALLERY,image:PHOTO,precision:'PHOTO_RELATIONSHIP_FIT_NOT_SURVEY_OR_EXACT_CARVING',...extra};return m;};
 function block(role,mat,w,h,d,x,y,z,extra={}){const m=tag(kit.mesh(f,new T.BoxGeometry(w,h,d),mats[mat],x,y,z),role,extra);if(extra.walkable){const p=m.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,Math.max(0,Math.min(h,p.getY(i)+h/2)));m.position.y=0;}solids.push(m);return m;}
 // All painted triangles lie on one actual backing face, with real geometry
 // sharing that face coordinate. Renderer depth bias changes no source vertex.
 function drawing(owner,face='south'){
  owner.geometry.computeBoundingBox();const b=owner.geometry.boundingBox,ps=[],groups=[];
  const bounds=face==='south'?{u0:b.min.x,u1:b.max.x,v0:b.min.y,v1:b.max.y}:{u0:b.min.z,u1:b.max.z,v0:b.min.y,v1:b.max.y};
  function polygon(points,color){if(points.length<3)return;const start=ps.length/3;for(let i=1;i<points.length-1;i++)for(const [u,v]of[points[0],points[i],points[i+1]])ps.push(...(face==='south'?[u,v,b.min.z]:[b.min.x,v,u]));groups.push({start,count:ps.length/3-start,color});}
  function rect(x,y,w,h,color){polygon([[x-w/2,y-h/2],[x+w/2,y-h/2],[x+w/2,y+h/2],[x-w/2,y+h/2]],color);}
  function line(x0,y0,x1,y1,width,color,clip=bounds){const dx=x1-x0,dy=y1-y0,len=Math.hypot(dx,dy);if(!len)return;const nx=-dy/len*width/2,ny=dx/len*width/2;let q=[[x0+nx,y0+ny],[x1+nx,y1+ny],[x1-nx,y1-ny],[x0-nx,y0-ny]];for(const [axis,limit,sign]of[[0,clip.u0,1],[0,clip.u1,-1],[1,clip.v0,1],[1,clip.v1,-1]]){const next=[];for(let i=0;i<q.length;i++){const a=q[i],v=q[(i+1)%q.length],inside=sign*(a[axis]-limit)>=0,vin=sign*(v[axis]-limit)>=0;if(inside)next.push(a);if(inside!==vin){const t=(limit-a[axis])/(v[axis]-a[axis]);next.push([a[0]+(v[0]-a[0])*t,a[1]+(v[1]-a[1])*t]);}}q=next;if(!q.length)return;}polygon(q,color);}
  function frame(x,y,w,h,color,width=.018){rect(x,y-h/2+width/2,w,width,color);rect(x,y+h/2-width/2,w,width,color);rect(x-w/2+width/2,y,width,h,color);rect(x+w/2-width/2,y,width,h,color);}
  function diamondGrid(x,y,w,h){const clip={u0:x-w/2,u1:x+w/2,v0:y-h/2,v1:y+h/2},pitch=.22;rect(x,y,w,h,'dark');for(const sign of[-1,1])for(let off=-w/2-h;off<w/2+h;off+=pitch)line(x+off,y-h/2,x+off+sign*h*.55,y+h/2,.014,'red',clip);for(let yy=clip.v0+.12;yy<clip.v1;yy+=.22)for(let xx=clip.u0+.09;xx<clip.u1;xx+=.22)rect(xx,yy,.022,.022,'gold');frame(x,y,w,h,'gold',.015);}
  function finish(){const byColor=new Map();for(const q of groups){if(!byColor.has(q.color))byColor.set(q.color,[]);byColor.get(q.color).push(...ps.slice(q.start*3,(q.start+q.count)*3));}for(const [color,points]of byColor){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(points,3));geo.addGroup(0,points.length/3,0);geo.computeVertexNormals();const m=tag(new T.Mesh(geo,paint[color]),'ciyin-photo-flush-painted-detail',{representation:'FLAT_COLOR_FIELDS_NOT_PIERCED_LATTICE_OR_CARVED_RELIEF',colorField:color});owner.add(m);}}

  return{bounds,rect,line,frame,diamondGrid,finish};
 }
 function leafPattern(m,door,face='south'){const d=drawing(m,face),b=d.bounds,w=b.u1-b.u0,h=b.v1-b.v0,cx=(b.u0+b.u1)/2,cy=(b.v0+b.v1)/2;d.frame(cx,cy,w-.035,h-.035,'gold',.016);const panel=door?.70:.24;d.diamondGrid(cx,b.v0+panel+(h-panel-.12)/2,w-.13,h-panel-.12);d.frame(cx,b.v0+panel/2,w-.13,panel-.12,'gold',.025);if(door){const r=.10;for(const sign of[-1,1])d.line(cx-r,b.v0+panel/2,cx,b.v0+panel/2+sign*.12,.018,'gold');for(const sign of[-1,1])d.line(cx,b.v0+panel/2+sign*.12,cx+r,b.v0+panel/2,.018,'gold');}d.finish();}
 const lowerTypes=['door','window','window','window','door'],upperTypes=['window','window','door','window','window'];
 for(const [level,yy,H,types]of[[0,g.y,4.05,lowerTypes],[1,g.upperY,3.5,upperTypes]])for(let i=0;i<5;i++){
  const x0=-A+i*bay,x1=x0+bay,cx=(x0+x1)/2,door=types[i]==='door',sill=door?0:level?.62:.95,head=.82,lh=H-head-sill,leafW=(bay-.32)/4;
  block('ciyin-photo-jamb','red',.11,H,.26,x0+.055,yy+H/2,front,{level,bay:i});block('ciyin-photo-jamb','red',.11,H,.26,x1-.055,yy+H/2,front,{level,bay:i});
  if(!door)block('ciyin-photo-sill',level?'red':'stone',bay-.11,sill,.30,cx,yy+sill/2,front,{level,bay:i});
  for(let k=0;k<4;k++){
   const x=door?(k<2?x0+.16+k*.13:x1-.16-(3-k)*.13):x0+.16+(k+.5)*leafW,z=door?front+leafW/2+.04:front;
   const m=block('ciyin-photo-leaf','red',door?.10:leafW-.025,lh,door?leafW:.14,x,yy+sill+lh/2,z,{level,bay:i,leaf:k,type:types[i],openingPose:door?'MODEL_OPEN_NOT_VISITOR_PERMISSION':'CLOSED'});leafPattern(m,door,door?'west':'south');
  }
  block('ciyin-photo-crossbar','red',bay-.11,.12,.25,cx,yy+H-head+.06,front,{level,bay:i});
  const transom=block('ciyin-photo-transom','red',bay-.20,.52,.20,cx,yy+H-.40,front,{level,bay:i}),d=drawing(transom);for(let k=0;k<3;k++)d.diamondGrid((k-1)*(bay-.32)/3,0,(bay-.44)/3,.34);d.finish();
  block('ciyin-photo-head','red',bay,.14,.26,cx,yy+H-.07,front,{level,bay:i});
 }
 function paintedBeam(role,w,h,d,x,y,z){const m=block(role,'green',w,h,d,x,y,z),p=drawing(m);p.frame(0,0,w-.02,h-.02,'gold',.025);const n=Math.max(1,Math.round(w/1.1));for(let i=0;i<n;i++){const cx=-w/2+(i+.5)*w/n,ww=w/n-.10;p.rect(cx,0,ww,h-.12,i%2?'green':'blue');p.frame(cx,0,ww,h-.12,'gold',.014);for(const sign of[-1,1]){p.line(cx-ww*.38,0,cx,sign*(h-.20)/2,.015,'gold');p.line(cx,sign*(h-.20)/2,cx+ww*.38,0,.015,'gold');}}p.finish();return m;}
 paintedBeam('ciyin-photo-beam',g.w+.15,.38,.22,0,g.upperY-.20,-g.d/2-.12);
 for(let i=0;i<5;i++)paintedBeam('ciyin-photo-beam',bay-.12,.62,.30,-A+(i+.5)*bay,g.upperY+g.upperH-.48,-g.d/2-.04);
 const posts=f.children.filter(m=>m.userData.role==='ciyin-upper-front-rail-baluster').sort((a,b)=>a.position.x-b.position.x);
 if(posts.length!==38)throw Error('Ciyin original front rail rhythm changed');
 for(const m of f.children.filter(m=>['ciyin-upper-front-rail','ciyin-upper-front-rail-lower','ciyin-upper-front-rail-baluster'].includes(m.userData.role)))m.material=m.userData.role.endsWith('baluster')?mats.ivory:mats.green;
 for(let i=0;i<posts.length-1;i++){const lo=posts[i].position.x+.035,hi=posts[i+1].position.x-.035;paintedBeam('ciyin-photo-rail-panel',hi-lo,.22,.09,(lo+hi)/2,g.upperY+.20,railZ);}
 for(const post of posts.slice(1,-1))for(const [bottom,top,width,mat]of[[.40,.46,.065,'ivory'],[.46,.61,.045,'ivory'],[.61,.73,.075,'ivory'],[.73,.80,.13,'ivory'],[.80,.86,.21,'green']])block('ciyin-photo-rail-drop',mat,width,top-bottom,.08,post.position.x,g.upperY+(bottom+top)/2,railZ,{representation:'STEPPED_BOX_SILHOUETTE_FIT_NOT_EXACT_TAPER_OR_CARVING'});
 const edge=-g.d/2-(c.item.pad??.5),entryXs=[-A+bay/2,A-bay/2];
 for(const x of entryXs)for(let i=0;i<4;i++){const h=g.y*(i+1)/5,z=edge-.96+(i+.5)*.24;block('ciyin-photo-entry-step','stone',3.4,h,.24,x,h/2,z,{walkable:true,side:x<0?'east':'west',precision:'SOURCE_END_DOOR_ACCESS_FIT_NOT_MEASURED_STEPS'});}
 const board=block('ciyin-photo-nameboard','blue',3.20,1.25,.15,0,g.upperY+g.upperH-.45,-g.d/2-.36,{image:PLAQUE,labelPolicy:'CHINESE_IDENTIFICATION_ONLY_MANCHU_AND_CALLIGRAPHY_UNRECONSTRUCTED'}),bp=drawing(board);bp.frame(0,0,3.12,1.17,'gold',.07);bp.finish();
 kit.plaque(f,'慈荫楼',0,board.position.y,board.position.z-.075,2.8,.90);const plaque=kit.plaques.at(-1);for(const m of[plaque.mesh,plaque.frame]){m.userData.ciyinFacadeBacking=board;tag(m,'ciyin-photo-identification-label',{image:PLAQUE,labelPolicy:board.userData.labelPolicy});}
 // Local matrices are baked exactly as CourtKit.finish: Float32 local vertex,
 // followed by the root world matrix. No enlarged legacy proxy or blanket box.
 kit.root.updateWorldMatrix(true,true);const inverse=kit.root.matrixWorld.clone().invert();
 // Clipping a painted stroke exactly at an edge may yield repeated vertices;
 // discard only exactly zero-area paint triangles after the real Float32 bake.
 // No closed solid or positive-area paint/source face is dropped.
 let zeroPaint=0;
 f.traverse(m=>{if(m.userData.role!=='ciyin-photo-flush-painted-detail')return;const old=m.geometry,p=old.attributes.position,matrix=new T.Matrix4().multiplyMatrices(inverse,m.matrixWorld),ps=[],groups=[];for(const group of old.groups){const start=ps.length/3;for(let i=group.start;i<group.start+group.count;i+=3){const raw=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(p,i+k)),vs=raw.map(v=>{const q=v.clone().applyMatrix4(matrix);q.set(Math.fround(q.x),Math.fround(q.y),Math.fround(q.z));return q.applyMatrix4(kit.root.matrixWorld);});if(new T.Triangle(...vs).getArea()===0){zeroPaint++;continue;}for(const v of raw)ps.push(...v.toArray());}if(ps.length/3>start)groups.push({start,count:ps.length/3-start,materialIndex:group.materialIndex});}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(ps,3));for(const q of groups)geo.addGroup(q.start,q.count,q.materialIndex);geo.computeVertexNormals();m.geometry=geo;old.dispose();});
 for(const [index,m]of solids.entries()){
  const matrix=new T.Matrix4().multiplyMatrices(inverse,m.matrixWorld),p=m.geometry.attributes.position,b=new T.Box3();for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(matrix);v.set(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));b.expandByPoint(v.applyMatrix4(kit.root.matrixWorld));}
  b.ciyinFacade={kind:'visible-box',index,role:m.userData.role};kit.colliders.push(b);m.userData.ciyinFacadeSolid=index;m.traverse(n=>{if(n.isMesh)n.userData.ciyinFacadeOwner=index;});if(m.userData.walkable){const top=b.clone();top.min.y=top.max.y;kit.walkables.push({type:'box',box:top,rescue:false});}
 }
 for(const m of[plaque.mesh,plaque.frame]){m.userData.ciyinFacadeOwner=board.userData.ciyinFacadeSolid;delete m.userData.ciyinFacadeBacking;}
 const anchors=kit.colliders.filter(b=>b.min.x===245.95&&b.min.y===0&&b.min.z===121.75&&b.max.x===271.05&&b.max.y===.6&&b.max.z===134.45);if(anchors.length!==1)throw Error('Ciyin retained platform is not unique');const anchor=anchors[0],scope={kind:'ciyin-front',id:'ciyin-front',minOffsetX:CIYIN_FACADE_REGION.minX-anchor.min.x,maxOffsetX:CIYIN_FACADE_REGION.maxX-anchor.min.x,minOffsetZ:CIYIN_FACADE_REGION.minZ-anchor.min.z,maxOffsetZ:CIYIN_FACADE_REGION.maxZ-anchor.min.z};validateCiyinFacadeScope(scope,anchor,CIYIN_FACADE_REGION);anchor.furnitureMotionScope=scope;
 g.ciyinFacade={front,frontSetbackFit:.10,discardedExactlyZeroAreaPaintTriangles:zeroPaint,source:SOURCE,gallery:GALLERY,photo:PHOTO,plaquePhoto:PLAQUE,photographyDate:null,lowerTypes,upperTypes,entryXs,acceptedWholeObject:false,visualStatus:'VERIFY_PENDING',precision:'PHOTO_RELATIONSHIP_AND_VISIBLE_RECTILINEAR_FIT_NOT_SURVEY',pattern:'FLAT_PROCEDURAL_COLOR_GEOMETRY_NOT_PHOTO_TEXTURE_OR_EXACT_CARVING',originalCentralLowerDoor:'REPLACED_BY_SOURCE_SILL_WINDOW_WITH_EXPLICIT_END_DOOR_NAVIGATION',unknown:['exact Manchu inscription and calligraphy','detailed dragon floral paint and carved silhouettes','current door pose and visitor access','rear and side exterior details and current interior inventory']};f.userData.ciyinFacade=g.ciyinFacade;
}
