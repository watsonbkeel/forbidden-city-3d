/** Portable R48 independent final-six audit, original product 8b974ee.
 * Architectural kit/world tests intentionally use library() from the stub
 * fixture. Real Draco GLB decoding does NOT make that a real TextureLibrary
 * rendering test. See docs/current-state/r48-independent-ningshou-final/REVIEW.md.
 * Test execution writes no reports or production files.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
import * as THREE from 'three';
import {CourtKit} from '../src/scene/palace/kit.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {PLAYER} from '../src/config/constants.js';
import {replayTerrace} from './lib/terrace-walk.mjs';
import {resolveRemainingProfile,buildRemainingHall} from '../src/scene/palace/special/RemainingNingshouHalls.js';
import {visibleTriangleIndex,assertVisibleBody} from './r48-independent-ningshou-final-visible-body.mjs';
const hook=registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c);}});
const {buildWorld}=await import('./lib/world.mjs');
const W=await buildWorld();hook.deregister();
const scope=JSON.parse(readFileSync(new URL('./fixtures/r48-independent-ningshou-final/scope.json',import.meta.url))),results=[];
const dedup=ps=>ps.filter((p,i)=>!i||Math.hypot(p[0]-ps[i-1][0],p[1]-ps[i-1][1])>.001);
for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true])test(`R48 YangXing fitted loft bearings preserve normal entrance, west-room and Moyun side doors fps=${fps} sprint=${sprint} backward=${backward}`,t=>{const item=scope.find(s=>s.name==='养性殿').baselineItem,p=resolveRemainingProfile('ningshou',item),kit=new CourtKit(library(),'ningshou'),{f}=buildRemainingHall(kit,item,p);f.updateMatrixWorld(true);const index=visibleTriangleIndex(f),world=([x,z])=>{const v=f.localToWorld(new THREE.Vector3(x,0,z));return[v.x,v.z];},approach=p.portals.find(q=>q.side==='front').approachPoints.map(q=>[q.x,q.z]),local=[[0,-3],[0,-2],[10,-2],[10,4],[10,8],[13.4,8],[13.4,2.9],[7.3,2.9],[7.3,8],[13.4,8],[13.4,5],[16,5],[13.4,5],[10,5],[10,-4],[13.4,-4],[16,-4],[13.4,-4],[10,-4],[10,-2],[0,-2],[0,-3]],points=dedup([...approach,...local.map(world),...approach.slice().reverse()]);try{const r=replayTerrace(t,W,points,{fps,sprint,backward,recordFrames:true});assert.equal(r.arrived,true,JSON.stringify({...r,frames:undefined}));assert.equal(r.startFeet,0);assert.equal(r.end[2],0);const stats={};let triangleChecks=0;for(const frame of r.frames)triangleChecks+=assertVisibleBody(W.cm,index,frame,stats);results.push({name:p.name,kind:'fitted-loft-bearing-open-room-loop',fps,sprint,backward,result:'pass',checkedFrames:r.frames.length,triangleChecks,productionHeight:PLAYER.HEIGHT,productionStepUp:PLAYER.STEP_UP,radius:'production default, unchanged',...stats});}finally{kit.dispose(f);}});
