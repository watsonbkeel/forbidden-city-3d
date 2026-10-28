# 遂初堂南侧双承盆局部实做计划

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans；唯一产品写手实施，独立资料/图审只读。

**Goal:** 根据本堂官方图1533补两件现代码缺失的浅色高脚承盆实物，不改变建筑/台基/旧路。
**Architecture:** 独立SuichuFrontBasins模块，精确profile绑定；闭合实际多边底座/收腰支承/浅口厚壁盆面，逐世界三角接入既有精确接触。只新增6个源ID/2有限器物scope的注册兼容，不改全局求解算法。若必须新广域求解才能安全，撤回而不扩大范围。
**Tech Stack:** 项目已有Three.js、CourtKit、精确来源接触、Node测试与CPU预览。
**Spec:** docs/photo-fidelity/MASTER-PROMPT.md；原对象FC-E604D58704；官方本身图https://img.dpm.org.cn/Uploads/Picture/dc/1533[1024].jpg，已亲看。

## 已知、拟合、未验
- 图中前阶两侧各一浅色石质外观承盆，右件完整、左件部分；上圆浅口、收腰高支承和低座可见。
- 尺寸、左右间距、低座多边数和背面轮廓是照片有界拟合，不称测绘。
- 功能/年代/植物/铭文、完整雕花未知，不加无据花植。原台高与台阶本身仍不匹配照片，本次不借此宣全堂复原。
- 比起无据搬其他殿器物，采用仅本堂自身图；比起照片贴牌，实际闭体几何，不直接发布官方图片。

## Global Constraints
保留R146-fix三个源码累计、防回退；不改main/Pages/当前冻结；不性能专项。原身体/碰撞容差不放宽，不新增隐形填盆平面。无GPU时只报CPU/几何实测，实机VERIFY_PENDING。

## Review Focus
- 真实全区是否已有同物或相邻旧物占位：先源码+实际全world排重。
- 浅盆是真厚壁/内底，不是实心球；所有曲面和底座接合，无悬空。
- 中央入口/侧绕行10/60Hz走跑保留；源照片不授权堵路。
- 真实上方落到口沿→稳定→普通跳离/走离回地面，每帧原方身体对实际三角无穿透。
- 限定ID/变换与正常卸载释放；实际生产合批仍可见，不以独立mesh预览冒充生产。

## Task 1: 实物与安全闭环
- [ ] tests/followup-suichu/details.test.mjs先证明缺两实物红；保存冻结基线fixture。
- [ ] scripts/followup-suichu/audit-existing.mjs实际全world排重，保存坐标/旧物归属；对象自身和全区模型排重分别记录。
- [ ] 新src/scene/palace/special/SuichuFrontBasins.js与RemainingNingshouHalls单hook；精确6面源注册，保旧几何/物理字节。
- [ ] 验闭合/正体积/来源三角/单次释放/非法身份拒绝；真实控制器落稳走离与旧路线。
- [ ] 同镜CPU修改前后与原图人工审，当前GPU缺口保留。失败则修可独立局部问题或撤回，不隐藏红证。
- [ ] 必要继承/实际成熟合批/构建检查、README与残项；固定SHA交独审/唯一上传者，远端父974368afa409379beab1505eca89a02a47c9446d。
