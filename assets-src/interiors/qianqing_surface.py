"""R31 hall-local photo-relative details. No shared hall generator mutations."""
import bpy,bmesh,math,json,os
from _common import box,cylinder,sphere,add_obj,_to_b
P=json.load(open(os.path.join(os.path.dirname(__file__),'../../data/architecture/qianqing-material.json')))

def rings(name,levels,x,z,m,n=8):
    # Closed radial profile with consistently outward side winding. Concave
    # roof silhouette is geometric; no second roof, texture or fake caisson.
    verts=[_to_b(x+r*math.cos(a*2*math.pi/n),y,z+r*math.sin(a*2*math.pi/n)) for y,r in levels for a in range(n)]
    faces=[tuple(range(n-1,-1,-1)),tuple((len(levels)-1)*n+a for a in range(n))]
    for j in range(len(levels)-1):
        for a in range(n):faces.append((j*n+a,j*n+(a+1)%n,(j+1)*n+(a+1)%n,(j+1)*n+a))
    me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update();ob=add_obj(name,me,m)
    # Recalculate in Blender coordinates; export normals must match visible sides.
    bm=bmesh.new();bm.from_mesh(me);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(me);bm.free()
    return ob

def incense_pavilion(x,z,enamel,gold,dark):
    p=P['pavilion'];n=p['sides'];before=set(bpy.context.scene.objects)
    rings('qianqing_incense_dark_base',[(0,.44),(.08,.49),(.13,.44),(.19,.47),(.24,.38)],x,z,dark,n)
    for sx in[-1,1]:
        for sz in[-1,1]:
            box('qianqing_incense_foot',.14,.25,.14,x+sx*.26,.35,z+sz*.26,enamel)
    rings('qianqing_incense_lower_tray',[(.44,.38),(.48,.50),(.52,.38)],x,z,enamel,n)
    rings('qianqing_incense_body',[(p['bodyBottom'],p['bodyRadius']),(p['bodyTop'],p['bodyRadius'])],x,z,enamel,n)
    # Gold outlines sit on each octagonal facet, forming two rows of framed
    # blue panels; no claim to reproduce engraved floral decoration.
    r=p['bodyRadius'];apothem=r*math.cos(math.pi/n);half=r*math.sin(math.pi/n)
    for a in range(n):
        theta=(a+.5)*2*math.pi/n;co,si=math.cos(theta),math.sin(theta)
        def strip(name,u0,u1,y0,y1):
            v=[_to_b(x+(apothem+.002)*co-u*si,y,z+(apothem+.002)*si+u*co) for u,y in[(u0,y0),(u1,y0),(u1,y1),(u0,y1)]]
            me=bpy.data.meshes.new(name);me.from_pydata(v,[],[(3,2,1,0)]);me.update();return add_obj(name,me,gold)
        for row in range(2):
            y0=.54+row*.25;y1=y0+.20;lo=-half*.78;hi=half*.78;t=.012
            for u0,u1,yy0,yy1 in[(lo,hi,y0,y0+t),(lo,hi,y1-t,y1),(lo,lo+t,y0,y1),(hi-t,hi,y0,y1)]:strip('qianqing_incense_panel_frame',u0,u1,yy0,yy1)
    rings('qianqing_incense_eave',[(1.06,.35),(1.10,.50),(1.14,.49)],x,z,gold,n)
    roof=[(1.14,.49),(1.20,.41),(1.29,.31),(1.39,.18),(1.47,.08)]
    rings('qianqing_incense_single_roof',roof,x,z,enamel,n)
    # Thin radial gold seams follow the same single roof profile.
    for a in range(n):
        th=a*2*math.pi/n;verts=[]
        for y,r in roof:
            for da in[-.014,.014]:verts.append(_to_b(x+r*math.cos(th+da),y+.003,z+r*math.sin(th+da)))
        me=bpy.data.meshes.new('qianqing_incense_roof_rib');me.from_pydata(verts,[],[(2*j+2,2*j+3,2*j+1,2*j)for j in range(len(roof)-1)]);me.update();add_obj('qianqing_incense_roof_rib',me,gold)
    cylinder('qianqing_incense_finial',.035,.065,.09,x,1.515,z,gold,segments=8)
    sphere('qianqing_incense_pearl',.04,x,1.56,z,gold,seg=8,rings=4)
    obs=set(bpy.context.scene.objects)-before
    for ob in obs:ob.location.z+=p['elevation']
    return obs

def floor(cfg,dark,light):
    p=P['floor'];w,d=cfg['w']-.2,cfg['d']-.2;box('floor_base',w,.02,d,0,.045,0,dark)
    T,g=p['tile'],p['gap'];nx,nz=int(w//T),int(d//T);ox,oz=-nx*T/2,-nz*T/2
    bm=bmesh.new();col=bm.loops.layers.color.new('Col')
    for i in range(nx):
        for k in range(nz):
            x0,z0=ox+i*T+g/2,oz+k*T+g/2
            face=bm.faces.new([bm.verts.new(_to_b(x,.058,z)) for x,z in[(x0,z0),(x0,z0+T-g),(x0+T-g,z0+T-g),(x0+T-g,z0)]])
            value=p['shadeMin']+((i*13+k*7+i*k*3)%17)/16*(p['shadeMax']-p['shadeMin'])
            for loop in face.loops:loop[col]=(value,value,value,1)
    bm.normal_update();me=bpy.data.meshes.new('floor_tiles');bm.to_mesh(me);bm.free();add_obj('floor_tiles',me,light)
    nt=light.node_tree;attr=nt.nodes.new('ShaderNodeVertexColor');attr.layer_name='Col';mix=nt.nodes.new('ShaderNodeMix');mix.data_type='RGBA';mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1
    bsdf=nt.nodes['Principled BSDF'];mix.inputs[6].default_value=bsdf.inputs['Base Color'].default_value[:];nt.links.new(attr.outputs['Color'],mix.inputs[7]);nt.links.new(mix.outputs[2],bsdf.inputs['Base Color'])
