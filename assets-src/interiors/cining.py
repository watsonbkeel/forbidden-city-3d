"""慈宁宫 S 档内景（原状推断，低置信）→ public/models/interiors/cining.glb
用法：/Applications/Blender.app/Contents/MacOS/Blender -b -P assets-src/interiors/cining.py -- public/models/interiors/cining.glb

慈宁宫由 outer-west.json → ZoneBase.buildHall → CourtKit.hall 生成（kit 殿，不是 PalaceBuilder）。
**宝座 / 柱网 / 天花全部按 kit 公式；殿内没有金柱。**

参数推导（由 kit.js:363 公式算出，随后需实测核对）：
  w 42.1, d 26.8, colH 9.6, ph 1.2 → n = max(3, round(42.1/3.6)|1) = 13, bay = 3.238
  beamH = clamp(0.12·9.6, 0.45, 0.85) = 0.85 → 天花平面 = colH − beamH = 8.75（相对台面）
  后檐墙厚 0.6 → 墙内面 z = 13.4 − 0.3 = 13.1
  B 档宝座：tz = d/2 − min(2.6, 0.3d) = 13.4 − 2.6 = 10.8；tw = min(1.4·bay, 5) = 4.533
    台座 x±2.267 y 0~0.5 z 9.6~12.0；座 1.4×0.6×1.0；靠背 1.5×1.2×0.2 @ z 11.3；
    屏风 3.63×2.6×0.25 @ z 11.95；碰撞 x±2.267 z 9.6~12.1 y 0~3
本殿内容（P0，按「太后正宫、明间设宝座与屏风」推断）：
  · 满铺金砖地（现为雕塑馆，原铺地不详，按后宫正殿通例）
  · 地平床：下层 0.3（可直接迈上，WALK_）、上层 0.6 ≥ B 台座顶 0.5；无踏跺
  · 宝座 + 七扇屏风（宽度系数 0.55 → 总宽 4.125 > 3.63；厚 0.32 > 0.25）
  · 宝座前两侧各一座铜香筒（x ±4.0, z 8.0；在地平床外，不挡明间通道）
  · 无藻井（考证文档：未查到，推断井口天花）
置信度：宝座与屏风的「存在与位置」中；形制（座样、屏风扇数、地平床尺寸、香筒）纯推断，低。
未做（P1/P2）：慈宁燕喜图所绘典礼陈设、殿内匾联、彩画、后寝殿大佛堂。
资料：docs/research/interiors-cining.md
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
from throne_hall import build
from _common import *

out = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'public/models/interiors/cining.glb'

W, D = 42.1, 26.8
COLH = 9.6
BEAMH = 0.85
CEIL = COLH - BEAMH                   # 8.75：天花平面（相对台面）
TZ = D / 2 - min(2.6, 0.3 * D)        # 10.8
TW = min(W / 13 * 1.4, 5)             # 4.533


def incense(cfg):
    """宝座前两侧铜香筒：须弥座 + 铜筒 + 盖（在地平床外，带碰撞代理）"""
    bronze = mat('bronze'); gold = mat('gold_lacquer'); stone = mat('white_marble')
    for s in (-1, 1):
        x, z = s * 4.0, 8.0
        box('xt_base', 0.8, 0.5, 0.8, x, 0.25, z, stone)
        cylinder('xt_body', 0.2, 0.22, 1.2, x, 0.5 + 0.6, z, bronze, 14)
        cylinder('xt_band', 0.23, 0.23, 0.08, x, 1.0, z, gold, 14)
        cylinder('xt_lid', 0.02, 0.26, 0.28, x, 1.7 + 0.14, z, gold, 14)
        sphere('xt_top', 0.06, x, 2.0, z, gold, 8, 6)
        col_box(f'COL_xt_{s}', x - 0.45, 0, z - 0.45, x + 0.45, 2.1, z + 0.45)


cfg = dict(
    w=W, d=D, H=CEIL,
    ztb0=TZ - 1.2, ztb1=TZ + 1.3, thW=TW,
    dais=True, platH=0.6, lowH=0.3,
    daisLowX=2.95, daisLowZ0=8.5,
    daisX=2.45, daisZ0=9.4, daisZ1=12.2,
    goldCols=[], colR=0.3, colGold=False,
    throneZ=TZ, throneBackOff=0.5,
    screenZ=TZ + 1.15, screenScale=1.0, screenWidthScale=0.55, screenThick=0.32,
    noCaisson=True,
    ornaments=[],
    colBoxes=[],
    extra=incense,
    draco=True,
)
build(cfg, out)
