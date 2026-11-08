import fs from 'node:fs';import {registerHooks} from 'node:module';import * as T from 'three';
import {CourtKit} from '../../src/scene/palace/kit.js';import {library} from '../lib/inner-palace-fixture.mjs';
import {augmentRemainingHall,resolveRemainingProfile} from '../../src/scene/palace/special/RemainingResidentialHalls.js';
import {CollisionManager} from '../../src/utils/Collision.js';import {actualYangxinRoot} from '../r53-yangxin/glb-fixture.mjs';import {canvas} from '../r164-yangxin-east-panels/fixture.mjs';
const hook=registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c)}});const {InteriorLoader}=await import('../../src/scene/interior/InteriorLoader.js');hook.deregister();
export const cfg=JSON.parse(fs.readFileSync(new URL('../../data/interiors/yangxin.json',import.meta.url)));
export const item=JSON.parse(fs.readFileSync(new URL('../../data/zones/west-six.json',import.meta.url))).items.find(r=>r.kind==='hall'&&r.name==='养心殿');
export function host(LoaderClass=InteriorLoader){const restore=canvas(),kit=new CourtKit(library(),'west-six'),b=kit.hall(item);augmentRemainingHall(kit,item,b,resolveRemainingProfile('west-six',item));const scene=new T.Scene();scene.add(kit.root);kit.root.updateMatrixWorld(true);const cm=new CollisionManager();cm.addColliders(kit.colliders,'west-six');cm.addWalkables(kit.walkables,'west-six');const loader=new LoaderClass(scene,cm,{registry:{yangxin:cfg}});return {THREE:T,kit,scene,cm,loader,async load(){const root=await actualYangxinRoot();loader.gltf.load=(_u,ok)=>ok({scene:root});const ok=await loader.load('yangxin');if(ok)loader.update({x:cfg.frame.x,z:cfg.frame.z},performance.now()+1000);return {root,ok}},dispose(){loader.dispose();kit.dispose(kit.root);restore()}}}
export {actualYangxinRoot};

export {InteriorLoader};
