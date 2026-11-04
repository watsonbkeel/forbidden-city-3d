import fs from'node:fs';import crypto from'node:crypto';import{registerHooks}from'node:module';const hook=registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c)}});const{InteriorLoader}=await import('../../src/scene/interior/InteriorLoader.js');hook.deregister();
const original=new URL('../../src/scene/interior/InteriorLoader.js',import.meta.url),source=fs.readFileSync(new URL('../fixtures/r164-yangxin-4409/InteriorLoader.source.js',import.meta.url),'utf8');
const expected='b325941e36928a830d80370729402c968d3d96d16d5118962e18a75bd8456380';if(crypto.createHash('sha256').update(source).digest('hex')!==expected)throw Error('Frozen4409 InteriorLoader changed');
const rebased=source.replace(/from\s*(['"])([^'"]+)\1/g,(_m,q,p)=>'from '+q+(p.startsWith('.')?new URL(p,original).href:import.meta.resolve(p))+q),old=await import('data:text/javascript;base64,'+Buffer.from(rebased).toString('base64'));
export const Loader=InteriorLoader,BeforeLoader=old.InteriorLoader;
export const cfg=JSON.parse(fs.readFileSync(new URL('../../data/interiors/yangxin.json',import.meta.url)));
