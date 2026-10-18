"""Bounded authored front-dais topology. Dimensions are not museum measurements.
No photo pixels, fonts, lights, rendering code or external dependencies.
"""
import json,sys,math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
sys.path.insert(0,str(ROOT/'assets-src/interiors/taihe_display/approved'))
from mesh_kernel import Mesh
P=json.loads((ROOT/'data/architecture/taihe-core.json').read_text())
D=json.loads((ROOT/'data/architecture/taihe-dais-front.json').read_text())

def stair(m,name,x,width):
 d=P['dais'];n=d['steps'];h=d['height'];run=d['stepRun'];toe=d['z0']-n*run
 # Extrude the exact union, not seven intersecting boxes: 60 triangles / flight.
 poly=[(0,toe),(0,d['z0']),(h,d['z0'])]
 for k in range(n-1,-1,-1):
  poly.append((h*(k+1)/n,toe+k*run))
  if k:poly.append((h*k/n,toe+k*run))
 verts=[(x+s*width/2,y,z) for s in [-1,1] for y,z in poly];N=len(poly)
 for j in range(N):
  k=(j+1)%N
  # Side-wall winding is fixed with a geometric outward direction.
  dy=poly[k][0]-poly[j][0];dz=poly[k][1]-poly[j][1]
  m.patch(name,verts,[(j,k,N+k,N+j)],'red',outward=(0,-dz,dy))
 for side,s in [(0,-1),(N,1)]:
  # Vertex 1 is the back/bottom star centre. All diagonals lie in the solid.
  for j in range(2,N):
   a=j;b=(j+1)%N
   m.patch(name,verts,[(side+1,side+a,side+b)],'red',outward=(s,0,0))

def sheet(m,name,x,z0,y0,z1,y1,width,material='darkGold'):
 v=[(x,y0-width/2,z0),(x,y0+width/2,z0),(x,y1+width/2,z1),(x,y1-width/2,z1)]
 m.patch(name,v,[(0,1,2,3),(3,2,1,0)],material)

def rails(m,lod):
 d=P['dais'];r=D['railHeight'];toe=d['z0']-d['steps']*d['stepRun'];head=d['z0'];rise=d['height']
 for i,x in enumerate(D['railX']):
  if lod=='B':sheet(m,f'front_rail_{i}',x,toe,r/2,head,rise+r/2,r)
  else:
   for j,t in enumerate([0,1]):
    z=toe+t*(head-toe);y=t*rise
    # Vertical upright represented by a narrow explicitly two-sided face.
    v=[(x,y,z-.018),(x,y+r,z-.018),(x,y+r,z+.018),(x,y,z+.018)]
    m.patch(f'front_post_{i}_{j}',v,[(0,1,2,3),(3,2,1,0)],'darkGold')
   for j,level in enumerate([.25,r]):sheet(m,f'front_rail_{i}_{j}',x,toe,level,head,rise+level,.035)
 for i,x in enumerate([-d['width']/2+.12,d['width']/2-.12]):
  if lod=='B':sheet(m,f'side_rail_{i}',x,head,rise+r/2,d['z1'],rise+r/2,r)
  else:
   for j in range(3):
    z=head+j*(d['z1']-head)/2
    v=[(x,rise,z-.018),(x,rise+r,z-.018),(x,rise+r,z+.018),(x,rise,z+.018)]
    m.patch(f'side_post_{i}_{j}',v,[(0,1,2,3),(3,2,1,0)],'darkGold')
   sheet(m,f'side_rail_{i}',x,head,rise+r,d['z1'],rise+r,.035)

