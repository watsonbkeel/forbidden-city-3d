#!/usr/bin/env python3
"""Actual unit-scale CharacterKit buffers, CPU software raster, no browser/GPU.
New review renderer only: neutral grey-white backdrop, two light Lambert shading,
projected mesh shadows, and 2x supersampling. No geometry or source changes.
"""
import os, sys, json, gzip, math, pathlib, copy, hashlib
import numpy as np
from PIL import Image, ImageDraw, ImageFont
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
CJK='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
def font(n,cjk=False):
 try:return ImageFont.truetype(CJK if cjk else FONT,n)
 except OSError:return ImageFont.load_default()
def fresh_path(root,name):
 p=root/name
 if p.exists():raise FileExistsError(f'Preserve existing evidence: {p}. Select a fresh output directory.')
 return p
def raster(meshes,yaw=0,pitch=.065,w=650,h=960,scale=460,center=(0,.88,.04),ssaa=2,shadows=True):
 """Orthographic camera; scale is pixels/metre, never a mesh transform."""
 ow,oh=w,h;w*=ssaa;h*=ssaa;scale*=ssaa
 bg=np.array([.85,.855,.85],np.float32);im=np.broadcast_to(bg,(h,w,3)).copy();im*=.985+.015*np.arange(h,dtype=np.float32)[:,None,None]/h
 zbuf=np.full((h,w),-1e9,np.float32);a=math.radians(yaw)
 right=np.array([math.cos(a),0,-math.sin(a)]);up=np.array([-math.sin(pitch)*math.sin(a),math.cos(pitch),-math.sin(pitch)*math.cos(a)]);view=np.array([math.cos(pitch)*math.sin(a),math.sin(pitch),math.cos(pitch)*math.cos(a)])
 R=np.stack([right,up,view]);ctr=np.array(center)
 light=np.array([-.45,.83,.60]);light/=np.linalg.norm(light);fill=np.array([.8,.4,-.25]);fill/=np.linalg.norm(fill)
 def triangles(p,n,c,idx,shadow=False):
  q=(p-ctr)@R.T;pp=np.column_stack([w/2+q[:,0]*scale,h/2-q[:,1]*scale,q[:,2]])
  if not shadow:
   fn=np.cross(p[idx[:,1]]-p[idx[:,0]],p[idx[:,2]]-p[idx[:,0]]);idx=idx[fn@view>0]
  for ti in idx:
   v=pp[ti];minx=max(0,int(math.floor(v[:,0].min())));maxx=min(w-1,int(math.ceil(v[:,0].max())));miny=max(0,int(math.floor(v[:,1].min())));maxy=min(h-1,int(math.ceil(v[:,1].max())))
   if minx>maxx or miny>maxy:continue
   x1,y1=v[0,:2];x2,y2=v[1,:2];x3,y3=v[2,:2];denom=(y2-y3)*(x1-x3)+(x3-x2)*(y1-y3)
   if abs(denom)<1e-9:continue
   Y,X=np.mgrid[miny:maxy+1,minx:maxx+1];X=X+.5;Y=Y+.5
   b0=((y2-y3)*(X-x3)+(x3-x2)*(Y-y3))/denom;b1=((y3-y1)*(X-x3)+(x1-x3)*(Y-y3))/denom;b2=1-b0-b1
   zz=b0*v[0,2]+b1*v[1,2]+b2*v[2,2];depth=zbuf[miny:maxy+1,minx:maxx+1];mask=(b0>=-.001)&(b1>=-.001)&(b2>=-.001)&(zz>depth)
   if not np.any(mask):continue
   if shadow:color=np.broadcast_to(bg*.81,(*mask.shape,3))
   else:
    ns=b0[...,None]*n[ti[0]]+b1[...,None]*n[ti[1]]+b2[...,None]*n[ti[2]];ns/=np.maximum(np.linalg.norm(ns,axis=-1)[...,None],1e-7)
    cs=b0[...,None]*c[ti[0]]+b1[...,None]*c[ti[1]]+b2[...,None]*c[ti[2]];lam=np.maximum(0,ns@light);rim=np.maximum(0,ns@fill)
    color=np.clip(cs*(.53+.43*lam[...,None]+.075*rim[...,None]),0,1)
   sub=im[miny:maxy+1,minx:maxx+1];sub[mask]=color[mask];depth[mask]=zz[mask]
 prepared=[]
 for m in meshes:prepared.append((np.array(m['positions']).reshape(-1,3),np.array(m['normals']).reshape(-1,3),np.array(m['colors']).reshape(-1,3),np.array(m['indices']).reshape(-1,3)))
 if shadows:
  for p,n,c,idx in prepared:
   ps=p.copy();ps[:,0]-=p[:,1]*light[0]/light[1];ps[:,2]-=p[:,1]*light[2]/light[1];ps[:,1]=.001;triangles(ps,None,None,idx,True)
 for p,n,c,idx in prepared:triangles(p,n,c,idx)
 im=np.where(im<=.0031308,im*12.92,1.055*np.maximum(im,0)**(1/2.4)-.055)
 result=Image.fromarray(np.uint8(np.clip(im,0,1)*255))
 return result.resize((ow,oh),Image.Resampling.LANCZOS) if ssaa>1 else result
