import {positionHallNameboard} from './HallNameboardMount.js';
import {verifyTaihePlaqueRoofClearance,TaihePlaqueClearanceError} from './TaihePlaqueClearance.js';
import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Independent front-image interpretation, not traced survey or reproduced relief.
const RIGHT = [[0,.5],[.15,.49],[.21,.43],[.25,.46],[.31,.43],[.34,.46],[.40,.49],[.46,.47],[.50,.43],[.48,.40],[.31,.40],[.32,.31],[.29,.25],[.33,.20],[.31,.13],[.34,.07],[.32,-.03],[.34,-.12],[.31,-.20],[.33,-.28],[.30,-.34],[.34,-.40],[.30,-.49],[.26,-.50],[.23,-.40],[.22,-.35],[.17,-.34],[.10,-.38],[0,-.39]];
export function taiheCloudOutline(width,height){
 if(![width,height].every(Number.isFinite)||height<=0||width/height<1.05-1e-9||width/height>1.10+1e-9)throw Error('Taihe cloud fit requires ratio1.05..1.10 and positive finite height');
 const controls=[...RIGHT,...RIGHT.slice(1,-1).reverse().map(([x,y])=>[-x,y])].map(([x,y])=>new THREE.Vector3(x,y,0));
 const curve=new THREE.CatmullRomCurve3(controls,true,'centripetal'),points=curve.getPoints(320).slice(0,-1),box=new THREE.Box3().setFromPoints(points),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
 return points.map(p=>new THREE.Vector2((p.x-center.x)/size.x*width,(p.y-center.y)/size.y*height));
}
function extrusion(points,depth,z){const shape=new THREE.Shape(points),g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,steps:1});g.translate(0,0,z);return g;}
// Eight visible inward curls from the cited front photograph. The curves are
// original geometric interpretations; exact tool marks and worn paint are not
// reproduced. Extruded ribbon caps make every curl a closed shallow solid.
function innerScrollGeometry(width,height){
 const outline=taiheCloudOutline(width,height);
 const paths=[
  [[.115,.475],[.14,.46],[.16,.432],[.19,.435],[.194,.430],[.179,.443],[.167,.441]],
  [[.292,.342],[.283,.312],[.292,.287],[.280,.261],[.258,.273],[.258,.298],[.276,.303]],
  [[.296,-.231],[.281,-.256],[.29,-.28],[.277,-.305],[.255,-.286],[.257,-.263],[.276,-.26]],
  [[.112,-.348],[.144,-.333],[.161,-.294],[.19,-.296],[.205,-.312],[.192,-.332],[.17,-.319],[.18,-.306]]
 ];
 const pieces=[];
 for(const side of[-1,1])for(const raw of paths){
  const pts=raw.map(p=>[...p]),start=new THREE.Vector2(side*pts[0][0]*width,pts[0][1]*height);let edge=outline[0];for(const p of outline)if(p.distanceToSquared(start)<edge.distanceToSquared(start))edge=p;pts.unshift([Math.abs(edge.x)*.982/width,edge.y*.982/height]);
  const curve=new THREE.CatmullRomCurve3(pts.map(([x,y])=>new THREE.Vector3(side*x*width,y*height,0))),points=curve.getPoints(36),left=[],right=[],half=height*.0026;
  for(let i=0;i<points.length;i++){const prev=points[Math.max(0,i-1)],next=points[Math.min(points.length-1,i+1)],d=next.clone().sub(prev).normalize(),n=new THREE.Vector2(-d.y,d.x).multiplyScalar(half);left.push(new THREE.Vector2(points[i].x+n.x,points[i].y+n.y));right.push(new THREE.Vector2(points[i].x-n.x,points[i].y-n.y));}
  pieces.push(extrusion([...left,...right.reverse()],.004,.0705));
 }
 for(const side of[-1,1])for(const [x0,y0,x1,y1]of[[.235,.399,.305,.405],[.235,-.231,.299,-.382]]){
  const a=new THREE.Vector2(side*x0*width,y0*height),b=new THREE.Vector2(side*x1*width,y1*height),d=b.clone().sub(a).normalize(),n=new THREE.Vector2(-d.y,d.x).multiplyScalar(height*.004);
  pieces.push(extrusion([a.clone().add(n),b.clone().add(n),b.clone().sub(n),a.clone().sub(n)],.004,.0705));
 }
 const combined=mergeGeometries(pieces,false);pieces.forEach(g=>g.dispose());return combined;
}
export function buildTaiheExteriorPlaque(builder,{height,ratio=1.085}={}){
 const width=height*ratio,depth=.15,outline=taiheCloudOutline(width,height);
 const gold=builder.ownMat('taihe-exterior-cloud-gold',{color:0xb99542,roughness:.56,metalness:.32}),red=builder.ownMat('taihe-exterior-cloud-red',{color:0x782b21,roughness:.75,metalness:.05});
 const outer=extrusion(outline,.135,-.075),scrolls=innerScrollGeometry(width,height),scrollTriangles=scrolls.attributes.position.count/3,rootGeometry=mergeGeometries([outer,scrolls],false);outer.dispose();scrolls.dispose();
 const root=new THREE.Mesh(rootGeometry,gold);root.name='taihe-exterior-cloud-nameboard';root.userData.noMerge=true;root.geometry.parameters={width,height,depth};
 const inset=new THREE.Mesh(extrusion(outline.map(p=>p.clone().multiplyScalar(.975)),.01,.06),red);inset.name='taihe-exterior-cloud-red-inset';root.add(inset);
 const blueWidth=width*.47,blueHeight=height*.63,offset=height*.084;
 const border=new THREE.Mesh(new THREE.BoxGeometry(blueWidth+.055,blueHeight+.055,.01),gold);border.name='taihe-exterior-blue-border';border.position.set(0,offset,.0675);root.add(border);
 const key='taihe-exterior-independent-system-font';
 if(!builder._own.has(key)){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=Math.round(512*blueHeight/blueWidth);const c=canvas.getContext('2d');c.fillStyle='#123b85';c.fillRect(0,0,canvas.width,canvas.height);c.fillStyle='#e8c55a';c.textAlign='center';c.textBaseline='middle';const step=canvas.height/3;c.font=`bold ${Math.floor(Math.min(step*.82,canvas.width*.6))}px "STKaiti","KaiTi","Kaiti SC","Songti SC","SimSun",serif`;[...'太和殿'].forEach((letter,i)=>c.fillText(letter,canvas.width/2,step*(i+.5)));
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;const material=builder.ownMat(key,{map:texture,roughness:.66,metalness:.05});let disposed=false;material.addEventListener('dispose',()=>{if(!disposed){disposed=true;texture.dispose();}});
 }
 const blue=new THREE.Mesh(new THREE.BoxGeometry(blueWidth,blueHeight,.005),builder._own.get(key));blue.name='taihe-exterior-blue-core';blue.position.set(0,offset,.0725);root.add(blue);
 // A single grouped mesh prevents MergeUtils from detaching a noMerge child
 // from its mountable root. The blue core still has its own unstretched UV/material.
 const pieces=[root,...root.children],parts=[],materials=[];
 for(const piece of pieces){piece.updateMatrix();const geometry=piece.geometry.index?piece.geometry.toNonIndexed():piece.geometry.clone();geometry.applyMatrix4(piece.matrix);parts.push(geometry);materials.push(piece.material);}
 const combined=mergeGeometries(parts,true);parts.forEach(g=>g.dispose());pieces.forEach(p=>p.geometry.dispose());root.remove(...root.children);root.geometry=combined;root.geometry.parameters={width,height,depth};root.material=materials;root.castShadow=root.receiveShadow=true;
 root.userData.taiheExteriorPlaque={status:'PHOTO_FIT_NOT_SURVEYED',accepted:false,source:'https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5efefbd5093a9.jpg',sourceSha256:'eebdbe096e5aeecc55d08e380775171438c75b635846dc013c452bce55f36c1c',outerRatio:ratio,blueWidthFraction:.47,blueHeightFraction:.63,blueCenterYFraction:.084,lettering:'SYSTEM_FONT_UNVERIFIED_NOT_CALLIGRAPHY',back:'BACK_THICKNESS_HARDWARE_CARVING_UNVERIFIED',depthFit:depth,innerScrolls:{count:8,diagonalCornerConnections:4,triangles:scrollTriangles,depthStatus:'SHALLOW_FIT_NOT_MEASURED',sourceObserved:true,exactCarvingAccepted:false},blueCore:{width:blueWidth,height:blueHeight,centerY:offset,materialGroup:3},officialPixelsEmbedded:false};
 return root;
}

