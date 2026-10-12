# P1-T · 测试工具链 报告

> 分支 `feat/p1-tests`（worktree `fc-tests`，起点 main 3ffd181），端口 5181。只改 tests/*、package.json scripts.test:*、docs/TESTING.md、本报告、REQUESTS.md「## P1-T」小节。

### 进度
- T-3 ✅ zone-lint 增强：新增 `tests/lib/world.mjs`（node 里用真实 ZoneBase/CourtKit/PalaceBuilder/Enclosure/GardenBuilder + CollisionManager 建出全场景碰撞世界，~1 s）；zone-lint 加 (7) bounds 重叠=错/相邻缝隙=警告/neighbors 引用与单向，(8) 每座门两侧：门洞中心被占=错、出门净空 <1.5 m=错 <4 m=警告、出门 12 m 内封闭死角=错，(9) enter 殿前/后门门前 2 m：中线走不进殿=错、2 m 内有其他构件但中线可走=警告；`--no-geo`、`ZONES_DIR` 选项。当前 main 数据：0 错 25 警告。回放 P0c-2 两处旧缺陷（养心殿院 z1 302、文华殿院 z1 −152）→ 3 错（永寿门/太极门/文渊阁院门 被封死）。 — (hash 见下一行)
