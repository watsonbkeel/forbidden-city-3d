// Exact 3e9d5c92 controls source also exists in the complete 929e3467 frozen
// source closure. Keep that pre-recovery implementation independent of live
// controls, and pin its entire local dependency closure on both sides.
import fs from'node:fs';import{createHash}from'node:crypto';import{createR157FrozenSourceReader}from'../../../lib/r157-frozen-source-reader.mjs';
const root=new URL('../../../../',import.meta.url),reader=createR157FrozenSourceReader(root.pathname,'929e346745b7295ad1aae0caa581e8cdf22723ff'),blob=s=>createHash('sha1').update(`blob ${Buffer.byteLength(s)}\0`).update(s).digest('hex');
export const firstPersonURL=new URL('src/controls/FirstPerson.js',root);
export const originalFirstPersonSource=reader.read('src/controls/FirstPerson.js');
if(blob(originalFirstPersonSource)!=='15b05a5a85995abdf8f278b3141bfe0ca2998d22')throw Error('Original 3e9 controls bytes drift');
for(const [file,expected]of Object.entries({'src/config/constants.js':'be19c9ec34b54d7fe62a8d144baf1a020ec282ca','src/controls/InputTargets.js':'9ab49c306ccd2a132ecd4fdb78c08d11a40f5661','src/controls/VirtualJoystick.js':'d727b6f0ab075b1786a5f069e67451cf5947abec','data/anchors.json':'9f36b34c2e59b2cc77247cc4051f6f258208b5f7'}))if(blob(fs.readFileSync(new URL(file,root),'utf8'))!==expected)throw Error('Control baseline dependency drift: '+file);
const source=originalFirstPersonSource.replace(/(from\s*['"])([^'"]+)(['"])/g,(_,a,name,b)=>a+(name.startsWith('.')?new URL(name,firstPersonURL).href:import.meta.resolve(name))+b);
export const OriginalControls=(await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).FirstPersonControls;
