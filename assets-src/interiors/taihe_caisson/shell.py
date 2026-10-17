"""Source-informed, self-authored Taihe caisson shell. Pure CPU indexed mesh.

This open, cavity-facing annulus REPLACES the three old ramps and detail ribs;
it is never laid over them. Preserve the separate rim, cap, dragon and pearls.
All frame widths, depths, recesses and elevations are visual authoring estimates,
not measured construction. Coordinates: X, Y-up, Z; existing profile is read-only.
"""
from math import cos, sin, pi, sqrt, isfinite


def _sub(a,b): return tuple(x-y for x,y in zip(a,b))
def _dot(a,b): return sum(x*y for x,y in zip(a,b))
def _cross(a,b): return (a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0])


class _Mesh:
    def __init__(self,z):
        self.z=z; self.vertices=[]; self.triangles=[]; self.normals=[]
        self.materials=[]; self.parts={}; self.cache={}; self.panels=[]; self.quads=[]

    def vertex(self,p):
        key=tuple(round(v,10) for v in p)
        if key not in self.cache:
            self.cache[key]=len(self.vertices); self.vertices.append(tuple(p))
        return self.cache[key]

    def triangle(self,ids,part,material):
        ids=list(ids); a,b,c=(self.vertices[i] for i in ids)
        n=_cross(_sub(b,a),_sub(c,a)); length=sqrt(_dot(n,n))
        if length<1e-12: raise ValueError('Degenerate shell triangle')
        radial=n[0]*(a[0]+b[0]+c[0])+n[2]*(a[2]+b[2]+c[2]-3*self.z)
        if n[1]>1e-12 or (abs(n[1])<=1e-12 and radial>0):
            ids.reverse(); n=tuple(-v for v in n)
        self.parts.setdefault(part,[]).append(len(self.triangles))
        self.triangles.append(ids); self.normals.append(tuple(v/length for v in n)); self.materials.append(material)

    def quad(self,ids,part,material,planar=True):
        if planar:
            a,b,c,d=(self.vertices[i] for i in ids)
            if abs(_dot(_cross(_sub(b,a),_sub(c,a)),_sub(d,a)))>1e-10:
                raise ValueError('Warped intended shell quad')
            self.quads.append(list(ids))
        # Unequal loop sampling can form a concave projected quadrilateral.
        # Select its interior diagonal, rather than flipping one folded face.
        a,b,c,d=(self.vertices[i] for i in ids)
        na=_cross(_sub(b,a),_sub(c,a))[1]
        nb=_cross(_sub(c,a),_sub(d,a))[1]
        if na*nb < -1e-16:
            self.triangle((ids[0],ids[1],ids[3]),part,material)
            self.triangle((ids[1],ids[2],ids[3]),part,material)
        else:
            self.triangle((ids[0],ids[1],ids[2]),part,material)
            self.triangle((ids[0],ids[2],ids[3]),part,material)

    def ring(self,shape,size,y,n,phase=0):
        ids=[]
        for i in range(n):
            angle=phase+2*pi*i/n
            radius=size/max(abs(cos(angle)),abs(sin(angle))) if shape=='square' else size/cos(pi/8) if shape=='oct' else size
            ids.append(self.vertex((radius*cos(angle),y,self.z+radius*sin(angle))))
        return ids

    def band(self,a,b,part,material,planar=True):
        # Phase-aligned loops. Unequal subdivisions are an explicit triangle
        # fan transition, never a warped quad smoothed into a fake flat panel.
        i=j=0; n=len(a); m=len(b)
        while i<n or j<m:
            ni=(i+1)/n if i<n else float('inf'); nj=(j+1)/m if j<m else float('inf')
            if abs(ni-nj)<1e-12:
                self.quad((a[i%n],a[(i+1)%n],b[(j+1)%m],b[j%m]),part,material,planar and n==m)
                i+=1; j+=1
            elif ni<nj:
                self.triangle((a[i%n],a[(i+1)%n],b[j%m]),part,material); i+=1
            else:
                self.triangle((a[i%n],b[(j+1)%m],b[j%m]),part,material); j+=1

    def recessed_panel(self,boundary,name):
        # Homothetic edges make every reveal a genuine planar trapezoid.
        # Recession moves into the ceiling (+Y), leaving joined gold frames.
        points=[self.vertices[i] for i in boundary]
        centre=tuple(sum(p[k] for p in points)/len(points) for k in range(3))
        def inset(scale,depth):
            return [self.vertex(tuple(centre[k]+scale*(p[k]-centre[k])+(depth if k==1 else 0) for k in range(3))) for p in points]
        inner=inset(.87,0); floor=inset(.82,.06)
        self.band(boundary,inner,name+'_frame','gold')
        self.band(inner,floor,name+'_reveal','darkGold')
        for i in range(1,len(floor)-1): self.triangle((floor[0],floor[i],floor[i+1]),name+'_floor','darkGold')
        self.panels.append({'name':name,'boundary':list(boundary),'inset':inner,'floor':floor,'recessDepth':.06})

    def finish(self,quality):
        return {'vertices':self.vertices,'triangles':self.triangles,'normals':self.normals,
                'materials':self.materials,'parts':self.parts,
                'metadata':{'quality':quality,'proportions':'estimated, not conservation measurements',
                'ownership':'replace old three tiers and detail approximate ribs only',
                'referencePhoto':'https://img.dpm.org.cn/Uploads/Picture/dc/1602%5B1024%5D.jpg',
                'referenceBuilding':'https://www.dpm.org.cn/explore/building/236465.html',
                'rights':'Self-authored geometry; reference photographs remain research-only.',
                'planarPanels':self.panels,'planarQuads':self.quads}}


