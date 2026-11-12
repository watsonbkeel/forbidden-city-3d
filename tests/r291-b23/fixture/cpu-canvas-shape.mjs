// CPU geometry diagnostic only. Retains inner-palace-fixture's no-raster context
// convention; adds only gradient return API shape used by real generators.
// Based on tests/current-state/r35-texture-scale.test.mjs gradient fixture.
// No pixels, font metrics, texture fidelity or WebGL capability are simulated.
export const CPU_CANVAS_SCOPE='NO_RASTER_API_SHAPE_ONLY';
const gradient=()=>({addColorStop(){}});
const ctx=new Proxy({}, {
 get:(_,key)=>key==='createLinearGradient'||key==='createRadialGradient'
   ?gradient:()=>({data:[]}),
 set:()=>true,
});
if(globalThis.document!==undefined)throw Error('CPU canvas adapter must precede existing document fixture');
globalThis.document={
 createElement:()=>({getContext:kind=>kind==='2d'?ctx:null,width:0,height:0}),
 createElementNS:()=>({addEventListener(){},removeEventListener(){}}),
};
