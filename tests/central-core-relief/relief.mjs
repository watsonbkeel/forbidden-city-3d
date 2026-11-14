import * as T from 'three';
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
export function reliefHeight(x,y){const r=Math.hypot(x,y)/.02;if(r<=.12||r>=1)return 0;const phase=Math.atan2(y,x)-7*r;const ridge=Math.pow(Math.max(0,Math.cos(phase)),2);return .002*ridge*smooth(.12,.30,r)*(1-smooth(.68,1,r));}
// Fixed diagnostic morphology, generated-front-art inspired, not surveyed.
export function coreHeight(x,y){
 const r=Math.hypot(x,y)/.02;if(r>=1)return 0;
 const S=v=>{const t=Math.max(0,Math.min(1,v));return t*t*t*(10+t*(-15+6*t));};
 const B=1-S((r-.65)/.35),G=Math.exp(-((x-.003)**2+(y+.001)**2)/(.006**2));
 const W=r<=.15?0:Math.pow((1+Math.cos(Math.atan2(y,x)-4*r))/2,2)*S((r-.15)/.20);
 return .002*B*(.75*G+.25*W);
}
const theta=2.06,phi=.55;
export const RELIEF_CENTER=Object.freeze([.18*Math.cos(phi)*Math.sin(theta),2.005+.22*Math.sin(phi),.16*Math.cos(phi)*Math.cos(theta)]);
const unit=v=>{const l=Math.hypot(...v);if(!Number.isFinite(l)||l<1e-12)throw Error('normal invalid');return v.map(x=>x/l);};
const U=unit([.18*Math.cos(theta),0,-.16*Math.sin(theta)]),N=unit([RELIEF_CENTER[0]/(.18*.18),(RELIEF_CENTER[1]-2.005)/(.22*.22),RELIEF_CENTER[2]/(.16*.16)]);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],sub=(a,b)=>a.map((x,k)=>x-b[k]),dot=(a,b)=>a.reduce((s,x,k)=>s+x*b[k],0),V=unit(cross(N,U));
const key=(a,b)=>a<b?a+','+b:b+','+a;
function area(a,b,c){return cross(sub(b,a),sub(c,a));}
function quality(a,b,c){const q=area(a,b,c),den=dot(sub(a,b),sub(a,b))+dot(sub(b,c),sub(b,c))+dot(sub(c,a),sub(c,a));return 2*Math.sqrt(3)*Math.hypot(...q)/den;}
function buildRelief(input,{amplitude=1,center=RELIEF_CENTER,mode='first',maxNewVertices=12000,maxTriangles=180000,maxLevels=10,targetEdge=.003}={}){
 for(const [value,limit] of [[maxNewVertices,12000],[maxTriangles,180000],[maxLevels,10]])if(!Number.isInteger(value)||value<1||value>limit)throw Error('budget parameter');
 if(!Number.isFinite(targetEdge)||targetEdge!==.003)throw Error('target edge parameter');
 if(!Array.isArray(center)||center.length!==3||center.some((v,i)=>v!==RELIEF_CENTER[i]))throw Error('protected fixed support center');
 if(!Number.isFinite(amplitude)||amplitude<0||amplitude>1)throw Error('amplitude');
 if(!['first','second','pair','pair-reversed','core'].includes(mode))throw Error('fixed mode');
 const frame=t=>{const c=[.18*Math.cos(phi)*Math.sin(t),2.005+.22*Math.sin(phi),.16*Math.cos(phi)*Math.cos(t)],u=unit([.18*Math.cos(t),0,-.16*Math.sin(t)]),nn=unit([c[0]/(.18*.18),(c[1]-2.005)/(.22*.22),c[2]/(.16*.16)]);return{c,u,v:unit(cross(nn,u))};};
 // Canonical frame order makes even pair-reversed deterministic; no sequential deformation.
 const frames=(mode==='first'||mode==='core')?[{c:center,u:U,v:V}]:mode==='second'?[frame(2.36)]:[{c:center,u:U,v:V},frame(2.36)];
 if(frames.length===2&&Math.hypot(...sub(frames[0].c,frames[1].c))<=.040)throw Error('overlapping nominal support');
 const effectiveEdge=targetEdge;
 const heightAt=(pos,f)=>{const d=sub(pos,f.c);return Math.hypot(...d)>=.024?0:(mode==='core'?coreHeight:reliefHeight)(dot(d,f.u),dot(d,f.v));};

 if(!input.index||!input.attributes.studyScalpEligible)throw Error('eligible indexed input required');
 if(center.length!==3||!center.every(Number.isFinite))throw Error('center');
 const attrs={},sizes={},types={};for(const[name,a]of Object.entries(input.attributes)){if(a.isInterleavedBufferAttribute||a.normalized)throw Error('attribute format');attrs[name]=Array.from(a.array);sizes[name]=a.itemSize;types[name]=a.array.constructor;}
 const oldCount=input.attributes.position.count;const p=i=>attrs.position.slice(i*3,i*3+3),n=i=>attrs.normal.slice(i*3,i*3+3),dist=i=>Math.min(...frames.map(f=>Math.hypot(...sub(p(i),f.c))));
 let faces=[];for(const g of input.groups){if(g.start%3||g.count%3)throw Error('groups');for(let i=g.start;i<g.start+g.count;i+=3){const ids=[0,1,2].map(k=>input.index.getX(i+k));if(ids.some(x=>x<0||x>=oldCount))throw Error('index');faces.push({ids,m:g.materialIndex});}}
 const eligible=f=>f.m===1&&f.ids.every(i=>attrs.studyScalpEligible[i]===1);
 let splitRounds=0,finalGradientRisk=0,greenPredictionFailures=0,planningVisits=0;for(let round=0;round<maxLevels;round++){
  const edges=new Map();for(let fi=0;fi<faces.length;fi++){const ids=faces[fi].ids;for(let k=0;k<3;k++){const a=ids[k],b=ids[(k+1)%3],s=key(a,b);if(!edges.has(s))edges.set(s,{a,b,faces:[]});edges.get(s).faces.push(fi);}}
  const marked=new Map();for(const[s,e]of edges){if(Math.min(dist(e.a),dist(e.b))>.034)continue;if(Math.hypot(...sub(p(e.a),p(e.b)))<=effectiveEdge)continue;if(e.faces.length!==2)throw Error('nonmanifold support');if(!e.faces.every(i=>eligible(faces[i])))throw Error('protected or ineligible support');marked.set(s,e);}
  if(mode!=='first'){
   // Refine all edges of seed faces together. Neighbor faces still use the same
   // global split set, so this is conforming without recurrent long diagonals.
   const extra=new Set();for(const f of faces){if(!f.ids.some(i=>dist(i)<=.034))continue;const ks=f.ids.map((a,k)=>key(a,f.ids[(k+1)%3]));if(ks.some(k=>marked.has(k)))for(const k of ks)extra.add(k);}
   for(const k of extra){const e=edges.get(k);if(e.faces.length!==2||!e.faces.every(i=>eligible(faces[i])))throw Error('protected refinement collar');marked.set(k,e);}
  }
  finalGradientRisk=0;
  if(mode!=='first')for(const f of faces){
   if(!f.ids.some(i=>dist(i)<.034))continue;
   const ps=f.ids.map(p),lengths=ps.map((a,k)=>Math.hypot(...sub(a,ps[(k+1)%3]))),longest=Math.max(...lengths);
   const risk=heightGradientRisk(ps,pos=>frames.reduce((sum,fr)=>sum+heightAt(pos,fr),0));
   finalGradientRisk=Math.max(finalGradientRisk,risk);
   if(risk>.35)for(let k=0;k<3;k++){const id=key(f.ids[k],f.ids[(k+1)%3]),e=edges.get(id);if(e.faces.length!==2||!e.faces.every(i=>eligible(faces[i])))throw Error('protected adaptive support');marked.set(id,e);}
  }
  if(mode!=='first'&&marked.size){
   const virtual=[],mids=new Map();const addMid=(k,e)=>{mids.set(k,-virtual.length-1);virtual.push(p(e.a).map((x,j)=>(x+p(e.b)[j])/2));};
   for(const[k,e]of marked)addMid(k,e);
   const point=i=>i<0?virtual[-i-1]:p(i),queue=[],queued=new Set();
   const enqueue=i=>{if(!queued.has(i)){queued.add(i);queue.push(i);}};
   for(const e of marked.values())for(const i of e.faces)enqueue(i);
   // Each requeue is caused by a new unique split edge. At most two incident
   // faces are enqueued per edge; the original vertex budget bounds additions.
   for(let cursor=0;cursor<queue.length;cursor++){
    planningVisits++;if(cursor>faces.length+2*maxNewVertices)throw Error('monotone planning work budget');
    const fi=queue[cursor];queued.delete(fi);const f=faces[fi],count=f.ids.filter((a,k)=>marked.has(key(a,f.ids[(k+1)%3]))).length;
    if(count===0||count===3||!f.ids.some(i=>dist(i)<=.034))continue;
    if(!splitTriangle(f.ids,mids,point).some(ids=>heightGradientRisk(ids.map(point),pos=>frames.reduce((sum,fr)=>sum+heightAt(pos,fr),0))>.35))continue;
    for(let k=0;k<3;k++){const id=key(f.ids[k],f.ids[(k+1)%3]);if(marked.has(id))continue;const e=edges.get(id);if(e.faces.length!==2||!e.faces.every(i=>eligible(faces[i])))throw Error('protected predicted green support');if(attrs.position.length/3-oldCount+marked.size+1>maxNewVertices)throw Error('predicted vertex budget');marked.set(id,e);addMid(id,e);for(const i of e.faces)enqueue(i);}
   }
   for(const f of faces){const count=f.ids.filter((a,k)=>marked.has(key(a,f.ids[(k+1)%3]))).length;if(count===0||count===3||!f.ids.some(i=>dist(i)<=.034))continue;if(splitTriangle(f.ids,mids,point).some(ids=>heightGradientRisk(ids.map(point),pos=>frames.reduce((sum,fr)=>sum+heightAt(pos,fr),0))>.35))greenPredictionFailures++;}
   if(greenPredictionFailures)throw Error('green planning terminal verification');
  }
  if(faces.length+2*marked.size>maxTriangles)throw Error('predicted triangle budget');
  if(!marked.size)break;if(round===maxLevels-1)throw Error('subdivision budget levels: '+JSON.stringify({round,marked:marked.size,maxEdge:Math.max(...[...marked.values()].map(e=>Math.hypot(...sub(p(e.a),p(e.b))))),newVertices:attrs.position.length/3-oldCount}));if(attrs.position.length/3-oldCount+marked.size>maxNewVertices)throw Error('vertex budget '+JSON.stringify({round,current:attrs.position.length/3-oldCount,requested:marked.size}));
  for(const e of marked.values()){e.mid=attrs.position.length/3;for(const name of Object.keys(attrs))for(let k=0;k<sizes[name];k++)attrs[name].push((attrs[name][e.a*sizes[name]+k]+attrs[name][e.b*sizes[name]+k])/2);}
  const mids=new Map([...marked].map(([k,e])=>[k,e.mid])),next=[];for(const f of faces)for(const ids of splitTriangle(f.ids,mids,p))next.push({ids,m:f.m});faces=next;if(faces.length>maxTriangles)throw Error('triangle budget');splitRounds++;
 }
 if(!splitRounds)throw Error('empty support');
 let overlapSamples=0,checkedSupportSamples=0;
 for(const f of faces){if(!f.ids.some(i=>dist(i)<.034))continue;for(let a=0;a<=8;a++)for(let b=0;b<=8-a;b++){const w=[a/8,b/8,1-(a+b)/8],pos=[0,1,2].map(k=>f.ids.reduce((sum,id,j)=>sum+w[j]*p(id)[k],0));if(frames.filter(fr=>heightAt(pos,fr)>1e-12).length>1)overlapSamples++;checkedSupportSamples++;}}
 if(overlapSamples)throw Error('actual height overlap');
 const base=attrs.position.slice(),before=i=>base.slice(3*i,3*i+3),count=base.length/3,delta=new Float64Array(count),originalNormal=attrs.normal.slice();let changedVertices=0,maxDisplacement=0;
 for(let i=0;i<count;i++){if(attrs.studyScalpEligible[i]!==1)continue;const h=amplitude*frames.reduce((sum,f)=>sum+heightAt(before(i),f),0);if(h>.002001)throw Error('summed height');if(h===0)continue;const nn=unit(n(i));for(let k=0;k<3;k++)attrs.position[3*i+k]+=h*nn[k];delta[i]=h;changedVertices++;maxDisplacement=Math.max(maxDisplacement,h);}
 const sums0=new Float64Array(count*3),sums1=new Float64Array(count*3);let invertedFaces=0,minQuality=1;for(const f of faces){const a0=area(...f.ids.map(before)),a1=area(...f.ids.map(p));if(Math.hypot(...a0)<1e-14||Math.hypot(...a1)<1e-14)throw Error('degenerate face');if(dot(a0,a1)<=0)invertedFaces++;if(f.ids.some(i=>delta[i]>0))minQuality=Math.min(minQuality,quality(...f.ids.map(p)));for(const i of f.ids)for(let k=0;k<3;k++){sums0[3*i+k]+=a0[k];sums1[3*i+k]+=a1[k];}}
 if(invertedFaces)throw Error('inverted face');let maxNormalChange=0;if(amplitude!==0)for(let i=0;i<count;i++){const w=Math.max(...frames.map(f=>1-smooth(.022,.030,Math.hypot(...sub(before(i),f.c)))));if(w===0||attrs.studyScalpEligible[i]!==1)continue;const a=unit(Array.from(sums0.slice(i*3,i*3+3))),b=unit(Array.from(sums1.slice(i*3,i*3+3))),old=unit(originalNormal.slice(i*3,i*3+3));const q=unit(old.map((x,k)=>x+w*(b[k]-a[k])));const angle=Math.acos(Math.max(-1,Math.min(1,dot(q,old))));if(angle>.9)throw Error('normal deviation '+JSON.stringify({i,angle,pos:before(i),w,original:old,before:a,after:b,heights:frames.map(f=>heightAt(before(i),f))}));maxNormalChange=Math.max(maxNormalChange,angle);for(let k=0;k<3;k++)attrs.normal[3*i+k]=q[k];}
 const bodyEdges=new Map();for(const f of faces)if(f.ids.every(i=>attrs.studyScalpEligible[i]===1))for(let k=0;k<3;k++){const s=key(f.ids[k],f.ids[(k+1)%3]);bodyEdges.set(s,(bodyEdges.get(s)||0)+1);}const bodyBoundaryEdges=[...bodyEdges.values()].filter(v=>v!==2).length;if(bodyBoundaryEdges)throw Error('body nonmanifold');
 const geometry=new T.BufferGeometry();for(const[name,values]of Object.entries(attrs)){if(!values.every(Number.isFinite))throw Error('nonfinite attribute');geometry.setAttribute(name,new T.BufferAttribute(new types[name](values),sizes[name]));}const indices=[];for(const material of [...new Set(faces.map(f=>f.m))].sort((a,b)=>a-b)){const start=indices.length;for(const f of faces)if(f.m===material)indices.push(...f.ids);geometry.addGroup(start,indices.length-start,material);}geometry.setIndex(indices);geometry.computeBoundingBox();geometry.computeBoundingSphere();
 return{geometry,report:{scope:mode==='core'?'SINGLE_ROUNDED_CORE_ENGINEERING_DIAGNOSTIC':'BOUNDED_TWO_CONTINUOUS_LOW_RELIEF_ENGINEERING_DIAGNOSTIC',center,centers:frames.map(f=>f.c),curlCount:frames.length,mode,effectiveEdge,finalGradientRisk,greenPredictionFailures,planningVisits,overlapSamples,checkedSupportSamples,radius:.02,maxHeight:.002,splitRounds,newVertices:count-oldCount,triangles:faces.length,changedVertices,maxDisplacement,maxNormalChange,minQuality,invertedFaces,bodyBoundaryEdges,amplitude}};
}

