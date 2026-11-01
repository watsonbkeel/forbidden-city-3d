#!/usr/bin/env python3
import pathlib,subprocess,json,hashlib,base64
import argparse
ap=argparse.ArgumentParser(description='Generate QA-only original-Git-identity source snapshots into a separate empty staging directory.');ap.add_argument('--repo',required=True);ap.add_argument('--output',required=True);args=ap.parse_args();repo=str(pathlib.Path(args.repo).resolve());stage=pathlib.Path(args.output).resolve();assert stage!=pathlib.Path(repo) and pathlib.Path(repo) not in stage.parents, 'Use a separate staging directory';assert not stage.exists() or not any(stage.iterdir()), 'Staging directory must be empty';out=stage/'tests/fixtures/r157-frozen-sources';out.mkdir(parents=True,exist_ok=True);(out/'blobs').mkdir(exist_ok=True)
g=lambda *x:subprocess.check_output(['git','-C',repo,*x]);commits=['929e346745b7295ad1aae0caa581e8cdf22723ff','4d614c22a8318027e51e149e435a3198f78ca4e5','ebd5d0494bc2eedcd8983dcb7669d4c7e8f121d2'];aliases={'0027a133':'0027a133f5e4c79cc5865061decb24d1901cec4b','d874222f':'d874222f0bb587e308e53e04e75b931996a1f1e5','d70a4a02':'d70a4a027fd5624b2becdbebb287d2f9868a6c21','0ab13818':'0ab13818d5885814c4fede04b0fffc460d93f983'};primary=set(commits);commits+=list(aliases.values());pins={};unique={}
for c in commits:
 raw=g('cat-file','commit',c);root=raw.splitlines()[0].split()[1].decode();trees={root:base64.b64encode(g('cat-file','tree',root)).decode()};files={}
 for row in g('ls-tree','-rz','-t',c,'src','data').split(b'\0'):
  if not row:continue
  meta,path=row.split(b'\t');mode,typ,sha=meta.decode().split();path=path.decode();d=g('cat-file',typ,sha)
  if typ=='tree':trees[sha]=base64.b64encode(d).decode();continue
  assert typ=='blob' and mode=='100644' and path.endswith(('.js','.mjs','.json','.md')),path

  if c not in primary and path!='src/scene/PalaceBuilder.js':continue
  d.decode('utf8');files[path]={'gitBlobSha':sha,'sha256':hashlib.sha256(d).hexdigest(),'bytes':len(d)};unique[sha]=d;(out/'blobs'/f'{sha}.txt').write_bytes(d)
 obj={'format':1,'originalCommit':c,'originalCommitObjectBase64':base64.b64encode(raw).decode(),'originalRootTree':root,'scope':['src/','data/'],'treesBase64':trees,'files':files};b=(json.dumps(obj,sort_keys=True,indent=2)+'\n').encode();(out/f'{c}.json').write_bytes(b);pins[c]=hashlib.sha256(b).hexdigest()
(stage/'tests/lib').mkdir(parents=True,exist_ok=True)
(stage/'tests/lib/r157-frozen-source-pins.mjs').write_text('// Generated from original Git objects; these identities require explicit review to change.\nexport const R157_FROZEN_SOURCE_PINS=Object.freeze('+json.dumps(pins,indent=2)+');\nexport const R157_FROZEN_SOURCE_ALIASES=Object.freeze('+json.dumps(aliases,indent=2)+');\n')
print('snapshots',len(commits),'unique blobs',len(unique),'bytes',sum(map(len,unique.values())))
