"""Self-authored Taihe central dragon candidate; pure CPU geometry, no scene state.

Reference-informed silhouette only. Every proportion is an estimated authoring
choice, not a digitization or conservation measurement. The retained profile,
tiers, opening, seven pearls, lighting and navigation are never changed here.
Coordinate convention matches taihe.py: X, Y-up, Z. No Blender dependency.
"""
from math import cos, sin, pi, sqrt, isfinite


def _add(a,b): return tuple(x+y for x,y in zip(a,b))
def _sub(a,b): return tuple(x-y for x,y in zip(a,b))
def _mul(a,s): return tuple(x*s for x in a)
def _dot(a,b): return sum(x*y for x,y in zip(a,b))
def _cross(a,b): return (a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0])
def _length(a): return sqrt(_dot(a,a))
def _unit(a):
    length = _length(a)
    if length < 1e-12: raise ValueError('Zero-length mesh direction')
    return _mul(a,1/length)
def _mean(points): return tuple(sum(p[k] for p in points)/len(points) for k in range(3))


class _Mesh:
    def __init__(self):
        self.vertices=[]; self.faces=[]; self.materials=[]; self.labels=[]

    def face(self,indices,part,material='gold'):
        self.faces.append(list(indices)); self.labels.append(part); self.materials.append(material)
        return len(self.faces)-1

    def loft(self,sections,sides,tip,body_sections,head_sections):
        # Each section is (centre, half-width, half-depth, preferred width axis).
        # Project the chosen width axis onto the tangent plane; the other axis
        # is its right-handed complement. No negative scale or double-sided fix.
        for i,(p,w,h,preferred) in enumerate(sections):
            previous=sections[max(0,i-1)][0]
            following=sections[i+1][0] if i+1<len(sections) else tip
            tangent=_unit(_sub(following,previous))
            u=_unit(_sub(preferred,_mul(tangent,_dot(preferred,tangent))))
            v=_cross(tangent,u)
            for j in range(sides):
                angle=2*pi*j/sides
                self.vertices.append(_add(p,_add(_mul(u,w*cos(angle)),_mul(v,h*sin(angle)))))
            if i:
                current=self.vertices[-sides:];previous=self.vertices[-2*sides:-sides]
                phase=min(range(sides),key=lambda k:sum(_length(_sub(current[(j+k)%sides],previous[j]))**2 for j in range(sides)))
                self.vertices[-sides:]=current[phase:]+current[:phase]
        for j in range(1,sides-1): self.face((0,j+1,j),'coiled_body')
        for i in range(len(sections)-1):
            part='coiled_body' if i<body_sections else 'descending_head' if i<head_sections else 'pearl_support'
            for j in range(sides):
                a=i*sides+j; b=i*sides+(j+1)%sides; c=(i+1)*sides+j; d=(i+1)*sides+(j+1)%sides
                material='darkGold' if part=='pearl_support' and i==head_sections+2 else 'gold'
                self.face((a,b,d),part,material); self.face((a,d,c),part,material)
        apex=len(self.vertices); self.vertices.append(tip)
        for j in range(sides): self.face(((len(sections)-1)*sides+j,(len(sections)-1)*sides+(j+1)%sides,apex),'pearl_support')

    def grow(self,index,centres,scales,part,material='gold'):
        """Replace one surface triangle with a closed outward-grown branch.

        The original three indices are reused, giving a real connected shell.
        A small triangular section keeps horns angular rather than tubular.
        """
        root=self.faces[index]; points=[self.vertices[i] for i in root]; centre=_mean(points)
        offsets=[_sub(p,centre) for p in points]
        self.faces[index]=None
        previous=root
        for p,scale in zip(centres[:-1],scales):
            ring=[]
            for offset in offsets:
                ring.append(len(self.vertices)); self.vertices.append(_add(p,_mul(offset,scale)))
            for j in range(3):
                k=(j+1)%3
                self.face((previous[j],previous[k],ring[k]),part,material)
                self.face((previous[j],ring[k],ring[j]),part,material)
            previous=ring
        apex=len(self.vertices);self.vertices.append(centres[-1])
        for j in range(3):self.face((previous[j],previous[(j+1)%3],apex),part,material)

    def nearest_face(self,target,part,sign=None,normal_hint=None):
        candidates=[]
        for i,f in enumerate(self.faces):
            if f is None or self.labels[i]!=part:continue
            points=[self.vertices[j] for j in f]; centre=_mean(points)
            if sign and centre[0]*sign<.005:continue
            normal=_unit(_cross(_sub(points[1],points[0]),_sub(points[2],points[0])))
            if sign and normal[0]*sign<.25:continue
            if normal_hint is not None and _dot(normal,normal_hint)<.35:continue
            candidates.append((_length(_sub(centre,target)),i))
        if not candidates:raise ValueError('No outward attachment face')
        return min(candidates)[1]

    def finish(self,quality):
        triangles=[];materials=[];normals=[];parts={}
        for face,material,part in zip(self.faces,self.materials,self.labels):
            if face is None:continue
            a,b,c=(self.vertices[i] for i in face)
            normal=_unit(_cross(_sub(b,a),_sub(c,a)))
            parts.setdefault(part,[]).append(len(triangles))
            triangles.append(face);materials.append(material);normals.append(normal)
        return {'vertices':self.vertices,'triangles':triangles,'materials':materials,'normals':normals,'parts':parts,
                'metadata':{'quality':quality,'proportions':'estimated, not conservation measurements',
                            'retainedPearlCount':7,'referencePhoto':'https://img.dpm.org.cn/Uploads/Picture/dc/1602%5B1024%5D.jpg',
                            'referenceArticle':'https://img.dpm.org.cn/Uploads/pdf/1944/T00008_00.pdf',
                            'rights':'Self-authored geometry; reference images are research only, never runtime assets.'}}


