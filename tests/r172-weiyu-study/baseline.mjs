import {execFileSync} from 'node:child_process';
export const PUBLIC_BASE='53df463af8e762c74a24d291907aa8395a97e302';
const path='src/scene/palace/special/JideRearHall.js';
const raw=execFileSync('git',['show',PUBLIC_BASE+':'+path],{encoding:'utf8'});
const source=raw.replace("from 'three'","from '"+import.meta.resolve('three')+"'").replace(/from '([^']+)'/g,(all,p)=>p.startsWith('.')?"from '"+new URL('../../'+path.split('/').slice(0,-1).join('/')+'/'+p,import.meta.url).href+"'":all);
export const buildBaseline=(await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).buildJideRearHall;
