"""养心殿（前殿）S 档内景 → public/models/interiors/yangxin.glb
用法：/Applications/Blender.app/Contents/MacOS/Blender -b -P assets-src/interiors/yangxin.py -- public/models/interiors/yangxin.glb

养心殿由 west-six.json → ZoneBase.buildHall → CourtKit.hall 生成（kit 殿，不是 PalaceBuilder）。
**宝座 / 柱网 / 天花全部按 kit 公式；殿内没有金柱，也没有藻井（寝宫类建筑，资料明确"无藻井"）。**

实测（getGroundHeight = 0.6 = ph；宝座碰撞 x±2.29 z 2.2~4.7）与公式一致：
  w 36, d 12, colH 7.68, ph 0.6 → n = 11, bay = 3.273；beamH = clamp(0.12·7.68, 0.45, 0.85) = 0.85
  天花平面 = 台面 + 7.68 − 0.85 − 0.02 = 6.81；后檐墙厚 0.6 → 内面 z = 5.7；前檐槅扇内面 z ≈ −5.93
  明间正中一扇门（doorBays = {5}）→ doorX = 0；B 档宝座 tz = 6 − min(2.6, 3.6) = 3.4；tw = min(1.4·3.273, 5) = 4.58
    台座 x±2.29 y0~0.5 z 2.2~4.6；座 1.4×0.6×1.0；靠背 1.5×1.2×0.2 @ z 3.9 y 1.0~2.2；
    屏风 3.664×2.6×0.25 @ z 4.55 y 0.5~3.1；碰撞 x±2.29 z 2.2~4.7 y 0~3
本殿布局（殿局部坐标，+X = 西，−X = 东；原点殿心，地面 y=0）：
  · 明间 x∈[−6, 6]：金砖地、地平床（无踏跺，下层 0.3 可直接迈上）、宝座 + 七扇屏风 + 甪端 / 香筒、后墙「中正仁和」匾
  · 东暖阁 x∈[−18, −6]：木地板、西向宝座（面向 +X）+ 黄纱帷幔（两侧挽起，中间留空，从明间可见宝座）
  · 西暖阁 x∈[6, 18]：木地板（勤政亲贤 / 三希堂分隔属 P1，未做）
  · 隔断 x = ±6：楠木板壁 + 槅扇，各开一个 3.0 m 宽门洞（z ±1.5）；明间 x∈[−1.6, 1.6] 从前门到宝座前沿完全净空
未做（P1/P2）：三希堂小室与匾联、勤政亲贤匾、书案 / 炕 / 多宝格、后殿床榻、抱厦与假九间方柱、养心门铜狮影壁。
资料：docs/research/interiors-yangxin.md
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, math
from throne_hall import build
from _common import *
from _common import _to_b

out = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'public/models/interiors/yangxin.glb'

W, D = 36.0, 12.0
COLH, BEAMH = 7.68, 0.85
CEIL = COLH - BEAMH - 0.02          # 6.81：天花平面（相对台面）
TZ = D / 2 - min(2.6, 0.3 * D)       # 3.4
PX = 6.0                             # 隔断 x
Z_S, Z_N = -5.9, 5.7                 # 隔断南 / 北端（前檐槅扇内面 / 后墙内面）
GAP = 1.5                            # 门洞半宽（z ±1.5）
DOOR_H = 3.4                         # 门洞高


def partitions():
    """明间与东西暖阁之间的隔断：楠木板壁 + 槅扇 + 横披，各开一个门洞"""
    nan = mat('nanmu', (0.40, 0.25, 0.12), metallic=0.0, roughness=0.55)
    gold = mat('gold_lacquer'); lacq = mat('red_lacquer')
    for sx in (-1, 1):
        x = sx * PX
        # 横披（门洞上方整幅）：y DOOR_H ~ 6.78，下缘一道红漆额枋
        zc, zl = (Z_S + Z_N) / 2, Z_N - Z_S
        box(f'part_lintel_{sx}', 0.24, 0.3, zl, x, DOOR_H + 0.15, zc, lacq)
        box(f'part_transom_{sx}', 0.2, 6.78 - DOOR_H - 0.3, zl, x, DOOR_H + 0.3 + (6.78 - DOOR_H - 0.3) / 2, zc, nan)
        for k in range(3):   # 横披上三道金线
            box(f'part_transom_trim_{sx}_{k}', 0.24, 0.05, zl - 0.2, x, DOOR_H + 0.9 + k * 0.85, zc, gold)
        for (za, zb) in ((Z_S, -GAP), (GAP, Z_N)):
            L, c = zb - za, (za + zb) / 2
            # 下部板壁
            box(f'part_dado_{sx}', 0.22, 0.95, L, x, 0.06 + 0.475, c, nan)
            box(f'part_dado_trim_{sx}', 0.26, 0.05, L, x, 1.03, c, gold)
            # 上部槅扇：上下框 + 竖棂（约 0.38 一根）+ 一道横棂
            y0, y1 = 1.05, DOOR_H
            box(f'part_rail_top_{sx}', 0.2, 0.08, L, x, y1 - 0.04, c, nan)
            box(f'part_rail_bot_{sx}', 0.2, 0.08, L, x, y0 + 0.04, c, nan)
            box(f'part_rail_mid_{sx}', 0.12, 0.05, L, x, (y0 + y1) / 2, c, nan)
            n = max(2, round(L / 0.38))
            for i in range(n + 1):
                zz = za + L * i / n
                box(f'part_bar_{sx}', 0.1, y1 - y0 - 0.16, 0.05, x, (y0 + y1) / 2, zz, nan)
            # 碰撞（贯通到 3.0）
            col_box(f'COL_part_{sx}_{"s" if za < 0 else "n"}', x - 0.12, 0, za, x + 0.12, 3.0, zb)
        # 门洞两侧门框（红漆）
        for s2 in (-1, 1):
            box(f'part_jamb_{sx}', 0.26, DOOR_H - 0.06, 0.12, x, 0.06 + (DOOR_H - 0.06) / 2, s2 * GAP, lacq)


def wood_floors():
    """东西暖阁木地板：0.22 m 宽木板，板缝透出深色底（暖阁有地炕，资料：木地板）"""
    wood = mat('wood_floor', (0.30, 0.18, 0.09), metallic=0.0, roughness=0.6)
    seam = mat('brick_grout')
    for sx in (-1, 1):
        x0, x1 = (PX + 0.12, 17.6) if sx > 0 else (-17.6, -(PX + 0.12))
        L = x1 - x0; cx = (x0 + x1) / 2
        box(f'wf_base_{sx}', L, 0.02, 11.4, cx, 0.045, -0.1, seam)
        z = -5.7
        i = 0
        while z + 0.2 < 5.6:
            box(f'wf_plank_{sx}', L, 0.02, 0.2, cx, 0.058, z + 0.1, wood)
            z += 0.22; i += 1


def east_throne():
    """东暖阁西向宝座：地平床 + 宝座（面向 +X）+ 脚踏；碰撞整块"""
    gold = mat('gold_lacquer'); lacq = mat('red_lacquer'); silk = mat('yellow_silk'); stone = mat('white_marble')
    gauze = mat('yellow_gauze', (0.92, 0.74, 0.14), metallic=0.0, roughness=0.85)
    cx = -9.2
    # 地平床 x −10.7 ~ −7.7，z ±2.1，高 0.4
    box('edais', 3.0, 0.4, 4.2, cx - 0.0, 0.2, 0, lacq)
    box('edais_trim', 3.08, 0.05, 4.28, cx, 0.4, 0, gold)
    box('edais_top', 2.9, 0.04, 4.1, cx, 0.42, 0, stone)
    y = 0.44
    # 宝座：座在 x −9.9 ~ −8.7，靠背贴东（−x）侧
    box('ethrone_seat', 1.2, 0.5, 1.9, cx - 0.5, y + 0.25, 0, gold)
    box('ethrone_cushion', 1.0, 0.1, 1.7, cx - 0.5, y + 0.55, 0, silk)
    box('ethrone_back', 0.3, 1.4, 1.9, cx - 1.1, y + 0.7 + 0.5, 0, gold)
    box('ethrone_back_top', 0.34, 0.12, 2.0, cx - 1.1, y + 0.5 + 1.4 + 0.06, 0, gold)
    for s in (-1, 1):
        box('ethrone_arm', 1.0, 0.45, 0.16, cx - 0.5, y + 0.5 + 0.22, s * 0.95, gold)
        sphere('ethrone_arm_head', 0.11, cx + 0.05, y + 0.76, s * 0.95, gold, 10, 6)
    box('ethrone_stool', 0.6, 0.16, 1.1, cx + 0.5, y + 0.08, 0, lacq)
    col_box('COL_east_dais', cx - 1.5, 0, -2.1, cx + 1.5, 3.0, 2.1)
    # 黄纱帷幔：贴隔断东侧 x = −6.4；上沿帷额横贯，两侧各一束挽起的垂幔，中间 ±0.8 留空
    xg = -(PX + 0.4)
    box('gauze_valance', 0.14, 0.5, 4.2, xg, DOOR_H - 0.1, 0, gauze)
    box('gauze_valance_trim', 0.18, 0.06, 4.24, xg, DOOR_H - 0.38, 0, gold)
    for s in (-1, 1):
        for k in range(9):
            zz = s * (0.85 + k * 0.17)
            off = 0.05 if k % 2 else -0.05
            h = 2.7 - 0.05 * k       # 向外侧渐短（挽起的弧线）
            box(f'gauze_fold_{s}', 0.08, h, 0.17, xg + off, DOOR_H - 0.38 - h / 2, zz, gauze)


def incense():
    """香筒：须弥座 + 铜筒 + 盖（甪端由 cfg.ornaments 生成）"""
    bronze = mat('bronze'); gold = mat('gold_lacquer'); stone = mat('white_marble')
    for s in (-1, 1):
        x, z = s * 4.0, 1.5
        box('xt_base', 0.8, 0.5, 0.8, x, 0.25, z, stone)
        cylinder('xt_body', 0.2, 0.22, 1.2, x, 0.5 + 0.6, z, bronze, 14)
        cylinder('xt_band', 0.23, 0.23, 0.08, x, 1.0, z, gold, 14)
        cylinder('xt_lid', 0.02, 0.26, 0.28, x, 1.7 + 0.14, z, gold, 14)
        sphere('xt_top', 0.06, x, 2.0, z, gold, 8, 6)
        col_box(f'COL_xt_{s}', x - 0.45, 0, z - 0.45, x + 0.45, 2.1, z + 0.45)


def plaque():
    """后墙「中正仁和」匾（雍正御笔）：蓝地金框 + 金字（Blender 文字转网格）"""
    blue = mat('caisson_blue'); gold = mat('gold_lacquer')
    zb = Z_N - 0.06                       # 贴后墙内面（5.7）
    yc, bw, bh = 5.55, 3.2, 1.0
    box('plaque_board', bw, bh, 0.1, 0, yc, zb, blue)
    for s in (-1, 1):
        box('plaque_frame_h', bw + 0.16, 0.08, 0.14, 0, yc + s * (bh / 2 + 0.04), zb - 0.01, gold)
        box('plaque_frame_v', 0.08, bh, 0.14, s * (bw / 2 + 0.04), yc, zb - 0.01, gold)
    n_before = tri_count()
    font = None
    for p in ('/System/Library/Fonts/Supplemental/Songti.ttc', '/System/Library/Fonts/STHeiti Medium.ttc'):
        try:
            font = bpy.data.fonts.load(p); break
        except Exception as e:
            print('[font] load failed', p, e)
    cu = bpy.data.curves.new('plaque_text', 'FONT')
    cu.body = '中正仁和'
    cu.size = 0.66; cu.extrude = 0.02; cu.resolution_u = 3
    cu.align_x = 'CENTER'; cu.align_y = 'CENTER'; cu.space_character = 1.15
    if font: cu.font = font
    ob = bpy.data.objects.new('plaque_text', cu)
    bpy.context.scene.collection.objects.link(ob)
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.convert(target='MESH')
    ob = bpy.context.view_layer.objects.active
    ob.name = 'plaque_text'
    ob.data.materials.append(gold)
    ob.rotation_euler = (math.pi / 2, 0, math.pi)      # 立起并朝南（-Z），从殿内看字不反
    ob.location = _to_b(0, yc, zb - 0.07)
    print(f'[plaque] text tris≈{tri_count() - n_before}  font={"ok" if font else "none"}')


def extra(cfg):
    partitions()
    wood_floors()
    east_throne()
    incense()
    plaque()


cfg = dict(
    w=W, d=D, H=CEIL,
    ztb0=TZ - 1.2, ztb1=TZ + 1.3, thW=4.58,
    # 明间金砖地（x ±5.9 / z ±5.9）
    floorW=11.8, floorD=11.8,
    # 地平床：下层 0.3 可直接迈上（WALK_）；上层 0.5 包住 B 档台座（顶 0.5）；不带踏跺
    dais=True, platH=0.5, lowH=0.3,
    daisLowX=3.0, daisLowZ0=1.2,
    daisX=2.45, daisZ0=2.0, daisZ1=4.8,
    goldCols=[], colR=0.3, colGold=False,
    throneZ=TZ, throneBackOff=0.5,
    screenZ=TZ + 1.15, screenScale=1.0, screenWidthScale=0.55, screenThick=0.32,
    noCaisson=True,
    ornaments=[('甪端', -4.0, 3.2), ('甪端', 4.0, 3.2)],
    colBoxes=[],
    extra=extra,
    draco=True,
)
build(cfg, out)
