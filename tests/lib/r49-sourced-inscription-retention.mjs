import {createHash} from 'node:crypto';
export function inscriptionRetention(kit){
  kit.root.updateMatrixWorld(true);
  const rows=[];
  kit.root.traverse(m=>{if(!m.isMesh||m.userData.r49SourcedNameInscription)return;
    rows.push({name:m.name,matrix:m.matrixWorld.toArray(),material:m.material?.name,cast:m.castShadow,receive:m.receiveShadow,attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,[a.itemSize,...a.array]])),index:m.geometry.index?[...m.geometry.index.array]:null});
  });
  const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
  return {meshes:rows.length,geometry:hash(rows),navigation:hash({colliders:kit.colliders,walkables:kit.walkables,rooms:kit.rooms,mapItems:kit.mapItems,regions:kit.regions})};
}
