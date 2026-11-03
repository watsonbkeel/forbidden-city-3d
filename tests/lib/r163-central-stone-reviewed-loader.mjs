// Reproduction tool only. Every production dependency comes from one of the two
// exact Git commits, never from a mixture of the live working tree and history.
import {registerHooks} from 'node:module';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const allowed=['ec50ea010340dc3b04f18ec052f36a05c3862702','18ce5bec5a72953d0e8b562906e788c619f11fc0'];
const commit=process.env.R163_REVIEWED_SOURCE_COMMIT;
if(!allowed.includes(commit))throw Error('Only the original R163 and reviewed Taihe commits may be reproduced');
const root=process.cwd(),cache=new Map();
if(execFileSync('git',['rev-parse','--show-prefix'],{encoding:'utf8'}).trim())throw Error('Run at repository root');
registerHooks({load(url,context,next){
  if(!url.startsWith('file:'))return next(url,context);
  const rel=path.relative(root,fileURLToPath(url)).split(path.sep).join('/');
  if(!rel.startsWith('src/')&&!rel.startsWith('data/'))return next(url,context);
  if(rel.split('/').includes('..')||!rel.match(/\.(?:m?js|json)$/))throw Error('Unsupported historical dependency '+rel);
  if(!cache.has(rel))cache.set(rel,execFileSync('git',['show',`${commit}:${rel}`]));
  return{format:rel.endsWith('.json')?'json':'module',source:cache.get(rel),shortCircuit:true};
}});
