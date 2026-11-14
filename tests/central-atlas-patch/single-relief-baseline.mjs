import * as T from 'three';
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
export function reliefHeight(x,y){const r=Math.hypot(x,y)/.02;if(r<=.12||r>=1)return 0;const phase=Math.atan2(y,x)-7*r;const ridge=Math.pow(Math.max(0,Math.cos(phase)),2);return .002*ridge*smooth(.12,.30,r)*(1-smooth(.68,1,r));}
const theta=2.06,phi=.55;
export const RELIEF_CENTER=Object.freeze([.18*Math.cos(phi)*Math.sin(theta),2.005+.22*Math.sin(phi),.16*Math.cos(phi)*Math.cos(theta)]);
const unit=v=>{const l=Math.hypot(...v);if(!Number.isFinite(l)||l<1e-12)throw Error('normal invalid');return v.map(x=>x/l);};
const U=unit([.18*Math.cos(theta),0,-.16*Math.sin(theta)]),N=unit([RELIEF_CENTER[0]/(.18*.18),(RELIEF_CENTER[1]-2.005)/(.22*.22),RELIEF_CENTER[2]/(.16*.16)]);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],sub=(a,b)=>a.map((x,k)=>x-b[k]),dot=(a,b)=>a.reduce((s,x,k)=>s+x*b[k],0),V=unit(cross(N,U));
const key=(a,b)=>a<b?a+','+b:b+','+a;
function area(a,b,c){return cross(sub(b,a),sub(c,a));}
function quality(a,b,c){const q=area(a,b,c),den=dot(sub(a,b),sub(a,b))+dot(sub(b,c),sub(b,c))+dot(sub(c,a),sub(c,a));return 2*Math.sqrt(3)*Math.hypot(...q)/den;}
export function createSingleRelief(input,{amplitude=1,center=RELIEF_CENTER,maxNewVertices=12000,maxTriangles=180000,maxLevels=10,targetEdge=.003}={}){
 for(const [value,limit] of [[maxNewVertices,12000],[maxTriangles,180000],[maxLevels,10]])if(!Number.isInteger(value)||value<1||value>limit)throw Error('budget parameter');
 if(!Number.isFinite(targetEdge)||targetEdge!==.003)throw Error('target edge parameter');
 if(!Array.isArray(center)||center.length!==3||center.some((v,i)=>v!==RELIEF_CENTER[i]))throw Error('protected fixed support center');
 if(!Number.isFinite(amplitude)||amplitude<0||amplitude>1)throw Error('amplitude');
 if(!input.index||!input.attributes.studyScalpEligible)throw Error('eligible indexed input required');
 if(center.length!==3||!center.every(Number.isFinite))throw Error('center');
 const attrs={},sizes={},types={};for(const[name,a]of Object.entries(input.attributes)){if(a.isInterleavedBufferAttribute||a.normalized)throw Error('attribute format');attrs[name]=Array.from(a.array);sizes[name]=a.itemSize;types[name]=a.array.constructor;}
 const oldCount=input.attributes.position.count;const p=i=>attrs.position.slice(i*3,i*3+3),n=i=>attrs.normal.slice(i*3,i*3+3),dist=i=>Math.hypot(...sub(p(i),center));
 let faces=[];for(const g of input.groups){if(g.start%3||g.count%3)throw Error('groups');for(let i=g.start;i<g.start+g.count;i+=3){const ids=[0,1,2].map(k=>input.index.getX(i+k));if(ids.some(x=>x<0||x>=oldCount))throw Error('index');faces.push({ids,m:g.materialIndex});}}
 const eligible=f=>f.m===1&&f.ids.every(i=>attrs.studyScalpEligible[i]===1);
 let splitRounds=0;for(let round=0;round<maxLevels;round++){
  const edges=new Map();for(let fi=0;fi<faces.length;fi++){const ids=faces[fi].ids;for(let k=0;k<3;k++){const a=ids[k],b=ids[(k+1)%3],s=key(a,b);if(!edges.has(s))edges.set(s,{a,b,faces:[]});edges.get(s).faces.push(fi);}}
  const marked=new Map();for(const[s,e]of edges){if(Math.min(dist(e.a),dist(e.b))>.034)continue;if(Math.hypot(...sub(p(e.a),p(e.b)))<=targetEdge)continue;if(e.faces.length!==2)throw Error('nonmanifold support');if(!e.faces.every(i=>eligible(faces[i])))throw Error('protected or ineligible support');marked.set(s,e);}
  if(!marked.size)break;if(round===maxLevels-1)throw Error('subdivision budget levels');if(attrs.position.length/3-oldCount+marked.size>maxNewVertices)throw Error('vertex budget');
  for(const e of marked.values()){e.mid=attrs.position.length/3;for(const name of Object.keys(attrs))for(let k=0;k<sizes[name];k++)attrs[name].push((attrs[name][e.a*sizes[name]+k]+attrs[name][e.b*sizes[name]+k])/2);}
  const next=[];for(const f of faces){const[a,b,c]=f.ids,ab=marked.get(key(a,b))?.mid,bc=marked.get(key(b,c))?.mid,ca=marked.get(key(c,a))?.mid;const count=[ab,bc,ca].filter(x=>x!==undefined).length;let tris;
   if(!count)tris=[[a,b,c]];
   else if(count===3)tris=[[a,ab,ca],[ab,b,bc],[ca,bc,c],[ab,bc,ca]];
   else if(count===1){if(ab!==undefined)tris=[[a,ab,c],[ab,b,c]];else if(bc!==undefined)tris=[[b,bc,a],[bc,c,a]];else tris=[[c,ca,b],[ca,a,b]];}
   else{let x,y,z,xy,yz;if(ab!==undefined&&bc!==undefined){[x,y,z,xy,yz]=[a,b,c,ab,bc];}else if(bc!==undefined&&ca!==undefined){[x,y,z,xy,yz]=[b,c,a,bc,ca];}else{[x,y,z,xy,yz]=[c,a,b,ca,ab];}
    const first=[[x,xy,z],[xy,yz,z]],second=[[x,xy,yz],[x,yz,z]],score=ts=>Math.min(...ts.map(t=>quality(...t.map(p))));tris=[[xy,y,yz],...(score(first)>=score(second)?first:second)];}
   for(const ids of tris)next.push({ids,m:f.m});
  }faces=next;if(faces.length>maxTriangles)throw Error('triangle budget');splitRounds++;
 }
 if(!splitRounds)throw Error('empty support');
 const base=attrs.position.slice(),before=i=>base.slice(3*i,3*i+3),count=base.length/3,delta=new Float64Array(count),originalNormal=attrs.normal.slice();let changedVertices=0,maxDisplacement=0;
 for(let i=0;i<count;i++){const d=sub(before(i),center);if(Math.hypot(...d)>=.024||attrs.studyScalpEligible[i]!==1)continue;const h=amplitude*reliefHeight(dot(d,U),dot(d,V));if(h===0)continue;const nn=unit(n(i));for(let k=0;k<3;k++)attrs.position[3*i+k]+=h*nn[k];delta[i]=h;changedVertices++;maxDisplacement=Math.max(maxDisplacement,h);}
 const sums0=new Float64Array(count*3),sums1=new Float64Array(count*3);let invertedFaces=0,minQuality=1;for(const f of faces){const a0=area(...f.ids.map(before)),a1=area(...f.ids.map(p));if(Math.hypot(...a0)<1e-14||Math.hypot(...a1)<1e-14)throw Error('degenerate face');if(dot(a0,a1)<=0)invertedFaces++;if(f.ids.some(i=>delta[i]>0))minQuality=Math.min(minQuality,quality(...f.ids.map(p)));for(const i of f.ids)for(let k=0;k<3;k++){sums0[3*i+k]+=a0[k];sums1[3*i+k]+=a1[k];}}
 if(invertedFaces)throw Error('inverted face');let maxNormalChange=0;if(amplitude!==0)for(let i=0;i<count;i++){const r=Math.hypot(...sub(before(i),center)),w=1-smooth(.022,.030,r);if(w===0||attrs.studyScalpEligible[i]!==1)continue;const a=unit(Array.from(sums0.slice(i*3,i*3+3))),b=unit(Array.from(sums1.slice(i*3,i*3+3))),old=unit(originalNormal.slice(i*3,i*3+3));const q=unit(old.map((x,k)=>x+w*(b[k]-a[k])));const angle=Math.acos(Math.max(-1,Math.min(1,dot(q,old))));if(angle>.9)throw Error('normal deviation');maxNormalChange=Math.max(maxNormalChange,angle);for(let k=0;k<3;k++)attrs.normal[3*i+k]=q[k];}
 const bodyEdges=new Map();for(const f of faces)if(f.ids.every(i=>attrs.studyScalpEligible[i]===1))for(let k=0;k<3;k++){const s=key(f.ids[k],f.ids[(k+1)%3]);bodyEdges.set(s,(bodyEdges.get(s)||0)+1);}const bodyBoundaryEdges=[...bodyEdges.values()].filter(v=>v!==2).length;if(bodyBoundaryEdges)throw Error('body nonmanifold');
 const geometry=new T.BufferGeometry();for(const[name,values]of Object.entries(attrs)){if(!values.every(Number.isFinite))throw Error('nonfinite attribute');geometry.setAttribute(name,new T.BufferAttribute(new types[name](values),sizes[name]));}const indices=[];for(const material of [...new Set(faces.map(f=>f.m))].sort((a,b)=>a-b)){const start=indices.length;for(const f of faces)if(f.m===material)indices.push(...f.ids);geometry.addGroup(start,indices.length-start,material);}geometry.setIndex(indices);geometry.computeBoundingBox();geometry.computeBoundingSphere();
 return{geometry,report:{scope:'SINGLE_CONTINUOUS_LOW_RELIEF_ENGINEERING_DIAGNOSTIC',center,radius:.02,maxHeight:.003,splitRounds,newVertices:count-oldCount,triangles:faces.length,changedVertices,maxDisplacement,maxNormalChange,minQuality,invertedFaces,bodyBoundaryEdges,amplitude}};
}

export function disposeRefined(geometry,original){try{geometry.dispose();}finally{original.dispose();}}
