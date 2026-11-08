import {createRequire} from 'node:module';
import {dirname,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

// No cwd/machine assumptions: npm dependencies belong to this checked-out repo.
export const root=fileURLToPath(new URL('./',import.meta.url)).replace(/\/$/,'');
export const repo=fileURLToPath(new URL('../../../',import.meta.url)).replace(/\/$/,'');
export const repoRequire=createRequire(new URL('../../../package.json',import.meta.url));
const threeRoot=resolve(dirname(repoRequire.resolve('three')),'..');
export const config={configFile:false,root,cacheDir:root+'/.vite-cache',resolve:{alias:[
 {find:/^three$/,replacement:threeRoot+'/build/three.module.js'},
 {find:/^three\/addons\//,replacement:threeRoot+'/examples/jsm/'},
 {find:/^three\/examples\/jsm\//,replacement:threeRoot+'/examples/jsm/'},
]}};

export const vite=await import(pathToFileURL(resolve(dirname(repoRequire.resolve('vite/package.json')),'dist/node/index.js')).href);
