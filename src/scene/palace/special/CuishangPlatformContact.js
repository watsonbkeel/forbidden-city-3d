import * as T from 'three';
const FIT=Object.freeze({edge:-5.95,halfWidth:2,end:-3,first:-7.15,second:-6.55,top:-5.3});
const identity=o=>o?.matrixAutoUpdate===true&&o.matrixWorldAutoUpdate===true&&o.quaternion.equals(new T.Quaternion())&&o.scale.equals(new T.Vector3(1,1,1));
function profile(p){if(!p||Object.entries({key:'cuishang',id:'place-ningshou-b6cde8615b',x:-260.7,z:456.3,localW:20.5,localD:10.9,ph:.5,rot:0}).some(([k,v])=>p[k]!==v))throw Error('Exact retained Cuishang platform profile required');}
export function fitCuishangPlatformApproach(p){
 if(p.key!=='cuishang')return;
 profile(p);const q=p.portals.find(q=>q.side==='front');
 if(!q||q.x!==0||q.z!==-4.2||q.width!==2.8)throw Error('Cuishang retained central entry changed');
 // Stay outside the player footprint, then approach the actual .5m platform.
 // These are current game support coordinates, not historical stair dimensions.
 q.approachPoints=[[0,FIT.first,0],[0,FIT.second,0],[0,FIT.top,p.ph],[0,q.z,p.ph],[0,q.z+.7,p.ph]].map(([localX,localZ,feetY])=>({localX,localZ,x:p.x+localX,z:p.z+localZ,feetY}));
}
function expectedPosition(){const out=[];for(const[u,v,w,du,dv,pw,ph,pd]of[['z','y','x',-1,-1,11.9,.5,21.5],['z','y','x',1,-1,11.9,.5,-21.5],['x','z','y',1,1,21.5,11.9,.5],['x','z','y',1,-1,21.5,11.9,-.5],['x','y','z',1,-1,21.5,.5,11.9],['x','y','z',-1,-1,21.5,.5,-11.9]])for(let iy=0;iy<2;iy++)for(let ix=0;ix<2;ix++){const q={x:0,y:0,z:0};q[u]=(ix*pw-pw/2)*du;q[v]=(iy*ph-ph/2)*dv;q[w]=pd/2;out.push(q.x,q.y,q.z)}return new Float32Array(out)}
const positions=expectedPosition(),indices=Array.from({length:6},(_,i)=>[0,2,1,2,3,1].map(n=>n+4*i)).flat();
/** Bind one ordinary solid to the retained visible platform. No new geometry,
 * walkable, region or shared-physics exemption is created. */
export function addCuishangPlatformContact({kit,p,f}){
 profile(p);const root=kit?.root,cs=kit?.colliders;
 if(!identity(root)||root.parent||root.position.lengthSq()||!root.matrix.equals(new T.Matrix4())||f?.parent!==root||!identity(f)||f.position.x!==p.x||f.position.y!==0||f.position.z!==p.z||!Array.isArray(cs)||!Object.isExtensible(cs)||!Object.getOwnPropertyDescriptor(cs,'length')?.writable||cs.some(c=>c.cuishangPlatformContact))throw Error('Exact mutable untransformed Cuishang host required, once only');
 const found=f.children.filter(m=>m.isMesh&&m.userData.identity===p.id&&m.userData.role==='platform-base'&&m.geometry.type==='BoxGeometry');
 if(found.length!==1)throw Error('Cuishang source solid platform required');const m=found[0],g=m.geometry,a=g.attributes.position;
 if(!identity(m)||m.position.x!==0||m.position.y!==.25||m.position.z!==0||a?.itemSize!==3||a.count!==24||a.array.some((v,i)=>!Object.is(v,positions[i]))||g.index?.count!==36||g.index.array.some((v,i)=>v!==indices[i]))throw Error('Cuishang platform source payload changed');
 if(kit.walkables.filter(w=>w.type==='box'&&w.rescue===false&&w.box.min.x===p.x-10.75&&w.box.max.x===p.x+10.75&&w.box.min.z===p.z-5.95&&w.box.max.z===p.z+5.95&&w.box.min.y===.5&&w.box.max.y===.5).length!==1)throw Error('Cuishang real retained platform support required');
 if(cs.filter(c=>c.furnitureMotionScope?.kind==='cuishang-south-rails'&&c.furnitureMotionScope.id==='cuishang-south-rails').length!==1)throw Error('Cuishang retained south rail scope required');
 const b=new T.Box3(new T.Vector3(p.x-FIT.halfWidth,0,p.z+FIT.edge),new T.Vector3(p.x+FIT.halfWidth,.5,p.z+FIT.end));b.cuishangPlatformContact=true;cs.push(b);return b;
}
