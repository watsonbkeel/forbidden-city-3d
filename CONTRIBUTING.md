# 参与改进 / Contributing

这是陈华山、陈诺的独立、非官方故宫3D项目。欢迎可复现的问题、可靠资料和小范围Pull Request。

## 报告问题
记录游戏设置中的实际构建标识、浏览器/设备、宫殿与位置、操作步骤、预期与实际结果。人物或夜景问题附北京时间；碰撞问题附路线方向。截图不得包含私人资料或凭据。通过仓库 Issues 提交，先检查重复问题。

## 本地开发
使用支持本项目模块语法的 Node.js24 与 npm。已有 package-lock.json，应运行 npm ci，不要随意改依赖锁。

- npm ci
- npm run dev（当前默认路径 /gugong/）
- npm run build（默认生产子路径 /gugong/）
- VITE_BASE=/ npm run build（根路径检查）
- node --test tests/r79-discovery.test.mjs
- node --test tests/settings-menu.test.mjs
- npm run test:current-state

完整旧检查不是全绿。R78记录1290项中1139通过、151失败；后续版本应附其真实比较，不得把此旧快照当作新版本全部通过。

## 资料与改动边界
明确区分官方已知事实、照片拟合、工程/游戏适配、未知细节。估算不是测绘。提交来源URL、日期或论文页码与必要摘录，不上传无权再分发的素材或整本资料。游戏人物、床位和照明不自动构成历史事实。

保留累计功能、回滚点和旧失败证据。公共几何或碰撞修改需要扩大路线验证，覆盖地图、飞行、人物与夜景。CPU检查不能代替GPU、手机或视觉验收。PR应写明改动、测试命令与实际结果、来源、不确定性和回滚方法。未经项目维护者处理，不合并main或触发公开部署。

## English summary
Report the exact build, device/browser, location, steps, expected and actual behavior. Include Beijing time for lighting/routine issues. Use focused branches and pull requests, preserve cumulative functionality, cite reliable sources, and distinguish documented facts from photo/model fits and gameplay adaptations. Keep legacy failures visible. Never infer GPU/mobile acceptance from CPU tests.

The existing MIT LICENSE remains unchanged. Check external source and asset rights separately; this guide adds no new legal grant or contributor agreement.
