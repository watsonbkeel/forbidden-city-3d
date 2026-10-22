#!/usr/bin/env python3
"""Read-only CPU raster of exported real deformed seated female meshes.
No production-source changes; uses the frozen renderer shipped with this export.
"""
import os, pathlib, importlib.util, json, gzip, hashlib
from PIL import Image, ImageDraw
root=pathlib.Path(os.environ.get('P3C_FEMALE_OUT','reports/r50-followup/female-reference/candidate06-07')).resolve()
spec=importlib.util.spec_from_file_location('frozen_renderer',root/'renderer-source.py');r=importlib.util.module_from_spec(spec);spec.loader.exec_module(r)
data=json.load(gzip.open(root/'animation-frames.json.gz','rt'));frames=[];keys=[]
assert len(data['frames'])==24
for k,models in enumerate(data['frames']):
 m=models[0];state=m['state'];assert m['id']=='consort-daily' and m['pose']=='seated' and m['options']['seatVariant']=='kang-low'
 assert state['phase']==.35 and state['amplitude']==.7 and state['walkSpeed']==0
 out=Image.new('RGB',(1400,740),(245,246,244))
 for col,(yaw,pitch,label) in enumerate([(-15,.35,'前斜视'),(90,.15,'侧视')]):
  im=r.raster([m['mesh']],yaw=yaw,pitch=pitch,w=700,h=650,scale=1700,center=(0,.60,.36),ssaa=2)
  d=ImageDraw.Draw(im);d.rectangle((0,0,700,85),fill=(242,243,241));d.text((20,12),'后妃端坐 · idle 手部 · '+label,font=r.font(27,True),fill=(30,35,36));d.text((20,52),f'第 {k+1:02d}/24 帧 | t={state["time"]:.3f}s | phase=.35 | amplitude=.7',font=r.font(17,True),fill=(60,67,69));out.paste(im,(700*col,0))
 r.footer(out,['实际模型 CPU 动态近景 · 约8秒 / 离线3fps · 非游戏 / GPU 实机截图','现有CPU形变；原始尺度；非世界路径、脚锁或运行时动画集成证明'])
 frames.append(out)
 if k in (0,8,16):
  name=f'female-reference-seated-idle-frame-{k+1:02d}.png';r.save(out,root,name);keys.append(out)
 print(f'Rendered seated hand frame {k+1:02d}/24',flush=True)
p=r.fresh_path(root,'female-reference-seated-idle-hand-motion.gif');frames[0].save(p,save_all=True,append_images=frames[1:],duration=333,loop=0,disposal=2);print(str(p),flush=True)
contact=Image.new('RGB',(1400,740*3),(245,246,244))
for i,im in enumerate(keys):contact.paste(im,(0,740*i))
r.save(contact,root,'female-reference-seated-idle-keyframes.png')
with Image.open(p)as gif:
 assert gif.n_frames==24
 metadata={'source':'Actual exported CharacterKit CPU-deformed frames, frozen renderer, no synthetic image or altered geometry.','kind':'dynamic','model':'consort-daily','pose':'seated','seatVariant':'kang-low','modelScale':1,'frames':gif.n_frames,'displayDurationMilliseconds':sum(gif.seek(i)or gif.info.get('duration',0)for i in range(gif.n_frames)),'frameTimeRangeSeconds':[0,23/24*8],'sampleIntervalSeconds':8/24,'phase':.35,'amplitude':.7,'walkSpeed':0,'views':[{'yaw':-15,'pitch':.35},{'yaw':90,'pitch':.15}],'renderer':'CPU software raster, 2x supersampling; not GPU or runtime/world evidence','contactLimitation':'Pixels alone do not verify sub-millimetre gaps or all triangle intersections.','kitSha256':hashlib.sha256((root/'CharacterKit-source.js').read_bytes()).hexdigest()}
q=r.fresh_path(root,'seated-idle-motion-manifest.json');q.write_text(json.dumps(metadata,ensure_ascii=False,indent=2));print(str(q),flush=True)
