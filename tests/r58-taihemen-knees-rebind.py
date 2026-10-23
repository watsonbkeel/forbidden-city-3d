"""Verify final narrow re-export equals saved render geometry; never rerender.
Usage: python tests/r58-taihemen-knees-rebind.py /tmp/r58-taihemen-knees-final
"""
import gzip,hashlib,json,sys
from pathlib import Path
old=Path('docs/current-state/r58-taihemen-south-knees/evidence')
new=Path(sys.argv[1]);out=Path('reports/r58-taihemen-south-knees')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def multiset(rows):return sorted(json.dumps(r,sort_keys=True,separators=(',',':')) for r in rows)
checks=[]
for p in sorted(old.glob('*.json.gz')):
 a=json.load(gzip.open(p,'rt'));b=json.load(gzip.open(new/p.name,'rt'))
 same=a['camera']==b['camera'] and multiset(a['triangles'])==multiset(b['triangles']) and a['palette']==b['palette']
 assert same,p.name
 checks.append({'captureExport':str(p),'image':str(p).replace('.json.gz','.png'),'sameCamera':a['camera']==b['camera'],'sameMaterialTriangleMultiset':True,'sameDeclaredPalette':True,'captureSHA256':sha(p),'finalReexportSHA256':sha(new/p.name),'imageSHA256':sha(Path(str(p).replace('.json.gz','.png')))})
summary=json.load(open(new/'geometry-summary.json'));original=json.load(open(old/'geometry-summary.json'))
changed={k:{'capture':v,'final':summary['sourceHashes'][k]} for k,v in original['sourceHashes'].items() if v!=summary['sourceHashes'][k]}
assert set(changed)=={'src/scene/palace/special/TaihemenEnclosure.js','tests/lib/r58-taihemen-knees-world-check.mjs'},changed
summary['views']=[{k:v for k,v in row.items() if k!='file'} for row in summary['views']]
summary['finalReexportFilesRetained']=False
summary['retainedCaptureEvidence']='docs/current-state/r58-taihemen-south-knees/evidence'
(out/'final-geometry-summary.json').write_text(json.dumps(summary,indent=2)+'\n')
report={'purpose':'Bind final reviewed hook placement and matrix refresh to the unchanged saved same-camera CPU images, without rerendering.',
 'status':'PASS_ACTUAL_TRIANGLE_MULTISET_AND_CAMERA_EQUALITY_NOT_BROWSER_ACCEPTANCE','sourceChangesSinceCapture':changed,
 'sourceChangeMeaning':'The same additive knee call moved before external writes; consumer refreshes only derived world matrices. Render geometry and palette are unchanged, although merged triangle order differs.',
 'checks':checks,'count':len(checks),'allMatched':True}
(out/'final-render-equivalence.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'pairs':len(checks),'allMatched':True,'changedSources':list(changed)}))
