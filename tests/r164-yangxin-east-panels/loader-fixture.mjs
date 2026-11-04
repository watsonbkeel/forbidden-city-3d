import fs from'node:fs';import crypto from'node:crypto';import{registerHooks}from'node:module';const hook=registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c)}});const{InteriorLoader}=await import('../../src/scene/interior/InteriorLoader.js');hook.deregister();
const original=new URL('../../src/scene/interior/InteriorLoader.js',import.meta.url),source=fs.readFileSync(new URL('../fixtures/r164-yangxin-9e/InteriorLoader.source.js',import.meta.url),'utf8');
const expected='ec3d850676c8757407215c680aa035d1c1662c2088a8de76b62762d028d7e2f0';if(crypto.createHash('sha256').update(source).digest('hex')!==expected)throw Error('Frozen 9e InteriorLoader changed');
const rebased=source.replace(/from\s*(['"])([^'"]+)\1/g,(_m,q,p)=>'from '+q+(p.startsWith('.')?new URL(p,original).href:import.meta.resolve(p))+q),old=await import('data:text/javascript;base64,'+Buffer.from(rebased).toString('base64'));
export const Loader=InteriorLoader,BeforeLoader=old.InteriorLoader;
export const cfg=JSON.parse(fs.readFileSync(new URL('../../data/interiors/yangxin.json',import.meta.url)));
