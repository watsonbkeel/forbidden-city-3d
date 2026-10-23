#!/usr/bin/env python3
import json,gzip,pathlib
from PIL import Image,ImageDraw
ROOT=pathlib.Path(__file__).parent
source=pathlib.Path('scripts/p3c-render-samples.py').read_text().split('\nmodels=json.load')[0].replace('[-.55,.82,.48]','[.55,.82,-.48]')
ns={};exec(compile(source,'repository CPU triangle rasterizer','exec'),ns);raster,font=ns['raster'],ns['font']
models={phase:{m['key']:m for m in json.load(gzip.open(ROOT/f'{phase}-geometry.json.gz','rt'))['models']}for phase in ['high-detail','optimized']}
views=[('d111',145,.70,(0,.48,0),1150,'open crown / inner mouth'),('d112',145,.72,(0,.66,0),1150,'flared mouth / inner wall'),('59',145,.62,(0,.48,0),850,'wide mouth / inner floor'),('59',180,.15,(0,.115,-.02),1050,'three foot contacts / body join')]
w,h=450,400;sheet=Image.new('RGB',(w*2,h*len(views)+65),(27,32,40))
for row,(key,yaw,pitch,center,scale,label) in enumerate(views):
 for col,phase in enumerate(['high-detail','optimized']):
  m=models[phase][key];im=raster(m['fixtures']+m['parts'],yaw=yaw,pitch=pitch,w=w,h=h,scale=scale,center=center);d=ImageDraw.Draw(im);d.text((10,12),f'{phase.upper()} {key}',font=font(16),fill=(20,27,33));d.text((10,h-25),label,font=font(14),fill=(20,27,33));sheet.paste(im,(col*w,row*h))
d=ImageDraw.Draw(sheet);d.text((14,h*len(views)+9),'ACTUAL GEOMETRY DETAIL | profiles, mouth surfaces and foot/body overlaps retained',font=font(16),fill=(235,240,245));d.text((14,h*len(views)+36),'CPU review projection / lighting; not a browser or GPU screenshot. No changed object dimensions.',font=font(14),fill=(205,215,225));sheet.save(ROOT/'mouth-and-foot-comparison.png')
