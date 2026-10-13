"""
S 档宝座殿通用建模（太和殿 / 乾清宫共用），由 taihe.py / qianqing.py 传参调用。

局部坐标 = three 坐标：原点殿中心、地面 y=0、正面 −Z（南）。所有尺寸米。
只建"覆盖 B 档程序化宝座区"的部件：金砖地、金柱（含雕龙）、宝座台（多级踏跺 + 栏杆）、
宝座、七扇屏风、藻井（方井→八角井→圆井 + 盘龙 + 轩辕镜）、陈设（宝象/甪端/仙鹤/香亭）。
殿身柱网 / 门窗 / 天花 / 匾额仍由 PalaceBuilder（B 档）提供，S 档叠加其上。

cfg 字段：
  w, d          殿身面阔 / 进深
  H             B 档室内净高（= PalaceBuilder 的 H，天花在 H−0.05）
  ztb0, ztb1, thW   B 档宝座台 z 范围 / 宽（GLB 宝座台覆盖它）
  platH, steps  宝座台高 / 踏跺级数
  goldCols      [(x, z), ...] 金柱位置；colR 半径；colGold True 金 / False 红漆
  caissonZ      藻井中心 z；caissonR 方井半宽
  ornaments     [(kind, x, z), ...]  kind ∈ 象/甪端/鹤/香亭
  ornOnPlatform True = 陈设抬到宝座台面上（不再设碰撞，台面已被 B 档宝座碰撞覆盖）；默认 False = 地面 + 各自碰撞盒
  colBoxes      [(x0,y0,z0,x1,y1,z1), ...] 额外碰撞代理（B 档碰撞之外的）
"""
import bpy, bmesh, math, os, random
from mathutils import Vector, Matrix
from _common import *
from _common import _to_b  # 下划线名不在 * 导出范围

# ───────── 几何小工具 ─────────

def tube(name, pts, r, m, sides=8, closed=False):
    """沿折线 pts（three 坐标）扫一根圆管"""
    bm = bmesh.new()
    rings = []
    n = len(pts)
    for i, p in enumerate(pts):
        p0 = Vector(pts[max(0, i - 1)]); p1 = Vector(pts[min(n - 1, i + 1)])
        t = (p1 - p0)
        if t.length < 1e-6: t = Vector((0, 1, 0))
        t.normalize()
        up = Vector((0, 1, 0)) if abs(t.y) < 0.9 else Vector((1, 0, 0))
        u = t.cross(up).normalized(); v = u.cross(t).normalized()
        ring = []
        for k in range(sides):
            a = 2 * math.pi * k / sides
            q = Vector(p) + (u * math.cos(a) + v * math.sin(a)) * r
            ring.append(bm.verts.new(_to_b(*q)))
        rings.append(ring)
    for i in range(n - 1):
        a, b = rings[i], rings[i + 1]
        for k in range(sides):
            bm.faces.new((a[k], a[(k + 1) % sides], b[(k + 1) % sides], b[k]))
    if not closed:
        bm.faces.new(rings[0][::-1]); bm.faces.new(rings[-1])
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    return add_obj(name, me, m)

def dragon_column(name, x, z, r, h, m_col, m_gold, turns=2.5):
    """雕龙柱：圆柱 + 盘绕的龙身（螺旋管）+ 龙头"""
    cylinder(name, r, r * 1.04, h, x, h / 2, z, m_col, segments=24)
    pts = []
    N = 140
    for i in range(N + 1):
        t = i / N
        a = t * turns * 2 * math.pi
        y = 0.6 + t * (h - 2.4)
        rr = r + 0.09 - 0.03 * math.sin(t * 20)
        pts.append((x + rr * math.cos(a), y, z + rr * math.sin(a)))
    tube(name + '_dragon', pts, 0.11, m_gold, sides=8)
    hx, hy, hz = pts[-1]
    sphere(name + '_head', 0.22, hx, hy + 0.1, hz, m_gold, 12, 8)
    # 柱础 / 柱顶
    cylinder(name + '_base', r * 1.25, r * 1.35, 0.25, x, 0.125, z, mat('stone', (0.75, 0.74, 0.7), 0, 0.6), segments=24)

