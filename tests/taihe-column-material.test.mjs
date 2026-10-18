import {restorePreColumnResponseSource} from './lib/taihe-column-response-retention.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {read} from './lib/taihe-column-fixture.mjs';
const path='../src/scene/palace/special/TaiheColumnSurface.js';
const load=()=>import(path);
test('column surface module supplies a bounded deterministic authored atlas',async()=>{
  const surface=await load(),a=surface.createTaiheColumnAtlas(),b=surface.createTaiheColumnAtlas();
  assert.equal(a.width,256);assert.equal(a.height,512);
  assert.deepEqual(a.color,b.color);assert.deepEqual(a.relief,b.relief);
  assert.ok(a.heightCoverage>.15&&a.heightCoverage<.8,'dense but separated authored ornament');
  assert.ok(a.gpuBytes<1400000,'two mip chains below 1.34 MiB');
  assert.ok(a.color.some((v,i)=>i%4!==3&&v<220));
});
test('every color/data mip retains exact neutral pixels and periodic shaft gutters',async()=>{
  const {createTaiheColumnAtlas,TAIHE_COLUMN_ATLAS:P}=await load(),a=createTaiheColumnAtlas();
  for(const [key,neutral] of [['color',[255,255,255,255]],['relief',[0,255,0,255]]])for(const mip of a[key+'Mips']){
    const {width:w,height:h,data}=mip,x=Math.floor(P.neutralUV[0]*w),y=Math.floor(P.neutralUV[1]*h);
    assert.deepEqual([...data.slice((y*w+x)*4,(y*w+x)*4+4)],neutral);
    if(w<32)assert.ok(data.every((v,i)=>v===neutral[i%4]),'coarse tail is fully neutral');
    if(w>=32){const lo=Math.round(P.u0*w-.5),hi=Math.round(P.u1*w-.5);for(let y=0;y<h;y++)assert.deepEqual([...data.slice((y*w+lo)*4,(y*w+lo)*4+4)],[...data.slice((y*w+hi)*4,(y*w+hi)*4+4)],'angular seam pixels match');}
  }
});
test('atlas source has no photo, fetch, browser or shader dependency',async()=>{
  await load(); const code=read('src/scene/palace/special/TaiheColumnSurface.js').toString();
  assert.doesNotMatch(code,/fetch\(|document\.|onBeforeCompile|normalMap\s*=/);
  assert.match(code,/NoColorSpace/);assert.match(code,/SRGBColorSpace/);
});

test('actual S and B gold triangles have only explicit neutral or matching cylindrical UVs without seam crossings',async()=>{
  const {candidate}=await import('./lib/taihe-column-fixture.mjs');
  const {captureTaiheControl}=await import('./lib/taihe-core-fixture.mjs');
  const {columnSurfaceUVs}=await load();
  const c=captureTaiheControl('太和殿');
  const meshes=c.group.children.filter(o=>o.userData.taiheCoreOwner&&o.material.name==='taihe_gold');
  assert.equal(meshes.length,1);
  const actualS=candidate.triangles.filter(t=>t.material==='taihe_gold');
  const geo=meshes[0].geometry,p=geo.attributes.position,uv=geo.attributes.uv;
  const actualB=[];for(let i=0;i<p.count;i+=3)actualB.push({vertices:[0,1,2].map(k=>({POSITION:[p.getX(i+k),p.getY(i+k),p.getZ(i+k)],TEXCOORD_0:[uv.getX(i+k),uv.getY(i+k)]}))});
  for(const [lod,triangles] of [['S',actualS],['B',actualB]]){
    let decorated=0,neutral=0;
    for(const t of triangles){const expected=columnSurfaceUVs(t.vertices.map(v=>v.POSITION));
      if(expected.every(v=>v[0]===0&&v[1]===0))neutral++;else decorated++;
      for(let i=0;i<3;i++){assert.ok(t.vertices[i].TEXCOORD_0,`${lod}: gold UV attribute present`);for(let k=0;k<2;k++)assert.ok(Math.abs(t.vertices[i].TEXCOORD_0[k]-expected[i][k])<3e-6,`${lod}: explicit cylindrical/neutral UV`);}
      if(expected[0][0])assert.ok(Math.max(...expected.map(v=>v[0]))-Math.min(...expected.map(v=>v[0]))<=(lod==='B'?7/8/8:7/8/32)+1e-6,'no wrapped interpolation');
    }
    assert.equal(decorated,lod==='B'?96:3192);assert.ok(neutral>100);
  }
  c.builder.dispose();
});

import {columnMaterialDelta,restorePreColumnMaterialSource} from './lib/taihe-column-material-retention.mjs';
for(const [path,record] of Object.entries(columnMaterialDelta.files)){
  test(`${path}: exact bounded material delta retains the old source`,()=>{
    const bytes=read(path),restored=restorePreColumnMaterialSource(path,bytes);
    assert.equal(createHash('sha256').update(restored).digest('hex'),record.baselineSHA256);
    assert.throws(()=>restorePreColumnMaterialSource(path,bytes+'\n'));
    const at665=restorePreColumnResponseSource(path,bytes).toString();
    for(const d of record.deltas){assert.ok(at665.includes(d.after));for(const replacement of ['',d.after+d.after,d.after+'\n'])assert.throws(()=>restorePreColumnMaterialSource(path,at665.replace(d.after,replacement)));}
  });
}

test('column atlas ownership is shared only by real runtime binding and disposed once by B',async()=>{
  const THREE=await import('three');
  const {attachTaiheColumnTextures,TAIHE_COLUMN_ATLAS:A}=await load();
  const {installTaiheColumnTextures,isTaiheSharedAtlas}=await import('../src/scene/interior/TaiheCoreContract.js');
  const gold=new THREE.MeshStandardMaterial({name:'taihe_gold',color:0xb79a51,roughness:.52,metalness:.55}),textures=attachTaiheColumnTextures(gold);
  let colorDisposals=0,reliefDisposals=0;textures.color.addEventListener('dispose',()=>colorDisposals++);textures.relief.addEventListener('dispose',()=>reliefDisposals++);
  const root=new THREE.Group(),s=new THREE.MeshStandardMaterial({name:'taihe_gold',color:0xb79a51,roughness:.52,metalness:.55});const neutralGeometry=new THREE.BoxGeometry();neutralGeometry.attributes.uv.array.fill(0);root.add(new THREE.Mesh(neutralGeometry,s));
  installTaiheColumnTextures(root,gold);
  assert.equal(s.map,gold.map);assert.equal(s.bumpMap,gold.bumpMap);assert.equal(s.roughnessMap,gold.roughnessMap);assert.equal(s.bumpScale,A.bumpScale);
  assert.equal(s.normalMap,null);assert.equal(s.roughness,.52);assert.equal(s.metalness,.55);assert.equal(s.color.getHex(),0xb79a51);
  assert.equal(s.map.colorSpace,THREE.SRGBColorSpace);assert.equal(s.bumpMap.colorSpace,THREE.NoColorSpace);assert.equal(s.map.flipY,false);
  assert.ok(isTaiheSharedAtlas(s,s.map));assert.ok(isTaiheSharedAtlas(s,s.bumpMap));
  const forged=new THREE.MeshStandardMaterial();forged.userData.taiheSharedAtlas=gold.map;assert.equal(isTaiheSharedAtlas(forged,gold.map),false);
  s.dispose();assert.equal(colorDisposals,0);assert.equal(reliefDisposals,0);gold.dispose();gold.dispose();assert.equal(colorDisposals,1);assert.equal(reliefDisposals,1);
});

test('column UV helper and authored atlas source have explicit source identity',async()=>{
  const {candidate,config}=await import('./lib/taihe-column-fixture.mjs');
  const hash=b=>createHash('sha256').update(b).digest('hex');
  assert.equal(candidate.contract.columnSurfaceUVSHA256,hash(read('assets-src/interiors/taihe_column_uv.py')));
  assert.equal(config.asset.columnSurfaceUVSHA256,candidate.contract.columnSurfaceUVSHA256);
  assert.equal(config.asset.columnAtlasSourceSHA256,hash(read('src/scene/palace/special/TaiheColumnSurface.js')));
});

test('independent decoded geometry classifier proves exact neutral coverage and cylindrical phase for S and B',async()=>{
  const {candidate,centres,profile,radial}=await import('./lib/taihe-column-fixture.mjs');
  const {captureTaiheControl}=await import('./lib/taihe-core-fixture.mjs');const c=captureTaiheControl('太和殿');
  const m=c.group.children.find(o=>o.userData.taiheCoreOwner&&o.material.name==='taihe_gold'),g=m.geometry,p=g.attributes.position,uv=g.attributes.uv;
  const b=[];for(let i=0;i<p.count;i+=3)b.push({material:'taihe_gold',vertices:[0,1,2].map(k=>({POSITION:[p.getX(i+k),p.getY(i+k),p.getZ(i+k)],TEXCOORD_0:[uv.getX(i+k),uv.getY(i+k)]}))});
  function inspect(ts,expectedDecorated){let decorated=0,neutral=0;
   for(const t of ts){const ps=t.vertices.map(v=>v.POSITION),c=centres.find(c=>ps.every(p=>p[1]>=.19999&&p[1]<=profile.columns.height+.00001&&radial(p,c)<=.52001));
    const cap=ps.every(p=>Math.abs(p[1]-.2)<1e-5)||ps.every(p=>Math.abs(p[1]-profile.columns.height)<1e-5);
    if(!c||cap){neutral++;for(const v of t.vertices)assert.deepEqual(v.TEXCOORD_0,[0,0]);continue;}decorated++;
    for(const v of t.vertices){const [u,y]=v.TEXCOORD_0,p=v.POSITION,theta=((u-1/16)/(7/8)-.5)*2*Math.PI,r=radial(p,c);
     assert.ok(Math.abs(Math.cos(theta)-(p[0]-c[0])/r)<3e-5);assert.ok(Math.abs(Math.sin(theta)-(p[2]-c[1])/r)<3e-5);
     assert.ok(Math.abs(y-(1/32+(p[1]-.2)/(profile.columns.height-.2)*15/16))<1e-6);
     assert.ok(u>=1/16-1e-6&&u<=15/16+1e-6);assert.ok(y>=1/32-1e-6&&y<=31/32+1e-6);
    }
   }assert.equal(decorated,expectedDecorated);assert.ok(neutral>100);
  }
  const s=candidate.triangles.filter(t=>t.material==='taihe_gold');inspect(s,3192);inspect(b,96);
  const bad=structuredClone(s),cap=bad.find(t=>t.vertices.every(v=>v.TEXCOORD_0.every(x=>x===0)));cap.vertices[0].TEXCOORD_0=[.5,.5];assert.throws(()=>inspect(bad,3192));
  const wrong=structuredClone(s),side=wrong.find(t=>t.vertices.some(v=>v.TEXCOORD_0[0]>0));side.vertices[0].TEXCOORD_0[0]+=.01;assert.throws(()=>inspect(wrong,3192));c.builder.dispose();
});

test('imported authored intensity is periodic, reproducible, and bounded by the .0015 shading-only bump multiplier',async()=>{
  const {TAIHE_COLUMN_ATLAS:A}=await load();assert.equal(A.bumpScale,.0015);
  const {COLUMN_INTENSITY_BASE64:base64,COLUMN_INTENSITY_SHA256:sha,COLUMN_INTENSITY_WIDTH:w,COLUMN_INTENSITY_HEIGHT:h}=await import('../src/scene/palace/special/TaiheColumnIntensityData.js');
  const bytes=Buffer.from(base64,'base64');assert.equal(w,224);assert.equal(h,480);assert.equal(bytes.length,w*h);assert.equal(createHash('sha256').update(bytes).digest('hex'),sha);
  for(let y=0;y<h;y++){const i=y*w;assert.equal(bytes[i],bytes[i+w-1]);assert.equal(bytes[i],bytes[i+1]);assert.equal(bytes[i+w-1],bytes[i+w-2]);}
});

test('offline Node sampling reproduces the exact embedded field without copying the original PNG to runtime',async()=>{
  const fs=await import('node:fs'),os=await import('node:os'),path=await import('node:path'),{spawnSync}=await import('node:child_process');
  const {config}=await import('./lib/taihe-column-fixture.mjs'),sha=b=>createHash('sha256').update(b).digest('hex');
  const meta=JSON.parse(read('assets-src/interiors/taihe_column_art/SOURCE.json'));
  assert.equal(sha(read('assets-src/interiors/taihe_column_art/original-generated.png')),meta.inputSHA256);
  assert.equal(meta.inputSHA256,'0e36c1b2105264c9bbffd65a52074b4b1c12dceb57226cfe4e0d436d797d2146');
  for(const [key,file] of [['columnIntensityDataSHA256','src/scene/palace/special/TaiheColumnIntensityData.js'],['columnArtSHA256','assets-src/interiors/taihe_column_art/original-generated.png'],['columnBakeSHA256','assets-src/interiors/taihe_column_art/bake.mjs']])assert.equal(config.asset[key],sha(read(file)));
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'taihe-column-bake-'));try{
    const out=path.join(dir,'intensity.js'),result=spawnSync(process.execPath,['assets-src/interiors/taihe_column_art/bake.mjs',out],{encoding:'utf8'});
    assert.equal(result.status,0,result.stderr);assert.deepEqual(fs.readFileSync(out),read('src/scene/palace/special/TaiheColumnIntensityData.js'));
    assert.equal(JSON.parse(result.stdout).outputSHA256,meta.outputSHA256);
  }finally{fs.rmSync(dir,{recursive:true});}
  assert.equal(fs.existsSync(new URL('../public/original-generated.png',import.meta.url)),false);
});

test('unchanged pearl material stays opaque while offline index ordering is explicitly not bitwise deterministic',async()=>{
  const {candidate}=await import('./lib/taihe-column-fixture.mjs');
  const pearl=candidate.gltf.materials.find(m=>m.name==='taihe_pearl');assert.ok(pearl);
  assert.equal(pearl.alphaMode??'OPAQUE','OPAQUE');assert.equal(pearl.pbrMetallicRoughness.baseColorFactor[3],1);
});
