import {execFileSync} from 'node:child_process';
import {fixture,T} from '../r163-yinghua-stele/fixture.mjs';
import {CollisionManager} from '../../src/utils/Collision.js';
const base='53df463af8e762c74a24d291907aa8395a97e302';
export const originalZone=JSON.parse(execFileSync('git',['show',base+':data/zones/outer-west.json']));
async function old(name){const path='src/scene/palace/special/'+name+'.js',url=new URL('../../'+path,import.meta.url);let s=execFileSync('git',['show',base+':'+path],{encoding:'utf8'});s=s.replace(/from\s*'([^']+)'/g,(_,p)=>"from '"+(p==='three'?import.meta.resolve('three'):new URL(p,url).href)+"'");return import('data:text/javascript;base64,'+Buffer.from(s).toString('base64'));}
const gate=await old('YinghuaGate'),wall=await old('YinghuaWestEarHall'),stele=await old('YinghuaStelePavilion');
export function baselineTopologyFixture(){const f=fixture();try{gate.buildYinghuaGate(f.kit,originalZone.items[41]);wall.buildYinghuaWestEarCourtWalls(f.kit,originalZone.items[42],'outer-west',6.4);stele.buildYinghuaStelePavilion(f.kit,originalZone);f.kit.wall(256.02,450,297.78,450);f.kit.root.updateMatrixWorld(true);const cm=new CollisionManager();cm.addColliders(f.kit.colliders);cm.addWalkables(f.kit.walkables);return{...f,cm,THREE:T};}catch(e){f.dispose();throw e}}
