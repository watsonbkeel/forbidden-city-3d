#!/usr/bin/env python3
"""Render actual recorded controller paths against the same B and S collider bounds."""
import gzip,json,pathlib,html
root=pathlib.Path(__file__).resolve().parents[1];out=root/'docs/validation/r55-kunning-low-stoves'
data=json.loads(gzip.decompress((out/'route-evidence.json.gz').read_bytes()))
W,H=620,1000;scale=34;ox,oz=350,70
xy=lambda x,z:(ox+x*scale,oz+(394-z)*scale)
parts=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">','<rect width="100%" height="100%" fill="#f4f1e9"/>','<defs><clipPath id="clip"><rect x="24" y="50" width="550" height="850"/></clipPath></defs>','<g clip-path="url(#clip)">']
for box in data['B']+[dict(data['stove'],tag='NEW_LOW_STOVE')]:
 a,b=box['min'],box['max'];x,y=xy(a[0],b[2]);fill='#b7603c' if box['tag']=='NEW_LOW_STOVE' else '#b2b5ba'
 parts.append(f'<rect x="{x:.3f}" y="{y:.3f}" width="{(b[0]-a[0])*scale:.3f}" height="{(b[2]-a[2])*scale:.3f}" fill="{fill}" fill-opacity=".7" stroke="#575a60" stroke-width=".6"/>')
for run in data['runs']:
 color='#cc3050' if run['kind']=='blocked-approach' else '#007c66'
 points=' '.join(f'{xy(f["x"],f["z"])[0]:.3f},{xy(f["x"],f["z"])[1]:.3f}' for f in run['frames'])
 parts.append(f'<polyline points="{points}" fill="none" stroke="{color}" stroke-opacity=".28" stroke-width="1.4"/>')
for i,(x,z) in enumerate(data['waypoints'][:9]):
 x,y=xy(x,z);parts.append(f'<circle cx="{x}" cy="{y}" r="4" fill="#007c66"/><text x="{x+8}" y="{y}" font-family="sans-serif" font-size="12">{i}</text>')
parts+=['</g>','<g font-family="sans-serif" fill="#192c32">','<text x="24" y="27" font-size="18">Kunning S: actual controller route overlay</text>','<text x="24" y="930" font-size="13">Green: 16 legal roundtrips. Red: 8 blocked stove approaches.</text>','<text x="24" y="951" font-size="13">10/60Hz, walk/sprint, W/S and W+D/S+D. No rescue.</text>','<text x="24" y="972" font-size="13">Gray: real B body-height colliders. Brown: .43m S stove.</text>','</g></svg>']
(out/'route-overlay.svg').write_text('\n'.join(parts)+'\n')
summary={'kind':data['kind'],'runs':[dict({k:r[k] for k in ['kind','fps','sprint','backward','diagonal','arrived','end']},frames=len(r['frames']),minGround=min(f['ground'] for f in r['frames']),maxGround=max(f['ground'] for f in r['frames'])) for r in data['runs']]}
(out/'route-summary.json').write_text(json.dumps(summary,indent=2)+'\n')
print(out/'route-overlay.svg')
