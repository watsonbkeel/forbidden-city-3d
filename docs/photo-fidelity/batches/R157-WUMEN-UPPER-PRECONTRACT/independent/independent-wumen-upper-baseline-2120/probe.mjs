import assert from'node:assert/strict';import fs from'node:fs';
import{captureGate}from'../r157-wumen-joint-layout-1622/tests/lib/gate-tower-fixture.mjs';
import{upperPredecessorSignature as sig,verifyUpperPredecessor as verify}from'../r157-wumen-joint-layout-1622/scripts/photo-fidelity/batches/wumen-joint-layout/upper-baseline.mjs';
const c=captureGate(),results=[];try{
 const expected=sig(c);const reject=(name,change)=>{const undo=change();try{assert.throws(()=>verify(sig(c),expected),/upper predecessor/);results.push({name,rejected:true});}finally{undo();}};
 let mesh;c.group.traverse(o=>{if(!mesh&&o.isMesh&&o.material?.isMeshStandardMaterial)mesh=o;});
 reject('material opacity',()=>{let old=mesh.material.opacity;mesh.material.opacity=.3;return()=>mesh.material.opacity=old;});
 reject('receiveShadow',()=>{let old=mesh.receiveShadow;mesh.receiveShadow=!old;return()=>mesh.receiveShadow=old;});
 reject('material side',()=>{let old=mesh.material.side;mesh.material.side=c.THREE.DoubleSide;return()=>mesh.material.side=old;});
 reject('parent actual world transform',()=>{const p=new c.THREE.Group();p.position.y=.125;p.add(c.group);return()=>p.remove(c.group);});
 const g=mesh.geometry;reject('normal normalized',()=>{const a=g.attributes.normal,old=a.normalized;a.normalized=!old;return()=>a.normalized=old;});
 assert.equal(verify(sig(c),expected),true);
 c.group.userData.encodingProbe={z:-0,p:Infinity,n:-Infinity,nan:NaN,u:undefined,literal:{numeric:'-0'},literal2:{primitive:'undefined'},nested:{escapedRecord:[['x',3]]}};
 const s=sig(c),p=s.nodes[0].userData.encodingProbe;assert.deepEqual(p.z,{numeric:'-0'});assert.deepEqual(p.p,{numeric:'Infinity'});assert.deepEqual(p.n,{numeric:'-Infinity'});assert.deepEqual(p.nan,{numeric:'NaN'});assert.deepEqual(p.u,{primitive:'undefined'});assert.deepEqual(p.literal,{escapedRecord:[['numeric','-0']]});assert.deepEqual(p.literal2,{escapedRecord:[['primitive','undefined']]});assert.equal(verify(JSON.parse(JSON.stringify(s)),s),true);
 c.group.userData.encodingProbe.z=0;assert.throws(()=>verify(sig(c),s),/upper predecessor/);results.push({name:'-0 versus +0 and exceptional number/token distinction',rejected:true});
 delete c.group.userData.encodingProbe;assert.equal(verify(sig(c),expected),true);
 fs.writeFileSync(new URL('./probe.json',import.meta.url),JSON.stringify({scope:'Independent small actual fixture probes, not World',results,allRestored:true},null,2)+'\n');console.log(JSON.stringify({probes:results.length,allPassed:true}));
}finally{c.builder.dispose();}
