"""CPU material rebinding contract: exact semantic ownership, no geometry edits."""
import collections
import importlib
import json
from pathlib import Path
import struct
import sys
import unittest

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'assets-src/interiors'))
from append_taihe_caisson import unpack_glb,sha

class SurfaceContract(unittest.TestCase):
 def test_builder_preserves_geometry_and_only_rebinds_semantic_faces(self):
  path=ROOT/'assets-src/interiors/build_taihe_furnishing_surface.py'
  self.assertTrue(path.exists(),'missing source-verified material rebind builder')
  module=importlib.import_module('build_taihe_furnishing_surface')
  original=module.BASE.read_bytes()
  candidate,receipt=module.rebind(original)
  a,ab=unpack_glb(original);b,bb=unpack_glb(candidate)
  self.assertEqual(receipt['reboundTriangles'],40)
  self.assertEqual(receipt['renderableTriangles'],17940)
  self.assertEqual(receipt['visibleBatches'],8)
  self.assertLessEqual(receipt['bufferBytesAdded'],16384)
  self.assertEqual(a['materials'],b['materials'])
  self.assertEqual(a.get('textures'),b.get('textures'))
  self.assertEqual(a.get('images'),b.get('images'))
  self.assertTrue(receipt['nonSelectedAttributeBytesExact'])
  self.assertTrue(receipt['nonSelectedIndicesInOriginalOrder'])
  self.assertEqual(receipt['positionNormalTriangleMultisetBefore'],receipt['positionNormalTriangleMultisetAfter'])
  self.assertEqual(module.rebind(original)[0],candidate)
  with self.assertRaises(ValueError):module.rebind(original[:-4]+b'bad!')

if __name__=='__main__':unittest.main()
