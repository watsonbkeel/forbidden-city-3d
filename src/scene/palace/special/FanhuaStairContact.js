import * as T from 'three';
const identity=o=>o?.matrixAutoUpdate===true&&o.matrixWorldAutoUpdate===true&&o.quaternion.equals(new T.Quaternion())&&o.scale.equals(new T.Vector3(1,1,1));
const indexed=Array.from({length:6},(_,i)=>[0,2,1,2,3,1].map(n=>n+4*i)).flat();
function positions(w,h,d){const out=[];for(const[u,v,k,du,dv,pw,ph,pd]of[['z','y','x',-1,-1,d,h,w],['z','y','x',1,-1,d,h,-w],['x','z','y',1,1,w,d,h],['x','z','y',1,-1,w,d,-h],['x','y','z',1,-1,w,h,d],['x','y','z',-1,-1,w,h,-d]])for(let iy=0;iy<2;iy++)for(let ix=0;ix<2;ix++){const q={x:0,y:0,z:0};q[u]=(ix*pw-pw/2)*du;q[v]=(iy*ph-ph/2)*dv;q[k]=pd/2;out.push(q.x,q.y,q.z)}return new Float32Array(out)}
function profile(p){if(!p||Object.entries({key:'fanhua',id:'place-ningshou-d40cef5893',x:-340,z:511.05,localW:25.8,localD:8.6,ph:.5,rot:0}).some(([k,v])=>p[k]!==v))throw Error('Exact retained Fanhua stair profile required');}
export function fitFanhuaStairApproach(p){
 if(p.key!=='fanhua')return;profile(p);const q=p.portals.find(q=>q.side==='front');
 if(!q||q.x!==0||q.z!==-3.1999999999999997||q.width!==2.8||q.approachPoints.length!==5)throw Error('Fanhua retained front portal changed');
 // Ground points stay outside the existing tread/player footprint. No new
 // tread dimensions, passage or historical stair count is asserted here.
 q.approachPoints=q.approachPoints.map((v,i)=>i<2?{...v,localZ:i===0?-6.7:-6.35,z:p.z+(i===0?-6.7:-6.35)}:v);
}
/** Add contact only to five already-visible solid treads. The original ramp,
 * Jingfu stair ownership and every public motion/teleport guard are retained. */
export function addFanhuaStairContacts({kit,p,f}){
 profile(p);const root=kit?.root,cs=kit?.colliders;
 if(!identity(root)||root.parent||root.position.lengthSq()||!root.matrix.equals(new T.Matrix4())||f?.parent!==root||!identity(f)||f.position.x!==p.x||f.position.y!==0||f.position.z!==p.z||!Array.isArray(cs)||!Object.isExtensible(cs)||!Object.getOwnPropertyDescriptor(cs,'length')?.writable||cs.some(c=>c.fanhuaStairContact))throw Error('Exact mutable untransformed Fanhua host required, once only');
 const meshes=f.children.filter(m=>m.isMesh&&m.userData.identity===p.id&&m.userData.role==='fanhua-south-step');
 if(meshes.length!==5)throw Error('Five retained Fanhua stone treads required');
 const edge=-(p.localD/2+.5),run=.9,width=3.2,depth=run/5+.008,staged=[];
 for(let i=0;i<5;i++){
  const m=meshes[i],g=m.geometry,a=g?.attributes?.position,top=p.ph*(i+1)/5,z=edge-run+(i+.5)*run/5,expected=positions(width,top,depth);
  if(!identity(m)||m.position.x!==0||m.position.y!==top/2||m.position.z!==z||g.type!=='BoxGeometry'||a?.itemSize!==3||a.count!==24||a.array.some((v,j)=>!Object.is(v,expected[j]))||g.index?.count!==36||g.index.array.some((v,j)=>v!==indexed[j]))throw Error('Fanhua tread source payload changed');
  const b=new T.Box3(new T.Vector3(p.x-width/2,0,p.z+z-depth/2),new T.Vector3(p.x+width/2,top,p.z+z+depth/2));b.fanhuaStairContact=i+1;staged.push(b);
 }
 const ramp=kit.walkables.filter(w=>w.type==='ramp'&&w.axis==='z'&&w.minX===p.x-width/2&&w.maxX===p.x+width/2&&w.minZ===p.z+edge-run&&w.maxZ===p.z+edge&&w.y0===0&&w.y1===p.ph);
 if(ramp.length!==1)throw Error('Fanhua retained real ramp required');
 cs.push(...staged);return staged;
}