def _validate(c,quality):
    if quality not in ('detail','fallback'):raise ValueError('Unknown quality')
    for key in ('z','nominalSpan','rimY','topY','sphereY','sphereRadius','satelliteRadius','satelliteRing'):
        if key not in c or not isinstance(c[key],(int,float)) or not isfinite(c[key]):raise ValueError('Invalid caisson '+key)
    if c['topY']-c['rimY']<1.5 or c['nominalSpan']<5.5 or c['sphereRadius']<=0 or c['satelliteRadius']<=0:
        raise ValueError('Candidate requires the retained Taihe caisson envelope')
    if c['sphereY']+c['sphereRadius']>=c['rimY']-.2:raise ValueError('No space for retained pearl support')


def build_candidate(c,quality='detail'):
    """Return indexed triangle data only; do not mutate the supplied profile."""
    _validate(c,quality)
    mesh=_Mesh();sections=[];y=c['rimY'];z=c['z']
    if quality=='detail':
        # A lopsided, compact return, not a circular hose. Catmull-Rom points
        # are hand-authored estimates of mass distribution, not photo tracing.
        # (X, local Z, height above rim). The upper return curls inward;
        # an explicit depth separation lets its silhouette overlap without
        # intersecting the earlier turn. These are hand-authored estimates.
        controls=[(.88,-.23,1.20),(.98,.19,1.20),(.80,.65,1.17),
                  (.46,.88,1.17),(.10,.90,1.17),(-.16,.70,1.17),
                  (-.10,.46,1.20),(.16,.45,1.27),(.30,.65,1.34),
                  (.14,.80,1.43),(-.10,.88,1.49),(-.40,.90,1.45),
                  (-.69,.67,1.34),(-.93,.13,1.24),(-.72,-.41,1.20),
                  (-.25,-.58,1.18),(.27,-.43,1.17),(.46,-.04,1.22),
                  (.28,.25,1.20),(-.02,.25,1.08)]
        path=[]
        for segment in range(len(controls)-1):
            p0=controls[max(0,segment-1)];p1=controls[segment]
            p2=controls[segment+1];p3=controls[min(len(controls)-1,segment+2)]
            for j in range(4):
                t=j/4
                path.append(tuple(.5*((2*p1[k])+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t*t+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t*t*t) for k in range(3)))
        path.append(controls[-1]);coil_rings=len(path)
        for i,(x,dz,dy) in enumerate(path):
            t=i/(coil_rings-1)
            before=path[max(i-1,0)];after=path[min(i+1,coil_rings-1)]
            preferred=(after[1]-before[1],0,before[0]-after[0])
            width=.018+.182*sin(pi*min(t/.75,1)/2)
            depth=.012+.108*sin(pi*min(t/.75,1)/2)
            curl=sin(pi*min(max((t-.12)/.55,0),1))**2
            width*=1-.55*curl;depth*=1-.35*curl
            if t>.76:
                taper=(t-.76)/.24;width*=1-.83*taper;depth*=1-.58*taper
            sections.append(((x,y+dy,z+dz),width,depth,preferred))
        # Compact skull and short convex muzzle replace the broad flat mask.
        # The 30-35% skull/body target is a perspective-aware authoring bound;
        # the source photograph's visible skull is smaller still, not surveyed.
        for x,dy,dz,w,h in [(0,.94,.30,.08,.07),(0,.78,.36,.16,.12),
                            (0,.65,.36,.29,.22),(0,.55,.32,.35,.27),
                            (0,.43,.26,.23,.17),(0,.31,.15,.30,.27),
                            (0,.20,.08,.25,.20),(0,.02,.04,.23,.16),
                            (0,-.12,-.02,.12,.10)]:
            sections.append(((x,y+dy,z+dz),w,h,(1,0,0)))
        head_end=len(sections)-1
        for dy,radius in [(-.22,.30),(-.27,.32),(-.32,.28),(-.36,.055)]:
            sections.append(((0,y+dy,z),radius,radius,(1,0,0)))
        sections.append(((0,c['sphereY']+c['sphereRadius']+.035,z),.022,.022,(1,0,0)))
        mesh.loft(sections,12,(0,c['sphereY']+c['sphereRadius'],z),coil_rings-1,head_end)

        def attachment(index):
            ps=[mesh.vertices[j] for j in mesh.faces[index]]
            return _mean(ps),_unit(_cross(_sub(ps[1],ps[0]),_sub(ps[2],ps[0])))

        # Long horns spread outward and toward the forehead (positive Z), on
        # the low side of the coil. Their branch silhouette remains exposed.
        for sign,side in [(-1,'left'),(1,'right')]:
            name=side+'_horn'
            index=mesh.nearest_face((sign*.27,y+.58,z+.48),'descending_head',sign,normal_hint=(0,-1,0))
            base,normal=attachment(index);first=_add(base,_mul(normal,.13))
            centres=[first,_add(first,(sign*.18,-.03,.12)),
                     _add(first,(sign*.38,-.01,.28)),_add(first,(sign*.50,.03,.44))]
            mesh.grow(index,centres,[.52,.26,.07],name)
            index=mesh.nearest_face(_add(first,(sign*.18,-.03,.12)),name,sign)
            base,normal=attachment(index)
            mesh.grow(index,[_add(base,(sign*.24,-.06,-.05))],[],side+'_horn_branch')

        # Broad changes of body width carry the relief. No repeated dark
        # triangular marks: they read as saw teeth in the ordinary near view.

        # Paired angular recessed eyes are deliberately below the brow plane,
        # so they read in a real upward view instead of hiding on a vertical side.
        for sign,side in [(-1,'left'),(1,'right')]:
            index=mesh.nearest_face((sign*.22,y+.40,z+.45),'descending_head',normal_hint=(0,-1,0))
            base,normal=attachment(index)
            mesh.grow(index,[_add(base,_mul(normal,-.024)),_add(base,_mul(normal,-.032))],[.58],side+'_eye_recess','darkGold')
            index=mesh.nearest_face((sign*.19,y+.52,z+.48),'descending_head',normal_hint=(0,-1,0))
            base,normal=attachment(index)
            mesh.grow(index,[_add(base,_mul(normal,.075))],[],'brow_ridges')
            index=mesh.nearest_face((sign*.09,y+.16,z+.28),'descending_head',normal_hint=(0,-1,0))
            base,normal=attachment(index)
            mesh.grow(index,[_add(base,_mul(normal,.045)),_add(base,_mul(normal,.105))],[.75],'muzzle_planes')
            index=mesh.nearest_face((sign*.29,y+.35,z+.12),'descending_head',sign)
            base,normal=attachment(index);first=_add(base,_mul(normal,.12))
            centres=[first,_add(first,(sign*.15,-.08,-.02)),
                     _add(first,(sign*.27,-.06,.10)),_add(first,(sign*.36,-.03,.23))]
            # grow() retains the root section plane throughout the branch.
            # A curling tip must stay ahead of the final ring in that plane's
            # outward direction, or its closing cone folds inside-out. Move
            # only this terminal point to a 1 cm positive advance.
            advance=_dot(_sub(centres[-1],centres[-2]),normal)
            centres[-1]=_add(centres[-1],_mul(normal,max(0,.01-advance)))
            mesh.grow(index,centres,[.25,.06,.01],side+'_cheek_scroll')
    else:
        # Six triangular sections and one terminal support point: 34 triangles.
        # The two connected horn face extrusions add four, for 38 in total.
        for angle,r,dy,w,h in [(.15,1.03,1.22,.07,.04),(1.85,.92,1.20,.18,.09),
                                (3.55,.80,1.16,.20,.10),(5.10,.62,1.08,.10,.07)]:
            sections.append(((r*cos(angle),y+dy,z+r*sin(angle)),w,h,(cos(angle),0,sin(angle))))
        sections.extend([((0,y+.48,z-.13),.37,.22,(1,0,0)),((0,y-.18,z),.24,.24,(1,0,0))])
        mesh.loft(sections,3,(0,c['sphereY']+c['sphereRadius'],z),3,5)
        for sign,name in [(-1,'left_horn'),(1,'right_horn')]:
            index=mesh.nearest_face((sign*.25,y+.55,z-.10),'descending_head',sign)
            centre=_mean([mesh.vertices[j] for j in mesh.faces[index]])
            face=mesh.faces[index];ps=[mesh.vertices[j] for j in face]
            normal=_unit(_cross(_sub(ps[1],ps[0]),_sub(ps[2],ps[0])))
            mesh.grow(index,[_add(centre,_mul(normal,.28))],[],name)
    if quality=='detail':
        # Authoring uses +Z from chin to forehead. Reflect the local carving so
        # the forehead faces the ordinary south-side visitor in an upward view.
        # This orientation is an authoring estimate, NOT surveyed registration.
        # Reversing each face preserves outward winding under the reflection.
        mesh.vertices=[(x,yy,2*z-zz) for x,yy,zz in mesh.vertices]
        mesh.faces=[list(reversed(face)) if face is not None else None for face in mesh.faces]
    return mesh.finish(quality)


