"""V17 column-only surface candidate on the frozen V16 Taihe core. No shared throne_hall changes.
Uses the approved source-informed profile, with explicitly provisional registration.
Self-authored simplified carving/polychrome, not authentic facsimiles. No photographs,
panorama tiles or font files are included. Navigation belongs to permanent architecture.
Run: blender -b -P assets-src/interiors/taihe.py -- public/models/interiors/taihe-v17.glb
"""
import sys, os, json, hashlib, math
from pathlib import Path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import *
from _common import _to_b
import bpy, bmesh
ROOT = Path(__file__).resolve().parents[2]
P = json.loads((ROOT / 'data/architecture/taihe-core.json').read_text())
OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else str(ROOT / 'public/models/interiors/taihe-v17.glb')
reset_scene()
M = {
 'gold': mat('taihe_gold', (.47,.32,.11), .55, .52),
 'darkGold': mat('taihe_dark_gold', (.216,.117,.026), .32, .67),
 'red': mat('taihe_lacquer', (.122,.024,.016), 0, .65),
 'teal': mat('taihe_teal', (.031,.093,.072), 0, .8),
 'dark': mat('taihe_dark_wood', (.022,.023,.019), 0, .65),
 'stone': mat('taihe_stone', (.184,.178,.153), 0, .85),
 'pearl': mat('taihe_pearl', (.27,.287,.278), .6, .3),
 'glyph': mat('taihe_glyph_atlas', (1,1,1), 0, .8),
}
# Blender node colors are scene-linear; runtime materials use sRGB hex colors.
for m in M.values(): m.use_backface_culling = False

def mesh(name, verts, faces, m, uvs=None):
 me=bpy.data.meshes.new(name);me.from_pydata([_to_b(*v) for v in verts],[],faces);me.update()
 ob=add_obj(name,me,m)
 if uvs:
  layer=me.uv_layers.new(name='UVMap')
  for poly in me.polygons:
   for li in poly.loop_indices: layer.data[li].uv=uvs[me.loops[li].vertex_index]
 return ob

def path_strip(name, pts, radius, m, sides=4):
 # Thin self-authored applied line, never a thick serpent around the column.
 from mathutils import Vector
 vertices=[];faces=[]
 for i,p in enumerate(pts):
  tangent=Vector(pts[min(i+1,len(pts)-1)])-Vector(pts[max(i-1,0)])
  tangent.normalize();axis=Vector((0,1,0)) if abs(tangent.y)<.9 else Vector((1,0,0));u=tangent.cross(axis).normalized();v=tangent.cross(u).normalized()
  for k in range(sides):vertices.append(tuple(Vector(p)+radius*(u*math.cos(k*2*math.pi/sides)+v*math.sin(k*2*math.pi/sides))))
 for i in range(len(pts)-1):
  for k in range(sides):faces.append((i*sides+k,i*sides+(k+1)%sides,(i+1)*sides+(k+1)%sides,(i+1)*sides+k))
 return mesh(name,vertices,faces,m)

def smooth_column_sides(ob):
 # Preserve the original 32-gon positions and hard caps. Only this object is
 # smoothed; no shared helper or other member of the gold batch is retuned.
 for face in ob.data.polygons:
  face.use_smooth = len(face.vertices) == 4
 for edge in ob.data.edges:
  a, b = (ob.data.vertices[i].co for i in edge.vertices)
  edge.use_edge_sharp = abs(a.z-b.z) < 1e-6

