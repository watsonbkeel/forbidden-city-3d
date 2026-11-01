import * as THREE from 'three';

const tag=(mesh,role,extra={})=>{mesh.name=role;Object.assign(mesh.userData,{role,...extra});return mesh;};
const cross=(a,b,c)=>new THREE.Vector3().subVectors(new THREE.Vector3(...b),new THREE.Vector3(...a)).cross(new THREE.Vector3().subVectors(new THREE.Vector3(...c),new THREE.Vector3(...a)));

/** Shared surfaces keep the annex interfaces identical, including curvature. */
export function qinanRoofSurfaces(g){
 const a=g.roofSkinApproximation,n=g.southAnnex,s=n.skin;
 const front=n.frontZ-s.frontOverhang,rear=n.rearZ+s.rearJoinOverlap,half=n.width/2+s.sideOverhang,highHalf=n.width/2-s.rearRidgeInset,lowY=n.columnTopY+a.tileThickness,highY=n.rearRoofY+a.tileThickness;
 const annexFront=(u,v)=>[(2*u-1)*(half+(highHalf-half)*v),lowY+(highY-lowY)*v-a.sag*Math.sin(v*Math.PI)+a.cornerLift*Math.pow(Math.abs(2*u-1),4)*(1-v),front+(rear-front)*v];
 const annexSide=(sign,u,v)=>{const inner=annexFront(sign===1?1:0,u),outer=[sign*half,lowY+a.cornerLift*(1-u),front+(rear-front)*u];return outer.map((p,i)=>p+(inner[i]-p)*v);};
 const flatCover=(u,v)=>[(u-.5)*g.roofBoard.width,g.roofBoard.topY+a.tileThickness+a.flatCoverCrown*Math.sin(u*Math.PI)*Math.sin(v*Math.PI),(v-.5)*g.roofBoard.depth];
 return {annexFront,annexSide,flatCover};
}

