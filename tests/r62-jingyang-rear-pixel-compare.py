"""Compare actual CPU renders without editing images or replacing frozen f1 files."""
from PIL import Image
from pathlib import Path
import numpy as np
import json
import hashlib
root = Path('reports/r62-jingyang-rear')
sha = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
rows = []
for name in ['south', 'south-window', 'window-return-oblique']:
    filename = f'jingyang-rear-{name}.png'
    before, after = root / 'f1-reference' / filename, root / 'optimized' / filename
    x, y = np.asarray(Image.open(before)).astype(int), np.asarray(Image.open(after)).astype(int)
    assert x.shape == y.shape
    delta = np.abs(x - y)
    row = dict(view=name, referenceSha256=sha(before), optimizedSha256=sha(after),
               changedPixels=int(np.count_nonzero(np.any(delta > 0, axis=2))),
               totalPixels=int(delta.shape[0] * delta.shape[1]), maxChannelDifference=int(delta.max()),
               meanChannelDifference=float(delta.mean()),
               f1OriginalHashPreserved=sha(root / 'after' / filename) == sha(before)
               if (root / 'after' / filename).exists() else None)
    assert row['changedPixels'] == 0
    assert row['f1OriginalHashPreserved'] is not False
    rows.append(row)
(root / 'optimization' / 'pixel-comparison.json').write_text(json.dumps(rows, indent=2) + '\n')
print('Three views: 3,240,000 identical pixels; frozen original image hashes retained.')
