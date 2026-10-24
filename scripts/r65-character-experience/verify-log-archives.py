from pathlib import Path
import json,gzip,hashlib,sys
P=Path(__file__).resolve().parents[2];r=json.loads((P/'reports/r65-character-experience/LOG-ARCHIVES.json').read_text());destination=Path(sys.argv[1]) if len(sys.argv)>1 else None
for f in r['files']:
 compressed=(P/f['archivePath']).read_bytes();raw=gzip.decompress(compressed)
 assert hashlib.sha256(compressed).hexdigest()==f['gzipSHA256']
 assert len(raw)==f['originalBytes'] and hashlib.sha256(raw).hexdigest()==f['originalSHA256']
 if destination:
  rel=Path(f['originalPath']);assert not rel.is_absolute() and '..' not in rel.parts
  target=destination/rel;assert not target.exists(),'Refuse to overwrite '+str(target);target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(raw)
print('Verified exact restoration of',len(r['files']),'archived original log byte streams.')
