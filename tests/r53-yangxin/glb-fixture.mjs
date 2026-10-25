// Test-only actual GLB adapter. R88 adds raw primitives alongside retained
// Draco blocks; normal GLTFLoader handles both and preserves attributes/extras.
// No production override, network, normal rebuilding, or assertion changes.
import{readFileSync}from'node:fs';import{GLTFLoader}from'three/examples/jsm/loaders/GLTFLoader.js';import{cpuDracoLoader}from'../lib/cpu-draco.mjs';
let decoder;
export async function actualYangxinRoot(){
 decoder??=new GLTFLoader().setDRACOLoader(await cpuDracoLoader());
 const b=readFileSync(new URL('../../public/models/interiors/yangxin.glb',import.meta.url));
 return(await decoder.parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'')).scene;
}
