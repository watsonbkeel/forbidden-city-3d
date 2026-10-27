"""Bilinear sampling of the exported production sRGB RGBA texture.
No procedural pattern recreation and no approximation of GPU mip selection.
"""
import numpy as np

def sample_rgba(a,t,uv):
 assert t['colorSpace']=='srgb'
 u=uv[...,0];v=uv[...,1]
 if t['flipY']:v=1-v
 w=t['width'];h=t['height'];x=u*w-.5;y=v*h-.5;ix=np.floor(x).astype(int);iy=np.floor(y).astype(int);fx=x-ix;fy=y-iy
 def ind(z,n,repeat):return z%n if repeat==1000 else np.clip(z,0,n-1)
 x0=ind(ix,w,t['wrapS']);x1=ind(ix+1,w,t['wrapS']);y0=ind(iy,h,t['wrapT']);y1=ind(iy+1,h,t['wrapT'])
 def lin(c):return np.where(c<=.04045,c/12.92,((c+.055)/1.055)**2.4)
 c00=lin(a[y0,x0]);c10=lin(a[y0,x1]);c01=lin(a[y1,x0]);c11=lin(a[y1,x1]);fx=fx[...,None];fy=fy[...,None]
 return (c00*(1-fx)+c10*fx)*(1-fy)+(c01*(1-fx)+c11*fx)*fy
