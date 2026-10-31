from pathlib import Path
from collections import Counter
import re,json,hashlib,sys
p=Path(__file__).resolve().parent; candidate=sys.argv[1]; baseline=sys.argv[2];out=p/sys.argv[3]
if out.exists():raise SystemExit('Refuse overwrite')
a=Counter();b=Counter();result={'scope':'FRESH_RECOVERY_ENVIRONMENT_THREE_COMMANDS_EACH_NOT_OLD_LOG_RECOVERY','logs':{},'candidate':Counter(),'baseline':Counter()}
for name in ['full-main','qinan','zhaode']:
 result['logs'][name]={}
 for label,pat,counter in [('candidate',candidate,a),('baseline',baseline,b)]:
  f=p/(pat.replace('{name}',name)+'.tap');s=f.read_text();counts={k:int(re.findall(r'^# '+k+r' (\d+)$',s,re.M)[-1]) for k in ['tests','pass','fail','cancelled','skipped']};records=Counter(re.findall(r'^(ok|not ok) \d+ - (.*)$',s,re.M));assert sum(records.values())==counts['tests'];counter.update(records);result[label].update(counts);result['logs'][name][label]={'path':f.name,'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),**counts}
result['sameStatusTitleMultiset']=a==b
for name,rows in [('added',a-b),('removed',b-a),('candidateCounter',a),('baselineCounter',b)]:result[name]=[{'status':k[0],'title':k[1],'count':v} for k,v in sorted(rows.items())]
out.write_text(json.dumps(result,indent=2)+'\n');print({k:result[k] for k in ['candidate','baseline','sameStatusTitleMultiset','added','removed']})
