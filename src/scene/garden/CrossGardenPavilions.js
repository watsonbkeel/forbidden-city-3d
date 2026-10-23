import * as THREE from 'three';
import { applyBoxUV, scaleCylinderUV } from '../../utils/GeometryUV.js';
import {addQianqiuFinial} from './GardenSilhouetteDetails.js';

const SOURCE='https://www.dpm.org.cn/explore/building/236521.html';
const PLAN='https://www.dpm.org.cn/Uploads/File/2020/04/08/u5e8d77d699010.pdf';
const SPECS={ '万春亭':[-52.5,472.1], '千秋亭':[54.6,471.4] };
const PH=.75, CORE=2.4, ARM=1.4, END=3.5, POST_TOP=4.2;
export const crossPavilionProfile=name=>{
  if(!SPECS[name])throw new Error('Cross pavilion: unknown identity');
  return {id:`garden-procedural-${name}`,name,sources:[SOURCE,PLAN],planPage:189,
    sourceScope:name==='万春亭'?'INDIVIDUAL_PLAN_AND_PAIRED_DESCRIPTION':'PAIRED_DESCRIPTION_WITH_WANCHUN_PLAN_TOPOLOGY',
    enclosureCorners:20,columns:12,doorStagesPerArm:2,accessibleStoreys:1,
    coreWidth:4.8,armWidth:2.8,armDepth:1.1,clearDoorWidth:1.8,
    dimensionStatus:'DIAGRAM_AND_PHOTO_INFORMED_MODEL_FIT_NOT_SURVEY',
    doorPose:'ALL_FOUR_ROUTES_OPEN_FOR_MODEL_TRAVERSAL_NOT_SITE_ACCESS_PERMISSION',
    upperStage:'CIRCULAR_ROOF_CLERESTORY_NOT_ACCESSIBLE_FLOOR',
    platformStatus:'RETAINED_SQUARE_APPROXIMATION_NOT_STEPPED_SURVEYED_TERRACE',
    northApproach:name==='千秋亭'?'FITTED_POSITIVE_X_WEST_STAIR_WING_RETAINS_TREE_AND_ORIGINAL_TREADS':'RETAINED_NORTH_STAIR',
    roofStatus:'FITTED_HIPPED_ANNEXES_AND_ROUND_UPPER_CANOPY_PLAIN_DETAILS',
    currentInventoryVerified:false,photographyDate:null,accepted:false};
};