def column_surface_relief(x, z, phase):
 """Self-authored branched ridges, not an exact heritage dragon reconstruction.
 Dimensions below are ESTIMATED authoring choices, never measured relief:
 .75 mm edge clearance, 6 mm crown rise, variable 30-65 mm full width.
 Clip every face at shaft facet boundaries before projection. The result
 stays on its actual 32-gon facet rather than cutting chords through it.
 """
 radius = .5; sector = 2*math.pi/32; edge = .00075; crown = edge+.006
 verts = []; faces = []; cache = {}
 def vertex(p):
  angle, y, height = p
  facet = (math.floor(angle/sector)+.5)*sector
  r = (radius*math.cos(sector/2)+height)/math.cos(angle-facet)
  v = (x+r*math.cos(angle), y, z+r*math.sin(angle))
  key = tuple(round(q, 10) for q in v)
  if key not in cache: cache[key]=len(verts); verts.append(v)
  return cache[key]
 def clip(poly, bound, keep_above):
  result=[]
  for a,b in zip(poly, poly[1:]+poly[:1]):
   ina = a[0]>=bound-1e-12 if keep_above else a[0]<=bound+1e-12
   inb = b[0]>=bound-1e-12 if keep_above else b[0]<=bound+1e-12
   if ina: result.append(a)
   if ina != inb:
    t=(bound-a[0])/(b[0]-a[0]);result.append(tuple(a[k]+t*(b[k]-a[k]) for k in range(3)))
  return result
 def triangle(points):
  lo=math.floor(min(p[0] for p in points)/sector)
  hi=math.floor(max(p[0] for p in points)/sector)
  for k in range(lo,hi+1):
   poly=clip(clip(points,k*sector,True),(k+1)*sector,False)
   ids=[]
   for p in poly:
    i=vertex(p)
    if not ids or ids[-1]!=i: ids.append(i)
   if len(ids)>1 and ids[0]==ids[-1]: ids.pop()
   for j in range(1,len(ids)-1):
    face=[ids[0],ids[j],ids[j+1]]
    a,b,c=(verts[i] for i in face);u=[b[j]-a[j] for j in range(3)];v=[c[j]-a[j] for j in range(3)]
    n=(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0])
    if math.sqrt(sum(q*q for q in n))<1e-10:continue
    if n[0]*(a[0]-x)+n[2]*(a[2]-z)<0:face.reverse()
    faces.append(tuple(face))
 def motif(angle, y, mirror=1):
  # Three arms share a raised central vertex and boundary edges. There are
  # no overlapping ribbon roots, dark wraps, tubes, or copied iconography.
  centre=(0,0,crown)
  boundary=[(-.10,-.04,edge),(.10,-.04,edge),(0,.08,edge)]
  arms=[[(.10,-.28,.065),(.08,-.60,.040),(-.10,-.78,0)],
        [(.32,.24,.055),(.38,.48,.036),(.20,.62,0)],
        [(-.30,.18,.050),(-.42,.34,.030),(-.26,.42,0)]]
  def world(p):return (angle+mirror*p[0],y+p[1],p[2])
  for i,path in enumerate(arms):
   previous=[boundary[i],centre,boundary[(i+1)%3]]
   for step,(u,v,width) in enumerate(path):
    if width==0:
     tip=(u,v,edge)
     for a,b in [(0,1),(1,2)]:triangle([world(previous[a]),world(previous[b]),world(tip)])
     break
    prior=(0,0,0) if step==0 else path[step-1]
    following=path[step+1]
    du=(following[0]-prior[0])*radius;dy=following[1]-prior[1];length=math.hypot(du,dy)
    # Normal in the unwrapped physical plane; edge/crown/edge section.
    ou=-dy/length*width/(2*radius);ov=du/length*width/2
    section=[(u+ou,v+ov,edge),(u,v,crown),(u-ou,v-ov,edge)]
    # Match root edge order to the next section without crossing the strip.
    if step==0:
     distance=lambda a,b:((a[0]-b[0])*radius)**2+(a[1]-b[1])**2
     if distance(previous[0],section[0])+distance(previous[2],section[2])>distance(previous[0],section[2])+distance(previous[2],section[0]):previous.reverse()
    for a,b in [(0,1),(1,2)]:
     triangle([world(previous[a]),world(previous[b]),world(section[b])])
     triangle([world(previous[a]),world(section[b]),world(section[a])])
    previous=section
 # Six separated clusters per shaft. The lower cluster has a restrained
 # curling terminal; all arrangements and phase variation are authored.
 for row,y in enumerate([1.35,4.35,7.35]):
  for side in range(2):
   motif(-math.pi/2+side*math.pi+phase+(.20 if row%2 else -.20),y,1 if (row+side)%2 else -1)
 assert len(faces)<=576, 'Column relief exceeds reclaimed triangle allocation: '+str(len(faces))
 return mesh('column_authored_relief',verts,faces,M['gold'])

def glyph(name,w,h,x,y,z,rect):
 a,b,c,d=rect
 # Front faces -Z. U increases toward viewer right (-X).
 # Blender's glTF exporter flips V. Precompensate so decoded UVs match the
 # native B planes using the SAME flipY=True CanvasTexture (no runtime clone).
 return mesh(name,[(x+w/2,y-h/2,z),(x-w/2,y-h/2,z),(x-w/2,y+h/2,z),(x+w/2,y+h/2,z)],[(0,1,2,3)],M['glyph'],[(a,1-b),(c,1-b),(c,1-d),(a,1-d)])

def tier(name,lower,upper,y0,y1,z,n=32):
 vertices=[]
 for shape,y in [(lower,y0),(upper,y1)]:
  for k in range(n):
   a=k*math.pi*2/n
   if shape[0]=='square':r=shape[1]/max(abs(math.cos(a)),abs(math.sin(a)))
   elif shape[0]=='oct':r=shape[1]/math.cos((a+math.pi/8)%(math.pi/4)-math.pi/8)
   else:r=shape[1]
   vertices.append((r*math.cos(a),y,z+r*math.sin(a)))
 faces=[(k,k+n,(k+1)%n+n,(k+1)%n) for k in range(n)]
 return mesh(name,vertices,faces,M['gold'])

