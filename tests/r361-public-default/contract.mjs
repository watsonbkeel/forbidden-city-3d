import assert from 'node:assert/strict';
import{assertHealthy}from '../r360-normal-user/normal-contract.mjs';
export const PUBLIC_LOOK_PLAN=Object.freeze([{name:'native-look-west',dx:160,image:'default-native-west'},{name:'native-look-east-a',dx:-160},{name:'native-look-east-b',dx:-160,image:'default-native-east'},{name:'native-look-restore',dx:160}].map(Object.freeze));
export function assertDefaultBuild(build,commit){assert.match(commit,/^[a-f0-9]{40}$/);assert.equal(build.sourceCommit,commit);assert.equal(build.sourceDirty,false);assert.equal(build.release,'R360');assert.equal(build.buildId,'R360-f5c900666236');assert.equal(build.sourceFingerprint,'17117a2675738ccd340981c778d5f1faba3fbb40b4dfe666fc19d2841a931c92');assert.equal(build.base,'/forbidden-city-3d/');}
export function assertPublicNetwork(r){assertHealthy(r);for(const k of['originalArtworkRequests','serverBad','trapHits'])assert.deepEqual(r[k],[],k);}
