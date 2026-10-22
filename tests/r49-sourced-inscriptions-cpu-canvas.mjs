// Optional real CPU font-raster evidence. No browser / GPU and no project
// dependency changes. Point R49_CANVAS_MODULE at an installed @napi-rs/canvas.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);
const {createCanvas,GlobalFonts}=require(process.env.R49_CANVAS_MODULE??'@napi-rs/canvas');
// N-API Canvas does not implement browser CJK fallback for generic serif.
// Alias an installed CJK face only in this CPU adapter; never alter production fonts.
const cpuFont=process.env.R49_CPU_CJK_FONT??'/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc';
assert.ok(GlobalFonts.registerFromPath(cpuFont,'SimSun'));

globalThis.document={createElement:name=>{assert.equal(name,'canvas');return createCanvas(1,1);},createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
const {realTextureLibrary}=await import('./lib/r48-real-texture-library.mjs');
const {ZoneBase}=await import('../src/scene/zones/ZoneBase.js');
const {inscriptionRetention}=await import('./lib/r49-sourced-inscription-retention.mjs');
const out=process.env.R49_INSCRIPTION_REPORT_DIR??'reports/r49';mkdirSync(out,{recursive:true});
const report={cpuFontAdapter:{font:cpuFont,alias:'SimSun',limitation:'CPU_ADAPTER_FONT_SELECTION_NOT_BROWSER_FONT_VALIDATION'},boundary:'REAL_CPU_CANVAS_GLYPHS_AND_REAL_TEXTURE_LIBRARY_FINISH__NOT_GPU_VISUAL_ACCEPTANCE',rows:[]};
for(const [zone,name,role]of[['axis-courts','弘义阁','hongyi-lower-front-nameboard'],['outer-west','宝蕴楼','baoyun-sourced-stone-name-inscription']]){
 const data=JSON.parse(readFileSync(new URL(`../data/zones/${zone}.json`,import.meta.url))),lib=realTextureLibrary(),z=new ZoneBase(lib,data),b=z.buildHall(data.items.find(i=>i.name===name));
 let mesh;b.f.traverse(m=>{if(m.userData.role===role)mesh=m;});assert.ok(mesh);const retained=inscriptionRetention(z.kit),merged=z.kit.finish();
 const atlas=mesh.material.map.image,canvas=createCanvas(name==='弘义阁'?96:384,name==='弘义阁'?256:768),ctx=canvas.getContext('2d');ctx.drawImage(atlas,0,0,canvas.width,canvas.height,0,0,canvas.width,canvas.height);
 writeFileSync(`${out}/${name==='弘义阁'?'hongyi':'baoyun'}-inscription-real-cpu-canvas.png`,canvas.toBuffer('image/png'));
 const rows=[];for(let i=0;i<3;i++){
   const x0=name==='弘义阁'?24:64,x1=canvas.width-x0,top=name==='弘义阁'?22:32,span=(canvas.height-2*top)/3;
   const y0=Math.ceil(top+span*i),y1=Math.floor(top+span*(i+1)),pixels=ctx.getImageData(x0,y0,x1-x0,y1-y0).data,mask=[];
   for(let k=0;k<pixels.length;k+=4){const [r,g,b]=pixels.subarray(k,k+3);mask.push(name==='弘义阁'?(r>200&&g>170&&b<140?1:0):(r<190&&g<190&&b<190?1:0));}
   const ink=mask.reduce((a,b)=>a+b,0);assert.ok(ink>80,`${name} glyph ${i+1} has actual rasterized ink`);rows.push({index:i,inkPixels:ink,maskHash:createHash('sha256').update(Buffer.from(mask)).digest('hex')});
 }
 assert.equal(new Set(rows.map(r=>r.maskHash)).size,3,`${name}: three distinct glyph shapes, not repeated missing-glyph boxes`);
 let mergedFaces=0;merged.traverse(m=>{if(m.material===mesh.material)mergedFaces++;});assert.ok(mergedFaces>0);
 const path=`${out}/${name==='弘义阁'?'hongyi':'baoyun'}-inscription-real-cpu-canvas.png`;writeFileSync(path,canvas.toBuffer('image/png'));
 let textureDisposed=0;mesh.material.map.addEventListener('dispose',()=>textureDisposed++);z.kit.dispose(merged);lib.dispose();assert.equal(textureDisposed,1,`${name}: owned inscription texture released exactly once`);
 report.rows.push({name,text:mesh.userData.text,material:mesh.material.name,canvas:[canvas.width,canvas.height],glyphs:rows,mergedFaces,textureDisposed,retained,bitmap:path});
}
writeFileSync(`${out}/sourced-inscriptions-real-cpu-canvas.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
// Re-run the merged-material rays, four frame-face checks and exact retention
// assertions with this same real Canvas adapter rather than the DOM boundary.
await import('./r49-sourced-missing-inscriptions.test.mjs');
