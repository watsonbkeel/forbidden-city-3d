import * as T from 'three';
import {applyBoxUV} from '../../utils/GeometryUV.js';
const SOURCE='https://www.dpm.org.cn/explore/building/236521.html';
const PANO='https://pano.dpm.org.cn/#/panorama?regionId=63&secondAreaId=108&vpId=3348&sphPicId=1943245109680263168';
const near=(a,b)=>Math.abs(a-b)<1e-10;
const turn=(x,z,k)=>{for(let i=0;i<k;i++)[x,z]=[-z,x];return[x,z];};
const palette={red:[137,48,38],dark:[75,38,29],gold:[184,145,75],pale:[211,211,185],green:[43,104,65],blue:[48,76,101],edge:[105,103,80]};
/** Original geometric colour relationships, not copied museum pixels, carved
 * relief, a transparent opening, or an exact historic painting facsimile. */
function material(kind){
 const sizes={door:[256,768],window:[256,512],sill:[512,256],head:[512,128]},[w,h]=sizes[kind],pixels=new Uint8Array(w*h*4);
 const fill=(x0,y0,x1,y1,key)=>{for(let y=Math.max(0,Math.floor(y0*h));y<Math.min(h,Math.ceil(y1*h));y++)for(let x=Math.max(0,Math.floor(x0*w));x<Math.min(w,Math.ceil(x1*w));x++)pixels.set([...palette[key],255],(y*w+x)*4);};
 const line=(x0,y0,x1,y1,key,width=.008)=>{x0*=w;x1*=w;y0*=h;y1*=h;const r=width*w,dx=x1-x0,dy=y1-y0,len=dx*dx+dy*dy;for(let y=Math.max(0,Math.floor(Math.min(y0,y1)-r));y<Math.min(h,Math.ceil(Math.max(y0,y1)+r));y++)for(let x=Math.max(0,Math.floor(Math.min(x0,x1)-r));x<Math.min(w,Math.ceil(Math.max(x0,x1)+r));x++){const t=Math.max(0,Math.min(1,((x+.5-x0)*dx+(y+.5-y0)*dy)/len));if(Math.hypot(x+.5-x0-t*dx,y+.5-y0-t*dy)<=r)pixels.set([...palette[key],255],(y*w+x)*4);}};
 const rect=(x0,y0,x1,y1,key,width=.008)=>{line(x0,y0,x1,y0,key,width);line(x1,y0,x1,y1,key,width);line(x1,y1,x0,y1,key,width);line(x0,y1,x0,y0,key,width);};
 fill(0,0,1,1,kind==='sill'?'green':'red');
 if(kind==='sill'){
  // Continuous yellow hexagonal joints on green glazed fields; repetition is
  // a model pattern, not a claim that the image supplies a surveyed tile count.
  const rx=.10,ry=.18;for(let i=-1;i<8;i++)for(let j=-2;j<5;j++){const cx=i*rx*1.5,cy=(j+(i%2? .5:0))*ry*Math.sqrt(3);for(let k=0;k<6;k++){const a=k*Math.PI/3,b=(k+1)*Math.PI/3;line(cx+rx*Math.cos(a),cy+ry*Math.sin(a),cx+rx*Math.cos(b),cy+ry*Math.sin(b),'gold',.004);}}
  rect(.018,.04,.982,.96,'gold',.012);
 }else if(kind==='head'){
  fill(0,0,1,1,'edge');fill(.025,.14,.975,.86,'green');rect(.035,.17,.965,.83,'gold',.0035);fill(.28,.26,.72,.74,'blue');rect(.28,.26,.72,.74,'gold',.004);
 }else{
  const lo=kind==='door'?.40:.075,hi=.93;
  fill(.10,lo,.90,hi,kind==='door'?'dark':'pale');
  // Diamond families and short crossing ties express the visible lattice
  // family without pretending to reconstruct each three-cross-six-bowl joint.
  const nx=5,ny=kind==='door'?11:12,sx=.8/nx,sy=(hi-lo)/ny;
  for(let row=0;row<ny;row++)for(let col=0;col<nx;col++){const cx=.1+(col+.5)*sx,cy=lo+(row+.5)*sy;for(const[a,b,c,d]of[[-.48,0,0,.48],[0,.48,.48,0],[.48,0,0,-.48],[0,-.48,-.48,0],[-.24,0,.24,0],[0,-.24,0,.24]])line(cx+a*sx,cy+b*sy,cx+c*sx,cy+d*sy,'gold',.0038);}
  rect(.085,lo-.012,.915,hi+.012,'dark',.012);rect(.11,lo+.007,.89,hi-.007,'gold',.004);
  if(kind==='door'){
   // Red lower apron and narrow intermediate field have separate gold borders.
   rect(.12,.335,.88,.376,'gold',.006);
   const v=[[.20,.065],[.12,.105],[.12,.26],[.20,.30],[.80,.30],[.88,.26],[.88,.105],[.80,.065]];for(let i=0;i<v.length;i++)line(...v[i],...v[(i+1)%v.length],'gold',.007);
  }
  rect(.025,.02,.975,.98,'dark',.015);
 }
 const map=new T.DataTexture(pixels,w,h,T.RGBAFormat);map.name='wanchun-'+kind+'-original-surface-fit';map.colorSpace=T.SRGBColorSpace;map.magFilter=T.LinearFilter;map.minFilter=T.LinearMipmapLinearFilter;map.generateMipmaps=true;map.anisotropy=4;map.needsUpdate=true;
 const m=new T.MeshStandardMaterial({name:'wanchun-inner-'+kind+'-source-fit',map,color:0xffffff,roughness:.86,metalness:0});m.userData={officialPixelsEmbedded:false,source:SOURCE,pano:PANO,patternStatus:'ORIGINAL_SIMPLIFIED_SURFACE_RELATIONSHIPS_NOT_CARVED_OR_EXACT_HISTORIC_PATTERN'};m.addEventListener('dispose',()=>map.dispose());return m;
}
function identical(a,b){return a.drawRange.start===0&&a.drawRange.count===Infinity&&Object.keys(a.morphAttributes).length===0&&a.morphTargetsRelative===false&&JSON.stringify(a.groups)===JSON.stringify(b.groups)&&!!a.index===!!b.index&&(!a.index||(a.index.array.length===b.index.array.length&&a.index.array.every((v,i)=>v===b.index.array[i])))&&Object.keys(a.attributes).sort().join()===Object.keys(b.attributes).sort().join()&&Object.entries(b.attributes).every(([key,x])=>{const y=a.attributes[key];return y.itemSize===x.itemSize&&y.normalized===x.normalized&&y.array.length===x.array.length&&y.array.every((v,i)=>v===x.array[i]);});}

