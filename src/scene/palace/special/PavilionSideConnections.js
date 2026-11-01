import * as THREE from 'three';

// Local engineering adapters, not a surveyed reconstruction. Buildings and
// gallery door locations are inputs, never moved to make these paths work.
export function sideConnectionTargets(zone,item){
 if(zone.id!=='axis-courts'||!['tiren','hongyi'].includes(item.pavilionProfile))return undefined;
 const indices=item.pavilionProfile==='tiren'?[28,29]:[34,35];
 return indices.map((i,k)=>({direction:k?'north':'south',itemIndex:i,item:zone.items[i]}));
}
const height=(r,x,z)=>r.y0+(r.y1-r.y0)*((r.axis==='x'?x:z)-r.a0)/(r.a1-r.a0||1);
const inside=(r,x,z)=>x>=r.minX-1e-7&&x<=r.maxX+1e-7&&z>=r.minZ-1e-7&&z<=r.maxZ+1e-7;
function rect(x0,z0,x1,z1,y,role){return{minX:Math.min(x0,x1),maxX:Math.max(x0,x1),minZ:Math.min(z0,z1),maxZ:Math.max(z0,z1),axis:'x',a0:x0,a1:x1,y0:y,y1:y,role};}
export function connectionPlan(g,s,target){
 const a=target.item;if(a.kind!=='corridor'||a.from[0]!==a.to[0]||!['x+','x-'].includes(a.facing)||a.depth!==undefined)throw Error('Side connection requires retained default gallery');
 const h=1.2,dir=s.direction==='south'?-1:1,start=g.toWorld(s.xOuter,s.zCenter),toward=Math.sign(a.from[0]-start[0]);
 const apronX=a.from[0]-toward*3.5,turnZ=start[1]+dir*(8+h),middleY=1.45;
 const len=Math.abs(a.to[1]-a.from[1]),w=len-1,n=Math.max(3,Math.round(len/3.4)|1),segs=[];
 for(let i=0;i<n;i+=3)segs.push([i,Math.min(n,i+3)]);
 if(n<=4)segs.splice(0,segs.length,[0,n]);else if(segs.at(-1)[1]-segs.at(-1)[0]<2){segs.pop();segs.at(-1)[1]=n;}
 const doors=segs.map(([lo,hi])=>(a.from[1]+a.to[1])/2+(a.facing==='x+'?1:-1)*(-w/2+(Math.floor((lo+hi-1)/2)+.5)*w/n));
 const doorZ=doors.sort((x,y)=>Math.abs(x-turnZ)-Math.abs(y-turnZ))[0];
 const r1={...rect(start[0]-h,start[1],start[0]+h,turnZ-dir*h,s.yLanding,'first-flight'),axis:'z',a0:start[1],a1:turnZ-dir*h,y1:middleY};
 const turn=rect(start[0]-h,turnZ-h,start[0]+h,turnZ+h,middleY,'upper-turn');
 const r2={...rect(start[0]+toward*h,turnZ-h,apronX-toward*h,turnZ+h,middleY,'cross-flight'),axis:'x',a0:start[0]+toward*h,a1:apronX-toward*h,y1:.45};
 const front=rect(apronX-h,Math.min(turnZ,doorZ)-h,apronX+h,Math.max(turnZ,doorZ)+h,.45,'front-apron');
 const entry=rect(apronX+toward*h,doorZ-h,a.from[0],doorZ+h,.45,'door-apron');
 const top=g.toWorld(s.xTop-s.sign*1.5,s.zCenter),landing=g.toWorld((s.xLanding+s.xOuter)/2,s.zCenter);
 return{id:`${g.profile}/${s.direction}`,direction:s.direction,profile:g.profile,halfWidth:h,toward,start,door:[a.from[0],doorZ],surfaces:[r1,turn,r2,front,entry],route:[[...top.slice(0,1),s.yTop,top[1]],[landing[0],s.yLanding,landing[1]],[start[0],s.yLanding,start[1]],[start[0],middleY,turnZ],[apronX,.45,turnZ],[apronX,.45,doorZ],[a.from[0],.45,doorZ]]};
}
function stone(kit,f,r,id){
 const x0=r.minX,x1=r.maxX,z0=r.minZ,z1=r.maxZ;
 const vertices=[[x0,0,z0],[x1,0,z0],[x1,0,z1],[x0,0,z1],[x0,height(r,x0,z0),z0],[x1,height(r,x1,z0),z0],[x1,height(r,x1,z1),z1],[x0,height(r,x0,z1),z1]];
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices.flat(),3));geo.setIndex([4,7,5,5,7,6,0,1,3,1,2,3,0,4,1,1,4,5,1,5,2,2,5,6,2,6,3,3,6,7,3,7,0,0,7,4]);geo.computeVertexNormals();geo.setAttribute('uv',new THREE.Float32BufferAttribute(vertices.flatMap(([x,y,z])=>[x/2,z/2]),2));
 const m=kit.mesh(f,geo,kit.lib.material('stone_slab'),0,0,0);m.userData={role:'connection-stone-surface',surface:{...r},connectionId:id};
 const slices=r.y0===r.y1?1:Math.ceil(Math.abs(r.a1-r.a0)/.2);
 for(let i=0;i<slices;i++){const lo=r.a0+(r.a1-r.a0)*i/slices,hi=r.a0+(r.a1-r.a0)*(i+1)/slices,top=Math.min(r.y0+(r.y1-r.y0)*i/slices,r.y0+(r.y1-r.y0)*(i+1)/slices)-.03;kit.col(f,r.axis==='x'?Math.min(lo,hi):x0,0,r.axis==='z'?Math.min(lo,hi):z0,r.axis==='x'?Math.max(lo,hi):x1,top,r.axis==='z'?Math.max(lo,hi):z1);}
 if(r.y0===r.y1)kit.walkBox(f,x0,z0,x1,z1,r.y0);else kit.walkables.push({type:'ramp',...r,rescue:false});kit.walkables.at(-1).rescue=false;
}
function guard(kit,f,a,b){
 const len=Math.hypot(b[0]-a[0],b[2]-a[2]),n=Math.max(1,Math.ceil(len/2));
 for(let i=0;i<=n;i++){const t=i/n,p=a.map((v,j)=>v+(b[j]-v)*t),m=kit.box(f,'marble',.16,.9,.16,p[0],p[1]+.45,p[2]);m.userData.role='connection-guard';}
 for(const y of[.25,.7]){const v=new THREE.Vector3(...a),d=new THREE.Vector3(...b).sub(v),mid=v.addScaledVector(d,.5);const m=kit.box(f,'marble',.12,.12,d.length(),mid.x,mid.y+y,mid.z);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),d.normalize());m.userData.role='connection-guard';}
 const pieces=Math.ceil(len/.3);for(let i=0;i<pieces;i++){const p=a.map((v,j)=>v+(b[j]-v)*i/pieces),q=a.map((v,j)=>v+(b[j]-v)*(i+1)/pieces);kit.col(f,Math.min(p[0],q[0])-.08,Math.min(p[1],q[1]),Math.min(p[2],q[2])-.08,Math.max(p[0],q[0])+.08,Math.max(p[1],q[1])+.95,Math.max(p[2],q[2])+.08);}
}
export function buildSideConnection(kit,plan){
 const f=kit.frame(0,0,0);f.name='pavilion-gallery-connection';f.userData={role:f.name,connectionId:plan.id,route:plan.route,historicalReconstruction:false,engineeringFit:true};
 for(const r of plan.surfaces)stone(kit,f,r,plan.id);
 // Only the exposed union perimeter gets guards; interior corners never get
 // overlapping rail bars. Split by every rectangle edge before classification.
 for(const r of plan.surfaces)for(const axis of['x','z'])for(const sign of[-1,1]){
  const fixed=axis==='x'?(sign<0?r.minX:r.maxX):(sign<0?r.minZ:r.maxZ),lo=axis==='x'?r.minZ:r.minX,hi=axis==='x'?r.maxZ:r.maxX;
  const cuts=[...new Set([lo,hi,...plan.surfaces.flatMap(p=>axis==='x'?[p.minZ,p.maxZ]:[p.minX,p.maxX]).filter(v=>v>lo&&v<hi)])].sort((a,b)=>a-b);
  for(let i=1;i<cuts.length;i++){const l=cuts[i-1],u=cuts[i],mid=(l+u)/2,x=axis==='x'?fixed:mid,z=axis==='x'?mid:fixed,y=height(r,x,z);
   if(plan.surfaces.some(p=>p!==r&&inside(p,x+(axis==='x'?sign*1e-4:0),z+(axis==='z'?sign*1e-4:0))&&Math.abs(height(p,x,z)-y)<1e-6))continue;
   if(axis==='z'&&Math.abs(fixed-plan.start[1])<1e-7&&r.role==='first-flight')continue;
   if(axis==='x'&&Math.abs(fixed-plan.door[0])<1e-7&&r.role==='door-apron')continue;
   const a=axis==='x'?[fixed,height(r,fixed,l),l]:[l,height(r,l,fixed),fixed],b=axis==='x'?[fixed,height(r,fixed,u),u]:[u,height(r,u,fixed),fixed];guard(kit,f,a,b);
  }
 }
 return f;
}
