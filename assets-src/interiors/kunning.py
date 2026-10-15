"""V6 Kunning furniture-only S layer. Structural geometry belongs permanently to B.

Run: blender -b -P assets-src/interiors/kunning.py -- /tmp/kunning-v6.glb
The output must be inspected, checksummed and copied to a content-keyed runtime
path. Regions and contract come from data/architecture/kunning.json; local metres
are provisional model fit, not surveyed dimensions. Retained two tall stoves are
an unresolved display-accuracy debt (S08 records three low pots).
"""
import sys, os, json, math, hashlib, struct
sys.dont_write_bytecode = True
from pathlib import Path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy
from mathutils import Vector
from _common import *
from _common import _to_b

ROOT = Path(__file__).resolve().parents[2]
PROFILE_PATH = ROOT / 'data' / 'architecture' / 'kunning.json'
PROFILE = json.loads(PROFILE_PATH.read_text())
REGIONS = PROFILE['placementRegions']
FONT_PATH = '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
FONT_SHA256 = 'b76b0433203017ca80401b2ee0dd69350349871c4b19d504c34dbdd80541690a'
if hashlib.sha256(Path(FONT_PATH).read_bytes()).hexdigest() != FONT_SHA256:
    raise RuntimeError('Approved Noto font bytes missing or changed; no Bfont fallback permitted')
out = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else '/tmp/kunning-v6.glb'
reset_scene()
FONT = bpy.data.fonts.load(FONT_PATH)

# Retain the established, recognizable material family, without imported images.
gold = mat('gold_lacquer', (0.83, 0.62, 0.20), metallic=0.9, roughness=0.28)
lacq = mat('red_lacquer', (0.42, 0.09, 0.06), metallic=0.1, roughness=0.38)
silk = mat('yellow_silk', (0.85, 0.62, 0.18), roughness=0.8)
red = mat('red_cloth', (0.58, 0.04, 0.05), roughness=0.9)
carpet = mat('red_carpet', (0.36, 0.02, 0.03), roughness=0.95)
brick = mat('kang_brick', (0.33, 0.30, 0.27), roughness=0.85)
wood = mat('kang_wood', (0.28, 0.17, 0.08), roughness=0.6)
matting = mat('kang_mat', (0.58, 0.47, 0.28), roughness=0.95)
iron = mat('cast_iron', (0.05, 0.05, 0.06), metallic=0.6, roughness=0.5)
soot = mat('soot', (0.11, 0.10, 0.09), roughness=0.95)
stone = mat('white_marble', (0.78, 0.77, 0.73), roughness=0.55)

INVENTORY, GLYPHS = [], []

def region(key):
    b = REGIONS[key].get('bounds', REGIONS[key])
    return (*b['min'], *b['max'])

def center(key):
    x0,y0,z0,x1,y1,z1 = region(key)
    return ((x0+x1)/2, (y0+y1)/2, (z0+z1)/2)

def finish_region(key, before):
    """Validate every authored prop before merging; no structural bounds here."""
    bpy.context.view_layer.update()
    x0,y0,z0,x1,y1,z1 = region(key)
    for ob in [o for o in bpy.context.scene.objects if o.name not in before and o.type == 'MESH']:
        points = [ob.matrix_world @ Vector(c) for c in ob.bound_box]
        lo = [min(p.x for p in points), min(p.z for p in points), min(-p.y for p in points)]
        hi = [max(p.x for p in points), max(p.z for p in points), max(-p.y for p in points)]
        if any(a < b-0.002 for a,b in zip(lo,(x0,y0,z0))) or any(a > b+0.002 for a,b in zip(hi,(x1,y1,z1))):
            raise RuntimeError(f'{ob.name} escapes {key}: {lo} {hi}')
        for protected in PROFILE['protectedVolumes']:
            p = protected['bounds']
            if all(lo[i] < p['max'][i] and hi[i] > p['min'][i] for i in range(3)):
                raise RuntimeError(f'{ob.name} intersects protected {protected["id"]}')
        INVENTORY.append(dict(name=ob.name, region=key, min=lo, max=hi))

def begin_region():
    return set(o.name for o in bpy.context.scene.objects)

