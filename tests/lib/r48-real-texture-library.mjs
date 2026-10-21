import * as THREE from 'three';
import {TextureLibrary,TEXTURE_SPECS} from '../../src/utils/TextureLibrary.js';
// Offline CPU boundary only: preload inert textures, without replacing material(),
// its cache, names, ownership, parameters, or production tile-size/aspect APIs.
export function realTextureLibrary(){const lib=new TextureLibrary();for(const key of Object.keys(TEXTURE_SPECS))lib.colors.set(key,new THREE.Texture({width:64,height:64}));return lib;}
