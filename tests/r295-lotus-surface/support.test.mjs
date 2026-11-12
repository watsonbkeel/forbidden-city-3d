import path from 'node:path';import os from 'node:os';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import * as T from 'three';import {createEightTierLotus} from '../../src/scene/palace/special/EightTierLotus.js';
const evidenceDir=process.env.EVIDENCE_DIR??fs.mkdtempSync(path.join(os.tmpdir(),'r295-lotus-'));if(!path.isAbsolute(evidenceDir))throw Error('absolute evidence directory required');fs.mkdirSync(evidenceDir,{recursive:true});

test('every petal physically crosses actual triangulated 32-face core with inward and exposed vertices',()=>{
 const g=createEightTierLotus(),p=g.attributes.position,ix=g.index,coreGroup=g.groups[0],tri=new T.Triangle(),ray=new T.Ray(),hit=new T.Vector3(),rows=[];
 const coreRadiusAtVertex=v=>{const d=new T.Vector3(v.x,0,v.z).normalize();ray.set(new T.Vector3(0,v.y,0),d);let nearest=Infinity;for(let i=coreGroup.start;i<coreGroup.start+coreGroup.count;i+=3){tri.setFromAttributeAndIndices(p,ix.getX(i),ix.getX(i+1),ix.getX(i+2));if(ray.intersectTriangle(tri.a,tri.b,tri.c,false,hit))nearest=Math.min(nearest,hit.distanceTo(ray.origin));}assert.ok(Number.isFinite(nearest),'actual core ray intersects');return nearest;};
 try{for(const tier of g.userData.tiers){const petals=[];for(const leaf of tier.petals){const signed=[];for(let i=leaf.vertexStart+1;i<leaf.vertexStart+leaf.vertexCount-1;i++){const v=new T.Vector3().fromBufferAttribute(p,i);signed.push(Math.hypot(v.x,v.z)-coreRadiusAtVertex(v));}const min=Math.min(...signed),max=Math.max(...signed);petals.push({min,max});}rows.push({tier:tier.id,petals});}
 fs.writeFileSync(path.join(evidenceDir,'SUPPORT.json'),JSON.stringify({method:'EACH_REAL_FLOAT32_RING_VERTEX_RADIAL_RAY_TO_ACTUAL_CORE_TRIANGLES_NOT_ANALYTIC_RADIUS',rows},null,2));
 for(const tier of rows)for(const petal of tier.petals){assert.ok(petal.min<-.001,'tier '+tier.tier+' requires interior core overlap, actual min '+petal.min);assert.ok(petal.max>.005,'tier '+tier.tier+' must retain visible relief');assert.ok(petal.max<.045,'floating relief limit');}
 assert.equal(g.index.count/3,6488);assert.equal(g.attributes.position.count,3578);
 }finally{g.dispose();}
});
