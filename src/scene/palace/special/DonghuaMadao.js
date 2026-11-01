import {registerBPrincipalStairs} from '../BPrincipalStairContact.js';
import * as T from 'three';
import {gateRailFacade} from '../gateRailFacade.js';
import {applyBoxUV} from '../../../utils/GeometryUV.js';

// Zhang Yaping / Fan Xuan, 紫禁城东华门马道的分析研究 pp461–462,
// https://www.cactch.org.cn/webfile/upload/2021/02-09/09-55-430520991296728.pdf
// Existing north AND south two-flight topology is surveyed in that paper.
// This fit retains the game's gate anchor / 9.3m deck, not survey coordinates.
export function buildDonghuaMadao(kit,gate,p){
 if(p.name!=='东华门')return false;
 if(p.x!==-365.8||p.z!==-257||p.platformHeight!==9||p.width!==30||p.depth!==15)throw Error('Donghua ascent needs retained gate interface review');
 const walkableStart=kit.walkables.length;
 const f=kit.frame(p.x,p.z,0);f.name='donghua-madao';const top=9.3,mid=4.65;
 const tag=(o,role)=>{o.name=role;o.userData.role=role;return o;};
 const box=(role,mat,x0,x1,z0,z1,y0,y1)=>tag(kit.box(f,mat,x1-x0,y1-y0,Math.abs(z1-z0),(x0+x1)/2,(y0+y1)/2,(z0+z1)/2),role);
 const solid=(role,mat,x0,x1,z0,z1,y0,y1)=>{box(role,mat,x0,x1,z0,z1,y0,y1);kit.col(f,x0,y0,z0,x1,y1,z1);};
 const walk=(x0,x1,z0,z1,y)=>{kit.walkBox(f,x0,z0,x1,z1,y);kit.walkables.at(-1).rescue=false;};
 const prism=(role,mat,x0,x1,z0,z1,y0,y1,b0=0,b1=0)=>{
  // Closed sloping prism, including bottom and all four vertical sides.
  const v=[[x0,b0,z0],[x1,b0,z0],[x1,b1,z1],[x0,b1,z1],[x0,y0,z0],[x1,y0,z0],[x1,y1,z1],[x0,y1,z1]];
  const ids=[0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,3,7,6,3,6,2,0,4,7,0,7,3,1,2,6,1,6,5];
  // Above winding assumes decreasing z (front-to-back in Three's handedness).
  if(z1>z0)for(let i=0;i<ids.length;i+=3)[ids[i+1],ids[i+2]]=[ids[i+2],ids[i+1]];
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(ids.flatMap(i=>v[i]),3));g.computeVertexNormals();applyBoxUV(g,kit.lib.tileSize(mat));return tag(kit.mesh(f,g,kit.lib.material(mat),0,0,0),role);
 };
 const slope=(x0,x1,z0,z1,y0,y1)=>{
  prism('donghua-madao-solid-flight','wall_brick',x0,x1,z0,z1,y0,y1);
  kit.walkRamp(f,x0,x1,z0,z1,y0,y1);kit.walkables.at(-1).rescue=false;
  const n=Math.ceil(Math.abs(z1-z0)/.25);for(let i=0;i<n;i++){
   const a=i/n,b=(i+1)/n,lo=Math.min(y0+(y1-y0)*a,y0+(y1-y0)*b);
   if(lo>0)kit.col(f,x0,0,z0+(z1-z0)*a,x1,lo,z0+(z1-z0)*b);
  }
 };
 const rail=(x,z0,z1,y0,y1,h)=>{
  prism('donghua-madao-brick-guard','wall_brick',x-.24,x+.24,z0,z1,y0+h,y1+h,y0,y1);
  const n=Math.ceil(Math.abs(z1-z0)/.3);for(let i=0;i<n;i++){
   const a=i/n,b=(i+1)/n,ya=y0+(y1-y0)*a,yb=y0+(y1-y0)*b;
   kit.col(f,x-.24,Math.min(ya,yb),z0+(z1-z0)*a,x+.24,Math.max(ya,yb)+h,z0+(z1-z0)*b);
  }
 };
 for(const s of[-1,1]){
  slope(-1.5,6.5,s*15,s*37,top,mid);slope(7,13,s*17,s*37,0,mid);
  solid('donghua-madao-turn-solid','wall_brick',-1.5,13,s*37,s*43,0,mid);walk(-1.5,13,s*37,s*43,mid);
  rail(-1.5,s*15,s*37,top,mid,.925);rail(-1.5,s*37,s*43,mid,mid,.925);
  rail(6.75,s*15,s*37,top,mid,.925);
  rail(13,s*17,s*37,0,mid,s>0?1.665:1.17);rail(13,s*37,s*43,mid,mid,s>0?1.665:1.17);
  solid('donghua-madao-turn-end-guard','wall_brick',-1.74,13.24,s*42.76,s*43.24,mid,mid+.925);
 }
 // Existing supported city-platform only. Never register adjacent wall tops.
 walk(-7.5,7.5,-15,15,top);
 // The original solid tower and porch columns were unreachable before this ascent.
 kit.col(f,-3.3,top,-10.8,3.3,top+6,10.8);
 for(const x of[-4.5,4.5])for(let i=0;i<=5;i++){const z=-12+24*i/5;kit.col(f,x-.28,top,z-.28,x+.28,top+6,z+.28);}
 for(const z of[-12,12])for(const x of[-1.5,1.5])kit.col(f,x-.28,top,z-.28,x+.28,top+6,z+.28);
 const deckGuard=(x0,x1,z0,z1)=>{const geo=applyBoxUV(new T.BoxGeometry(x1-x0,1.05,Math.abs(z1-z0)),kit.lib.tileSize('balustrade'));gateRailFacade(geo,true);tag(kit.mesh(f,geo,kit.lib.material('balustrade',{alphaTest:.5,side:T.DoubleSide}),(x0+x1)/2,top+.525,(z0+z1)/2),'donghua-upper-platform-guard');kit.col(f,x0,top,z0,x1,top+1.05,z1);};
 for(const x of[-7.5,7.5])deckGuard(x-.08,x+.08,-15,15);
 for(const s of[-1,1])for(const[a,b]of[[-7.5,-1.5],[6.5,7.5]])deckGuard(a,b,s*14.92,s*15.08);
 const profile={objectId:'FC-C8AD5BD621',sides:['south','north'],topY:top,landingY:mid,upperWidth:8,lowerWidth:6,upperRun:22,lowerRun:20,dimensionStatus:'SOURCE_TOPOLOGY_RETAINED_GATE_ENGINEERING_FIT_NOT_SURVEY',source:'https://www.cactch.org.cn/webfile/upload/2021/02-09/09-55-430520991296728.pdf',scope:'SUPPORTED_FOLDED_ASCENTS_AND_GATE_PLATFORM_ONLY',wallTopAccess:false,towerInterior:false,currentVisitorAccess:'NOT_ASSERTED'};
 f.userData.donghuaMadao=profile;gate.userData.donghuaMadao=profile;gate.userData.cityGate.upperAccess=true;gate.userData.structure.upperAccess=true;f.updateMatrixWorld(true);
 if(!registerBPrincipalStairs(kit,gate,'donghua-madao',walkableStart))throw Error('Donghua actual ascent contact registration failed');
 return true;
}
