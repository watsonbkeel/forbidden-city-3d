from pathlib import Path
from collections import Counter
import re,json,hashlib
p=Path(__file__).resolve().parent;old=p.parent/'wumen-main-width-evidence'
def parse(f):
 s=f.read_text();c={k:int(re.findall(r'^# '+k+r' (\d+)$',s,re.M)[-1]) for k in ['tests','pass','fail','cancelled','skipped']};r=Counter(re.findall(r'^(ok|not ok) \d+ - (.*)$',s,re.M));assert sum(r.values())==c['tests'];return r,{'path':str(f),'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),**c}
def serial(c):return [{'status':k[0],'title':k[1],'count':v} for k,v in sorted(c.items())]
def compare(kind,pairs):
 a=Counter();b=Counter();o={'scope':kind,'logs':[],'candidate':Counter(),'predecessor':Counter()}
 for fa,fb in pairs:
  aa,am=parse(fa);bb,bm=parse(fb);a.update(aa);b.update(bb);o['logs'].append({'candidate':am,'predecessor':bm})
  for key in ['tests','pass','fail','cancelled','skipped']:o['candidate'][key]+=am[key];o['predecessor'][key]+=bm[key]
 o.update({'sameStatusTitleMultiset':a==b,'added':serial(a-b),'removed':serial(b-a),'candidateCounter':serial(a),'predecessorCounter':serial(b)})
 dest=p/(kind+'-comparison.json');assert not dest.exists();dest.write_text(json.dumps(o,indent=2)+'\n');print(kind,{k:o[k] for k in ['candidate','predecessor','sameStatusTitleMultiset']},'delta',sum((a-b).values()),sum((b-a).values()))
if not (p/'full-comparison.json').exists():compare('full',[(p/(name+'-1407.tap'),old/('candidate-materialized-'+name+'-1224.tap')) for name in ['full-main','qinan','zhaode']])
if (p/'batch-1407.resource.json').exists() and not (p/'batch-comparison.json').exists():compare('batch',[(p/'batch-1407.tap',old/'batch-1224.tap')])
