#!/usr/bin/env python3
import pathlib,re,collections,subprocess,json,hashlib,datetime,sys
r=pathlib.Path(sys.argv[1]).resolve();o=pathlib.Path(sys.argv[2]).resolve();o.mkdir(exist_ok=True)
baseline=r.parent/'r119-jiaotai-room/reports/r119-jiaotai/current-state-all.tap';current=r/'reports/r120-validation/current-state-all.tap'
old=baseline.read_text();new=current.read_text();fails=lambda s:collections.Counter(re.findall(r'^not ok \d+ - (.+)$',s,re.M));a,b=fails(old),fails(new);added=list((b-a).elements());removed=list((a-b).elements());assert len(added)==7 and not removed
blocks=re.split(r'(?=^# Subtest:)',new,flags=re.M);selected=[]
for name in added:
 block=next(v for v in blocks if re.search(r'^not ok \d+ - '+re.escape(name)+r'$',v,re.M));assert "name: 'AssertionError'"in block and "code: 'ERR_ASSERTION'"in block;assert 'TypeError'not in block
 selected.append({'name':name,'block':block,'classification':'approved-art source epoch/byte identity lock, not executed runtime TypeError'})
(o/'seven-added-failures.tap').write_text(''.join(v['block']for v in selected))
files=['tests/current-state/r32-followthrough-source-retention.test.mjs','tests/current-state/r32-frieze-source-retention.test.mjs','tests/current-state/r32-screen-source-retention.test.mjs','tests/current-state/r32-source-retention.test.mjs','tests/lib/r32-followthrough-source-retention.mjs','tests/lib/r32-frieze-source-retention.mjs','tests/lib/r32-screen-source-retention.mjs','tests/lib/r32-source-retention.mjs']
for p in [*r.glob('tests/fixtures/r32*source*json')]:files.append(str(p.relative_to(r)))
sha=lambda b:hashlib.sha256(b).hexdigest();unchanged={}
for f in files:
 actual=(r/f).read_bytes();past=subprocess.check_output(['git','-C',str(r),'show','7743ab31b5bfe022b8ebc389ca9faaee7a9ff1da:'+f]);assert actual==past;unchanged[f]=sha(actual)
alltests=sorted(r.glob('tests/current-state/*.test.mjs'));assert len(alltests)==112
for p in alltests:assert p.read_bytes()==subprocess.check_output(['git','-C',str(r),'show','7743ab31b5bfe022b8ebc389ca9faaee7a9ff1da:'+str(p.relative_to(r))])
products={}
for f in ['src/scene/palace/QianqingCentralArt.js','src/scene/palace/QianqingCeiling.js']:
 actual=(r/f).read_bytes();past=subprocess.check_output(['git','-C',str(r),'show','7743ab31b5bfe022b8ebc389ca9faaee7a9ff1da:'+f]);products[f]={'currentSHA256':sha(actual),'currentBytes':len(actual),'r119SHA256':sha(past),'r119Bytes':len(past)}
diff=subprocess.check_output(['git','-C',str(r),'diff','7743ab31b5bfe022b8ebc389ca9faaee7a9ff1da','--',*products]).decode();(o/'two-approved-art-source.diff').write_text(diff)
result={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Read existing terminal raw, unchanged test/helper/fixture bytes and actual source diff; no test rerun/world construction.','baselineSummary':re.findall(r'^# (?:tests|pass|fail|cancelled|skipped).*$',old,re.M),'currentSummary':re.findall(r'^# (?:tests|pass|fail|cancelled|skipped).*$',new,re.M),'baselineFailures':sum(a.values()),'currentFailures':sum(b.values()),'added':added,'removed':removed,'allSevenAssertionErrors':True,'allSevenAtSourceIdentityGuards':True,'newTypeErrorAmongAddedFailures':False,'all112CurrentStateTestsByteExactR119':True,'unchangedGateFiles':unchanged,'products':products,'raw':{'baseline':{'path':str(baseline),'sha256':sha(baseline.read_bytes())},'current':{'path':str(current),'sha256':sha(current.read_bytes())}},'scriptSHA256':sha(pathlib.Path(__file__).read_bytes()),'limits':['Seven newly failing source locks remain failures; no historical expected changed or broad bypass added.','188 inherited failures remain unresolved. Matching failure-name counts do not prove their internal causes unchanged.','These source identity assertions fail before actual runtime creation; they are not evidence that arbitrary runtime code has no TypeError.']}
(o/'failure-review.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:result[k]for k in ['baselineSummary','currentSummary','added','removed','allSevenAssertionErrors','newTypeErrorAmongAddedFailures','all112CurrentStateTestsByteExactR119']},ensure_ascii=False,indent=2))
