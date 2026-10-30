// Narrow historical R66 acceptance projection. Never projects physics, other
// buildings, leaves, roof, canopy, plaque, knees or interior inventory.
import assert from'node:assert/strict';import fs from'node:fs';import{meshRow,hash}from'../../lib/r66-h/fixture.mjs';
const receipt=JSON.parse(fs.readFileSync(new URL('./legacy-window-projection.json',import.meta.url)));
export function validatedChonghuaWindows(frame){
 assert.equal(frame.userData.structure?.profile,'chonghua-middle-name-fit');
 const groups=frame.children.filter(g=>g.name==='r48-residential-window'&&g.userData.side===-1),candidate=!!frame.userData.chonghuaSouthVisual,expected=receipt[candidate?'candidate':'parent'];assert.equal(groups.length,4);
 if(candidate){assert.equal(frame.userData.chonghuaSouthVisual.windowCount,4);assert.equal(frame.userData.chonghuaSouthVisual.openLeafCount,0);assert.equal(frame.userData.chonghuaSouthVisual.wholePalaceAccepted,false);}
 const objects=[];groups.forEach((g,i)=>{assert.equal(g.userData.bayIndex,expected[i].bayIndex);assert.equal(g.children.length,expected[i].meshCount);assert.equal(hash(g.children.map(meshRow)),expected[i].sha256,'exact authorized window meshRow records changed');if(candidate)assert.equal(g.userData.chonghuaWindow?.panelCount,2);objects.push(...g.children)});return new Set(objects);
}
export function withoutChonghuaWindows(frame,meshes){const scope=validatedChonghuaWindows(frame);return meshes.filter(m=>!scope.has(m));}
export function historicalChonghuaMeshCount(frame,count){const scope=validatedChonghuaWindows(frame);return count-scope.size+36;}