def balustrade(prefix, x0, x1, z0, z1, y, m, gap=None, h=0.85, pitch=1.1):
    """矩形栏杆：四边望柱 + 扶手；gap=(xa, xb) 前边留口（踏跺）"""
    def edge(ax, a0, a1, fixed, skip=None):
        L = a1 - a0
        n = max(1, round(L / pitch))
        for i in range(n + 1):
            a = a0 + L * i / n
            if skip and skip[0] < a < skip[1]: continue
            px, pz = (a, fixed) if ax == 'x' else (fixed, a)
            box(f'{prefix}_post', 0.16, h, 0.16, px, y + h / 2, pz, m)
            sphere(f'{prefix}_cap', 0.11, px, y + h + 0.08, pz, m, 10, 6)
        if skip:
            segs = [(a0, skip[0]), (skip[1], a1)]
        else:
            segs = [(a0, a1)]
        for s0, s1 in segs:
            if s1 - s0 < 0.2: continue
            c = (s0 + s1) / 2; L2 = s1 - s0
            if ax == 'x': box(f'{prefix}_rail', L2, 0.1, 0.1, c, y + h - 0.1, fixed, m)
            else: box(f'{prefix}_rail', 0.1, 0.1, L2, fixed, y + h - 0.1, c, m)
    edge('x', x0, x1, z0, gap)
    edge('x', x0, x1, z1)
    edge('z', z0, z1, x0)
    edge('z', z0, z1, x1)

def throne_platform(cfg, lacq, gold, stone):
    x_half = cfg['thW'] / 2 + 0.08
    z0, z1 = cfg['ztb0'] - 0.05, cfg['ztb1'] + 0.05
    H = cfg['platH']
    zc = (z0 + z1) / 2; D = z1 - z0; W = 2 * x_half
    # 两层须弥座式台身
    box('plat_lower', W, H * 0.55, D, 0, H * 0.275, zc, lacq)
    box('plat_lower_trim', W + 0.1, 0.08, D + 0.1, 0, H * 0.55, zc, gold)
    box('plat_upper', W - 0.5, H * 0.45, D - 0.5, 0, H * 0.55 + H * 0.225, zc, lacq)
    box('plat_top', W - 0.4, 0.06, D - 0.4, 0, H + 0.03, zc, gold)
    # 踏跺（正面，级数 steps，踏面 run）：每级登记 WALK_ 可行走面（不是 COL_ 碰撞体）。
    # 碰撞体在水平方向一律阻挡，矮于 STEP_UP 也不会被"迈上去"；可行走面才会抬升脚面。
    # 每级高差 = H/n ≤ 0.6（STEP_UP），玩家可逐级拾级而上；越过 B 档宝座碰撞前沿（ztb0−1.3）后被 B 档碰撞挡住，不会走上台顶。
    n = cfg['steps']; rise = H / n; run = cfg.get('stepRun', 0.42); sw = cfg.get('stepW', 3.6)
    for k in range(n):
        zz = z0 - run * (n - k) + run / 2
        box(f'step_{k}', sw, rise * (k + 1), run, 0, rise * (k + 1) / 2, zz, stone)
        box(f'WALK_step_{k}', sw, rise * (k + 1), run, 0, rise * (k + 1) / 2, zz, None)
    # 两侧垂带石
    for s in (-1, 1):
        box('step_side', 0.25, H * 0.5, run * n, s * (sw / 2 + 0.12), H * 0.25, z0 - run * n / 2, stone)
        # 垂带石是实心石体，登记碰撞（x 在 ±sw/2 之外，不挡踏跺通道）。
        # 注意：这是本 GLB 唯一的 COL_ 代理，B 档才提供宝座/柱子碰撞；它让 p1i-loader 的"colliders>0"判据继续成立。
        xa, xb = sorted((s * (sw / 2), s * (sw / 2 + 0.25)))
        col_box(f'COL_step_side_{int(s)}', xa, 0, z0 - run * n, xb, H * 0.5, z0)
    # 垂带 / 栏杆
    if cfg.get('balustrade', True):
        balustrade('plat', -x_half + 0.3, x_half - 0.3, z0 + 0.3, z1 - 0.3, H + 0.06, gold, gap=(-sw / 2 - 0.2, sw / 2 + 0.2))
    return H + 0.06, z0 - run * n

