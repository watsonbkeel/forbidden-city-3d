import unittest,importlib.util,copy,json,subprocess,sys,tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
def auditor():
 p=ROOT/'scripts/qa/semantic_mesh_preflight.py'
 assert p.exists(),'preflight auditor missing'
 s=importlib.util.spec_from_file_location('audit',p);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m.preflight

def cube():
 v=[[-.5,.795,-.2],[.5,.795,-.2],[.5,.995,-.2],[-.5,.995,-.2],[-.5,.795,.2],[.5,.795,.2],[.5,.995,.2],[-.5,.995,.2]]
 quads=[[0,3,2,1],[4,5,6,7],[0,1,5,4],[3,7,6,2],[0,4,7,3],[1,2,6,5]]
 return {'positions':[x for p in v for x in p],'indices':[x for a,b,c,d in quads for x in [a,b,c,a,c,d]]}
class Tests(unittest.TestCase):
 def test_valid_closed_support_only_not_art_acceptance(self):
  r=auditor()(cube());self.assertTrue(r['passed']);self.assertEqual(r['artAcceptance'],'NOT_TESTED');self.assertEqual(r['selfIntersection'],'NOT_TESTED');self.assertEqual(len(r['supports']),5)
 def test_open_duplicate_reversed_and_degenerate_reject(self):
  f=auditor()
  for change in ['open','duplicate','reversed','degenerate']:
   d=cube()
   if change=='open':d['indices']=d['indices'][:-3]
   if change=='duplicate':d['indices']+=d['indices'][:3]
   if change=='reversed':d['indices'][0:3]=d['indices'][0:3][::-1]
   if change=='degenerate':d['indices'][0]=d['indices'][1]
   self.assertFalse(f(d)['passed'],change)
 def test_bad_input_rejects_without_indexing_or_allocation(self):
  f=auditor()
  for key,value in [('positions',[float('nan'),0,0]),('positions',[True,0,0]),('positions',[0,1]),('indices',[0,1,999]),('indices',[0,1,2.0]),('indices',[0,1])]:
   d=cube();d[key]=value;self.assertFalse(f(d)['passed'])
 def test_real_support_rays_not_global_minimum(self):
  f=auditor();d=cube();d['positions']=[x+.02 if i%3==1 else x for i,x in enumerate(d['positions'])];r=f(d);self.assertFalse(r['passed']);self.assertTrue(all(q['gap']>.001 for q in r['supports']))
 def test_huge_integer_is_rejected_not_exception(self):
  d=cube();d["positions"][0]=10**400;self.assertFalse(auditor()(d)["passed"])
 def test_disconnected_and_inward_rejected(self):
  d=cube();d["indices"]=[q for i in range(0,len(d["indices"]),3) for q in d["indices"][i:i+3][::-1]];self.assertFalse(auditor()(d)["passed"])
  d=cube();e=cube();n=len(d["positions"])//3;d["positions"]+=e["positions"];d["indices"] += [i+n for i in e["indices"]];r=auditor()(d);self.assertFalse(r["passed"]);self.assertEqual(r["components"],2)
 def test_buried_bottom_cannot_pass_as_top_support(self):
  d=cube();d['positions']=[(-.1 if x==.795 else .795 if x==.995 else x)if i%3==1 else x for i,x in enumerate(d['positions'])];self.assertFalse(auditor()(d)['passed'])
 def test_vertex_pinched_shell_rejected(self):
  a=cube();b=cube();vv=[b['positions'][i:i+3]for i in range(0,len(b['positions']),3)];mapping={0:6}
  for j,v in enumerate(vv):
   if j==0:continue
   mapping[j]=len(a['positions'])//3;a['positions']+= [v[0]+1,v[1]+.2,v[2]+.4]
  a['indices'] += [mapping[i] for i in b['indices']];self.assertFalse(auditor()(a)['passed'])
 def test_cli_rejects_huge_integer_and_deep_json(self):
  d=cube();d['positions'][0]=10**400
  for payload in [json.dumps(d),'['*2000+'0'+']'*2000]:
   with tempfile.NamedTemporaryFile(mode='w',suffix='.json') as fp:
    fp.write(payload);fp.flush();r=subprocess.run([sys.executable,str(ROOT/'scripts/qa/semantic_mesh_preflight.py'),fp.name],capture_output=True,text=True)
    self.assertIn(r.returncode,[1,2]);self.assertFalse(json.loads(r.stdout)['passed']);self.assertNotIn('Traceback',r.stderr)
 def test_triangle_budget(self):
  d=cube();d['indices']*=1000;self.assertFalse(auditor()(d)['passed'])
if __name__=='__main__':unittest.main()
