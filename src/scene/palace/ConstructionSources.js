// Source-bound contact certificates continue to inspect their original frames
// after material merging. Retain those branches for the lifetime of this kit;
// this is ownership bookkeeping only, never a replacement contact certificate.
const branches = new WeakMap();
export function retainConstructionBranch(kit, frame) {
  if (!kit?.root?.isObject3D || !frame?.isObject3D || frame === kit.root || frame.parent !== kit.root) {
    throw new Error('Construction source must be an existing direct branch');
  }
  let keep = branches.get(kit);
  if (!keep) branches.set(kit, keep = new Set());
  keep.add(frame);
}
export function releaseUnusedConstructionBranches(kit) {
  const keep = branches.get(kit);
  for (const child of [...kit.root.children]) if (!keep?.has(child)) kit.root.remove(child);
}
export function forgetConstructionSources(kit) { branches.delete(kit); }