def connected_components(mesh):
    """Triangle components sharing a vertex; used to prove the head/body join."""
    linked={}
    for i,f in enumerate(mesh['triangles']):
        for v in f:linked.setdefault(v,[]).append(i)
    unseen=set(range(len(mesh['triangles'])));components=[]
    while unseen:
        stack=[unseen.pop()];component=[]
        while stack:
            i=stack.pop();component.append(i)
            for v in mesh['triangles'][i]:
                for j in linked[v]:
                    if j in unseen:unseen.remove(j);stack.append(j)
        components.append(component)
    return components


def _point_triangle(p,a,b,c):
    # Closest-point Voronoi regions, including faces and every edge/vertex.
    ab=_sub(b,a);ac=_sub(c,a);ap=_sub(p,a);d1=_dot(ab,ap);d2=_dot(ac,ap)
    if d1<=0 and d2<=0:return _length(ap)
    bp=_sub(p,b);d3=_dot(ab,bp);d4=_dot(ac,bp)
    if d3>=0 and d4<=d3:return _length(bp)
    vc=d1*d4-d3*d2
    if vc<=0 and d1>=0 and d3<=0:return _length(_sub(p,_add(a,_mul(ab,d1/(d1-d3)))))
    cp=_sub(p,c);d5=_dot(ab,cp);d6=_dot(ac,cp)
    if d6>=0 and d5<=d6:return _length(cp)
    vb=d5*d2-d1*d6
    if vb<=0 and d2>=0 and d6<=0:return _length(_sub(p,_add(a,_mul(ac,d2/(d2-d6)))))
    va=d3*d6-d5*d4
    if va<=0 and d4-d3>=0 and d5-d6>=0:return _length(_sub(p,_add(b,_mul(_sub(c,b),(d4-d3)/((d4-d3)+(d5-d6))))))
    inv=1/(va+vb+vc)
    return _length(_sub(p,_add(a,_add(_mul(ab,vb*inv),_mul(ac,vc*inv)))))


