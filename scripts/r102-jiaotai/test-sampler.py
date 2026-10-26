import unittest,numpy as np,gzip,json
from pathlib import Path
from PIL import Image
from sample_texture import sample_rgba
class Sampler(unittest.TestCase):
 def test_direction_repeat_clamp_and_linear_colors(self):
  a=np.array([[[1,0,0],[0,1,0]],[[0,0,1],[1,1,1]]],dtype=float)
  t=dict(colorSpace='srgb',width=2,height=2,flipY=False,wrapS=1000,wrapT=1000)
  for uv,want in [([.25,.25],[1,0,0]),([1.25,-.75],[1,0,0]),([.5,.5],[.5,.5,.5])]:np.testing.assert_allclose(sample_rgba(a,t,np.array(uv)),want,rtol=0,atol=0)
  t['flipY']=True;np.testing.assert_allclose(sample_rgba(a,t,np.array([.25,.25])),[0,0,1],rtol=0,atol=0)
  t.update(flipY=False,wrapS=1001,wrapT=1001);np.testing.assert_allclose(sample_rgba(a,t,np.array([-10,.25])),[1,0,0],rtol=0,atol=0)
 def test_actual_production_pixels_not_redrawn(self):
  root=Path('reports/r102-jiaotai/visual');record=json.load(gzip.open(root/'triangles-after.json.gz','rt'))
  for t in record['textures']:
   raw=np.frombuffer(gzip.open(root/t['file'],'rb').read(),np.uint8).reshape(t['height'],t['width'],4)
   png=np.array(Image.open(root/t['file'].replace('.rgba.gz','.png')))
   np.testing.assert_array_equal(png,np.flipud(raw) if not t['flipY'] else raw)
if __name__=='__main__':unittest.main()
