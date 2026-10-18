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
 # Four supports remain visually open. Fine-tier triangular columns are closed;
 # coarse-tier tetrahedral supports are an explicit silhouette simplification.
 for j,(sx,sz) in enumerate([(-1,-1),(-1,1),(1,-1),(1,1)]):
  xx=x+sx*w*.35;zz=z+sz*dep*.35
  if lod=='S':m.lathe(f'{name}_leg{j}',[(.07,.035),(top-.06,.025)],'darkGold',3,caps=(True,True),centre=(xx,zz))
  else:m.wedge(f'{name}_leg{j}',(xx-.035,.02,zz-.025),(xx+.035,.02,zz-.025),(xx,.02,zz+.035),(xx,top-.06,zz),'darkGold')
 m.box(name+'_top',(x-w/2,top-.06,z-dep/2),(x+w/2,top,z+dep/2),'darkGold')
 if lod=='B':m.octa(name+'_censer',(x,top+.4,z),(.23,.4,.23),'teal');return
 m.box(name+'_base',(x-w*.53,0,z-dep*.53),(x+w*.53,.07,z+dep*.53),'darkGold')
 base=top+.16
 # Three feet; a closed low-sided bowl, shoulder, small neck and pointed lid.
 for k in range(3):
  a=k*2*math.pi/3;cx=x+.15*math.cos(a);cz=z+.15*math.sin(a)
  m.wedge(name+f'_tripod{k}',(cx-.025,top,cz-.025),(cx+.025,top,cz-.025),(cx,top,cz+.035),(cx,base+.04,cz),'darkGold')
 m.lathe(name+'_censer',[(base,.15),(base+.13,.25),(base+.33,.21),(base+.4,.09)],'teal',5,caps=(True,False),centre=(x,z))
 m.patch(name+'_lid',[(x+.09*math.cos(k*2*math.pi/5),base+.4,z+.09*math.sin(k*2*math.pi/5)) for k in range(5)]+[(x,t['totalHeight'],z)],[(k,5,(k+1)%5) for k in range(5)],'darkGold')
 for sign in [-1,1]:
  v=[(x+sign*.20,base+.14,z),(x+sign*.34,base+.20,z),(x+sign*.32,base+.39,z),(x+sign*.25,base+.38,z)]
  m.patch(name+'_handle',v,[(0,1,2,3),(3,2,1,0)],'darkGold')

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
