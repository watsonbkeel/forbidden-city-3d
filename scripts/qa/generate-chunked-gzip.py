#!/usr/bin/env python3
"""Generate deterministic, small text transport blocks; never replace the input."""
import argparse,base64,gzip,hashlib,json,pathlib,re
ap=argparse.ArgumentParser(description=__doc__)
ap.add_argument('--input',required=True,type=pathlib.Path)
ap.add_argument('--output',required=True,type=pathlib.Path,help='Separate empty staging directory')
a=ap.parse_args();source=a.input.resolve();out=a.output.resolve()
assert out!=source.parent and source.parent not in out.parents,'Use separate staging, not the source fixture directory'
assert not out.exists() or not any(out.iterdir()),'Output must be empty'
assert re.fullmatch(r'[A-Za-z0-9_.-]+\.gz',source.name),'Simple .gz filename required'
raw=source.read_bytes();assert 0<len(raw)<=64*1024*1024,'Input outside QA size bound'
plain=gzip.decompress(raw);assert len(plain)<=64*1024*1024,'Expanded input outside QA size bound'
sha=lambda b:hashlib.sha256(b).hexdigest()
out.mkdir(parents=True,exist_ok=True);rows=[];chunk_bytes=49152
for i,start in enumerate(range(0,len(raw),chunk_bytes)):
 b=raw[start:start+chunk_bytes];filename=f'{i:06d}.b64';text=base64.b64encode(b)+b'\n';(out/filename).write_bytes(text)
 rows.append({'index':i,'filename':filename,'bytes':len(b),'sha256':sha(b),'textSHA256':sha(text)})
m={'format':1,'filename':source.name,'originalGitBlobSHA1':hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest(),'compressedBytes':len(raw),'compressedSHA256':sha(raw),'uncompressedBytes':len(plain),'uncompressedSHA256':sha(plain),'chunkBytes':chunk_bytes,'chunks':rows}
b=(json.dumps(m,indent=2)+'\n').encode();(out/'manifest.json').write_bytes(b);(out/'.gitattributes').write_text('*.json -text\n*.b64 -text\n')
pin={k:v for k,v in m.items() if k!='chunks'};pin.update(manifestSHA256=sha(b),chunkCount=len(rows))
print(json.dumps(pin,indent=2))
