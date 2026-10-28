import fs from 'node:fs';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import * as T from 'three';import {readyScene} from './ready-zone.mjs';import {sourceFingerprint} from '../build-identity.mjs';import {triangleBodyIntersects,triangleBodySweepFraction} from '../../src/utils/TriangleSupport.js';
const before=sourceFingerprint(process.cwd()),h=await readyScene(process.argv[3]??'high'),rows=[];
try{const sources=h.frames.flatMap(f=>f.meshes.filter(m=>m.worldTriangles).map(m=>({...m,item:f.itemIndex}))),owners=h.data.colliders.filter(b=>b.triangleSupport?.id.startsWith('chuxiu-front-hanging:'));
 assert.equal(sources.length,22);assert.equal(owners.length,22);
 for(const box of owners){const o=box.triangleSupport,tris=o.template.triangles.map(q=>[q.triangle.a,q.triangle.b,q.triangle.c].map(v=>v.toArray())),hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex'),sha=hash(tris),matches=sources.filter(m=>hash(m.worldTriangles)===sha);assert.equal(matches.length,1,'unique exact rendered F32 source');
 const edges=new Map();let volume=0;for(const tri of tris){const [a,b,c]=tri.map(v=>new T.Vector3(...v));volume+=a.dot(b.clone().cross(c))/6;for(let i=0;i<3;i++){const a=tri[i].join(','),b=tri[(i+1)%3].join(','),key=[a,b].sort().join('|'),r=edges.get(key)??[];r.push(a<b?1:-1);edges.set(key,r);}}
 assert.ok([...edges.values()].every(v=>v.length===2&&v[0]+v[1]===0),'closed oriented manifold edges');assert.ok(volume>0,'outward positive volume');
 // A real face interior must block a finite high body; an isolated vertical fall
 // across its actual top must be swept, not silently skip it as decoration.
 const center=box.getCenter(new T.Vector3()),inside=new T.Box3(center.clone().addScalar(-.025),center.clone().addScalar(.025));
 let witness=null;for(const q of o.template.triangles){const mid=q.triangle.getMidpoint(new T.Vector3()),b=new T.Box3(mid.clone().addScalar(-.015),mid.clone().addScalar(.015));if(triangleBodyIntersects(o,b)){witness=mid.toArray();break;}}assert.ok(witness);
 const bodyAt=y=>new T.Box3(new T.Vector3(center.x-.5,y,center.z-.5),new T.Vector3(center.x+.5,y+1.7,center.z+.5));
 const down=triangleBodySweepFraction(o,bodyAt(box.max.y+.3),bodyAt(box.min.y-2)),up=triangleBodySweepFraction(o,bodyAt(box.min.y-2),bodyAt(box.max.y+.3));assert.ok(down!==null&&up!==null);
 rows.push({id:o.id,item:matches[0].item,sourceSHA256:sha,triangles:tris.length,bounds:[box.min.toArray(),box.max.toArray()],orientedEdges:edges.size,volume,contactWitness:witness,fullBodyVerticalSweep:{down,up}});
 }
 const after=sourceFingerprint(process.cwd());assert.equal(before,after);fs.writeFileSync(process.argv[2],JSON.stringify({before,after,scope:'Exact premerge world F32 render-source vs owner; closed oriented edges and volume; isolated actual high-owner body sweeps, not full-world flight/gameplay.',paint:h.paint,rows},null,2));console.log(rows.map(r=>({id:r.id,volume:r.volume,triangles:r.triangles,sweep:r.fullBodyVerticalSweep})));
}finally{h.dispose()}