def proxy(name, key, height=None):
    x0,y0,z0,x1,y1,z1 = region(key)
    col_box(name, x0, y0, z0, x1, min(y1, y0 + height) if height else y1, z1)

def glyph(name, size):
    """Fixed 囍 artwork only. Geometric bounds-normalization avoids font metrics drift."""
    cu = bpy.data.curves.new(name, 'FONT'); cu.body='囍'; cu.font=FONT
    cu.size=1; cu.extrude=0; cu.resolution_u=2
    ob=bpy.data.objects.new(name, cu); bpy.context.scene.collection.objects.link(ob)
    bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True)
    bpy.context.view_layer.objects.active=ob; bpy.ops.object.convert(target='MESH')
    ob=bpy.context.view_layer.objects.active
    vs=ob.data.vertices
    if len(vs)<40: raise RuntimeError('囍 conversion missing or substituted')
    lo=[min(v.co[i] for v in vs) for i in range(2)]
    hi=[max(v.co[i] for v in vs) for i in range(2)]
    scale=size/max(hi[i]-lo[i] for i in range(2))
    for v in vs:
        for i in range(2): v.co[i]=(v.co[i]-(hi[i]+lo[i])/2)*scale
    ob.data.materials.append(gold)
    GLYPHS.append(dict(name=name, targetMaxDimension=size, vertices=len(vs),
                       width=(hi[0]-lo[0])*scale, height=(hi[1]-lo[1])*scale))
    return ob

def triangulate_long_ceiling_strip(ob):
    """Same eight corners and 12 faces as the browser-verified Three BoxGeometry.

    Only the second long warm-ceiling grid strip opts in. Four face diagonals
    differ from BMesh FIXED: the old long/thin topology leaks pixels through a
    nearer opaque wall in the captured SwiftShader case. No depth/material hack,
    subdivision, geometric displacement or removal is used.
    """
    bpy.context.view_layer.update()
    points = [ob.matrix_world @ Vector(c) for c in ob.bound_box]
    lo = [min(p.x for p in points), min(p.z for p in points), min(-p.y for p in points)]
    hi = [max(p.x for p in points), max(p.z for p in points), max(-p.y for p in points)]
    # Corner order is three.js BoxGeometry's outward-facing, two-triangle planes.
    unit_faces = [
        ((1,1,1),(1,-1,1),(1,1,-1)), ((1,-1,1),(1,-1,-1),(1,1,-1)),
        ((-1,1,-1),(-1,-1,-1),(-1,1,1)), ((-1,-1,-1),(-1,-1,1),(-1,1,1)),
        ((-1,1,-1),(-1,1,1),(1,1,-1)), ((-1,1,1),(1,1,1),(1,1,-1)),
        ((-1,-1,1),(-1,-1,-1),(1,-1,1)), ((-1,-1,-1),(1,-1,-1),(1,-1,1)),
        ((-1,1,1),(-1,-1,1),(1,1,1)), ((-1,-1,1),(1,-1,1),(1,1,1)),
        ((1,1,-1),(1,-1,-1),(-1,1,-1)), ((1,-1,-1),(-1,-1,-1),(-1,1,-1)),
    ]
    vertices, faces, indices = [], [], {}
    for face in unit_faces:
        triangle = []
        for signs in face:
            point = tuple(hi[i] if signs[i] > 0 else lo[i] for i in range(3))
            if point not in indices:
                indices[point] = len(vertices); vertices.append(_to_b(*point))
            triangle.append(indices[point])
        faces.append(triangle)
    old = ob.data
    mesh = bpy.data.meshes.new(ob.name + '_stable_faces')
    mesh.from_pydata(vertices, [], faces); mesh.update()
    for material in old.materials: mesh.materials.append(material)
    ob.data = mesh; ob.location = (0,0,0); ob.rotation_euler = (0,0,0); ob.scale = (1,1,1)
    if old.users == 0: bpy.data.meshes.remove(old)

FACE_DOWN=(math.pi,0,0)
FACE_S=(math.pi/2,0,math.pi)
FACE_N=(math.pi/2,0,0)
FACE_W=(math.pi/2,0,math.pi/2)
FACE_E=(math.pi/2,0,-math.pi/2)

