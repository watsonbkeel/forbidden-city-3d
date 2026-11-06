import unittest,json,hashlib,base64,copy,io,urllib.error,time
from unittest.mock import patch
from approval_gate import canonical_receipt,validate_run,verify_blob,await_admission,git_blob_sha,PublicGitHub
C={'repository':'o/r','branch':'dev/one','workflow':'.github/workflows/one.yml','base':'b'*40,'base_tree':'c'*40,'release_blob_sha':'d'*40,'node_mib':768,'non_node_mib':256,'aggregate_seconds':180,'window_number':1,'run_number':1,'workflow_id':19,'prior_run':None}
R={'id':17,'workflow_id':19,'head_sha':'a'*40,'head_branch':'dev/one','run_number':1,'run_attempt':1,'event':'push','path':C['workflow'],'status':'in_progress','conclusion':None,'created_at':'2026-11-05T21:00:00Z','repository':{'full_name':'o/r'},'head_repository':{'full_name':'o/r'}}
E={'GITHUB_REPOSITORY':'o/r','GITHUB_REF':'refs/heads/dev/one','GITHUB_SHA':'a'*40,'GITHUB_RUN_ID':'17','GITHUB_RUN_NUMBER':'1','GITHUB_RUN_ATTEMPT':'1','GITHUB_EVENT_NAME':'push','DIAGNOSTIC_TREE':'e'*40,'FREEZE_SHA256':'f'*64}
W={'id':19,'path':C['workflow']};L={'total_count':1,'workflow_runs':[R]}
class Gate(unittest.TestCase):
 def test_valid_run_and_deterministic_receipt(self):
  self.assertTrue(validate_run(R,E,C,W,L,1793912401));a=canonical_receipt(R,E,C);self.assertIsInstance(a,bytes);self.assertEqual(a,canonical_receipt(copy.deepcopy(R),dict(reversed(list(E.items()))),C));j=json.loads(a);self.assertEqual(j['run_id'],17);self.assertEqual(j['expires_at'],'2026-11-05T21:30:00Z');self.assertEqual(j['diagnostic_commit'],'a'*40);self.assertEqual(j['release_blob_sha'],'d'*40)
 def test_changed_fields_rejected(self):
  for key,value in [('id',18),('head_sha','0'*40),('workflow_id',20),('head_branch','main'),('run_number',2),('run_attempt',2),('event','pull_request'),('path','x'),('status','completed'),('conclusion','success')]:
   with self.subTest(key=key):
    r={**R,key:value}
    with self.assertRaises(ValueError):validate_run(r,E,C,W,L,1793912401)
 def test_repository_and_fork_rejected(self):
  for key in ('repository','head_repository'):
   with self.assertRaises(ValueError):validate_run({**R,key:{'full_name':'evil/fork'}},E,C,W,L,1793912401)
 def test_multiple_or_incomplete_runs_rejected(self):
  for l in [{'total_count':2,'workflow_runs':[R]}, {'total_count':1,'workflow_runs':[]}, {'total_count':2,'workflow_runs':[R,R]}]:
   with self.assertRaises(ValueError):validate_run(R,E,C,W,l,1793912401)
 def test_expired_or_future_rejected(self):
  for t in [1793912400-1,1793914200]:
   with self.assertRaises(ValueError):validate_run(R,E,C,W,L,t)
 def test_blob_content_and_git_identity(self):
  raw=b'hello\n';sha=hashlib.sha1(b'blob 6\0'+raw).hexdigest();b={'sha':sha,'encoding':'base64','size':6,'content':base64.b64encode(raw).decode()}
  self.assertEqual(verify_blob(b,raw,sha),raw)
  for x in [{**b,'sha':'0'*40},{**b,'size':7},{**b,'content':base64.b64encode(b'wrong\n').decode()},{**b,'encoding':'utf-8'}]:
   with self.assertRaises(ValueError):verify_blob(x,raw,sha)
 def test_release_preimage_verified_without_known_body(self):
  raw=b'7'*64+b'\n';sha=hashlib.sha1(b'blob 65\0'+raw).hexdigest();b={'sha':sha,'encoding':'base64','size':65,'content':base64.b64encode(raw).decode()};self.assertEqual(verify_blob(b,None,sha),raw)
 def test_numeric_json_identity_is_strict(self):
  for key in ['id','workflow_id','run_number','run_attempt']:
   for value in [True,float(R[key]),str(R[key]),0,-1]:
    with self.subTest(key=key,value=value),self.assertRaises(ValueError):validate_run({**R,key:value},E,C,W,L,1793912401)
  for value in [True,1.0,'1']:
   with self.assertRaises(ValueError):validate_run(R,E,C,W,{**L,'total_count':value},1793912401)
  with self.assertRaises(ValueError):validate_run(R,E,C,{**W,'id':19.0},L,1793912401)
 def test_nonfinite_clock_rejected(self):
  for now in [float('nan'),float('inf')]:
   with self.assertRaises(ValueError):validate_run(R,E,C,W,L,now)
