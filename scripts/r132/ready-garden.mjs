import path from 'node:path';import fs from 'node:fs';import {createHash} from 'node:crypto';import {fileURLToPath,pathToFileURL} from 'node:url';import * as T from 'three';
import {captureDuixiuOwners,verifyMergedOwners} from './capture-owners.mjs';
import {installCpuPlatform} from '../r115-fix/cpu-platform.mjs';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export async function readyScene(quality='high',sourceRoot=root){
 sourceRoot=path.resolve(sourceRoot);const imp=p=>import(pathToFileURL(sourceRoot+'/'+p));
 const {TextureLibrary,TEXTURE_SPECS}=await imp('src/utils/TextureLibrary.js'),{setBuildingDetailQuality}=await imp('src/render/BuildingDetailQuality.js'),{GardenBuilder}=await imp('src/scene/GardenBuilder.js'),{PALACE_LAYOUT}=await imp('src/scene/Layout.js');
 const platform=await installCpuPlatform(sourceRoot),manager=new T.LoadingManager(),errors=[];let pending=0,requests=0;const start=manager.itemStart.bind(manager),end=manager.itemEnd.bind(manager);
 manager.itemStart=url=>{pending++;requests++;start(url);};manager.itemEnd=url=>{pending--;end(url);};manager.onError=url=>errors.push(url);
 manager.setURLModifier(url=>{if(url.startsWith('/textures/'))return sourceRoot+'/public'+url;if(url.startsWith(sourceRoot+'/public/'))return url;throw Error('Unsupported diagnostic local image URL '+url);});
 const library=new TextureLibrary({quality:'sd',baseUrl:sourceRoot+'/public/textures/sd/',manager});setBuildingDetailQuality(library,quality);await library.load();
 if(library.loadedFromFile.size!==22||library.normals.size!==21)throw Error('Incomplete real file texture decode');
 const keys=new Set(),material=library.material.bind(library);library.material=(key,...args)=>{if(!Object.hasOwn(TEXTURE_SPECS,key))throw Error('Unknown real TextureLibrary key '+key);keys.add(key);return material(key,...args);};
 if(process.env.R121_CANDIDATE==='1')throw Error('Rejected R121 candidates archived. Replay exact diagnostic commit91d54eb3, never current product.');
 let Builder=GardenBuilder;if(process.env.R132_CANDIDATE==='1'){const{applyRockMassCandidate}=await import('../../experiments/r132/rock-mass-candidate.mjs');Builder=class extends GardenBuilder{buildDuixiu(options){return applyRockMassCandidate(super.buildDuixiu(options),options);}};}
 const scene=new T.Scene(),builder=new Builder(scene,library);if(process.env.R121_OWNER_CAPTURE==='1')captureDuixiuOwners(builder);const constructionStart=performance.now();builder.build(PALACE_LAYOUT.find(h=>h.type==='garden'));const buildMs=performance.now()-constructionStart;
 const waitStart=performance.now();while(pending&&performance.now()-waitStart<5000)await new Promise(r=>setTimeout(r,5));
 if(pending||errors.length){builder.dispose();library.dispose();throw Error('Actual assets not ready '+JSON.stringify({pending,errors}));}
 scene.updateMatrixWorld(true);if(process.env.R121_OWNER_CAPTURE==='1')builder.duixiuOwnerCapture=verifyMergedOwners(builder);const paint={states:{textureLibrary:'ready'},waitMs:performance.now()-waitStart,requests,errors};
 return{scene,builder,library,platform,buildMs,keys,sourceRoot,paint,dispose(){builder.dispose();library.dispose();}};
}