def build_shell(c,quality='detail'):
    """Return vertices, indexed triangles, per-face normals/materials and parts.

    Detail is 472 triangles, replacing 320. Fallback is 48, replacing 48.
    The exact old detail 32-point square/top-circle boundary is retained;
    fallback retains its own old 8-point boundary. No cap or outer rim is added.
    """
    if quality not in ('detail','fallback'): raise ValueError('Unknown shell quality')
    for key in ('z','nominalSpan','rimY','topY'):
        if key not in c or not isinstance(c[key],(float,int)) or not isfinite(c[key]): raise ValueError('Invalid shell '+key)
    if c['nominalSpan']<=5.76 or c['topY']-c['rimY']<1.7: raise ValueError('Shell requires retained Taihe envelope')
    m=_Mesh(c['z']); y=c['rimY']; outer=c['nominalSpan']/2-.16
    if quality=='fallback':
        # Four nested contour bands; diamond approximates the diagonal frame.
        # Eightfold boundary and 48-triangle budget exactly match the old tiers.
        a=m.ring('square',outer,y+.12,8)
        b=m.ring('circle',2.70,y+.12,4)
        m.band(a,b,'lower_diagonal_panels','darkGold')
        d=m.ring('circle',2.56,y+.24,4)
        m.band(b,d,'diagonal_frame','gold')
        e=m.ring('circle',1.76,y+.96,8)
        m.band(d,e,'inner_recess','darkGold',False)
        f=m.ring('circle',1.12,c['topY']-.03,8)
        m.band(e,f,'upper_round','gold')
    else:
        # Square opening and two stepped edges. Four-corner interior rings
        # economize geometry while preserving the exact 32-point outer contour.
        a=m.ring('square',outer,y+.12,32,pi/4)
        b=m.ring('square',2.72,y+.12,4,pi/4)
        m.band(a,b,'square_lower_ledge','gold')
        d=m.ring('square',2.72,y+.22,4,pi/4)
        m.band(b,d,'square_inner_fascia','darkGold')
        e=m.ring('square',2.62,y+.22,4,pi/4)
        m.band(d,e,'square_upper_ledge','gold')
        octagon=m.ring('oct',2.10,y+.62,8,pi/8)
        for i in range(4):
            m.recessed_panel([e[i],octagon[2*i],octagon[2*i+1]],'corner_panel_'+str(i))
            m.recessed_panel([e[i],e[(i+1)%4],octagon[(2*i+2)%8],octagon[2*i+1]],'side_panel_'+str(i))
        f=m.ring('oct',2.10,y+.72,8,pi/8)
        m.band(octagon,f,'octagonal_fascia','darkGold')
        g=m.ring('oct',1.97,y+.72,8,pi/8)
        m.band(f,g,'octagonal_ledge','gold')
        h=m.ring('circle',1.76,y+.96,16,pi/8)
        m.band(g,h,'round_transition_panels','darkGold',False)
        j=m.ring('circle',1.68,y+.96,16,pi/8)
        m.band(h,j,'round_lower_ledge','gold')
        k=m.ring('circle',1.68,y+1.06,16,pi/8)
        m.band(j,k,'round_inner_fascia','darkGold')
        upper=m.ring('circle',1.42,y+1.38,16,pi/8)
        m.band(k,upper,'middle_round_recess','darkGold')
        ledge=m.ring('circle',1.34,y+1.38,16,pi/8)
        m.band(upper,ledge,'upper_round_ledge','gold')
        fascia=m.ring('circle',1.34,y+1.46,16,pi/8)
        m.band(ledge,fascia,'upper_round_fascia','darkGold')
        l=m.ring('circle',1.22,c['topY']-.13,16,pi/8)
        m.band(fascia,l,'upper_recess','gold')
        top=m.ring('circle',1.12,c['topY']-.03,32,pi/8)
        m.band(l,top,'top_moulding','darkGold',False)
    return m.finish(quality)


def dragon_clearance(shell,dragon):
    """Actual triangle distance against supplied current dragon, CPU only.

    No import-time dependency on the independently authored dragon module.
    Local distance functions are loaded only by this explicit diagnostic.
    """
    import importlib.util
    from pathlib import Path
    spec=importlib.util.spec_from_file_location('_taihe_shell_distance',Path(__file__).with_name('geometry.py'))
    geo=importlib.util.module_from_spec(spec); spec.loader.exec_module(geo)
    a=[tuple(shell['vertices'][i] for i in f) for f in shell['triangles']]
    b=[tuple(dragon['vertices'][i] for i in f) for f in dragon['triangles']]
    ab=[geo._bounds(t) for t in a]; bb=[geo._bounds(t) for t in b]
    best=float('inf'); intersections=0
    for t,bound in zip(a,ab):
        for u,other in zip(b,bb):
            if geo._bounds_distance(bound,other)>best: continue
            distance=geo._triangle_distance(t,u)
            if distance<1e-9: intersections+=1
            best=min(best,distance)
    return {'method':'triangle-to-triangle distance','clearance':best,'surfaceIntersections':intersections}
