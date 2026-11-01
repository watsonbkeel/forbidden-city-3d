import test from'node:test';import assert from'node:assert/strict';
import{captureGate}from'../../lib/gate-tower-fixture.mjs';
import{ascentObjectRows,ascentPhysicsRows,ascentRetention}from'../../lib/wumen-ascent-retention.mjs';
const captures=[];globalThis.__R157_ASCENT_CAPTURE=c=>captures.push(c);const c=captureGate();assert.equal(captures.length,1);const segment=captures[0],original=ascentRetention.current;
// Preserve the original root-wrapper, paths, state hashes and frozen golden.
// Only replace an obsolete top-level child slot with the unique named source owner.
const named=[];c.group.traverse(o=>{if(o.name==='wumen-folded-ascent')named.push(o);});assert.equal(named.length,1);const root=named[0].parent;
assert.equal(root,segment.parent);assert.equal(segment.group,named[0]);assert.equal(root.parent,c.group);assert.equal(root.children.length,1);assert.equal(segment.builder,c.builder);
assert.equal(segment.colliders.length,original.colliderCount);assert.equal(segment.walkables.length,original.walkableCount);
const start=c.builder.colliders.indexOf(segment.colliders[0]);assert.equal(start,70);assert.deepEqual(c.builder.colliders.slice(start,start+original.colliderCount),segment.colliders);
const extraSupports=c.builder.walkables.filter(w=>!segment.walkables.includes(w));assert.equal(extraSupports.length,3);assert.ok(extraSupports.every(w=>w.wumenLowerSlab&&w.rescue===false&&w.box.min.y===12.3&&w.box.max.y===12.3));
function exactAscent(){assert.deepEqual(ascentObjectRows(root,c.lib),original.objects);assert.deepEqual(ascentPhysicsRows(segment.colliders,segment.walkables),original.physics);}
test('R157 stable owner binds original ascent object+physics oracle unchanged',exactAscent);
test('original oracle rejects actual geometry mutation and restores cleanly',()=>{const y=root.position.y;root.position.y+=.001;assert.throws(exactAscent);root.position.y=y;exactAscent();});
test('original oracle rejects actual collider mutation and restores cleanly',()=>{const box=segment.colliders[0],x=box.min.x;box.min.x+=.001;assert.throws(exactAscent);box.min.x=x;exactAscent();});
test('original oracle rejects original support mutation and restores cleanly',()=>{const w=segment.walkables.find(w=>w.type==='box'),y=w.box.max.y;w.box.max.y+=.001;assert.throws(exactAscent);w.box.max.y=y;exactAscent();});
