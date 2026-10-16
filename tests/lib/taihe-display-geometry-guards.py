"""Targeted CPU guards for authored geometry; no renderer or product mutations.

These test named convex solids, explicitly counted reverse sheets and actual
junction vertices. They are not a global manifold/self-intersection proof.
"""
from collections import defaultdict
from math import dist
from pathlib import Path
import re
import json
from mesh_kernel import sub,cross,dot

# Derived from R2 geometry_guards.py SHA256 60bf793109cc6fd8411ca1b49b5e3050f6f4b76b9a763e5337ad395f5cf04a0b.
# The source is frozen by the manifest; only the path binding is made portable.
REFERENCE=Path(__file__).resolve().parents[2]
EPS=1e-8
BODY_NAMES={'white_enamel_body','green_folded_wing_surface'}

def runtime_material_sides():
    source=(REFERENCE/'src/scene/palace/special/TaiheCore.js').read_text()
    builder=(REFERENCE/'src/scene/PalaceBuilder.js').read_text()
    material=(REFERENCE/'node_modules/three/src/materials/Material.js').read_text()
    assert 'this.side = FrontSide' in material
    assert 'new THREE.MeshStandardMaterial(params)' in builder
    assert 'mesh.material.side=THREE.DoubleSide' in source
    factory=source[source.index('function materials('):source.index('function tier(')]
    assert 'side:' not in factory and '.side=' not in factory
    double=set(re.findall(r'tier\(g,m\.(\w+),',source))
    assert double=={'gold','darkGold'}
    return {key:('DoubleSide' if key in double else 'FrontSide') for key in ('gold','darkGold','red','teal','dark','stone','pearl','glyph')}

def frozen_obstacle_union():
    # Source-derived conservative union of S and fallback: widest rail is .06;
    # screen panel face is 13.5-.11-.016 and its frame adds .025/2 in front.
    profile=json.loads((REFERENCE/'data/architecture/taihe-core.json').read_text())
    return {'rail_inner_x':profile['dais']['width']/2-.12-max(.045,.06)/2,
            'screen_front_z':profile['screen']['z']-profile['screen']['depth']/2-.016-.025/2,
            'screen_front_basis':'S and fallback frame union, including .025 m frame depth',
            'rail_basis':'S .045 m and fallback .06 m rails; inner side of thicker fallback'}

def tris(mesh,names=None):
    return [[mesh['vertices'][j] for j in t] for t,n in zip(mesh['triangles'],mesh['components']) if names is None or n in names]

def points(mesh,names):
    ids=sorted({j for t,n in zip(mesh['triangles'],mesh['components']) if n in names for j in t})
    return [mesh['vertices'][j] for j in ids]

def unique(v):return list(dict.fromkeys(tuple(round(x,12) for x in p) for p in v))
def mean(v):return tuple(sum(p[k] for p in v)/len(v) for k in range(3))

def point_on_triangle(p,a,b,c):
    u,v,w=sub(b,a),sub(c,a),sub(p,a)
    uu,uv,vv,wu,wv=dot(u,u),dot(u,v),dot(v,v),dot(w,u),dot(w,v)
    den=uu*vv-uv*uv
    if den<1e-20:return False
    s=(wu*vv-wv*uv)/den;t=(wv*uu-wu*uv)/den
    q=tuple(a[k]+s*u[k]+t*v[k] for k in range(3))
    return s>=-EPS and t>=-EPS and s+t<=1+EPS and dist(p,q)<EPS

def on_surface(p,faces):return any(point_on_triangle(p,*t) for t in faces)

def inside(p,faces):
    if on_surface(p,faces):return True
    answers=[]
    for direction in ((1,.137,.071),(.073,1,.191),(.173,.091,1)):
        hits=set()
        for a,b,c in faces:
            e1,e2=sub(b,a),sub(c,a);h=cross(direction,e2);det=dot(e1,h)
            if abs(det)<1e-12:continue
            s=sub(p,a);u=dot(s,h)/det;q=cross(s,e1);v=dot(direction,q)/det;t=dot(e2,q)/det
            if u>=-EPS and v>=-EPS and u+v<=1+EPS and t>EPS:hits.add(round(t,9))
        answers.append(len(hits)%2==1)
    assert len(set(answers))==1,('ambiguous mesh containment',p,answers)
    return answers[0]

def tetra_faces(vertices):
    v=unique(vertices);assert len(v)==4
    return [[v[i] for i in t] for t in ((0,1,2),(0,3,1),(0,2,3),(1,3,2))]

def groups(mesh,name):
    # Geometric connected components, independent of duplicated vertex IDs.
    out=[]
    for tri in tris(mesh,{name}):
        s=set(unique(tri));touch=[g for g in out if g&s]
        for g in touch:s.update(g);out.remove(g)
        out.append(s)
    return out

