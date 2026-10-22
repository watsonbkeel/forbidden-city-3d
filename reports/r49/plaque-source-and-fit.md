# R49 plaque correction scope and provenance

## 太极殿

R48's retained-throne shift selected every direct gold/lacquer mesh. This included the exterior plaque backing, which moved 2.2 model metres while its text stayed behind. R49 assigns the four retained throne components explicit semantic identities and restricts both their translation and width fitting to that identity. It does not alter throne dimensions, colliders, facade dimensions, or historic claims. The failed assertion is retained in `throne-isolation-before.txt`.

## 永和宫

Museum photographs:
- https://www.dpm.org.cn/explore/building/236518.html
- https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d39e4779a2.jpg
- https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d39e47b346.jpg

The second photograph was directly inspected. It shows a vertical nameboard suspended within the open baoxia, below the hall-side decorated lintel. The old generic board crossed the canopy beam/rafters in the model. The dedicated board retains its hall-side position but uses a reversible 1.05 × 1.5 model-metre fit and places its complete top below the canopy beam bottom with 0.15 model-metre clearance. These are clearance/visual-proportion fits, not surveyed dimensions or a dated-state facsimile. The existing simplified Chinese text and generic rectangular gilded border are retained; the photographed red carved frame, calligraphy and Manchu column are not claimed reproduced.

No canopy, building envelope, collision, stair or room route is moved to make the board visible. The production TextureLibrary and final material-merged scene are tested by rays at three ground distances, three lateral samples and three character-height samples (27 per hall). This validates geometry occlusion only, not real GPU rendering, glyph quality or mobile readability.

## Same-class scope

All 77 named zone halls are built with the actual TextureLibrary and every generated plaque must retain exactly one aligned matching backing. A separate 122-hall physical signature capture compares R48 to R49 without treating semantic metadata as geometry. Changed halls and validation results are listed in the final verification summary.

## 主敬殿 and 敬思殿

The actual joined front hall + connector + rear hall was tested, including final material merging. The former high rear boards crossed the connector's ceiling plane (6.58 model metres), hiding the upper two character zones. The front/rear envelopes and connector lengths are not changed.

The official Wenhua dated panorama directly shows a vertical 主敬殿 board suspended beneath a connector beam:
https://ggzlquanjing.dpm.org.cn/scene/ObQaC7pkO3j2wXKbtaUFp4v1SNh3Nv8T/20260911-dz/panos/a057.tiles/f/l1/01/l1_f_01_01.jpg

R49 uses a complete below-ceiling board and small suspension member. Width 1.05, height 1.5, ceiling clearance .18 and relative setback .8 are model fits, not photo measurements. The exact carved border and installation coordinate are not reproduced.

The official Wuying 2021 gallery viewpoints reviewed do not establish a corresponding 敬思殿 physical board or mount. Example:
https://ggzlquanjing.dpm.org.cn/scene/rOQSztMJ62XbrOjIj78rxu2KMZTcvyfg/20210517_wydtcg/panos/35.tiles/vr/pano_l.jpg
The existing 敬思殿 text is retained only as a readable model wayfinding sign. Its metadata explicitly says MODEL_WAYFINDING_LABEL_NOT_ATTESTED_HISTORICAL_PLAQUE. It is not presented as a reconstruction of a photographed object.

The museum's Wuying plan is useful for relative layout, but does not support widening the court to expose signs:
https://img.dpm.org.cn/Uploads/pdf/5077/T00008_00.pdf (page 8)
The old model's connector may already be proportionally long versus that drawing; correcting the whole precinct envelope is a separate evidence-based layout task, not hidden inside this plaque fix.

## 同类实体穿插修复

真实材质与生产 finish 合并后的同类巡查另外确认四处：景祺阁沿用了地层门洞的前后坐标，牌面位于上层门头后；文渊阁原牌面进入真实中柱约 5.7cm；养心殿新门头墙与旧牌面共面；重华宫原大牌穿入抱厦梁檩。只改注册文字与其自身框，不改柱墙、屋面、碰撞、殿间距。

- 景祺阁：按上层外墙 0.7m 模型退进量定位，保持旧模型名称标识身份，未宣称实物匾复原。
- 文渊阁：整套牌面与框向前移 0.2m，真实六间中柱保留。
- 养心殿：整套牌面与框置于新门头墙表面之外，向前移 0.3m。来源 https://www.dpm.org.cn/Uploads/wenhua/E44/E44c.html 。
- 重华宫：参考 https://img.dpm.org.cn/Uploads/Picture/2020/07/03/s5eff075737310.jpg 的檐下构图，将原模型名称板缩至 1.05×1.5m，顶面放到抱厦梁下。该数值仅可逆显示拟合，不是测绘或书法复刻。

4 条回归均先红后绿，实际 TextureLibrary 与 finish 后检测；另外精确身份回归保证同材质、同大小的其它装饰不受移动。畅音阁和咸若馆在极近仰视时的正常屋檐遮挡保留，不要求所有角度都可见。

## 材质筛选风险审查

太极的原错误是把所有同金色材质物体当作御座组件平移。R49 为四个保留御座组件加入独立语义身份，同时约束同类御座宽度拟合，防止重华等处也误伤匾框。新挂位修复通过注册的牌面与唯一 backing 对象成对操作，不再依赖颜色或几何大小猜测。

已检查 RemainingResidentialHalls、RemainingOuterHalls、RemainingNingshouHalls 内其它材料筛选：墙体替换还需位置/尺寸等约束，现有黄极旧件选择另有独立几何包络；这些不匹配金框与文字板，未为了刷绿无差别重写。整轮 77 命名殿宇逐套牌面/框匹配回归、真实材质合并后射线与物理外观/导航签名差分共同复核，不把 stub 材质结果当成验收。
