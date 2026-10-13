"""乾清宫 S 档内景 → public/models/interiors/qianqing.glb
用法：/Applications/Blender.app/Contents/MacOS/Blender -b -P assets-src/interiors/qianqing.py -- public/models/interiors/qianqing.glb

参数推导（对齐 PalaceBuilder.buildHall / throneArea）：
  w 46, d 25, bays 9, nd 3 → bayW 5.111, dBay 8.333（data/interiors/qianqing.json）
  后三宫台 5 + 台明 ph = min(2.0, 3.1/1.6) = 1.9375 → 殿内地面 y = 6.9375
  H = clamp((26 − 6.9375) × 0.38, 5, 11) = 7.244
  ztb1 = 12.5 − min(5.0, 4.5) = 8.0；ztb0 = 8.0 − min(13.3, 7) = 1.0；thW = min(8.18, 11.5) = 8.18
  zc = 4.5；B 档宝座 tz = 5.2；屏风 tz + 2.24 = 7.44；藻井 cz = 4.5 − 1.05 = 3.45
  B 档"金柱"（本殿资料：全部朱红，无贴金 → colGold=False 用红漆覆盖）：
    |x| < 8.18 且 z > 1 − 8.33 = −7.33，去掉 (|x|<3.07, 0<z<9) → x = ±2.556, ±7.667；z = −4.167, 4.167 → 6 根
  B 档斗环半径 ≤ 1.05·bayW = 5.37 → R 取 5.4
  宝座台取 1.3 m（资料"约 1 m、3–5 级"；为盖住 B 档 1.25 m 宝座方盒略抬高）
资料：docs/research/interiors-qianqing.md（陈设：香亭 / 甪端 / 仙鹤 各一对，无宝象）。
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from throne_hall import build

out = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'public/models/interiors/qianqing.glb'

H = (26 - 6.9375) * 0.38            # 7.244
bayW = 46 / 9                       # 5.111
ztb0, ztb1, thW = 1.0, 8.0, 8.18
zc = (ztb0 + ztb1) / 2              # 4.5
tz = zc + 7 * 0.10                  # 5.2
cz = zc - 7 * 0.15                  # 3.45
xg1, xg2 = bayW * 0.5, bayW * 1.5   # 2.556, 7.667
zr = 25 / 3 / 2                     # 4.167

cfg = dict(
    w=46, d=25, H=H,
    ztb0=ztb0, ztb1=ztb1, thW=thW,
    platH=1.3, steps=5, stepRun=0.42, stepW=3.2, balustrade=True,
    goldCols=[(-xg1, -zr), (xg1, -zr), (-xg2, -zr), (xg2, -zr), (-xg2, zr), (xg2, zr)],
    colR=0.45, colGold=False,
    throneZ=tz, screenZ=tz + 7 * 0.32, screenScale=1.0,
    caissonZ=cz, caissonR=5.4, circR=3.75,
    pearlY=H - 1.6, pearlR=0.45,
    # 三对陈设：P2-S3 起陈于宝座地平床上、宝座前两侧（依据 docs/research/interiors-qianqing.md §5
    # 「香亭/甪端/仙鹤 各 1 对，宝座地平床前东西两侧」）。原先放在台下 x=±5.4，把 x=±5.7 的绕行通道堵死（金柱内皮 7.2，通道仅 0.27 m）。
    # 台面（z 0.95~8.05，x ±4.17，栏杆内缘 ±3.7，宝座座基 x ±1.1 / z 4.35~6.35）：
    #   后排 z=3.5：甪端 x=±1.9、鹤 x=±3.1；前排 z=2.1：香亭 x=±2.5。各占 1.0×1.0，最外沿 x=3.6。
    ornaments=[(k, s * x, z) for (k, x, z) in (('甪端', 1.9, 3.5), ('鹤', 3.1, 3.5), ('香亭', 2.5, 2.1)) for s in (-1, 1)],
    ornOnPlatform=True,
    colBoxes=[],
    draco=True,
)
build(cfg, out)
