# R95 人物首显补丁：独立候选审查

准确冻结5文件SHA256见checkpoint-fixed.sha256（05:05再次核对全部OK）。CharacterSystem/WorldAdapter/WorkQueue优先准备；Renderer异步细LOD+同姿态粗LOD暂显；Manager真实提交统计及交互集合。未修改产品源码。

## 发现并修复的实质回退
首稿renderer在缺新姿态时过滤actor，但Manager仍向Interaction传原selected，造成2m近人物实际mesh.count=0、visible=0却动态身体=1。独立invisible-body-red.test.mjs原始FAIL保留；writer改实际submittedActors后同一测试GREEN。不能用修后数据覆盖旧失败。

## 独立功能证据
- lifecycle.mjs真实完整世界、全部区域，low15/60Hz功能更新；冷启动→近处人物→23:00→跟随皇帝观察→12:48+high→人物关/开。没有预绑定或同步造缺失几何。
- 每帧actual提交列表对应真实batch.count；visible统计一致；近处未提交角色没有活跃隐形动态体；缺资源同步pool.acquire计数0；系统错误0。
- 15Hz确实观察到sleeping、standing、seated三姿态；皇帝夜间实际seated LOD1且routine.working=1，返回白天后实际standing。60Hz窗口观察到皇帝在途standing，未冒称同样窗口已到夜座。
- 2400帧含多次模式/开关变化不是全部完成期限，不夸成108全ready；单独fairness-60延长稳定期，记录首个100帧采样点2300已108全ready，最终9000帧全108绑定、queue0、无error。证明本有限场景未饿死远角色，不是任意外部变更下数学时间上界。
- fairness运行生成34个实际batch几何，各dispose恰1；结束人物root移除、共享pool entries/references0、动态owner0。没有做堆内存GC/真实GPU泄漏证明。
- rapid-map-low：真实Teleport储秀→养心→储秀，插入hidden/恢复与关闭/开启；最后无error，当前加载区78角色就绪，后妃/宫女有实际提交。未加载区域不要求108就绪，不能把78解释为丢失人物。
- pose-fallback.test.mjs4/4：sleeping不能代standing，折手standing不能代walking，标准座不能代皇帝qianqing低脚座；精确同pose/seat的已备LOD2可代LOD0，实际geometry.userData.pose/seatVariant对应。
- clear/reset/cancel后再建未见重复渲染实例计数、未显示近体或缺资源同步造模。

功能运行与writer current-state测试有并发。首显帧数保留原始数据，但不作正式CPU/用户设备延迟对比；15/60是模拟dt，不是实机帧率。正式冷首显配对/CPU需writer清场后证据。

## 设计限定
作业在生成器边界按距离优先，每第4次取FIFO，在途任务不抢占，避免共享cache生成器交错。公平性是以有限作业完成为前提，不保证正在执行长任务可立即让出首显。初始coarse后用同队列准备其他姿态，未增加全局预算；缺姿态时宁可暂不提交，不能用错误睡姿/座姿冒充。实际近体必须跟随实际提交，这是已修硬合同。

本限定功能/资源/公平性检查可继续候选集成；不等于GPU手机验证、全部用户视点可见或全故宫人物日程完美。原用户截图保密，未复制进公开候选。

文件：invisible-body-{red,green}.tap；lifecycle-{15,60}.json；fairness-60.json；rapid-map-low.json；pose-fallback.tap；checkpoint-fixed.sha256。
