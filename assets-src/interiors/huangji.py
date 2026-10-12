"""皇极殿 S 档内景 → public/models/interiors/huangji.glb
用法：/Applications/Blender.app/Contents/MacOS/Blender -b -P assets-src/interiors/huangji.py -- public/models/interiors/huangji.glb

皇极殿由 ningshou.json → ZoneBase.buildHall → CourtKit.hall 生成（kit 殿，不是 PalaceBuilder）。
**宝座 / 柱网 / 天花全部按 kit 公式，不能套 taihe.py 的 PalaceBuilder 推导。**

参数推导（实测 getGroundHeight = 1.5 = ph，宝座碰撞 x±2.32 z 9.35~11.85，与公式一致）：
  w 49.8, d 26.3, colH 8.64, ph 1.5 → n = max(3, round(49.8/3.6)|1) = 15, bay = 3.32
  beamH = clamp(0.12·8.64, 0.45, 0.85) = 0.85 → 天花（一整块平面）高 colH − beamH = 7.79（相对台面），实际平面 7.77
  kit 殿只有前后檐两排柱，殿内没有金柱；后檐墙厚 0.6 → 墙内面 z = 13.15 − 0.3 = 12.85
  B 档宝座：tz = d/2 − min(2.6, 0.3d) = 13.15 − 2.6 = 10.55；tw = min(1.4·bay, 5) = 4.648
    台座 x±2.324, y 0~0.5, z 9.35~11.75；座 1.4×0.6×1.0 @ y0.5~1.1；靠背 1.5×1.2×0.2 @ z 11.05, y 1.0~2.2
    屏风 3.72×2.6×0.25 @ z 11.7, y 0.5~3.1；碰撞 x±2.324, z 9.35~11.85, y 0~3
GLB 包住这些盒子：
  · 地平床：下层 0.3（可直接迈上，WALK_ 可行走）、上层 0.6 ≥ B 台座顶 0.5；上层 z 9.2~11.95 覆盖 B 碰撞范围
  · 宝座（围屏式靠背 @ tz+0.5）、屏风 ws=0.55 → 总宽 4.125 > 3.72，最外扇高 2.6+0.66 > 3.1，厚 0.32 > 0.25
  · 藻井只能往下挂：顶面取 7.74（天花平面 7.77 之下），总深 1.8 m；
    宝座后 2.6 m 即后墙，所以藻井前移到 cz = 9.0、R = 2.9（方枋外缘 R+0.45 = 3.35 → z ≤ 12.35 < 12.85）
  · 4 根贴金蟠龙柱 x = ±3.9（避开藻井外缘 3.35 与地平床 2.95），z = 7.2 / 11.9（宝座前后），Ø0.84
资料：docs/research/interiors-huangji.md（P0：4 蟠龙柱 / 八角浑金蟠龙藻井 / 宝座 + 屏风 + 地平床）。
未做（P1/P2）：铜壶滴漏、自鸣钟、宝座前陈设、浑金雀替、金龙和玺贴图。
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from throne_hall import build

out = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'public/models/interiors/huangji.glb'

W, D = 49.8, 26.3
COLH = 8.64
H = COLH - 0.85                       # 7.79 天花（相对台面）
TZ = D / 2 - min(2.6, 0.3 * D)        # 10.55
CR = 0.42                             # 蟠龙柱半径
CX, CZ_F, CZ_B = 3.9, 7.2, 11.9

cfg = dict(
    w=W, d=D, H=H,
    # 测试机位用：B 档宝座碰撞 z 范围与宽
    ztb0=TZ - 1.2, ztb1=TZ + 1.3, thW=4.648,
    # 地平床
    dais=True, platH=0.6, lowH=0.3,
    daisLowX=2.95, daisLowZ0=8.3,
    daisX=2.45, daisZ0=9.2, daisZ1=11.95,
    goldCols=[(-CX, CZ_F), (CX, CZ_F), (-CX, CZ_B), (CX, CZ_B)],
    colR=CR, colGold=True,
    throneZ=TZ, throneBackOff=0.5,
    screenZ=TZ + 1.15, screenScale=1.0, screenWidthScale=0.55, screenThick=0.32,
    caissonZ=9.0, caissonR=2.9, circR=1.9, dragR=1.6,
    pearlY=H - 1.6, pearlR=0.4,
    ornaments=[],
    colBoxes=[(x - CR, 0, z - CR, x + CR, 3.0, z + CR) for (x, z) in ((-CX, CZ_F), (CX, CZ_F), (-CX, CZ_B), (CX, CZ_B))],
    draco=True,
)
build(cfg, out)
