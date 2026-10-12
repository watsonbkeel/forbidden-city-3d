# 跨任务请求（Agent 写，总控分派）

> 当你需要改动不在自己所有权清单里的文件时，在这里追加一条，**不要自己改**。
> 格式：日期 · 发起任务 · 目标文件 · 需要什么 · 为什么 · 紧急度

| 日期 | 发起 | 目标文件 | 需求 | 原因 | 紧急 | 分派给 | 状态 |
|---|---|---|---|---|---|---|---|
| 2026-10-12 | P1-I | `main.js`、`src/ui/PerfHUD.js` | 「碰撞检测」步骤后 `this.interiors = new InteriorLoader(this.scene, this.collisionManager, { renderer: this.renderer })`；animate 里 `this.interiors.update(this.camera.position)`；PerfHUD 增加一行 `interiors.hudLine()`；`dispose()` 调 `interiors.dispose()` | InteriorLoader 已自测通过（p1i-loader PASS），但 main.js 不在 P1-I 所有权内，运行时尚未自动触发 S 档加载 | 中 | 总控（合并时顺手接） | 待办 |
