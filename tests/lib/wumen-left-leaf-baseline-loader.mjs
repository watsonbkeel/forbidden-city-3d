import {registerHooks} from 'node:module';import fs from 'node:fs';import crypto from 'node:crypto';
const source=fs.readFileSync(new URL('../fixtures/r157-wumen-left-leaf/WumenLowerBase.eec.baseline.txt',import.meta.url),'utf8');
if(crypto.createHash('sha256').update(source).digest('hex')!=='d85a585607578f25cfb4e25b8f2db2ba39cd806241498bae1792344c8f52c1f6')throw Error('Exact eec LowerBase predecessor required');
const target=new URL('../../src/scene/palace/special/WumenLowerBase.js',import.meta.url).href,excluded=new URL('../../src/scene/palace/special/WumenLeftLeafStuds.js',import.meta.url).href;
registerHooks({load(url,context,next){if(url===excluded)throw Error('Left candidate must not load in eec replay');return url===target?{format:'module',source,shortCircuit:true}:next(url,context);}});