/** Dedicated low-detail luding skin. Structural guides are not tile dimensions. */
export function buildQinanRoof(kit,frame,g){
 const a=g.roofSkinApproximation,base=g.datum.columnBaseTopY,tile=kit.lib.material('roof_tile'),surfaces=qinanRoofSurfaces(g);
 const vertices=[],uv=[];
 const roofUV=p=>[p[0]/2,p[2]/2];
 const tri=(a,b,c,mapUV=roofUV)=>{if(cross(a,b,c).lengthSq()<1e-16)return;for(const p of [a,b,c]){vertices.push(...p);uv.push(...mapUV(p));}};
 const quad=(a,b,c,d,mapUV=roofUV)=>{tri(a,b,c,mapUV);tri(a,c,d,mapUV);};
 const geometry=()=>{const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices.splice(0),3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv.splice(0),2));geo.computeVertexNormals();return geo;};
 function patch(role,point,segments=a.edgeSubdivisions,rows=a.slopeSubdivisions,sealNorthEnd=false){
  const P=(u,v,under=false)=>{const p=point(u,v);if(under)p[1]-=a.tileThickness;return p;};
  function panel(p0,p1,p2,p3,up){const n=cross(p0,p1,p2);if((n.y>=0)!==up)quad(p0,p3,p2,p1);else quad(p0,p1,p2,p3);}
  for(let j=0;j<rows;j++)for(let i=0;i<segments;i++){const u=i/segments,v=j/rows,U=(i+1)/segments,V=(j+1)/rows;panel(P(u,v),P(U,v),P(U,V),P(u,V),true);panel(P(u,v,true),P(U,v,true),P(U,V,true),P(u,V,true),false);}
  // Mirrored hips reverse the parameterization orientation. Each cap must
  // face away from its own patch interior, not follow a fixed winding.
  function cap(p,q,r,s,inside){
   const dx=q[0]-p[0],dz=q[2]-p[2],length=Math.hypot(dx,dz);
   // A horizontal roof projection collapses every vertical thickness face.
   // Keep the same 2 m roof texture scale, measured along this cap and down it.
   if(length<1e-12)return;
   const capUV=v=>{const t=((v[0]-p[0])*dx+(v[2]-p[2])*dz)/(length*length);return [t*length/2,(p[1]+(q[1]-p[1])*t-v[1])/2];};
   const inward=new THREE.Vector3(...inside).sub(new THREE.Vector3(...p));if(cross(p,q,r).dot(inward)>0)quad(p,s,r,q,capUV);else quad(p,q,r,s,capUV);
  }
  for(let i=0;i<segments;i++){const u=i/segments,U=(i+1)/segments,inside=P((u+U)/2,.5);cap(P(u,0),P(U,0),P(U,0,true),P(u,0,true),inside);cap(P(U,1),P(u,1),P(u,1,true),P(U,1,true),inside);}
  if(sealNorthEnd)for(let j=0;j<rows;j++){const v=j/rows,V=(j+1)/rows;cap(P(1,v),P(1,V),P(1,V,true),P(1,v,true),P(.5,(v+V)/2));}
  return tag(kit.mesh(frame,geometry(),tile,0,0,0),role,{approximation:'PROVISIONAL_TILE_SKIN',walkable:false});
 }
 function ring(role,width,depth,y,innerWidth,innerDepth,innerY){
  const outer=[[-width/2,-depth/2],[width/2,-depth/2],[width/2,depth/2],[-width/2,depth/2]],inner=[[-innerWidth/2,-innerDepth/2],[innerWidth/2,-innerDepth/2],[innerWidth/2,innerDepth/2],[-innerWidth/2,innerDepth/2]];
  return outer.map((A,side)=>{const next=(side+1)%4,B=outer[next],C=inner[side],D=inner[next];return patch(role,(u,v)=>{const x0=A[0]+(B[0]-A[0])*u,z0=A[1]+(B[1]-A[1])*u,x1=C[0]+(D[0]-C[0])*u,z1=C[1]+(D[1]-C[1])*u;return [x0+(x1-x0)*v,y+(innerY-y)*v-a.sag*Math.sin(v*Math.PI)+a.cornerLift*Math.pow(Math.abs(2*u-1),4)*(1-v),z0+(z1-z0)*v];});});
 }
 // A strip follows intersections of the actual tessellated roof with its wall
 // plane. This avoids gaps from separately approximating the analytical curve.
 function closeToRoof(meshes,segments,bottomY,role){
  const tops=[];
  for(const mesh of meshes){const p=mesh.geometry.attributes.position;for(let i=0;i<p.count;i+=3){const v=[0,1,2].map(k=>[p.getX(i+k),p.getY(i+k),p.getZ(i+k)]);if(cross(...v).y>1e-9)tops.push(v);}}
  const roofY=(x,z)=>{let result=-Infinity;for(const [A,B,C] of tops){const den=(B[2]-C[2])*(A[0]-C[0])+(C[0]-B[0])*(A[2]-C[2]);if(Math.abs(den)<1e-10)continue;const u=((B[2]-C[2])*(x-C[0])+(C[0]-B[0])*(z-C[2]))/den,v=((C[2]-A[2])*(x-C[0])+(A[0]-C[0])*(z-C[2]))/den,w=1-u-v;if(Math.min(u,v,w)>=-1e-7)result=Math.max(result,u*A[1]+v*B[1]+w*C[1]-a.tileThickness);}if(!Number.isFinite(result))throw new Error('Qinan enclosure lies outside its roof');return result;};
  let perimeterDistance=0;
  for(const [A,B] of segments){const dx=B[0]-A[0],dz=B[1]-A[1],len2=dx*dx+dz*dz,length=Math.sqrt(len2),stations=[0,1];
   for(const t of tops)for(let i=0;i<3;i++){const P=t[i],Q=t[(i+1)%3],ex=Q[0]-P[0],ez=Q[2]-P[2],den=dx*ez-dz*ex;if(Math.abs(den)<1e-9)continue;const px=P[0]-A[0],pz=P[2]-A[1],u=(px*ez-pz*ex)/den,v=(px*dz-pz*dx)/den;if(u>1e-7&&u<1-1e-7&&v>=-1e-7&&v<=1+1e-7)stations.push(u);}
   const sorted=stations.sort((x,y)=>x-y).filter((x,i,all)=>!i||x-all[i-1]>1e-6);
   // Band textures clamp vertically: cover the entire actual strip height,
   // rather than sampling a single row with the roof's XZ projection.
   const bandUV=p=>[(perimeterDistance+((p[0]-A[0])*dx+(p[2]-A[1])*dz)/length)/kit.lib.tileSize('caihua_beam'),(p[1]-bottomY)/(roofY(p[0],p[2])-bottomY)];
   for(let i=0;i<sorted.length-1;i++){const t=sorted[i],T=sorted[i+1],x=A[0]+dx*t,z=A[1]+dz*t,X=A[0]+dx*T,Z=A[1]+dz*T;quad([x,bottomY,z],[x,roofY(x,z),z],[X,roofY(X,Z),Z],[X,bottomY,Z],bandUV);}
   tag(kit.mesh(frame,geometry(),kit.lib.material('caihua_beam'),0,0,0),role,{fidelity:'PROVISIONAL_CLOSED_SKIN_JOINED_TO_ACTUAL_ROOF',outward:[dz/Math.sqrt(len2),0,-dx/Math.sqrt(len2)]});
   perimeterDistance+=length;
  }
 }
 const rectangle=(w,d)=>{const c=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]];return c.map((p,i)=>[p,c[(i+1)%4]]);};
 const lower=g.cutRafterProfile.lower,upper=g.cutRafterProfile.upper;
 const lowerMeshes=ring('qinan-lower-roof-tile',lower.width+2*a.dripExtension,lower.depth+2*a.dripExtension,base+lower.edgeRelativeY+a.tileThickness,g.upperColumnHeadGrid.width,g.upperColumnHeadGrid.depth,base+lower.innerRelativeY+a.tileThickness);
 const upperMeshes=ring('qinan-upper-roof-tile',upper.width+2*a.dripExtension,upper.depth+2*a.dripExtension,base+upper.edgeRelativeY+a.tileThickness,g.roofBoard.width,g.roofBoard.depth,g.roofBoard.topY+a.tileThickness);
 closeToRoof(lowerMeshes,rectangle(g.mainBody.columnFootGrid.width,g.mainBody.columnFootGrid.depth),g.levels.eaveColumnTop,'qinan-bracket-apron');
 closeToRoof(upperMeshes,rectangle(g.upperColumnHeadGrid.width,g.upperColumnHeadGrid.depth),g.levels.upperEavePurlinBottom,'qinan-bracket-apron');
 tag(kit.mesh(frame,new THREE.BoxGeometry(g.roofBoard.width,g.roofBoard.topY-g.roofBoard.bottomY,g.roofBoard.depth),kit.lib.material('wood_column'),0,(g.roofBoard.topY+g.roofBoard.bottomY)/2,0),'qinan-wood-roof-board',{horizontalStatus:'SOURCE_DERIVED',verticalStatus:'DIRECT_MEASURED'});
 patch('qinan-flat-roof-cover',surfaces.flatCover,a.edgeSubdivisions,a.flatCoverSubdivisions);
 const ridgeY=g.roofBoard.topY+a.tileThickness+a.ridgeHeight/2;
 for(const sign of [-1,1]){
  tag(kit.mesh(frame,new THREE.BoxGeometry(g.roofBoard.width,a.ridgeHeight,a.ridgeWidth),kit.ridge,0,ridgeY,sign*g.roofBoard.depth/2),'qinan-perimeter-ridge');
  tag(kit.mesh(frame,new THREE.BoxGeometry(a.ridgeWidth,a.ridgeHeight,g.roofBoard.depth-a.ridgeWidth),kit.ridge,sign*g.roofBoard.width/2,ridgeY,0),'qinan-perimeter-ridge');
 }
 const h=a.finialHeight,r=a.finialRadius,points=a.finialProfileRatios.map(([x,y])=>new THREE.Vector2(x*r,y*h));
 const finial=new THREE.LatheGeometry(points,a.finialSegments),pos=finial.attributes.position,indices=[];
 for(let i=0;i<finial.index.count;i+=3){const ids=[0,1,2].map(k=>finial.index.getX(i+k)),v=ids.map(k=>[pos.getX(k),pos.getY(k),pos.getZ(k)]);if(cross(...v).lengthSq()>1e-16)indices.push(...ids);}finial.setIndex(indices);
 tag(kit.mesh(frame,finial,kit.gold,0,g.roofBoard.topY+a.tileThickness+a.flatCoverCrown,0),'qinan-finial',{fidelity:'PROVISIONAL_SCHEMATIC'});
 // Shared annex boundary uses identical sample stations on both adjacent skins.
 const annexMeshes=[patch('qinan-annex-roof-tile',surfaces.annexFront)];
 for(const sign of [-1,1])annexMeshes.push(patch('qinan-annex-roof-tile',(u,v)=>surfaces.annexSide(sign,u,v),a.slopeSubdivisions,a.slopeSubdivisions,true));
 const n=g.southAnnex,w=n.width/2;
 closeToRoof(annexMeshes,[[[-w,n.frontZ],[w,n.frontZ]],[[w,n.frontZ],[w,n.rearZ]],[[-w,n.rearZ],[-w,n.frontZ]]],n.columnTopY,'qinan-annex-enclosure-apron');
 return {tileMaterial:tile,shape:'double-eave-luding-with-low-south-annex'};
}