class AdmissionFlow(unittest.TestCase):
 def context(self,*,missing=False,bad=False):
  clock=[1793912401.0];raw=b'1'*64+b'\n';c={**C,'release_blob_sha':git_blob_sha(raw),'poll_seconds':30};receipt=canonical_receipt(R,E,c);release={'sha':c['release_blob_sha'],'encoding':'base64','size':len(raw),'content':base64.b64encode(raw).decode()};rs=git_blob_sha(receipt);approval={'sha':rs,'encoding':'base64','size':len(receipt),'content':base64.b64encode(receipt if not bad else b'wrong').decode()}
  class Client:
   def __init__(self):self.reads=[];self.polls=0
   def get(self,path,**kw):
    self.reads.append({'path':path})
    if path=='actions/runs/17':return R
    if path=='actions/workflows/19':return W
    if path=='actions/workflows/19/runs?per_page=100':return L
    if path=='git/blobs/'+c['release_blob_sha']:
     self.polls+=1
     return None if missing or self.polls==1 else release
    if path=='git/blobs/'+rs:return approval
    raise AssertionError(path)
  return clock,c,Client()
 def test_waits_for_release_then_exact_receipt_and_rechecks_metadata(self):
  clock,c,client=self.context();a=await_admission(client,E,c,now=lambda:clock[0],sleep=lambda n:clock.__setitem__(0,clock[0]+n),deadline=clock[0]+90);self.assertTrue(a['accepted']);self.assertEqual(client.polls,2);self.assertEqual(sum(x['path']=='actions/runs/17' for x in client.reads),2)
 def test_absent_release_deadline_closes(self):
  clock,c,client=self.context(missing=True)
  with self.assertRaises(RuntimeError):await_admission(client,E,c,now=lambda:clock[0],sleep=lambda n:clock.__setitem__(0,clock[0]+n),deadline=clock[0]+60)
 def test_release_does_not_authorize_wrong_receipt(self):
  clock,c,client=self.context(bad=True)
  with self.assertRaises(ValueError):await_admission(client,E,c,now=lambda:clock[0],sleep=lambda n:clock.__setitem__(0,clock[0]+n),deadline=clock[0]+90)
 def test_release_without_receipt_fails_closed(self):
  clock,c,client=self.context();original=client.get
  def get(path,**kw):
   if path.startswith('git/blobs/')and path!='git/blobs/'+c['release_blob_sha']:return None
   return original(path,**kw)
  client.get=get
  with self.assertRaisesRegex(RuntimeError,'without exact run'):await_admission(client,E,c,now=lambda:clock[0],sleep=lambda n:clock.__setitem__(0,clock[0]+n),deadline=clock[0]+90)
 def test_changed_fresh_snapshot_cannot_admit(self):
  for key,value in [('id',18),('run_attempt',2),('status','completed')]:
   clock,c,client=self.context();original=client.get;count=[0]
   def get(path,**kw):
    q=original(path,**kw)
    if path=='actions/runs/17':
     count[0]+=1
     if count[0]>1:return {**q,key:value}
    return q
   client.get=get
   with self.assertRaises(ValueError):await_admission(client,E,c,now=lambda:clock[0],sleep=lambda n:clock.__setitem__(0,clock[0]+n),deadline=clock[0]+90)
