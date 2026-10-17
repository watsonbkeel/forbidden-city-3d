"""Isolated CPU-only Taihe display mesh candidate. Never imports bpy or product code.
Y-up metres, forward -Z; no material objects, UVs, vertex colors, lights or colliders.
All geometry is self-authored. Museum imagery is evidence, never asset input.
"""
from copy import deepcopy
from math import cos, sin, pi
from mesh_kernel import Mesh

FROZEN_REFERENCE='57db2276404220f2072d182f759f1422871ac371'
MATERIAL_KEYS=('gold','darkGold','red','teal','dark','stone','pearl','glyph')
PLACEMENTS={
 'elephant':{'centres_x_m':[-1.30,1.30],'z_m':11.75,'base_y_m':2.06,'envelope_xyz_m':[.52,1.75,.70],'source_ids':['B','P2','E']},
 'luduan':{'centres_x_m':[-2.05,2.05],'z_m':11.10,'base_y_m':2.06,'envelope_xyz_m':[.54,.58,.68],'source_ids':['B','P2','M14','M14-P','E']},
 'crane':{'centres_x_m':[-2.80,2.80],'z_m':10.20,'base_y_m':2.06,'envelope_xyz_m':[.60,1.78,.82],'source_ids':['B','C40','C41','M14','G']},
 'incense_pavilion':{'centres_x_m':[-2.85,2.85],'z_m':8.30,'base_y_m':2.06,'envelope_xyz_m':[.72,2.60,.72],'source_ids':['B','E','I82','H']},
}


def _elephant(detail):
    m=Mesh()
    # Four true posts: the centre and sides below the apron remain empty.
    for x in (-.195,.195):
        for z in (-.25,.25):
            m.sweep('wood_support_leg',[(x,0,z),(x,1.12 if detail else 1.14,z)],[.022,.026],'dark',sides=4 if detail else 3)
    if detail:
        m.box('wood_support_top',(-.25,1.10,-.33),(.25,1.14,.33),'dark')
        for x in (-.22,.22):
            m.box('wood_apron_side',(x-.018,.94,-.28),(x+.018,1.10,.28),'dark')
            m.box('enamel_apron_inset',(x-.019,.98,-.19),(x+.019,1.065,.19),'teal')
        for z in (-.29,.29):
            m.box('wood_apron_end',(-.21,.94,z-.018),(.21,1.10,z+.018),'dark')
            m.box('enamel_apron_inset',(-.14,.98,z-.019),(.14,1.065,z+.019),'teal')
        m.body('body_neck_head',[(-.245,1.43,.085,.10),(-.19,1.42,.13,.14),(-.09,1.40,.155,.14),(.10,1.40,.17,.15),(.22,1.39,.08,.10)],'teal',8)
    else:
        m.slab('wood_support_top',0,1.14,0,.50,.66,'dark')
        m.patch('body',[(-.155,1.32,-.18),(.155,1.32,-.18),(0,1.54,-.18),(-.155,1.32,.22),(.155,1.32,.22),(0,1.54,.22)],[(0,2,1),(3,4,5),(0,1,4,3),(1,2,5,4),(2,0,3,5)],'teal')
        first=len(m.triangles)
        m.wedge('head',(-.10,1.39,-.16),(.10,1.39,-.16),(0,1.50,-.16),(0,1.33,-.30),'teal')
        # The rear triangle lies strictly within the convex torso; the guard
        # verifies all three corners, so it cannot expose a hole from any view.
        for values in (m.triangles,m.materials,m.components):del values[first]
    for x in (-.105,.105):
        for z in (-.135,.135):
            if detail:
                m.sweep('leg',[(x,1.14,z),(x,1.23,z),(x,1.34,z)],[.044,.046,.057],'teal',5,caps=(True,False))
                m.lathe('gilt_toe',[(1.14,.047),(1.165,.045)],'gold',5,centre=(x,z))
            else:
                m.patch('leg',[(x-.035,1.14,z-.03),(x+.035,1.14,z-.03),(x,1.14,z+.04),(x,1.34,z)],[(0,1,3),(1,2,3),(2,0,3)],'teal')
    for s in (-1,1):
        # Thin broad ears, visibly separated from the descending trunk.
        if detail:
            m.wedge('ear',(s*.075,1.49,-.20),(s*.21,1.46,-.19),(s*.17,1.30,-.16),(s*.085,1.34,-.17),'teal')
            m.sweep('tusk',[(s*.069,1.38,-.24),(s*.075,1.31,-.27),(s*.062,1.32,-.30)],[.012,.008,.002],'pearl',4)
        else:
            m.patch('ear',[(s*.01,1.435,-.20),(s*.21,1.46,-.19),(s*.17,1.31,-.16)],[(0,1,2)],'teal')
    trunk=[(0,1.44,-.255),(0,1.32,-.29),(0,1.21,-.30),(0,1.18,-.27),(0,1.205,-.25)] if detail else [(0,1.42,-.20),(0,1.23,-.31),(0,1.18,-.265)]
    m.sweep('curved_trunk',trunk,[.031,.028,.023,.018,.010] if detail else [.012,.023,.010],'teal',6 if detail else 3,caps=(False,True))
    if detail:
        m.box('saddle_cloth',(-.125,1.505,-.075),(.125,1.55,.105),'darkGold')
        # Open mouth and narrow neck, with a rim, instead of a spherical vase.
        m.lathe('back_vase',[(1.55,.044),(1.58,.070),(1.64,.064),(1.68,.027),(1.725,.027),(1.75,.043)],'teal',8,centre=(0,.03))
        m.lathe('vase_rim',[(1.735,.044),(1.75,.044)],'gold',8,centre=(0,.03))
        m.lathe('vase_inner_lip',[(1.75,.033),(1.728,.027)],'dark',8,centre=(0,.03))
    else:
        m.octa('back_vase_bowl',(0,1.605,.03),(.060,.065,.060),'teal')
        m.lathe('back_vase_neck',[(1.65,.013),(1.75,.041)],'gold',3,centre=(0,.03))
    return m,{}


