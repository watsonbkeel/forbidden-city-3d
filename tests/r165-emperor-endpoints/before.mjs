import fs from 'node:fs';import crypto from 'node:crypto';import {registerHooks} from 'node:module';
const url=new URL('./frozen/SharedRestNavigation.mjs',import.meta.url),original=new URL('../../src/scene/characters/SharedRestNavigation.js',import.meta.url),record=JSON.parse(fs.readFileSync(new URL('./BASELINE.json',import.meta.url)));
if(crypto.createHash('sha256').update(fs.readFileSync(url)).digest('hex')!==record.navigation)throw Error('Frozen original navigation bytes changed');
const hook=registerHooks({resolve(specifier,context,next){if(context.parentURL===url.href&&specifier.startsWith('.'))return next(new URL(specifier,original).href,context);return next(specifier,context);}});
export const {SharedRestNavigation:BeforeNavigation}=await import(url.href);hook.deregister();