export function disposeRefined(geometry,original){try{geometry.dispose();}finally{original.dispose();}}

export function createSingleRelief(input,options={}){return buildRelief(input,{...options,mode:'first'});}
export function createDoubleRelief(input,options={}){return buildRelief(input,{...options,mode:options.mode??'pair'});}

export function heightGradientRisk(ps,height){
 const e1=sub(ps[1],ps[0]),e2=sub(ps[2],ps[0]),len=Math.hypot(...e1),a=unit(e1),b=unit(cross(unit(cross(e1,e2)),a)),h=ps.map(height),den=dot(e2,b);
 if(!Number.isFinite(den)||Math.abs(den)<1e-14)throw Error('gradient degenerate');
 const qa=(h[1]-h[0])/len,qb=(h[2]-h[0]-qa*dot(e2,a))/den;let risk=0;
 for(const w of[[.5,.5,0],[0,.5,.5],[.5,0,.5],[1/3,1/3,1/3]]){const pos=[0,1,2].map(k=>ps.reduce((sum,v,j)=>sum+w[j]*v[k],0));const grad=(axis,step)=>(height(pos.map((x,k)=>x+step*axis[k]))-height(pos.map((x,k)=>x-step*axis[k])))/(2*step);const ga=grad(a,1e-6),gb=grad(b,1e-6);if(Math.hypot(ga-grad(a,5e-7),gb-grad(b,5e-7))>.005)throw Error('gradient derivative unstable');risk=Math.max(risk,Math.hypot(qa-ga,qb-gb));}
 return risk;
}