def panel(name,x,w,h,z,y):
 outline=[(-w/2,0),(-w/2,h-.16),(-w*.30,h-.16),(-w*.22,h-.07),(0,h),(w*.22,h-.07),(w*.30,h-.16),(w/2,h-.16),(w/2,0)]
 verts=[(x+a,y+b,z+depth) for depth in [-.11,.11] for a,b in outline];n=len(outline)
 faces=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
 mesh(name,verts,faces,M['red'])
 # Separate aged-gold frames and recess, both faces are deliberate solids.
 for dz in [-.126,.126]:
  box(name+'_panel',w-.10,h-.32,.016,x,y+h/2,z+dz,M['darkGold'])
  for sign in [-1,1]:box(name+'_stile',.025,h-.35,.024,x+sign*(w/2-.065),y+h/2,z+dz,M['gold'])
  for yy in [y+.16,y+h-.2]:box(name+'_rail',w-.13,.025,.025,x,yy,z+dz,M['gold'])
  for k in range(3):
   ry=y+.48+k*(h-.9)/3
   path_strip(name+'_approx_cloud',[(x-w*.26,ry,z+dz),(x-w*.10,ry+.07,z+dz),(x+w*.10,ry-.05,z+dz),(x+w*.26,ry,z+dz)],.012,M['gold'])

d=P['dais'];t=P['throne'];s=P['screen'];c=P['caisson'];cols=P['columns'];p=P['plaque'];q=P['couplets']
zc=(d['z0']+d['z1'])/2;dep=d['z1']-d['z0'];W=d['width']
box('dais_lower',W,1.1,dep,0,.55,zc,M['red'])
box('dais_upper',W-.08,.9,dep-.08,0,1.55,zc,M['red'])
for y in [.14,.9,1.1,1.85,2.03]:box('dais_gold_moulding',W+.04,.04,dep+.04,0,y,zc,M['darkGold'])
box('dais_top',W,.04,dep,0,2.04,zc,M['red'])
for k in range(d['steps']):
 h=d['height']*(k+1)/d['steps'];z=d['z0']-d['stepRun']*(d['steps']-k)+d['stepRun']/2
 box('dais_step',d['stepWidth'],h,d['stepRun'],0,h/2,z,M['red'])
 box('dais_step_edge',d['stepWidth'],.035,.055,0,h-.0175,z-d['stepRun']/2+.0275,M['darkGold'])
# Thin dark display-like side rails are an approximate visual restraint, not a current access claim.
for sign in [-1,1]:
 x=sign*(W/2-.12)
 box('dais_rail',.045,.045,dep,x,2+d['railHeight'],zc,M['dark'])
 for k in range(8):box('dais_rail_post',.045,d['railHeight'],.045,x,2+d['railHeight']/2,d['z0']+k*dep/7,M['dark'])
for x in cols['x']:
 for z in cols['goldZ']:
  shaft=cylinder('gold_column',cols['radius'],cols['radius'],cols['height']-.2,x,(cols['height']+.2)/2,z,M['gold'],32)
  smooth_column_sides(shaft)
  cylinder('gold_column_base',cols['baseRadius'],cols['baseRadius'],.2,x,.1,z,M['stone'],16)
  column_surface_relief(x,z,0)
box('throne_pedestal',1.84,.21,1.70,0,2.165,t['z']-.28,M['red'])
box('throne_lower',t['lowerWidth'],t['lowerHeight'],t['lowerDepth'],0,t['baseY']+t['lowerHeight']/2,t['z'],M['darkGold'])
for sign in [-1,1]:
 for end in [-1,1]:box('throne_foot',.14,.22,.14,sign*.68,t['baseY']+.11,t['z']+end*.37,M['gold'])
box('throne_blue_waist',t['seatWidth']-.12,.16,t['seatDepth']-.08,0,t['baseY']+.34,t['z'],M['teal'])
box('throne_seat',t['seatWidth'],.12,t['seatDepth'],0,t['baseY']+t['seatHeight']-.06,t['z'],M['gold'])
# Crest profile exactly reaches 1.725m; no unbounded ornament is added above it.
y=t['baseY'];z=t['z']+.41
panel_h=t['overallHeight']-t['seatHeight'];panel('throne_back',0,1.35,panel_h,z,y+t['seatHeight'])
for sign in [-1,1]:
 pts=[(sign*.60,y+1.27,z-.02),(sign*.76,y+1.12,t['z']+.10),(sign*.75,y+1.02,t['z']-.30)]
 path_strip('throne_arm',pts,.043,M['gold'],6)
 cylinder('throne_arm_support',.025,.025,.48,sign*.75,y+t['seatHeight']+.24,t['z']-.30,M['gold'],8)
