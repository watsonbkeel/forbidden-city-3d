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
const T=await import(new URL('node_modules/three/build/three.module.js',root));
const centralModule=await import(new URL('src/scene/palace/QianqingCentralSetting.js',root));
const frame=JSON.parse(fs.readFileSync(new URL('tests/fixtures/r32-crest-scene-delta.json',root))).frame;
function captureLevel(root) {
 return root.children.map(object=>({name:object.name,matrix:(object.updateMatrix(),object.matrix.toArray()),
 attributes:Object.fromEntries(Object.entries(object.geometry.attributes).map(([key,a])=>[key,{itemSize:a.itemSize,normalized:a.normalized,type:a.array.constructor.name,bytes:Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength).toString('base64')}])),
 index:object.geometry.index?{type:object.geometry.index.array.constructor.name,bytes:Buffer.from(object.geometry.index.array.buffer,object.geometry.index.array.byteOffset,object.geometry.index.array.byteLength).toString('base64')}:null,
 groups:object.geometry.groups,drawRange:{start:object.geometry.drawRange.start,count:String(object.geometry.drawRange.count)}}));
}
const central=Object.fromEntries([['near',true],['far',false]].map(([kind,fine])=>[kind,captureLevel(centralModule.buildQianqingCentralLevel(new T.MeshBasicMaterial(),frame,fine))]));

fs.writeFileSync(process.argv[3],JSON.stringify({capture,runtimeValues:runtimeValues(capture),central,centralRuntimeValues:runtimeValues(central),frame}));
console.log(JSON.stringify({root:process.argv[2],meshes:capture.meshes.length,graph:capture.graph.length,colliders:capture.navigation.colliders.length,walkables:capture.navigation.walkables.length,bytes:capture.geometryBytes}));
