import path from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';
export const baseRoot=path.resolve(process.env.QA_BASE_ROOT??fileURLToPath(new URL('../..',import.meta.url)));
export const fromBase=p=>pathToFileURL(path.join(baseRoot,p)).href;