// Reject only known geometric fit failures. Builder-owned cached materials remain
// owned until builder disposal; the detached proposal geometry is released now.
export function mountTaiheExteriorPlaque(builder,candidate,roof){
 const mountErrors=new Set(['Verified double-eave nameboard requires finite generated roof bounds','Nameboard roof-surface clearance could not be established','Retained nameboard does not fit roof band; do not silently shrink it']);
 try{
  positionHallNameboard(candidate,roof,'太和殿');
  candidate.userData.roofTriangleClearance=verifyTaihePlaqueRoofClearance(candidate,roof);
  candidate.userData.hallNameboardMount.appearanceStatus='PHOTO_FIT_CLOUD_FRAME_SYSTEM_FONT_UNVERIFIED_BACK_RELIEF_UNRESOLVED';
  return candidate;
 }catch(error){
  if(!(error instanceof TaihePlaqueClearanceError)&&!(error.constructor===Error&&mountErrors.has(error.message)))throw error;
  const parent=candidate.parent,height=candidate.geometry.parameters.height;
  candidate.removeFromParent();candidate.geometry.dispose();
  const retained=builder.plaqueMesh('太和殿',height*.62,height,true);
  retained.position.copy(candidate.position);retained.rotation.copy(candidate.rotation);parent.add(retained);
  positionHallNameboard(retained,roof,'太和殿');
  retained.userData.taiheExteriorPlaqueRejected={status:'REJECTED_RETAINED_RECTANGULAR_BOARD',reason:error.message,cloudAccepted:false};
  return retained;
 }
}
