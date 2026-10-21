import {hash,serial} from './inner-palace-fixture.mjs';
export function hallSignature(kit){
 kit.root.updateMatrixWorld(true);const meshes=[];
 kit.root.traverse(o=>{if(!o.isMesh)return;const m=o.material;meshes.push({world:o.matrixWorld.toArray(),material:m?{name:m.name,color:m.color?.getHex(),side:m.side,opacity:m.opacity,transparent:m.transparent}:null,attributes:Object.fromEntries(Object.entries(o.geometry.attributes).map(([k,a])=>[k,hash({itemSize:a.itemSize,array:[...a.array]})])),index:o.geometry.index?hash([...o.geometry.index.array]):null});});
 return{geometry:hash(meshes),navigation:hash({colliders:kit.colliders.map(serial),walkables:kit.walkables,rooms:kit.rooms,map:kit.mapItems})};
}
