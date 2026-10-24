from pathlib import Path
import gzip,hashlib,json,sys
P=Path(__file__).resolve().parents[2];r=json.loads((P/'reports/r66-h-stage/raw-logs-index.json').read_text());out=Path(sys.argv[1])if len(sys.argv)>1 else None;sha=lambda b:hashlib.sha256(b).hexdigest()
for row in r['files']:
 data=(P/row['stored']).read_bytes();raw=gzip.decompress(data)
 assert sha(data)==row['gzipSHA256'] and len(raw)==row['bytes'] and sha(raw)==row['sha256'],row
 if out:
  rel=Path(row['original']);assert not rel.is_absolute() and '..'not in rel.parts
  p=out/rel;assert not p.exists(),'Refuse overwrite '+str(p);p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(raw)
print('PASS:',len(r['files']),'exact byte-stream restorations; no expected data regenerated.')
