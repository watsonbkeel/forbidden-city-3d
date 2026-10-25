"""Read frozen Yangxin author function without executing its hall exporter."""
import ast, os, sys, json, hashlib, subprocess
sys.dont_write_bytecode=True
import bpy
root=os.path.abspath(os.path.join(os.path.dirname(__file__),'../..'))
p=os.path.join(root,'assets-src/interiors/yangxin.py')
sys.path.insert(0,os.path.dirname(p))
source=subprocess.check_output(['git','show','c98b3d42fa4a66e7e7a480baa53be70fa9fe32b1:assets-src/interiors/yangxin.py'],cwd=root,text=True); tree=ast.parse(source)
# Only module's final build call is suppressed. Source remains unmodified.
assert isinstance(tree.body[-1],ast.Expr) and isinstance(tree.body[-1].value,ast.Call) and tree.body[-1].value.func.id=='build'
tree.body.pop(); scope={'__file__':p,'__name__':'r88_frozen_legacy'}
exec(compile(tree,p,'exec'),scope)
scope['reset_scene']();scope['east_throne']();bpy.context.view_layer.update()
rows=[]
for ob in bpy.context.scene.objects:
 if ob.type!='MESH': continue
 me=ob.data;me.calc_loop_triangles()
 pts=[]
 for v in me.vertices:
  q=ob.matrix_world@v.co;pts.append([q.x,q.z,-q.y])
 rows.append({'name':ob.name,'material':me.materials[0].name if me.materials else None,'positions':pts,'triangles':[list(t.vertices) for t in me.loop_triangles]})
out=os.path.join(root,'reports/r88-yangxin-east-anteroom/legacy-source-components.json')
with open(out,'w') as f:json.dump({'sourceSHA256':hashlib.sha256(source.encode()).hexdigest(),'components':rows},f,separators=(',',':'))
print('R88_COMPONENTS',len(rows),'triangles',sum(len(r['triangles']) for r in rows),out)
