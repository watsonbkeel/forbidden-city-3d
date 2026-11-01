import pathlib,json,hashlib,subprocess,collections
W=pathlib.Path('/workspace/scratch/02a8023d1a85');R=W/'r157-wumen-joint-layout-1622';P=W/'wumen-joint-recovery-1607/upper-reassembly-2034/assembly-task3-0005';E=W/'independent-wumen-junctions-0022';H=lambda b:hashlib.sha256(b).hexdigest();f=json.loads((P/'freeze-0025.json').read_text());assert len(f['files'])==16
for k,h in f['files'].items():assert H((R/k).read_bytes())==h
for k,h in f['externalDrivers'].items():assert H((P/k).read_bytes())==h
man={}
for fn,n,roots in [('source-0025.json',600,['src','data']),('qa-0025.json',4430,['scripts','tests'])]:
 m=json.loads((P/fn).read_text())['files'];assert len(m)==n and set(m)=={str(p.relative_to(R)) for root in roots for p in (R/root).rglob('*') if p.is_file()}
 for k,h in m.items():assert H((R/k).read_bytes())==h
 man[fn]=m
assert not subprocess.check_output(['git','-C',str(R),'diff','HEAD','--','src','data','scripts','tests'])
headpaths=set(subprocess.check_output(['git','-C',str(R),'ls-tree','-r','--name-only','-z','HEAD']).decode().strip('\0').split('\0'));oldqa={p for p in headpaths if p.startswith(('scripts/','tests/'))};assert len(oldqa)==4428;added=set(man['qa-0025.json'])-oldqa;assert len(added)==2
for n in ['entities.ndjson','pairs.ndjson']:assert (P/'actual-0019'/n).read_bytes()==(P/'actual-final-0023'/n).read_bytes()
bound=json.loads((P/'actual-final-0023/construction-boundaries.json').read_text());verts={};beams={}
for line in (P/'actual-final-0023/entities.ndjson').open():
 e=json.loads(line);byroot=collections.defaultdict(set);beam=set()
 for t in e['triangles']:
  byroot[t['root']].update(tuple(v) for v in t['v'])
  if t['root']=='body' and 'beam' in t['meshName']:beam.update(tuple(v) for v in t['v'])
 verts[e['entityId']]=byroot;beams[e['entityId']]=beam
layers=[]
for x in bound['layers']:
 eid,layer=x['id'].rsplit('/',1);sets=[set(map(tuple,x[k])) for k in ['fan','bracketTop','soffit']];assert len(sets[0])==40 and sets[0]==sets[1]==sets[2];roots=['role/'+layer+'/fan','role/'+layer+'/bracket','surface/'+layer]
 for s,root in zip(sets,roots):assert s<=verts[eid][root]
 layers.append({'id':x['id'],'count':40,'setsExact':True,'actualTriangleVerticesContainAll':True})
beam=[]
for x in bound['bodyBeams']:
 rows=beams[x['id']];assert rows;bb=[[min(p[k] for p in rows) for k in range(3)],[max(p[k] for p in rows) for k in range(3)]];assert bb==x['beamBounds'];assert set(map(tuple,x['beamTopPoints']))<=rows;layer='single' if x['id'].startswith('FC-') else 'lower';assert set(map(tuple,x['bottomPoints']))<=verts[x['id']]['role/'+layer+'/bracket'];ys=[p[1]-bb[1][1] for p in x['bottomPoints']];assert ys==x['signedYResidual'];xr={'min':[min(p[k] for p in x['bottomPoints'])-bb[0][k] for k in [0,2]],'max':[max(p[k] for p in x['bottomPoints'])-bb[1][k] for k in [0,2]]};assert xr==x['xzEnvelopeResidual'];beam.append({'id':x['id'],'residuals':sorted(set(ys)),'xz':xr})
out={'head':subprocess.check_output(['git','-C',str(R),'rev-parse','HEAD']).decode().strip(),'files':f['files'],'driver':f['externalDrivers'],'source':600,'qa':4430,'priorQA':4428,'onlyAddedQA':sorted(added),'finalActualRowsIdenticalToInitial':True,'layers':layers,'beamSeams':beam,'scope':'independent exact membership/bounds audit of actual triangle records; not structural support'};(E/'final-freeze-boundary-audit.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({k:v for k,v in out.items() if k not in ['files','driver','layers']},indent=2))
