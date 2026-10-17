"""Original source-informed Taihe furniture DETAIL geometry; CPU only.
X/Y-up/Z matches taihe-core.json; front towards -Z. No image tracing,
new materials, lighting changes, registration corrections or fallback changes.
All ornamental dimensions and carving paths are authoring estimates.
"""
from math import hypot, isfinite, sqrt

def _sub(a,b): return tuple(x-y for x,y in zip(a,b))
def _cross(a,b): return (a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0])
def _dot(a,b): return sum(x*y for x,y in zip(a,b))

def _soften(points,indices,amount=.22):
    """Round selected authored corners with one bounded extra segment each."""
    result=[]
    for i,p in enumerate(points):
        if i not in indices or i==0 or i==len(points)-1:
            result.append(p)
        else:
            for neighbor in (points[i-1],points[i+1]):
                result.append(tuple((1-amount)*p[k]+amount*neighbor[k] for k in range(2)))
    return result

def _offset(points,index,width,closed=False):
    """Miter an equal-width planar ribbon with unit directions, not chord bias."""
    n=len(points);x,y=points[index]
    prev=points[(index-1)%n] if closed else points[max(index-1,0)]
    nxt=points[(index+1)%n] if closed else points[min(index+1,n-1)]
    incoming=(x-prev[0],y-prev[1]);outgoing=(nxt[0]-x,nxt[1]-y)
    if hypot(*incoming)<1e-10:incoming=outgoing
    if hypot(*outgoing)<1e-10:outgoing=incoming
    l0=hypot(*incoming);l1=hypot(*outgoing)
    if min(l0,l1)<1e-10:raise ValueError('Repeated ribbon direction')
    n0=(-incoming[1]/l0,incoming[0]/l0);n1=(-outgoing[1]/l1,outgoing[0]/l1)
    nx=n0[0]+n1[0];ny=n0[1]+n1[1];length=hypot(nx,ny)
    if length<1e-10:raise ValueError('Ribbon reverses onto itself')
    nx/=length;ny/=length
    scale=width/2/max(.4,nx*n0[0]+ny*n0[1])
    return nx*scale,ny*scale

