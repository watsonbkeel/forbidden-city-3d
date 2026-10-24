import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {library} from './lib/inner-palace-fixture.mjs';
import {buildDuanmenBackdrop, DUANMEN_FIT} from '../src/scene/palace/special/DuanmenBackdrop.js';
import {FLIGHT_BOUNDS} from '../src/scene/flight/FlightEnvelope.js';
import {Environment} from '../src/scene/Environment.js';

test('R71 fit is explicit, distant beyond walking and flight, finite and not a destination',()=>{
 const g=buildDuanmenBackdrop(library());g.updateMatrixWorld(true);const box=new T.Box3().setFromObject(g);
 assert.ok(box.max.z<FLIGHT_BOUNDS.minZ-5);assert.equal(g.userData.enterable,false);assert.equal(g.userData.measured,false);
 assert.equal(g.userData.entityId,'FC-88674ADACB');assert.equal(g.userData.stage,'DISTANT_EXTERIOR_PARTIAL');
 assert.equal(DUANMEN_FIT.roof.type,'xieshan');assert.equal(DUANMEN_FIT.roof.layers,2);
 assert.equal(g.getObjectByName('duanmen-plaque'),undefined);assert.equal(g.getObjectByName('duanmen-portal'),undefined);
 g.traverse(n=>{if(n.geometry)assert.ok([...n.geometry.attributes.position.array].every(Number.isFinite));assert.equal(n.userData.collider,undefined)});
});
test('R71 environment owns toggle and teardown without changing navigation',()=>{
 const lib=library(),scene=new T.Scene(),env=new Environment(scene,{},lib);env.setupDuanmenBackdrop();
 assert.equal(env.duanmenBackdrop.visible,true);env.setDuanmenVisible(false);assert.equal(env.duanmenBackdrop.visible,false);env.setDuanmenVisible(true);assert.equal(env.duanmenBackdrop.visible,true);
 let disposed=0;env.duanmenBackdrop.traverse(n=>n.geometry?.addEventListener('dispose',()=>disposed++));env.dispose();assert.ok(disposed>0);assert.equal(scene.children.length,0);
});

import {createDOM} from './lib/ui-dom.mjs';
import {SettingsMenu} from '../src/ui/SettingsMenu.js';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
test('R71 settings exposes honest boundary note and a reversible explicit toggle',t=>{
 const oldD=globalThis.document,oldW=globalThis.window,dom=createDOM();globalThis.document=dom.document;globalThis.window=dom.window;
 const env=new Environment(new T.Scene(),{},library());env.setupDuanmenBackdrop();const menu=new SettingsMenu(document.body);menu.init({onDuanmenToggle:v=>env.setDuanmenVisible(v)});
 t.after(()=>{menu.dispose();env.dispose();globalThis.document=oldD;globalThis.window=oldW});
 const check=menu.panel.querySelector('#duanmen-backdrop-toggle'),note=menu.panel.querySelector('#duanmen-backdrop-note');assert.ok(check);assert.match(note.textContent,/尚不可进入/);assert.match(note.textContent,/非测绘/);
 check.checked=false;dom.dispatch(check,'change');assert.equal(env.duanmenBackdrop.visible,false);check.checked=true;dom.dispatch(check,'change');assert.equal(env.duanmenBackdrop.visible,true);
});
test('R71 all route, map, NPC and spawn inputs remain exact R70 bytes',()=>{
 const base='2b8e4333eb99ae95b73dba4533364f9f9a92e4a9';
 for(const p of ['src/config/constants.js','src/config/initialView.js','src/ui/Minimap.js','src/ui/PlaceCatalog.js','src/scene/flight/FlightEnvelope.js','src/scene/flight/FlightTour.js','src/utils/Collision.js','data/characters/actors.json']){
  assert.ok(fs.readFileSync(p).equals(execFileSync('git',['show',base+':'+p])),p);
 }
});
import {TextureLibrary,TEXTURE_SPECS} from '../src/utils/TextureLibrary.js';
test('R71 real shared library and owned backdrop materials release exactly once',()=>{
 const lib=new TextureLibrary();for(const n of Object.keys(TEXTURE_SPECS))lib.colors.set(n,new T.Texture({width:16,height:16}));
 const env=new Environment(new T.Scene(),{},lib);env.setupDuanmenBackdrop();const owned=new Set(),shared=new Set(),geometries=new Set();
 env.duanmenBackdrop.traverse(n=>{if(n.geometry)geometries.add(n.geometry);for(const m of [...(Array.isArray(n.material)?n.material:n.material?[n.material]:[]),...(n.userData.ownedMaterials??[])])(lib.owns(m)?shared:owned).add(m)});
 const counts=new Map();for(const r of [...owned,...shared,...geometries]){counts.set(r,0);r.addEventListener('dispose',()=>counts.set(r,counts.get(r)+1))}
 env.dispose();env.dispose();assert.ok([...owned,...geometries].every(r=>counts.get(r)===1));assert.ok([...shared].every(r=>counts.get(r)===0));lib.dispose();assert.ok([...shared].every(r=>counts.get(r)===1));
});
