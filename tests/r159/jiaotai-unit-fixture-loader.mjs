// Unit-contract setup only, NOT a historical closure and NOT a production proof.
// The original test manually installs the module; remove only the exact reviewed
// production entry from its setup, leaving the current module and assertions live.
import {registerHooks}from'node:module';import fs from'node:fs';import{createHash}from'node:crypto';
const target=new URL('../../src/scene/palace/special/JiaotaiDisplaySetting.js',import.meta.url).href;
const sha=s=>createHash('sha256').update(s).digest('hex');
registerHooks({load(url,context,next){if(url!==target)return next(url,context);
 let source=fs.readFileSync(new URL(url),'utf8');
 if(sha(source)!=='b593bc9d7d1b08210372bed05d7d8e42029dbf8b539f8ed882d77e80d213f29c')throw Error('Unit setup refuses changed production source');
 source=source.replace("import {buildJiaotaiFrontVessels} from './JiaotaiFrontVessels.js';\n",'').replace("  if (x0 === 0 && y === 2.16 && z0 === 354.1) {\n    buildJiaotaiFrontVessels(builder, shell);\n  }\n",'');
 if(sha(source)!=='f43b50d30e2026117ad88d9c1dd975a01d1845cf1375250add6283b792409a25')throw Error('Unit setup is not exact pre-hook display source');
 return{format:'module',source,shortCircuit:true};
}});
