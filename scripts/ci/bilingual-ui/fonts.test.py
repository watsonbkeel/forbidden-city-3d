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
  m=self.m();e={'GITHUB_SHA':'a'*40,'GITHUB_RUN_ID':'12','GITHUB_RUN_ATTEMPT':'1','GITHUB_REPOSITORY':'watsonbkeel/forbidden-city-3d','GITHUB_REF':'refs/heads/dev/r166-cumulative-374-e46-20261106'}
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
   r=pathlib.Path(d);e={'GITHUB_SHA':'a'*40,'GITHUB_RUN_ID':'12','GITHUB_RUN_ATTEMPT':'1','GITHUB_REPOSITORY':'watsonbkeel/forbidden-city-3d','GITHUB_REF':'refs/heads/dev/r166-cumulative-374-e46-20261106','RUNNER_TEMP':d,'FONT_WORK_ROOT':str(r/'bf-12-1'),'UI_WORK_ROOT':str(r/'bui-12-1'),'EVIDENCE_DIR':str(r/'evidence'),'GITHUB_WORKSPACE':str(r/'repo')}
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
   r=pathlib.Path(d);(r/'repo').mkdir();(r/'evidence').mkdir();e={'GITHUB_SHA':'a'*40,'GITHUB_RUN_ID':'12','GITHUB_RUN_ATTEMPT':'1','GITHUB_REPOSITORY':'watsonbkeel/forbidden-city-3d','GITHUB_REF':'refs/heads/dev/r166-cumulative-374-e46-20261106','RUNNER_TEMP':d,'FONT_WORK_ROOT':str(r/'bf-12-1'),'UI_WORK_ROOT':str(r/'bui-12-1'),'EVIDENCE_DIR':str(r/'evidence'),'GITHUB_WORKSPACE':str(r/'repo')}
   def fail(*args,**kwargs):raise RuntimeError('synthetic initial command failure')
   result=m.prepare(e,fail);self.assertEqual(result['status'],'failed');self.assertEqual(result['identity'],m.identity(e));self.assertTrue((r/'bf-12-1/receipts/prepare.json').exists());self.assertRaises(ValueError,m.check,e,fail)
   q=m.collect(e);self.assertFalse(q['passed']);self.assertEqual(q['copied'],['prepare.json','prepare.log']);self.assertEqual(sorted(p.name for p in (r/'evidence/font-environment').iterdir()),['collection.json','prepare.json','prepare.log'])
   (r/'bf-12-1/receipts/prepare.json').unlink();(r/'evidence2').mkdir();partial=m.collect({**e,'EVIDENCE_DIR':str(r/'evidence2')});self.assertFalse(partial['passed']);self.assertEqual(partial['copied'],['prepare.log'])
 def test_collector_never_copies_scratch_or_foreign_identity(self):
  m=self.m();self.assertTrue(all(callable(getattr(m,n,None)) for n in ['prepare','check','collect']),'Preparation/check/collection interfaces missing')
  with tempfile.TemporaryDirectory() as d:
   r=pathlib.Path(d);(r/'repo').mkdir();(r/'evidence').mkdir();e={'GITHUB_SHA':'a'*40,'GITHUB_RUN_ID':'12','GITHUB_RUN_ATTEMPT':'1','GITHUB_REPOSITORY':'watsonbkeel/forbidden-city-3d','GITHUB_REF':'refs/heads/dev/r166-cumulative-374-e46-20261106','RUNNER_TEMP':d,'FONT_WORK_ROOT':str(r/'bf-12-1'),'UI_WORK_ROOT':str(r/'bui-12-1'),'EVIDENCE_DIR':str(r/'evidence'),'GITHUB_WORKSPACE':str(r/'repo')}
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
   r=pathlib.Path(d);(r/'repo').mkdir();(r/'evidence').mkdir();e={'GITHUB_SHA':'a'*40,'GITHUB_RUN_ID':'12','GITHUB_RUN_ATTEMPT':'1','GITHUB_REPOSITORY':'watsonbkeel/forbidden-city-3d','GITHUB_REF':'refs/heads/dev/r166-cumulative-374-e46-20261106','RUNNER_TEMP':d,'FONT_WORK_ROOT':str(r/'bf-12-1'),'UI_WORK_ROOT':str(r/'bui-12-1'),'EVIDENCE_DIR':str(r/'evidence'),'GITHUB_WORKSPACE':str(r/'repo')}
   v=m.SPEC['version']
   def run(args,**kwargs):
    if args[0]=='python3':return 'Ran 18 tests in 0.1s\n\nOK'
    if args[0]=='dpkg':return ''
    if args[0]=='dpkg-query':return 'base\t1\tinstall ok installed'
    if args[:2]==['apt-cache','show']:return 'Version: '+v+'\nSHA256: '+m.SPEC['sha256']+'\nFilename: pool/main/f/fonts-noto-cjk/'+m.SPEC['archiveName']
    if args[:2]==['apt-cache','policy']:return '500 https://archive.ubuntu.com/ubuntu noble/main amd64 Packages'
    if args[0]=='curl':return ''
    if args[0]=='apt-get':return f'Inst fonts-noto-cjk ({v} local [all])\nConf fonts-noto-cjk ({v} local [all])'
    if args[0]=='sudo':raise RuntimeError('synthetic privileged command timeout')
    self.fail('Unexpected command '+str(args))
   with patch.object(m,'hash_regular',return_value={'bytes':m.SPEC['bytes'],'sha256':m.SPEC['sha256']}),patch.object(m,'cache_snapshot',return_value=[]):q=m.prepare(e,run)
   self.assertEqual(q['status'],'failed');self.assertEqual(q['transactionState'],'uncertain');self.assertFalse(q['scratchClean']);self.assertTrue((r/'bf-12-1/scratch'/m.SPEC['archiveName']).exists())
