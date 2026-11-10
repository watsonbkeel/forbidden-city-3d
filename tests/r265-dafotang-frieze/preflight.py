if not __debug__:
 raise RuntimeError('Python optimization is not permitted for input checks')
import resource
resource.setrlimit(resource.RLIMIT_AS,(128*1024**2,128*1024**2))
from pathlib import Path
import os,json,hashlib
base=Path(__file__).resolve().parent
repo=base.parents[1]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
for k in ('R265_REPO','R265_BASELINE','NODE_OPTIONS','NODE_PATH'):
 assert not os.environ.get(k),'Forbidden source/loader override: '+k
assert sha(base/'pins.json')=='899f8415239eac6091196083562f6d1f86551798819746fa985ce5713faf4761', 'Frozen pins changed'
pins=json.loads((base/'pins.json').read_text())
assert pins['productSha256']=='e83fac03379d5288bbf47bffcb1c696dfd84ff016f5f8a1ea43d8a34d252ea1d'
assert pins['r264Sha256']=='b4a8363eaa7f74fa11638aeeef5f660dcb45bb1268117a75d633035209c2cfeb'
assert sha(repo/pins['productPath'])==pins['productSha256']
for path,h in {**pins['unchangedSources'],**pins['runtimeFiles']}.items():
 assert sha(repo/path)==h, 'Frozen input changed: '+path
for name,h in pins['fixtures'].items():
 assert '/'not in name and name not in ('.','..')
 assert sha(base/'fixtures'/name)==h, 'Frozen fixture changed: '+name
assert pins['productSha256']!=sha(base/'fixtures/r264-layout.js.txt')
print(json.dumps({'status':'PASS_PINNED_PORTABLE_INPUTS','product':pins['productSha256'],'fixtures':len(pins['fixtures']),'runtimeFiles':len(pins['runtimeFiles']),'unchangedSources':len(pins['unchangedSources'])},indent=2))