def _segment_segment(p1,q1,p2,q2):
    d1=_sub(q1,p1);d2=_sub(q2,p2);r=_sub(p1,p2);a=_dot(d1,d1);e=_dot(d2,d2);f=_dot(d2,r)
    clamp=lambda x:max(0,min(1,x))
    if a<1e-20 and e<1e-20:return _length(r)
    if a<1e-20:s=0;t=clamp(f/e)
    else:
        c=_dot(d1,r)
        if e<1e-20:t=0;s=clamp(-c/a)
        else:
            b=_dot(d1,d2);denom=a*e-b*b;s=clamp((b*f-c*e)/denom) if abs(denom)>1e-20 else 0
            t=(b*s+f)/e
            if t<0:t=0;s=clamp(-c/a)
            elif t>1:t=1;s=clamp((b-c)/a)
    return _length(_sub(_add(p1,_mul(d1,s)),_add(p2,_mul(d2,t))))


def _segment_hits_triangle(p,q,a,b,c):
    direction=_sub(q,p);ab=_sub(b,a);ac=_sub(c,a);h=_cross(direction,ac);det=_dot(ab,h)
    if abs(det)<1e-12:return False
    inv=1/det;s=_sub(p,a);u=inv*_dot(s,h)
    if u< -1e-10 or u>1+1e-10:return False
    v=inv*_dot(direction,_cross(s,ab))
    if v< -1e-10 or u+v>1+1e-10:return False
    t=inv*_dot(ac,_cross(s,ab))
    return -1e-10<=t<=1+1e-10


