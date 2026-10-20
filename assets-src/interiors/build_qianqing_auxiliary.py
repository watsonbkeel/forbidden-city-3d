"""R33 Qianqing streamed floor detail around the permanently owned five-panel core.

The central dais, three flights, throne, screen and rear frame are owned by
QianqingCentralSetting.js in both loading states. This asset must not cover them
with the old generic seven-panel screen/two-tier platform. Retain inherited
floor and ornament forms; lower the latter to the new .70 m platform.
The Palace Museum's Huangjidian Kaolue (2011), p106, explicitly says Qianqing
has a fully panelled ceiling without a caisson. Omit the old generic caisson
and mirror; the permanent layer retains its existing continuous ceiling.
All 56 structural red columns belong to the permanent six-station grid.
The streamed floor cannot reintroduce six obsolete four-row columns.
All spatial values remain inherited or photo-relative trials.
No other hall generator or exported asset is changed.
"""
import os,sys,json,hashlib,math
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import bpy
from _common import reset_scene,mat,cylinder,col_box,box,merge_by_material,export_glb,tri_count
from throne_hall import ornament
from qianqing_surface import P,floor,incense_pavilion
out=sys.argv[sys.argv.index('--')+1] if '--' in sys.argv else 'public/models/interiors/qianqing-r33.glb'
root=os.path.abspath(os.path.join(os.path.dirname(__file__),'../..'))
assert hashlib.sha256(open(os.path.join(root,'public/models/interiors/qianqing.glb'),'rb').read()).hexdigest()=='5fea568395a4474dbfd77fed158e9d2bbfa0959e5f5cd268ecab7e523f0861bf'
reset_scene()
gold=mat('gold_lacquer',(.83,.62,.20),.9,.28);red=mat('red_lacquer',(.42,.09,.06),.1,.38);bronze=mat('bronze',(.29,.23,.16),.75,.42);stone=mat('white_marble',(.78,.77,.73),0,.55);dark=mat('brick_grout',P['floor']['grout'],0,.9);brick=mat('gold_brick',P['floor']['linearColor'],0,P['floor']['roughness']);enamel=mat('qianqing_enamel',P['pavilion']['enamel'],.1,P['pavilion']['roughness'])
cfg=dict(w=46,d=25,H=(26-6.9375)*.38)
floor(cfg,dark,brick)
bay=46/9
# R32: the six inherited display objects now have one permanent owner in
# QianqingDisplay.js. Do not duplicate them in the optional overlay. Floor-side
# incense pavilions retain their permanent guards in both loading states.
# Proxies correspond exactly to the visible permanent step surfaces/rail posts.
# They remain inside its unchanged exclusion; no new climbable display route.
w=1.6*bay;front=1.0;rise=.70/5;run=1.30/5
for flight,x in enumerate([-w/3,0,w/3]):
 for k in range(5):box(f'WALK_qianqing_step_{flight}_{k}',w*.245,rise*(k+1),run,x,rise*(k+1)/2,front-1.3+(k+.5)*run,None)
outer_gap=w/2-(w/3+w*.245/2);outer_x=w/2-outer_gap/2
for i,x in enumerate([-outer_x,-w/6,w/6,outer_x]):
 for j,z in enumerate([front-.98,front-.28,front+.7]):
  k=min(5,max(1,math.floor((z-front+1.3)/.26)+1));baseY=k*rise
  col_box(f'COL_qianqing_rail_post_{i}_{j}',x-.0375,baseY,z-.0375,x+.0375,baseY+.70,z+.0375)
contract=bpy.data.objects.new('QIANQING_AUXILIARY_CONTRACT',None);bpy.context.scene.collection.objects.link(contract)
contract['version']='r29-permanent-five-panel-core';contract['centralCoreOwner']='PalaceBuilder';contract['daisHeight']=.70;contract['stairFlights']=3;contract['stepCount']=5;contract['plainRedColumns']=0;contract['columnsOwner']='PalaceBuilder';contract['spatialFitId']='qianqing-five-depth-bays-r33';contract['ceiling']='fully-panelled-no-caisson';contract['sourceSHA256']=hashlib.sha256(open(__file__,'rb').read()).hexdigest()
contract['materialProfile']='r33-permanent-structure-floor-only'
contract['displayOwner']='PalaceBuilder'
contract['profileSHA256']=hashlib.sha256(open(os.path.join(root,'data/architecture/qianqing-material.json'),'rb').read()).hexdigest()
contract['surfaceSourceSHA256']=hashlib.sha256(open(os.path.join(os.path.dirname(__file__),'qianqing_surface.py'),'rb').read()).hexdigest()
print('[R33 auxiliary] source triangles',tri_count());merge_by_material();export_glb(out,draco=True,export_extras=True)