def validate_declared_pairs(mesh):
    bykey=defaultdict(list)
    for i,t in enumerate(mesh['triangles']):bykey[tuple(sorted(unique([mesh['vertices'][j] for j in t])))].append(i)
    declared=mesh.get('two_sided_pairs',[]);allowed=set()
    for a,b in declared:
        assert a!=b and (a,b) not in allowed
        assert 0<=a<len(mesh['triangles']) and 0<=b<len(mesh['triangles'])
        va=[tuple(mesh['vertices'][j]) for j in mesh['triangles'][a]]
        vb=[tuple(mesh['vertices'][j]) for j in mesh['triangles'][b]]
        reverse=list(reversed(va))
        assert any(vb==reverse[k:]+reverse[:k] for k in range(3)),('reverse winding absent',a,b)
        assert mesh['materials'][a]==mesh['materials'][b]
        assert mesh['components'][b]==mesh['components'][a]+'__reverse'
        allowed.add((a,b))
    actual=set()
    for group in bykey.values():
        if len(group)>1:
            assert len(group)==2,('more than two coincident faces',group)
            actual.add(tuple(group))
    assert actual==allowed,('undeclared or missing duplicate',actual^allowed)
    return {'explicit_reverse_pairs':len(allowed),'unintended_duplicate_faces':0}

def validate_orientation(item):
    m=item['local_mesh'];family=item['family'];lod=item['lod']
    target={'crane':['red_crown']} if lod=='S' else {
        'elephant':['leg','body','head'],
        'luduan':['short_leg','single_horn','body_neck_head'],
        'crane':['tapered_lower_beak','white_small_head','irregular_rock'],
        'incense_pavilion':['finial']}
    checked=0
    for name in target.get(family,[]):
        for group in groups(m,name):
            centre=mean(list(group))
            for triangle in tris(m,{name}):
                if not set(unique(triangle))<=group:continue
                a,b,c=triangle;n=cross(sub(b,a),sub(c,a));score=dot(n,sub(mean(triangle),centre))
                assert score>1e-12,('inward or degenerate convex face',item['id'],name,triangle,score)
                checked+=1
    # Crane has material-local wing surfaces on its closed body. Every actual
    # face, including both teal fields, must point outside the same convex hull.
    if lod=='fallback' and family=='crane':
        fs=tris(m,BODY_NAMES);centre=mean(unique([v for t in fs for v in t]))
        for a,b,c in fs:assert dot(cross(sub(b,a),sub(c,a)),sub(mean([a,b,c]),centre))>1e-12
        checked+=len(fs)
    return {'convex_faces_checked':checked}

def validate_crane_contacts(item):
    m=item['local_mesh'];legs=groups(m,'gilt_leg');assert len(legs)==2
    body=tris(m,BODY_NAMES);rock=tris(m,{'irregular_rock'})
    records=[]
    for group in sorted(legs,key=lambda g:mean(list(g))[0]):
        lo=min(p[1] for p in group);hi=max(p[1] for p in group)
        lower=[p for p in group if abs(p[1]-lo)<EPS];upper=[p for p in group if abs(p[1]-hi)<EPS]
        n=5 if item['lod']=='S' else 3
        assert len(lower)==n and len(upper)==n
        a,b=mean(lower),mean(upper)
        assert abs(dist(a,b)-.45)<EPS,('actual leg length',a,b)
        assert all(on_surface(p,body) for p in upper),('upper ring detached',upper)
        assert all(on_surface(p,rock) for p in lower),('lower ring unsupported',lower)
        records.append({'lower_ring_centre':a,'upper_ring_centre':b,'length_m':dist(a,b),'lower_contact_vertices':len(lower),'upper_contact_vertices':len(upper)})
    expected=item['anchors']['leg_endpoints']
    assert all(dist(records[i]['lower_ring_centre'],a)<EPS and dist(records[i]['upper_ring_centre'],b)<EPS for i,(a,b) in enumerate(expected))
    # Bind published height/beak as well as the declared values to the mesh.
    beak=unique(points(m,{'tapered_lower_beak'}));tip=min(beak,key=lambda p:p[2]);rootz=max(p[2] for p in beak)
    lowroot=[p for p in beak if abs(p[2]-rootz)<EPS and abs(p[1]-tip[1])<EPS]
    assert len(lowroot)==2 and abs(dist(mean(lowroot),tip)-.17)<EPS
    assert abs(max(p[1] for p in m['vertices'])-.10-1.68)<EPS
    neck=points(m,{'white_rising_neck'});n=7 if item['lod']=='S' else 3
    head=tris(m,{'white_small_head'})
    assert all(inside(p,body) for p in neck[:n]),'actual neck base ring exposed'
    assert all(inside(p,head) for p in neck[-n:]),'actual neck terminal ring exposed'
    assert all(inside(p,head) for p in beak if abs(p[2]-rootz)<EPS),'actual beak root ring exposed'
    return {'mesh_derived_legs':records,'neck_end_ring_vertices_buried':2*n,'beak_root_vertices_buried':3,'all_lower_ring_vertices_on_rock':True,'all_upper_ring_vertices_on_belly':True}

