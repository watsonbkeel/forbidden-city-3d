// Only this existing render policy can authorize view-dependent zone hiding.
const managedVisibility=new WeakMap();
export function zoneVisibilityIsManaged(group){const row=managedVisibility.get(group);return !!row&&row.manager.loaded.get(row.id)?.data.group===group&&group.visible===row.visible;}
// 保守区块剔除：只隐藏当前区与邻区之外、完全处于观察方向后方的区。
export class OcclusionByWall {
  constructor() { this.lastUpdate = -Infinity; }

  update(manager, position, camera) {
    const now = performance.now();
    if (now - this.lastUpdate < 200) return;
    this.lastUpdate = now;
    const current = manager.zones.get(manager.currentId);
    const keep = new Set([manager.currentId, ...(current?.neighbors ?? [])]);
    const e = camera.matrixWorld.elements;
    for (const [id, { data }] of manager.loaded) {
      const b = manager.zones.get(id).bounds;
      const behind = [[b.x0, b.z0], [b.x0, b.z1], [b.x1, b.z0], [b.x1, b.z1]]
        .every(([x, z]) => (x - position.x) * -e[8] + (z - position.z) * -e[10] < -20);
      data.group.visible = keep.has(id) || !behind;
      managedVisibility.set(data.group,{manager,id,visible:data.group.visible});
    }
  }
}
