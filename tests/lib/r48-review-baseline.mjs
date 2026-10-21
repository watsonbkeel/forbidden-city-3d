import {hash,serial,hallSurfaces} from './inner-palace-fixture.mjs';
export function nodes(f,p){const out=[];f.traverse(m=>{if(p(m))out.push(m);});return out;}
export function surfaceRows(f){f.updateMatrixWorld(true);return nodes(f,m=>m.isMesh).map(m=>({name:m.name,material:m.material?.name??null,matrix:m.matrixWorld.toArray(),attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,[...a.array]])),index:m.geometry.index?[...m.geometry.index.array]:null}));}
export function physicalSignature(f,owner,{floorY=null}={}){return{surfaces:hash(floorY===null?surfaceRows(f):hallSurfaces(f,floorY)),colliders:hash(owner.colliders.map(serial)),walkables:hash(owner.walkables),...(owner.rooms?{rooms:hash(owner.rooms)}:{})};}
export const retainedHalls=[['west-six','储秀宫'],['west-six','翊坤宫'],['west-six','长春宫'],['east-six','景仁宫'],['east-six','钟粹宫'],['east-six','永和宫'],['east-six','延禧宫'],['axis-courts','体仁阁'],['axis-courts','弘义阁']];