def _triangle_distance(a,b):
    for t,u in ((a,b),(b,a)):
        for p,q in zip(t,t[1:]+t[:1]):
            if _segment_hits_triangle(p,q,*u):return 0.0
    best=min(min(_point_triangle(p,*b) for p in a),min(_point_triangle(p,*a) for p in b))
    for p,q in zip(a,a[1:]+a[:1]):
        for r,s in zip(b,b[1:]+b[:1]):best=min(best,_segment_segment(p,q,r,s))
    return best


def _bounds(triangle):return tuple(min(p[k] for p in triangle) for k in range(3)),tuple(max(p[k] for p in triangle) for k in range(3))
def _bounds_distance(a,b):return sqrt(sum(max(a[0][k]-b[1][k],b[0][k]-a[1][k],0)**2 for k in range(3)))


def retained_surfaces(c):
    """Exact triangulated faces of the existing 32-sector S tiers and cap.

    Also include the coarser fallback walls; each candidate must clear both
    retained implementations, not just an idealized circular funnel.
    """
    tiers=[];cap=[]
    for n in (32,8):
        shapes=[('square',c['nominalSpan']/2-.16,c['rimY']+.12),('oct' if n==32 else 'circle',2.10 if n==32 else 2.25,c['rimY']+.62),('circle',1.76,c['rimY']+.96),('circle',1.12,c['topY']-.03)]
        rings=[]
        for shape,size,y in shapes:
            ring=[]
            for k in range(n):
                angle=2*pi*k/n
                radius=size/max(abs(cos(angle)),abs(sin(angle))) if shape=='square' else size/cos((angle+pi/8)%(pi/4)-pi/8) if shape=='oct' else size
                ring.append((radius*cos(angle),y,c['z']+radius*sin(angle)))
            rings.append(ring)
        for lower,upper in zip(rings,rings[1:]):
            for k in range(n):
                j=(k+1)%n;tiers.extend([(lower[k],upper[k],lower[j]),(upper[k],upper[j],lower[j])])
        for k in range(n):cap.append(((0,c['topY']-.03,c['z']),rings[-1][k],rings[-1][(k+1)%n]))
    return tiers,cap


