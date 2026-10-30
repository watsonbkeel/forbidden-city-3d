import {registerHooks} from 'node:module';
import {execFileSync} from 'node:child_process';
const path='src/scene/garden/CrossGardenPavilions.js',url=new URL('../../../'+path,import.meta.url).href;
const source=execFileSync('git',['show','ee0f31e1583ebe16dfc743f37cca0ecd6be42327:'+path],{encoding:'utf8'});
registerHooks({load(u,context,next){return u===url?{format:'module',source,shortCircuit:true}:next(u,context);}});