def validate_fallback_junctions(item):
    assert item['lod']=='fallback';m=item['local_mesh'];f=item['family'];checks=[]
    if f in ('elephant','luduan'):
        name='leg' if f=='elephant' else 'short_leg'
        body=tris(m,{'body','body_neck_head'});support=tris(m,{'wood_support_top','wood_support'})
        limbs=groups(m,name);assert len(limbs)==4
        for g in limbs:
            tip=max(g,key=lambda p:p[1]);base=[p for p in g if abs(p[1]-min(p[1] for p in g))<EPS]
            assert inside(tip,body),('quadruped root detached',f,tip)
            assert all(on_surface(p,support) for p in base),('quadruped base detached',f,base)
        checks.append('four actual leg tips inside closed body and all lower vertices on support')
    if f=='elephant':
        headpoints=points(m,{'head'});head=tetra_faces(headpoints)
        rear=max(p[2] for p in headpoints);rearpoints=[p for p in unique(headpoints) if abs(p[2]-rear)<EPS]
        assert len(rearpoints)==3 and all(inside(p,body) for p in rearpoints),('removed rear cap exposed',rearpoints)
        neck=points(m,{'back_vase_neck'});low=min(p[1] for p in neck)
        assert all(inside(p,tris(m,{'back_vase_bowl'})) for p in neck if abs(p[1]-low)<EPS),'vase neck ring exposed'
        trunk=points(m,{'curved_trunk'});assert all(inside(p,head) for p in trunk[:3]),('trunk root ring exposed',trunk[:3])
        # Exposed terminal ring is explicitly capped, including its three edges.
        terminal={tuple(p) for p in trunk[-3:]}
        assert any(set(tuple(p) for p in tri)==terminal for tri in tris(m,{'curved_trunk'})),'trunk tip cap missing'
        for triangle in tris(m,{'ear'}):assert any(inside(p,head) or inside(p,body) for p in triangle),'ear detached'
        checks.extend(['omitted head rear triangle entirely inside torso','actual trunk root ring buried; exposed tip capped','vase lower ring buried','ear roots connected'])
    elif f=='luduan':
        for name in ('single_horn','ear','swept_tail'):
            assert any(inside(p,body) for p in points(m,{name})),(name,'detached')
        horn=points(m,{'single_horn'});low=min(p[1] for p in horn)
        assert all(inside(p,body) for p in horn if abs(p[1]-low)<EPS),'horn root ring exposed'
        for triangle in tris(m,{'ear'}):assert any(inside(p,body) for p in triangle),'ear detached'
        checks.append('closed continuous head/body with actual horn, ear and tail roots inside')
    elif f=='crane':
        body=tris(m,BODY_NAMES);head=tris(m,{'white_small_head'});neck=points(m,{'white_rising_neck'})
        assert all(inside(p,body) for p in neck[:3]),('open neck base exposed',neck[:3])
        assert all(inside(p,head) for p in neck[-3:]),('open neck top exposed',neck[-3:])
        # Beak root is an open triangular ring. Its base may touch a closed
        # head surface but cannot merely have a declared endpoint nearby.
        beak=points(m,{'tapered_lower_beak'});back=max(p[2] for p in beak)
        assert all(inside(p,head) for p in beak if abs(p[2]-back)<EPS),'beak root ring exposed'
        for tri in tris(m,{'red_crown'}):assert any(inside(p,head) for p in tri),'crown detached'
        checks.extend(['both actual neck end rings buried','actual beak root ring buried','crown touches closed head'])
    elif f=='incense_pavilion':
        roof=points(m,{'upper_eave'});finial=points(m,{'finial'});rim_y=max(p[1] for p in roof)
        rim={p for p in unique(roof) if abs(p[1]-rim_y)<EPS};bottom={p for p in unique(finial) if abs(p[1]-rim_y)<EPS}
        assert len(rim)==4 and rim==bottom,'finial does not close exact upper rim'
        underside=tris(m,{'lower_eave_underside'});assert len(underside)==4,'exposed lower disk removed'
        for p in points(m,{'pierced_shaft_rib'}):
            if abs(p[1]-2.10)<EPS:assert on_surface(p,underside),'shaft upper endpoint misses underside'
        checks.extend(['finial shares complete four-edge upper-eave rim','exposed lower-eave underside retained','shaft upper endpoints meet disk'])
    return checks
