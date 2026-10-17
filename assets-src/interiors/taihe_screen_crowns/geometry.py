"""Original estimated Taihe seven-leaf open crowns, CPU-only detail candidate.

No photo tracing or reproduced dragon anatomy. The existing 4.2 x 3.8 m
screen envelope, .33 m steps and registration remain estimates and unchanged.
Exact frozen float32 planes from source-owned solids preserve all surfaces
below the new header; only their upper portions and top rails are reshaped.
"""
import json
from math import isfinite
from pathlib import Path
from taihe_furniture.geometry import _Mesh,_validate,_soften

HERE=Path(__file__).resolve().parent
HEADER_DROP=.35
MASK_SHA256='7231ffb388115f3cf3f9e9745de82e645bd9cda091a2d352c795d54479490805'

def _box(mesh,name,lo,hi,material):
    mesh.solid(name,[(lo[0],lo[1]),(hi[0],lo[1]),(hi[0],hi[1]),(lo[0],hi[1])],lo[2],hi[2]-lo[2],material)

def _solids(mesh,i,top,source):
    """Use exact source planes, never recompute lower body or face placements."""
    stem=f'screen_{i}';header=top-HEADER_DROP;proof=[]
    for part in [stem,stem+'_panel',stem+'_panel.001',stem+'_stile',stem+'_stile.001',stem+'_stile.002',stem+'_stile.003',stem+'_rail.001',stem+'_rail.003']:
        record=source[part];lo=record['min'][:];hi=record['max'][:]
        original_lo=lo[:];original_hi=hi[:]
        material={'taihe_lacquer':'red','taihe_dark_gold':'darkGold','taihe_gold':'gold'}[record['material']]
        if '_rail' in part:
            height=hi[1]-lo[1];hi[1]=header-.010;lo[1]=hi[1]-height
        else: hi[1]=header
        name=stem+'_replacement_'+part[len(stem):].lstrip('_') if part!=stem else stem+'_replacement_substrate'
        _box(mesh,name,lo,hi,material)
        proof.append({'sourcePart':part,'replacementPart':name,'sourceMin':original_lo,'sourceMax':original_hi,'min':lo,'max':hi,
            'lowerSurfacePreservation':'All original X/Z planes and lower Y plane are exact float32 values; upper rail was wholly above the new header.'})
    return proof

def _cap(mesh,i,x,top,sz):
    # Same original bottom/sides and stroke. Only the source cap's high shoulder
    # is lowered; all three main/lower register frames stay byte-exact in asset.
    cap=[(x-.237,top-.65),(x+.237,top-.65),(x+.237,top-.43),(x+.14,top-.43),
         (x+.08,top-.385),(x-.08,top-.385),(x-.14,top-.43),(x-.237,top-.43)]
    mesh.ribbon(f'screen_{i}_replacement_cap_frame',cap,.019,sz,.010,closed=True)

