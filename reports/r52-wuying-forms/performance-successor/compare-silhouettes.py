#!/usr/bin/env python3
"""Silhouette masks from actual exported triangles, not shaded-image heuristics."""
import json,gzip,pathlib,math
import numpy as np
from PIL import Image,ImageDraw,ImageFont
from scipy.ndimage import distance_transform_edt
ROOT=pathlib.Path(__file__).parent
old={m['key']:m for m in json.load(gzip.open(ROOT/'high-detail-geometry.json.gz','rt'))['models']}
new={m['key']:m for m in json.load(gzip.open(ROOT/'optimized-geometry.json.gz','rt'))['models']}
w,h,scale=360,500,510
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',14)
def mask(model,yaw):
 yaw=math.radians(yaw);pitch=.10
 right=np.array([math.cos(yaw),0,-math.sin(yaw)]);up=np.array([-math.sin(pitch)*math.sin(yaw),math.cos(pitch),-math.sin(pitch)*math.cos(yaw)])
 im=Image.new('1',(w,h));draw=ImageDraw.Draw(im)
 for part in model['parts']:
  p=np.array(part['positions']).reshape(-1,3)-np.array([0,.37,0]);project=np.column_stack([w/2+(p@right)*scale,h/2-(p@up)*scale])
  for face in np.array(part['indices']).reshape(-1,3):draw.polygon([tuple(v)for v in project[face]],fill=1)
 return np.asarray(im,dtype=bool)
rows=[];sheet=Image.new('RGB',(w*3,h*4+62),(30,35,41))
for row,key in enumerate(['d111','d112','59','61']):
 for col,(yaw,label) in enumerate([(180,'front'),(145,'oblique'),(0,'rear')]):
  a,b=mask(old[key],yaw),mask(new[key],yaw)
  lost=float(distance_transform_edt(~b)[a].max());added=float(distance_transform_edt(~a)[b].max());iou=float((a&b).sum()/(a|b).sum());changed=int((a^b).sum())
  record={'key':key,'view':label,'yawDegrees':yaw,'pixelsPerMetre':scale,'iou':iou,'differingPixels':changed,'priorSilhouettePixels':int(a.sum()),'maxMissingDistancePixels':lost,'maxAddedDistancePixels':added,'pass':max(lost,added)<=3 and iou>=.975};rows.append(record)
  arr=np.full((h,w,3),230,np.uint8);arr[a&b]=[80,85,92];arr[a&~b]=[0,155,190];arr[b&~a]=[210,50,145]
  im=Image.fromarray(arr);d=ImageDraw.Draw(im);d.text((12,14),f'{key} {label} | IoU {iou:.4f}',font=font,fill=(25,30,35));d.text((12,h-28),f'Max edge change {max(lost,added):.2f} px',font=font,fill=(25,30,35));sheet.paste(im,(w*col,h*row))
d=ImageDraw.Draw(sheet);d.text((14,h*4+8),'Actual triangle silhouette overlay | grey: both; cyan: prior only; magenta: optimized only',font=font,fill=(240,243,246));d.text((14,h*4+34),'Orthographic CPU projection at 510 px/m. No surfaces removed; only lower sampling density.',font=font,fill=(220,229,235));sheet.save(ROOT/'silhouette-overlay.png')
result={'method':'Union of projected actual production triangles; excludes pedestal/shadows; no color-image heuristic','imageSize':[w,h],'limits':{'maxContourDistancePixels':3,'minIoU':.975},'results':rows,'allPass':all(r['pass']for r in rows)}
(ROOT/'silhouette-comparison.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2));assert result['allPass']