def _luduan(detail):
    m=Mesh();m.box('wood_support',(-.25,0,-.30),(.25,.08,.30),'dark',bottom=detail)
    if detail:
        m.box('wood_support_lip',(-.26,.065,-.31),(.26,.09,.31),'darkGold')
        # One authored longitudinal mass includes rising chest, neck and head.
        m.body('body_neck_head',[(-.26,.38,.085,.075),(-.20,.40,.105,.12),(-.13,.32,.16,.14),(.01,.29,.205,.16),(.15,.29,.19,.14),(.24,.29,.08,.08)],'teal',8)
    else:
        # Closed seven-vertex body: a raised fore-head, shoulder ridge and
        # rear belly remain continuous. Ten triangles preserve all leg roots.
        v=[(-.16,.22,-.26),(.16,.22,-.26),(0,.50,-.26),(-.18,.20,.24),(.18,.20,.24),(0,.42,.24),(0,.46,-.10)]
        f=[(0,2,1),(3,4,5),(0,1,4,3),(1,2,6),(1,6,4),(4,6,5),(0,3,6),(0,6,2),(3,5,6)]
        m.patch('body_neck_head',v,f,'teal')
    for x in (-.13,.13):
        for z in (-.13,.15):
            if detail:
                m.sweep('short_leg',[(x,.12,z),(x,.16,z+.025),(x,.29,z)],[.045,.046,.052],'teal',5)
                m.sweep('gilt_curled_foot',[(x,.125,z+.035),(x,.12,z-.015),(x,.15,z-.055)],[.022,.025,.014],'gold',4)
            else:
                m.patch('short_leg',[(x-.04,.08,z-.04),(x+.04,.08,z-.04),(x,.08,z+.045),(x,.25,z)],[(0,1,3),(1,2,3),(2,0,3)],'gold')
    if detail:
        m.sweep('single_horn',[(0,.50,-.18),(0,.55,-.15),(0,.578,-.18)],[.024,.015,.003],'gold',5,caps=(False,True))
        m.sweep('swept_tail',[(0,.30,.22),(0,.39,.28),(0,.42,.23),(0,.39,.20)],[.032,.025,.018,.008],'gold',5)
        for s in (-1,1):
            m.wedge('ear',(s*.06,.46,-.17),(s*.16,.49,-.16),(s*.11,.40,-.14),(s*.07,.43,-.13),'gold')
            m.sweep('mane_curl',[(s*.08,.45,-.15),(s*.135,.38,-.18),(s*.13,.32,-.10),(s*.09,.35,-.08)],[.018,.018,.015,.007],'gold',4)
        # Two broad authored curved flourishes, not copied surface imagery.
        for s in (-1,1):
            m.sweep('body_flourish',[(s*.185,.30,.10),(s*.20,.34,.04),(s*.18,.38,-.01)],[.006]*3,'darkGold',3)
    else:
        m.patch('single_horn',[(-.018,.44,-.18),(.018,.44,-.18),(0,.44,-.14),(0,.58,-.17)],[(0,1,3),(1,2,3),(2,0,3)],'gold')
        m.patch('swept_tail',[(0,.29,.22),(0,.42,.29),(.018,.40,.21),(0,.35,.23)],[(0,1,2),(0,2,3)],'gold')
        for s in (-1,1):m.patch('ear',[(s*.02,.435,-.18),(s*.16,.49,-.15),(s*.10,.40,-.14)],[(0,1,2)],'gold')
    if detail:
        # Seat the broad curled feet on the low support, without moving the
        # body or approximate footprint. The four identical curls share a min.
        ids={j for tri,name in zip(m.triangles,m.components) if name=='gilt_curled_foot' for j in tri}
        dy=.09-min(m.vertices[j][1] for j in ids)
        for j in ids:
            x,y,z=m.vertices[j];m.vertices[j]=(x,y+dy,z)
    return m,{}


