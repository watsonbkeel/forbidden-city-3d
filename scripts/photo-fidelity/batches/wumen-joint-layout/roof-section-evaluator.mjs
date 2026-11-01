import {createUpperReassemblyContract} from './upper-contract.mjs';
// Pure, non-installed old-parameter/candidate numeric sections. No Three geometry.
const unit=x=>{if(typeof x!=='number'||!Number.isFinite(x)||x<0||x>1)throw Error('roof section parameter outside [0,1]');return x;};
const face=f=>{if(!Number.isInteger(f)||f<0||f>3)throw Error('roof section unknown face');};
const tileSize=n=>{if(typeof n!=='number'||!Number.isFinite(n)||n<=0)throw Error('roof section tileSize must be positive finite');};
const unique=a=>[...new Set(a)].sort((a,b)=>a-b);
const finiteUV=a=>{if(!a.every(Number.isFinite))throw Error('roof section UV result must remain finite');return a;};
const corners=(x,z)=>[[-x,-z],[x,-z],[x,z],[-x,z]];
const lerp=(a,b,t)=>a+(b-a)*t;
function mapAxis(value,old,target){
 const sign=value<0?-1:1,v=Math.abs(value);let mapped;
 const exact=old.indexOf(v);
 if(exact>=0)mapped=target[exact];else{let k=1;while(k<old.length-1&&v>old[k])k++;mapped=lerp(target[k-1],target[k],(v-old[k-1])/(old[k]-old[k-1]));}
 return sign*mapped;
}
export function createRoofSection(instanceId,layer,mode){
 const c=createUpperReassemblyContract(),i=c.roofKnots.instances.find(x=>x.id===instanceId);
 if(!i||!(i.kind==='pavilion'?['lower','upper']:['single']).includes(layer)||!['predecessor','proposal'].includes(mode))throw Error('roof section unknown instance/layer/mode');
 const r=c.roofRecipe[layer==='lower'?'pavilionLower':layer==='upper'?'pavilionUpper':'wingSingle'],k=i[layer],proposal=mode==='proposal';
 const old=layer==='lower'?[k.oldSkirtKnotsInnerBearingEave,k.oldSkirtKnotsInnerBearingEave]:k.knotsPerAxis.old;
 const target=proposal?(layer==='lower'?k.newSkirtKnotsInnerBearingEave:k.knotsPerAxis.proposal):old;
 const footprint=layer==='lower'?(proposal?k.newFootprintHalf:k.oldFootprintHalf):k[proposal?'proposal':'old'].footprintHalf;
 function ring(t){
  unit(t);
  if(t===r.tw)return corners(...footprint);
  let hx,hz;
  if(layer==='lower'){hx=lerp(old[0][0],old[0].at(-1),t);hz=lerp(old[1][0],old[1].at(-1),t);}
  else if(layer==='upper'){hx=old[0].at(-1)*t;hz=old[1].at(-1)*t;}
  else{const rx=r.ridgeHalf;hx=rx+old[1].at(-1)*t;hz=old[1].at(-1)*t;}
  return corners(mapAxis(hx,old[0],target[0]),mapAxis(hz,old[1],target[1]));
 }
 function baseY(t){unit(t);const anchor=r.anchors.find(a=>a.t===t);if(anchor)return anchor.baseY;const a=r.profileCoefficient,P=a*(1-t)+(1-a)*(1-t)**2;return r.eaveY+r.H*P;}
 const end=ring(1),T=[],N=[];
 for(let f=0;f<4;f++){const a=end[f],b=end[(f+1)%4],len=Math.hypot(b[0]-a[0],b[1]-a[1]);T.push([(b[0]-a[0])/len,(b[1]-a[1])/len]);N.push([T[f][1],-T[f][0]]);}
 const dir=N.map((n,j)=>{const p=N[(j+3)%4],x=n[0]+p[0],z=n[1]+p[1],len=Math.hypot(x,z);return[x/len,z/len];});
 function point(f,t,s,options={}){
  face(f);unit(t);unit(s);if(!options||Object.getPrototypeOf(options)!==Object.prototype||Object.keys(options).some(x=>x!=='lift')||('lift'in options&&typeof options.lift!=='boolean'))throw Error('roof section invalid lift options');
  const C=ring(t),a=C[f],b=C[(f+1)%4];let x=lerp(a[0],b[0],s),z=lerp(a[1],b[1],s),y=baseY(t);
  if(options.lift!==false&&t>r.tw){const len=Math.hypot(b[0]-a[0],b[1]-a[1]),near=s<.5?f:(f+1)%4,weight=(1-Math.min(Math.min(s,1-s)*len/r.lift.D,1))**2*((t-r.tw)/(1-r.tw))**1.6;x+=dir[near][0]*r.lift.O*weight;z+=dir[near][1]*r.lift.O*weight;y+=r.lift.L*weight;}
  return[x,y,z];
 }
 const nT=r.sampleCounts.nT,rs=Math.max(2,Math.round(nT*(1-r.tw)*1.5));
 const samples={tile:unique([...Array.from({length:nT+1},(_,j)=>j/nT),r.tw]),soffit:unique(Array.from({length:rs+1},(_,j)=>j===0?r.tw:j===rs?1:lerp(r.tw,1,j/rs))),arc:unique([...Array.from({length:65},(_,j)=>j/64),r.tw])};
 function sampleT(kind){if(!Object.hasOwn(samples,kind))throw Error('roof section unknown sample kind');return [...samples[kind]];}
 const arcs=N.map((n,f)=>{const sums=[0];let previous;for(let j=0;j<samples.arc.length;j++){const t=samples.arc[j],C=ring(t),a=C[f],b=C[(f+1)%4],rho=((a[0]+b[0])*n[0]+(a[1]+b[1])*n[1])/2,y=baseY(t);if(j)sums.push(sums[j-1]+Math.hypot(rho-previous[0],y-previous[1]));previous=[rho,y];}return sums;});
 function arcAt(f,t){const ts=samples.arc,S=arcs[f],exact=ts.indexOf(t);if(exact>=0)return S[exact];let j=1;while(ts[j]<t)j++;return lerp(S[j-1],S[j],(t-ts[j-1])/(ts[j]-ts[j-1]));}
 function uv(f,t,s,size){face(f);unit(t);unit(s);tileSize(size);const p=point(f,t,s,{lift:false});return finiteUV([(p[0]*T[f][0]+p[2]*T[f][1])/size,(arcs[f].at(-1)-arcAt(f,t))/size]);}
 function fasciaUV(f,s,a,size){unit(a);const u=uv(f,1,s,size)[0];return finiteUV([u,a*1.5*r.thickness/size]);}
 return Object.freeze({instanceId,layer,mode,accepted:false,runtimeInstalled:false,routeAccepted:false,recipe:r,ring,baseY,point,sampleT,uv,fasciaUV});
}