class _Mesh:
    def __init__(self):
        self.vertices=[];self.triangles=[];self.materials=[];self.parts={};self.components=[]
    def triangle(self,a,b,c,part,material):
        index=len(self.triangles)
        self.triangles.append([a,b,c]);self.materials.append(material)
        self.parts.setdefault(part,[]).append(index)
    def component(self,name,kind,start):
        self.components.append({'name':name,'kind':kind,'triangles':list(range(start,len(self.triangles)))})
    def ribbon(self,part,points,width,z,rise=.012,material='gold',closed=False):
        """Raised two-plane ribbon on backing; invisible backs/walls omitted."""
        points=list(points);start=len(self.triangles);offset=len(self.vertices);n=len(points)
        for i,(x,y) in enumerate(points):
            nx,ny=_offset(points,i,width,closed)
            self.vertices.extend([(x+nx,y+ny,z),(x,y,z-rise),(x-nx,y-ny,z)])
        for i in range(n if closed else n-1):
            j=(i+1)%n
            for k in (0,1):
                a=offset+i*3+k;b=a+1;c=offset+j*3+k;d=c+1
                for face in ((a,b,d),(a,d,c)):
                    ps=[self.vertices[q] for q in face]
                    normal=_cross(_sub(ps[1],ps[0]),_sub(ps[2],ps[0]))
                    if normal[2]>0:face=face[::-1]
                    self.triangle(*face,part,material)
        self.component(part,'relief',start)
    def loft(self,part,points,width,z,depth=.035,material='gold'):
        """Closed diamond-section shallow openwork; four sides, no cylinders."""
        start=len(self.triangles);offset=len(self.vertices)
        for i,(x,y) in enumerate(points):
            nx,ny=_offset(points,i,width)
            self.vertices.extend([(x+nx,y+ny,z+depth/2),(x,y,z),(x-nx,y-ny,z+depth/2),(x,y,z+depth)])
        self.triangle(offset,offset+1,offset+2,part,material)
        self.triangle(offset,offset+2,offset+3,part,material)
        for i in range(len(points)-1):
            for k in range(4):
                a=offset+i*4+k;b=offset+i*4+(k+1)%4;c=a+4;d=b+4
                self.triangle(a,c,d,part,material);self.triangle(a,d,b,part,material)
        last=offset+4*(len(points)-1)
        self.triangle(last,last+2,last+1,part,material)
        self.triangle(last,last+3,last+2,part,material)
        self.component(part,'closed',start)
    def solid(self,part,outline,z,depth,material='darkGold'):
        """Closed convex shallow panel; CCW outline, explicit hard edges."""
        start=len(self.triangles);offset=len(self.vertices);n=len(outline)
        for zz in (z,z+depth):self.vertices.extend((x,y,zz) for x,y in outline)
        for i in range(1,n-1):
            self.triangle(offset,offset+i+1,offset+i,part,material)
            self.triangle(offset+n,offset+n+i,offset+n+i+1,part,material)
        for i in range(n):
            a=offset+i;b=offset+(i+1)%n
            self.triangle(a,b,b+n,part,material);self.triangle(a,b+n,a+n,part,material)
        self.component(part,'closed',start)
    def finish(self,metadata):
        normals=[]
        for face in self.triangles:
            a,b,c=[self.vertices[i] for i in face]
            n=_cross(_sub(b,a),_sub(c,a));length=sqrt(_dot(n,n))
            if length<1e-10:raise ValueError('Degenerate authored face')
            normals.append(tuple(v/length for v in n))
        metadata['components']=self.components;metadata['triangleCount']=len(self.triangles)
        return {'vertices':self.vertices,'triangles':self.triangles,'materials':self.materials,
                'normals':normals,'parts':self.parts,'metadata':metadata}

def _frame(mesh,part,x,y0,y1,halfwidth,z,width=.020):
    mesh.ribbon(part,[(x-halfwidth,y0),(x+halfwidth,y0),(x+halfwidth,y1),(x-halfwidth,y1)],width,z,.009,closed=True)

def _cloud(mesh,part,x,y,sx,sy,z,mirror=1,width=.018):
    """Original rolling cloud curl; deliberately not traced."""
    path=[(-.95,-.12),(-.55,.28),(-.12,.24),(.08,.72),(.53,.88),(.89,.49),(.62,.16),(.33,.28)]
    mesh.ribbon(part,[(x+mirror*a*sx,y+b*sy) for a,b in _soften(path,{4,5})],width,z,.009)

def _dragon(mesh,part,x,y,w,h,z,mirror=1,width=.026):
    """Original S-bodied category motif; no authentic pose or dragon-count claim."""
    points=[(-.28,.04),(-.60,.16),(-.44,.33),(.20,.34),(.47,.49),(.24,.63),(-.20,.66),(-.35,.80),(-.06,.94),(.24,.90),(.33,.81)]
    def world(path):return [(x+mirror*a*w,y+b*h) for a,b in path]
    mesh.ribbon(part,world(_soften(points,{2,3,4,7,8})),width,z,.015)
    for limb in [[(-.42,.32),(-.72,.40),(-.80,.33)],[(.30,.50),(.65,.59),(.79,.55)],
                 [(-.05,.93),(-.22,1.04),(-.10,1.09)]]:
        mesh.ribbon(part,world(limb),width*.65,z-.003,.009)
    xx=x+mirror*.24*w;yy=y+.86*h
    mesh.solid(part,[(xx-.045*w,yy-.045*h),(xx+.075*w,yy-.023*h),(xx+.065*w,yy+.033*h),(xx-.055*w,yy+.05*h)],z-.021,.018,'gold')

