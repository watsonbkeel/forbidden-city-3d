# 首错本地摘要

使用真实主帧方法和真实故障层，DOM/RAF/剪贴板为可控替身。测试阶段、首次错误保留、终止调度、设置/飞行输入、焦点与 inert、本地复制重复/拒绝/销毁。

仅摘要去敏：固定错误类型、固定原因类别、限定阶段/区域、构建身份、故障分类码。分类码不读取原始消息字节，不用于唯一错误去重。不输出任意 message/stack/URL/用户输入，未发送网络或持久化。原既有 console.error 与 frameFailure 保留原错，不能称它们也被去敏。

初版无盐原文码可枚举低熵后缀，已改为只读允许公开的分类字段；诊断自身异常也必须先停帧再显示原恢复层。实际 axis-courts 区域加入固定白名单。Tab 仅 keydown 前进，keyup 不二次移动；复制失败保留文本手动选择和重载。

入口：`node --test --test-concurrency=1 tests/r165-first-failure-diagnostic/*.test.mjs tests/r163-failure-recovery/*.test.mjs tests/r163-webgl-loss/*.test.mjs`。

未复现用户储秀宫真实首错；不能据此宣称根因修复。未测试浏览器/GPU、真实剪贴板权限或移动设备。
