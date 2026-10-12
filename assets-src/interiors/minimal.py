"""最简 GLB：一个金色立方体 + 一个 COL_ 碰撞盒，用于验证加载/卸载/回退链路。
用法：Blender -b -P assets-src/interiors/minimal.py -- <out.glb>
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from _common import *

out = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'public/models/interiors/_minimal.glb'
reset_scene()
gold = mat('gold', (0.79, 0.63, 0.23), metallic=0.85, roughness=0.3)
box('Cube', 1.0, 1.0, 1.0, 0, 1.5, 10, gold)
col_box('COL_cube', -0.5, 0, 9.5, 0.5, 2.0, 10.5)
export_glb(out)