def dais(cfg, lacq, gold, stone):
    """地平床（两层低台，无踏跺）：kit 殿 / 进深浅的殿用。
    下层 lowH（≤0.35，玩家可直接跨上，不登记碰撞）；上层到 platH，包住 B 档宝座台盒子。
    cfg: daisLowX/daisLowZ0 下层半宽 / 南缘 z；daisX 上层半宽；daisZ0/daisZ1 上层 z 范围；platH 上层顶高；lowH 下层高。
    返回台面 y。"""
    H = cfg['platH']; lowH = cfg.get('lowH', 0.3)
    lx, lz0 = cfg['daisLowX'], cfg['daisLowZ0']
    ux, uz0, uz1 = cfg['daisX'], cfg['daisZ0'], cfg['daisZ1']
    box('dais_low', 2 * lx, lowH, uz1 - lz0, 0, lowH / 2, (lz0 + uz1) / 2, stone)
    # 下层可行走（≤0.35 的矮台，玩家直接迈上）；用 WALK_ 代理登记，避免脚陷进台里
    box('WALK_dais_low', 2 * lx, lowH, uz1 - lz0, 0, lowH / 2, (lz0 + uz1) / 2, None)
    box('dais_low_trim', 2 * lx + 0.06, 0.04, uz1 - lz0 + 0.06, 0, lowH + 0.0, (lz0 + uz1) / 2, gold)
    box('dais_up', 2 * ux, H, uz1 - uz0, 0, H / 2, (uz0 + uz1) / 2, lacq)
    box('dais_up_trim', 2 * ux + 0.1, 0.06, uz1 - uz0 + 0.1, 0, H * 0.5, (uz0 + uz1) / 2, gold)
    box('dais_top', 2 * ux - 0.1, 0.06, uz1 - uz0 - 0.1, 0, H + 0.03, (uz0 + uz1) / 2, gold)
    # 上层略大于 B 档碰撞盒，补一个同范围碰撞代理，避免视觉台沿外露而玩家穿入
    col_box('COL_dais', -ux, 0, uz0, ux, 3.0, uz1)
    return H + 0.06

