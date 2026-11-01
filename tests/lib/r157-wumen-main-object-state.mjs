import{createHash}from'node:crypto';
// Complement (never rewrite) the reviewed geometry/material/physics oracle.
// All raw tower nodes and all ancestors participate, including non-Mesh groups.
// Ancestor sibling/child counts are intentionally omitted: other Wumen modules
// are independently authorized to add objects, but may not hide/move this tower.
export function mainObjectState(tower){
 const state=o=>({type:o.type,name:o.name,position:o.position.toArray(),quaternion:o.quaternion.toArray(),scale:o.scale.toArray(),matrix:o.matrix.toArray(),flags:[o.visible,o.castShadow,o.receiveShadow,o.frustumCulled,o.renderOrder,o.layers.mask,o.matrixAutoUpdate,o.matrixWorldAutoUpdate]});
 tower.updateWorldMatrix(true,true);const rows=[];function visit(o,path){rows.push({path,...state(o),children:o.children.length});o.children.forEach((c,i)=>visit(c,path+'/'+i));}visit(tower,'tower');
 const ancestors=[];for(let p=tower.parent;p;p=p.parent)ancestors.push(state(p));
 return{nodeCount:rows.length,ancestorCount:ancestors.length,sha256:createHash('sha256').update(JSON.stringify({rows,ancestors})).digest('hex')};
}