class HTTPBoundary(unittest.TestCase):
 def setUp(self):
  mock=patch('approval_gate.urllib.request.urlopen',side_effect=AssertionError('Unstubbed HTTP is forbidden in pure tests'));mock.start();self.addCleanup(mock.stop)
 def client(self,deadline=None):return PublicGitHub({'repository':'o/r','request_budget':32,'request_timeout_seconds':10},time.time()+30 if deadline is None else deadline)
 def response(self,*,raw=b'{}',headers=None,url=None,read_error=None):
  class Response:
   status=200
   def __init__(self):self.headers={'X-RateLimit-Remaining':'30'}if headers is None else headers
   def __enter__(self):return self
   def __exit__(self,*args):pass
   def geturl(self):return url or'https://api.github.com/repos/o/r/actions/runs/17'
   def read(self,n):
    if read_error:raise read_error
    return raw
  return Response()
 def test_success_and_request_budget(self):
  c=self.client()
  with patch('approval_gate.urllib.request.urlopen',return_value=self.response()):self.assertEqual(c.get('actions/runs/17'),{})
  c.config['request_budget']=1
  with self.assertRaises(RuntimeError):c.get('actions/runs/17')
 def test_only_exact_blob_404_waits(self):
  for path,missing in [('actions/runs/17',False),('git/blobs/'+'a'*40,True)]:
   c=self.client();error=urllib.error.HTTPError('https://api.github.com',404,'Not Found',{'X-RateLimit-Remaining':'30'},None)
   with patch('approval_gate.urllib.request.urlopen',side_effect=error):
    if missing:self.assertIsNone(c.get(path,missing_blob=True))
    else:
     with self.assertRaises(RuntimeError):c.get(path)
  with self.assertRaises(ValueError):self.client().get('actions/runs/17',missing_blob=True)
 def test_http_and_network_errors_close(self):
  for error in [urllib.error.HTTPError('x',403,'Denied',{},None),urllib.error.HTTPError('x',429,'Limit',{},None),urllib.error.URLError('offline'),TimeoutError('read stalled')]:
   with patch('approval_gate.urllib.request.urlopen',side_effect=error),self.assertRaises(Exception):self.client().get('actions/runs/17')
 def test_bad_responses_close(self):
  responses=[self.response(headers={}),self.response(headers={'X-RateLimit-Remaining':'3'}),self.response(url='https://wrong.example/'),self.response(headers={'X-RateLimit-Remaining':'30','Link':'<x>; rel="next"'}),self.response(raw=b'x'*(2*1024*1024+1)),self.response(raw=b'invalid'),self.response(read_error=TimeoutError('body stalled'))]
  for response in responses:
   with patch('approval_gate.urllib.request.urlopen',return_value=response),self.assertRaises(Exception):self.client().get('actions/runs/17')
 def test_bad_and_expired_deadlines_close(self):
  for deadline in [float('nan'),float('inf'),time.time()-1]:
   with self.assertRaises((ValueError,RuntimeError)):self.client(deadline).get('actions/runs/17')
 def test_monotonic_deadline_survives_wall_clock_rollback(self):
  with patch('approval_gate.time.time',return_value=100),patch('approval_gate.time.monotonic',return_value=50):c=self.client(110)
  with patch('approval_gate.time.time',return_value=90),patch('approval_gate.time.monotonic',return_value=61),self.assertRaises(RuntimeError):c.get('actions/runs/17')
 def test_return_after_deadline_is_rejected(self):
  c=self.client()
  def open_late(*args,**kw):c.deadline=time.time()-1;return self.response()
  with patch('approval_gate.urllib.request.urlopen',side_effect=open_late),self.assertRaises(RuntimeError):c.get('actions/runs/17')
if __name__=='__main__':unittest.main()
