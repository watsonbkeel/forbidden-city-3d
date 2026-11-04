"""Capture only frozen56fa partitions(), never the hall exporter."""
import ast, os, sys, json, hashlib, subprocess
sys.dont_write_bytecode=True
import bpy
root=os.path.abspath(os.path.join(os.path.dirname(__file__),'../..'))
p=os.path.join(root,'assets-src/interiors/yangxin.py')
sys.path.insert(0,os.path.dirname(p))
source=subprocess.check_output(['git','show','56fad7960b54c6807f6073841e11e5733826259f:assets-src/interiors/yangxin.py'],cwd=root,text=True); tree=ast.parse(source)
# Only module's final build call is suppressed. Source remains unmodified.
assert isinstance(tree.body[-1],ast.If) and ast.unparse(tree.body[-1].test)=="'--east-only' in sys.argv" and isinstance(tree.body[-1].orelse[-1],ast.Expr) and tree.body[-1].orelse[-1].value.func.id=='build'
tree.body.pop(); scope={'__file__':p,'__name__':'r164_frozen_partitions'}
exec(compile(tree,p,'exec'),scope)
scope['reset_scene']();scope['partitions']();bpy.context.view_layer.update()
rows=[]
for ob in bpy.context.scene.objects:
 if ob.type!='MESH': continue
 me=ob.data;me.calc_loop_triangles()
 pts=[]
 for v in me.vertices:
  q=ob.matrix_world@v.co;pts.append([q.x,q.z,-q.y])
 rows.append({'name':ob.name,'material':me.materials[0].name if me.materials else None,'positions':pts,'triangles':[list(t.vertices) for t in me.loop_triangles]})
assert '--' in sys.argv, 'Provide an explicit output JSON after --'
out=os.path.abspath(sys.argv[sys.argv.index('--')+1])
with open(out,'w') as f:json.dump({'sourceSHA256':hashlib.sha256(source.encode()).hexdigest(),'components':rows},f,separators=(',',':'))
print('R164_PARTITION_COMPONENTS',len(rows),'triangles',sum(len(r['triangles']) for r in rows),out)
