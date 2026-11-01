import * as T from 'three';
// Houzuo own south / southeast / southwest official covers establish this silhouette.
// Rear approach is engineering-safe continuation, not photographed reconstruction.
// Dimensions below are engineering fits, never survey or historical attribution.
export function raiseRearLeftPlatform(kit,f,{item,colliderStart}){
 if(item.rearAxisGate!=='houzuo')return false;
 if(item.name!=='后左门'||item.x!==-76.4||item.z!==123||f.userData.structure?.objectId!=='FC-E3F4369B07')throw Error('Changed rear-left source');
 const ph=1.8,rise=1.8,run=12,half=4;
 for(const child of f.children)child.position.y+=rise;
 for(const b of kit.colliders.slice(colliderStart)){b.min.y+=rise;b.max.y+=rise;}
 kit.walkBox(f,-7.6,-3.2,7.6,3.2,ph);kit.walkables.at(-1).rescue=false;
 const tag=(o,role)=>{o.name=role;o.userData.role=role;return o;};
 const box=(role,mat,w,h,d,x,y,z)=>tag(kit.box(f,mat,w,h,d,x,y,z),role);
 const solid=(role,mat,w,h,d,x,y,z)=>{box(role,mat,w,h,d,x,y,z);kit.col(f,x-w/2,y-h/2,z-d/2,x+w/2,y+h/2,z+d/2);};
 // Fill under the raised original base; keep its top paving and every facade.
 solid('rear-left-raised-base','wall_brick',15.2,ph-.08,6.4,0,(ph-.08)/2,0);
 kit.col(f,-7.6,ph-.08,-3.2,7.6,ph,3.2);
 for(const s of[-1,1]){
  tag(kit.mesh(f,wedge(half,s*3.2,s*15.2,ph),kit.lib.material('stone_slab'),0,0,0),'rear-left-approach');kit.walkRamp(f,-half,half,s*3.2,s*15.2,ph,0);
  for(let i=0;i<60;i++){const y=ph*(1-(i+1)/60);if(y>0)kit.col(f,-half,0,s*(3.2+i*.2),half,y,s*(3.2+(i+1)*.2));}
  for(const x of[-4.1,4.1]){
   for(let i=0;i<=16;i++){const z=s*(3.2+i*.75),y=ph*(1-i/16);box('rear-left-rail-post','marble',.16,.72,.16,x,y+.36,z);const head=new T.LatheGeometry([[.07,0],[.10,.04],[.08,.11],[0,.18]].map(p=>new T.Vector2(...p)),12);tag(kit.mesh(f,head,kit.lib.material('marble'),x,y+.72,z),'rear-left-rail-head');kit.col(f,x-.1,y,z-.1,x+.1,y+.9,z+.1);}
   for(let i=0;i<16;i++){const z=s*(3.2+(i+.5)*.75),y=ph*(1-(i+.5)/16);const panel=box('rear-left-rail-panel','marble',.14,.48,Math.hypot(.59,.59*ph/run),x,y+.34,z);panel.rotation.x=s*Math.atan2(ph,run);}
   const rail=box('rear-left-rail','marble',.16,.16,Math.hypot(run,ph),x,ph/2+.72,s*9.2);rail.rotation.x=s*Math.atan2(ph,run);
   for(let i=0;i<48;i++)kit.col(f,x-.1,ph*(1-(i+1)/48),s*(3.2+i*.25),x+.1,ph*(1-i/48)+.9,s*(3.2+(i+1)*.25));
  }
  for(const x of[-5.85,5.85])solid('rear-left-platform-rail','marble',3.5,.8,.18,x,ph+.4,s*3.11);
 }
 for(const x of[-7.51,7.51])solid('rear-left-side-rail','marble',.18,.8,6.4,x,ph+.4,0);
 f.userData.rearLeftPlatform={profile:'own-high-platform-wide-approach',ph,run,width:8,rise,dimensionStatus:'ENGINEERING_PHOTO_FIT_NOT_SURVEY',wholeObjectAccepted:false};
 f.userData.structure.floorY=ph;f.userData.rearAxisGate.notReconstructed=f.userData.rearAxisGate.notReconstructed.filter(x=>x!=='long ramps and balustrades');f.userData.structure.notReconstructed=[...f.userData.rearAxisGate.notReconstructed];f.userData.rearAxisGate.approachStatus='ENGINEERING_PHOTO_FIT_NOT_SURVEY';f.updateMatrixWorld(true);return true;
}
function wedge(half,z0,z1,y){
 const v=[[-half,0,z0],[half,0,z0],[half,0,z1],[-half,0,z1],[-half,y,z0],[half,y,z0]],ids=[0,2,1,0,3,2,0,1,5,0,5,4,4,5,2,4,2,3,0,4,3,1,2,5];
 if(z1>z0)for(let i=0;i<ids.length;i+=3)[ids[i+1],ids[i+2]]=[ids[i+2],ids[i+1]];
 const a=ids.flatMap(i=>v[i]),uv=ids.flatMap(i=>[v[i][0]/3,v[i][2]/3]);
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(a,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;
}
