"""Column-only UV authoring. Geometry/normals/material factors are unchanged.
Coordinates match TaiheColumnSurface.js. Self-authored decorative approximation.
"""
import math

def assign_gold_column_uvs(scene, profile):
    centres = [(x, z) for x in profile['columns']['x'] for z in profile['columns']['goldZ']]
    height = profile['columns']['height']
    for ob in scene.objects:
        if ob.type != 'MESH' or not ob.data.materials or ob.data.materials[0].name != 'taihe_gold':
            continue
        layer = ob.data.uv_layers.new(name='UVMap')
        for face in ob.data.polygons:
            points = []
            for li in face.loop_indices:
                p = ob.matrix_world @ ob.data.vertices[ob.data.loops[li].vertex_index].co
                points.append((p.x, p.z, -p.y))
            centre = next((c for c in centres if all(.19999 <= p[1] <= height+.00001 and math.hypot(p[0]-c[0], p[2]-c[1]) <= .52001 for p in points)), None)
            cap = all(abs(p[1]-.2)<1e-5 for p in points) or all(abs(p[1]-height)<1e-5 for p in points)
            values = [(0., 0.) for _ in points]
            if centre and not cap:
                angles = [math.atan2(p[2]-centre[1],p[0]-centre[0])/(2*math.pi)+.5 for p in points]
                angles = [0. if min(a,1-a)<1e-5 else a for a in angles]
                if max(angles)-min(angles)>.5: angles = [a+1 if a<.5 else a for a in angles]
                values = [(1/16+a*7/8, 1/32+(p[1]-.2)/(height-.2)*15/16) for p,a in zip(points,angles)]
            for li, (u,v) in zip(face.loop_indices, values):
                # glTF exporter flips V; runtime DataTextures use flipY=False.
                layer.data[li].uv = (u, 1-v)
