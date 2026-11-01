export const WUYING_BALUSTRADE_IDS=Object.freeze(['wuying-central-rail-east','wuying-central-rail-west']);
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-7;
const primitive=w=>w?.type==='box'?{type:'box',minX:w.box.min.x,maxX:w.box.max.x,minZ:w.box.min.z,maxZ:w.box.max.z,y0:w.box.max.y,y1:w.box.max.y}:w?.type==='ramp'?{type:'ramp',minX:w.minX,maxX:w.maxX,minZ:w.minZ,maxZ:w.maxZ,y0:w.y0,y1:w.y1,a0:w.a0,a1:w.a1,axis:w.axis}:null;
const same=(a,b)=>a&&b&&Object.keys(b).every(k=>typeof b[k]==='number'?near(a[k],b[k]):a[k]===b[k]);
export function expectedWuyingFloors(){
 const x=220.8,z=-249.8,edge=-9.75,run=1.28,width=5.68,cw=width*.54,fw=(width-cw)/2,step=run/5;
 const out=[{type:'box',minX:x-18.25,maxX:x+18.25,minZ:z+edge,maxZ:z-edge,y0:.8,y1:.8},
 {type:'ramp',axis:'z',minX:x-cw/2,maxX:x+cw/2,minZ:z+edge-run,maxZ:z+edge,a0:z+edge,a1:z+edge-run,y0:.8,y1:0}];
 for(let k=0;k<5;k++)for(const side of[-1,1]){const xx=x+side*(cw/2+fw/2),zz=z+edge-(k+.5)*step,y=.8-(k+1)*.8/6;out.push({type:'box',minX:xx-fw/2,maxX:xx+fw/2,minZ:zz-step/2,maxZ:zz+step/2,y0:y,y1:y});}
 out.push({type:'box',minX:x-width/2,maxX:x+width/2,minZ:z+edge-.05,maxZ:z+edge,y0:.81,y1:.81});return out;
}
export function bindWuyingFloors(walkables){return expectedWuyingFloors().map(ref=>{const matches=walkables.map(primitive).filter(w=>same(w,ref));if(matches.length!==1)throw Error('Wuying balustrades require all thirteen original stair/platform supports');return Object.freeze({...matches[0]});});}
export function wuyingBalustradeRegion(id){const side=id===WUYING_BALUSTRADE_IDS[0]?-1:id===WUYING_BALUSTRADE_IDS[1]?1:0;if(!side)throw TypeError('Known Wuying balustrade identity required');const x=220.8+side*3.04;return{minX:x-(side<0?1.6:.2),maxX:x+(side>0?1.6:.2),minZ:-261.48,maxZ:-258.95};}
export function cloneWuyingBalustradeFloor(input,id,owner,region){
 const r=wuyingBalustradeRegion(id),side=id===WUYING_BALUSTRADE_IDS[0]?-1:1,x=220.8+side*3.04,z=-260.71;
 const lo=[Math.fround(x-.14),Math.fround(.195),Math.fround(z-.14)],hi=[Math.fround(x+.14),Math.fround(1.135),Math.fround(z+.14)];
 if(Object.keys(r).some(k=>Math.abs(region[k]-r[k])>1e-10)||owner.min.toArray().some((v,i)=>Math.abs(v-lo[i])>1e-6)||owner.max.toArray().some((v,i)=>Math.abs(v-hi[i])>1e-6)||!Array.isArray(input)||input.length!==13||input.some((w,i)=>!same(w,expectedWuyingFloors()[i])))throw TypeError('Wuying balustrade exact lower-post owner, bounded region and original supports required');
 return Object.freeze(input.map(w=>Object.freeze({...w})));
}
export function registeredWuyingBalustradeFloor(source,scope,x,z,radius){
 if(scope.kind!=='wuying-central-balustrades'||!scope.floor||![x,z,radius].every(Number.isFinite)||radius<=0||x+radius<scope.minX||x-radius>scope.maxX||z+radius<scope.minZ||z-radius>scope.maxZ)return null;
 // Inspect live bounds on every call: no cache can conceal replacement,
 // duplicate insertion or in-place drift. Only the tiny canonical footprint
 // needs primitive expansion and the thirteen exact comparisons.
 const live=[];
 for(const w of source.walkables??[]){
  const minX=w?.type==='box'?w.box.min.x:w?.minX,maxX=w?.type==='box'?w.box.max.x:w?.maxX,minZ=w?.type==='box'?w.box.min.z:w?.minZ,maxZ=w?.type==='box'?w.box.max.z:w?.maxZ;
  if(minX<202.55-1e-7||maxX>239.05+1e-7||minZ< -260.83-1e-7||maxZ> -240.05+1e-7)continue;
  const p=primitive(w);if(p)live.push(p);
 }
 if(scope.floor.some(ref=>live.filter(w=>same(w,ref)).length!==1))return null;
 let best=null;
 for(const w of scope.floor){const x0=Math.max(x-radius,w.minX),x1=Math.min(x+radius,w.maxX),z0=Math.max(z-radius,w.minZ),z1=Math.min(z+radius,w.maxZ);if(x0>=x1||z0>=z1)continue;
 const y=zz=>w.type==='box'?w.y0:w.y0+(w.y1-w.y0)*(zz-w.a0)/(w.a1-w.a0),h0=y(z0),h1=y(z1),height=Math.max(h0,h1);
 if(!best||height>best.height)best={height,witness:{x:(x0+x1)/2,y:height,z:h0>=h1?z0:z1},owner:null,source:'existing-wuying-stair-floor',regionId:scope.id};}
 return best;
}

// The connected old horizontal rail ends at |localX|=4.14. Keep its high
// contact until the full body is outside; low adjacent stair routes keep their
// original solver instead of inheriting this extension.
export function wuyingBalustradeLowScope(id,from,to,radius,feetY){
 // Callers mix eye and feet vectors; only an explicit feet scalar enables
 // the high handoff. Missing authority never promotes an eye-height vector.
 if(Number.isFinite(feetY)&&feetY>=1.1)return true;
 const side=id===WUYING_BALUSTRADE_IDS[0]?-1:1,x=220.8+side*3.04,r={minX:x-(side<0?.7:.2),maxX:x+(side>0?.7:.2),minZ:-261.48,maxZ:-258.95};let enter=0,leave=1;
 for(const axis of ['x','z']){const low=r[axis==='x'?'minX':'minZ']-radius,high=r[axis==='x'?'maxX':'maxZ']+radius,start=from[axis],v=to[axis]-start;if(v===0){if(start<low||start>high)return false;}else{const a=(low-start)/v,b=(high-start)/v;enter=Math.max(enter,Math.min(a,b));leave=Math.min(leave,Math.max(a,b));if(enter>leave)return false;}}
 return enter<=leave;
}
