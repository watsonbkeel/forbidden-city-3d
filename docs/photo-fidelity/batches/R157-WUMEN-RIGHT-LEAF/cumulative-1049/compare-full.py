from pathlib import Path
from collections import Counter
import re,json,hashlib
p=Path('/tmp/wumen-right-cumulative-1049');old=Path('/tmp/r159-cumulative-evidence-0854');names={'full-main':'full-main-0905','qinan':'qinan-0905','zhaode':'zhaode-0905'}
result={'scope':'ORIGINAL117_FILES_THREE_SEPARATE_COMMANDS_NOT_SINGLE_GREEN_RUN','logs':{},'baseline':{'tests':0,'pass':0,'fail':0,'cancelled':0},'candidate':{'tests':0,'pass':0,'fail':0,'cancelled':0}};before=Counter();after=Counter()
for new,base in names.items():
 rows={}
 for label,path in [('baseline',old/(base+'.tap')),('candidate',p/(new+'.tap'))]:
  text=path.read_text();counts={k:[int(v) for v in re.findall(r'^# '+k+r' (\d+)$',text,re.M)][-1] for k in ['tests','pass','fail','cancelled']};records=Counter(re.findall(r'^(ok|not ok) \d+ - (.*)$',text,re.M));assert sum(records.values())==counts['tests'],(path,counts,len(records));rows[label]={'path':str(path),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),**counts}
  for k,v in counts.items():result[label][k]+=v
  (before if label=='baseline' else after).update(records)
 result['logs'][new]=rows
result['addedStatusTitleRecords']=[{'status':k[0],'title':k[1],'count':v} for k,v in (after-before).items()];result['removedStatusTitleRecords']=[{'status':k[0],'title':k[1],'count':v} for k,v in (before-after).items()];result['sameStatusTitleMultiset']=before==after
(p/'full-comparison.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k!='logs'},indent=2))
