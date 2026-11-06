import unittest,copy,json,base64,hashlib
from approval_gate import validate_run,canonical_receipt,await_admission,git_blob_sha
from preflight import verify_admission
C={'repository':'o/r','branch':'dev/one','workflow':'.github/workflows/one.yml','base':'b'*40,'base_tree':'c'*40,'release_blob_sha':'d'*40,'node_mib':768,'non_node_mib':256,'aggregate_seconds':180,'window_number':2,'run_number':2,'workflow_id':19,'prior_run':{'id':16,'head_sha':'c'*40,'run_number':1,'run_attempt':1}}
R={'id':17,'workflow_id':19,'head_sha':'a'*40,'head_branch':'dev/one','run_number':2,'run_attempt':1,'event':'push','path':C['workflow'],'status':'in_progress','conclusion':None,'created_at':'2026-11-05T21:00:00Z','repository':{'full_name':'o/r'},'head_repository':{'full_name':'o/r'}}
PREV={**R,'id':16,'head_sha':'c'*40,'run_number':1,'status':'completed','conclusion':'failure'}
E={'GITHUB_REPOSITORY':'o/r','GITHUB_REF':'refs/heads/dev/one','GITHUB_SHA':'a'*40,'GITHUB_RUN_ID':'17','GITHUB_RUN_NUMBER':'2','GITHUB_RUN_ATTEMPT':'1','GITHUB_EVENT_NAME':'push','DIAGNOSTIC_TREE':'e'*40,'FREEZE_SHA256':'f'*64}
W={'id':19,'path':C['workflow']};L={'total_count':2,'workflow_runs':[R,PREV]};J={'total_count':0,'jobs':[]}
class WindowTwo(unittest.TestCase):
 def valid(self,r=R,c=C,l=L,j=J):return validate_run(r,E,c,W,l,1793912401,prior_jobs=j)
 def test_exact_second_window_preserves_first_failure(self):
  self.assertTrue(self.valid());q=json.loads(canonical_receipt(R,E,C));self.assertEqual(q['window_number'],2);self.assertEqual(q['run_number'],2);self.assertEqual(q['prior_run_id'],16)
 def test_wrong_ordinal_workflow_or_extra_run_rejected(self):
  for key,value in [('run_number',1),('run_number',3),('run_attempt',2),('workflow_id',20)]:
   with self.assertRaises(ValueError):self.valid(r={**R,key:value})
  with self.assertRaises(ValueError):self.valid(l={'total_count':3,'workflow_runs':[R,PREV,PREV]})
 def test_prior_identity_failure_and_no_jobs_are_required(self):
  for key,value in [('id',999),('head_sha','0'*40),('run_number',2),('run_attempt',2),('workflow_id',20),('conclusion','success'),('status','in_progress'),('event','workflow_dispatch')]:
   with self.subTest(key=key),self.assertRaises(ValueError):self.valid(l={'total_count':2,'workflow_runs':[R,{**PREV,key:value}]})
  for jobs in [None,{}, {'total_count':1,'jobs':[{}]}, {'total_count':0,'jobs':[{}]}, {'total_count':False,'jobs':[]}]:
   with self.assertRaises(ValueError):self.valid(j=jobs)
 def test_current_listing_and_detail_must_agree(self):
  with self.assertRaises(ValueError):self.valid(l={'total_count':2,'workflow_runs':[{**R,'head_sha':'0'*40},PREV]})
 def test_every_listed_numeric_identity_requires_positive_integer(self):
  for index in [0,1]:
   for key in ['id','workflow_id','run_number','run_attempt']:
    for value in [float(L['workflow_runs'][index][key]),True,0,-1]:
     listing=copy.deepcopy(L);listing['workflow_runs'][index][key]=value
     with self.subTest(index=index,key=key,value=value),self.assertRaises(ValueError):self.valid(l=listing)
 def test_whole_second_window_admission_rechecks_prior_jobs(self):
  nonce=b'7'*64+b'\n';c={**C,'release_blob_sha':git_blob_sha(nonce),'poll_seconds':30};receipt=canonical_receipt(R,E,c);reads=[]
  def blob(b):return {'sha':git_blob_sha(b),'encoding':'base64','size':len(b),'content':base64.b64encode(b).decode()}
  class Client:
   def __init__(self):self.reads=reads
   def get(self,path,**kwargs):
    reads.append(path)
    return {'actions/runs/17':R,'actions/workflows/19':W,'actions/workflows/19/runs?per_page=100':L,'actions/runs/16/jobs?per_page=100':J,'git/blobs/'+c['release_blob_sha']:blob(nonce),'git/blobs/'+git_blob_sha(receipt):blob(receipt)}[path]
  admission=await_admission(Client(),E,c,now=lambda:1793912401,sleep=lambda n:None,deadline=1793912500);self.assertTrue(verify_admission(admission,E,c,1793912402));self.assertEqual(reads.count('actions/runs/16/jobs?per_page=100'),2);self.assertEqual(admission['priorWindow']['run']['id'],16)
  admission['priorWindow']['jobs']={'total_count':1,'jobs':[{}]}
  with self.assertRaises(ValueError):verify_admission(admission,E,c,1793912402)
if __name__=='__main__':unittest.main()
