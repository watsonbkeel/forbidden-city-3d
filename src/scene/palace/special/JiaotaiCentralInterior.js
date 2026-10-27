import * as THREE from 'three';
import {mergeByMaterial} from '../../../utils/MergeUtils.js';
import {JIAOTAI_CENTRAL as P,jiaotaiFrame,jiaotaiCeilingRing} from './JiaotaiCeilingFrame.js';
import {jiaotaiCentralMaterial,centralUV} from './JiaotaiCentralArt.js';

const poly=(h,c)=>[[-h,-h+c],[-h+c,-h],[h-c,-h],[h,-h+c],[h,h-c],[h-c,h],[-h+c,h],[-h,h-c]];
function loft(a,b,ya,yb){
 const pos=[],uv=[],ids=[];for(let k=0;k<a.length;k++){const n=(k+1)%a.length,i=pos.length/3;for(const[v,y,u,t]of[[a[k],ya,0,0],[a[n],ya,1,0],[b[n],yb,1,1],[b[k],yb,0,1]]){pos.push(v[0],y,v[1]);uv.push(u,t);}ids.push(i,i+1,i+2,i,i+2,i+3);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ids);g.computeVertexNormals();return g;
}
function cap(points,y){
 const pos=[0,y,0],uv=[.5,.5],ids=[];for(const[x,z]of points){pos.push(x,y,z);uv.push(x/4+.5,z/4+.5);}for(let i=0;i<points.length;i++)ids.push(0,i+1,(i+1)%points.length+1);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ids);g.computeVertexNormals();return g;
}
function squareCornerCaps(h,c,y){
 const pos=[];for(const sx of[-1,1])for(const sz of[-1,1]){const corner=[sx*h,y,sz*h],a=[sx*(h-c),y,sz*h],b=[sx*h,y,sz*(h-c)];pos.push(...corner,...(sx*sz>0?a:b),...(sx*sz>0?b:a));}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();return g;
}
function parts(root,mat){
 const add=(name,g,x,y,z,cell=4,solid=true)=>{const m=new THREE.Mesh(centralUV(g,cell,{solid}),mat);m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;root.add(m);return m;};
 return {add,box:(name,w,h,d,x,y,z,cell=4)=>add(name,new THREE.BoxGeometry(w,h,d),x,y,z,cell,cell>=4)};
}
export function buildJiaotaiCaissonLevel(mat,fine){
 if(typeof fine!=='boolean')throw Error('Explicit Jiaotai caisson detail required');const g=new THREE.Group();g.name=fine?'jiaotai-central-near':'jiaotai-central-far';const b=parts(g,mat),H=P.bodyH;
 // Observed zones: square bearing, inset polygonal walls, round dragon field.
 // The exact step count and section depths below are modelling trials.
 const profiles=[[3.10,.06,H-.03],[3.01,.06,H+.10],[2.89,.09,H+.20],[2.78,.84,H+.54],[2.59,1.02,H+.68],[2.34,1.19,H+.96],[2.14,1.25,H+1.10],[1.83,1.072,H+1.39],[1.64,.961,H+1.58]];
 b.add('square-to-clipped-corner-closure',squareCornerCaps(3.10,.06,H-.03),0,0,0);
 const chosen=fine?profiles:[profiles[0],profiles[3],profiles[8]];
 for(let k=0;k<chosen.length-1;k++){const a=chosen[k],c=chosen[k+1];b.add('caisson-inset-tier-'+k,loft(poly(a[0],a[1]),poly(c[0],c[1]),a[2],c[2]),0,0,0,k%2?1:0,false);}
 b.add('caisson-closed-top',cap(poly(1.64,.961),H+1.58),0,0,0);
 for(const s of[-1,1]){b.box('square-bearing-transverse',6.40,.18,.20,0,H-.07,s*3.20,0);b.box('square-bearing-longitudinal',.20,.18,6.20,s*3.20,H-.07,0,0);}
 if(fine){
  // Dark red polygonal rails articulate the diagonal divisions visible in the
  // official photograph; their section size is a provisional model parameter.
  for(const [h,c,y]of[profiles[3],profiles[6]]){
   const q=poly(h,c);for(let i=0;i<q.length;i++){
    const a=new THREE.Vector3(q[i][0],y-.025,q[i][1]),n=q[(i+1)%q.length],v=new THREE.Vector3(n[0],y-.025,n[1]),delta=v.clone().sub(a);
    const rail=b.box('polygonal-red-rail',.065,.065,delta.length(),...(a.add(v).multiplyScalar(.5).toArray()),5);rail.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),delta.normalize());
   }
  }
  // Narrow gilt mouths distinguish nested tiers at a human viewing angle.
  // They follow the existing profile vertices; no new opening/datum is fitted.
  for(const [h,c,y]of[profiles[1],profiles[4],profiles[7]]){
   const q=poly(h,c);for(let i=0;i<q.length;i++){
    const a=new THREE.Vector3(q[i][0],y-.018,q[i][1]),n=q[(i+1)%q.length],v=new THREE.Vector3(n[0],y-.018,n[1]),delta=v.clone().sub(a);
    const lip=b.box('caisson-inset-gilt-lip',.028,.028,delta.length(),...a.add(v).multiplyScalar(.5).toArray());lip.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),delta.normalize());
   }
  }
  const disc=new THREE.CylinderGeometry(1.60,1.60,.045,24);b.add('round-dragon-field',disc,0,H+1.54,0,6);
  const border=new THREE.TorusGeometry(1.55,.055,4,24);border.rotateX(Math.PI/2);b.add('round-dragon-field-rim',border,0,H+1.48,0);
  const curve=[];for(let i=0;i<=20;i++){const a=i/20*Math.PI*1.82,r=.91-i/20*.21;curve.push(new THREE.Vector3(Math.cos(a)*r,H+1.39-Math.sin(a)*.035,Math.sin(a)*r));}
  b.add('coiled-dragon-body',new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curve),24,.115,5,false),0,0,0);
  b.box('dragon-brow',.51,.19,.35,.53,H+1.30,-.55);b.box('dragon-muzzle',.33,.15,.32,.53,H+1.22,-.78);
  for(const side of[-1,1]){b.add('dragon-horn',new THREE.ConeGeometry(.06,.23,5),.53+side*.19,H+1.44,-.48);b.add('dragon-eye',new THREE.SphereGeometry(.044,6,4),.53+side*.19,H+1.24,-.71,6);}
  for(let i=0;i<4;i++){const a=i*Math.PI/2+.25;const m=b.box('dragon-foot',.35,.08,.10,Math.cos(a)*1.03,H+1.32,Math.sin(a)*1.03);m.rotation.y=-a;}
 }
 // Central mirror is explicit in the Palace Museum text. Colour and hanging
 // hardware are approximate; no duplication or claim of optical behaviour.
 const centreY=H+P.ceilingOffset+P.mirrorCentreAboveCeiling;
 const topY=H+1.46,ballTop=centreY+P.mirrorRadius;
 b.add('mirror-suspension',new THREE.CylinderGeometry(.055,.065,topY-ballTop,fine?8:4),0,(topY+ballTop)/2,0,6);
 if(fine){const cage=new THREE.CylinderGeometry(.24,.23,.52,8,1,true);b.add('mirror-hanging-cage',cage,0,ballTop+.23,0,1,false);
  for(const [id,r,y]of[['lower',.23,ballTop-.03],['upper',.24,ballTop+.49]]){const ring=new THREE.TorusGeometry(r,.018,4,12);ring.rotateX(Math.PI/2);b.add('mirror-cage-end-ring-'+id,ring,0,y,0);}
 }
 b.add('central-xuanyuan-mirror',new THREE.SphereGeometry(P.mirrorRadius,fine?12:8,fine?8:5),0,centreY,0,7);
 g.userData.caisson={id:P.id,modelFit:true,fine,zones:['square','polygonal','round'],mirror:true};return g;
}
export function buildJiaotaiCeiling(builder,shell,{x0,z0,y,w,d,H}){
 const p=jiaotaiFrame({w,d,H}),geo=jiaotaiCeilingRing({W:w,D:d,y:y+H+p.ceilingOffset,tile:1.6,opening:p});const m=new THREE.Mesh(geo,builder.ceilingMaterial());m.name='jiaotai-retained-ceiling-open-centre';m.position.set(x0,0,z0);shell.add(m);shell.userData.structure.centralInterior={...p,floorY:y};return p;
}
export function buildJiaotaiBackdrop(builder,g,{x0,ty,tz,depth,thW}){
 const b=parts(g,jiaotaiCentralMaterial(builder)),w=Math.min(thW*.7,6),z=tz+depth*.32,floor=ty-1.25;
 // Retain original screen width/station and dais collision. Only the raised
 // visual backdrop changes; its maximum footprint stays inside the old solid.
 b.box('jiaotai-red-rear-screen',w,4.48,.30,x0,floor+3.49,z,5);
 b.box('jiaotai-upper-gilt-screen-field',w-.22,1.48,.025,x0,floor+4.85,z-.165,3);
 // Recessed inner image and four fitted edges share the old field envelope.
 for(const sign of[-1,1]){b.box('jiaotai-upper-field-gilt-rim',w-.16,.03,.025,x0,floor+4.85+sign*.755,z-.165,4);b.box('jiaotai-upper-field-gilt-rim',.03,1.48,.025,x0+sign*((w-.16)/2-.015),floor+4.85,z-.165,4);}
 b.box('jiaotai-lower-inscription-field-untranscribed',w-.16,2.38,.025,x0,floor+2.49,z-.165,4);
 for(const s of[-1,1])b.box('jiaotai-screen-side-frame',.10,4.5,.34,x0+s*(w/2-.04),floor+3.49,z,4);
 b.box('jiaotai-rear-plaque-bearing-beam',w+.12,.18,.34,x0,floor+5.78,z,5);
 const width=(w-.16)*.44,height=width*.49,plaqueY=4.20;
 b.box('jiaotai-wuwei-plaque',width,height,.09,x0,floor+plaqueY,z-.235,2);
 for(const s of[-1,1])b.box('jiaotai-plaque-hanger',.035,5.69-(plaqueY+height/2),.035,x0+s*width*.36,floor+(5.69+plaqueY+height/2)/2,z-.235,6);
}
export function installJiaotaiCentral(builder,root){
 if(builder.ox||builder.oz)throw Error('Jiaotai central installation requires world-aligned group');if(root.userData.jiaotaiCentral)throw Error('Jiaotai central already installed');const a=root.userData.architecture?.filter(x=>x.id==='jiaotaidian');if(a?.length!==1||a[0].centralInterior?.id!==P.id)throw Error('Unregistered Jiaotai central frame');const r=a[0],p=r.centralInterior,mat=jiaotaiCentralMaterial(builder),lod=new THREE.LOD();lod.name='jiaotai-central-ceiling-detail';lod.position.set(0,p.floorY,354.1+P.centreZ);
 for(const fine of[true,false])lod.addLevel(mergeByMaterial(buildJiaotaiCaissonLevel(mat,fine),{castShadow:true,receiveShadow:true,name:fine?'jiaotai-central-near':'jiaotai-central-far'}),fine?0:P.lodDistance,fine?0:P.lodHysteresis);
 lod.levels[1].object.visible=false;root.add(lod);root.userData.jiaotaiCentral={...structuredClone(p),frame:{x:0,y:p.floorY,z:354.1+P.centreZ},navigation:'ORIGINAL_REGISTRATIONS_UNCHANGED'};
}
