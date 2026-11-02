import {registerHooks} from 'node:module';import fs from 'node:fs';import{createHash}from'node:crypto';
const bytes=fs.readFileSync(new URL('./before.js.txt',import.meta.url));if(createHash('sha256').update(bytes).digest('hex')!=='869cddf6f1454e4e7e2feb0f37723649dc903380c793bb39ba7fe34172519be5')throw Error('Baseline SHA mismatch');
registerHooks({load(url,context,next){const r=next(url,context);if(url.endsWith('/src/scene/palace/special/WenhuaGateSouthWindows.js'))return{...r,source:bytes.toString('utf8')};return r;}});
