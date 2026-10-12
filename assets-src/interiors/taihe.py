"""太和殿 S 档内景 → public/models/interiors/taihe.glb
用法：/Applications/Blender.app/Contents/MacOS/Blender -b -P assets-src/interiors/taihe.py -- public/models/interiors/taihe.glb

参数推导（全部对齐 PalaceBuilder.buildHall / throneArea，保证 GLB 盖住 B 档宝座区）：
  w 63, d 37, bays 11, nd 5 → bayW 5.727, dBay 7.4（data/interiors/taihe.json）
  三台顶 8 + 台明 ph = min(2.2, 3.1/1.6) = 1.9375 → 殿内地面 y = 9.9375
  H = clamp((35 − 9.9375) × 0.38, 5, 11) = 9.524
  ztb1 = 18.5 − min(0.6·7.4, 4.5) = 14.06；ztb0 = 14.06 − min(1.6·7.4, 7) = 7.06；thW = min(1.6·5.727, 63·0.25) = 9.16
  zc = 10.56；B 档宝座 tz = zc + 0.7 = 11.26；屏风 tz + 2.24 = 13.50；藻井 cz = zc − 1.05 = 9.51
  B 档金柱：!edge && |x| < 1.6·bayW(9.16) && z > ztb0 − dBay(−0.34)，去掉宝座正后方 (|x|<3.44, 6.06<z<15.06)
    → x = ±2.864, ±8.591；z = 3.7, 11.1 → 6 根（与资料"宝座两侧 6 根贴金云龙柱，直径 1 m"一致）
  B 档斗环半径 ≤ 1.05·bayW = 6.01 → 方井半宽 R 取 6.1 把它包住
资料：docs/research/interiors-taihe.md（七级宝座台约 2 m；陈设 象→甪端→鹤→香亭 由内向外）。
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from throne_hall import build

out = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'public/models/interiors/taihe.glb'

H = (35 - 9.9375) * 0.38           # 9.524
bayW = 63 / 11                      # 5.727
ztb0, ztb1, thW = 7.06, 14.06, 9.16
zc = (ztb0 + ztb1) / 2              # 10.56
tz = zc + 7 * 0.10                  # 11.26
cz = zc - 7 * 0.15                  # 9.51
xg1, xg2 = bayW * 0.5, bayW * 1.5   # 2.864, 8.591

cfg = dict(
    w=63, d=37, H=H,
    ztb0=ztb0, ztb1=ztb1, thW=thW,
    platH=2.0, steps=7, stepRun=0.42, stepW=3.6, balustrade=True,
    goldCols=[(-xg1, 3.7), (xg1, 3.7), (-xg2, 3.7), (xg2, 3.7), (-xg2, 11.1), (xg2, 11.1)],
    colR=0.5, colGold=True,
    throneZ=tz, screenZ=tz + 7 * 0.32, screenScale=1.15,
    caissonZ=cz, caissonR=6.1, circR=3.75,
    pearlY=H - 1.6, pearlR=0.45,
    # 四对陈设：宝座台两侧台阶旁，由内向外 象→甪端→鹤→香亭（东 = −x）
    ornaments=[(k, s * 5.8, z) for (k, z) in (('象', 7.6), ('甪端', 5.6), ('鹤', 3.6), ('香亭', 1.6)) for s in (-1, 1)],
    colBoxes=[],
    draco=True,
)
build(cfg, out)
