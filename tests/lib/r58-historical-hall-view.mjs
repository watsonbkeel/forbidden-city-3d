import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {mkdirSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';


// Exact archived component runtime for the delivered R58-A hall-beast checks.
const archiveSHA='2a1453ff47dcb5d1c1cec99701ef3568db67495962e19bb8a4b9a4f4223b5d46';
const sourceRosterSHA='22fa1017ae6d1acb425b006d0c66778e2d75150f36103837af205fa6bd1c36a7';
const paths=[
  "data/anchors.json",
  "data/architecture/kunning.json",
  "data/architecture/qianqing-display-geometry.json",
  "data/architecture/taihe-column-grid.json",
  "data/architecture/taihe-core.json",
  "data/architecture/taihe-dais-front.json",
  "data/zones/axis-courts.json",
  "package-lock.json",
  "package.json",
  "reports/r58-hall-beasts/HOOKUP.patch",
  "src/config/constants.js",
  "src/render/SolidMaterialBatch.js",
  "src/scene/HallKit.js",
  "src/scene/Layout.js",
  "src/scene/PalaceBuilder.js",
  "src/scene/RoofBuilder.js",
  "src/scene/palace/BaoheColumnCouplets.js",
  "src/scene/palace/BaoheColumnGrid.js",
  "src/scene/palace/BaoheDaisApproach.js",
  "src/scene/palace/BaoheDepthGrid.js",
  "src/scene/palace/BaoheFrontDoors.js",
  "src/scene/palace/BaoheFrontEnclosure.js",
  "src/scene/palace/BaoheHallPlinth.js",
  "src/scene/palace/BaoheInteriorFrame.js",
  "src/scene/palace/BaoheNorthApproaches.js",
  "src/scene/palace/BaoheRearEnclosure.js",
  "src/scene/palace/BaoheThroneScreen.js",
  "src/scene/palace/BaoheWarmRooms.js",
  "src/scene/palace/HallNameboardMount.js",
  "src/scene/palace/QianqingCeiling.js",
  "src/scene/palace/QianqingCeilingPaint.js",
  "src/scene/palace/QianqingCentralArt.js",
  "src/scene/palace/QianqingCentralSetting.js",
  "src/scene/palace/QianqingDepthGrid.js",
  "src/scene/palace/QianqingDisplay.js",
  "src/scene/palace/QianqingEndPassages.js",
  "src/scene/palace/QianqingFriezePaint.js",
  "src/scene/palace/QianqingFrontEnclosure.js",
  "src/scene/palace/QianqingFrontageGrid.js",
  "src/scene/palace/QianqingScreenCrest.js",
  "src/scene/palace/QianqingScreenPaint.js",
  "src/scene/palace/QianqingSurface.js",
  "src/scene/palace/QianqingUpperEnclosure.js",
  "src/scene/palace/QianqingWarmRooms.js",
  "src/scene/palace/TaiheFrontApproaches.js",
  "src/scene/palace/TaihemenSouthApproach.js",
  "src/scene/palace/ThreeHallTerrace.js",
  "src/scene/palace/ZhongheImperialApproach.js",
  "src/scene/palace/gateAscent.js",
  "src/scene/palace/gateRailFacade.js",
  "src/scene/palace/river.js",
  "src/scene/palace/special/AxisFirewallProfiles.js",
  "src/scene/palace/special/AxisFirewalls.js",
  "src/scene/palace/special/GatePlaques.js",
  "src/scene/palace/special/GateTowerMeasurements.js",
  "src/scene/palace/special/GateTowerProfiles.js",
  "src/scene/palace/special/GateTowerShell.js",
  "src/scene/palace/special/HallWalkingBeasts.js",
  "src/scene/palace/special/InnerJinshui.js",
  "src/scene/palace/special/InnerPalaceGlazeLOD.js",
  "src/scene/palace/special/InnerPalaceLevels.js",
  "src/scene/palace/special/InnerPalaceTerrace.js",
  "src/scene/palace/special/JiaotaiCeilingFrame.js",
  "src/scene/palace/special/JiaotaiCentralArt.js",
  "src/scene/palace/special/JiaotaiCentralInterior.js",
  "src/scene/palace/special/JiaotaiDisplaySetting.js",
  "src/scene/palace/special/JiaotaiLandmarkArt.js",
  "src/scene/palace/special/JiaotaiLandmarks.js",
  "src/scene/palace/special/KunningPalace.js",
  "src/scene/palace/special/KunningProfile.js",
  "src/scene/palace/special/QianqingGate.js",
  "src/scene/palace/special/QianqingGatePlaque.js",
  "src/scene/palace/special/QianqingImperialStair.js",
  "src/scene/palace/special/SouthWaterSystem.js",
  "src/scene/palace/special/SquareHalls.js",
  "src/scene/palace/special/TaiheBeamFrame.js",
  "src/scene/palace/special/TaiheCaissonDetail.js",
  "src/scene/palace/special/TaiheCaissonFallbackData.js",
  "src/scene/palace/special/TaiheCeilingArtwork.js",
  "src/scene/palace/special/TaiheCeilingMaterial.js",
  "src/scene/palace/special/TaiheCofferFrame.js",
  "src/scene/palace/special/TaiheColumnGrid.js",
  "src/scene/palace/special/TaiheColumnIntensityData.js",
  "src/scene/palace/special/TaiheColumnResponse.js",
  "src/scene/palace/special/TaiheColumnSurface.js",
  "src/scene/palace/special/TaiheCore.js",
  "src/scene/palace/special/TaiheCoreProfile.js",
  "src/scene/palace/special/TaiheDaisFallbackData.js",
  "src/scene/palace/special/TaiheDaisFront.js",
  "src/scene/palace/special/TaiheDisplayFallbackData.js",
  "src/scene/palace/special/TaiheDisplayPairs.js",
  "src/scene/palace/special/TaiheFloorMaterial.js",
  "src/scene/palace/special/TaiheFurnishingSurface.js",
  "src/scene/palace/special/TaihePlaqueFrame.js",
  "src/scene/palace/special/TaiheRearEnclosure.js",
  "src/scene/palace/special/TaihemenEnclosure.js",
  "src/scene/palace/special/TaihemenProfile.js",
  "src/scene/palace/special/TaihemenSouthKnees.js",
  "src/scene/palace/special/WumenAscent.js",
  "src/scene/palace/special/WumenAscentProfile.js",
  "src/scene/palace/special/WumenNorthPortal.js",
  "src/scene/palace/special/WumenPavilionColumns.js",
  "src/scene/palace/special/WumenSouthPortalCanopies.js",
  "src/scene/palace/special/WumenVerticalProfile.js",
  "src/scene/palace/special/ZhongheDisplaySetting.js",
  "src/utils/Collision.js",
  "src/utils/GeometryUV.js",
  "src/utils/MergeUtils.js",
  "src/utils/OverheadShape.js",
  "src/utils/TextureGenerator.js",
  "src/utils/TextureLibrary.js",
  "tests/current-state/r58-hall-beasts.test.mjs",
  "tests/current-state/r58-taihe-beasts.test.mjs",
  "tests/fixtures/r58-hall-beast-baseline.json",
  "tests/fixtures/r58-taihe-beast-baseline.json",
  "tests/lib/inner-palace-fixture.mjs",
  "tests/lib/r58-hall-beast-fixture.mjs",
  "tests/lib/r58-hall-beasts-world-check.mjs",
  "tests/lib/r58-taihe-beast-fixture.mjs",
  "tests/lib/r58-three-hall-beasts-world-check.mjs"
];
const expectedExternals=["node:assert/strict", "node:crypto", "node:fs", "node:test", "three", "three/examples/jsm/utils/BufferGeometryUtils.js"];
const exactCases=new Map(Object.entries({
  "tests/current-state/r58-hall-beasts.test.mjs": [
    "exact owner HOOKUP.patch rehearsal uses actual production inputs and retains all hall physics and all other hall meshes"
  ],
  "tests/current-state/r58-taihe-beasts.test.mjs": [
    "太和殿 actual hall retains baseline physics and non-target roof/nonroof bytes",
    "中和殿 actual hall retains baseline physics and non-target roof/nonroof bytes",
    "交泰殿 actual hall retains baseline physics and non-target roof/nonroof bytes",
    "乾清宫 actual hall retains baseline physics and non-target roof/nonroof bytes"
  ]
}));
const three={
  "build/three.module.js": "ec3ddc3897ec75288b5502057456c471c2eb7d6e7cf36140d0a5224e94a1984b",
  "examples/jsm/utils/BufferGeometryUtils.js": "b0c64fe6f3b9907262921b73fafc4ade874c07ba6b4876e164c87a830c2c2113",
  "package.json": "2c5b740385ede44b4963ef366c3d29dd8e2e542a354af0ae2063f7dcb3dcde30"
};
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const gitBlob=bytes=>createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');

function stageInputs(){
  const compressed=readFileSync(new URL('../fixtures/r58-historical-hall-view.json.gz',import.meta.url));
  assert.equal(sha256(compressed),archiveSHA,'exact delivered R58-A historical test archive');
  const native=JSON.parse(gunzipSync(compressed,{maxOutputLength:1354976}));
  assert.equal(native.commit,'82d8ab9d2b7cf13af6d2233ef3d262f183ce8cbd');
  assert.equal(native.tree,'e37c7e99852d2b2e15c3bb87f0b59942aa3339a5');
  assert.equal(native.parent,'78bdb27843cc35e5c44460ae68173fbd9ede7925');
  assert.deepEqual(native.externals,expectedExternals,'known exact external imports only');
  assert.deepEqual(Object.keys(native.files).sort(),paths,'canonical R58-A input roster and boundaries');
  assert.equal(sha256(paths.map(p=>p+' '+native.files[p].gitBlob+'\n').join('')),sourceRosterSHA);
  const files=new Map();
  for(const p of paths){
    const {payload,size,sha256:digest,gitBlob:blob}=native.files[p];
    const data=Buffer.from(payload,'utf8');
    assert.equal(data.toString('utf8'),payload,p);
    assert.equal(data.length,size,p);
    assert.equal(sha256(data),digest,p);
    assert.equal(gitBlob(data),blob,p);
    files.set(p,data);
  }
  assert.equal([...files.values()].reduce((total,b)=>total+b.length,0),1304115);
  const lock=JSON.parse(files.get('package-lock.json')).packages['node_modules/three'];
  assert.equal(lock.version,'0.162.0');
  assert.equal(lock.integrity,'sha512-xfCYj4RnlozReCmUd+XQzj6/5OjDNHBy5nT6rVwrOKGENAvpXe2z1jL+DZYaMu4/9pNsjH/4Os/VvS9IrH7IOQ==');
  const moduleRoot=new URL('../',import.meta.resolve('three'));
  for(const [p,digest] of Object.entries(three)){
    const data=readFileSync(new URL(p,moduleRoot));
    assert.equal(sha256(data),digest,'exact historical Three input '+p);
    files.set('node_modules/three/'+p,data);
  }
  return files;
}

function checkExactTAP(text,name){
  const rows=text.replaceAll('\r\n','\n').trimEnd().split('\n');
  assert.equal(rows[0],'TAP version 13');
  assert.deepEqual(rows.filter(row=>row.startsWith('# Subtest: ')),['# Subtest: '+name]);
  assert.deepEqual(rows.filter(row=>/^\s*(?:not )?ok \d+ - /.test(row)),['ok 1 - '+name]);
  assert.deepEqual(rows.filter(row=>/^\d+\.\.\d+/.test(row)),['1..1']);
  for(const [key,expected] of Object.entries({tests:1,suites:0,pass:1,fail:0,cancelled:0,skipped:0,todo:0})){
    assert.deepEqual(rows.filter(row=>row.startsWith('# '+key+' ')),['# '+key+' '+expected]);
  }
}

/** Test-input integrity fixture, not a security sandbox. It runs the unchanged
 * original named assertion against its exact delivered source. The root files
 * still run all other cases against today's separately imported production code. */
export function replayR58HallBeastCase(file,name){
  const original='tests/current-state/'+file;
  assert.ok(exactCases.get(original)?.includes(name),'recognized exact historical test only');
  return ()=>{
    const inputs=stageInputs(), dir=mkdtempSync(path.join(tmpdir(),'palace-r58-hall-beasts-'));
    try {
      for(const [p,data] of inputs){
        const dest=path.join(dir,p);
        mkdirSync(path.dirname(dest),{recursive:true});
        writeFileSync(dest,data,{flag:'wx',mode:0o444});
      }
      const selector='^'+name.replace(/[.*+?^$()|[\]\\]/g,'\\$&')+'$';
      const env={TZ:'UTC',LC_ALL:'C'};
      const systemRoot=process.platform==='win32'&&(process.env.SystemRoot??process.env.SYSTEMROOT);
      if(systemRoot)env.SystemRoot=systemRoot;
      const r=spawnSync(process.execPath,['--max-old-space-size=512','--test','--test-concurrency=1',
        '--test-reporter=tap','--test-name-pattern='+selector,original],
        {cwd:dir,env,encoding:'utf8',timeout:15_000,maxBuffer:512_000,windowsHide:true});
      assert.ifError(r.error);
      assert.equal(r.signal,null,r.stderr);
      assert.equal(r.status,0,r.stdout+'\n'+r.stderr);
      checkExactTAP(r.stdout,name);
    } finally {
      rmSync(dir,{force:true,recursive:true});
    }
  };
}
