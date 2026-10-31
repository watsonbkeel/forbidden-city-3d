import {registerHooks} from 'node:module';import fs from 'node:fs';import crypto from 'node:crypto';
const source=fs.readFileSync(new URL('../fixtures/r157-wumen-side-portal/WumenLowerBase.db1.baseline.txt',import.meta.url),'utf8');
if(crypto.createHash('sha256').update(source).digest('hex')!=='7ae6df03668ff6e6a1a655e714922a615985954283681cbb7ac6aa2602b0ec4a')throw Error('Portal predecessor source hash mismatch');
const target=new URL('../../src/scene/palace/special/WumenLowerBase.js',import.meta.url).href;
const excluded=new URL('../../src/scene/palace/special/WumenSidePortalFaces.js',import.meta.url).href;
registerHooks({load(url,context,nextLoad){if(url===excluded)throw Error('Current portal Faces excluded from predecessor closure');return url===target?{format:'module',source,shortCircuit:true}:nextLoad(url,context);}});
