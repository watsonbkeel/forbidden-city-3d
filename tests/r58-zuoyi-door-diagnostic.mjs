import {writeFileSync,mkdirSync,readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {library,gate,goldRuns,triangles,textureHash,hash,binding} from './lib/r58-zuoyi-door-fixture.mjs';
import {applyZuoyiDoorFront} from '../src/scene/palace/special/ZuoyiDoorFront.js';
const {createCanvas}=createRequire(import.meta.url)('@napi-rs/canvas');
const out='reports/r58-zuoyi-door';mkdirSync(out,{recursive:true});
const lib=await library(),records=[];
for(const stage of ['before','after']){
 const {kit,frame,leaves}=gate(lib),geometryBefore=hash(triangles(frame,{material:false}));
 if(stage==='after'&&!applyZuoyiDoorFront(kit,frame,binding))throw Error('Target guard rejected');
 const frontLocal=leaves.map(leaf=>triangles(stage==='after'?leaf.children[0]:leaf,{world:false}).filter(t=>t.n.every(n=>n[2]===-1)));
 const root=kit.finish(),all=triangles(root),material=stage==='after'?lib.materials.get('zuoyi_nine_row_front'):lib.material('door_studded');
 // Both leaves face world +Z at the unchanged total Y rotation of pi.
 const front=all.filter(t=>t.material===material.name&&t.n.every(n=>n[2]>.999999));
 if(front.length!==4)throw Error(`Expected four final front triangles; got ${front.length}`);
 const planeZ=Math.max(...front.flatMap(t=>t.p.map(v=>v[2]))),selected=front.filter(t=>t.p.every(v=>Math.abs(v[2]-planeZ)<1e-5));
 const w=368,h=720,canvas=createCanvas(w,h),ctx=canvas.getContext('2d'),pixels=ctx.createImageData(w,h),image=material.map.image,tex=image.getContext('2d').getImageData(0,0,image.width,image.height).data;
 const vertices=selected.flatMap(t=>t.p),xs=vertices.map(v=>v[0]),ys=vertices.map(v=>v[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
 for(let py=0;py<h;py++)for(let px=0;px<w;px++){
  const x=minX+(px+.5)/w*(maxX-minX),y=maxY-(py+.5)/h*(maxY-minY);
  for(const t of selected){const [a,b,c]=t.p,det=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);
   const s=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/det,q=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/det,r=1-s-q;
   if(Math.min(s,q,r)<-1e-8)continue;
   const u=s*t.uv[0][0]+q*t.uv[1][0]+r*t.uv[2][0],v=s*t.uv[0][1]+q*t.uv[1][1]+r*t.uv[2][1];
   const tx=Math.max(0,Math.min(image.width-1,Math.floor(u*image.width))),ty=Math.max(0,Math.min(image.height-1,Math.floor((material.map.flipY?1-v:v)*image.height)));
   pixels.data.set(tex.subarray((ty*image.width+tx)*4,(ty*image.width+tx)*4+4),(py*w+px)*4);break;
  }
 }
 ctx.putImageData(pixels,0,0);writeFileSync(`${out}/${stage}-actual-merged-front.png`,canvas.toBuffer('image/png'));
 writeFileSync(`${out}/${stage}-runtime-albedo.png`,image.toBuffer('image/png'));
 if(stage==='after')writeFileSync(`${out}/${stage}-runtime-normal.png`,material.normalMap.image.toBuffer('image/png'));
 records.push({stage,geometryBefore,geometryAfterBeforeMerge:hash(triangles(frame,{material:false})),material:material.name,rows:goldRuns(image),rowCount:goldRuns(image).length,albedoSHA256:textureHash(material.map),normalSHA256:textureHash(material.normalMap),frontLocal,finalFrontTriangles:front,finalGeometrySHA256:hash(all.map(({material,...t})=>t).map(t=>JSON.stringify(t)).sort()),leafTransforms:leaves.map(m=>({position:m.position.toArray(),rotation:m.rotation.toArray()})),collidersSHA256:hash(kit.colliders),walkablesSHA256:hash(kit.walkables)});
 kit.dispose(root);
}
writeFileSync(`${out}/actual-mesh-uv-diagnostic.json`,JSON.stringify({boundary:'FINAL_PRODUCTION_MERGE_TRIANGLES_AND_RUNTIME_TEXTURE_CPU_UV_DIAGNOSTIC_ONLY_NOT_BROWSER_ACCEPTANCE',officialPhotographsIncluded:false,loadingBoundary:'REAL_TEXTURELIBRARY_LOAD_ALL_MANIFEST_FILES_LOCAL_TRANSPORT',loadedFromFile:[...lib.loadedFromFile].sort(),source:'Existing project door_studded color and normal maps only',verticalRemap:{removedSourceY:[136/1024,234/1024],scale:1024/926,hardware:'Complete source lion-ring and top/bottom bands retained, but y positions and vertical proportions changed. Not calibrated.'},helperSHA256:hash(readFileSync('src/scene/palace/special/ZuoyiDoorFront.js','utf8')),records},null,2)+'\n');
console.log(records.map(r=>({stage:r.stage,rows:r.rowCount,triangles:r.finalFrontTriangles.length,geometry:r.finalGeometrySHA256})));lib.dispose();
