from pathlib import Path
from collections import Counter
import re,json,hashlib
E=Path(__file__).parent
parse=lambda p:Counter(re.findall(r'^(ok|not ok) \d+ - (.*)$',p.read_text(),re.M))
base=E/'batch-final-0920.tap';current=parse(base);assert sum(current.values())==513
files=json.loads((E/'dependent-rerun-files-0927.json').read_text());logs=['dependent-1-0927.tap','wenhua-bounded-final-0935.tap','dependent-3-0927.tap','instrument-bounded-final-0940.tap','dependent-5-0927.tap','dependent-6-0927.tap','dependent-7-0927.tap','dependent-8-0927.tap'];replacements=[]
for item,name in zip(files,logs):
 p=E/name;n=parse(p);assert n and all(status=='ok'for status,title in n),name
 titles={title for status,title in n}|{item['file']};removed=Counter({k:v for k,v in current.items()if k[1]in titles});assert sum(removed.values())==sum(n.values()),(name,removed,n)
 current.subtract(removed);current=+current;current.update(n)
 replacements.append({'file':item['file'],'log':name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'removedOriginalRecords':[{'status':k[0],'title':k[1],'count':v}for k,v in removed.items()],'newRecords':[{'status':k[0],'title':k[1],'count':v}for k,v in n.items()]})
assert sum(current.values())==513 and all(k[0]=='ok'for k in current)
p=E/'fingerprint-unit-green-0935.tap';new=parse(p);assert sum(new.values())==2 and not any(k in current for k in new);current.update(new)
first=parse(E/'batch-first-0914.tap');firstTitles=Counter({})
for (status,title),n in first.items():firstTitles[title]+=n
finalTitles=Counter()
for(status,title),n in current.items():finalTitles[title]+=n
assert sum(current.values())==515
report={'scope':'COMPOSITE_SAME_PRODUCTION_COVERAGE_NOT_A_SINGLE_GREEN_BATCH_COMMAND','productionCommit':'ed3784c8b94e071a9dae86199d60e380fe20e8bc','original84FileRound':{'log':base.name,'sha256':hashlib.sha256(base.read_bytes()).hexdigest(),'tests':513,'pass':510,'fail':3,'exitCode':1,'failures':'2 file-level SIGKILL placeholders plus 1 QA comparison-constructor TypeError'},'replacements':replacements,'newUnitFile':{'file':'tests/r159/physical-fingerprint.test.mjs','log':p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'tests':2},'effectiveUniqueFiles':85,'effectiveTopLevelTests':515,'effectivePassed':515,'effectiveFailed':0,'titleAdditionsFromFirst513':list((finalTitles-firstTitles).elements()),'titleRemovalsFromFirst513':list((firstTitles-finalTitles).elements()),'fullCurrentStateSeparately':{'tests':1313,'pass':1103,'fail':210,'allTitlesAndStatusesEqual453':True},'limits':['Original complete84 command remains exit1; no backdating or overwriting','Child15 original Jiaotai unit tests are not added again to top-level515','Production589 sources unchanged; later QA inputs explicitly frozen','Not GPU, whole-object acceptance, deployment or complete clean-clone reproduction']}
(E/'FINAL-COMPOSITE-COVERAGE-0942.json').write_text(json.dumps(report,indent=2)+'\n');print('COMPOSITE',report['effectiveUniqueFiles'],report['effectiveTopLevelTests'],report['effectivePassed'],'new titles',report['titleAdditionsFromFirst513'])
