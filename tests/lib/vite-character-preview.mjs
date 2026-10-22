import { build } from 'vite';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const root=fileURLToPath(new URL('../../',import.meta.url));
const three=pathToFileURL(createRequire(import.meta.url).resolve('three')).href.replace('/three.cjs','/three.module.js');
const cache=new Map();
// Compile actual source with Vite's two build-time branches, then execute the
// output in Node. This proves branch/runtime semantics, NOT browser/GPU output.
export async function compiledCharacterPreview(dev){
 if(!cache.has(dev))cache.set(dev,(async()=>{
  const result=await build({root,configFile:false,envFile:false,logLevel:'silent',publicDir:false,
   define:{'import.meta.env.DEV':String(dev),'import.meta.env.PROD':String(!dev)},
   plugins:[{name:'character-preview-test-entry',resolveId:id=>(id==='character-preview-test-entry'||id.endsWith('/character-preview-test-entry'))?'\0character-preview-test-entry':null,
    load:id=>id==='\0character-preview-test-entry'?`export {CharacterSystem,CHARACTER_ROLLOUT_APPROVED} from ${JSON.stringify(root+'src/scene/characters/CharacterSystem.js')}; export {CharacterManager} from ${JSON.stringify(root+'src/scene/characters/CharacterManager.js')}; export {CHARACTER_REGISTRY} from ${JSON.stringify(root+'data/characters/index.js')}; export {SettingsMenu} from ${JSON.stringify(root+'src/ui/SettingsMenu.js')};`:null}],
   build:{write:false,minify:false,lib:{entry:'character-preview-test-entry',formats:['es'],fileName:'preview-fixture'},rollupOptions:{external:['three'],output:{paths:{three}}}}});
  const output=(Array.isArray(result)?result[0]:result).output, code=output.find(x=>x.type==='chunk').code;
  const module=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
  return{code,module};
 })());
 return cache.get(dev);
}
