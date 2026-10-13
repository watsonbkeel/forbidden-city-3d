"""坤宁宫 S 档内景 → public/models/interiors/kunning.glb
用法：/Applications/Blender.app/Contents/MacOS/Blender -b -P assets-src/interiors/kunning.py -- public/models/interiors/kunning.glb

坤宁宫不是宝座殿：由 PalaceBuilder.buildHall 生成，但 REAL['坤宁宫'] 没有 throne 字段，B 档无宝座 / 屏风 / 藻井，
所以本脚本**不使用 throne_hall.build**，只借 gold_floor。

实测（getGroundHeight = 6.9375 = 后三宫台 + 台明；B 档内部只有 16 根柱，无宝座碰撞）：
  w 46, d 20, 9 间 × 3 进深 → bayW = 5.111, dBay = 6.667；柱线 x = −23 + i·5.111，内柱 z = ±3.33，柱半径 0.41
  H = clamp((26 − 6.9375)·0.38, 5, 11) = 7.244；B 天花平面 = H − 0.05 = 7.194；额枋 beamH = 0.87 → 梁底 6.32
  B 敞开的是中间 3 间（明间 + 左右次间，|x| < 7.67），前后檐其余各间是隔扇门 + 墙
  两山墙内面 x = ±22.55；前后檐内面 z = ±9.92

分间（局部坐标，−X = 东，+X = 西；bay j 覆盖 x ∈ [−23 + j·5.111, −23 + (j+1)·5.111]）：
  bay 0–1  x −23 ~ −12.78   东暖阁（大婚洞房）：红帷、红地金囍顶棚、龙凤喜床（北）、囍字影壁（进门处）
  bay 2    x −12.78 ~ −7.67 东次间：南墙开**双扇板门**（非明间！）；北墙后檐设**锅灶 2 口 + 毗卢罩**
  bay 3–6  x −7.67 ~ 12.78  门西 4 间：祭神场所。**南、北、西三面炕**；北炕上设神龛 / 神位；西炕上方挂神幔
  bay 7–8  x 12.78 ~ 23     西两间：官方页未明说，仅隔断 + 直棂窗（低置信，推断）
  其余 bay 的前后檐：**直棂吊搭式窗**（取代菱花槅扇窗），窗纸 emissive 0.3 模拟糊纸透光
  暖阁与祭神区之间、祭神区与西两间之间各有一道隔断（x = ∓12.78 / 12.78，柱线上），各开 2.4 m 门洞

与 B 档的取舍（必须保持）：
  · 明间通道 |x| < 2.4 全程无碰撞物（stepwalk 走 x=0；walk.cjs 走 x=4.7、z ∈ [−6.1, 6.9]），炕只放 |z| ≥ 8.1 的两侧
  · B 档中间 3 间敞开 ≠ 史实（史实是东次间一扇板门），B 不改；S 档把板门做在东次间，并在敞开间前沿放炕，通道在明间
  · 板门 / 窗 / 灶 / 红帷全是内壁贴面（无碰撞），仅炕、灶、床、神龛、影壁、隔断登记碰撞代理
资料：docs/research/interiors-kunning.md（P0：东次间板门 + 直棂窗、东暖阁、西侧三面炕；P1 做了灶间 + 毗卢罩 + 神龛）
未做（P1/P2）：殿外烟囱、嘉庆联、神杆、窗纸材质细节、西两间功能、穿堂
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, math
from _common import *
from _common import _to_b
from throne_hall import gold_floor

out = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'public/models/interiors/kunning.glb'

W, D = 46.0, 20.0
BW = W / 9                       # 5.111
LINE = lambda i: -W / 2 + i * BW
H_B = (26 - 6.9375) * 0.38       # 7.244：B 档室内净高
CEIL = H_B - 0.05                # 7.194：B 天花平面
BEAM_BOT = 6.3                   # 墙面贴物上沿（B 额枋底 6.37）
PART_TOP = CEIL - 0.03           # 隔断顶（封到天花下）
ZIN = 9.84                       # 前后檐红墙内面 9.85（隔扇内面 9.925）→ 贴物都放在 |z| ≤ 9.84
XE = -22.45                      # 东山墙：下碱砖墙内面 −22.5，贴物放 −22.45
ZS, ZN = -ZIN, ZIN
XW = 22.45
PX_E, PX_W = LINE(2), LINE(7)    # 东暖阁隔断 −12.78 / 西两间隔断 12.78
ZGAP = 1.2                       # 隔断门洞半宽

reset_scene()

# ───────── 材质 ─────────
gold = mat('gold_lacquer', (0.83, 0.62, 0.20), metallic=0.9, roughness=0.28)
lacq = mat('red_lacquer', (0.42, 0.09, 0.06), metallic=0.1, roughness=0.38)
silk = mat('yellow_silk', (0.85, 0.62, 0.18), metallic=0.0, roughness=0.8)
dark = mat('brick_grout', (0.08, 0.08, 0.08), metallic=0.0, roughness=0.9)
brick = mat('gold_brick', (0.17, 0.18, 0.18), metallic=0.05, roughness=0.35)
stone = mat('white_marble', (0.78, 0.77, 0.73), metallic=0.0, roughness=0.55)
bronze = mat('bronze', (0.29, 0.23, 0.16), metallic=0.75, roughness=0.42)
nanmu = mat('nanmu', (0.40, 0.25, 0.12), metallic=0.0, roughness=0.55)
red_cloth = mat('red_cloth', (0.58, 0.04, 0.05), metallic=0.0, roughness=0.9)
red_carpet = mat('red_carpet', (0.36, 0.02, 0.03), metallic=0.0, roughness=0.95)
kang_brick = mat('kang_brick', (0.33, 0.30, 0.27), metallic=0.0, roughness=0.85)
kang_wood = mat('kang_wood', (0.28, 0.17, 0.08), metallic=0.0, roughness=0.6)
kang_mat = mat('kang_mat', (0.58, 0.47, 0.28), metallic=0.0, roughness=0.95)
iron = mat('cast_iron', (0.05, 0.05, 0.06), metallic=0.6, roughness=0.5)
soot = mat('soot_wall', (0.11, 0.10, 0.09), metallic=0.0, roughness=0.95)
paper = mat('window_paper', (0.86, 0.80, 0.62), metallic=0.0, roughness=0.9, emission=(0.9, 0.8, 0.55), emission_strength=0.3)

FONT = None
for p in ('/System/Library/Fonts/STHeiti Medium.ttc', '/System/Library/Fonts/Supplemental/Songti.ttc'):
    try:
        FONT = bpy.data.fonts.load(p); break
    except Exception as e:
        print('[font] load failed', p, e)
# 注：Songti 没有"囍"字，必须用 STHeiti（囍 / 喜 / 卍 都有）


# ───────── 文字字形 ─────────
def make_glyph(text, size, m, res=2, name='glyph'):
    """文字曲线 → 平面网格（extrude 0，单层，约 200~500 tris）；返回主对象，用 place_glyph 复制摆放"""
    cu = bpy.data.curves.new(name, 'FONT')
    cu.body = text; cu.size = size; cu.extrude = 0.0; cu.resolution_u = res
    cu.align_x = 'CENTER'; cu.align_y = 'CENTER'
    if FONT: cu.font = FONT
    ob = bpy.data.objects.new(name, cu)
    bpy.context.scene.collection.objects.link(ob)
    for o in bpy.context.scene.objects: o.select_set(False)
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.convert(target='MESH')
    ob = bpy.context.view_layer.objects.active
    ob.name = name
    ob.data.materials.append(m)
    return ob

# 朝向（Blender 欧拉 XYZ，three 坐标语义）：竖立 + 绕 Z 转
FACE_DOWN = (math.pi, 0, 0)               # 天花上，从下往上看
FACE_S = (math.pi / 2, 0, math.pi)        # 朝南 (−Z)
FACE_N = (math.pi / 2, 0, 0)              # 朝北 (+Z)
FACE_W = (math.pi / 2, 0, math.pi / 2)    # 朝 +X（西）
FACE_E = (math.pi / 2, 0, -math.pi / 2)   # 朝 −X（东）

def place_glyph(master, x, y, z, rot):
    o = master.copy()
    bpy.context.scene.collection.objects.link(o)
    o.location = _to_b(x, y, z)
    o.rotation_euler = rot
    return o


# ───────── 地面 ─────────
def floors():
    # 全殿金砖（后三宫同制）。不用 throne_hall.build，只借 gold_floor
    gold_floor(dict(w=W, d=D, floorW=W - 0.5, floorD=D - 0.4), dark, brick)
    # 东暖阁大红地毯
    box('carpet_east', (PX_E - XE) - 0.4, 0.03, 2 * 9.7, (XE + 0.2 + PX_E - 0.2) / 2, 0.062, 0, red_carpet)


# ───────── 隔断 ─────────
def partition(x, name, red=True):
    face = red_cloth if red else lacq
    for (za, zb) in ((-ZIN, -ZGAP), (ZGAP, ZIN)):
        L = zb - za; c = (za + zb) / 2
        box(f'{name}_dado', 0.22, 1.05, L, x, 0.525, c, lacq)
        box(f'{name}_dado_trim', 0.26, 0.05, L, x, 1.07, c, gold)
        box(f'{name}_upper', 0.16, PART_TOP - 1.1, L, x, 1.1 + (PART_TOP - 1.1) / 2, c, face)
        n = max(2, round(L / 0.95))
        for i in range(n + 1):                                     # 金色竖条（两面）
            for sx in (-1, 1):
                box(f'{name}_batten', 0.05, PART_TOP - 1.5, 0.05, x + sx * 0.1, 1.2 + (PART_TOP - 1.5) / 2, za + L * i / n, gold)
        col_box(f'COL_{name}_{"s" if za < 0 else "n"}', x - 0.15, 0, za, x + 0.15, 3.0, zb)
    # 门洞：门框 + 横披
    for s in (-1, 1):
        box(f'{name}_jamb', 0.28, 3.4, 0.14, x, 1.7, s * ZGAP, lacq)
    box(f'{name}_lintel', 0.28, 0.3, 2 * ZGAP + 0.3, x, 3.45, 0, gold)
    box(f'{name}_transom', 0.16, PART_TOP - 3.6, 2 * ZGAP, x, 3.6 + (PART_TOP - 3.6) / 2, 0, face)
    box(f'{name}_transom_trim', 0.2, 0.05, 2 * ZGAP, x, 4.6, 0, gold)


# ───────── 直棂吊搭窗 ─────────
def window(xc, s, bw=4.5):
    zz = lambda off: s * (ZIN - off)            # off 越大越靠室内
    y0, y1 = 1.15, 4.6
    h = y1 - y0; yc = (y0 + y1) / 2
    box('win_paper', bw, h, 0.01, xc, yc, zz(0.0), paper)
    nb = round(bw / 0.15)
    for i in range(nb + 1):                      # 直棂：竖条，不做斜格 / 菱花
        box('win_bar', 0.035, h, 0.035, xc - bw / 2 + bw * i / nb, yc, zz(0.04), nanmu)
    for yy in (y0 + 0.04, yc, y1 - 0.04):
        box('win_rail', bw + 0.2, 0.08, 0.07, xc, yy, zz(0.05), lacq)
    for sx in (-1, 1):
        box('win_stile', 0.12, h + 0.1, 0.08, xc + sx * (bw / 2 + 0.06), yc, zz(0.05), lacq)
    box('win_sill', bw + 0.3, y0, 0.06, xc, y0 / 2, zz(0.03), kang_brick)
    box('win_transom', bw + 0.3, BEAM_BOT - y1, 0.06, xc, y1 + (BEAM_BOT - y1) / 2, zz(0.03), lacq)


def windows():
    for j in (6, 7, 8):
        xc = LINE(j) + BW / 2
        for s in (-1, 1):
            window(xc, s)


# ───────── 东次间双扇板门（南墙）─────────
def board_door():
    xc = LINE(2) + BW / 2                        # −10.22
    zb = ZS + 0.03                               # 门板中心（室内侧）
    box('door_backing', BW - 0.3, BEAM_BOT, 0.04, xc, BEAM_BOT / 2, ZS + 0.02, lacq)
    doorW, doorH = 2.8, 3.7
    for sx in (-1, 1):
        cx = xc + sx * doorW / 4
        box('door_leaf', doorW / 2 - 0.03, doorH, 0.09, cx, doorH / 2 + 0.1, zb + 0.05, nanmu)
        for k in range(5):                       # 门钉 5 × 6
            for r in range(6):
                box('door_stud', 0.07, 0.07, 0.04, cx - 0.5 + k * 0.25, 0.55 + r * 0.5, zb + 0.11, bronze)
        box('door_handle', 0.12, 0.12, 0.05, xc + sx * 0.14, 1.5, zb + 0.12, bronze)
    for sx in (-1, 1):                           # 门框
        box('door_jamb', 0.18, doorH + 0.2, 0.14, xc + sx * (doorW / 2 + 0.09), (doorH + 0.2) / 2 + 0.05, zb + 0.04, lacq)
    box('door_lintel', doorW + 0.5, 0.22, 0.16, xc, doorH + 0.21, zb + 0.04, lacq)
    box('door_lintel_trim', doorW + 0.54, 0.04, 0.18, xc, doorH + 0.34, zb + 0.04, gold)
    box('door_transom', doorW + 0.2, 0.3, 0.03, xc, doorH + 0.58, zb + 0.02, gold)
    box('door_sill', doorW + 0.4, 0.1, 0.4, xc, 0.05, ZS + 0.25, stone)


# ───────── 炕 ─────────
def kang(name, x0, x1, z0, z1):
    cx, cz = (x0 + x1) / 2, (z0 + z1) / 2
    box(f'{name}_body', x1 - x0, 0.46, z1 - z0, cx, 0.23, cz, kang_brick)
    box(f'{name}_edge', x1 - x0, 0.06, z1 - z0, cx, 0.49, cz, kang_wood)
    box(f'{name}_mat', x1 - x0 - 0.16, 0.04, z1 - z0 - 0.16, cx, 0.54, cz, kang_mat)
    col_box(f'COL_{name}', x0, 0, z0, x1, 0.56, z1)

KX0, KX1 = 2.5, 12.3                              # 西半炕 x 范围
KXE0, KXE1 = -7.5, -2.5                           # 东半炕（明间通道 |x|<2.5 留空）
KZ = 8.1                                          # 炕沿 z（南炕 −9.9~−8.1，北炕 8.1~9.9）
KW0, KW1 = 10.8, 12.3                             # 西炕 x

def kangs():
    kang('kang_s_w', KX0, KX1, -9.9, -KZ)
    kang('kang_s_e', KXE0, KXE1, -9.9, -KZ)
    kang('kang_n_w', KX0, KX1, KZ, 9.9)
    kang('kang_n_e', KXE0, KXE1, KZ, 9.9)
    kang('kang_w', KW0, KW1, -KZ, KZ)             # 西炕：把南北炕连成 U 形


def shrine():
    """北炕上的神龛 / 神位（萨满祭神）"""
    x, z = 7.4, 9.5
    y = 0.58
    box('shrine_base', 2.5, 0.2, 0.75, x, y + 0.1, z, nanmu)
    box('shrine_body', 2.2, 1.4, 0.5, x, y + 0.2 + 0.7, z, lacq)
    box('shrine_roof', 2.5, 0.12, 0.8, x, y + 0.2 + 1.4 + 0.06, z, gold)
    for k in (-1, 0, 1):                          # 三个神位牌
        box('shrine_tablet', 0.5, 0.95, 0.04, x + k * 0.7, y + 0.2 + 0.75, z - 0.27, gold)
    for k in (-1, 1):                             # 供烛
        cylinder('shrine_candle', 0.04, 0.04, 0.4, x + k * 1.0, y + 0.2, z - 0.55, gold, 8)
    col_box('COL_shrine', x - 1.25, 0.56, z - 0.4, x + 1.25, 2.4, z + 0.4)


def spirit_curtain():
    """西炕上方神幔（挂在西隔断东面）"""
    x = PX_W - 0.2
    box('curtain_main', 0.04, 3.0, 11.5, x, 1.3 + 1.5, 0, silk)
    box('curtain_top', 0.08, 0.3, 11.8, x, 4.45, 0, gold)
    box('curtain_edge', 0.06, 3.0, 0.12, x, 2.8, -5.85, red_cloth)
    box('curtain_edge', 0.06, 3.0, 0.12, x, 2.8, 5.85, red_cloth)
    for k in range(24):                           # 流苏
        box('curtain_fringe', 0.05, 0.28, 0.05, x, 1.16, -5.6 + k * 0.49, gold)


# ───────── 灶间 ─────────
def stoves():
    xs = (-11.3, -9.1)
    zc = 9.2
    box('soot_back', 4.8, 3.2, 0.04, -10.2, 1.6, ZN - 0.04, soot)
    for x in xs:
        box('stove_body', 1.7, 1.15, 1.3, x, 0.575, zc, kang_brick)
        box('stove_rim', 1.8, 0.08, 1.4, x, 1.19, zc, kang_wood)
        cylinder('stove_pot', 0.52, 0.55, 0.38, x, 1.23 + 0.19, zc, iron, 20)
        cylinder('stove_lid', 0.08, 0.6, 0.26, x, 1.23 + 0.38 + 0.12, zc, kang_wood, 20)
        box('stove_mouth', 0.5, 0.5, 0.05, x, 0.4, zc - 0.67, soot)
    col_box('COL_stove', -12.3, 0, 8.5, -8.1, 1.3, 9.9)
    # 毗卢罩：浑金，悬于灶上（2.4 m 以上，不挡路 → 不登记碰撞）
    box('pilu_top', 4.6, 0.2, 1.35, -10.2, 3.3, zc, gold)
    box('pilu_valance', 4.6, 0.7, 0.1, -10.2, 2.9, zc - 0.65, gold)
    box('pilu_inner', 4.4, 0.05, 1.15, -10.2, 3.18, zc, lacq)
    for i in range(10):
        sphere('pilu_ball', 0.09, -12.2 + i * 0.44, 2.5, zc - 0.65, gold, 8, 6)
    for s in (-1, 1):
        box('pilu_post', 0.12, 0.8, 0.12, -10.2 + s * 2.25, 2.9, zc - 0.62, gold)


# ───────── 东暖阁 ─────────
def east_chamber():
    # 大红帷帐贴三面墙
    box('drape_east', 0.05, BEAM_BOT, 2 * 9.7, XE + 0.04, BEAM_BOT / 2, 0, red_cloth)
    for s in (-1, 1):
        box('drape_side', (PX_E - XE) - 0.45, BEAM_BOT, 0.04, (XE + 0.45 + PX_E) / 2, BEAM_BOT / 2, s * 9.89, red_cloth)
    # 帷幔金边：下 1.0 / 上 4.2
    for yy in (1.0, 4.2):
        box('drape_trim_e', 0.07, 0.07, 19.4, XE + 0.06, yy, 0, gold)
        for s in (-1, 1):
            box('drape_trim_s', (PX_E - XE) - 0.5, 0.07, 0.06, (XE + 0.45 + PX_E) / 2, yy, s * 9.88, gold)

    # 红地金囍顶棚：整片红底（B 天花之下 0.06）+ 7 × 3 囍字 + 金色格线
    cx0, cx1 = XE + 0.4, PX_E - 0.1
    xm = (cx0 + cx1) / 2
    box('ceil_red', cx1 - cx0, 0.02, 19.6, xm, CEIL - 0.06, 0, red_cloth)
    xs = (-20.6, -17.8, -15.0)
    zs = [-8.1 + k * 2.7 for k in range(7)]
    g = make_glyph('囍', 1.05, gold, res=1, name='xi_ceiling')
    for x in xs:
        for z in zs:
            place_glyph(g, x, CEIL - 0.085, z, FACE_DOWN)
    bpy.data.objects.remove(g)
    for x in (-19.2, -16.4):
        box('ceil_line_x', 0.05, 0.03, 19.4, x, CEIL - 0.07, 0, gold)
    for k in range(8):
        box('ceil_line_z', cx1 - cx0, 0.03, 0.05, xm, CEIL - 0.07, -9.45 + k * 2.7, gold)

    # 囍字影壁（进门处，两面各一大囍）：x = −14.8，z ±1.8
    sx = -14.8
    box('screen_base', 0.5, 0.25, 3.9, sx, 0.125, 0, stone)
    box('screen_wall', 0.2, 2.9, 3.6, sx, 0.25 + 1.45, 0, red_cloth)
    box('screen_cap', 0.34, 0.15, 3.8, sx, 3.25, 0, gold)
    box('screen_frame_a', 0.24, 0.07, 3.4, sx, 0.5, 0, gold)
    box('screen_frame_b', 0.24, 0.07, 3.4, sx, 2.85, 0, gold)
    for z in (-1.75, 1.75):
        box('screen_frame_v', 0.24, 2.4, 0.07, sx, 1.7, z, gold)
    gb = make_glyph('囍', 2.0, gold, res=3, name='xi_screen')
    place_glyph(gb, sx + 0.12, 1.7, 0, FACE_W)        # 面向门洞（+X）
    place_glyph(gb, sx - 0.12, 1.7, 0, FACE_E)
    bpy.data.objects.remove(gb)
    col_box('COL_screen', sx - 0.15, 0, -1.8, sx + 0.15, 3.0, 1.8)

    # 龙凤喜床（东梢间北，床头靠北墙）
    x0, x1, z0, z1 = -21.8, -17.8, 6.4, 9.6
    bx, bz = (x0 + x1) / 2, (z0 + z1) / 2
    box('bed_platform', x1 - x0, 0.5, z1 - z0, bx, 0.25, bz, lacq)
    box('bed_platform_trim', x1 - x0 + 0.08, 0.06, z1 - z0 + 0.08, bx, 0.5, bz, gold)
    box('bed_mattress', x1 - x0 - 0.3, 0.16, z1 - z0 - 0.3, bx, 0.58, bz, red_cloth)
    for s in (-1, 1):                                           # 鸳鸯枕
        box('bed_pillow', 0.9, 0.2, 0.5, bx + s * 0.9, 0.76, 9.1, silk)
    box('bed_quilt', 3.2, 0.12, 1.8, bx, 0.72, 7.5, red_cloth)
    box('bed_quilt_trim', 3.24, 0.03, 0.06, bx, 0.78, 6.6, gold)
    # 帐架：四柱 + 帐顶 + 帐檐
    for (px, pz) in ((x0 + 0.1, z0 + 0.1), (x1 - 0.1, z0 + 0.1), (x0 + 0.1, z1 - 0.1), (x1 - 0.1, z1 - 0.1)):
        cylinder('bed_post', 0.06, 0.06, 2.4, px, 0.5 + 1.2, pz, gold, 10)
        sphere('bed_post_cap', 0.09, px, 2.95, pz, gold, 8, 6)
    box('bed_canopy', x1 - x0 + 0.2, 0.05, z1 - z0 + 0.2, bx, 3.0, bz, red_cloth)
    box('bed_canopy_frame_a', x1 - x0 + 0.24, 0.1, 0.1, bx, 2.9, z0 + 0.1, gold)
    box('bed_canopy_frame_b', x1 - x0 + 0.24, 0.1, 0.1, bx, 2.9, z1 - 0.1, gold)
    for s in (-1, 1):
        box('bed_canopy_frame_c', 0.1, 0.1, z1 - z0 + 0.1, bx + s * (x1 - x0) / 2 + (-s) * 0.1, 2.9, bz, gold)
    box('bed_valance', x1 - x0 + 0.2, 0.45, 0.04, bx, 2.65, z0 - 0.02, red_cloth)
    box('bed_valance_trim', x1 - x0 + 0.24, 0.05, 0.06, bx, 2.42, z0 - 0.02, gold)
    # 床头围屏（龙凤雕花）+ 囍
    box('bed_headboard', x1 - x0 - 0.1, 2.1, 0.1, bx, 0.5 + 1.05, z1 - 0.05, red_cloth)
    box('bed_headboard_frame_t', x1 - x0, 0.1, 0.14, bx, 2.65, z1 - 0.05, gold)
    box('bed_headboard_frame_b', x1 - x0, 0.1, 0.14, bx, 0.62, z1 - 0.05, gold)
    for s in (-1, 1):
        box('bed_headboard_frame_v', 0.1, 2.1, 0.14, bx + s * (x1 - x0) / 2, 1.6, z1 - 0.05, gold)
    gh = make_glyph('囍', 1.1, gold, res=3, name='xi_bed')
    place_glyph(gh, bx, 1.75, z1 - 0.12, FACE_S)
    bpy.data.objects.remove(gh)
    for s in (-1, 1):                                           # 床侧挽起的帐幔
        box('bed_curtain', 0.5, 2.1, 0.18, bx + s * 1.75, 1.7, z0 + 0.15, red_cloth)
        box('bed_curtain_tie', 0.55, 0.06, 0.22, bx + s * 1.75, 1.6, z0 + 0.15, gold)
        box('bed_curtain_side', 0.04, 2.1, 3.0, bx + s * (x1 - x0) / 2 + (-s) * 0.04, 1.7, bz, red_cloth)
    # 龙凤纹样：床沿正面三块金色浮雕板
    for k in (-1, 0, 1):
        box('bed_relief', 0.9, 0.3, 0.04, bx + k * 1.2, 0.27, z0 - 0.02, gold)
    col_box('COL_bed', x0 - 0.1, 0, z0 - 0.1, x1 + 0.1, 3.0, z1)


# ───────── 总装 ─────────
floors()
partition(PX_E, 'part_e', red=True)
partition(PX_W, 'part_w', red=False)
windows()
board_door()
kangs()
shrine()
spirit_curtain()
stoves()
east_chamber()

print(f'[build] tris={tri_count()}')
merge_by_material()
export_glb(out, draco=True)