def place(master, name, x,y,z,rotation):
    ob=master.copy(); ob.name=name; bpy.context.scene.collection.objects.link(ob)
    ob.location=_to_b(x,y,z); ob.rotation_euler=rotation
    return ob

# Floor remains B-owned. The removable carpet is confined to the warm room.
a=begin_region(); x0,y0,z0,x1,y1,z1=region('warmChamber')
box('warm_carpet',x1-x0-0.16,0.025,z1-z0-0.16,(x0+x1)/2,y0+0.035,(z0+z1)/2,carpet)
finish_region('warmChamber',a)

# Drapery is interior display fabric, never a door, wall, or collision proxy.
a=begin_region(); x0,y0,z0,x1,y1,z1=region('warmDrapes'); h=y1-y0
box('drape_east',0.04,h,z1-z0,x0+0.03,(y0+y1)/2,(z0+z1)/2,red)
for z in (z0+0.03,z1-0.03):
    box('drape_side',x1-x0-0.08,h,0.04,(x0+x1)/2,(y0+y1)/2,z,red)
    for y in (y0+0.8,y1-0.35): box('drape_gold_trim',x1-x0-0.1,0.06,0.06,(x0+x1)/2,y,z,gold)
finish_region('warmDrapes',a)

# Red-and-gold decorative ceiling under B ceiling; 21 distinct readable 囍 motifs.
a=begin_region(); x0,y0,z0,x1,y1,z1=region('warmCeiling'); cy=y1-0.075
box('warm_ceiling_fabric',x1-x0,0.02,z1-z0,(x0+x1)/2,cy+0.025,(z0+z1)/2,red)
g=glyph('xi_ceiling_master', min((x1-x0)/5,(z1-z0)/10,1.05))
for ix in range(3):
    for iz in range(7): place(g,f'xi_ceiling_{ix}_{iz}',x0+(ix+0.5)*(x1-x0)/3,cy,z0+(iz+0.5)*(z1-z0)/7,FACE_DOWN)
bpy.data.objects.remove(g,do_unlink=True)
for ix in (1,2):
    strip = box('ceiling_grid_x',0.045,0.025,z1-z0,x0+ix*(x1-x0)/3,cy+0.008,(z0+z1)/2,gold)
    if ix == 2: triangulate_long_ceiling_strip(strip)
for iz in range(1,7): box('ceiling_grid_z',x1-x0,0.025,0.045,(x0+x1)/2,cy+0.008,z0+iz*(z1-z0)/7,gold)
finish_region('warmCeiling',a)

# Retained freestanding interior display screen; not the removed exterior screen.
a=begin_region(); x0,y0,z0,x1,y1,z1=region('warmScreen'); x,y,z=center('warmScreen')
w,d=x1-x0,z1-z0; h=min(3.3,y1-y0)
box('screen_base',w,0.25,d,x,y0+0.125,z,stone)
box('screen_panel',w-0.3,h-0.55,d*0.3,x,y0+0.25+(h-0.55)/2,z,red)
box('screen_cap',w-0.1,0.15,d*0.6,x,y0+h-0.075,z,gold)
for xx in (x0+0.15,x1-0.15): box('screen_frame',0.07,h-0.65,d*0.36,xx,y0+0.3+(h-0.65)/2,z,gold)
g=glyph('xi_screen_master',min(1.85,w-0.6,h-0.8))
for sign,rot in ((1,FACE_N),(-1,FACE_S)): place(g,'xi_screen',x,y0+h/2,z+sign*d*0.17,rot)
bpy.data.objects.remove(g,do_unlink=True); proxy('COL_screen','warmScreen',h)
finish_region('warmScreen',a)

