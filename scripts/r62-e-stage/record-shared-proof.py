from pathlib import Path
import subprocess,json,difflib,hashlib
P=Path(__file__).resolve().parents[2];base='6b396800b6a03582aebf513fcef4966e9f5d0db3';paths=['src/scene/zones/ZoneBase.js','src/scene/palace/special/EastResidentialFacades.js','src/scene/palace/HallNameboardMount.js','src/scene/palace/special/SourceGuidedNameboardMounts.js','data/zones/east-six.json'];rows=[]
sha=lambda b:hashlib.sha256(b.encode()).hexdigest()
for path in paths:
 old=subprocess.check_output(['git','show',base+':'+path],cwd=P,text=True);new=(P/path).read_text();a=old.splitlines(keepends=True);b=new.splitlines(keepends=True);edits=[]
 for group in difflib.SequenceMatcher(None,a,b).get_grouped_opcodes(3):
  i0,i1=group[0][1],group[-1][2];j0,j1=group[0][3],group[-1][4];before=''.join(a[i0:i1]);after=''.join(b[j0:j1]);assert new.count(after)==1,(path,after);edits.append([after,before])
 restored=new
 for after,before in edits:restored=restored.replace(after,before,1)
 assert restored==old
 rows.append({'path':path,'beforeSha256':sha(old),'afterSha256':sha(new),'inverseLiteralEdits':edits})
(P/'tests/fixtures/r62-e/cumulative-shared-hook-proof.json').write_text(json.dumps({'base':base,'scope':'Explicit bounded E dispatch/metadata/nameboard and front declaration; exact inverse retains every other byte. Not model/browser acceptance.','files':rows},ensure_ascii=False,indent=2)+'\n')
print(len(rows))
