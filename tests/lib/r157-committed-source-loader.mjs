import {registerHooks} from 'node:module';import {execFileSync} from 'node:child_process';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {R157_COMMITTED_VERSIONS} from './r157-committed-versions.mjs';
import {createR157FrozenSourceReader} from './r157-frozen-source-reader.mjs';
const commit=process.env.R157_FROZEN_SOURCE_COMMIT;
if(!Object.values(R157_COMMITTED_VERSIONS).includes(commit))throw Error('R157 frozen source commit is absent or not exact allowlist member');
const root=process.cwd();if(execFileSync('git',['rev-parse','--show-prefix'],{cwd:root,encoding:'utf8'}).trim()!=='')throw Error('R157 frozen source must run at repository root');
const cache=new Map(),frozen=createR157FrozenSourceReader(root,commit);
registerHooks({load(u,c,next){if(!u.startsWith('file:'))return next(u,c);const p=fileURLToPath(u),rel=path.relative(root,p).split(path.sep).join('/');if(!rel.startsWith('src/')&&!rel.startsWith('data/'))return next(u,c);if(rel.split('/').includes('..'))throw Error('Frozen source escaped repository');if(!/\.(?:[mc]?js|json)$/.test(rel))throw Error('Unsupported frozen source dependency type: '+rel);if(!cache.has(rel))cache.set(rel,frozen.read(rel));return{format:rel.endsWith('.json')?'json':'module',source:cache.get(rel),shortCircuit:true};}});
