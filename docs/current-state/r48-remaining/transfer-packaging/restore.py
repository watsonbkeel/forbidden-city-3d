#!/usr/bin/env python3
"""Verify all transfer parts; optionally restore exact original paths in a selected directory."""
import argparse,base64,hashlib,json,pathlib,subprocess
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--output-root',type=pathlib.Path,help='Explicit reconstruction destination; omitted means verify only')
a=p.parse_args();root=pathlib.Path(__file__).resolve().parents[4]
index=json.loads(pathlib.Path(__file__).with_name('split-index.json').read_text())
for record in index['records']:
 chunks=[]
 for part in record['parts']:
  raw=(root/part['path']).read_bytes()
  assert len(raw)==part['bytes'] and hashlib.sha256(raw).hexdigest()==part['sha256'],part['path']
  decoded=base64.b64decode(raw.strip(),validate=True)
  assert len(decoded)==part['decodedBytes'],part['path']
  chunks.append(decoded)
 data=b''.join(chunks)
 assert len(data)==record['bytes'] and hashlib.sha256(data).hexdigest()==record['sha256'],record['path']
 assert hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()==record['gitBlob'],record['path']
 if a.output_root:
  target=a.output_root/record['path'];target.parent.mkdir(parents=True,exist_ok=True)
  if target.exists():assert target.read_bytes()==data, f'Refusing to overwrite different bytes: {target}'
  else:target.write_bytes(data)
 print('verified',record['path'],len(data))
print('All 10 original evidence objects verified; no original evidence bytes edited.')
