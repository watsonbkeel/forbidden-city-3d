import test from 'node:test';
import assert from 'node:assert/strict';
import { PlaceCatalog } from '../src/ui/PlaceCatalog.js';
import { PlaceInfoPanel } from '../src/ui/PlaceInfoPanel.js';
import { createDOM } from './lib/ui-dom.mjs';
test('Qinan actual place card explains virtual side entry without changing the exterior teleport landing or implying museum opening',t=>{
 const dom=createDOM(),saved=globalThis.document;globalThis.document=dom.document;t.after(()=>{globalThis.document=saved});
 const catalog=new PlaceCatalog(),place=catalog.get('qinan'),panel=new PlaceInfoPanel();t.after(()=>panel.dispose());
 assert.equal(catalog.places.length,159);assert.equal(place.modelExperience.navigationMode,'exterior-view');assert.equal(place.modelExperience.actionLabel,'前往外观观览点');assert.equal(place.siteAccess.status,'not-verified');assert.equal(place.siteAccess.checkedAt,null);
 panel.render({place,name:place.name,sources:catalog.sourcesFor(place),canTravel:true,onTravel(){}});
 const text=panel.element.textContent;assert.match(text,/两侧台阶/);assert.match(text,/虚拟侧门/);assert.match(text,/原路返回/);assert.match(text,/不代表现场开放许可/);assert.doesNotMatch(text,/未开放室内路线|不增加室内通行/);
});