def _crane(detail):
    m=Mesh();m.box('wood_support',(-.25,0,-.28),(.25,.10,.28),'dark',bottom=detail)
    legs=[((-.065,.34,-.02),(-.065,.79,-.02)),((.065,.34,.06),(.065,.79,.06))]
    beak=((0,1.69,-.24),(0,1.69,-.41))
    if detail:
        m.lathe('wave_base',[(.10,.24),(.14,.25),(.17,.19),(.20,.21)],'teal',9)
        m.lathe('irregular_rock',[(.17,.17),(.24,.18),(.29,.13),(.34,.12)],'stone',7,caps=(False,True))
        for x in (-.065,.065):
            for dx in (-.035,0,.035):m.sweep('gilt_toe',[(x,.34, -.02 if x<0 else .06),(x+dx,.32,-.11 if x<0 else -.03)],[.009,.004],'gold',3)
        m.body('white_enamel_body',[(-.23,1.06,.045,.075),(-.15,1.02,.11,.19),(.02,1.01,.14,.23),(.20,.99,.11,.17),(.32,.91,.02,.035)],'pearl',8)
        # Broad ventral landing surface gives both published-length legs a
        # real geometric contact, rather than suspending a rounded body above.
        body_ids={j for t,n in zip(m.triangles,m.components) if n=='white_enamel_body' for j in t}
        for j in body_ids:
            x,y,z=m.vertices[j]
            if z in (-.15,.02,.20) and y<.91:m.vertices[j]=(x,.79,z)
        for s in (-1,1):
            m.wedge('green_folded_wing',(s*.11,1.14,-.06),(s*.145,1.01,.04),(s*.095,.88,.25),(s*.10,.98,.19),'teal')
        neck=[(0,1.12,-.18),(0,1.25,-.205),(0,1.43,-.19),(0,1.60,-.17),(0,1.70,-.19)]
        m.sweep('white_rising_neck',neck,[.044,.032,.025,.023,.022],'pearl',7)
        m.body('white_small_head',[(-.24,1.71,.024,.028),(-.21,1.724,.035,.046),(-.17,1.72,.03,.038),(-.15,1.70,.012,.018)],'pearl',6)
        m.patch('red_crown',[(-.019,1.76,-.22),(.019,1.76,-.22),(0,1.78,-.20),(0,1.75,-.17)],[(0,1,2),(1,3,2),(3,0,2)],'red')
        m.wedge('tapered_lower_beak',(-.012,1.69,-.24),(.012,1.69,-.24),(0,1.705,-.24),beak[1],'dark')
    else:
        m.wedge('irregular_rock',(-.20,.34,-.16),(.20,.34,-.16),(0,.34,.20),(0,.10,.01),'teal')
        first=len(m.triangles)
        m.patch('white_enamel_body',[(-.11,.79,-.27),(.11,.79,-.27),(0,1.24,-.27),(-.11,.79,.33),(.11,.79,.33),(0,1.10,.33)],[(0,2,1),(3,4,5),(0,1,4,3),(1,2,5,4),(2,0,3,5)],'pearl')
        # Green wing fields live on the closed body, so both outward sides
        # stay visible under FrontSide without detached or duplicated sheets.
        for j in (first+5,first+7):
            m.materials[j]='teal';m.components[j]='green_folded_wing_surface'
        m.sweep('white_rising_neck',[(0,1.13,-.18),(0,1.45,-.19),(0,1.71,-.20)],[.020,.022,.012],'pearl',3)
        m.wedge('white_small_head',(-.045,1.68,-.18),(.045,1.68,-.18),(0,1.775,-.18),(0,1.69,-.27),'pearl')
        m.patch('red_crown',[(-.015,1.735,-.18),(.015,1.735,-.18),(0,1.78,-.20)],[(0,1,2)],'red')
        m.patch('tapered_lower_beak',[(-.01,1.69,-.24),(.01,1.69,-.24),(0,1.705,-.24),beak[1]],[(0,1,3),(1,2,3),(2,0,3)],'dark')
    for a,b in legs:m.sweep('gilt_leg',[a,b],[.010,.014],'gold',5 if detail else 3)
    anchors={'wooden_stand_height_m':.10,'crown_y_m':1.78,'leg_endpoints':legs,'lower_beak_endpoints':beak,'published_height_excluding_wooden_stand_m':1.68,'measurement_context':'1992 restoration account published 1995; no modern survey tolerance; rock base included in 1.68 m authored envelope.'}
    return m,anchors


