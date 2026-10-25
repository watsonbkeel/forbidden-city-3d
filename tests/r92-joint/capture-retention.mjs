import {execFileSync} from 'node:child_process';
if(execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()!=='9cf1460148124b56a9d485197f7f2af4d24dd312')throw Error('R92 baseline capture requires exact frozen R93');
execFileSync('git',['diff','--exit-code','--','src/scene/PalaceBuilder.js','data/zones/axis-courts.json']);
import fs from 'node:fs';import {baoheFirewallWorld} from './fixture.mjs';import {CollisionManager} from '../../src/utils/Collision.js';
const W=baoheFirewallWorld(),cm=new CollisionManager();cm.rivers=[];cm.addColliders(W.builder.colliders);cm.addWalkables(W.builder.walkables);
const westGround=[];for(const x of[5,20,27,30,36,42])for(const z of[90,120,150,165,175])westGround.push({x,z,y:cm.getGroundHeight(x,z,8,.6)});
fs.writeFileSync('reports/r92-joint/baseline-retention.json',JSON.stringify({rects:W.builderData.rects,north:W.builder.baoheNorthTiers,westColliders:W.builder.colliders.filter(c=>c.min.x>0),westGround},null,2));