def _validate(profile,quality):
    if quality!='detail':raise ValueError('Only the bounded DETAIL candidate is implemented')
    for section,keys in [('throne',('z','baseY','overallHeight','seatWidth','seatDepth','seatHeight')),('screen',('z','baseY','width','height','panels','depth'))]:
        if section not in profile:raise ValueError('Missing '+section+' profile')
        for key in keys:
            value=profile[section].get(key)
            if not isinstance(value,(int,float)) or not isfinite(value):raise ValueError('Invalid '+section+'.'+key)
    t=profile['throne'];s=profile['screen']
    if s['panels']!=7 or abs(s['width']-4.2)>1e-8 or abs(s['height']-3.8)>1e-8:
        raise ValueError('Candidate requires the retained seven-leaf screen envelope')
    if abs(t['overallHeight']-1.725)>1e-8 or abs(t['seatWidth']-1.585)>1e-8 or abs(t['seatDepth']-.79)>1e-8:
        raise ValueError('Candidate requires the retained published throne dimensions')

def build_candidate(profile,quality='detail'):
    """Return deterministic indexed triangles without profile mutation.
    Retire only old throne_back* first. Keep all other furniture and screen bodies.
    """
    _validate(profile,quality);m=_Mesh();t=profile['throne'];s=profile['screen']
    seat=t['baseY']+t['seatHeight'];top=t['baseY']+t['overallHeight'];tz=t['z'];front=tz+.315
    # 0.58 m central-back width is a visual authoring estimate, never a survey.
    outline=[(-.29,seat),(.29,seat),(.29,seat+.91),(.20,top-.17),(0,top-.075),(-.20,top-.17),(-.29,seat+.91)]
    m.solid('throne_central_panel',outline,front,.17)
    _frame(m,'throne_back_registers',0,seat+.045,seat+.33,.248,front-.003,.027)
    _frame(m,'throne_back_registers',0,seat+.39,seat+.84,.248,front-.003,.027)
    m.ribbon('throne_back_registers',[(-.255,seat+.89),(-.18,top-.19),(0,top-.10),(.18,top-.19),(.255,seat+.89)],.025,front-.004,.012)
    _dragon(m,'throne_central_relief',0,seat+.42,.24,.36,front-.014,width=.025)
    _cloud(m,'throne_lower_cloud',0,seat+.105,.21,.14,front-.014,width=.022)
    for sign in (-1,1):
        m.loft('throne_open_surround',[(0,top-.030),(sign*.18,top-.074),(sign*.34,top-.19),(sign*.48,top-.34),(sign*.60,t['baseY']+1.27)],.043,tz+.365,.045)
        m.loft('throne_open_surround',[(sign*.59,t['baseY']+1.28),(sign*.67,t['baseY']+1.21),(sign*.65,t['baseY']+1.11),(sign*.55,t['baseY']+1.10),(sign*.51,t['baseY']+1.17)],.034,tz+.365,.038)
        m.loft('throne_open_uprights',[(sign*.31,seat-.015),(sign*.34,seat+.32),(sign*.33,seat+.63),(sign*.34,top-.19)],.028,tz+.382,.036)
    m.solid('throne_crown',[(0,top-.085),(.06,top-.045),(0,top),(-.06,top-.045)],tz+.345,.065,'gold')
    # Recessed blue backing is untouched. Gold stays in its 0.16 m band.
    wz=tz-(t['seatDepth']-.08)/2-.004;wy=t['baseY']+.34
    for sign in (-1,1):
        path=[(.06,0),(.16,.045),(.29,.048),(.37,.005),(.48,-.045),(.61,-.035),(.67,.015),(.61,.05),(.54,.025)]
        m.loft('throne_waist_double_scroll',[(sign*x,wy+y) for x,y in _soften(path,{3,6})],.017,wz-.018,.018)
        m.ribbon('throne_waist_branches',[(sign*.32,wy+.024),(sign*.39,wy+.062),(sign*.46,wy+.060)],.013,wz-.004,.010)
        m.ribbon('throne_waist_branches',[(sign*.45,wy-.02),(sign*.53,wy-.061),(sign*.58,wy-.056)],.013,wz-.004,.010)
    m.solid('throne_waist_pearl',[(-.032,wy),(0,wy-.035),(.032,wy),(0,wy+.035)],wz-.021,.018,'gold')
    # Existing seven red-brown bodies and registration are preserved.
    # Their cap apex remains solid; real small curls open above the shoulders.
    sw=s['width']/7;sz=s['z']-.138;base=s['baseY']
    for i in range(7):
        x=(i-3)*sw;h=s['height']-abs(i-3)*.33;upper=base+h
        frames=f'screen_{i}_register_frames';main=f'screen_{i}_main_relief'
        _frame(m,frames,x,base+.18,base+.59,.237,sz,.023)
        _frame(m,frames,x,base+.72,upper-.76,.237,sz,.025)
        _frame(m,frames,x,base+.79,upper-.83,.195,sz-.008,.013)
        cap=[(x-.237,upper-.65),(x+.237,upper-.65),(x+.237,upper-.36),(x+.14,upper-.36),(x+.08,upper-.27),(x-.08,upper-.27),(x-.14,upper-.36),(x-.237,upper-.36)]
        m.ribbon(frames,cap,.019,sz,.010,closed=True)
        # Fit the entire original field, including horn (1.09 normalized Y)
        # and the worst-case mitered half stroke, within the inner frame.
        motif_width=.038
        inner_top=upper-.83-.013/2
        motif_origin=base+.91
        miter_half_stroke=motif_width/(2*.4)
        motifheight=(inner_top-motif_origin-miter_half_stroke)/1.09
        _dragon(m,main,x,motif_origin,.205,motifheight,sz-.014,mirror=(-1 if i%2 else 1),width=motif_width)
        _cloud(m,f'screen_{i}_upper_cloud',x,upper-.575,.185,.16,sz-.014,mirror=(-1 if i<3 else 1),width=.018)
        _cloud(m,f'screen_{i}_lower_relief',x,base+.29,.19,.17,sz-.014,mirror=(-1 if i%2 else 1),width=.021)
        for sign in (-1,1):
            curl=[(.146,-.095),(.212,-.037),(.267,-.070),(.251,-.128),(.211,-.115)]
            m.loft(f'screen_{i}_crest_curls',[(x+sign*a,upper+b) for a,b in _soften(curl,{1})],.023,sz-.006,.045)
    return m.finish({'quality':'detail','coordinateFrame':'hall-local X/Y-up/Z; front -Z',
        'centralBackWidthEstimate':.58,'retireBeforeAppend':['throne_back*'],
        'retained':['arm/seat/base/footstool/waist backing','seven screen bodies and old face details','profile registration','lighting/material factors','fallback'],
        'limitations':['Original category-informed carving, not an exact replica or claimed dragon count.',
            'Screen cap substrate is retained: only shoulder curl gaps are genuinely open.',
            'Rear carving not added; sources do not establish its arrangement.',
            'Blue backing color is unchanged; no calibrated blue RGB inferred.',
            'Fallback remains coarse in this detail-only candidate.',
            'Current hall registration remains provisional and is not resolved by detail work.'],
        'dimensions':'Only existing artifact dimensions are published; all ornament widths, depths and paths are estimates. Seat width is not a surveyed outer arm width.',
        'sourcePhoto':'https://img.dpm.org.cn/Uploads/Picture/dc/1606%5B1024%5D.jpg',
        'sourceDossier':'https://www.dpm.org.cn/Uploads/pdf/5063/T00012_00.pdf',
        'rights':'Self-authored geometric approximations. Museum images are research references only, never runtime assets.'})
