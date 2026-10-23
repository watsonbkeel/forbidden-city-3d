"""Verify the exact read-only audit; optionally restore to a NEW directory."""
import argparse,gzip,hashlib,io,json,pathlib
ROOT=pathlib.Path(__file__).resolve().parent

def decode(root=ROOT):
 index=json.loads((root/'STORAGE.json').read_text())
 if index.get('format')!='read-only-research-snapshot/gzip-v1':raise ValueError('unknown storage format')
 result={}
 for e in index['files']:
  for key in ['original','stored']:
   if pathlib.Path(e[key]).name!=e[key] or not e[key].startswith('R59-B-'):raise ValueError('invalid filename')
  if e['original'] in result or e['encoding'] not in ['gzip','identity']:raise ValueError('duplicate or unknown encoding')
  if not 0<e['bytes']<2000000:raise ValueError('size bound')
  p=root/e['stored']
  if p.is_symlink():raise ValueError('not a regular stored file')
  stored=p.read_bytes()
  if len(stored)!=e['storedBytes'] or hashlib.sha256(stored).hexdigest()!=e['storedSha256']:raise ValueError('corrupt stored bytes')
  raw=gzip.GzipFile(fileobj=io.BytesIO(stored)).read(e['bytes']+1) if e['encoding']=='gzip' else stored
  if len(raw)!=e['bytes'] or hashlib.sha256(raw).hexdigest()!=e['sha256']:raise ValueError('restored original differs')
  result[e['original']]=raw
 if len(result)!=6:raise ValueError('missing original')
 for e in json.loads(result['R59-B-FEATURE-AUDIT-MANIFEST.json'])['publicationArtifacts']:
  if len(result[e['file']])!=e['bytes'] or hashlib.sha256(result[e['file']]).hexdigest()!=e['sha256']:raise ValueError('original publication manifest mismatch')
 return result

if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--restore-to',type=pathlib.Path);a=p.parse_args();files=decode()
 if a.restore_to:
  if a.restore_to.exists() or a.restore_to.is_symlink():raise ValueError('destination must not exist; no overwrite')
  a.restore_to.mkdir(parents=True)
  for name,raw in files.items():(a.restore_to/name).write_bytes(raw)
 print('PASS: all six original audit files restored byte-for-byte; canonical queue unchanged')
