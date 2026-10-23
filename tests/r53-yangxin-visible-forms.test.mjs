import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {CourtKit} from '../src/scene/palace/kit.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {augmentRemainingHall,resolveRemainingProfile} from '../src/scene/palace/special/RemainingResidentialHalls.js';
import {YANGXIN_WEST_ROOM_PLAN as P} from '../src/scene/palace/special/YangxinWestWarmRooms.js';
const item=JSON.parse(readFileSync(new URL('../docs/current-state/r48-remaining/residential-scope.json',import.meta.url))).find(r=>r.name==='养心殿').baselineItem;
function fixture(){const kit=new CourtKit(library(),'west-six'),b=kit.hall(item);augmentRemainingHall(kit,item,b,resolveRemainingProfile('west-six',item));kit.root.updateWorldMatrix(true,true);return{kit,...b};}
function roles(f,role){const a=[];f.traverse(o=>{if(o.userData.role===role)a.push(o);});return a;}
test('R53 visible-form slice is explicitly partial and preserves the frozen measured/fit plan',()=>{
 assert.equal(P.stage,'SOURCE_BASED_BASIC_FORMS_PARTIAL_NOT_FULL_RESTORATION');assert.equal(P.layoutCheckpoint,'03dcb64842974642e3fe46bd5ebfba89dc68e9b7');assert.equal(P.rearPolicy,'UNBUILT_NO_DEFAULT_FURNITURE');assert.equal(P.sources.photos.captureDate,null);assert.deepEqual(P.route,[[6,-.84],[7.5,-.84],[7.5,-4.5],[10.2,-4.5],[14,-3.2],[14,-1.1],[16.3,-1.1],[16.3,-3.5]]);
});
test('R53 photo-visible furniture uses basic frame/leg/cloth forms, not solid desks or invented fine decoration',()=>{
 const {f}=fixture();assert.equal(roles(f,'r53-qinzheng-low-side-table').length,2);assert.equal(roles(f,'r53-sanxi-low-reading-desk').length,1);assert.equal(roles(f,'r53-fitted-table-leg').length,12);assert.equal(roles(f,'r53-qinzheng-round-bolster').length,2);assert.equal(roles(f,'r53-sanxi-round-bolster').length,2);assert.equal(roles(f,'r53-qinzheng-red-kang-cover').length,1);assert.equal(roles(f,'r53-sanxi-blue-kang-cover').length,1);assert.equal(roles(f,'r53-qinzheng-kang-panel').length,3);assert.equal(roles(f,'r53-sanxi-interior-window-casing').length,1);
 for(const role of['r53-qinzheng-kang-seat-back','r53-sanxi-east-side-seat-back']){const m=roles(f,role)[0];assert.equal(m.geometry.type,'ExtrudeGeometry');assert.equal(m.userData.representation,'PHOTO_CONTOUR_SIMPLIFICATION_NOT_CARVING_REPLICA');}
 const group=roles(f,'r53-yangxin-west-warm-rooms')[0];group.traverse(m=>{if(m.isMesh){assert.equal(m.material.map,null);assert.notEqual(m.userData.calligraphyReplica,true);assert.ok(!/porcelain|flower|buddha|meiwu/i.test(m.name));}});
});
test('R53 material palette separates plaster, wooden frames, cream/yellow upholstery and red/blue kang coverings',()=>{
 const{kit}=fixture(),own=kit.owned.filter(m=>m.name.startsWith('r53-yangxin-')),colors=new Set(own.map(m=>m.color.getHexString()));assert.ok(colors.size>=8);assert.ok(own.every(m=>m.roughness>=.5&&m.metalness===0));assert.ok(own.every(m=>m.map===null));
});
