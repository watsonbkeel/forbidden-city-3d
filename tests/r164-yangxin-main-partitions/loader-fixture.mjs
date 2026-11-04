import fs from'node:fs';import crypto from'node:crypto';import{registerHooks}from'node:module';const hook=registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c)}});const{InteriorLoader}=await import('../../src/scene/interior/InteriorLoader.js');hook.deregister();
const original=new URL('../../src/scene/interior/InteriorLoader.js',import.meta.url),source=fs.readFileSync(new URL('../fixtures/r164-yangxin-56fa/InteriorLoader.source.js',import.meta.url),'utf8');
const expected='2e8b0c21aaa0e4b41ec3e49d9f9dd0b70c7b38884dd4b4c09613989945f09781';if(crypto.createHash('sha256').update(source).digest('hex')!==expected)throw Error('Frozen56fa InteriorLoader changed');
const rebased=source.replace(/from\s*(['"])([^'"]+)\1/g,(_m,q,p)=>'from '+q+(p.startsWith('.')?new URL(p,original).href:import.meta.resolve(p))+q),old=await import('data:text/javascript;base64,'+Buffer.from(rebased).toString('base64'));
export const Loader=InteriorLoader,BeforeLoader=old.InteriorLoader;
export const cfg=JSON.parse(fs.readFileSync(new URL('../../data/interiors/yangxin.json',import.meta.url)));