def _crown(mesh,i,x,top,sz,section_scale=1):
    name=f'screen_{i}_open_crown';start=len(mesh.vertices);first_component=len(mesh.components)
    variant=('outer','middle','inner','central','inner','middle','outer')[i]
    def loft(path,width=.030): mesh.loft(name,[(x+a,top+b) for a,b in path],width,sz+.016,.12)
    if i==3:
        for sign in (-1,1):
            def reflect(path):return [(sign*a,b) for a,b in path]
            def lobe(path):return [(2.05*a,b) for a,b in path]
            loft(reflect(_soften(lobe([(0,-.022),(.055,-.085),(.15,-.075),(.245,-.14),(.252,-.225),(.19,-.265),(.12,-.22),(.155,-.18)]),{1,3,5})),.030*section_scale)
            loft(reflect([(.22,-.38),(.32,-.305),(.252*2.05,-.225)]),.034*min(section_scale,1.4))
            loft(reflect([(.02,-.38),(.070,-.29),(.085*2.05,-.255),(.12*2.05,-.22)]),.025)
        mesh.solid(name,[(-.023,top-.038),(0,top-.073),(.023,top-.038),(0,top)],sz+.012,.12,'gold')
        apertures=[(-.080,-.170,.027),(.080,-.170,.027)]
    else:
        sign=1 if i>3 else -1
        # Three independently authored rolling shoulder outlines, mirrored as pairs.
        paths={
            'inner':[(-.23,-.38),(-.20,-.25),(-.10,-.18),(.02,-.17),(.09,-.065),(.18,-.030),(.245,-.08),(.25,-.16),(.18,-.215),(.13,-.16),(.17,-.12)],
            'middle':[(-.23,-.38),(-.20,-.275),(-.12,-.20),(.025,-.19),(.10,-.105),(.175,-.03),(.245,-.065),(.26,-.145),(.205,-.205),(.145,-.18),(.17,-.13)],
            'outer':[(-.23,-.38),(-.18,-.28),(-.11,-.23),(.035,-.215),(.12,-.15),(.165,-.045),(.23,-.03),(.267,-.10),(.23,-.18),(.17,-.205),(.145,-.16)],
        }
        path=paths[variant]
        def reflect(path):return [(sign*a,b) for a,b in path]
        loft(reflect(_soften(path,{5,6,7})),.030*section_scale)
        loft(reflect([(.205,-.38),(.23,-.29),path[8]]),.030*min(section_scale,1.4))
        loft(reflect([(-.12,-.38),(-.115,-.29),(-.055,-.265),(.015,-.29),(.065,-.26)]),.022)
        apertures=[(.195,-.095,.018),(.075,-.305,.018)]
        if section_scale>1 and variant=='inner': apertures[0]=(.205,-.110,.015)
        # A single common translation preserves each authored shape and lands
        # its highest actual vertex at that leaf's retained top, not above it.
        delta=top-max(v[1] for v in mesh.vertices[start:])
        for j in range(start,len(mesh.vertices)):
            a,b,c=mesh.vertices[j];mesh.vertices[j]=(a,b+delta,c)
        apertures=[(sign*a,b+delta,r) for a,b,r in apertures]
    return {'index':i,'variant':variant,'topY':top,'headerY':top-HEADER_DROP,
            'components':list(range(first_component,len(mesh.components))),
            'apertures':[{'x':x+a,'y':top+b,'radius':r} for a,b,r in apertures]}

def build_candidate(profile,quality='detail',crown_style='outline'):
    _validate(profile,quality)
    if crown_style not in ('outline','sculptural'): raise ValueError('Unsupported crown style')
    section_scale=1.65 if crown_style=='sculptural' else 1
    s=profile['screen']
    if any(s[key]!=value for key,value in {'z':13.5,'baseY':2.06,'depth':.22}.items()):
        raise ValueError('Candidate requires frozen screen placement and depth')
    # Mask is the immutable semantic source for exact existing body planes.
    from append_taihe_caisson import sha
    raw=(HERE/'retired_screen_header_faces.json').read_bytes()
    if sha(raw)!=MASK_SHA256: raise ValueError('Changed crown source-plane mask')
    source=json.loads(raw)['partProofs'];m=_Mesh();leaves=[];solids=[]
    for i in range(7):
        x=(i-3)*s['width']/7;top=s['baseY']+s['height']-abs(i-3)*.33;sz=s['z']-.138
        solids+=_solids(m,i,top,source);_cap(m,i,x,top,sz);leaves.append(_crown(m,i,x,top,sz,section_scale))
    return m.finish({'quality':'detail','crownStyle':crown_style,'mainSectionScale':section_scale,'coordinateFrame':'hall-local X/Y-up/Z; front -Z','removedTriangles':1736,'leaves':leaves,'replacementSolids':solids,
        'centralCrownSpanEstimate':'1.8–2 times retained leaf body width, with roots on center substrate; supported only by relative photo silhouette, never a survey.',
        'dimensions':'Existing 4.2 x 3.8 m envelope, .33 m steps and registration remain unverified authoring estimates; paths, thickness and header drop also estimates.',
        'rights':'Original simplified openwork/scroll geometry, not faithful reproduced dragons. Research photographs are never runtime assets.',
        'sourcePhoto':'https://img.dpm.org.cn/Uploads/Picture/dc/1606%5B1024%5D.jpg',
        'limitations':['CPU geometry diagnostics only; ordinary front/oblique eye-level and performance acceptance remain pending.','No exact dragon count or anatomy claim.','Original screen width, depth, steps and placement are not calibrated by the reference photograph.']})

def projected_hits(mesh,x,y):
    """Exact XY barycentric tests for a front-to-back ray; all triangles count.

    Used for geometric aperture verification, never for triangle retirement.
    """
    for face in mesh['triangles']:
        a,b,c=[mesh['vertices'][i] for i in face]
        det=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
        if abs(det)<1e-14:continue
        u=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/det
        v=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/det
        if u>=-1e-10 and v>=-1e-10 and u+v<=1+1e-10:return True
    return False
