// Frozen original builder, resolved to unchanged local dependencies. No world build.
import {execFileSync} from 'node:child_process';
export const COURTYARD_WINDOW_BASE='88c71e26fd528e47f7cd5e4740c13773b6e1fc6a';
const url=new URL('../../src/scene/palace/special/SideGate.js',import.meta.url);
let source=execFileSync('git',['show',`${COURTYARD_WINDOW_BASE}:src/scene/palace/special/SideGate.js`],{encoding:'utf8'});
source=source.replace(/from\s+(['"])([^'"]+)\1/g,(_,q,id)=>`from ${q}${id==='three'?import.meta.resolve('three'):new URL(id,url).href}${q}`);
export const {buildSideGate:baselineSideGate}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
export const oldCourtyardBar=o=>o.userData.role==='gate-window-bar'&&o.position.z>0;
export const newCourtyardMember=o=>o.userData.role?.startsWith('courtyard-window-');
