import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import zlib from 'node:zlib';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
import {captureGate} from '../../lib/gate-tower-fixture.mjs';import {digest} from '../../lib/wumen-right-leaf-fixture.mjs';
function realTriangles(c){const rows=[],T=c.THREE;c.group.updateMatrixWorld(true);c.group.traverse(m=>{
 if(!m.isMesh)return;for(let o=m;o;o=o.parent)if(!o.visible)return;const p=m.geometry.attributes.position,n=m.geometry.attributes.normal,idx=m.geometry.index,norm=new T.Matrix3().getNormalMatrix(m.matrixWorld);
 for(let i=0;i<(idx?.count??p.count);i+=3){let mat=m.material;if(Array.isArray(mat)){const g=m.geometry.groups.find(x=>i>=x.start&&i<x.start+x.count);mat=mat[g?.materialIndex??0];}if(!mat?.visible)continue;
 const ids=[0,1,2].map(j=>idx?idx.getX(i+j):i+j),color=mat.color.toArray();rows.push({v:ids.map(j=>new T.Vector3(p.getX(j),p.getY(j),p.getZ(j)).applyMatrix4(m.matrixWorld).toArray()),n:ids.map(j=>new T.Vector3(n.getX(j),n.getY(j),n.getZ(j)).applyNormalMatrix(norm).toArray()),c:[color,color,color],side:mat.side,character:false});
 }
});return rows;}
test('side-portal CPU export includes all 49536 actual full-gate triangles with correct single-material face handling',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'wumen-side-portal-cpu-')),out=path.join(root,'export');const env={...process.env};delete env.NODE_TEST_CONTEXT;
 try{const child=spawnSync(process.execPath,['--max-old-space-size=768','scripts/photo-fidelity/batches/r157-wumen-side-portals/export-cpu.mjs',out,'after'],{cwd:fileURLToPath(new URL('../../../',import.meta.url)),env,encoding:'utf8',timeout:60000,maxBuffer:1024*1024});assert.equal(child.status,0,child.stderr);assert.equal(child.signal,null);
 const c=captureGate();try{const expected=realTriangles(c),proof=JSON.parse(fs.readFileSync(path.join(out,'PROOF.json')));assert.equal(expected.length,49536);
 for(const v of Object.values(proof.views)){const data=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(out,v.file))));assert.equal(data.triangles.length,expected.length,'actual all-face count, not a renamed proof label');assert.equal(digest(data.triangles),digest(expected),'all actual vertex/normal/color/material-side rows in order');const bad=structuredClone(data.triangles);bad.pop();assert.notEqual(digest(bad),digest(expected));}
 }finally{c.builder.dispose();}
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
