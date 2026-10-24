from pathlib import Path
import subprocess,os,json,time,re
P=Path(__file__).resolve().parents[2];R=P/'reports/r68-j-stage';out=R/'all-ningshou-portals-attempt3.tap';assert not out.exists()
cmd=['node','--expose-gc','--max-old-space-size=512','--test','--test-concurrency=1','--test-reporter=tap','tests/r48-ningshou-final-world.test.mjs'];start=time.time()
with out.open('w')as f:r=subprocess.run(cmd,cwd=P,env={**os.environ,'R48_ALL_NINGSHOU_PORTALS':'1'},stdout=f,stderr=subprocess.STDOUT)
s=out.read_text();tests=re.findall(r'^ok \d+ - R48 final-world (.*?) portal=(\d+):([^ ]+) fps=(\d+) sprint=(\w+) backward=(\w+)',s,re.M)
counts={n:sum(t[0]==n for t in tests)for n in sorted({t[0]for t in tests})}
(R/'AFFECTED-PORTALS.json').write_text(json.dumps({'command':cmd,'environment':{'R48_ALL_NINGSHOU_PORTALS':'1'},'exit':r.returncode,'seconds':time.time()-start,'passedByHost':counts,'totalPassed':len(tests),'scope':'Existing actual-world portal out/back movement, 10/60fps × walk/sprint × forwards/backwards, original collision/support/body-triangle assertions. Not new full interior inventories or GPU acceptance.'},ensure_ascii=False,indent=2)+'\n');print(json.dumps({'exit':r.returncode,'counts':counts},ensure_ascii=False));raise SystemExit(r.returncode)
