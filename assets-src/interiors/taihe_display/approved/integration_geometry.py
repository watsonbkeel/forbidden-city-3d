"""Pure-CPU triangle expansion example; does not import or modify the product.

The indexed prototype intentionally reuses vertices for opposite sheet faces.
Never average their normals with indexed computeVertexNormals(). Expand each
triangle to its own vertices before attaching these flat normal attributes.
"""
from math import isfinite
from mesh_kernel import cross,sub,dot,unit


def flat_attributes(mesh, material=None):
    """Return non-indexed position/normal lists for one existing material key.

    Both lists are flat XYZ arrays. No index, UV, colors or material objects are
    created. Material selection is optional and does not change face order.
    """
    positions=[];normals=[];face_ids=[]
    for i,(face,key) in enumerate(zip(mesh['triangles'],mesh['materials'])):
        if material is not None and key!=material:continue
        a,b,c=[mesh['vertices'][j] for j in face]
        normal=unit(cross(sub(b,a),sub(c,a)))
        positions.extend(x for p in (a,b,c) for x in p)
        normals.extend(x for _ in range(3) for x in normal)
        face_ids.append(i)
    result={'position':positions,'normal':normals,'source_triangle_ids':face_ids}
    validate_flat_attributes(result)
    return result


def validate_flat_attributes(attributes):
    p=attributes['position'];n=attributes['normal']
    assert len(p)==len(n) and len(p)%9==0
    assert len(attributes['source_triangle_ids'])==len(p)//9
    assert all(isfinite(v) for v in p+n)
    for j in range(0,len(p),9):
        a,b,c=(p[j+q:j+q+3] for q in (0,3,6))
        expected=unit(cross(sub(b,a),sub(c,a)))
        for q in (0,3,6):
            normal=n[j+q:j+q+3]
            assert abs(dot(normal,normal)-1)<1e-8,('zero/cancelled/non-unit normal',j,q,normal)
            assert dot(normal,expected)>1-1e-8,('normal disagrees with face winding',j,q)
    return True
