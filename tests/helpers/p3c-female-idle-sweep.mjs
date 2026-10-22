/** Cached, indexed-surface audit. No renderer/world changes or per-frame meshing.
 * X/Z and Y/Z bins only accelerate triangle queries; intersection uses the
 * actual deformed triangle barycentrics, not analytic replacement geometry.
 */
import * as THREE from 'three';
import {createCharacterGeometry,CHARACTER_TEMPLATES} from '../../src/scene/characters/CharacterKit.js';
import {deformCharacterVertex} from '../../src/scene/characters/CharacterAnimation.js';
const skin=new THREE.Color(0xdbb294),CELL=.06;
const samplesOf=triangles=>{
 const map=new Map();
 for(const tri of triangles){
  for(const i of tri)map.set(`v${i}`,[[i,1]]);
  for(let j=0;j<3;j++){const pair=[tri[j],tri[(j+1)%3]].sort((a,b)=>a-b);map.set(`e${pair}`,pair.map(i=>[i,.5]));}
  map.set(`t${tri}`,tri.map(i=>[i,1/3]));
 }
 return [...map.values()];
};
function gridFor(triangles,p,u=0,v=2,h=1){
 const bins=new Map(),records=[];
 for(const tri of triangles){
  const [a,b,c]=tri.map(i=>p.subarray(i*3,i*3+3));
  const d=(b[v]-c[v])*(a[u]-c[u])+(c[u]-b[u])*(a[v]-c[v]);if(Math.abs(d)<1e-12)continue;
  const r={a,b,c,d};records.push(r);
  const xmin=Math.floor(Math.min(a[u],b[u],c[u])/CELL),xmax=Math.floor(Math.max(a[u],b[u],c[u])/CELL),zmin=Math.floor(Math.min(a[v],b[v],c[v])/CELL),zmax=Math.floor(Math.max(a[v],b[v],c[v])/CELL);
  for(let x=xmin;x<=xmax;x++)for(let z=zmin;z<=zmax;z++){const k=x*1000+z;let list=bins.get(k);if(!list)bins.set(k,list=[]);list.push(r);}
 }
 return q=>{
  const list=bins.get(Math.floor(q[u]/CELL)*1000+Math.floor(q[v]/CELL));let lo=Infinity,hi=-Infinity;if(!list)return null;
  for(const{a,b,c,d}of list){const s=((b[v]-c[v])*(q[u]-c[u])+(c[u]-b[u])*(q[v]-c[v]))/d,t=((c[v]-a[v])*(q[u]-c[u])+(a[u]-c[u])*(q[v]-c[v]))/d;
   if(s>=-1e-9&&t>=-1e-9&&s+t<=1+1e-9){const y=s*a[h]+t*b[h]+(1-s-t)*c[h];lo=Math.min(lo,y);hi=Math.max(hi,y);}}
  return hi===-Infinity?null:{lo,hi};
 };
}
export function createFemaleIdleAudit(templateId,seatVariant,build=createCharacterGeometry){
 const g=build(templateId,'seated',0,{seatVariant}),a=g.attributes,base=a.position.array,parts=a.characterPart.array,weights=a.characterWeight.array,tw=a.characterTorsoWeight.array,pivots=a.characterPivot.array,p=new Float32Array(base.length),robe=new THREE.Color(CHARACTER_TEMPLATES[templateId].robe);
 const nearColor=(i,col,tolerance)=>Math.abs(a.color.getX(i)-col.r)<tolerance&&Math.abs(a.color.getY(i)-col.g)<tolerance&&Math.abs(a.color.getZ(i)-col.b)<tolerance;
 const clothVertices=new Set();for(let i=0;i<a.position.count;i++)if([0,6].includes(parts[i])&&nearColor(i,robe,Math.max(robe.r,robe.g,robe.b)*.03+1e-6))clothVertices.add(i);
 const allTriangles=[];for(let i=0;i<g.index.count;i+=3)allTriangles.push([0,1,2].map(k=>g.index.getX(i+k)));
 const clothTriangles=allTriangles.filter(t=>t.every(i=>clothVertices.has(i))),hands=[],roots=[],sleeves=[],forearms=[];
 for(const part of[2,3]){
  const first=parts.indexOf(part);roots.push(...Array.from({length:16},(_,i)=>first+i));
  let start=-1,run=0;for(let i=first;i<parts.length;i++){if(parts[i]===part&&nearColor(i,skin,1e-6))run++;else run=0;if(run===40){start=i-39;break;}}
  if(start<0)throw Error('L0 palm not found');let end=start+40;while(end<parts.length&&parts[end]===part)end++;
  const triangles=allTriangles.filter(t=>t.every(i=>i>=start&&i<end));hands.push({part,start,end,triangles,samples:samplesOf(triangles),palm:Array.from({length:40},(_,i)=>start+i)});
  const wristY=base[start*3+1];
  for(let i=first;i<start;i++)if(base[i*3+1]<wristY+.11&&base[i*3+2]>.18){if(nearColor(i,skin,Math.max(skin.r,skin.g,skin.b)*.04))forearms.push(i);else sleeves.push(i);}
 }
 const relevant=[...new Set([...clothVertices,...roots,...sleeves,...forearms,...hands.flatMap(h=>Array.from({length:h.end-h.start},(_,i)=>h.start+i))])];
 const xyz=i=>[p[i*3],p[i*3+1],p[i*3+2]],at=sample=>{const q=[0,0,0];for(const[i,w]of sample)for(let j=0;j<3;j++)q[j]+=p[i*3+j]*w;return q;};
 function deform(state){
  const t=state.time+(state.phase??0),amp=state.amplitude??.7,swing=(.5+.5*Math.sin(t*.92))*.075*amp,lean=Math.sin(t*.55)*.008*amp,breath=Math.sin(t*1.7)*.004*amp;
  for(const i of relevant){const j=i*3;let x=base[j],y=base[j+1],z=base[j+2];
   if(parts[i]===2||parts[i]===3){const angle=swing*weights[i],c=Math.cos(angle),s=Math.sin(angle),dy=y-pivots[j+1],dz=z-pivots[j+2];y=pivots[j+1]+c*dy-s*dz;z=pivots[j+2]+s*dy+c*dz;}
   const angle=lean*tw[i],c=Math.cos(angle),s=Math.sin(angle),dy=y-.57,dz=z+.04,f=1+breath*tw[i];y=.57+c*dy-s*dz;z=-.04+s*dy+c*dz;x*=f;z=-.04+(z+.04)*f;p[j]=x;p[j+1]=y;p[j+2]=z;
  }
 }
 // Verify the allocation-light position kernel against the unchanged canonical
 // CPU contract before using it for the sweep. No substitute animation law.
 let kernelMaxError=0;for(const time of[0,1.7,8.31]){const state={pose:'seated',time,phase:.35,amplitude:.7,walkSpeed:0};deform(state);for(const i of relevant){const j=i*3,q=deformCharacterVertex(Array.from(base.subarray(j,j+3)),[0,1,0],{part:parts[i],pivot:Array.from(pivots.subarray(j,j+3)),weight:weights[i],torsoWeight:tw[i]},state).position;for(let k=0;k<3;k++)kernelMaxError=Math.max(kernelMaxError,Math.abs(p[j+k]-q[k]));}}if(kernelMaxError>1e-7)throw Error(`Cached kernel differs: ${kernelMaxError}`);
 const staticGap=new Map();deform({time:0,phase:0,amplitude:0});const staticCloth=gridFor(clothTriangles,p);for(const i of[...sleeves,...forearms]){const q=xyz(i),surface=staticCloth(q);if(surface)staticGap.set(i,q[1]-surface.hi);}
 function measure(state){
  deform(state);const cloth=gridFor(clothTriangles,p),body=gridFor(clothTriangles,p,1,2,0),lower=gridFor(hands[1].triangles,p);let handMin=Infinity,palmMin=Infinity,stackMin=Infinity,rootMargin=Infinity,sleeveMin=Infinity,forearmMin=Infinity,sleeveChange=Infinity,forearmChange=Infinity,worstHand=null;
  for(const h of hands){for(const sample of h.samples){const q=at(sample),surface=cloth(q);if(surface){const gap=q[1]-surface.hi;if(gap<handMin){handMin=gap;worstHand={part:h.part,point:q,clothY:surface.hi};}}if(h.part===2){const surface=lower(q);if(surface)stackMin=Math.min(stackMin,q[1]-surface.hi);}}
   if(h.part===3)for(const i of h.palm){const q=xyz(i),surface=cloth(q);if(surface)palmMin=Math.min(palmMin,q[1]-surface.hi);}}
  for(const i of roots){const q=xyz(i),surface=body(q);if(!surface)rootMargin=-Infinity;else rootMargin=Math.min(rootMargin,parts[i]===2?q[0]-surface.lo:surface.hi-q[0]);}
  for(const [ids,isSleeve]of[[sleeves,true],[forearms,false]])for(const i of ids){const q=xyz(i),surface=cloth(q);if(!surface)continue;const gap=q[1]-surface.hi,change=gap-(staticGap.get(i)??gap);if(isSleeve){sleeveMin=Math.min(sleeveMin,gap);sleeveChange=Math.min(sleeveChange,change);}else{forearmMin=Math.min(forearmMin,gap);forearmChange=Math.min(forearmChange,change);}}
  return {time:state.time,phase:state.phase??0,amplitude:state.amplitude??.7,handMin,palmMin,stackMin,rootMargin,sleeveMin,forearmMin,sleeveChange,forearmChange,worstHand};
 }
 const counts={deformedVertices:relevant.length,clothTriangles:clothTriangles.length,uniqueHandTriangleSamples:hands.reduce((n,h)=>n+h.samples.length,0),shoulderRootVertices:roots.length,sleeveClothRoiVertices:sleeves.length,forearmRoiVertices:forearms.length};
 return {measure,counts,kernelMaxError,staticRoi:{sleeveMin:Math.min(...sleeves.map(i=>staticGap.get(i)??Infinity)),forearmMin:Math.min(...forearms.map(i=>staticGap.get(i)??Infinity))},dispose:()=>g.dispose()};
}
