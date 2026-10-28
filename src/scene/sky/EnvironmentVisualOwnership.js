// Exact creator-owned view-following visual meshes, not a name/userData/type
// convention. Ground, buildings, backdrop, lights and subsequently inserted
// children are never included. This is classification, not a collision bypass.
const owners = new WeakMap(), roots = new WeakMap();
export function registerViewFollowingVisual(scene, root) {
  if (!scene?.isScene || root?.parent !== scene || roots.has(root)) throw new TypeError('Attached unique environment visual required');
  const meshes=[];root.traverse(object=>{if(object.isMesh){owners.set(object,{scene,root});meshes.push(object);}});
  roots.set(root,meshes);
}
export function isViewFollowingVisual(object, scene) {
  const owner=owners.get(object);if(!owner||owner.scene!==scene||owner.root.parent!==scene)return false;
  for(let p=object;p;p=p.parent)if(p===owner.root)return true;
  return false;
}
export function revokeViewFollowingVisual(root) {
  for(const mesh of roots.get(root)??[])owners.delete(mesh);
  roots.delete(root);
}
