#!/usr/bin/env python3
"""Review unchanged production meshes. Only the camera framing changes; model scale is 1."""
import ast, pathlib, sys, json, gzip, math
# Reuse the reviewed CPU rasterizer without running the old script's report-writing entrypoint.
p=pathlib.Path('scripts/p3c-render-samples.py'); tree=ast.parse(p.read_text()); defs=[n for n in tree.body if isinstance(n,(ast.Import,ast.ImportFrom,ast.FunctionDef))]
exec(compile(ast.Module(body=defs,type_ignores=[]),str(p),'exec'))
ROOT=os.environ.get('P3C_FEMALE_OUT','reports/r50-followup/female-samples'); FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
models=json.load(gzip.open(ROOT+'/models.json.gz','rt'))['models']; mode=sys.argv[1] if len(sys.argv)>1 else 'preview'
def banner(im,lines):
 d=ImageDraw.Draw(im);y=im.height-30*len(lines)-12
 for i,s in enumerate(lines):d.text((20,y+30*i),s,font=font(17 if i==0 else 14),fill=(233,238,242) if i==0 else (193,205,215))
def render_cell(m,yaw=0,night=False,w=600,h=800,close=False):
 kw=dict(yaw=yaw,pitch=.04 if close else .08,night=night,w=w,h=h,scale=1550 if close else 365,center=(0,1.615,-.015) if close else (0,.86,.03))
 im=raster(m.get('fixtures',[])+[m['mesh']],**kw);d=ImageDraw.Draw(im);color=(232,237,242) if night else (29,36,41)
 d.text((22,18),m['id'].upper(),font=font(22),fill=color)
 d.text((22,49),f"{yaw:+d} deg / {'NIGHT' if night else 'DAY'} / LOD 0 / {'HAIR DETAIL' if close else m['pose'].upper()}",font=font(15),fill=color)
 return im
if mode=='preview':
 out=Image.new('RGB',(1400,1020),(28,34,41))
 for i,m in enumerate(models[:2]):out.paste(render_cell(m,yaw=-25,w=700,h=920),(700*i,0))
 banner(out,['CONSORT + PALACE MAID | actual current geometry | original 1.70 m body calibration','CPU software raster, not a browser/GPU screenshot. Camera enlargement only; no model rescaling.','Current hair is interpretive; Qianlong image-to-model evidence and female appearance approval are NOT passed.'])
 out.save(ROOT+'/female-current-models-preview.png');print('Saved female-current-models-preview.png',flush=True)
elif mode in ('sheets','hair'):
 close=mode=='hair'; w,h=600,650 if close else 800
 for night in (False,True):
  out=Image.new('RGB',(w*3,h*2+104),(28,34,41))
  for row,m in enumerate(models[:2]):
   for col,yaw in enumerate([0,90,180]):out.paste(render_cell(m,yaw,night,w,h,close),(col*w,row*h))
  banner(out,[('HAIR / FACE DETAIL' if close else 'FRONT / SIDE / BACK')+' | actual indexed CharacterKit geometry | unchanged model scale = 1','CPU review lighting and projected shadows only. Runtime character shadows OFF; not GPU/device evidence.','Current hair is interpretive; Qianlong image-to-model evidence and female appearance approval are NOT passed.'])
  name=f"female-{'hair-detail' if close else 'front-side-back'}-{'night' if night else 'day'}.png";out.save(ROOT+'/'+name);print('Saved '+name,flush=True)
elif mode=='kang':
 data=json.load(open(ROOT+'/world-seat-models.json'));m=next(m for m in data['models'] if m['metadata']['actor']['templateId']=='consort-daily')
 for night in [False,True]:
  w,h=650,800;out=Image.new('RGB',(w*3,h+104),(28,34,41))
  for col,yaw in enumerate([0,90,-35]):
   im=raster(m['fixtures']+[m['mesh']],yaw=yaw,pitch=.12,night=night,w=w,h=h,scale=350,center=(0,.88,.20));d=ImageDraw.Draw(im);c=(233,238,242)if night else(29,35,41)
   d.text((18,18),'CONSORT / ACTUAL CHUXIU KANG',font=font(19),fill=c);d.text((18,47),f'{yaw:+d} deg / ORIGINAL SCALE / ALL FURNITURE RETAINED',font=font(14),fill=c);out.paste(im,(w*col,0))
  banner(out,[('HASH-VERIFIED CACHED CHUXIU TRIANGLES + CURRENT FEMALE MESH | original resolved binding retained' if 'cachedFixtureProvenance' in data else 'ACTUAL CHUXIU SCENE TRIANGLES + ADAPTER-RESOLVED CONSORT | unchanged model scale = 1'),'CPU software raster; textures omitted; CPU review lighting/shadows only. Not GPU evidence.','Modern restored display kang, not a Qianlong furniture claim. Numeric support does not equal visual approval.'])
  name=f"female-consort-{'cached' if 'cachedFixtureProvenance' in data else 'actual'}-kang-{'night' if night else 'day'}.png";out.save(ROOT+'/'+name);print('Saved '+name,flush=True)
elif mode=='animation':
 world=json.load(open(ROOT+'/world-seat-models.json'));kang=next(m['fixtures'] for m in world['models'] if m['metadata']['actor']['templateId']=='consort-daily')
 data=json.load(gzip.open(ROOT+'/animation-frames.json.gz','rt'));frames=[]
 for k,ms in enumerate(data['frames']):
  out=Image.new('RGB',(1350,750),(28,34,41))
  for i,m in enumerate(ms):
   fixtures=kang if i==0 else [];im=raster(fixtures+[m['mesh']],yaw=-25,pitch=.09,w=450,h=650,scale=310,center=(0,.83,.14));d=ImageDraw.Draw(im)
   d.text((16,18),['CONSORT / ACTUAL KANG','MAID / QUIET STANDING','MAID / SLOW WALK CYCLE'][i],font=font(17),fill=(30,36,42));out.paste(im,(450*i,0))
  banner(out,[f'ACTUAL GEOMETRY DEFORMATION | frame {k+1:02d}/24 | 8 seconds, offline low frame rate','Seated small arm/head motion; maid standing / root-relative slow walk. Not a world-space route or foot-lock validation.','CPU software raster, not GPU/FPS evidence. Original model scale. Hair history and appearance approval remain pending.'])
  frames.append(out);print(f'Rendered female frame {k+1:02d}/24',flush=True)
 frames[0].save(ROOT+'/female-life-motion.gif',save_all=True,append_images=frames[1:],duration=333,loop=0)
 for n in [0,8,16]:frames[n].save(ROOT+f'/female-life-frame-{n+1:02d}.png')
 print('Saved female-life-motion.gif',flush=True)

elif mode=='gray':
 from copy import deepcopy
 w,h=600,800;out=Image.new('RGB',(w*3,h*2+104),(28,34,41))
 for row,original in enumerate(models[:2]):
  m=deepcopy(original);m['mesh']['colors']=[.42]*len(m['mesh']['colors'])
  for col,yaw in enumerate([0,90,180]):out.paste(render_cell(m,yaw,False,w,h),(col*w,row*h))
 banner(out,['SINGLE GRAY MATERIAL | actual unchanged mesh topology / positions | no identity colors', 'Sleeve contours, natural individual face shape and low bun structure remain geometric, not color swaps.', 'CPU software raster only. History, female appearance, seated visual review and GPU acceptance remain separate.'])
 out.save(ROOT+'/female-uniform-gray-silhouette.png');print('Saved female-uniform-gray-silhouette.png',flush=True)
