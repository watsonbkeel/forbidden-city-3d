import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {registerHooks} from 'node:module';
registerHooks({load(url, context, next) {
 if (url.endsWith('.json')) return {format:'module', source:'export default '+fs.readFileSync(new URL(url),'utf8'), shortCircuit:true};
 return next(url, context);
}});
const root = pathToFileURL(process.argv[2] + '/');
const {PalaceBuilder} = await import(new URL('src/scene/PalaceBuilder.js', root));
const {captureJiaotaiScene} = await import(new URL('tests/lib/r27-jiaotai-capture.mjs', root));
function runtimeValues(value,path=[],found=[]){
 if(value===undefined)found.push({path:[...path],type:'undefined'});
 else if(Object.is(value,-0))found.push({path:[...path],type:'negative-zero'});
 else if(typeof value==='number'&&!Number.isFinite(value))found.push({path:[...path],type:String(value)});
 else if(value&&typeof value==='object')for(const key of Object.keys(value)){path.push(key);runtimeValues(value[key],path,found);path.pop();}
 return found;
}
const capture=captureJiaotaiScene(PalaceBuilder);
fs.writeFileSync(process.argv[3],JSON.stringify({capture,runtimeValues:runtimeValues(capture)}));
console.log(JSON.stringify({root:process.argv[2],meshes:capture.meshes.length,graph:capture.graph.length,colliders:capture.navigation.colliders.length,walkables:capture.navigation.walkables.length,bytes:capture.geometryBytes}));
