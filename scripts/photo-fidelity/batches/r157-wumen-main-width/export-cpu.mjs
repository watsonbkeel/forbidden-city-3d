import fs from 'node:fs';import path from 'node:path';import zlib from 'node:zlib';import crypto from 'node:crypto';
import {captureGate} from '../../../../tests/lib/gate-tower-fixture.mjs';
const [out,mode]=process.argv.slice(2);if(!out||fs.existsSync(out)||!['before','after'].includes(mode))throw Error('New directory plus before/after required');
const c=captureGate(),T=c.THREE,old=JSON.parse(fs.readFileSync('tests/fixtures/r157-wumen-main-width/before-411214.json'));
const status=c.tower.userData.structure.horizontalGrid.widthBaySpacing;
if(status!==(mode==='before'?'RETAINED_EQUAL_DIVISION_NOT_SURVEYED':'SIMPLIFIED_SOURCE_RATIO_WITHIN_RETAINED_ENVELOPE_NOT_SURVEYED'))throw Error('Actual loaded source state does not match export label');
fs.mkdirSync(out,{recursive:true});const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const proof={accepted:false,scope:'REAL_BUILD_GATE_WHOLE_WUMEN_PREMERGE_CPU_BASE_COLOR_NO_GPU',mode,baseline:old.baseline,actualWidthStatus:status,views:{},sourceHashes:{},limitations:['Same retained roof/base/origin; does not approve macro layout','No historical or live GPU material/light acceptance','Before uses exact three-source predecessor, other production sources unchanged']};
for(const p of Object.keys(old.sourceHashes))proof.sourceHashes[p]=mode==='before'?old.sourceHashes[p]:hash(fs.readFileSync(p));
try{c.group.updateMatrixWorld(true);const triangles=[];c.group.traverse(m=>{if(!m.isMesh||!m.visible)return;const a=m.geometry.attributes,idx=m.geometry.index,norm=new T.Matrix3().getNormalMatrix(m.matrixWorld);if(!a.normal)throw Error('missing actual normals');const isMaterialArray=Array.isArray(m.material),materials=isMaterialArray?m.material:[m.material];for(let i=0;i<(idx?.count??a.position.count);i+=3){const gr=m.geometry.groups.find(g=>i>=g.start&&i<g.start+g.count),mat=isMaterialArray?materials[gr?.materialIndex??0]:m.material;if(!mat?.visible)continue;const color=mat.color.toArray(),ids=[0,1,2].map(k=>idx?idx.getX(i+k):i+k);triangles.push({v:ids.map(j=>new T.Vector3().fromBufferAttribute(a.position,j).applyMatrix4(m.matrixWorld).toArray()),n:ids.map(j=>new T.Vector3().fromBufferAttribute(a.normal,j).applyNormalMatrix(norm).toArray()),c:[color,color,color],side:mat.side,character:false});}});
 for(const [name,eye,target,fov]of [['north-front',[0,17,83],[0,16.5,0],48],['north-oblique',[55,23,72],[0,16.5,0],49],['south-front',[0,17,-87],[0,16.5,0],48]]){
  const camera=new T.PerspectiveCamera(fov,1200/800,.1,300);camera.position.fromArray(eye);camera.lookAt(new T.Vector3().fromArray(target));camera.updateMatrixWorld(true);const cam={position:eye,target,fov,matrixWorldInverse:camera.matrixWorldInverse.toArray()};
  const label=`wumen-main-width-${name}-${mode}`,file=label+'.json.gz';fs.writeFileSync(path.join(out,file),zlib.gzipSync(JSON.stringify({label,kind:proof.scope,diagnosticSize:[1200,800],camera:cam,triangles,sourceCharacterInstances:0})));
  proof.views[name]={camera:cam,triangles:triangles.length,file,sha256:hash(fs.readFileSync(path.join(out,file)))};
 }fs.writeFileSync(path.join(out,'PROOF.json'),JSON.stringify(proof,null,2)+'\n');
}finally{c.builder.dispose();}