LABELS=['后妃 · 端坐','宫女 · 侍立','宫女 · 缓步姿态']
ENGLISH=['CONSORT / SEATED KANG-LOW','MAID / QUIET STANDING','MAID / SLOW WALK, 0.35']
def cell(model,index=0,yaw=-15,w=650,h=960,close=False,gray=False,ssaa=2):
 m=copy.deepcopy(model) if gray else model
 if gray:m['mesh']['colors']=[.43]*len(m['mesh']['colors'])
 top=max(m['mesh']['positions'][1::3]);ctr=(0,top-.16,.015) if close else (0,.88,.04);scale=1600 if close else 460
 im=raster(([] if close or gray else m.get('fixtures',[]))+[m['mesh']],yaw=yaw,pitch=.025 if close else .065,w=w,h=h,scale=scale,center=ctr,ssaa=ssaa,shadows=not close)
 d=ImageDraw.Draw(im);d.text((24,16),LABELS[index],font=font(32,True),fill=(29,33,34));
 if close or yaw in (0,90,180):d.text((24,62),f'{yaw:+d}°',font=font(18),fill=(75,80,81))
 return im
def footer(im,lines):
 d=ImageDraw.Draw(im);y=im.height-len(lines)*24-14;d.rectangle((0,y-12,im.width,im.height),fill=(245,246,244))
 for i,s in enumerate(lines):d.text((24,y+24*i),s,font=font(20 if i==0 else 14,True),fill=(34,40,42)if i==0 else(76,83,85))
def save(im,root,name):
 p=fresh_path(root,name);im.save(p);print(str(p),flush=True)
def main():
 root=pathlib.Path(os.environ.get('P3C_FEMALE_OUT','reports/r50-followup/female-reference/candidate06-01'));mode=sys.argv[1]if len(sys.argv)>1 else'preview'
 data=json.load(gzip.open(root/'models.json.gz','rt'));models=data['models'];ssaa=int(os.environ.get('P3C_SSAA','2'))
 evidence=['ACTUAL GEOMETRY | CPU SOFTWARE RASTER | NOT GPU | original unit-scale model','2x supersampling, offline Lambert review lighting / projected shadows; not runtime FPS or visual approval.','Actual cached kang geometry; room floor omitted. Root-relative slow walk uses existing CPU deformation.']
 if mode=='preview':
  out=Image.new('RGB',(1950,1010),(245,246,244))
  for i,m in enumerate(models):out.paste(cell(m,i,ssaa=ssaa),(650*i,0))
  footer(out,['实际模型 CPU 预览，非游戏 / GPU 实机截图，未启用']);save(out,root,'female-reference-three-poses-front.png')
 elif mode in ('sheets','close','gray'):
  close=mode=='close';w,h=600,720 if close else 900;out=Image.new('RGB',(w*3,h*3+110),(245,246,244))
  for row,m in enumerate(models):
   for col,yaw in enumerate([0,90,180]):out.paste(cell(m,row,yaw,w,h,close,mode=='gray',ssaa),(col*w,row*h))
   print(f'Rendered {mode} row {row+1}/3',flush=True)
  footer(out,['实际模型 CPU '+('灰模' if mode=='gray' else '近景' if close else '三视图')+'预览，非游戏 / GPU 实机截图，未启用'])
  save(out,root,{'sheets':'female-reference-front-side-back.png','close':'female-reference-face-hair-close.png','gray':'female-reference-uniform-gray.png'}[mode])
 elif mode=='hands':
  out=Image.new('RGB',(1950,1360),(245,246,244))
  for row,pitch in enumerate([.18,.65]):
   for i,m in enumerate(models):
    center=[(0,.697,.39),(0,.99,.23),(-.278,.84,-.02)][i]
    im=raster([m['mesh']],yaw=-15,pitch=pitch,w=650,h=650,scale=1450,center=center,ssaa=ssaa)
    d=ImageDraw.Draw(im);d.rectangle((0,0,650,90),fill=(242,243,241));d.text((22,12),LABELS[i]+' · 手部',font=font(27,True),fill=(30,35,36));d.text((22,52),'前斜视' if row==0 else '俯斜视',font=font(19,True),fill=(60,67,69));out.paste(im,(650*i,650*row))
  footer(out,['实际模型 CPU 手部近景，非游戏 / GPU 实机截图，未启用']);save(out,root,'female-reference-hand-details.png')
 elif mode=='animation':
  frames_data=json.load(gzip.open(root/'animation-frames.json.gz','rt'));frames=[]
  for k,ms in enumerate(frames_data['frames']):
   out=Image.new('RGB',(1350,810),(245,246,244))
   for i,m in enumerate(ms):
    meshes=(models[0].get('fixtures',[]) if i==0 else[])+[m['mesh']]
    im=raster(meshes,yaw=-15,w=450,h=700,scale=330,center=(0,.88,.04),ssaa=ssaa);d=ImageDraw.Draw(im);d.text((18,14),LABELS[i],font=font(26,True),fill=(29,33,34));d.text((18,55),ENGLISH[i],font=font(13),fill=(54,60,61));out.paste(im,(450*i,0))
   footer(out,[f'ACTUAL GEOMETRY / CPU DEFORMATION | frame {k+1:02d}/24 | 8 s, offline 3 fps','CPU software raster, not GPU/FPS evidence. Original unit scale. No world-space route or foot-lock claim.','Seated / standing idle and root-relative slow walk. Hair history and appearance approval remain pending.']);frames.append(out);print(f'Rendered frame {k+1:02d}/24',flush=True)
  path=fresh_path(root,'female-reference-life-motion.gif');frames[0].save(path,save_all=True,append_images=frames[1:],duration=333,loop=0);print(str(path),flush=True)
  for n in [0,8,16]:save(frames[n],root,f'female-reference-life-frame-{n+1:02d}.png')
 else:raise ValueError(f'Unknown mode: {mode}')
if __name__=='__main__':main()
