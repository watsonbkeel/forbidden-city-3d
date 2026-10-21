import test from 'node:test';
import assert from 'node:assert/strict';
import {buildWorld,loadZoneJsons} from './lib/world.mjs';
import {setupMap,mapPointer} from './lib/map-fixture.mjs';
import {FLIGHT_BOUNDS} from '../src/scene/flight/FlightEnvelope.js';
const zoneOrder=['axis-courts','east-six','west-six','ningshou','outer-east','outer-west','garden'];
let world;
async function fixture(t,{mobile=false}={}) {
 const all=loadZoneJsons();world??=await buildWorld({statics:false,zones:zoneOrder.map(id=>all.find(z=>z.json.id===id))});
 const s=await setupMap(t,{mobile}),m=s.map;m.items=world.mapItems;
 m.worldBounds={...FLIGHT_BOUNDS};m.mapHeight=Math.round(m.mapSize*(FLIGHT_BOUNDS.maxZ-FLIGHT_BOUNDS.minZ)/(FLIGHT_BOUNDS.maxX-FLIGHT_BOUNDS.minX)*.82);m.scaleX=m.mapSize/(FLIGHT_BOUNDS.maxX-FLIGHT_BOUNDS.minX);m.scaleZ=m.mapHeight/(FLIGHT_BOUNDS.maxZ-FLIGHT_BOUNDS.minZ);
 m.renderBase();m.toggle();m.resetView();m.hasTeleportTarget=()=>true;
 const item=m.items.find(i=>i.name==='延禧宫'),point=m.worldToMap(item.x,item.z),id=m.placeCatalog.forMapItem(item,m.items).id;
 const tap=()=>m.handleMapClick(m.mapToScreen(point.x,point.y));
 return{...s,item,point,id,tap};
}
for(const mobile of[false,true])test(`unlabelled real Yanxi footprint opens correct card in ${mobile?'touch':'desktop'} map without travel`,async t=>{
 const s=await fixture(t,{mobile}),m=s.map;
 assert.equal(m.labels.some(l=>l.name==='延禧宫'),false,'real production decluttering reproduction');
 assert.equal(m.placeFootprints.filter(p=>p.placeId===s.id).length,2,'ruin and protective pool share one identity');
 s.tap();assert.equal(m.selectedPlaceId,s.id);assert.deepEqual(s.teleports,[]);
 assert.match(m.placePanel.element.textContent,/灵沼轩/);assert.equal(m.container.querySelector('#place-travel').textContent,'查看现存遗构');
 m.backToMap();assert.equal(m.detailVisible,false);m.view.k=4;m.view.cx=s.point.x;m.view.cy=s.point.y;s.tap();assert.equal(m.selectedPlaceId,s.id);
 m.container.querySelector('#place-travel').click();assert.deepEqual(s.teleports,['延禧宫']);
});
test('visible text keeps precedence; blank ground and overlapping different footprints do not guess',async t=>{
 const s=await fixture(t),m=s.map;
 m.labels.push({name:'太和殿',placeId:'taihe',...s.point,width:20,height:20});s.tap();assert.equal(m.selectedPlaceId,'taihe');m.backToMap();m.labels.pop();
 const fp=m.placeFootprints.find(p=>p.placeId===s.id);m.placeFootprints.push({...fp,name:'太和殿',placeId:'taihe'});s.tap();assert.equal(m.detailVisible,false);m.placeFootprints.pop();
 m.handleMapClick(m.mapToScreen(5,5));assert.equal(m.detailVisible,false);assert.deepEqual(s.teleports,[]);
});
test('duplicate names, changed source center and unknown items cannot borrow a footprint card',async t=>{
 const s=await fixture(t),m=s.map;
 for(const items of[[...world.mapItems,{...s.item}],world.mapItems.map(i=>i===s.item?{...i,x:i.x+2}:i),[{...s.item,name:'未绑定建筑'}]]){
  m.items=items;m.renderBase();assert.equal(m.placeFootprints.some(p=>p.placeId===s.id),false);
 }
});
test('rerender replaces footprint list and compact/closed/disposed maps cannot select',async t=>{
 const s=await fixture(t),m=s.map,n=m.placeFootprints.length;m.renderBase();assert.equal(m.placeFootprints.length,n);
 m.setCompact(true);s.tap();assert.equal(m.detailVisible,false);m.setCompact(false);m.toggle();s.tap();assert.equal(m.detailVisible,false);m.toggle();m.dispose();s.tap();assert.equal(m.detailVisible,false);
});
for(const gesture of['drag','pinch','cancel'])test(`${gesture} on a real footprint cannot accidentally open card`,async t=>{
 const s=await fixture(t,{mobile:true}),m=s.map;m.view.k=4;m.view.cx=s.point.x;m.view.cy=s.point.y;
 const p=m.mapToScreen(s.point.x,s.point.y),r=m.canvas.getBoundingClientRect(),x=p.x+r.left,y=p.y+r.top;
 mapPointer(s,'pointerdown',1,x,y);
 if(gesture==='drag')mapPointer(s,'pointermove',1,x+30,y);
 if(gesture==='pinch'){mapPointer(s,'pointerdown',2,x+10,y);mapPointer(s,'pointerup',2,x+10,y);}
 mapPointer(s,gesture==='cancel'?'pointercancel':'pointerup',1,x,y);
 assert.equal(m.detailVisible,false);assert.deepEqual(s.teleports,[]);
});
test('native-style pointer tap on footprint opens card while held walking input continues',async t=>{
 const s=await fixture(t),m=s.map;m.view.k=4;m.view.cx=s.point.x;m.view.cy=s.point.y;
 const p=m.mapToScreen(s.point.x,s.point.y),r=m.canvas.getBoundingClientRect();s.key('keydown','KeyW');s.frame(200);const before=s.logical();
 mapPointer(s,'pointerdown',1,p.x+r.left,p.y+r.top);mapPointer(s,'pointerup',1,p.x+r.left,p.y+r.top);assert.equal(m.selectedPlaceId,s.id);s.frame(200);assert.ok(s.logical().distanceTo(before)>0);assert.deepEqual(s.teleports,[]);
});