export function applyWanchunInteriorEnclosure(builder,g,{name,x,z},root=builder.group){
 if(name!=='万春亭'||x!==-52.5||z!==472.1||g?.name!=='cross_pavilion_万春亭'||g.parent!==root||!g.position.equals(new T.Vector3(x,0,z))||g.rotation.x||g.rotation.y||g.rotation.z||!g.scale.equals(new T.Vector3(1,1,1))||g.userData.wanchunInterior)throw Error('Wanchun inner enclosure exact source identity required');
 if(root!==builder.group&&(root?.name!=='garden_static'||root.parent!==null))throw Error('Wanchun unregistered assembly root');
 for(let a=g.parent;a;a=a.parent)if(!a.visible||!a.position.equals(new T.Vector3())||a.rotation.x||a.rotation.y||a.rotation.z||!a.scale.equals(new T.Vector3(1,1,1))||!a.matrixAutoUpdate)throw Error('Wanchun source ancestor transform changed');
 const targets=[];
 function add(role,kind,w,h,d,px,py,pz,k,normal){
  const[a,b]=turn(px,pz,k),side=k%2,ww=side?d:w,dd=side?w:d,ns=turn(...normal,k);
  const found=g.children.filter(m=>m.isMesh&&m.userData.role===role&&near(m.position.x,a)&&near(m.position.y,py)&&near(m.position.z,b));if(found.length!==1)throw Error('Wanchun source inventory changed: '+role);
  const m=found[0],expectedMaterial=role==='glazed-sill'?null:builder.library.material(kind==='window'||kind==='door'?'lattice_doors':'wood_column');
  if(role==='glazed-sill'?m.material?.name!=='cross_pavilion_green_sill'||!builder.ownedMaterials.has(m.material):m.material!==expectedMaterial)throw Error('Wanchun original source material changed: '+role);
  const ref=applyBoxUV(new T.BoxGeometry(ww,h,dd),1);let good;try{good=identical(m.geometry,ref);}finally{ref.dispose();}
  if(!good||!m.visible||!m.matrixAutoUpdate||m.children.length||m.rotation.x||m.rotation.y||m.rotation.z||!m.scale.equals(new T.Vector3(1,1,1))||!m.castShadow||!m.receiveShadow||Array.isArray(m.material)||g.children.some(q=>q!==m&&q.geometry===m.geometry))throw Error('Wanchun original mesh changed: '+role);
  const axis=ns[0]?0:2,sign=ns[0]||ns[1],face=m.geometry.groups.filter(q=>near(m.geometry.attributes.normal.getComponent(m.geometry.index?m.geometry.index.getX(q.start):q.start,axis),sign));if(face.length!==1)throw Error('Wanchun inward face missing');
  targets.push({m,kind,k,axis,sign,group:face[0]});
 }
 for(let k=0;k<4;k++){
  for(const s of[-1,1])for(const[width,px]of[[1,s*1.9],[.5,s*1.15]]){
   add('glazed-sill','sill',width,.8,.14,px,1.15,2.4,k,[0,-1]);
   add('closed-lattice-panel','window',width,2.1,.12,px,2.6,2.4,k,[0,-1]);
   add('wall-head','head',width,.45,.18,px,3.925,2.4,k,[0,-1]);
  }
  add('door-header','head',1.8,.5,.2,0,3.9,2.4,k,[0,-1]);
  for(const s of[-1,1])add('inner-open-door-leaf','door',.12,2.9,.9,s*.96,2.2,1.95,k,[-s,0]);
 }
 if(targets.length!==60||new Set(targets.map(t=>t.m)).size!==60)throw Error('Wanchun four inner elevations incomplete');
 const mats={},pending=[],allocated=[];try{
  for(const key of['door','window','sill','head'])mats[key]=material(key);
  for(const t of targets){
   const old=t.m.geometry,indices=old.index?Array.from(old.index.array):Array.from({length:old.attributes.position.count},(_,i)=>i),{start,count}=t.group;
   const rest=old.clone();allocated.push(rest);const face=old.clone();allocated.push(face);rest.setIndex([...indices.slice(0,start),...indices.slice(start+count)]);rest.clearGroups();face.setIndex(indices.slice(start,start+count));face.clearGroups();
   const p=face.attributes.position,uv=face.attributes.uv,uAxis=t.axis===0?2:0;face.computeBoundingBox();const bounds=face.boundingBox,low=bounds.min.getComponent(uAxis),span=bounds.max.getComponent(uAxis)-low;
   for(const i of new Set(face.index.array)){const u=(p.getComponent(i,uAxis)-low)/span,v=(p.getY(i)-bounds.min.y)/(bounds.max.y-bounds.min.y);uv.setXY(i,t.sign<0?1-u:u,v);}uv.needsUpdate=true;
   const mesh=new T.Mesh(face,mats[t.kind]);mesh.position.copy(t.m.position);mesh.quaternion.copy(t.m.quaternion);mesh.scale.copy(t.m.scale);mesh.castShadow=t.m.castShadow;mesh.receiveShadow=t.m.receiveShadow;mesh.name='wanchun-inner-'+t.kind+'-face';mesh.userData={role:mesh.name,wanchunInterior:true,elevation:t.k,sourceRole:t.m.userData.role,faceNormalAxis:t.axis,faceNormalSign:t.sign,scope:'EXACT_OLD_INWARD_FACE_ONLY'};pending.push({old,rest,mesh,target:t.m});
  }
 }catch(error){for(const geometry of allocated)geometry.dispose();Object.values(mats).forEach(m=>m.dispose());throw error;}
 for(const p of pending){p.target.geometry=p.rest;g.add(p.mesh);p.old.dispose();}Object.values(mats).forEach(m=>builder.own(m));
 const meta={object:'FC-8D9B4E9A44',sources:[SOURCE,PANO],photographyDate:null,elevations:4,doors:8,windows:16,sills:16,headFields:20,sourceFaces:60,addedTriangles:0,geometryStatus:'EXACT_ORIGINAL_TRIANGLE_SURFACE_UNION_WITH_UV_AND_MATERIAL_PARTITION_ONLY',physics:'ALL_ORIGINAL_COLLIDERS_AND_WALKABLES_UNCHANGED',wholeObjectAccepted:false,status:'VERIFY_PENDING',patternStatus:'ORIGINAL_SIMPLIFIED_SURFACE_FIT_NOT_TRANSPARENCY_RELIEF_OR_EXACT_CARVING',doorPose:'RETAINED_GAME_ACCESS_POSE_NOT_PHOTOGRAPHIC_POSE',caissonStatus:'PENDING_SOURCE_BOUND_ROOF_AND_DRUM_RECONSTRUCTION',retained:['Qianqiu independently unchanged','outer door stage and arm-side surfaces','all ceilings and roof source faces','all columns, stairs, trees, navigation and physical records'],remaining:['Deep central caisson and full upper drum/roof reconciliation','Outer-stage independent full face pattern coverage','Four annex ceilings and identified double-phoenix artwork','Actual three-cross-six-bowl joinery geometry, glazing and gold relief','Exact beam paintings, dated current fabric and physical dimensions','Browser/GPU and whole-pavilion acceptance']};
 g.userData.wanchunInterior=meta;g.userData.crossPavilion.innerEnclosure=meta;return meta;
}