function splitTriangle(ids,midpoints,p){const[a,b,c]=ids,ab=midpoints.get(key(a,b)),bc=midpoints.get(key(b,c)),ca=midpoints.get(key(c,a));const count=[ab,bc,ca].filter(x=>x!==undefined).length;let tris;
   if(!count)tris=[[a,b,c]];
   else if(count===3)tris=[[a,ab,ca],[ab,b,bc],[ca,bc,c],[ab,bc,ca]];
   else if(count===1){if(ab!==undefined)tris=[[a,ab,c],[ab,b,c]];else if(bc!==undefined)tris=[[b,bc,a],[bc,c,a]];else tris=[[c,ca,b],[ca,a,b]];}
   else{let x,y,z,xy,yz;if(ab!==undefined&&bc!==undefined){[x,y,z,xy,yz]=[a,b,c,ab,bc];}else if(bc!==undefined&&ca!==undefined){[x,y,z,xy,yz]=[b,c,a,bc,ca];}else{[x,y,z,xy,yz]=[c,a,b,ca,ab];}
    const first=[[x,xy,z],[xy,yz,z]],second=[[x,xy,yz],[x,yz,z]],score=ts=>Math.min(...ts.map(t=>quality(...t.map(p))));tris=[[xy,y,yz],...(score(first)>=score(second)?first:second)];}
return tris;}
