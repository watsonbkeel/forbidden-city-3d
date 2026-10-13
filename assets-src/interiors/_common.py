"""
S 档内景 Blender 建模公共工具（Blender 5.x，-b -P 调用）。

坐标约定（与 data/interiors/schema.md 一致）：
  Blender 里用 Y-up 思路写代码：helper 接受 three.js 坐标 (x, y, z)，y 向上、−z 为殿正面（南）。
  导出时 glTF exporter 默认 +Y up，会把 Blender 的 Z-up 转成 Y-up：
  Blender (bx, by, bz) → glTF (bx, bz, −by)。所以 three (x, y, z) ↔ Blender (x, −z, y)。
"""
import bpy, bmesh, math, os, sys
from mathutils import Vector

def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def mat(name, color=(0.8, 0.8, 0.8), metallic=0.0, roughness=0.5, emission=None, emission_strength=0.0):
    m = bpy.data.materials.get(name)
    if m: return m
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1.0)
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    if emission is not None:
        bsdf.inputs['Emission Color'].default_value = (*emission, 1.0)
        bsdf.inputs['Emission Strength'].default_value = emission_strength
    return m

def _to_b(x, y, z):
    """three (x,y,z) → Blender (x, -z, y)"""
    return (x, -z, y)

def add_obj(name, me, m=None, collection=None):
    ob = bpy.data.objects.new(name, me)
    (collection or bpy.context.scene.collection).objects.link(ob)
    if m is not None:
        me.materials.append(m)
    return ob

def box(name, w, h, d, x, y, z, m, rot_y=0.0):
    """中心 (x,y,z)，尺寸 w(x) h(y) d(z)，three 坐标。rot_y 绕竖轴旋转（弧度）"""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=(w, d, h), verts=bm.verts)  # Blender: x, y(=-z three), z(=y three)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me); bm.free()
    ob = add_obj(name, me, m)
    ob.location = _to_b(x, y, z)
    ob.rotation_euler = (0, 0, rot_y)
    return ob

def cylinder(name, r_top, r_bot, h, x, y, z, m, segments=16, cap=True):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=cap, cap_tris=False, segments=segments, radius1=r_bot, radius2=r_top, depth=h)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me); bm.free()
    ob = add_obj(name, me, m)
    ob.location = _to_b(x, y, z)
    return ob

def sphere(name, r, x, y, z, m, seg=24, rings=12):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=r)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me); bm.free()
    ob = add_obj(name, me, m)
    ob.location = _to_b(x, y, z)
    return ob

def torus(name, R, r, x, y, z, m, seg=32, ring=10, axis='y'):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, major_segments=seg, minor_segments=ring, location=_to_b(x, y, z))
    ob = bpy.context.active_object
    ob.name = name
    ob.data.materials.append(m)
    # 默认绕 Blender Z（= three Y）
    if axis == 'z':
        ob.rotation_euler = (math.pi / 2, 0, 0)
    return ob

def ngon_prism(name, n, r_top, r_bot, h, x, y, z, m, rot=0.0, hollow=False):
    """正 n 边形棱台（藻井层用）。hollow=True 时只建侧壁（无盖）"""
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=not hollow, cap_tris=False, segments=n, radius1=r_bot, radius2=r_top, depth=h)
    bmesh.ops.rotate(bm, cent=(0, 0, 0), matrix=__import__('mathutils').Matrix.Rotation(rot, 3, 'Z'), verts=bm.verts)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me); bm.free()
    ob = add_obj(name, me, m)
    ob.location = _to_b(x, y, z)
    return ob

def col_box(name, x0, y0, z0, x1, y1, z1):
    """碰撞代理（COL_ 前缀，无材质，加载时隐藏）。three 世界局部 AABB"""
    w, h, d = abs(x1 - x0), abs(y1 - y0), abs(z1 - z0)
    ob = box(name if name.startswith('COL_') else 'COL_' + name, w, h, d, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, None)
    return ob

def tri_count():
    n = 0
    for ob in bpy.context.scene.objects:
        if ob.type == 'MESH':
            me = ob.data
            me.calc_loop_triangles()
            n += len(me.loop_triangles)
    return n

def merge_by_material(skip_prefix=('COL_', 'WALK_')):
    """导出前把同材质的普通 mesh 合并成一个对象（COL_ 代理不合并）→ 每种材质 1 个 draw call。
    世界矩阵（位置/旋转/缩放）烘进顶点；顶点色层随 bmesh 一起带过去（同材质组内层集合一致）。"""
    bpy.context.view_layer.update()
    groups = {}
    for ob in list(bpy.context.scene.objects):
        if ob.type != 'MESH' or ob.name.startswith(skip_prefix): continue
        key = ob.data.materials[0].name if ob.data.materials else ''
        groups.setdefault(key, []).append(ob)
    for key, obs in groups.items():
        if len(obs) < 2: continue
        bm = bmesh.new()
        m = obs[0].data.materials[0] if obs[0].data.materials else None
        for ob in obs:
            n0 = len(bm.verts)
            bm.from_mesh(ob.data)
            bm.verts.ensure_lookup_table()
            bmesh.ops.transform(bm, matrix=ob.matrix_world, verts=bm.verts[n0:])
        bm.normal_update()
        me = bpy.data.meshes.new(f'merged_{key or "none"}')
        bm.to_mesh(me); bm.free()
        add_obj(f'merged_{key or "none"}', me, m)
        for ob in obs:
            old = ob.data
            bpy.data.objects.remove(ob, do_unlink=True)
            if old.users == 0: bpy.data.meshes.remove(old)
    print(f'[merge] objects={len([o for o in bpy.context.scene.objects if o.type == "MESH"])}')

def export_glb(path, draco=False):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    kw = dict(filepath=path, export_format='GLB', export_apply=True, export_yup=True,
              export_lights=False, export_cameras=False, export_animations=False,
              export_texcoords=True, export_normals=True, export_materials='EXPORT')
    if draco:
        kw.update(export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=6)
    try:
        bpy.ops.export_scene.gltf(**kw)
    except TypeError:
        kw.pop('export_draco_mesh_compression_enable', None)
        kw.pop('export_draco_mesh_compression_level', None)
        bpy.ops.export_scene.gltf(**kw)
    size = os.path.getsize(path)
    print(f'[export] {path}  tris={tri_count()}  bytes={size} ({size/1048576:.2f} MB)')
    return size