def throne(cfg, y, gold, lacq, silk):
    """金漆雕龙宝座：座 172.5 × 158.5 × 79（含靠背与扶手），置于台面 y 上"""
    zc = cfg['throneZ']
    # 尺寸略放大（1.9 × 1.5），把 B 档的方盒宝座（1.8 × 1.3，y 1.25~2.95）完全包进去
    sw, sd = 1.9, 1.5
    box('throne_base', sw + 0.3, 0.12, sd + 0.5, 0, y + 0.06, zc + 0.15, lacq)          # 脚踏/座基
    box('throne_seat', sw, 0.55, sd, 0, y + 0.12 + 0.275, zc, gold)
    box('throne_cushion', sw - 0.2, 0.1, sd - 0.2, 0, y + 0.67 + 0.05, zc - 0.05, silk)
    # 围屏式靠背：中高两侧低，三段（throneBackOff：kit 殿的 B 档靠背在 tz+0.5，需要 GLB 靠背包住它）
    bz = zc + cfg['throneBackOff'] if 'throneBackOff' in cfg else zc + sd / 2 + 0.15
    box('throne_back_c', 0.95, 1.25, 0.5, 0, y + 0.67 + 0.625, bz, gold)
    for s in (-1, 1):
        box('throne_back_s', 0.55, 1.0, 0.5, s * 0.72, y + 0.67 + 0.5, bz, gold)
        # 扶手：从靠背向前弯的龙身
        pts = [(s * 0.78, y + 1.25, bz - 0.1), (s * 0.86, y + 1.22, zc + 0.1), (s * 0.9, y + 1.18, zc - 0.35), (s * 0.9, y + 0.95, zc - 0.45)]
        tube('throne_arm', pts, 0.07, gold, 8)
        sphere('throne_arm_head', 0.11, s * 0.9, y + 1.2, zc - 0.42, gold, 10, 6)
    # 靠背顶部 5 条龙头（圆珠简化）与中央宝珠
    for k in range(-2, 3):
        sphere('throne_top_dragon', 0.09, k * 0.36, y + 0.67 + 1.25 + 0.08 + (0.08 if k == 0 else 0), bz, gold, 10, 6)
    # 靠背雕饰：三道凸棱
    for k in range(3):
        box('throne_back_ridge', 0.7, 0.05, 0.05, 0, y + 0.95 + k * 0.35, bz - 0.24, gold)

def screen(cfg, y, gold, lacq, silk):
    """七扇屏风：中扇最高，两侧递减；每扇 = 漆框 + 金地板心 + 顶部雕饰"""
    z = cfg['screenZ']
    s = cfg.get('screenScale', 1.0)
    ws = cfg.get('screenWidthScale', s)  # 宽度单独缩放（默认与高度同比）
    widths = [1.0 * ws] * 3 + [1.5 * ws] + [1.0 * ws] * 3
    heights = [2.6, 2.9, 3.2, 3.6, 3.2, 2.9, 2.6]
    heights = [h * s for h in heights]
    total = sum(widths)
    x = -total / 2
    for i, (w, h) in enumerate(zip(widths, heights)):
        cx = x + w / 2
        th = cfg.get('screenThick', 0.22)   # 屏风厚度；kit 殿 B 档屏风厚 0.25，需 ≥0.3 才能包住
        box(f'screen_frame_{i}', w, h, th, cx, y + h / 2, z, lacq)
        box(f'screen_panel_{i}', w - 0.16, h - 0.3, 0.08, cx, y + h / 2, z - (th / 2 + 0.02), gold)
        box(f'screen_panel_back_{i}', w - 0.16, h - 0.3, 0.08, cx, y + h / 2, z + (th / 2 + 0.02), gold)
        box(f'screen_cap_{i}', w + 0.06, 0.16, 0.34, cx, y + h + 0.08, z, gold)
        sphere(f'screen_finial_{i}', 0.1 * s, cx, y + h + 0.22, z, gold, 10, 6)
        x += w
    # 底座
    box('screen_base', total + 0.3, 0.18, 0.5, 0, y + 0.09, z, lacq)

def flip(ob):
    bm = bmesh.new(); bm.from_mesh(ob.data)
    bmesh.ops.reverse_faces(bm, faces=bm.faces)
    bm.to_mesh(ob.data); bm.free()
    return ob

def oct_annulus(name, r_in_oct, r_circle, y, z, m, seg=32):
    """水平环板：外缘正八角形（内切半径 r_in_oct，平边朝 ±x/±z），内缘圆（半径 r_circle）；法线朝下（从殿内仰视）"""
    bm = bmesh.new()
    outer, inner = [], []
    for k in range(seg):
        a = 2 * math.pi * k / seg
        # 八角形极径：边到中心距离 r_in_oct，边法线方向每 45°
        a8 = (a + math.pi / 8) % (math.pi / 4) - math.pi / 8
        ro = r_in_oct / math.cos(a8)
        outer.append(bm.verts.new(_to_b(ro * math.cos(a), y, z + ro * math.sin(a))))
        inner.append(bm.verts.new(_to_b(r_circle * math.cos(a), y, z + r_circle * math.sin(a))))
    for k in range(seg):
        bm.faces.new((outer[k], inner[k], inner[(k + 1) % seg], outer[(k + 1) % seg]))
    bm.normal_update()
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    ob = add_obj(name, me, m)
    # 保证法线朝下
    me.calc_loop_triangles()
    if me.polygons[0].normal.z > 0: flip(ob)
    return ob