# Recognizable canopy bridal bed, pillows, curtain ties and headboard 囍.
a=begin_region(); x0,y0,z0,x1,y1,z1=region('warmBed'); bx,_,bz=center('warmBed')
x0,x1=bx-min(4.2,x1-x0)/2,bx+min(4.2,x1-x0)/2
w,d=x1-x0,z1-z0; h=min(3.1,y1-y0); left,right=x0+0.15,x1-0.15; front,back=z0+0.15,z1-0.15
box('bed_platform',w-0.16,0.5,d-0.16,bx,y0+0.25,bz,lacq)
box('bed_trim',w-0.1,0.05,d-0.1,bx,y0+0.51,bz,gold)
box('bed_mattress',w-0.35,0.16,d-0.35,bx,y0+0.61,bz,red)
for s in (-1,1): box('bed_pillow',0.8,0.18,0.45,bx+s*w*0.23,y0+0.78,back-0.5,silk)
box('bed_quilt',w-0.65,0.1,d*0.48,bx,y0+0.74,bz-0.25,red)
for x in (left,right):
    for z in (front,back): cylinder('bed_post',0.055,0.055,h-0.5,x,y0+(h+0.5)/2-0.05,z,gold,10)
box('bed_canopy',w-0.04,0.05,d-0.04,bx,y0+h-0.03,bz,red)
box('bed_valance',w-0.1,0.4,0.05,bx,y0+h-0.27,front,red)
box('bed_valance_gold',w-0.1,0.04,0.065,bx,y0+h-0.48,front,gold)
box('bed_headboard',w-0.25,2.0,0.1,bx,y0+1.55,back,red)
for x in (left,right):
    box('bed_headboard_edge',0.08,2.0,0.13,x,y0+1.55,back,gold)
    box('bed_side_curtain',0.04,1.9,d-0.4,x,y0+1.6,bz,red)
    box('bed_curtain_tie',0.4,0.08,0.18,x+(-0.15 if x==right else 0.15),y0+1.5,front+0.1,gold)
g=glyph('xi_bed_master',1.05); place(g,'xi_bed',bx,y0+1.65,back-0.061,FACE_S); bpy.data.objects.remove(g,do_unlink=True)
for k in (-1,0,1): box('bed_relief',0.8,0.3,0.04,bx+k*w*0.27,y0+0.27,front-0.07,gold)
col_box('COL_bed',x0,y0,z0,x1,y0+h,z1); finish_region('warmBed',a)

# U-shaped ritual kang. Only true entrance interrupts the south side.
for key,name in [('ritualSouthEastKang','kang_s_e'),('ritualSouthWestKang','kang_s_w'),('ritualNorthKang','kang_n'),('ritualWestKang','kang_w')]:
    a=begin_region(); x0,y0,z0,x1,y1,z1=region(key); x,y,z=center(key)
    for suffix,bottom,height,material,inset in [('body',0,0.46,brick,0),('edge',0.46,0.06,wood,0),('mat',0.52,0.04,matting,0.1)]:
        box(name+'_'+suffix,x1-x0-inset,height,z1-z0-inset,x,y0+bottom+height/2,z,material)
    proxy('COL_'+name,key,0.56); finish_region(key,a)

# Shrine is placed on the north kang; display geometry remains provisional.
a=begin_region(); x0,y0,z0,x1,y1,z1=region('shrine'); x,_,z=center('shrine'); w=min(2.5,x1-x0); d=min(0.8,z1-z0)
box('shrine_base',w,0.18,d,x,y0+0.09,z,wood)
box('shrine_body',w-0.3,1.35,d*0.65,x,y0+0.85,z,lacq)
box('shrine_roof',w,0.12,d,x,y0+1.6,z,gold)
for k in (-1,0,1): box('shrine_tablet',w*0.18,0.9,0.04,x+k*w*0.27,y0+0.85,z-d*0.34,gold)
col_box('COL_shrine',x-w/2,y0,z-d/2,x+w/2,y0+1.7,z+d/2); finish_region('shrine',a)

# Golden spirit curtain over the west kang, fitted clear of both end passages.
a=begin_region(); x0,y0,z0,x1,y1,z1=region('ritualSpiritCurtain'); x=x1-0.08
# The regional height includes the display cloth as well as the low kang.
h=min(3.0,y1-y0-1.2)
if h>0:
    box('spirit_curtain',0.04,h,z1-z0-0.3,x,y0+1.1+h/2,(z0+z1)/2,silk)
    box('spirit_curtain_top',0.08,0.12,z1-z0-0.2,x,y0+1.1+h-0.08,(z0+z1)/2,gold)
finish_region('ritualSpiritCurtain',a)

