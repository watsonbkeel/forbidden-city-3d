"""Measure existing normal-map pixels; no texture editing or renderer claim.

Usage: python tools/r35-normal-map-diagnostics.py [output.json]
Requires the same Pillow and NumPy used by assets-src/process_textures.py.
"""
import hashlib
import json
from pathlib import Path
import subprocess
import sys

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
NAMES = ["ground_brick", "stone_slab", "wall_red", "wood_column", "marble"]
# Read the actual production defaults instead of duplicating candidate values.
defaults = json.loads(subprocess.check_output(
    ["node", "--input-type=module", "-e", """
      import * as T from 'three';
      import { TextureLibrary } from './src/utils/TextureLibrary.js';
      const library = new TextureLibrary();
      const out = {};
      for (const name of JSON.parse(process.argv[1])) {
        library.colors.set(name, new T.Texture());
        library.normals.set(name, new T.Texture());
        const material = library.material(name);
        out[name] = { roughness: material.roughness,
          normalScale: material.normalScale.toArray(),
          tileMetres: library.tileSize(name) };
      }
      process.stdout.write(JSON.stringify(out));
      library.dispose();
    """, json.dumps(NAMES)],
    cwd=ROOT, text=True,
))

rows = []
for quality in ["hd", "sd"]:
    for name in NAMES:
        relative = f"public/textures/{quality}/{name}_n.webp"
        file = ROOT / relative
        raw = file.read_bytes()
        rgb = np.asarray(Image.open(file).convert("RGB"), dtype=np.float64)
        normal = rgb / 127.5 - 1.0
        scale = np.asarray(defaults[name]["normalScale"])
        before = np.degrees(np.arctan2(
            np.linalg.norm(normal[:, :, :2], axis=2), normal[:, :, 2]))
        after = np.degrees(np.arctan2(
            np.linalg.norm(normal[:, :, :2] * scale, axis=2), normal[:, :, 2]))
        statistics = lambda values: {
            "p50": round(float(np.percentile(values, 50)), 6),
            "p90": round(float(np.percentile(values, 90)), 6),
            "p99": round(float(np.percentile(values, 99)), 6),
            "maximum": round(float(values.max()), 6),
        }
        rows.append({
            "name": name, "quality": quality, "path": relative,
            "sha256": hashlib.sha256(raw).hexdigest(),
            "bytes": len(raw), "width": rgb.shape[1], "height": rgb.shape[0],
            **defaults[name],
            "r34UnitScaleAngleDegrees": statistics(before),
            "candidateScaledAngleDegrees": statistics(after),
        })

report = {
    "schema": 1,
    "baselineCommit": "2cd8189db462e34a2ffc5573a435db8a0a77cccb",
    "sourceSHA256": hashlib.sha256(
        (ROOT / "src/utils/TextureLibrary.js").read_bytes()).hexdigest(),
    "metric": "Decoded RGB / 127.5 - 1; angle = degrees(atan2(length(normal.xy * material.normalScale), normal.z)).",
    "interpretation": "Tangent-space normal angular deviation, not a measured real surface slope or rendered pixel difference.",
    "limitations": [
        "Original maps are luminance-derived approximations, not measured surface normals.",
        "Statistics use decoded base-level pixels, not filtered mipmaps.",
        "Roughness choices are conservative estimates; no screenshot calibration or measured material claim.",
        "No albedo, texture pixel, UV, geometry or physical tile-size changes.",
    ],
    "rows": rows,
}
output = json.dumps(report, indent=2) + "\n"
if len(sys.argv) > 1:
    Path(sys.argv[1]).write_text(output)
else:
    print(output, end="")
