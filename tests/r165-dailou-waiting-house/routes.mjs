import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {pathToFileURL} from 'node:url';
import {FirstPersonControls} from '../../src/controls/FirstPerson.js';
import {captureNativeGround} from './native-ground-trace.mjs';import {persistNativeReplay} from './native-replay-evidence.mjs';
import assert from 'node:assert/strict';import crypto from 'node:crypto';
import {sideGateGeometry} from '../../src/scene/palace/special/SideGateProfiles.js';
import {replayKunning} from '../lib/kunning-walk.mjs';
import {withBoundedQaMocks} from '../lib/bounded-qa-clock.mjs';
import {assertNativeStart,assertNativeFrames} from './route-guards.mjs';
let nativeEvidenceIndex=0;const evidenceRoot=process.env.DAILOU_EVIDENCE_DIR||os.tmpdir();fs.mkdirSync(evidenceRoot,{recursive:true});const evidenceDir=fs.mkdtempSync(path.join(evidenceRoot,'d14-native-'));export const evidenceDirectory=evidenceDir;const evidenceURL=pathToFileURL(evidenceDir+path.sep);
const pairs=[[10,false],[10,true],[60,false],[60,true]];
export function descriptors(axis){
 const groups={rearLeft:[],jiuqing:[],jingyunPortals:[],approach:[]};
 for(const lane of[-.85,0,.85])for(const[fps,sprint]of pairs)for(const reverse of[false,true]){const x=-76.4+lane;groups.rearLeft.push({name:'original-rear-left',lane,fps,sprint,reverse,startFeet:0,expected:true,points:reverse?[[x,139.4],[x,106.6],[x,139.4]]:[[x,106.6],[x,139.4],[x,106.6]]});}
 for(const[name,points]of[['inner-left',[[-62.4,199],[-62.4,209],[-62.4,199]]],['jingyun',[[-120,174.1],[-96,174.1],[-120,174.1]]],['south-edge',[[-95,196.8],[-80,196.8],[-95,196.8]]]])for(const[fps,sprint]of[[10,false],[60,true]])groups.jiuqing.push({name:'original-'+name,points,fps,sprint,startFeet:0,expected:true});
 for(const[fps,sprint]of[[10,false],[60,true]])groups.jiuqing.push({name:'original-porch',points:[[-87.3,196.8],[-87.3,200.2],[-87.3,196.8]],fps,sprint,startFeet:0,expected:true,feetGroundBound:.3});
 for(const[name,points,startFeet]of[['closed-front',[[-87.3,200.2],[-87.3,202.5]],.2],['closed-back',[[-87.3,206],[-87.3,202.5]],0]])groups.jiuqing.push({name:'original-'+name,points,fps:30,sprint:false,startFeet,expected:false});
 const g=sideGateGeometry(axis.items[4]);assert.equal(g.profile,'jingyun');
 const front=g.ramps.find(r=>r.side==='front'),rear=g.ramps.find(r=>r.side==='rear');
 for(const portal of g.portals)for(const lane of[-1,0,1])for(const[fps,sprint]of pairs){const x=portal.centerX+lane*(portal.clearWidth/2-.85),zs=[front.zToe-1,front.zTop,0,rear.zTop,rear.zToe+1,rear.zTop,0,front.zTop,front.zToe-1];groups.jingyunPortals.push({name:'additional-jingyun-portal',bay:portal.bay,lane,fps,sprint,startFeet:0,expected:true,points:zs.map(z=>g.toWorld(x,z))});}
 for(const[fps,sprint]of pairs)groups.approach.push({name:'fitted-empty-front-approach',points:[[-104.7,155.2],[-83.8,155.2],[-104.7,155.2]],fps,sprint,startFeet:0,expected:true});
 assert.equal(groups.rearLeft.length,24);assert.equal(groups.jiuqing.length,10);assert.equal(groups.jingyunPortals.length,36);assert.equal(groups.approach.length,4);return groups;
}
export function replay(t,W,descriptor){
 const {points,fps,sprint,startFeet,expected}=descriptor;
 const nativeStart=descriptor.newContacts?assertNativeStart(W.cm,descriptor):null;
 const run=()=>withBoundedQaMocks(t,c=>replayKunning(c,W,points,{fps,sprint,startFeet,recordFrames:true}));
 const observation=descriptor.newContacts?captureNativeGround(FirstPersonControls.prototype,W.cm,run):null,q=observation?observation.value:run();
 let nativeEvidence=null;
 if(observation)nativeEvidence=persistNativeReplay(evidenceURL,nativeEvidenceIndex++,descriptor,q,observation);
 assert.equal(q.arrived,expected,'native controller '+JSON.stringify({descriptor,end:q.end,stuck:q.stuckAt}));
 if(descriptor.feetGroundBound!==undefined)for(const f of q.frames)assert.ok(Math.abs(f.feet-f.ground)<=descriptor.feetGroundBound,'original porch feet/ground assertion');
 for(const f of q.frames)assert.ok([f.x,f.z,f.feet,f.ground].every(Number.isFinite));
 const nativeFrames=descriptor.newContacts?assertNativeFrames(W.cm,descriptor,q,observation):null;
 const {frames,...fields}=q;return {descriptor,output:fields,...(descriptor.newContacts?{nativeStart,nativeFrames,nativeEvidence}:{}),frames:frames.length,frameSHA256:crypto.createHash('sha256').update(JSON.stringify(frames)).digest('hex')};
}
export function runOldGroup(t,W,list){return list.map(d=>replay(t,W,d));}
export function highWallNegatives(W){return[-86,-67].map(x=>{const blocked=W.cm.checkCollision(new W.THREE.Vector3(x,6,123),.5);assert.equal(blocked,true,'original elevated item17 wall remains solid');return{x,y:6,z:123,blocked};});}
export function newDescriptors(cm){
 const positives=[],negatives=[],x=-94.6;
 for(const[fps,sprint]of pairs){for(const points of[[[x,156],[x,151],[x,156]],[[x,151],[x,156],[x,151]],[[-104.7,151],[-84.2,151],[-104.7,151]]]){const startFeet=points[0][1]===151?.25:0;const d={name:'fitted-new-porch',points,fps,sprint,startFeet,expected:true,newContacts:{requirePlatform:true}};assertNativeStart(cm,d);positives.push(d);}}
 for(const fps of[30,60]){negatives.push({name:'fitted-closed-front',points:[[x,151],[x,148.5]],fps,sprint:true,startFeet:.25,expected:false,newContacts:{requirePlatform:true}});negatives.push({name:'fitted-closed-west',points:[[-81.8,147],[-85,147]],fps,sprint:true,startFeet:0,expected:false,newContacts:{requirePlatform:false}});}
 assert.equal(positives.length,12);assert.equal(negatives.length,4);return{positives,negatives};
}