# Retain two tall stoves and the pilu hood, relocated to the true door's north bay.
# This is explicitly NOT a historical-accuracy claim; three low pots remain deferred.
a=begin_region(); x0,y0,z0,x1,y1,z1=region('northStove'); cx,_,cz=center('northStove'); w=x1-x0; d=z1-z0
for sign in (-1,1):
    x=cx+sign*w*0.255; sw=min(1.8,w*0.43); sd=min(1.4,d-0.1)
    box('stove_body',sw-0.1,1.15,sd-0.1,x,y0+0.575,cz,brick)
    box('stove_rim',sw,0.08,sd,x,y0+1.19,cz,wood)
    cylinder('stove_pot',0.52,0.55,0.38,x,y0+1.42,cz,iron,20)
    cylinder('stove_lid',0.08,0.57,0.26,x,y0+1.73,cz,wood,20)
    box('stove_mouth',0.5,0.5,0.04,x,y0+0.4,cz-sd/2+0.03,soot)
box('pilu_top',w-0.12,0.18,d-0.1,cx,y0+3.2,cz,gold)
box('pilu_valance',w-0.12,0.65,0.08,cx,y0+2.85,z0+0.06,gold)
box('pilu_inner',w-0.3,0.04,d-0.2,cx,y0+3.08,cz,lacq)
for i in range(10): sphere('pilu_ball',0.07,x0+0.2+i*(w-0.4)/9,y0+2.48,z0+0.1,gold,8,6)
proxy('COL_stove','northStove',1.9); finish_region('northStove',a)

# No speculative storage furnishings added. The single storage bay stays B-enclosed.
print('[build]',json.dumps(dict(objects=len(INVENTORY),trianglesIncludingProxies=tri_count(),glyphs=GLYPHS)))
merge_by_material()
# Blender's default beauty triangulation has memory-order tie breaks. Resolve all
# Kunning faces explicitly so identical source/profile/font yield stable GLB bytes.
for ob in bpy.context.scene.objects:
    if ob.type != 'MESH': continue
    bm = bmesh.new(); bm.from_mesh(ob.data)
    bmesh.ops.triangulate(bm, faces=list(bm.faces), quad_method='FIXED', ngon_method='EAR_CLIP')
    bm.to_mesh(ob.data); bm.free()
contract=bpy.data.objects.new('KUNNING_CONTRACT',None); bpy.context.scene.collection.objects.link(contract)
for key,value in dict(profileId=PROFILE['profileId'],profileRevision=PROFILE['revision'],profileHash=PROFILE['profileHash'],ownership='furniture-only').items(): contract[key]=value
contract['fontSHA256']=FONT_SHA256
contract['sourceSHA256']=hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
contract['furnitureInventory']=json.dumps(INVENTORY,separators=(',',':'))
contract['glyphMetrics']=json.dumps(GLYPHS,separators=(',',':'))
export_glb(out,draco=False,export_extras=True)
# BMesh may emit the same resolved triangles in a different face order. Canonical
# triangle ordering changes no vertices/winding/materials and stabilizes the hash.
encoded = bytearray(Path(out).read_bytes())
json_length = struct.unpack_from('<I', encoded, 12)[0]
gltf = json.loads(encoded[20:20+json_length])
bin_start = 28 + json_length
for mesh in gltf['meshes']:
    for primitive in mesh['primitives']:
        accessor = gltf['accessors'][primitive['indices']]
        view = gltf['bufferViews'][accessor['bufferView']]
        offset = bin_start + view.get('byteOffset', 0) + accessor.get('byteOffset', 0)
        fmt = {5121: 'B', 5123: 'H', 5125: 'I'}[accessor['componentType']]
        indices = struct.unpack_from('<' + fmt * accessor['count'], encoded, offset)
        triangles = sorted(tuple(indices[i:i+3]) for i in range(0, len(indices), 3))
        struct.pack_into('<' + fmt * len(indices), encoded, offset, *(v for t in triangles for v in t))
Path(out).write_bytes(encoded)
print('[canonical-sha256]', hashlib.sha256(encoded).hexdigest())
Path(out+'.inventory.json').write_text(json.dumps(dict(profileHash=PROFILE['profileHash'],objects=INVENTORY,glyphs=GLYPHS),ensure_ascii=False,indent=2))