def _pavilion(detail):
    m=Mesh();m.box('support',(-.25,0,-.25),(.25,.08,.25),'dark',bottom=detail)
    if detail:
        m.lathe('layered_foot',[(.08,.22),(.12,.25),(.18,.22),(.23,.17),(.28,.21),(.32,.14)],'darkGold',10)
        # Mostly continuous octagonal walls. Twelve discrete windows have
        # actual empty centres and 12 mm deep reveals, instead of cage rails.
        levels=[.32,.57,.82,1.07,1.32,1.57,1.82,2.08]
        holes={(row,j) for row in (1,3,5) for j in (1,3,5,7)}
        for row in range(7):
            for j in range(8):
                a,b=2*pi*j/8,2*pi*(j+1)/8;y,Y=levels[row:row+2]
                outer=[(.14*cos(a),y,.14*sin(a)),(.14*cos(a),Y,.14*sin(a)),(.14*cos(b),Y,.14*sin(b)),(.14*cos(b),y,.14*sin(b))]
                if (row,j) not in holes:
                    m.patch('pierced_cylinder_wall',outer,[(0,1,2,3)],'teal')
                else:
                    inner=[(x*.128/.14,yy,z*.128/.14) for x,yy,z in outer]
                    m.patch('deep_window_reveal',outer+inner,[(q,(q+1)%4,(q+1)%4+4,q+4) for q in range(4)],'darkGold')
        winding=[(.151*cos(i*pi/3),.36+i*.17,.151*sin(i*pi/3)) for i in range(11)]
        m.sweep('authored_winding_relief',winding,[.014]*len(winding),'gold',4)
        m.lathe('lower_eave',[(2.08,.14),(2.11,.36),(2.145,.36),(2.29,.18),(2.31,.16)],'gold',10)
        m.lathe('upper_eave',[(2.33,.16),(2.36,.29),(2.39,.29),(2.51,.075)],'gold',10,caps=(False,True))
        m.lathe('eave_separator',[(2.29,.16),(2.36,.16)],'teal',10)
        m.lathe('finial',[(2.51,.055),(2.56,.048),(2.60,.018)],'darkGold',8,caps=(False,True))
    else:
        m.lathe('layered_foot',[(.08,.22),(.32,.14)],'darkGold',4)
        for j in range(4):
            a=2*pi*j/4; da=.55
            v=[(.14*cos(t),y,.14*sin(t)) for y in (.32,2.10) for t in (a-da,a+da)]
            m.patch('pierced_shaft_rib',v,[(0,2,3,1)],'teal')
        m.patch('lower_eave_underside',[(0,2.10,0),(.36,2.10,0),(0,2.10,.36),(-.36,2.10,0),(0,2.10,-.36)],[(0,1,2),(0,2,3),(0,3,4),(0,4,1)],'gold')
        m.lathe('lower_eave',[(2.10,.36),(2.29,.16)],'gold',4)
        m.lathe('upper_eave',[(2.36,.29),(2.51,.06)],'gold',4)
        m.lathe('eave_separator',[(2.29,.16),(2.36,.16)],'teal',3)
        # Four sides close the exact upper-eave rim; no separate hidden cap.
        m.patch('finial',[(.06,2.51,0),(0,2.51,.06),(-.06,2.51,0),(0,2.51,-.06),(0,2.60,0)],[(j,4,(j+1)%4) for j in range(4)],'darkGold')
    return m,{'pavilion_specific_visual_confidence':'low','family_morphology_confidence':'medium','illustrated_source_is_generic_analogy':True}


