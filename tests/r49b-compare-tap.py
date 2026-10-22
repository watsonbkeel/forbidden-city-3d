"""Compare exact file/test identities; preserve full diagnostics, never turn red tests green."""
import gzip,json,re,sys,pathlib,hashlib

def read(p):return gzip.open(p,'rt').read()if str(p).endswith('.gz')else pathlib.Path(p).read_text()
def parse(p):
 text=read(p);lines=text.splitlines();fail=[]
 for i,line in enumerate(lines):
  m=re.match(r'^not ok \d+ - (.*)$',line)
  if not m:continue
  block=[]
  for nxt in lines[i+1:]:
   if nxt=='  ...':block.append(nxt);break
   if nxt.startswith('# Subtest:')or re.match(r'^(?:not )?ok \d+',nxt):break
   block.append(nxt)
  diagnostic='\n'.join(block);loc=re.search(r"location: ['\"]?(?:file://)?[^\n]*?(/?tests/[^'\"\n]+?\.(?:mjs|cjs|js))(?::\d+)*['\"]?\n",diagnostic)
  file=loc.group(1).lstrip('/')if loc else next(iter(re.findall(r'tests/[^\s\'\"]+?\.(?:mjs|cjs|js)',diagnostic)),None)
  if not file and m.group(1).startswith('tests/'):file=m.group(1)
  fail.append({'file':file,'test':m.group(1),'diagnostic':diagnostic,'diagnosticHash':hashlib.sha256(re.sub(r'/workspace/scratch/[^/]+/[^/]+','ROOT',diagnostic).encode()).hexdigest()})
 summary={k:float(v)if'.'in v else int(v)for k,v in re.findall(r'^# (tests|suites|pass|fail|cancelled|skipped|todo|duration_ms) ([\d.]+)$',text,re.M)}
 return {'path':str(p),'rawSha256':hashlib.sha256(text.encode()).hexdigest(),'summary':summary,'failures':fail}
b=parse(sys.argv[1]);c=parse(sys.argv[2]);key=lambda r:(r['file'],r['test']);B={key(r):r for r in b['failures']};C={key(r):r for r in c['failures']};result={'baseline':b,'candidate':c,'newFailureIdentities':[r for k,r in C.items()if k not in B],'baselineFailureIdentitiesNotRepeated':[r for k,r in B.items()if k not in C],'repeatedFailureCount':len(B.keys()&C.keys()),'changedRepeatedDiagnostics':[{'baseline':B[k],'candidate':C[k]}for k in B.keys()&C.keys()if B[k]['diagnosticHash']!=C[k]['diagnosticHash']]};json.dump(result,open(sys.argv[3],'w'),ensure_ascii=False,indent=2);print('baseline',b['summary'],'candidate',c['summary'],'new',len(result['newFailureIdentities']),'repeated',result['repeatedFailureCount'],'notRepeated',len(result['baselineFailureIdentitiesNotRepeated']));
for i,r in enumerate(result['newFailureIdentities']):print(i,r['file'],r['test'])