class FontReceiptCompleteness(unittest.TestCase):
 setUpClass = FontContracts.__dict__["setUpClass"]
 m = FontContracts.m
 def fixture(self):
  m=self.m();i={'eventSha':'a'*40,'runId':'12','runAttempt':'1','repository':'watsonbkeel/forbidden-city-3d','ref':m.BRANCH};link=next(r for r in m.SPEC['members'] if r['type']=='symlink');files=[{'path':r['path'][1:],'bytes':r['bytes'],'sha256':r['sha256']} for r in m.SPEC['members'] if r['type']=='regular' and (r['path'].startswith('./usr/share/fonts/') or '/fontconfig/' in r['path'])]
  faces=[{**f,'glyphs':[{'codepoint':cp,'glyphIndex':j+1} for j,cp in enumerate(m.SPEC['requiredCodepoints'])],'missingCodepoint':0x10ffff,'missingGlyphIndex':0} for f in m.SPEC['faces']]
  return {'schema':1,'status':'passed','identity':i,'specSHA256':m.SPEC_SHA,'package':{'name':m.SPEC['package'],**{k:m.SPEC[k] for k in ['version','url','bytes','sha256']}},'transactionState':'complete','beforeAudit':'','afterAudit':'','changes':['fonts-noto-cjk'],'simulationChanges':['fonts-noto-cjk'],'aptOrigin':'500 https://archive.ubuntu.com/ubuntu noble/main amd64 Packages','installed':{'files':files,'configLink':{'path':link['path'][1:],'target':link['linkTarget']}},'faces':faces,'freetype':{'path':'/usr/lib/x86_64-linux-gnu/libfreetype.so.6.20.1','bytes':123,'sha256':'b'*64,'version':'2.13.2'},'fontconfig':{'version':'fontconfig version 2.15.0','matches':[dict(zip(['path','index','family','postScriptName'],[f['path'],str(f['index']),f['family'],f['postScriptName']])) for f in m.SPEC['faces']],'queries':[{'face':f['postScriptName'],'fontVersion':'131334'} for f in m.SPEC['faces']]},'footprint':{'normalMaintscriptsAndTriggers':True,'maintscriptSHA256':'f85775a5ec255da85d32cd6604dc1daea5d57cf30908b2520dd3e0463159754c','legacyConffileMigration':'/etc/fonts/conf.avail/70-fonts-noto-cjk.conf','normalSystemWrites':['/var/lib/dpkg','/var/log/apt','/var/log/dpkg.log','/var/cache/fontconfig'],'cacheBefore':[],'cacheAfter':[]},'scratchClean':True,'contracts':{'tests':18,'passed':True,'outputSHA256':'c'*64},'commands':[{'program':p,'exit':0,'stdoutBytes':0,'stderrBytes':0,'logTruncated':False} for p in ['python3','dpkg','dpkg-query','apt-cache','apt-cache','curl','apt-get','sudo','dpkg','dpkg-query','fc-match','fc-match','fc-query','fc-match','fc-query']]}
 def test_complete_receipt_positive_and_missing_provenance_negatives(self):
  import copy
  m=self.m();q=self.fixture();m.validate_receipt(q,q['identity'])
  for section,key in [(None,'contracts'),(None,'aptOrigin'),(None,'commands'),(None,'simulationChanges'),('footprint','maintscriptSHA256'),('footprint','legacyConffileMigration'),('footprint','normalSystemWrites'),('freetype','path'),('freetype','bytes')]:
   bad=copy.deepcopy(q);del (bad if section is None else bad[section])[key]
   with self.subTest(section=section,key=key):self.assertRaises(ValueError,m.validate_receipt,bad,q['identity'])
  for change in [lambda x:x['fontconfig']['queries'].__setitem__(0,{}),lambda x:x['footprint'].__setitem__('cacheAfter',[{}]),lambda x:x['commands'][0].__setitem__('exit',None),lambda x:x.__setitem__('simulationChanges',[])]:
   bad=copy.deepcopy(q);change(bad);self.assertRaises(ValueError,m.validate_receipt,bad,q['identity'])
if __name__=='__main__':unittest.main()
