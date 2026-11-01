import * as T from 'three';
import {createXiqingSurface} from '../../../controls/XiqingRoofSurface.js';
import {JIYUN_RAIL_REGION,JIYUN_UPPER_FLOOR,validateJiyunRailScope} from '../../../controls/JiyunRailSupport.js';
const SOURCE='https://www.dpm.org.cn/explore/building/236483.html',PHOTO='https://img.dpm.org.cn/Uploads/Picture/2024/06/18/s6670e8aa8f637.jpg';
/** Source-visible silhouette/color relationships, not measured carved motifs.
 * Every added closed piece owns its actual merged-render contact triangles. */
export function buildJiyunRailFit(c){
 const {kit,f,g,p}=c;
 if(p.id!=='place-outer-west-e1a6e9852b'||p.key!=='jiyun'||g.w!==29.7||g.d!==12||g.upperY!==4.8||f.parent!==kit.root||f.position.x!==280.1||f.position.y!==0||f.position.z!==116.7||f.rotation.x||f.rotation.y!==Math.PI/2||f.rotation.z||!f.scale.equals(new T.Vector3(1,1,1))||f.userData.jiyunRailFit)throw Error('Cining Garden Jiyun exact upper rail required');
 const posts=f.children.filter(m=>m.userData.role==='jiyun-upper-front-rail-baluster').sort((a,b)=>a.position.x-b.position.x),top=f.children.filter(m=>m.userData.role==='jiyun-upper-front-rail'),lower=f.children.filter(m=>m.userData.role==='jiyun-upper-front-rail-lower');
 if(posts.length!==47||top.length!==1||lower.length!==1)throw Error('Jiyun retained rail inventory changed');
 const end=g.w/2-.15,span=2*end;
 for(const [i,m]of posts.entries())if(m.geometry.parameters.width!==.07||m.geometry.parameters.height!==.92||m.geometry.parameters.depth!==.07||m.position.x!==-end+span*i/46||m.position.y!==g.upperY+.46||m.position.z!==-5.88||m.rotation.x||m.rotation.y||m.rotation.z||!m.scale.equals(new T.Vector3(1,1,1)))throw Error('Jiyun original rail binding changed');
 for(const [m,h,d,y]of [[top[0],.12,.10,g.upperY+.92],[lower[0],.09,.08,g.upperY+.35]])if(m.geometry.parameters.width!==span||m.geometry.parameters.height!==h||m.geometry.parameters.depth!==d||m.position.x!==0||m.position.y!==y||m.position.z!==-5.88||m.rotation.x||m.rotation.y||m.rotation.z||!m.scale.equals(new T.Vector3(1,1,1)))throw Error('Jiyun original horizontal rail binding changed');
 const mats={};for(const[name,color]of Object.entries({green:0x388c75,ivory:0xdcd6b4,gold:0xbfa35a,blue:0x4a7093})){mats[name]=new T.MeshStandardMaterial({name:'jiyun_rail_'+name+'_photo_fit',color,roughness:.86});kit.owned.push(mats[name]);}
 const parts=[];
 function piece(post,kind,material,depth,draw){const s=new T.Shape();draw(s);s.closePath();const geometry=new T.ExtrudeGeometry(s,{depth,steps:1,bevelEnabled:false,curveSegments:8});geometry.translate(0,0,-depth/2);const mesh=kit.mesh(f,geometry,mats[material],post.position.x,g.upperY,post.position.z);mesh.name='jiyun-front-rail-fit-'+kind;mesh.userData={role:mesh.name,jiyunRailFit:true,postIndex:posts.indexOf(post),source:SOURCE,image:PHOTO,precision:'RETAINED_MODEL_POST_RHYTHM_AND_SHALLOW_EXTRUSION_FIT_NOT_SURVEY',representation:'SIMPLIFIED_SILHOUETTE_AND_COLOR_FIELDS_NOT_EXACT_PAINT_OR_CARVING'};parts.push(mesh);}
 for(const post of posts.slice(1,-1)){
  piece(post,'green-head','green',.070,s=>{s.moveTo(-.14,.875);s.lineTo(.14,.875);s.quadraticCurveTo(.15,.84,.10,.83);s.lineTo(.055,.80);s.lineTo(.025,.775);s.lineTo(-.025,.775);s.lineTo(-.055,.80);s.lineTo(-.10,.83);s.quadraticCurveTo(-.15,.84,-.14,.875);});
  piece(post,'ivory-taper','ivory',.072,s=>{s.moveTo(0,.795);s.bezierCurveTo(.06,.79,.065,.73,.045,.68);s.lineTo(.014,.40);s.lineTo(.025,.382);s.lineTo(-.025,.382);s.lineTo(-.014,.40);s.lineTo(-.045,.68);s.bezierCurveTo(-.065,.73,-.06,.79,0,.795);});
  piece(post,'gold-inset','gold',.076,s=>{s.moveTo(0,.765);s.bezierCurveTo(.040,.755,.040,.715,.025,.69);s.lineTo(.006,.425);s.lineTo(-.006,.425);s.lineTo(-.025,.69);s.bezierCurveTo(-.040,.715,-.040,.755,0,.765);});
  piece(post,'blue-inset','blue',.078,s=>{s.moveTo(0,.70);s.lineTo(.013,.675);s.lineTo(.003,.445);s.lineTo(-.003,.445);s.lineTo(-.013,.675);});
 }
 kit.root.updateWorldMatrix(true,true);const inverseRoot=kit.root.matrixWorld.clone().invert();
 for(const [i,m]of parts.entries()){
  const relative=new T.Matrix4().multiplyMatrices(inverseRoot,m.matrixWorld),a=m.geometry.attributes.position,ix=m.geometry.index,values=[];
  for(let j=0;j<(ix?.count??a.count);j++){const v=new T.Vector3().fromBufferAttribute(a,ix?ix.getX(j):j).applyMatrix4(relative);v.set(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z)).applyMatrix4(kit.root.matrixWorld);values.push(v.x,v.y,v.z);}
  const faces=[];for(let j=0;j<values.length;j+=9)faces.push({source:{mesh:i,triangle:j/9},vertices:[0,3,6].map(k=>new T.Vector3(...values.slice(j+k,j+k+3)))});const owner=createXiqingSurface(faces,'jiyun-front-rail-fit-'+i),box=owner.box.clone();box.xiqingRoofSurface=owner;box.jiyunRailFit={source:SOURCE,mesh:i,postIndex:m.userData.postIndex};kit.colliders.push(box);
 }
 const anchors=kit.colliders.filter(b=>b.min.x===273.65000000000003&&b.min.y===0&&b.min.z===101.4&&b.max.x===286.55&&b.max.y===.6&&b.max.z===132);if(anchors.length!==1||anchors[0].furnitureMotionScope)throw Error('Jiyun original platform anchor missing or ambiguous');const anchor=anchors[0],scope={kind:'jiyun-upper-front-rail',id:'jiyun-upper-front-rail',minOffsetX:JIYUN_RAIL_REGION.minX-anchor.min.x,maxOffsetX:JIYUN_RAIL_REGION.maxX-anchor.min.x,minOffsetZ:JIYUN_RAIL_REGION.minZ-anchor.min.z,maxOffsetZ:JIYUN_RAIL_REGION.maxZ-anchor.min.z};validateJiyunRailScope(scope,anchor,JIYUN_RAIL_REGION);const q=JIYUN_UPPER_FLOOR;if(kit.walkables.filter(w=>w.type==='box'&&w.box.min.x===q.minX&&w.box.max.x===q.maxX&&w.box.min.z===q.minZ&&w.box.max.z===q.maxZ&&w.box.min.y===q.height&&w.box.max.y===q.height).length!==1)throw Error('Jiyun original upper floor missing or ambiguous');anchor.furnitureMotionScope=scope;
 return f.userData.jiyunRailFit={source:SOURCE,image:PHOTO,photographyDate:null,decoratedPosts:45,retainedPosts:47,closedPieces:180,newWalkables:0,acceptedWholeObject:false,visualStatus:'VERIFY_PENDING',precision:'RETAINED_RHYTHM_FITTED_SILHOUETTE_COLOR_AND_DEPTH_NOT_MEASURED',physics:'INDEPENDENT_EXACT_SURFACE_OWNERS_FROM_FINAL_FLOAT32_RENDER_TRIANGLES',excluded:['lower painted panels','exact motif and carving','end rails','new stair or upper navigation destination']};
}
