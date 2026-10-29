import fs from 'node:fs';import path from 'node:path';import * as THREE from 'three';
import {installCpuPlatform} from '../../r115-fix/cpu-platform.mjs';
import {TextureLibrary} from '../../../src/utils/TextureLibrary.js';
import {setBuildingDetailQuality} from '../../../src/render/BuildingDetailQuality.js';
import {GardenBuilder} from '../../../src/scene/GardenBuilder.js';
import {PALACE_LAYOUT} from '../../../src/scene/Layout.js';

export async function readyScene(candidate=true,quality='high',configureBuilder=null){
 const root=path.resolve(new URL('../../..',import.meta.url).pathname),platform=await installCpuPlatform(root),manager=new THREE.LoadingManager();let pending=0;const errors=[],start=manager.itemStart.bind(manager),end=manager.itemEnd.bind(manager);manager.itemStart=u=>{pending++;start(u)};manager.itemEnd=u=>{pending--;end(u)};manager.onError=u=>errors.push(u);manager.setURLModifier(u=>u.startsWith('/textures/')?root+'/public'+u:u);
 const library=new TextureLibrary({quality:'sd',baseUrl:root+'/public/textures/sd/',manager});setBuildingDetailQuality(library,quality);await library.load();if(library.loadedFromFile.size!==22||library.normals.size!==21)throw Error('Texture library not ready');
 const scene=new THREE.Scene(),builder=new GardenBuilder(scene,library);builder.chengruiWholeEnvelope=candidate;if(configureBuilder)configureBuilder(builder);builder.build(PALACE_LAYOUT.find(x=>x.type==='garden'));const data=builder;const begin=performance.now();while(pending&&performance.now()-begin<5000)await new Promise(r=>setTimeout(r,5));if(pending||errors.length)throw Error('Unready actual image asset');scene.updateMatrixWorld(true);
 return{scene,builder,library,platform,data,paint:{pending,errors,colors:library.loadedFromFile.size,normals:library.normals.size},dispose(){builder.dispose();library.dispose();}};
}
