import fs from 'node:fs';import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
// Real production names, ownership, UV tile/aspect APIs and manifest dimensions.
// Inert pixels only: neither GPU nor texture appearance acceptance.
export function createActualLibrary(){const library=realTextureLibrary();library.manifest=JSON.parse(fs.readFileSync(new URL('../../public/textures/hd/manifest.json',import.meta.url)));for(const [key,value]of Object.entries(library.manifest.textures)){const t=library.colors.get(key);if(t)t.image={width:value.hd.width,height:value.hd.height};}return{library,dispose:()=>library.dispose()};}
