# 御花园东井亭整亭候选
父版8ad8c90，原文MASTER-PROMPT第636行、FC-A9EE1A8071。原条目父页236519不足以独立定位；本轮发现并实际读取专页 https://www.dpm.org.cn/explore/building/236530.html 。
已实看官方3980.jpg（400×314）：绛雪轩附近，朱红四柱、白石栏与黄瓦起翘屋檐；前景植物遮挡基座和井口。专页明确面阔1.94m（专页直接给出的测量值；后补官刊柱高/径见下）、四柱方平面、45°转角桁方转八方、八脊盝顶中央开洞、四对合角吻、井口石覆石盖板；花草枋心苏式彩画、云龙栏柱/覆莲础为文字证据，细雕未复原。
官方全景内视点vp3341/sph1943239879303483392实际导航遇WebGL不支持，不称看过全景。公开前端所用无登录sphPicDetail API（POST id字符串）确认viewpointName东井亭内、独立坐标和官方东井亭视频。视频 https://file-pano.dpm.org.cn/video/2026/04/07/47580d9b5c854ba388c0a5118c72acd9.mp4 长4.72秒；实际读取1秒帧，清楚见红柱、四方转八方担梁、花草枋心、红绿椽层与向天敞开的八角天井。视频路径日期不是实拍日期。只保存来源记录，不把官方图/视频塞入项目纹理。

## 独立定位交叉验证
故宫官刊 https://img.dpm.org.cn/Uploads/File/2024/07/22/u669dd30a7f61c.pdf 第4页（刊页064）图1御花园现状平面图，复审实际看图：裁图1164×867的东侧小构筑符号中心约(985,514)。以天一/万春/千秋/钦安/浮碧/澄瑞六现锚仿射得(-48.39,460.03)，锚残差0.12–0.56m；加绛雪/养性得(-48.00,459.05)，残差0.06–1.18m。没有将示意图当测绘。
独立全景API相机点：东井亭内(503447.0396712506,305993.6675718958)，万春亭内(503450.8641743411,306006.2124823108)，千秋亭内(503343.84904601326,306002.4141193508)。以万春/千秋对应当前锚反射相似拟合scale1.00018464，东井亭(-48.151154,459.724514)；只相对万春单位平移得(-48.675497,459.555090)。取(-48.4,459.8)、至少±1m拟合误差。浮碧内相机落前抱厦非中心，不能强当第三建筑中心拉伸配准。旧未验(-48.2,457.7)不直接沿用。

## 现状与风险
无独立运行实例；旧x=-48纵甬路会穿新井亭。须原南北连通改局部双侧绕行，不能只加碰撞堵路。GardenBuilder采样用现碰撞体影响34株随机树；新增亭不得进入该采样输入并令全园洗牌。新亭在ZoneBase独立构建；地面仅局部铺装/床边真实裁剪，实际冲突树先测后决定，不删未冲突树。
绛雪轩另有官方完整外景/窗/梁层，可作下一整楼候选，但本轮不同时做。武英门/体元殿已有结构不能重复称新整对象。井亭顶部/基座/井盖高度与细节均为拟合；西井亭不同实例，不镜像生成。

## Supplement: exact column dimensions and railing type
Read-only reviewer actually inspected single-page official scan 黄希明《御花园井亭》p24, https://img.dpm.org.cn/Uploads/pdf/2206/T00024_00.pdf (linked by https://www.dpm.org.cn/building/talk/223440.html). East columns: span 1.94m, height 2.43m, diameter .28m. West 2m/.24m NOT borrowed. Four sides surrounded by white marble railing, 净瓶荷叶形“琵琶栏杆”, cloud-dragon posts, inverted-lotus drum bases. No reliable gate gap, stair orientation/count or cover outline in this image. Hidden railing closure and neutral cover outline remain explicit model fits, not a claim of historic closure/shape.

### Reproducible plan fit
PDF page index3; PyMuPDF clip Rect(115,73,503,362), Matrix(3,3) -> 1164×867. Manual centers: Tianyi(585,469)->(.5,465), Wanchun(1014,415)->(-52.5,472.1), Qianqiu(145,410)->(54.6,471.4), Qinan(585,233)->(0,493.1), Fubi(1017,178)->(-53.4,498.9), Chengrui(143,185)->(53.5,498.5). East-well small symbol(985,514), six-anchor least squares affine(-48.39069,460.02612); residuals .12,.49,.47,.41,.56,.45m. Manual estimated centers, NOT survey.