def caisson(cfg, gold, lacq, blue, pearl_m):
    """
    藻井（仰视）：方井井口枋 → 八角井（竖壁 + 斗栱 + 环板）→ 圆井（鼓壁 + 平顶，顶上盘龙）+ 轩辕镜。
    设计约束（叠加在 B 档之上）：
      · B 档金色斗环（半径 ≤ R、顶面贴天花）与金色圆盘被八角井竖壁 + 环板 + 圆井鼓壁完全包住；
      · B 档殿内横匾悬在 caissonZ 南侧 2.95 m、y ∈ [top−1.7, top−0.4]，落在圆井（半径 rc > 3.7）内，
        圆井平顶在 top−0.3 之上、盘龙半径 ≤ 2.6，互不相交；
      · B 档轩辕镜（r 0.35，top−1.55）被本模型更大的珠体覆盖。
    """
    top = cfg['H'] - 0.05
    cz = cfg['caissonZ']; R = cfg['caissonR']
    rc = cfg.get('circR', 3.75)
    oct_c = 1 / math.cos(math.pi / 8)  # 内切半径 → 外接半径
    # 方井：四根井口枋（红漆）
    t = 0.45
    for s in (-1, 1):
        box('caisson_sq_x', 2 * R + 2 * t, 0.5, t, 0, top - 0.25, cz + s * (R + t / 2), lacq)
        box('caisson_sq_z', t, 0.5, 2 * R + 2 * t, s * (R + t / 2), top - 0.25, cz, lacq)
    # 八角井竖壁（金）：top → top−0.7，内切半径 R；再内缩一圈到 R−0.5：top−0.7 → top−1.8（青）
    flip(ngon_prism('caisson_oct_wall', 8, R * oct_c, R * oct_c, 0.7, 0, top - 0.35, cz, gold, rot=math.pi / 8, hollow=True))
    oct_annulus('caisson_oct_shelf', R, (R - 0.5) * 0.999, top - 0.7, cz, blue, seg=32)
    flip(ngon_prism('caisson_oct_wall2', 8, (R - 0.5) * oct_c, (R - 0.5) * oct_c, 1.1, 0, top - 1.25, cz, blue, rot=math.pi / 8, hollow=True))
    # 八角斗栱：每边 3 组（金）
    for k in range(8):
        a = math.pi / 8 + k * math.pi / 4 + math.pi / 8
        for j in (-1, 0, 1):
            aa = a + j * 0.19
            rr = (R - 0.5) * 0.97
            box('caisson_bracket', 0.32, 0.22, 0.32, rr * math.cos(aa), top - 0.82, cz + rr * math.sin(aa), gold, rot_y=-aa)
            box('caisson_bracket2', 0.22, 0.18, 0.22, rr * math.cos(aa), top - 1.0, cz + rr * math.sin(aa), gold, rot_y=-aa)
    # 环板：八角（R−0.5）→ 圆（rc），top−1.8，青地
    oct_annulus('caisson_plate', R - 0.5, rc, top - 1.8, cz, blue, seg=48)
    # 圆井：金色井口圈 + 鼓壁（top−1.8 → top−0.3，内壁朝内）+ 平顶（top−0.3，法线朝下）
    flip(ngon_prism('caisson_circ_rim', 48, rc + 0.12, rc + 0.12, 0.18, 0, top - 1.8 + 0.09, cz, gold, hollow=True))
    flip(ngon_prism('caisson_circ_wall', 48, rc, rc, 1.5, 0, top - 1.05, cz, blue, hollow=True))
    cap = ngon_prism('caisson_circ_cap', 48, rc, rc, 0.04, 0, top - 0.3, cz, blue)
    # 圆井鼓壁上金色竖棱 16 根
    for k in range(16):
        a = 2 * math.pi * k / 16
        box('caisson_rib', 0.12, 1.45, 0.12, (rc - 0.06) * math.cos(a), top - 1.05, cz + (rc - 0.06) * math.sin(a), gold, rot_y=-a)
    # 盘龙：贴着平顶盘 2.5 圈（半径 2.6 → 0.5），龙头俯冲衔珠
    pts = []
    N = 180
    for i in range(N + 1):
        tt = i / N
        a = tt * 2.5 * 2 * math.pi
        rr = 2.6 - 2.0 * tt if 'dragR' not in cfg else cfg['dragR'] - (cfg['dragR'] - 0.6) * tt
        y = top - 0.5 - 0.04 * math.sin(tt * 30)
        pts.append((rr * math.cos(a), y, cz + rr * math.sin(a)))
    # 收尾向下探到珠上方
    hx, hy, hz = pts[-1]
    pts += [(hx * 0.6, hy - 0.35, cz + (hz - cz) * 0.6), (0.0, cfg['pearlY'] + 0.75, cz)]
    tube('caisson_dragon', pts, 0.14, gold, 8)
    sphere('caisson_dragon_head', 0.3, 0, cfg['pearlY'] + 0.62, cz, gold, 12, 8)
    # 鳍：沿龙身每隔若干点一枚小片
    for i in range(0, N, 9):
        x, y, z = pts[i]
        box('caisson_dragon_fin', 0.1, 0.22, 0.26, x, y - 0.2, z, gold)
    # 轩辕镜（覆盖 B 档 pearl）：主珠 + 两侧小珠
    sphere('caisson_pearl', cfg.get('pearlR', 0.45), 0, cfg['pearlY'], cz, pearl_m, 20, 12)
    for s in (-1, 1):
        sphere('caisson_pearl_side', 0.16, s * 0.75, cfg['pearlY'] + 0.25, cz, pearl_m, 10, 6)
        tube('caisson_pearl_chain', [(s * 0.75, cfg['pearlY'] + 0.4, cz), (s * 0.5, cfg['pearlY'] + 0.75, cz)], 0.03, gold, 6)

