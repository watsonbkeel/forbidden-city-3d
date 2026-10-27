import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildR52World} from '../../tests/lib/r52-world.mjs';
import {installCpuPlatform} from '../r115-fix/cpu-platform.mjs';
import {TextureLibrary,TEXTURE_SPECS} from '../../src/utils/TextureLibrary.js';
import {setBuildingDetailQuality} from '../../src/render/BuildingDetailQuality.js';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export async function buildWorld(options={}) {return buildR52World({...options,createLibrary:async()=>{await installCpuPlatform(root);window.location.search=options.loadAll===false?'':'?zones=all';const library=new TextureLibrary({quality:'sd',baseUrl:path.join(root,'public/textures/sd')+'/'});setBuildingDetailQuality(library,'low');await library.load();if(library.loadedFromFile.size!==22||library.normals.size!==21)throw Error('real asset decode incomplete');const material=library.material.bind(library);library.material=(key,...args)=>{if(!Object.hasOwn(TEXTURE_SPECS,key))throw Error('invalid actual registry key '+key);return material(key,...args);};return {library,dispose:()=>library.dispose(),evidence:{textures:library.loadedFromFile.size,normals:library.normals.size}};}});}