def clearance_report(mesh,c):
    """Actual surface distances; central pearl contact is intentional and zero."""
    triangles=[tuple(mesh['vertices'][j] for j in f) for f in mesh['triangles']]
    bounds=[_bounds(t) for t in triangles];tiers,cap=retained_surfaces(c)
    def clearance(surfaces):
        best=float('inf');hits=0
        for surface in surfaces:
            bound=_bounds(surface)
            for tri,box in zip(triangles,bounds):
                if _bounds_distance(bound,box)>best:continue
                distance=_triangle_distance(tri,surface)
                if distance<1e-9:hits+=1
                best=min(best,distance)
        return best,hits
    tier_distance,tier_hits=clearance(tiers);cap_distance,cap_hits=clearance(cap)
    central=(0,c['sphereY'],c['z'])
    central_distance=min(_point_triangle(central,*tri)-c['sphereRadius'] for tri in triangles)
    satellite_distance=float('inf')
    for i in range(6):
        angle=i*pi/3;p=(c['satelliteRing']*cos(angle),c['sphereY']+.2,c['z']+c['satelliteRing']*sin(angle))
        satellite_distance=min(satellite_distance,min(_point_triangle(p,*tri)-c['satelliteRadius'] for tri in triangles))
    return {'method':'triangle-to-triangle distance and analytic sphere-to-triangle distance',
            'tierClearance':tier_distance,'capClearance':cap_distance,'centralPearlClearance':central_distance,
            'satelliteClearance':satellite_distance,'surfaceIntersections':tier_hits+cap_hits,
            'minimumY':min(p[1] for p in mesh['vertices']),'maximumY':max(p[1] for p in mesh['vertices']),
            'maximumRadius':max(sqrt(p[0]**2+(p[2]-c['z'])**2) for p in mesh['vertices'])}


def material_batches(mesh):
    """Flat normals, no materials created, deterministic per-material accessor data.

    Keeping each triangle's vertices separate preserves the authored ridges and
    avoids smoothing across the horns, muzzle and support canopy. sourceTriangles
    and parts retain exact semantic ownership after splitting into material bins.
    """
    ownership={index:name for name,indices in mesh['parts'].items() for index in indices}
    batches={}
    for index,(triangle,material,normal) in enumerate(zip(mesh['triangles'],mesh['materials'],mesh['normals'])):
        batch=batches.setdefault(material,{'position':[],'normal':[],'indices':[],'sourceTriangles':[],'parts':{}})
        first=len(batch['position'])//3;local=len(batch['sourceTriangles'])
        for vertex in triangle:
            batch['position'].extend(mesh['vertices'][vertex]);batch['normal'].extend(normal)
        batch['indices'].extend((first,first+1,first+2));batch['sourceTriangles'].append(index)
        batch['parts'].setdefault(ownership[index],[]).append(local)
    return batches
