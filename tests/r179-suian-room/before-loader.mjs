import {execFileSync} from 'node:child_process';import {registerHooks} from 'node:module';import {createHash} from 'node:crypto';
const base='eb142e674f980f97727090c07afa97f3f05a7d37',relative='src/scene/interior/InteriorLoader.js',url=new URL('../../'+relative,import.meta.url);
const source=execFileSync('git',['show',base+':'+relative],{cwd:new URL('../..',import.meta.url),encoding:'utf8'});
if(createHash('sha256').update(source).digest('hex')!=='eccbb839a3a5e5b899483074f9ebacc2a2242ae76f9d82da8b8508e5daed6cb0')throw Error('Public R177 loader source drift');
const rebased=source.replace(/from\s*(['"])([^'"]+)\1/g,(_m,q,p)=>'from '+q+(p.startsWith('.')?new URL(p,url).href:import.meta.resolve(p))+q);
const hook=registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c)}});
export const BeforeLoader=(await import('data:text/javascript;base64,'+Buffer.from(rebased).toString('base64'))).InteriorLoader;hook.deregister();
