import{registerHooks}from'node:module';
const fixtureURL=new URL('../r164-ningshou-side-steps/fixture.mjs',import.meta.url).href,beforeURL=new URL('./before.mjs',import.meta.url).href;
registerHooks({load(u,c,n){const r=n(u,c);if(u===fixtureURL){const s=r.source.toString(),needle="import{ZoneBase}from'../../src/scene/zones/ZoneBase.js';";if(s.split(needle).length!==2)throw Error('fixture import count');return{...r,source:s.replace(needle,'import{BeforeZone as ZoneBase}from'+JSON.stringify(beforeURL)+';')}}return r}});
await import('../r164-ningshou-side-steps/component.test.mjs');
