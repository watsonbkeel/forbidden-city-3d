import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import * as T from 'three';
import {installCpuPlatform} from '../r115-fix/cpu-platform.mjs';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export async function readyScene(quality='high',sourceRoot=root,configureBuilder=null){
 sourceRoot=path.resolve(sourceRoot);const imp=p=>import(pathToFileURL(sourceRoot+'/'+p));
 const {TextureLibrary,TEXTURE_SPECS}=await imp('src/utils/TextureLibrary.js'),{setBuildingDetailQuality}=await imp('src/render/BuildingDetailQuality.js'),{PalaceBuilder}=await imp('src/scene/PalaceBuilder.js'),{PALACE_LAYOUT}=await imp('src/scene/Layout.js');
 const platform=await installCpuPlatform(sourceRoot),library=new TextureLibrary({quality:'sd',baseUrl:sourceRoot+'/public/textures/sd/'});
 setBuildingDetailQuality(library,quality);await library.load();
 if(library.loadedFromFile.size!==22||library.normals.size!==21)throw Error('Incomplete real texture decode');
 const keys=new Set(),material=library.material.bind(library);library.material=(key,...args)=>{if(!Object.hasOwn(TEXTURE_SPECS,key))throw Error('Unknown real TextureLibrary key '+key);keys.add(key);return material(key,...args);};
 const scene=new T.Scene(),builder=new PalaceBuilder(scene,library),start=performance.now();
 if(configureBuilder)configureBuilder(builder);
 builder.buildComplex(PALACE_LAYOUT.filter(h=>['乾清宫','交泰殿','坤宁宫'].includes(h.name)),{name:'后三宫',apron:6,margin:4});
 const buildMs=performance.now()-start;scene.updateMatrixWorld(true);
 return{scene,builder,library,platform,buildMs,keys,sourceRoot,dispose(){builder.dispose();library.dispose();}};
}
