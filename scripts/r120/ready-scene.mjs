import path from 'node:path';import fs from 'node:fs';import {createHash} from 'node:crypto';import {fileURLToPath,pathToFileURL} from 'node:url';import * as T from 'three';
import {installCpuPlatform} from '../r115-fix/cpu-platform.mjs';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export async function readyScene(quality='high',sourceRoot=root){
 sourceRoot=path.resolve(sourceRoot);const imp=p=>import(pathToFileURL(sourceRoot+'/'+p));
 const {TextureLibrary,TEXTURE_SPECS}=await imp('src/utils/TextureLibrary.js'),{setBuildingDetailQuality}=await imp('src/render/BuildingDetailQuality.js'),{PalaceBuilder}=await imp('src/scene/PalaceBuilder.js'),{PALACE_LAYOUT}=await imp('src/scene/Layout.js');
 const platform=await installCpuPlatform(sourceRoot),manager=new T.LoadingManager(),errors=[];let pending=0,requests=0;const start=manager.itemStart.bind(manager),end=manager.itemEnd.bind(manager);
 manager.itemStart=url=>{pending++;requests++;start(url);};manager.itemEnd=url=>{pending--;end(url);};manager.onError=url=>errors.push(url);
 manager.setURLModifier(url=>{if(url.startsWith('/textures/'))return sourceRoot+'/public'+url;if(url.startsWith(sourceRoot+'/public/'))return url;throw Error('Unsupported diagnostic local image URL '+url);});
 const library=new TextureLibrary({quality:'sd',baseUrl:sourceRoot+'/public/textures/sd/',manager});setBuildingDetailQuality(library,quality);await library.load();
 if(library.loadedFromFile.size!==22||library.normals.size!==21)throw Error('Incomplete real file texture decode');
 const keys=new Set(),material=library.material.bind(library);library.material=(key,...args)=>{if(!Object.hasOwn(TEXTURE_SPECS,key))throw Error('Unknown real TextureLibrary key '+key);keys.add(key);return material(key,...args);};
 const scene=new T.Scene(),builder=new PalaceBuilder(scene,library),constructionStart=performance.now();builder.buildComplex(PALACE_LAYOUT.filter(h=>['乾清宫','交泰殿','坤宁宫'].includes(h.name)),{name:'后三宫',apron:6,margin:4});const buildMs=performance.now()-constructionStart;
 const central=builder._own.get('qianqing-central-private-atlas'),ceiling=scene.getObjectByName('qianqing-panelled-ceiling-r32'),states=()=>({screen:central?.userData.screenPaintState,frieze:central?.userData.friezePaintState,ceiling:ceiling?.userData.paintState});
 const paintStart=performance.now();while(pending&&performance.now()-paintStart<5000)await new Promise(r=>setTimeout(r,5));
 if(pending||errors.length||Object.values(states()).some(x=>x!=='ready')){builder.dispose();library.dispose();throw Error('Actual paint not ready: '+JSON.stringify({pending,errors,states:states()}));}
 scene.updateMatrixWorld(true);const paint={states:states(),waitMs:performance.now()-paintStart,requests,errors,files:Object.fromEntries(['qianqing-screen-illustration-r32.webp','qianqing-five-dragon-illustration-r32.webp','qianqing-ceiling-illustration-r32.webp'].map(f=>[f,createHash('sha256').update(fs.readFileSync(sourceRoot+'/public/textures/art/'+f)).digest('hex')]))};
 return{scene,builder,library,platform,buildMs,keys,sourceRoot,paint,dispose(){builder.dispose();library.dispose();}};
}