function trianglesGeometry(tris){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(tris.flat(2),3));g.computeVertexNormals();const p=g.attributes.position,uv=[];for(let i=0;i<p.count;i++)uv.push(p.getX(i),p.getZ(i));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));return g;}
// Four hipped slopes with a short ridge on the longer axis; square core uses one apex.
function hip(cx,cz,hx,hz,base,top){
  const p=[[cx-hx,base,cz-hz],[cx+hx,base,cz-hz],[cx+hx,base,cz+hz],[cx-hx,base,cz+hz]];
  if(Math.abs(hx-hz)<1e-9){const a=[cx,top,cz];return p.map((v,i)=>[v,a,p[(i+1)%4]]);}
  if(hx>hz){const a=[cx-(hx-hz),top,cz],b=[cx+(hx-hz),top,cz];return[[p[0],a,p[1]],[p[1],a,b],[p[1],b,p[2]],[p[2],b,p[3]],[p[3],b,a],[p[3],a,p[0]]];}
  throw new Error('Cross pavilion hip requires transverse ridge');
}
function clip(poly,axis,value,keepGreater){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],ia=keepGreater?a[axis]>=value:a[axis]<=value,ib=keepGreater?b[axis]>=value:b[axis]<=value;if(ia)out.push(a);if(ia!==ib){const t=(value-a[axis])/(b[axis]-a[axis]);out.push(a.map((v,j)=>v+t*(b[j]-v)));}}return out;}
// Actual bearing top follows clipped roof planes, not a flat box extending into tiles.
function bearing(tris,x,z,r=.18){const top=[];for(const t of tris){let p=t.map(v=>[v[0],v[1]-.12,v[2]]);for(const[a,v,k]of[[0,x-r,true],[0,x+r,false],[2,z-r,true],[2,z+r,false]])p=clip(p,a,v,k);for(let i=1;i<p.length-1;i++)top.push([p[0],p[i],p[i+1]]);}
  const height=(xx,zz)=>{for(const t of tris){const[a,b,c]=t,den=(b[2]-c[2])*(a[0]-c[0])+(c[0]-b[0])*(a[2]-c[2]);const u=((b[2]-c[2])*(xx-c[0])+(c[0]-b[0])*(zz-c[2]))/den,v=((c[2]-a[2])*(xx-c[0])+(a[0]-c[0])*(zz-c[2]))/den;if(u>=-1e-8&&v>=-1e-8&&u+v<=1+1e-8)return u*a[1]+v*b[1]+(1-u-v)*c[1]-.12;}throw new Error('Cross pavilion bearing outside roof');};
  const corners=[[x-r,z-r],[x+r,z-r],[x+r,z+r],[x-r,z+r]],out=[...top];
  // Include every clipped top boundary knot so creases meet without a gap.
  for(let i=0;i<4;i++){const a=corners[i],b=corners[(i+1)%4],axis=a[0]===b[0]?2:0,fix=axis===2?0:2,fv=fix===0?a[0]:a[1];const knots=[a,b];for(const t of top)for(const p of t)if(Math.abs(p[fix]-fv)<1e-7)knots.push([p[0],p[2]]);const unique=[...new Map(knots.map(p=>[p.map(v=>v.toFixed(7)).join(','),p])).values()].sort((p,q)=>(p[axis===0?0:1]-q[axis===0?0:1])*Math.sign((axis===0?b[0]-a[0]:b[1]-a[1])));for(let j=0;j<unique.length-1;j++){const p=unique[j],q=unique[j+1],lo=[p[0],POST_TOP,p[1]],hi=[p[0],height(...p),p[1]],ql=[q[0],POST_TOP,q[1]],qh=[q[0],height(...q),q[1]];out.push([lo,hi,qh],[lo,qh,ql]);}}
  const b=corners.map(p=>[p[0],POST_TOP,p[1]]);out.push([b[0],b[1],b[2]],[b[0],b[2],b[3]]);return trianglesGeometry(out.filter(t=>new THREE.Vector3().subVectors(new THREE.Vector3(...t[1]),new THREE.Vector3(...t[0])).cross(new THREE.Vector3().subVectors(new THREE.Vector3(...t[2]),new THREE.Vector3(...t[0]))).lengthSq()>1e-16));
}