BUILDERS={'elephant':_elephant,'luduan':_luduan,'crane':_crane,'incense_pavilion':_pavilion}

def build_display_pairs(lod='S'):
    """Return 8 independent assemblies. Vertices are local; translation is Y-up.

    Importing or calling this function cannot modify a scene or product source.
    S and fallback are mutually exclusive representations, never additive.
    """
    if lod not in ('S','fallback'):raise ValueError("lod must be 'S' or 'fallback'")
    items=[]
    for family,p in PLACEMENTS.items():
        mesh,anchors=BUILDERS[family](lod=='S')
        reverse={'crane':{'red_crown'}} if lod=='S' else {'elephant':{'leg'},'luduan':{'short_leg','single_horn'},'crane':{'tapered_lower_beak'}}
        for j,name in enumerate(mesh.components):
            if name in reverse.get(family,set()):mesh.triangles[j]=tuple(reversed(mesh.triangles[j]))
        if lod=='fallback':
            sheets={'elephant':{'wood_support_top','ear'},'crane':{'red_crown'},'incense_pavilion':{'pierced_shaft_rib'}}
            mesh.explicit_reverse_faces(sheets.get(family,set()))
        data=mesh.data()
        for side,x in zip(('left','right'),p['centres_x_m']):
            items.append({'id':f'{family}:{side}','family':family,'side':side,'lod':lod,'translation':[x,p['base_y_m'],p['z_m']],'scale':[1,1,1],'yaw_rad':0,'local_mesh':deepcopy(data),'anchors':deepcopy(anchors),'support_count':1,'source_ids':p['source_ids'][:],'placement_status':'explicit authoring hypothesis; no measured current placement','dimensions_status':'authored except three published crane anchors','frozen_reference':FROZEN_REFERENCE})
    return items