def ornament(kind, x, z, bronze, gold, stone):
    """殿内陈设：象/甪端/鹤/香亭（简化体，含须弥座）"""
    box(f'orn_{kind}_base', 1.0, 0.6, 1.0, x, 0.3, z, stone)
    if kind == '象':
        s = sphere('orn_elephant_body', 0.42, x, 1.05, z, bronze, 14, 10); s.scale = (1.0, 0.75, 1.3)
        s2 = sphere('orn_elephant_head', 0.26, x, 1.1, z - 0.6, bronze, 12, 8)
        for sx in (-1, 1):
            for sz in (-1, 1):
                cylinder('orn_elephant_leg', 0.1, 0.1, 0.5, x + sx * 0.25, 0.85, z + sz * 0.35, bronze, 8)
        tube('orn_elephant_trunk', [(x, 1.0, z - 0.8), (x, 0.8, z - 0.95), (x, 0.6, z - 0.9)], 0.06, bronze)
        box('orn_elephant_vase', 0.28, 0.4, 0.28, x, 1.5, z + 0.05, gold)  # 太平有象：背驮宝瓶
    elif kind == '甪端':
        b = box('orn_luduan_body', 0.55, 0.5, 0.8, x, 0.95, z, bronze)
        sphere('orn_luduan_head', 0.24, x, 1.2, z - 0.45, bronze, 12, 8)
        cylinder('orn_luduan_horn', 0.02, 0.06, 0.3, x, 1.5, z - 0.5, gold, 6)
        for sx in (-1, 1):
            for sz in (-1, 1):
                cylinder('orn_luduan_leg', 0.07, 0.07, 0.3, x + sx * 0.18, 0.75, z + sz * 0.28, bronze, 6)
    elif kind == '鹤':
        cylinder('orn_crane_leg', 0.03, 0.03, 0.9, x + 0.08, 1.05, z, bronze, 6)
        cylinder('orn_crane_leg2', 0.03, 0.03, 0.9, x - 0.08, 1.05, z, bronze, 6)
        s = sphere('orn_crane_body', 0.25, x, 1.65, z, bronze, 12, 8); s.scale = (0.8, 0.8, 1.3)
        tube('orn_crane_neck', [(x, 1.8, z - 0.2), (x, 2.3, z - 0.3), (x, 2.55, z - 0.2), (x, 2.6, z - 0.05)], 0.05, bronze)
        sphere('orn_crane_head', 0.08, x, 2.6, z - 0.02, bronze, 8, 6)
        cylinder('orn_crane_candle', 0.04, 0.04, 0.4, x, 2.1, z + 0.35, gold, 6)  # 背驮蜡扦
    elif kind == '香亭':
        box('orn_pavilion_body', 0.6, 0.7, 0.6, x, 0.95, z, gold)
        box('orn_pavilion_body2', 0.5, 0.55, 0.5, x, 1.55, z, gold)
        cylinder('orn_pavilion_roof', 0.02, 0.5, 0.45, x, 2.05, z, bronze, 8)
        cylinder('orn_pavilion_roof2', 0.02, 0.4, 0.4, x, 2.5, z, bronze, 8)
        sphere('orn_pavilion_top', 0.08, x, 2.75, z, gold, 8, 6)
        cylinder('orn_pavilion_mast', 0.03, 0.03, 0.9, x, 2.3, z, gold, 6)

