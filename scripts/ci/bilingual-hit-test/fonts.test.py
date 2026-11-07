#!/usr/bin/env python3
"""Synthetic contracts only. Never installs packages or starts a browser."""
import importlib.util, io, json, os, pathlib, tempfile, unittest
from unittest.mock import patch
P = pathlib.Path(__file__).with_name('fonts.py')
class FontContracts(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.mod = None
  if P.exists():
   s=importlib.util.spec_from_file_location('font_ci',P);cls.mod=importlib.util.module_from_spec(s);s.loader.exec_module(cls.mod)
 def m(self):
  self.assertIsNotNone(self.mod,'Approved bounded font helper is missing');return self.mod
 def test_exact_identity(self):
  m=self.m();e={'GITHUB_SHA':'a'*40,'GITHUB_RUN_ID':'12','GITHUB_RUN_ATTEMPT':'1','GITHUB_REPOSITORY':'watsonbkeel/forbidden-city-3d','GITHUB_REF':'refs/heads/dev/r166-bilingual-hit-test-diagnostic-20261107'}
  self.assertEqual(m.identity(e)['eventSha'],'a'*40)
  for k in e:
   bad=dict(e);bad[k]='';self.assertRaises(ValueError,m.identity,bad)
 def test_package_simulation_only_exact_new_font(self):
  m=self.m();v=m.SPEC['version'];s=f'Inst fonts-noto-cjk ({v} local-deb [all])\nConf fonts-noto-cjk ({v} local-deb [all])\n'
  self.assertEqual(m.validate_simulation(s,False),['fonts-noto-cjk'])
  for q in [s.replace(v,'999'),s+'Remv other [1]\n',s+'Inst extra (1 repo [all])\n',s.replace('Inst fonts','Inst fonts')+s,s.replace('Conf fonts-noto-cjk','Conf extra')]:self.assertRaises(ValueError,m.validate_simulation,q,False)
  self.assertEqual(m.validate_simulation('',True),[])
  self.assertRaises(ValueError,m.validate_simulation,s,True)
 def test_pending_dpkg_audit_and_other_package_changes_fail(self):
  m=self.m();before={'base':('1','install ok installed')};after={**before,'fonts-noto-cjk':(m.SPEC['version'],'install ok installed')}
  self.assertEqual(m.validate_transaction(before,after,'',''),['fonts-noto-cjk'])
  for a,b in [({'base':('2','install ok installed'),**{k:v for k,v in after.items() if k!='base'}},''),(after,'pending')]:self.assertRaises(ValueError,m.validate_transaction,before,a,'',b)
  self.assertRaises(ValueError,m.validate_transaction,before,after,'pending','')
 def test_glyph_inventory_requires_every_exact_codepoint(self):
  m=self.m();required=[0x592a,0x548c,0x6bbf];good=[{'codepoint':n,'glyphIndex':i+1} for i,n in enumerate(required)]
  m.validate_glyphs(good,required)
  for q in [good[:-1],good+good[:1],[{**good[0],'glyphIndex':0}]+good[1:],[{**good[0],'glyphIndex':True}]+good[1:]]:self.assertRaises(ValueError,m.validate_glyphs,q,required)
 def test_spec_pins_actual_package_and_only_approved_config_link(self):
  m=self.m();self.assertEqual(m.SPEC['sha256'],'7d64b985f6fe128c99eae5610d5c047338e572bdcfb2bb09736be01b824a7f6c')
  links=[r for r in m.SPEC['members'] if r['type']=='symlink'];self.assertEqual(len(links),1);self.assertEqual(links[0]['path'],'./etc/fonts/conf.d/70-fonts-noto-cjk.conf');self.assertEqual(links[0]['linkTarget'],'/usr/share/fontconfig/conf.avail/70-fonts-noto-cjk.conf')
 def test_regular_reader_rejects_symlink_fifo_and_mutation(self):
  m=self.m()
  with tempfile.TemporaryDirectory() as d:
   r=pathlib.Path(d);(r/'f').write_bytes(b'abc');self.assertEqual(m.regular(r/'f',3),b'abc');self.assertRaises(ValueError,m.regular,r/'f',2)
   (r/'l').symlink_to(r/'f');os.mkfifo(r/'p');self.assertRaises(ValueError,m.regular,r/'l',99);self.assertRaises(ValueError,m.regular,r/'p',99)
 def test_atomic_result_preserves_old_prefix_on_failed_replace(self):
  m=self.m()
  with tempfile.TemporaryDirectory() as d:
   p=pathlib.Path(d)/'prepare.json';m.atomic_json(p,{'status':'starting'})
   with patch.object(m.os,'replace',side_effect=OSError('synthetic rename failure')):self.assertRaises(OSError,m.atomic_json,p,{'status':'passed'})
   self.assertEqual(json.loads(p.read_text())['status'],'starting');self.assertFalse(p.with_name('.prepare.json.pending').exists())
 def test_atomic_writer_does_not_remove_other_pending_file(self):
  m=self.m()
  with tempfile.TemporaryDirectory() as d:
   p=pathlib.Path(d)/'prepare.json';q=p.with_name('.prepare.json.pending');q.write_bytes(b'other');self.assertRaises(FileExistsError,m.atomic_json,p,{'status':'passed'});self.assertEqual(q.read_bytes(),b'other')
 def test_root_exact_nonoverlap_and_fresh_creation(self):
  m=self.m()
  with tempfile.TemporaryDirectory() as d:
   r=pathlib.Path(d);e={'GITHUB_SHA':'a'*40,'GITHUB_RUN_ID':'12','GITHUB_RUN_ATTEMPT':'1','GITHUB_REPOSITORY':'watsonbkeel/forbidden-city-3d','GITHUB_REF':'refs/heads/dev/r166-bilingual-hit-test-diagnostic-20261107','RUNNER_TEMP':d,'FONT_WORK_ROOT':str(r/'bf-12-1'),'UI_WORK_ROOT':str(r/'bui-12-1'),'EVIDENCE_DIR':str(r/'evidence'),'GITHUB_WORKSPACE':str(r/'repo')}
   m.validate_roots(e)
   for key,value in [('FONT_WORK_ROOT',str(r/'wrong')),('UI_WORK_ROOT',str(r/'bf-12-1/sub')),('EVIDENCE_DIR',str(r/'bf-12-1'))]:self.assertRaises(ValueError,m.validate_roots,{**e,key:value})
 def test_no_environment_font_override(self):
  m=self.m();m.validate_font_environment({})
  for key in ['FONTCONFIG_FILE','FONTCONFIG_PATH','FONTCONFIG_SYSROOT']:self.assertRaises(ValueError,m.validate_font_environment,{key:'/different'})
 def test_fixed_member_metadata_refuses_extra_or_different_type(self):
  m=self.m();row=next(r for r in m.SPEC['members'] if r['type']=='symlink');m.validate_member(row)
  for q in [{**row,'linkTarget':'/etc/passwd'},{**row,'type':'regular'},{**row,'path':'../escape'}]:self.assertRaises(ValueError,m.validate_member,q)
 def test_font_match_requires_verified_sc_face_and_weight(self):
  m=self.m();f=m.SPEC['faces'][0];good='\t'.join([f['path'],str(f['index']),f['family'],f['postScriptName']]);self.assertEqual(m.validate_match(good,f)['postScriptName'],f['postScriptName'])
  for q in [good.replace('CJK SC','CJK JP'),good.replace('\t2\t','\t0\t'),good.replace('NotoSansCJKsc-Regular','Latin'),good+'\nextra']:self.assertRaises(ValueError,m.validate_match,q,f)
class FontIntegrationContracts(unittest.TestCase):
 setUpClass = FontContracts.__dict__["setUpClass"]
 m = FontContracts.m
 def test_failed_prepare_has_same_run_receipt_and_no_success(self):
  m=self.m();self.assertTrue(all(callable(getattr(m,n,None)) for n in ['prepare','check','collect']),'Preparation/check/collection interfaces missing')
  with tempfile.TemporaryDirectory() as d:
   r=pathlib.Path(d);(r/'repo').mkdir();(r/'evidence').mkdir();e={'GITHUB_SHA':'a'*40,'GITHUB_RUN_ID':'12','GITHUB_RUN_ATTEMPT':'1','GITHUB_REPOSITORY':'watsonbkeel/forbidden-city-3d','GITHUB_REF':'refs/heads/dev/r166-bilingual-hit-test-diagnostic-20261107','RUNNER_TEMP':d,'FONT_WORK_ROOT':str(r/'bf-12-1'),'UI_WORK_ROOT':str(r/'bui-12-1'),'EVIDENCE_DIR':str(r/'evidence'),'GITHUB_WORKSPACE':str(r/'repo')}
   def fail(*args,**kwargs):raise RuntimeError('synthetic initial command failure')
   result=m.prepare(e,fail);self.assertEqual(result['status'],'failed');self.assertEqual(result['identity'],m.identity(e));self.assertTrue((r/'bf-12-1/receipts/prepare.json').exists());self.assertRaises(ValueError,m.check,e,fail)
   q=m.collect(e);self.assertFalse(q['passed']);self.assertEqual(q['copied'],['prepare.json','prepare.log']);self.assertEqual(sorted(p.name for p in (r/'evidence/font-environment').iterdir()),['collection.json','prepare.json','prepare.log'])
   (r/'bf-12-1/receipts/prepare.json').unlink();(r/'evidence2').mkdir();partial=m.collect({**e,'EVIDENCE_DIR':str(r/'evidence2')});self.assertFalse(partial['passed']);self.assertEqual(partial['copied'],['prepare.log'])
 def test_collector_never_copies_scratch_or_foreign_identity(self):
  m=self.m();self.assertTrue(all(callable(getattr(m,n,None)) for n in ['prepare','check','collect']),'Preparation/check/collection interfaces missing')
  with tempfile.TemporaryDirectory() as d:
   r=pathlib.Path(d);(r/'repo').mkdir();(r/'evidence').mkdir();e={'GITHUB_SHA':'a'*40,'GITHUB_RUN_ID':'12','GITHUB_RUN_ATTEMPT':'1','GITHUB_REPOSITORY':'watsonbkeel/forbidden-city-3d','GITHUB_REF':'refs/heads/dev/r166-bilingual-hit-test-diagnostic-20261107','RUNNER_TEMP':d,'FONT_WORK_ROOT':str(r/'bf-12-1'),'UI_WORK_ROOT':str(r/'bui-12-1'),'EVIDENCE_DIR':str(r/'evidence'),'GITHUB_WORKSPACE':str(r/'repo')}
   def fail(*a,**k):raise RuntimeError('stop')
   m.prepare(e,fail);(r/'bf-12-1/scratch/secret.deb').write_bytes(b'never copy');owner=r/'bf-12-1/OWNER.json';x=json.loads(owner.read_text());x['identity']['runAttempt']='2';owner.write_text(json.dumps(x));q=m.collect(e);self.assertFalse(q['passed']);self.assertEqual(q['copied'],[]);self.assertFalse((r/'evidence/font-environment/secret.deb').exists())
 def test_receipt_empty_or_missing_provenance_never_passes(self):
  m=self.m();self.assertTrue(callable(getattr(m,'validate_receipt',None)),'Receipt validator missing')
  for q in [{},{'schema':1,'status':'passed'},{'schema':1,'status':'passed','specSHA256':m.SPEC_SHA}]:self.assertRaises(ValueError,m.validate_receipt,q,{'eventSha':'a'*40})
class FontBoundedCommandContracts(unittest.TestCase):
 setUpClass = FontContracts.__dict__["setUpClass"]
 m = FontContracts.m
 def test_version_output_channel_is_explicit_and_bounded(self):
  import inspect,sys
  m=self.m();self.assertIn('channel',inspect.signature(m.Commands.__call__).parameters)
  with tempfile.TemporaryDirectory() as d:
   r=pathlib.Path(d);(r/'receipts').mkdir();(r/'scratch').mkdir();(r/'receipts/prepare.log').write_bytes(b'');q={'commands':[]};run=m.Commands(r,q,((r/'receipts/prepare.log').stat().st_dev,(r/'receipts/prepare.log').stat().st_ino))
   self.assertEqual(run([sys.executable,'-c',"import sys;sys.stderr.write('fontconfig version 2.15.0')"],channel='stderr'),'fontconfig version 2.15.0');self.assertEqual(q['commands'][0]['exit'],0)
   for kind in ['symlink','regular']:
    log=r/'receipts/prepare.log';outside=r/('outside-'+kind);outside.write_bytes(b'untouched');original=m.regular
    def swap(path,*args):
     data=original(path,*args)
     if pathlib.Path(path)==log:
      log.unlink()
      if kind=='symlink':log.symlink_to(outside)
      else:log.write_bytes(b'replacement')
     return data
    with patch.object(m,'regular',side_effect=swap):
     with self.assertRaises((ValueError,OSError)):run([sys.executable,'-c',"print('safe')"])
    self.assertEqual(outside.read_bytes(),b'untouched')
    if kind=='regular':self.assertEqual(log.read_bytes(),b'replacement')
    log.unlink();log.write_bytes(b'');run=m.Commands(r,q,((r/'receipts/prepare.log').stat().st_dev,(r/'receipts/prepare.log').stat().st_ino))

 def test_timeout_marks_started_installation_uncertain_and_keeps_input(self):
  m=self.m()
  with tempfile.TemporaryDirectory() as d:
   r=pathlib.Path(d);(r/'repo').mkdir();(r/'evidence').mkdir();e={'GITHUB_SHA':'a'*40,'GITHUB_RUN_ID':'12','GITHUB_RUN_ATTEMPT':'1','GITHUB_REPOSITORY':'watsonbkeel/forbidden-city-3d','GITHUB_REF':'refs/heads/dev/r166-bilingual-hit-test-diagnostic-20261107','RUNNER_TEMP':d,'FONT_WORK_ROOT':str(r/'bf-12-1'),'UI_WORK_ROOT':str(r/'bui-12-1'),'EVIDENCE_DIR':str(r/'evidence'),'GITHUB_WORKSPACE':str(r/'repo')}
   v=m.SPEC['version']
   def run(args,**kwargs):
    if args[0]=='python3':return 'Ran 31 tests in 0.1s\n\nOK'
    if args[0]=='dpkg':return ''
    if args[0]=='dpkg-query':return 'base\t1\tinstall ok installed'
    if args[:2]==['apt-cache','show']:return FontOriginContracts.texts(self,direct=True)[0]
    if args[:2]==['apt-cache','policy']:return FontOriginContracts.texts(self,direct=True)[1]
    if args[0]=='curl':return ''
    if args[0]=='apt-get':return f'Inst fonts-noto-cjk ({v} local [all])\nConf fonts-noto-cjk ({v} local [all])'
    if args[0]=='sudo':raise RuntimeError('synthetic privileged command timeout')
    self.fail('Unexpected command '+str(args))
   original=m.qualify_apt_source
   def qualify(run,receipt,p):
    def tracked(args,**kwargs):
     value=run(args,**kwargs);receipt['commands'].append({'program':'apt-cache','exit':0,'stdoutBytes':len(value.encode()),'stderrBytes':0,'logTruncated':False});return value
    return original(tracked,receipt,p)
   with patch.object(m,'qualify_apt_source',side_effect=qualify),patch.object(m,'hash_regular',return_value={'bytes':m.SPEC['bytes'],'sha256':m.SPEC['sha256']}),patch.object(m,'cache_snapshot',return_value=[]):q=m.prepare(e,run)
   self.assertEqual(q['status'],'failed');self.assertEqual(q['transactionState'],'uncertain');self.assertFalse(q['scratchClean']);self.assertTrue((r/'bf-12-1/scratch'/m.SPEC['archiveName']).exists())
class FontReceiptCompleteness(unittest.TestCase):
 setUpClass = FontContracts.__dict__["setUpClass"]
 m = FontContracts.m
 def base_fixture(self):
  m=self.m();i={'eventSha':'a'*40,'runId':'12','runAttempt':'1','repository':'watsonbkeel/forbidden-city-3d','ref':m.BRANCH};link=next(r for r in m.SPEC['members'] if r['type']=='symlink');files=[{'path':r['path'][1:],'bytes':r['bytes'],'sha256':r['sha256']} for r in m.SPEC['members'] if r['type']=='regular' and (r['path'].startswith('./usr/share/fonts/') or '/fontconfig/' in r['path'])]
  faces=[{**f,'glyphs':[{'codepoint':cp,'glyphIndex':j+1} for j,cp in enumerate(m.SPEC['requiredCodepoints'])],'missingCodepoint':0x10ffff,'missingGlyphIndex':0} for f in m.SPEC['faces']]
  return {'schema':1,'status':'passed','identity':i,'specSHA256':m.SPEC_SHA,'package':{'name':m.SPEC['package'],**{k:m.SPEC[k] for k in ['version','url','bytes','sha256']}},'transactionState':'complete','beforeAudit':'','afterAudit':'','changes':['fonts-noto-cjk'],'simulationChanges':['fonts-noto-cjk'],'aptOrigin':'500 https://archive.ubuntu.com/ubuntu noble/main amd64 Packages','installed':{'files':files,'configLink':{'path':link['path'][1:],'target':link['linkTarget']}},'faces':faces,'freetype':{'path':'/usr/lib/x86_64-linux-gnu/libfreetype.so.6.20.1','bytes':123,'sha256':'b'*64,'version':'2.13.2'},'fontconfig':{'version':'fontconfig version 2.15.0','matches':[dict(zip(['path','index','family','postScriptName'],[f['path'],str(f['index']),f['family'],f['postScriptName']])) for f in m.SPEC['faces']],'queries':[{'face':f['postScriptName'],'fontVersion':'131334'} for f in m.SPEC['faces']]},'footprint':{'normalMaintscriptsAndTriggers':True,'maintscriptSHA256':'f85775a5ec255da85d32cd6604dc1daea5d57cf30908b2520dd3e0463159754c','legacyConffileMigration':'/etc/fonts/conf.avail/70-fonts-noto-cjk.conf','normalSystemWrites':['/var/lib/dpkg','/var/log/apt','/var/log/dpkg.log','/var/cache/fontconfig'],'cacheBefore':[],'cacheAfter':[]},'scratchClean':True,'contracts':{'tests':31,'passed':True,'outputSHA256':'c'*64},'commands':[{'program':p,'exit':0,'stdoutBytes':0,'stderrBytes':0,'logTruncated':False} for p in ['python3','dpkg','dpkg-query','apt-cache','apt-cache','curl','apt-get','sudo','dpkg','dpkg-query','fc-match','fc-match','fc-query','fc-match','fc-query']]}
 def fixture(self):
  q=self.base_fixture();helper=FontOriginContracts();helper.mod=self.m();source,commands=helper.fixture(direct=True);q['aptSource']=source;q['aptOrigin']=source['policy']['raw'];q['commands'][3:5]=commands;return q
 def test_complete_receipt_positive_and_missing_provenance_negatives(self):
  import copy
  m=self.m();q=self.fixture();m.validate_receipt(q,q['identity'])
  for section,key in [(None,'contracts'),(None,'aptOrigin'),(None,'commands'),(None,'simulationChanges'),('footprint','maintscriptSHA256'),('footprint','legacyConffileMigration'),('footprint','normalSystemWrites'),('freetype','path'),('freetype','bytes')]:
   bad=copy.deepcopy(q);del (bad if section is None else bad[section])[key]
   with self.subTest(section=section,key=key):self.assertRaises(ValueError,m.validate_receipt,bad,q['identity'])
  for change in [lambda x:x['fontconfig']['queries'].__setitem__(0,{}),lambda x:x['footprint'].__setitem__('cacheAfter',[{}]),lambda x:x['commands'][0].__setitem__('exit',None),lambda x:x.__setitem__('simulationChanges',[])]:
   bad=copy.deepcopy(q);change(bad);self.assertRaises(ValueError,m.validate_receipt,bad,q['identity'])

class FontOriginContracts(unittest.TestCase):
 setUpClass = FontContracts.__dict__["setUpClass"]
 m = FontContracts.m
 def api(self):
  m=self.m();self.assertTrue(all(callable(getattr(m,n,None)) for n in ['raw_observation','parse_mirrors','parse_apt_policy','parse_apt_show','validate_apt_source','read_mirror','recheck_apt_source']),'Finite source qualification interfaces missing');return m
 def texts(self,installed=False,direct=False):
  m=self.m();v=m.SPEC['version'];show=f"Package: fonts-noto-cjk\nArchitecture: all\nVersion: {v}\nOrigin: Ubuntu\nFilename: pool/main/f/fonts-noto-cjk/{m.SPEC['archiveName']}\nSize: {m.SPEC['bytes']}\nSHA256: {m.SPEC['sha256']}\n"
  repo='https://archive.ubuntu.com/ubuntu' if direct else 'mirror+file:/etc/apt/apt-mirrors.txt'
  policy=f"fonts-noto-cjk:\n  Installed: {v if installed else '(none)'}\n  Candidate: {v}\n  Version table:\n {'***' if installed else '   '} {v} 500\n        500 {repo} noble/main amd64 Packages\n"+('        100 /var/lib/dpkg/status\n' if installed else '')
  mirror='http://azure.archive.ubuntu.com/ubuntu/\tpriority:1\nhttps://archive.ubuntu.com/ubuntu/\tpriority:2\nhttps://security.ubuntu.com/ubuntu/\tpriority:3\n'
  return show,policy,mirror
 def fixture(self,installed=False,direct=False):
  m=self.api();show,policy,raw=self.texts(installed,direct);mirror=None if direct else {'path':m.MIRROR_PATH,**m.raw_observation(raw,4096),'metadata':{'dev':'1','ino':'2','uid':0,'gid':0,'mode':'100644','size':len(raw.encode()),'mtimeNs':'1','ctimeNs':'1'},'entries':m.parse_mirrors(raw)}
  source={'schema':1,'status':'qualified','show':m.raw_observation(show,16384),'policy':m.raw_observation(policy,16384),'mirror':mirror,'selected':m.parse_apt_policy(policy)}
  commands=[{'program':'apt-cache','exit':0,'stdoutBytes':len(t.encode()),'stderrBytes':0,'logTruncated':False} for t in [show,policy]]
  return source,commands
 def test_raw_utf8_preserves_whitespace_and_rejects_invalid_values(self):
  m=self.api()
  for raw in ['abc\n',' abc\r\n','\n太和殿\n']:
   r=m.raw_observation(raw,16384);self.assertEqual(r['raw'],raw);self.assertEqual(r['bytes'],len(raw.encode()));self.assertEqual(r['sha256'],__import__('hashlib').sha256(raw.encode()).hexdigest())
  for raw in ['\ud800','a\x00b','x'*16385]:self.assertRaises(ValueError,m.raw_observation,raw,16384)
 def test_exact_direct_and_mirror_policy_including_installed_status(self):
  m=self.api()
  for installed in [False,True]:
   for direct in [False,True]:
    q,c=self.fixture(installed,direct);m.validate_apt_source(q,c)
 def test_mirror_members_reject_unknown_missing_duplicate_or_options(self):
  m=self.api();raw=self.texts()[2];self.assertEqual(len(m.parse_mirrors(raw)),3)
  for wrong in [raw.replace('azure.archive.ubuntu.com','evil.example'),raw+'https://example.com/ priority:4\n',raw.splitlines()[0]+'\n',raw+raw,raw.replace('priority:2','priority:1'),raw.replace('https://archive.ubuntu.com/ubuntu/','https://archive.ubuntu.com.evil/ubuntu/'),raw.replace('priority:3','priority:3 extra:yes'),'\n'.join(reversed(raw.splitlines())),raw.replace('/ubuntu/','/other/')]:self.assertRaises(ValueError,m.parse_mirrors,wrong)
 def test_policy_status_is_not_origin_and_selected_version_is_exact(self):
  m=self.api();q,c=self.fixture(True);p=q['policy']['raw']
  for wrong in [p.replace('        500 mirror+file:/etc/apt/apt-mirrors.txt noble/main amd64 Packages\n',''),p+'        100 /var/lib/dpkg/status\n',p.replace('/var/lib/dpkg/status','/tmp/status'),p.replace('100 /var','101 /var'),p.replace('Candidate: '+m.SPEC['version'],'Candidate: 99'),p.replace('Installed: '+m.SPEC['version'],'Installed: (none)'),p.replace('noble/main','noble/universe'),p.replace('amd64 Packages','arm64 Packages'),p.replace('mirror+file:/etc/apt/apt-mirrors.txt','mirror+file:/tmp/mirrors'),p.replace(' 1:20230817+repack1-3 500',' 99 500'),p+'        500 https://evil.example/ubuntu noble/main amd64 Packages\n']:
   self.assertRaises(ValueError,m.parse_apt_policy,wrong)
 def test_show_fields_are_unique_and_exact(self):
  m=self.api();show=self.texts()[0];m.parse_apt_show(show)
  for wrong in [show.replace('Origin: Ubuntu','Origin: Other'),show.replace('Size: '+str(m.SPEC['bytes']),'Size: 1'),show.replace('Architecture: all','Architecture: amd64'),show+'Version: 99\n',show.replace('Package: fonts-noto-cjk\n',''),show.replace(m.SPEC['sha256'],'0'*64)]:self.assertRaises(ValueError,m.parse_apt_show,wrong)
 def test_receipt_raw_hash_entries_and_command_bytes_are_independent(self):
  import copy
  m=self.api();q,c=self.fixture();m.validate_apt_source(q,c)
  for mutate in [lambda x:x.__setitem__('schema',True),lambda x:x['mirror']['entries'][0].__setitem__('priority',True),lambda x:x['selected'].__setitem__('installedStatus',0),lambda x:x['mirror'].pop('raw'),lambda x:x['mirror'].__setitem__('sha256','0'*64),lambda x:x['mirror']['entries'].pop(),lambda x:x['policy'].__setitem__('raw',x['policy']['raw'].strip()),lambda x:x['show'].__setitem__('bytes',0),lambda x:x.pop('mirror'),lambda x:x['selected'].__setitem__('installed','99'),lambda x:x['mirror']['metadata'].__setitem__('uid',1000),lambda x:x['mirror']['metadata'].__setitem__('mode','100666'),lambda x:x['mirror'].__setitem__('raw','\ud800')]:
   bad=copy.deepcopy(q);mutate(bad);self.assertRaises(ValueError,m.validate_apt_source,bad,c)
  c[1]['stdoutBytes']-=1;self.assertRaises(ValueError,m.validate_apt_source,q,c)
 def test_mirror_reader_rejects_alias_fifo_oversize_wrong_owner(self):
  m=self.api();raw=self.texts()[2]
  with tempfile.TemporaryDirectory() as d:
   p=pathlib.Path(d)/'mirror';p.write_text(raw);real=m.mirror_metadata
   def root(s):return {**real(s),'uid':0}
   with patch.object(m,'MIRROR_PATH',str(p)),patch.object(m,'mirror_metadata',side_effect=root):
    q=m.read_mirror();self.assertEqual(q['raw'],raw);m.recheck_apt_source({'mirror':q})
    p.write_text(raw+'x');self.assertRaises(ValueError,m.recheck_apt_source,{'mirror':q});p.unlink();os.mkfifo(p);self.assertRaises(ValueError,m.read_mirror);p.unlink();outside=pathlib.Path(d)/'outside';outside.write_text(raw);p.symlink_to(outside);self.assertRaises(ValueError,m.read_mirror);p.unlink();p.write_text('x'*4097);self.assertRaises(ValueError,m.read_mirror);p.write_text(raw);p.chmod(0o666);self.assertRaises(ValueError,m.read_mirror)
   with patch.object(m,'MIRROR_PATH',str(p)),patch.object(m,'mirror_metadata',side_effect=lambda s:{**real(s),'uid':1000}):self.assertRaises(ValueError,m.read_mirror)
 def test_mirror_final_path_replacement_is_rejected_without_deleting_other(self):
  m=self.api();raw=self.texts()[2]
  with tempfile.TemporaryDirectory() as d:
   p=pathlib.Path(d)/'mirror';p.write_text(raw);real_meta=m.mirror_metadata;real_read=m.os.read;swapped=False
   def read(fd,n):
    nonlocal swapped
    b=real_read(fd,n)
    if not b and not swapped:swapped=True;p.unlink();p.write_text('foreign')
    return b
   with patch.object(m,'MIRROR_PATH',str(p)),patch.object(m,'mirror_metadata',side_effect=lambda s:{**real_meta(s),'uid':0}),patch.object(m.os,'read',side_effect=read):self.assertRaises(ValueError,m.read_mirror)
   self.assertEqual(p.read_text(),'foreign')
 def test_source_failure_persists_full_raw_before_qualification(self):
  m=self.api();self.assertTrue(callable(getattr(m,'qualify_apt_source',None)),'Source observation integration missing')
  show,policy,raw=self.texts();policy=policy.replace('noble/main','noble/universe')
  with tempfile.TemporaryDirectory() as d:
   p=pathlib.Path(d)/'prepare.json';receipt={'commands':[]}
   def run(args,**kwargs):
    self.assertTrue(kwargs['raw_apt']);text=show if args[1]=='show' else policy;receipt['commands'].append({'program':'apt-cache','exit':0,'stdoutBytes':len(text.encode()),'stderrBytes':0,'logTruncated':False});return text
   with self.assertRaises(ValueError):m.qualify_apt_source(run,receipt,p)
   q=json.loads(p.read_text());self.assertEqual(q['aptSource']['policy']['raw'],policy);self.assertEqual(q['aptSource']['show']['raw'],show);self.assertNotEqual(q['aptSource']['status'],'qualified')
 def test_source_atomic_write_failure_never_qualifies(self):
  m=self.api();self.assertTrue(callable(getattr(m,'qualify_apt_source',None)),'Source observation integration missing');show,policy,raw=self.texts(direct=True);calls=[]
  with tempfile.TemporaryDirectory() as d:
   p=pathlib.Path(d)/'prepare.json';receipt={'commands':[]}
   def run(args,**kwargs):calls.append(args);return show
   with patch.object(m,'atomic_json',side_effect=OSError('synthetic atomic failure')):self.assertRaises(OSError,m.qualify_apt_source,run,receipt,p)
   self.assertEqual(len(calls),1);self.assertNotEqual(receipt['aptSource']['status'],'qualified')
 def test_fixed_apt_commands_preserve_prestrip_raw_only(self):
  import sys,subprocess
  m=self.api();real_popen=subprocess.Popen
  with tempfile.TemporaryDirectory() as d:
   r=pathlib.Path(d);(r/'receipts').mkdir();(r/'scratch').mkdir();log=r/'receipts/prepare.log';log.write_bytes(b'');q={'commands':[]};run=m.Commands(r,q,(log.stat().st_dev,log.stat().st_ino))
   for raw in [' a\n',' a\r\n','\n太和殿\n']:
    with patch.object(m.subprocess,'Popen',side_effect=lambda args,**kw:real_popen([sys.executable,'-c','import sys;sys.stdout.buffer.write('+repr(raw.encode())+')'],**kw)):
     self.assertEqual(run(['apt-cache','policy','fonts-noto-cjk'],raw_apt=True),raw)
    self.assertEqual(q['commands'][-1]['stdoutBytes'],len(raw.encode()))
   self.assertRaises(ValueError,run,[sys.executable,'-c','print(1)'],raw_apt=True)


 def test_source_receipts_preserve_crlf_lf_cr_and_ordinary_unicode_metadata(self):
  m=self.api()
  for target in ['mirror','show','policy']:
   for separator in ['\n','\r\n','\r']:
    with self.subTest(target=target,separator=repr(separator)):
     q,c=self.fixture();raw=q[target]['raw'].replace('\n',separator);q[target].update(m.raw_observation(raw,4096 if target=='mirror' else 16384))
     if target=='mirror':q[target]['metadata']['size']=q[target]['bytes']
     else:c[0 if target=='show' else 1]['stdoutBytes']=q[target]['bytes']
     m.validate_apt_source(q,c)
  q,c=self.fixture();q['show'].update(m.raw_observation(q['show']['raw']+'Description: 中文字形 é\n 后续说明\n',16384));c[0]['stdoutBytes']=q['show']['bytes'];m.validate_apt_source(q,c)
 def test_source_receipts_reject_non_ascii_whitespace_with_matching_raw_hash_and_bytes(self):
  m=self.api();forbidden=['\v','\f','\x1c','\x1d','\x1e','\x1f','\x85','\xa0','\u1680',*[chr(n) for n in range(0x2000,0x200b)],'\u2028','\u2029','\u202f','\u205f','\u3000','\ufeff']
  for target in ['mirror','show','policy']:
   for separator in forbidden:
    for location in ['separator','prefix','suffix']:
     with self.subTest(target=target,separator=repr(separator),location=location):
      q,c=self.fixture();original=q[target]['raw'];raw=original.replace('\n',separator) if location=='separator' else separator+original if location=='prefix' else original+separator;q[target].update(m.raw_observation(raw,4096 if target=='mirror' else 16384))
      if target=='mirror':q[target]['metadata']['size']=q[target]['bytes']
      else:c[0 if target=='show' else 1]['stdoutBytes']=q[target]['bytes']
      self.assertRaises(ValueError,m.validate_apt_source,q,c)

if __name__=='__main__':unittest.main()
