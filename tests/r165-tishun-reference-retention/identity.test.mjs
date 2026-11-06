import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {fixture,zone} from '../r165-tishun-south-beam/fixture.mjs';
import {buildTishunSouthBeam as build} from '../../src/scene/palace/special/TishunSouthBeam.js';

test('committed kit refuses replacement identity, moved or missing slot without staging or disposal, and restores the same record',()=>{
  for(const mode of ['same-value-clone','fresh-original-mesh','swap-slot','missing-slot']){
    const f=fixture({companions:false}),original=f.target,oldGeometry=original.geometry.clone();
    let replacement,staged=0,disposed=0;
    try{
      const record=build(f.kit,zone),children=[...f.frame.children];
      if(mode==='same-value-clone'||mode==='fresh-original-mesh'){
        replacement=original.clone(false);
        replacement.userData=mode==='same-value-clone'?original.userData:{};
        replacement.geometry=mode==='same-value-clone'?original.geometry:oldGeometry;
        f.frame.remove(original);f.frame.add(replacement);
        f.frame.children.splice(f.frame.children.indexOf(replacement),1);f.frame.children.splice(14,0,replacement);
      }else if(mode==='swap-slot'){
        [f.frame.children[14],f.frame.children[15]]=[f.frame.children[15],f.frame.children[14]];
      }else f.frame.remove(original);
      f.kit.root.updateWorldMatrix(true,true);
      const set=T.BufferGeometry.prototype.setAttribute,dispose=T.BufferGeometry.prototype.dispose;
      try{
        T.BufferGeometry.prototype.setAttribute=function(...args){staged++;return set.apply(this,args)};
        T.BufferGeometry.prototype.dispose=function(...args){disposed++;return dispose.apply(this,args)};
        assert.throws(()=>build(f.kit,zone),/idempotent applied target drift/,mode);
        assert.equal(staged,0,mode+' must not stage fresh geometry');
        assert.equal(disposed,0,mode+' must not dispose anything');
      }finally{T.BufferGeometry.prototype.setAttribute=set;T.BufferGeometry.prototype.dispose=dispose}
      if(replacement)f.frame.remove(replacement);
      if(!original.parent)f.frame.add(original);
      f.frame.children.splice(0,f.frame.children.length,...children);
      f.kit.root.updateWorldMatrix(true,true);
      assert.equal(build(f.kit,zone),record,mode+' restoration preserves exact record');
    }finally{oldGeometry.dispose();f.dispose()}
  }
});

test('old dispose listener reenters the fully committed record before throwing and retry never repeats disposal',()=>{
  const f=fixture({companions:false}),old=f.target.geometry;let calls=0,reentrant;
  const fault=()=>{calls++;reentrant=build(f.kit,zone);throw Error('external listener after synchronous reentry')};
  old.addEventListener('dispose',fault);
  try{
    assert.throws(()=>build(f.kit,zone),/external listener after synchronous reentry/);
    assert.equal(reentrant.mesh,f.target);assert.ok(Object.isFrozen(reentrant));
    assert.equal(build(f.kit,zone),reentrant);assert.equal(calls,1);
  }finally{old.removeEventListener('dispose',fault);f.dispose()}
});
