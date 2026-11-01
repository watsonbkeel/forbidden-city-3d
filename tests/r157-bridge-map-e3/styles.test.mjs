import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../../style.css',import.meta.url),'utf8');
// Declaration-level regression, not a browser layout or touch-device acceptance.
// Removing the facility selectors while retaining place styles must fail.
function declarations(selector){
 const result={};
 for(const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)){
  const selectors=match[1].replace(/\/\*[\s\S]*?\*\//g,'').trim().split(',').map(s=>s.trim());
  if(!selectors.includes(selector))continue;
  for(const part of match[2].split(';')){const i=part.indexOf(':');if(i>=0)result[part.slice(0,i).trim()]=part.slice(i+1).trim();}
 }
 return result;
}
for(const [name,oldSelector,newSelector,properties] of [
 ['heading','#minimap #place-list h2','#minimap #bridge-facilities h2',['color','font-size','margin','flex-basis']],
 ['section layout','#minimap #place-list','#minimap #bridge-facilities',['display','flex-wrap','gap']],
 ['directory flow','#minimap #place-directory','#minimap #bridge-facility-directory',['display','flex-wrap','gap','width','max-height','overflow-y','overscroll-behavior','touch-action']],
 ['buttons','#minimap #place-list button','#minimap #bridge-facility-directory button',['min-width','min-height','padding','border','border-radius','background','color','font-size','line-height','overflow-wrap','cursor','touch-action']],
 ['filtered hidden buttons','#minimap #place-directory button[hidden]','#minimap #bridge-facility-directory button[hidden]',['display']],
])test(`bridge ${name} uses the existing place directory style declarations`,()=>{
 const expected=declarations(oldSelector),actual=declarations(newSelector);
 for(const p of properties){assert.notEqual(expected[p],undefined,`existing ${p}`);assert.equal(actual[p],expected[p],`${newSelector}: ${p}`);}
});