def incense(m,i,x,lod):
 t=D['incenseTables'];z=t['z'];w=t['width'];dep=t['depth'];top=t['tableTopY'];name=f'incense_table_{i}'
 # Photo-supported spread feet and a broad apron replace straight matchsticks.
 # Exact curves, metal finishes and dimensions remain illustrative. The S leg
 # ends meet the visible base/apron, so only the hidden contact caps are omitted.
 for j,(sx,sz) in enumerate([(-1,-1),(-1,1),(1,-1),(1,1)]):
  foot=(x+sx*w*.42,.07,z+sz*dep*.42);head=(x+sx*w*.32,top-.12,z+sz*dep*.32)
  if lod=='S':m.sweep(f'{name}_leg{j}',[foot,head],[.025,.04],'darkGold',3,caps=(False,False))
  else:m.wedge(f'{name}_leg{j}',(foot[0]-.025,0,foot[2]-.02),(foot[0]+.025,0,foot[2]-.02),(foot[0],0,foot[2]+.025),head,'darkGold')
 # A flared waist/apron has actual sloping faces rather than a thin flat box.
 v=[(x+sx*w*scale,y,z+sz*dep*scale)for y,scale in [(top-.18,.39),(top,.5)]for sx,sz in [(-1,-1),(1,-1),(1,1),(-1,1)]]
 m.patch(name+'_top',v,[(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7),(4,5,6,7),(3,2,1,0)],'gold',outward=None)
 # Explicitly orient the above convex frustum faces from its centre.
 start=len(m.triangles)-12
 for k in range(start,len(m.triangles)):
  ids=m.triangles[k];a,b,c=[m.vertices[j]for j in ids];normal=((b[1]-a[1])*(c[2]-a[2])-(b[2]-a[2])*(c[1]-a[1]),(b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2]),(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]))
  out=tuple((a[q]+b[q]+c[q])/3-[x,top-.09,z][q]for q in range(3))
  if sum(normal[q]*out[q]for q in range(3))<0:m.triangles[k]=tuple(reversed(ids))
 if lod=='B':m.octa(name+'_censer',(x,top+.4,z),(.23,.4,.23),'teal');return
 m.box(name+'_base',(x-w*.53,0,z-dep*.53),(x+w*.53,.07,z+dep*.53),'gold',bottom=False)
 base=top+.16
 # Three small feet are explicit two-sided sheets, a bounded silhouette LOD.
 # Six-sided bowl / rounded shoulder / truncated lid replace the pointed cone.
 for k in range(3):
  a=k*2*math.pi/3;cx=x+.14*math.cos(a);cz=z+.14*math.sin(a);tx=.028*math.cos(a+math.pi/2);tz=.028*math.sin(a+math.pi/2)
  m.patch(name+f'_tripod{k}',[(cx-tx,top,cz-tz),(cx+tx,top,cz+tz),(cx,base+.04,cz)],[(0,1,2),(2,1,0)],'gold')
 m.lathe(name+'_censer',[(base,.14),(base+.23,.21),(base+.48,.17)],'teal',6,caps=(True,False),centre=(x,z))
 m.lathe(name+'_lid',[(base+.48,.17),(t['totalHeight'],.045)],'gold',6,caps=(False,True),centre=(x,z))
 for sign in [-1,1]:
  # Two slender strips form a genuinely open high ear, not a filled gold flap.
  points=[(x+sign*.19,base+.27),(x+sign*.25,base+.73),(x+sign*.15,base+.58)]
  for k in range(2):
   (xa,ya),(xb,yb)=points[k:k+2];h=.012
   v=[(xa-sign*h,ya,z),(xa+sign*h,ya,z),(xb+sign*h,yb,z),(xb-sign*h,yb,z)]
   m.patch(name+f'_handle{sign}_{k}',v,[(0,1,2,3),(3,2,1,0)],'gold')

def build(lod):
 if lod not in ('S','B'):raise ValueError('Unknown LOD')
 m=Mesh();d=P['dais']
 for i,f in enumerate(D['frontFlights']):stair(m,f'front_flight_{i}',f['x'],f['width'])
 rails(m,lod)
 for i,x in enumerate(D['incenseTables']['x']):incense(m,i,x,lod)
 # An independent thin display cover from the first to the last stair nosing.
 # Its end is one run short of the platform; the final tread remains underneath.
 toe=d['z0']-d['steps']*d['stepRun'];end=d['z0']-d['stepRun'];off=D['cover']['offset'];hw=D['cover']['width']/2
 v=[(-hw,d['height']/d['steps']+off,toe),(hw,d['height']/d['steps']+off,toe),(hw,d['height']+off,end),(-hw,d['height']+off,end)]
 m.patch('removable_central_display_cover',v,[(0,3,2,1),(1,2,3,0)],'red')
 return m
