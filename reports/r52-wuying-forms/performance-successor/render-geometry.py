#!/usr/bin/env python3
"""CPU evidence of exported production triangles. Never a GPU/runtime claim."""
import json, gzip, pathlib
from PIL import Image, ImageDraw
ROOT=pathlib.Path(__file__).parent
# Reuse the repository's actual-buffer CPU rasterizer without its CLI actions.
source=pathlib.Path('scripts/p3c-render-samples.py').read_text().split('\nmodels=json.load')[0]
source=source.replace('[-.55,.82,.48]','[.55,.82,-.48]')
ns={};exec(compile(source,'repository CPU triangle rasterizer','exec'),ns)
raster,font=ns['raster'],ns['font']
for phase in ['high-detail','optimized']:
 path=ROOT/f'{phase}-geometry.json.gz'
 if not path.exists():continue
 models=json.load(gzip.open(path,'rt'))['models']
 views=[(180,'front'),(145,'oblique'),(0,'rear / no invented ornament')]
 w,h=360,500;sheet=Image.new('RGB',(w*3,h*len(models)+62),(25,31,38))
 for row,model in enumerate(models):
  for col,(yaw,label) in enumerate(views):
   im=raster(model['fixtures']+model['parts'],yaw=yaw,pitch=.10,w=w,h=h,scale=510,center=(0,.37,0))
   d=ImageDraw.Draw(im);d.text((12,14),f"{phase.upper()} {model['key']} | {label}",font=font(14),fill=(25,30,35))
   d.text((12,h-25),f"Actual meshes: {model['meshes']}; triangles: {model['triangles']}",font=font(13),fill=(25,30,35));sheet.paste(im,(w*col,h*row))
 d=ImageDraw.Draw(sheet);d.text((15,h*len(models)+8),'Actual production BufferGeometry | CPU review lighting | not browser / WebGL / GPU evidence',font=font(15),fill=(233,238,243));d.text((15,h*len(models)+34),'Four individual visual fits; painted motifs are not reproduced. Cases and world placement are unchanged.',font=font(14),fill=(202,211,221));sheet.save(ROOT/f'{phase}-geometry-views.png')
 print(f'Rendered {phase} actual geometry',flush=True)
