import * as T from 'three';

// Original painted-art research relief, not an authenticated photograph or a 360° sculpture.
// This explicit smooth depth profile is manually fitted, never recovered from painted light.
export function reliefDepth(u,v){
 const g=(cx,cy,sx,sy)=>Math.exp(-.5*(((u-cx)/sx)**2+((v-cy)/sy)**2));
 return .075+.145*g(.5,.135,.14,.115)+.09*g(.5,.335,.255,.15)
   +.075*g(.29,.505,.17,.095)+.075*g(.71,.505,.17,.095)
   +.14*g(.5,.775,.34,.17);
}

export function createOriginalRelief(input,options={}){
 const {columns,rows,alpha,imageWidth,imageHeight}=input??{};
 const height=options.height??2.25,threshold=options.alphaThreshold??128;
 if(!Number.isInteger(columns)||!Number.isInteger(rows)||columns<2||rows<2||columns>257||rows>257
   ||!(alpha instanceof Uint8Array)||alpha.length!==columns*rows
   ||!Number.isFinite(imageWidth)||!Number.isFinite(imageHeight)||imageWidth<=0||imageHeight<=0
   ||!Number.isFinite(height)||height<=0||height>10||!Number.isInteger(threshold)||threshold<1||threshold>255)
   throw new Error('Invalid bounded original-art relief input');
 const front=[],used=new Set(),edgeMap=new Map();
 const emit=(a,b,c)=>{front.push(a,b,c);used.add(a);used.add(b);used.add(c);};
 for(let y=0;y<rows-1;y++)for(let x=0;x<columns-1;x++){
  const a=y*columns+x,b=a+columns,c=a+1,d=b+1;
  if(alpha[a]>=threshold&&alpha[b]>=threshold&&alpha[c]>=threshold&&alpha[d]>=threshold){emit(a,b,c);emit(c,b,d);}
 }
 if(!front.length)throw new Error('Original-art alpha mask has no surface');
 // Close the textured front toward the actual silhouette instead of exposing
 // a thick untextured extruded wall at oblique angles. Preserve the painted front
 // exactly; round only the fitted back toward it. Fixed geometry only.
 const sourceEdges=new Map();
 for(let i=0;i<front.length;i+=3)for(const [a,b]of[[front[i],front[i+1]],[front[i+1],front[i+2]],[front[i+2],front[i]]]){
  const key=a<b?`${a}:${b}`:`${b}:${a}`,e=sourceEdges.get(key);if(e)e.count++;else sourceEdges.set(key,{a,b,count:1});
 }
 const boundary=[...new Set([...sourceEdges.values()].filter(e=>e.count===1).flatMap(e=>[e.a,e.b]))];
 const remap=new Map(),points=[],uv=[],backs=[];const width=height*imageWidth/imageHeight;
 const boundaryXY=boundary.map(i=>[(i%columns)/(columns-1)*width,Math.floor(i/columns)/(rows-1)*height]);
 const bevel=.12*height/2.25,back=-.13*height/2.25,minThickness=.02*height/2.25;

 for(const old of used){const x=old%columns,y=Math.floor(old/columns),u=x/(columns-1),v=y/(rows-1);
  let distance2=Infinity;for(const [bx,by]of boundaryXY)distance2=Math.min(distance2,(u*width-bx)**2+(v*height-by)**2);
  const t=Math.min(1,Math.sqrt(distance2)/bevel),blend=t*t*(3-2*t);
  const z=reliefDepth(u,v)*height/2.25;
  backs.push((z-minThickness)*(1-blend)+back*blend);
  remap.set(old,remap.size);points.push((u-.5)*width,(1-v)*height,z);uv.push(u,1-v);
 }
 const count=used.size,positions=[...points],uvs=[...uv];
 for(let i=0;i<count;i++){positions.push(points[i*3],points[i*3+1],backs[i]);uvs.push(uv[i*2],uv[i*2+1]);}
 const fi=front.map(i=>remap.get(i));
 for(let i=0;i<fi.length;i+=3)for(const [a,b]of[[fi[i],fi[i+1]],[fi[i+1],fi[i+2]],[fi[i+2],fi[i]]]){
  const k=a<b?`${a}:${b}`:`${b}:${a}`,e=edgeMap.get(k);if(e)e.count++;else edgeMap.set(k,{a,b,count:1});
 }
 if([...edgeMap.values()].some(e=>e.count>2))throw new Error('Non-manifold source grid edge');
 const indices=[...fi];
 for(let i=0;i<fi.length;i+=3)indices.push(fi[i+2]+count,fi[i+1]+count,fi[i]+count);
 const sideStart=indices.length;
 for(const {a,b,count:n}of edgeMap.values())if(n===1)indices.push(b,a,a+count,b,a+count,b+count);
 // The factory owns completed geometry/material allocations until it returns.
 // The caller still owns the texture if construction fails.
 let geometry;const materials=[];
 try{
 geometry=new T.BufferGeometry();
 geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
 geometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);
 geometry.addGroup(0,fi.length,0);geometry.addGroup(fi.length,fi.length,1);geometry.addGroup(sideStart,indices.length-sideStart,2);
 geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();
 materials.push(new T.MeshStandardMaterial({map:options.texture??null,color:0xffffff,roughness:.72,metalness:.12,alphaTest:threshold/255,transparent:false}));
 materials.push(new T.MeshStandardMaterial({color:0x9d7139,roughness:.8,metalness:.12}));
 materials.push(new T.MeshStandardMaterial({color:0xb78944,roughness:.72,metalness:.12}));
 const mesh=new T.Mesh(geometry,materials);mesh.name='original-central-buddha-shallow-relief-research';mesh.castShadow=true;mesh.receiveShadow=false;
 const meta={assetClass:'ORIGINAL_GENERATED_ART_MODEL_FIT',historicalPhoto:false,method:'MANUAL_CONTINUOUS_DEPTH_ALPHA_SILHOUETTE',
  cameraFacing:false,depthRecoveredFromLight:false,sideAndBack:'ENGINEERING_FIT_NOT_SOURCE_VERIFIED',edgeTreatment:'ORIGINAL_FRONT_PRESERVED_ROUNDED_BACK_THIN_CLOSURE',
  lotusEightTiers:'NOT_VERIFIED',pedestalProportion:'HIGH_V1_RETAINED_FOR_REVIEW',defaultProductReplacement:false,
  vertices:count*2,triangles:indices.length/3,frontTriangles:fi.length/3,sourceGrid:[columns,rows],alphaThreshold:threshold};
 mesh.userData.originalArtResearch=meta;
 // Independent conservative box, intentionally inactive until actual product integration.
 // It does not reuse render triangles, and scales with both aspect ratio and height.
 const scale=height/2.25;
 const collisionProxy={type:'bounded-research-proxy-only',boxes:[{center:[0,height/2,.065*scale],size:[width,height,.5*scale]}],activeInProduct:false};
 let disposed=false;
 return {mesh,meta,collisionProxy,dispose(){if(disposed)return;disposed=true;geometry.dispose();for(const m of materials)m.dispose();if(options.ownsTexture===true)options.texture?.dispose();}};
 }catch(error){
  // Keep releasing other owned resources even if a dispose listener throws.
  try{geometry?.dispose();}catch{}
  for(const material of materials){try{material.dispose();}catch{}}
  throw error;
 }
}