box('throne_footstool',t['footstoolWidth'],t['footstoolHeight'],t['footstoolDepth'],0,y+t['footstoolHeight']/2,t['z']-.83,M['darkGold'])
for i in range(7):panel('screen_'+str(i),(i-3)*s['width']/7,s['width']/7-.015,s['height']-abs(i-3)*.33,s['z'],s['baseY'])
R=c['nominalSpan']/2
for sign in [-1,1]:
 box('caisson_square_rim',c['nominalSpan'],.12,.16,0,c['rimY']+.06,c['z']+sign*(R-.08),M['darkGold'])
 box('caisson_square_rim',.16,.12,c['nominalSpan']-.32,sign*(R-.08),c['rimY']+.06,c['z'],M['darkGold'])
tier('caisson_square_to_oct',('square',R-.16),('oct',2.10),c['rimY']+.12,c['rimY']+.62,c['z'])
tier('caisson_oct_to_round',('oct',2.10),('circle',1.76),c['rimY']+.62,c['rimY']+.96,c['z'])
tier('caisson_upper_round',('circle',1.76),('circle',1.12),c['rimY']+.96,c['topY']-.03,c['z'])
cylinder('caisson_top',1.12,1.12,.03,0,c['topY']-.015,c['z'],M['darkGold'],32)
# Authored repeated ribs, not a claim to the museum's carved dragon motifs.
for k in range(16):
 a=k*math.pi/8
 pts=[(1.69*math.cos(a),c['rimY']+.99,c['z']+1.69*math.sin(a)),(1.08*math.cos(a),c['topY']-.05,c['z']+1.08*math.sin(a))]
 path_strip('caisson_approx_rib',pts,.016,M['darkGold'],4)
sphere('caisson_center_sphere',c['sphereRadius'],0,c['sphereY'],c['z'],M['pearl'],16,8)
for k in range(6):
 a=k*math.pi/3;sphere('caisson_satellite',c['satelliteRadius'],c['satelliteRing']*math.cos(a),c['sphereY']+.2,c['z']+c['satelliteRing']*math.sin(a),M['pearl'],10,6)
box('plaque_frame',p['width'],p['height'],.16,0,p['bottomY']+p['height']/2,p['z'],M['dark'])
glyph('plaque_letters',p['width']-.18,p['height']-.18,0,p['bottomY']+p['height']/2,p['z']-.081,[0,.625,1,1])
for x,rect in [(q['viewerRightX'],[0,0,.078125,.625]),(-q['viewerRightX'],[.078125,0,.15625,.625])]:
 box('couplet_frame',q['width'],q['height'],.14,x,q['bottomY']+q['height']/2,q['z'],M['dark'])
 glyph('couplet_letters',q['width']-.12,q['height']-.12,x,q['bottomY']+q['height']/2,q['z']-.071,rect)
# Capture original semantic bounds before batching for CPU review; this does not
# authorize geometry by itself. Tests also inspect decoded vertices.
bpy.context.view_layer.update();inventory=[]
for ob in bpy.context.scene.objects:
 if ob.type!='MESH':continue
 verts=[ob.matrix_world@v.co for v in ob.data.vertices];coords=[(v.x,v.z,-v.y) for v in verts]
 inventory.append({'name':ob.name,'min':[min(v[k] for v in coords) for k in range(3)],'max':[max(v[k] for v in coords) for k in range(3)]})
merge_by_material()
# Append after the original merge so original batch frames/attributes stay exact.
from taihe_display.blender_display import append_display_pairs
display_identity = append_display_pairs(inventory, M)
for ob in list(bpy.context.scene.objects):
 if ob.type=='MESH':
  bm=bmesh.new();bm.from_mesh(ob.data);bmesh.ops.triangulate(bm,faces=bm.faces[:],quad_method='FIXED',ngon_method='EAR_CLIP');bm.to_mesh(ob.data);bm.free()
from taihe_column_uv import assign_gold_column_uvs
assign_gold_column_uvs(bpy.context.scene, P)
contract=bpy.data.objects.new('TAIHE_CORE_CONTRACT',None);bpy.context.scene.collection.objects.link(contract)
for key in ['profileId','revision','approvalCardSHA256']:contract[key]=P[key]
contract['ownership']='taihe-core-visual-only'
contract['profileSHA256']=hashlib.sha256((ROOT/'data/architecture/taihe-core.json').read_bytes()).hexdigest()
contract['sourceSHA256']=hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
contract['columnSurfaceUVSHA256']=hashlib.sha256((ROOT/'assets-src/interiors/taihe_column_uv.py').read_bytes()).hexdigest()
contract['inventory']=json.dumps(inventory,separators=(',',':'))
contract['approximation']='Self-authored simplified patterns; provisional current-layout registration; no photo textures.'
for key,value in display_identity.items():contract[key]=value
export_glb(OUT,draco=False,export_extras=True)
