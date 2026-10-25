"""Actual final S asset diagnostic. Not a game/GPU/mobile screenshot.
No B shell, historical textures or game-light claims. CPU Cycles, fixed setup.
"""
import bpy, os, sys, json
from mathutils import Vector
sys.dont_write_bytecode=True
neutral="--neutral" in sys.argv
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath='/tmp/r88-final-decoded.glb')
for ob in bpy.context.scene.objects:
 if ob.name.startswith(('COL_','WALK_')):ob.hide_render=True
scene=bpy.context.scene
scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=24;scene.cycles.use_denoising=False
scene.render.resolution_x=1100;scene.render.resolution_y=720;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
world=bpy.data.worlds.new('diagnostic-neutral-world');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.65,.69,.74,1);world.node_tree.nodes['Background'].inputs[1].default_value=.2 if neutral else .5;scene.world=world
# Coordinates are final GLB local Three(x,y,z), not a recovered source camera.
def B(p):return Vector((p[0],-p[2],p[1]))
light=bpy.data.lights.new('diagnostic-area-not-game-light','AREA');light.energy=150 if neutral else 1500;light.shape='DISK';light.size=5
ob=bpy.data.objects.new('diagnostic-area-not-game-light',light);scene.collection.objects.link(ob);ob.location=B((-11.5,3.85,-3));ob.rotation_euler=(B((-13,0,-2))-ob.location).to_track_quat('-Z','Y').to_euler()
views=[('eye-height',[-7.1,1.7,-1.7],[-14.6,1.2,-2.1],29),('oblique',[-8,3.4,-3.4],[-13.4,1.0,-1.8],25)]
out=os.path.abspath('reports/r88-yangxin-east-anteroom/offline-render');os.makedirs(out,exist_ok=True)
for name,eye,target,lens in views:
 data=bpy.data.cameras.new('diagnostic-'+name);cam=bpy.data.objects.new('diagnostic-'+name,data);scene.collection.objects.link(cam);cam.location=B(eye);cam.rotation_euler=(B(target)-cam.location).to_track_quat('-Z','Y').to_euler();data.lens=lens;data.clip_start=.05;scene.camera=cam;scene.render.filepath=os.path.join(out,name+('-neutral' if neutral else '')+'.png');bpy.ops.render.render(write_still=True)
with open(os.path.join(out,'views-neutral.json' if neutral else 'views.json'),'w')as f:json.dump({'scope':'Offline final S asset, not game; no B architecture; diagnostic lighting, not GPU/mobile validation','views':views,'engine':'Cycles CPU','samples':24,'areaEnergy':150 if neutral else 1500,'worldStrength':.2 if neutral else .5},f,indent=2)