def gold_floor(cfg, dark, light):
    """金砖地：0.64 m 方砖，每块独立四边形并带顶点色明暗变化；砖缝由下方深色底板透出"""
    w, d = cfg.get('floorW', cfg['w'] - 0.2), cfg.get('floorD', cfg['d'] - 0.2)   # floorW/floorD：只铺殿内一部分（养心殿仅明间金砖）
    box('floor_base', w, 0.02, d, 0, 0.045, 0, dark)
    T = 0.64; g = 0.05
    nx, nz = int(w // T), int(d // T)
    ox, oz = -nx * T / 2, -nz * T / 2
    bm = bmesh.new()
    col = bm.loops.layers.color.new('Col')
    rnd = random.Random(7)
    y = 0.058
    for i in range(nx):
        for k in range(nz):
            x0 = ox + i * T + g / 2; x1 = x0 + T - g
            z0 = oz + k * T + g / 2; z1 = z0 + T - g
            vs = [bm.verts.new(_to_b(x0, y, z0)), bm.verts.new(_to_b(x1, y, z0)), bm.verts.new(_to_b(x1, y, z1)), bm.verts.new(_to_b(x0, y, z1))]
            f = bm.faces.new(vs)
            v = 0.82 + rnd.random() * 0.36
            for l in f.loops: l[col] = (v, v, v, 1.0)
    bm.normal_update()
    me = bpy.data.meshes.new('floor_tiles'); bm.to_mesh(me); bm.free()
    ob = add_obj('floor_tiles', me, light)
    # 顶点色接入材质 Base Color
    nt = light.node_tree
    attr = nt.nodes.new('ShaderNodeVertexColor'); attr.layer_name = 'Col'
    mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.blend_type = 'MULTIPLY'; mix.inputs[0].default_value = 1.0
    bsdf = nt.nodes['Principled BSDF']
    base = bsdf.inputs['Base Color'].default_value[:]
    mix.inputs[6].default_value = base
    nt.links.new(attr.outputs['Color'], mix.inputs[7])
    nt.links.new(mix.outputs[2], bsdf.inputs['Base Color'])
    return ob

# ───────── 总装 ─────────

def build(cfg, out):
    reset_scene()
    gold = mat('gold_lacquer', (0.83, 0.62, 0.20), metallic=0.9, roughness=0.28)
    lacq = mat('red_lacquer', (0.42, 0.09, 0.06), metallic=0.1, roughness=0.38)
    silk = mat('yellow_silk', (0.85, 0.62, 0.18), metallic=0.0, roughness=0.8)
    blue = mat('caisson_blue', (0.10, 0.17, 0.36), metallic=0.1, roughness=0.6)
    pearl = mat('mirror_pearl', (0.9, 0.9, 0.92), metallic=1.0, roughness=0.06)
    bronze = mat('bronze', (0.29, 0.23, 0.16), metallic=0.75, roughness=0.42)
    stone = mat('white_marble', (0.78, 0.77, 0.73), metallic=0.0, roughness=0.55)
    dark = mat('brick_grout', (0.08, 0.08, 0.08), metallic=0.0, roughness=0.9)
    brick = mat('gold_brick', (0.17, 0.18, 0.18), metallic=0.05, roughness=0.35)
    colm = gold if cfg.get('colGold', True) else lacq

    gold_floor(cfg, dark, brick)
    for (x, z) in cfg['goldCols']:
        dragon_column(f'col_{x:+.1f}_{z:+.1f}', x, z, cfg['colR'], cfg['H'], colm, gold)
    if cfg.get('dais'):
        top_y, step_front = dais(cfg, lacq, gold, stone), None
    else:
        top_y, step_front = throne_platform(cfg, lacq, gold, stone)
    throne(cfg, top_y, gold, lacq, silk)
    screen(cfg, top_y, gold, lacq, silk)
    if not cfg.get('noCaisson'):      # 养心殿等寝宫类无藻井
        caisson(cfg, gold, lacq, blue, pearl)
    # ornOnPlatform：陈设摆在宝座台面上（史实：甪端/仙鹤/香亭/宝象陈于宝座地平上，不在台下地面）。
    # 台面范围已被 B 档宝座碰撞整体覆盖，玩家进不去，所以不再为它们另设碰撞；台下通道也因此让出。
    orn_y = top_y if cfg.get('ornOnPlatform') else 0.0
    for (kind, x, z) in cfg['ornaments']:
        before = set(bpy.context.scene.objects)
        ornament(kind, x, z, bronze, gold, stone)
        if orn_y:
            for ob in set(bpy.context.scene.objects) - before:
                ob.location.z += orn_y      # Blender Z = three Y
    if cfg.get('extra'):              # 殿专属内容钩子（此时材质已建好，mat() 同名取缓存）
        cfg['extra'](cfg)
    # 碰撞代理
    for i, (x0, y0, z0, x1, y1, z1) in enumerate(cfg.get('colBoxes', [])):
        col_box(f'COL_{i}', x0, y0, z0, x1, y1, z1)
    # （P2-S3）已删除 COL_steps：它是 2.5 m 高的实心盒，盖住踏跺前沿 → B 档宝座碰撞前沿之间整段踏跺，玩家根本上不了台阶。
    # 踏跺改由 WALK_step_k 提供，台顶由 B 档宝座碰撞（ztb0−1.3 起）挡住。
    if not orn_y:
        for (kind, x, z) in cfg['ornaments']:
            col_box(f'COL_orn_{kind}', x - 0.55, 0, z - 0.55, x + 0.55, 2.2, z + 0.55)
    print(f'[build] tris={tri_count()}')
    # 同材质合并 → 每殿 ≈ 9 个 draw call（否则 300+ 个小 mesh 会吃掉 P1-R 省下的 call 预算）
    if cfg.get('merge', True): merge_by_material()
    export_glb(out, draco=cfg.get('draco', True))
