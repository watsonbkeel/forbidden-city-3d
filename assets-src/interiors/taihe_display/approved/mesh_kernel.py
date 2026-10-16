"""Small, deterministic, dependency-free triangle kernel. No scene/material state."""
from math import cos, sin, pi, sqrt


def add(a,b): return tuple(a[i]+b[i] for i in range(3))
def sub(a,b): return tuple(a[i]-b[i] for i in range(3))
def mul(a,s): return tuple(v*s for v in a)
def dot(a,b): return sum(a[i]*b[i] for i in range(3))
def cross(a,b): return (a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0])
def unit(a):
    length=sqrt(dot(a,a))
    if length < 1e-12: raise ValueError('Zero-length direction')
    return mul(a,1/length)

class Mesh:
    def __init__(self):
        self.vertices=[]; self.triangles=[]; self.materials=[]; self.components=[]; self.two_sided_pairs=[]

    def patch(self,name,verts,faces,material,outward=None):
        offset=len(self.vertices)
        self.vertices.extend(tuple(float(x) for x in v) for v in verts)
        for face in faces:
            # Callers supply triangles or convex planar polygons only.
            for i in range(1,len(face)-1):
                tri=[face[0],face[i],face[i+1]]
                if outward is not None:
                    a,b,c=[verts[j] for j in tri]
                    if dot(cross(sub(b,a),sub(c,a)),outward)<0: tri.reverse()
                self.triangles.append(tuple(offset+j for j in tri))
                self.materials.append(material);self.components.append(name)

    def box(self,name,lo,hi,material,bottom=True):
        x,y,z=lo; X,Y,Z=hi
        v=[(x,y,z),(X,y,z),(X,y,Z),(x,y,Z),(x,Y,z),(X,Y,z),(X,Y,Z),(x,Y,Z)]
        f=[(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7),(4,5,6,7)]
        # Explicit outward winding (top is reversed relative to XZ order).
        f=[tuple(reversed(q)) for q in f]
        if bottom:f.append((0,1,2,3))
        self.patch(name,v,f,material)

    def slab(self,name,x,y,z,w,d,material):
        self.patch(name,[(x-w/2,y,z-d/2),(x+w/2,y,z-d/2),(x+w/2,y,z+d/2),(x-w/2,y,z+d/2)],[(0,3,2,1)],material)

    def lathe(self,name,rings,material,sides=8,caps=(False,False),centre=(0,0),skip=()):
        # rings are (y,radius); selected skipped sectors leave genuine openings.
        cx,cz=centre
        v=[(cx+r*cos(2*pi*j/sides),y,cz+r*sin(2*pi*j/sides)) for y,r in rings for j in range(sides)]
        faces=[]
        for k in range(len(rings)-1):
            for j in range(sides):
                if (k,j) in skip:continue
                faces.append((k*sides+j,(k+1)*sides+j,(k+1)*sides+(j+1)%sides,k*sides+(j+1)%sides))
        if caps[0]:faces.append(tuple(range(sides)))
        if caps[1]:faces.append(tuple((len(rings)-1)*sides+j for j in reversed(range(sides))))
        self.patch(name,v,faces,material)

    def sweep(self,name,points,radii,material,sides=6,caps=(False,False)):
        if len(points)!=len(radii) or len(points)<2:raise ValueError('Sweep needs paired rings')
        v=[];previous_u=None
        for i,(p,r) in enumerate(zip(points,radii)):
            t=unit(sub(points[min(i+1,len(points)-1)],points[max(i-1,0)]))
            ref=(1,0,0) if abs(t[0])<.9 else (0,0,1)
            u=unit(cross(t,ref)); w=cross(t,u)
            if previous_u is not None and dot(u,previous_u)<0:u=mul(u,-1);w=mul(w,-1)
            previous_u=u
            if isinstance(r,(int,float)):r=(r,r)
            for j in range(sides):v.append(add(p,add(mul(u,r[0]*cos(2*pi*j/sides)),mul(w,r[1]*sin(2*pi*j/sides)))))
        f=[]
        for i in range(len(points)-1):
            for j in range(sides):f.append((i*sides+j,i*sides+(j+1)%sides,(i+1)*sides+(j+1)%sides,(i+1)*sides+j))
        if caps[0]:f.append(tuple(reversed(range(sides))))
        if caps[1]:f.append(tuple((len(points)-1)*sides+j for j in range(sides)))
        self.patch(name,v,f,material)

    def body(self,name,rings,material,sides=8):
        # Authored front-to-back oval sections: z, centre_y, halfwidth, halfheight.
        v=[]
        for z,y,w,h in rings:
            for j in range(sides):v.append((w*cos(2*pi*j/sides),y+h*sin(2*pi*j/sides),z))
        f=[]
        for i in range(len(rings)-1):
            for j in range(sides):f.append((i*sides+j,i*sides+(j+1)%sides,(i+1)*sides+(j+1)%sides,(i+1)*sides+j))
        f.append(tuple(reversed(range(sides))))
        f.append(tuple((len(rings)-1)*sides+j for j in range(sides)))
        self.patch(name,v,f,material)

    def wedge(self,name,a,b,c,d,material):
        # Convex tetrahedron, oriented from centroid; no negative scales.
        v=[a,b,c,d];center=mul(tuple(sum(p[i] for p in v) for i in range(3)),.25)
        for f in [(0,1,2),(0,3,1),(0,2,3),(1,3,2)]:
            avg=mul(tuple(sum(v[j][i] for j in f) for i in range(3)),1/3)
            self.patch(name,v,[f],material,outward=sub(avg,center))

    def octa(self,name,center,radii,material):
        x,y,z=center;w,h,d=radii
        v=[(x-w,y,z),(x+w,y,z),(x,y-h,z),(x,y+h,z),(x,y,z-d),(x,y,z+d)]
        for f in [(0,2,4),(0,4,3),(0,3,5),(0,5,2),(1,4,2),(1,3,4),(1,5,3),(1,2,5)]:
            avg=mul(tuple(sum(v[j][i] for j in f) for i in range(3)),1/3)
            self.patch(name,v,[f],material,outward=sub(avg,center))

    def explicit_reverse_faces(self, components):
        """Counted back surfaces for specific FrontSide sheets, never a shader flag."""
        for i in range(len(self.triangles)):
            if self.components[i] not in components:continue
            j=len(self.triangles)
            self.triangles.append(tuple(reversed(self.triangles[i])))
            self.materials.append(self.materials[i])
            self.components.append(self.components[i]+'__reverse')
            self.two_sided_pairs.append([i,j])

    def data(self):
        return {'vertices':[list(v) for v in self.vertices], 'triangles':[list(t) for t in self.triangles], 'materials':self.materials[:], 'components':self.components[:], 'two_sided_pairs':[p[:] for p in self.two_sided_pairs]}