export function buildCrossGardenPavilion(builder,root,{name,x,z}){
  const expected=SPECS[name];if(!expected||x!==expected[0]||z!==expected[1])throw new Error('Cross pavilion: exact named anchor required');
  const lib=builder.library,c0=builder.colliders.length;
  const g=builder.makePavilion(root,{x,z,size:7,baseH:PH,colH:3.8,cols:'square8',sides:4,layers:2,steps:true});
  g.name=`cross_pavilion_${name}`;
  // Retain the exact old platform/cap and six N/S treads, plus their walk support/ramp records.
  const discard=g.children.slice(8),geos=new Set(),mats=new Set();for(const o of discard){o.traverse(n=>{if(n.geometry)geos.add(n.geometry);const own=n.userData?.ownedMaterials;if(own)for(const m of own instanceof Set?own:Array.isArray(own)?own:[own])mats.add(m);});g.remove(o);}geos.forEach(a=>a.dispose());mats.forEach(m=>{if(!lib.owns(m)&&!builder.ownedMaterials.has(m))m.dispose();});builder.colliders.splice(c0);
  const wood=lib.material('wood_column'),lattice=lib.material('lattice_doors'),marble=lib.material('marble',{roughness:.7});
  const green=builder.own(new THREE.MeshStandardMaterial({name:'cross_pavilion_green_sill',color:0x356547,roughness:.68}));
  const tiles=lib.material('roof_tile'),under=lib.material('caihua_beam');
  function mesh(role,geo,mat,px=0,py=0,pz=0){const m=new THREE.Mesh(geo,mat);m.name=role;m.userData.role=role;m.position.set(px,py,pz);m.castShadow=m.receiveShadow=true;g.add(m);return m;}
  function box(role,w,h,d,px,py,pz,mat=wood,solid=true){const m=mesh(role,applyBoxUV(new THREE.BoxGeometry(w,h,d),1),mat,px,py,pz);if(solid)builder.addCollider(new THREE.Box3(new THREE.Vector3(x+px-w/2,py-h/2,z+pz-d/2),new THREE.Vector3(x+px+w/2,py+h/2,z+pz+d/2)));return m;}
  // Platform edge gaps now align with four source-supported stair directions.
  const edge=(w,d,px,pz)=>builder.addCollider(new THREE.Box3(new THREE.Vector3(x+px-w/2,0,z+pz-d/2),new THREE.Vector3(x+px+w/2,PH,z+pz+d/2)));
  // These boundary colliders describe the retained visible platform, not duplicate coplanar slabs.
  for(const s of[-1,1])for(const t of[-1,1]){const wing=name==='千秋亭'&&s===1&&t===1;edge(wing?2.3:3.1,.3,wing?3.15:t*2.75,s*4.3);edge(.3,3.1,s*4.3,t*2.75);}
  if(name==='千秋亭'){
    for(let k=0;k<3;k++){const h=PH*(k+1)/3;mesh('north-west-access-stair-wing',applyBoxUV(new THREE.BoxGeometry(.8,h,.4),lib.tileSize('marble')),marble,1.6,h/2,4.5+(2-k)*.4);}
    builder.walkRampZ(x+1.2,x+2,z+5.5,z+4.3,0,PH);
  }
  for(const s of[-1,1]){for(let k=0;k<3;k++){const h=PH*(k+1)/3;mesh('east-west-fitted-stair',applyBoxUV(new THREE.BoxGeometry(.4,h,2.4),lib.tileSize('marble')),marble,s*(4.5+(2-k)*.4),h/2,0);}builder.walkables.push({type:'ramp',axis:'x',minX:x+Math.min(s*5.5,s*4.3),maxX:x+Math.max(s*5.5,s*4.3),minZ:z-1.2,maxZ:z+1.2,a0:x+s*5.5,a1:x+s*4.3,y0:0,y1:PH});}
  const roofs=[hip(0,0,2.65,2.65,4.45,5.9)];
  const rotate=(u,v,k)=>{for(let i=0;i<k;i++)[u,v]=[-v,u];return[u,v];};
  for(let k=0;k<4;k++)roofs.push(hip(0,2.55,1.65,1.3,4.45,5.5).map(t=>t.map(([u,y,v])=>{const[a,b]=rotate(u,v,k);return[a,y,b];})));
  const posts=[[-CORE,-CORE,0],[CORE,-CORE,0],[CORE,CORE,0],[-CORE,CORE,0]];for(let k=0;k<4;k++)for(const s of[-1,1]){const[a,b]=rotate(s*ARM,END,k);posts.push([a,b,k+1]);}
  for(const[px,pz,ri]of posts){const h=POST_TOP-PH;mesh('cross-column',scaleCylinderUV(new THREE.CylinderGeometry(.15,.17,h,12),.17,h,lib.tileSize('wood_column')),wood,px,PH+h/2,pz);builder.addCollider(new THREE.Box3(new THREE.Vector3(x+px-.17,PH,z+pz-.17),new THREE.Vector3(x+px+.17,POST_TOP,z+pz+.17)));mesh('plain-fitted-bearing',bearing(roofs[ri],px,pz),wood);}
  // Twenty-corner enclosure: closed shoulder and arm side panels, two genuinely separate door stages.
  function wall(w,px,pz,k){const[a,b]=rotate(px,pz,k),horizontal=k%2===0;box('glazed-sill',horizontal?w:.14,.8,horizontal?.14:w,a,PH+.4,b,green);box('closed-lattice-panel',horizontal?w:.12,2.1,horizontal?.12:w,a,PH+1.85,b,lattice);box('wall-head',horizontal?w:.18,.45,horizontal?.18:w,a,3.925,b,wood);}
  for(let k=0;k<4;k++){
    for(const s of[-1,1]){wall(1,s*1.9,CORE,k);wall(1.1,2.95,s*ARM,(k+1)%4);}
    for(const depth of[CORE,END]){
      for(const s of[-1,1])wall(.5,s*1.15,depth,k);
      const[a,b]=rotate(0,depth,k);box('door-header',k%2===0?1.8:.2,.5,k%2===0?.2:1.8,a,3.9,b,wood);
      // Folded leaf fits to side of the 1.8m path; depth positions are game-access fitting.
      for(const s of[-1,1]){const[u,v]=rotate(s*.96,depth-.45,k);box(depth===CORE?'inner-open-door-leaf':'outer-open-door-leaf',k%2===0?.12:.9,2.9,k%2===0?.9:.12,u,PH+1.45,v,lattice);}
    }
  }
  // Plain continuous ceiling below all fitted roofs. No invented painted artwork or upper floor.
  box('core-ceiling',4.8,.10,4.8,0,4.1,0,under,false);for(let k=0;k<4;k++){const[a,b]=rotate(0,2.95,k);box('annex-ceiling',k%2===0?2.8:1.1,.10,k%2===0?1.1:2.8,a,4.1,b,under,false);}
  roofs.forEach((ts,i)=>{mesh(i?'hipped-annex-tiles':'central-lower-tiles',trianglesGeometry(ts),tiles);mesh(i?'hipped-annex-underside':'central-lower-underside',trianglesGeometry(ts.map(t=>t.map(p=>[p[0],p[1]-.12,p[2]]).reverse())),under);});
  // Solid clerestory drum has small non-traversable lattice panels; this is a roof zone, not a storey.
  const drum=mesh('upper-clerestory-drum',new THREE.CylinderGeometry(2.05,2.05,1.783076923076923,64,1,true),wood,0,5.491538461538462,0);
  for(let i=0;i<16;i++){const a=i*Math.PI/8,m=mesh('clerestory-lattice',new THREE.BoxGeometry(.35,.4,.045),lattice,Math.sin(a)*2.065,5.82,Math.cos(a)*2.065);m.rotation.y=a;}
  const rings=[[2.8,6.15],[2.5,6.22],[1.85,6.6],[1.1,7.16],[.42,7.8],[0,8.08]],ts=[];for(let j=0;j<rings.length-1;j++)for(let i=0;i<64;i++){const a=i*Math.PI/32,b=(i+1)*Math.PI/32,[r,y]=rings[j],[r2,y2]=rings[j+1],p=[r*Math.sin(a),y,r*Math.cos(a)],q=[r*Math.sin(b),y,r*Math.cos(b)],u=[r2*Math.sin(a),y2,r2*Math.cos(a)],v=[r2*Math.sin(b),y2,r2*Math.cos(b)];ts.push([p,q,u]);if(r2)ts.push([q,v,u]);}
  mesh('round-upper-canopy-tiles',trianglesGeometry(ts),tiles);mesh('round-upper-canopy-underside',trianglesGeometry(ts.map(t=>t.map(p=>[p[0],p[1]-.10,p[2]]).reverse())),under);
  if(name==='千秋亭')addQianqiuFinial(builder,g);
  else mesh('round-upper-finial',new THREE.SphereGeometry(.23,12,8),builder.goldMat,0,8.25,0);
  g.userData.crossPavilion=crossPavilionProfile(name);builder.group.userData.crossPavilions??=[];builder.group.userData.crossPavilions.push(g.userData.crossPavilion);
  return g;
}
