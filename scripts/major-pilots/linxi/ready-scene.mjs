import fs from 'node:fs';import path from 'node:path';import * as THREE from 'three';
import {installCpuPlatform} from '../../r115-fix/cpu-platform.mjs';
import {TextureLibrary} from '../../../src/utils/TextureLibrary.js';
import {setBuildingDetailQuality} from '../../../src/render/BuildingDetailQuality.js';
import {ZoneBase} from '../../../src/scene/zones/ZoneBase.js';
import {Environment} from '../../../src/scene/Environment.js';
export async function readyScene(candidate=true,quality='high',configureBuilder=null){
 const root=path.resolve(new URL('../../..',import.meta.url).pathname),platform=await installCpuPlatform(root),manager=new THREE.LoadingManager();let pending=0;const errors=[],start=manager.itemStart.bind(manager),end=manager.itemEnd.bind(manager);manager.itemStart=u=>{pending++;start(u)};manager.itemEnd=u=>{pending--;end(u)};manager.onError=u=>errors.push(u);manager.setURLModifier(u=>u.startsWith('/textures/')?root+'/public'+u:u);
 const library=new TextureLibrary({quality:'sd',baseUrl:root+'/public/textures/sd/',manager});setBuildingDetailQuality(library,quality);await library.load();if(library.loadedFromFile.size!==22||library.normals.size!==21)throw Error('Texture library not ready');
 const zone=JSON.parse(fs.readFileSync(root+'/data/zones/outer-west.json')),builder=new ZoneBase(library,zone);builder.kit.linxiBridgePool=candidate;if(configureBuilder)configureBuilder(builder);const data=builder.build(),scene=new THREE.Scene();scene.add(data.group);const environment=new Environment(scene,null,library);environment.linxiBridgePool=candidate;environment.setupGround();const begin=performance.now();while(pending&&performance.now()-begin<5000)await new Promise(r=>setTimeout(r,5));if(pending||errors.length)throw Error('Unready actual image asset');scene.updateMatrixWorld(true);
 return{scene,builder,environment,library,platform,data,paint:{pending,errors,colors:library.loadedFromFile.size,normals:library.normals.size},dispose(){builder.dispose();for(const o of environment.objects)o.traverse(m=>m.geometry?.dispose());library.dispose();}};
}
