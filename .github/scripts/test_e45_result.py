"""Fixed synthetic schema mutations. No product, native or filesystem imports."""
import copy
import unittest
import r181_e45_result as r

H='a'*64

def fixture():
    digest={'records':1,'bytes':32,'sha256':H}
    physical={'colliders':1,'walkables':1,'templates':0,'records':2,'bytes':32,'sha256':H}
    cost={'cacheable':True,'geometryBytes':1,'geometryAttributeBytes':1,'textureBytes':2,'accountedBytes':3,'geometries':1,'textures':1}
    assets=[{'path':f'public/textures/hd/fixture-{i}.webp','bytes':1,'sha256':H} for i in range(23)]
    fonts=[{'path':'/synthetic-font-only','sha256':H,'family':'Fixture','coverageRanges':[[32,127]],
            'coverageEvidence':{'synthetic':True}}]
    input_doc={'candidateCommit':'1'*40,'candidateTree':'2'*40,'sourceInventorySha256':H,'fonts':fonts,'assets':assets}
    binding={'candidate_commit':input_doc['candidateCommit'],'candidate_tree':input_doc['candidateTree'],'input_manifest_sha256':'3'*64}
    out={'schema':'e45-eight-zone-result/v1','status':'PASS','completed':True,'cleanup_complete':True,**binding,
         'stages':r.STAGES[:],'assertionGroups':r.STAGES[:],'errors':[],'cleanupErrors':[],
         'runtime':{'files':1012,'manifest_sha256':H},
         'environment':{'assets':copy.deepcopy(assets),'quality':'hd','anisotropy':4,'fonts':copy.deepcopy(fonts),'nativeCanvas':True,
                        'declaredJavaScriptWrites':[],'nativeWriteAudit':'PARENT_SANDBOX_DIRECTORY_AUDIT_REQUIRED'},
         'configuration':{'order':r.ORDER[:],'hashes':r.CONFIG_PINS.copy(),'cache':{'maxEntries':2,'maxBytes':33554432,'ttlMs':120000},'rivers':H,'moats':H},
         'startup':{'realBuilders':8,'registered':8,'allRegions':1,'allMapItems':1,'allRooms':1,'loaded':[r.TARGET],
                    'prebuilt':r.ORDER[:-1],'cache':[],'cacheBytes':0},
         'staticScope':copy.deepcopy(r.STATIC),
         'ownerBranch':{'unloaded':True,'retained':True,'firstBuildId':7,'returnedBuildId':7,'cost':cost},
         'routes':{name:{'routes':n,'frames':100,'records':n,'bytes':1000,'sha256':H} for name,n in [('initial',50),('returned',16)]},
         'pointStates':[],
         'physics':[{'label':label,**physical} for label in ['initial-routes']+[p[0] for p in r.POINTS]+['natural-far','returned-routes']],
         'resources':{'finalLoaded':0,'finalPrebuilt':0,'finalCache':0,'finalColliders':0,'finalWalkables':0,
                      'tracked':8,'events':8,'records':8,'bytes':100,'sha256':H,
                      'builds':[{'id':i,'zone':zone,'completed':True,'disposals':1,'colliders':76 if zone==r.TARGET else 1,'walkables':2 if zone==r.TARGET else 1,'regions':1,'rooms':1,'mapItems':1}
                                for i,zone in enumerate(r.ORDER)]},
         'nativeText':{'scope':'ACTUAL_NATIVE_REQUESTS_AND_FINAL_CONSUMED_TEXTURES_NOT_BROWSER_EQUIVALENCE','actualSelectedFace':'NOT_EXPOSED_BY_API',
                       'registeredFaces':[{'family':'Fixture','styles':[{'weight':400,'width':'normal','style':'normal'}]}],
                       'requestedTexts':[{'font':'12px Fixture','text':'A'}],'observedCodepoints':[65],
                       'requests':digest.copy(),'textures':digest.copy(),'rowReadbackLimitBytes':65536}}
    previous=r.TARGET
    for label,x,z,expected in r.POINTS:
        current=expected or previous;previous=current
        out['pointStates'].append({'label':label,'x':x,'z':z,'expected':expected,'updates':1,'current':current,
            'loaded':[expected]+r.NEIGHBORS[expected] if expected else [current],'prebuilt':[],'cache':[],'cacheBytes':0,'physics':physical.copy(),
            'mode':'ensure-and-update','ensured':expected,'requests':[expected]+r.NEIGHBORS[expected] if expected else []})
    return out,binding,input_doc

class ResultFixtures(unittest.TestCase):
    def audit(self,out,binding,doc):return r.validate_payload(out,binding,input_doc=doc)
    def test_complete_synthetic_pass(self):self.assertEqual(self.audit(*fixture()),'PASS')
    def test_all_top_level_omissions_and_unknowns_fail(self):
        for name in r.CORE+r.EXTRA:
            out,b,d=fixture();del out[name]
            with self.subTest(name=name),self.assertRaises(r.ResultError):self.audit(out,b,d)
        out,b,d=fixture();out['unexpected']=True
        with self.assertRaises(r.ResultError):self.audit(out,b,d)
    def test_each_nested_object_rejects_unknown_field(self):
        for path in [('runtime',),('environment',),('configuration',),('startup',),('pointStates',0),('physics',0),('routes','initial'),
                     ('ownerBranch',),('resources',),('resources','builds',0),('nativeText',),('nativeText','requestedTexts',0),
                     ('nativeText','registeredFaces',0),('nativeText','registeredFaces',0,'styles',0)]:
            out,b,d=fixture();target=out
            for key in path:target=target[key]
            target['unexpected']=True
            with self.subTest(path=path),self.assertRaises(r.ResultError):self.audit(out,b,d)
    def test_identity_inventory_assets_and_fonts_are_bound(self):
        for field in ['candidate_commit','candidate_tree','input_manifest_sha256']:
            out,b,d=fixture();out[field]='f'*len(out[field])
            with self.subTest(field=field),self.assertRaises(r.ResultError):self.audit(out,b,d)
        for field in ['assets','fonts']:
            out,b,d=fixture();out['environment'][field][0]['sha256']='f'*64
            with self.subTest(field=field),self.assertRaises(r.ResultError):self.audit(out,b,d)
    def test_ordered_stages_and_thirteen_points(self):
        for field in ['stages','assertionGroups','pointStates','physics']:
            out,b,d=fixture();out[field].pop()
            with self.subTest(field=field),self.assertRaises(r.ResultError):self.audit(out,b,d)
        out,b,d=fixture();out['pointStates'][0]['requests'].pop()
        with self.assertRaises(r.ResultError):self.audit(out,b,d)
        out,b,d=fixture();out['pointStates'][11]['requests']=[r.TARGET]
        with self.assertRaises(r.ResultError):self.audit(out,b,d)
    def test_point_current_must_be_actually_loaded(self):
        out,b,d=fixture();out['pointStates'][0]['loaded']=[]
        with self.assertRaises(r.ResultError):self.audit(out,b,d)
    def test_every_synchronous_request_must_be_actually_loaded(self):
        out,b,d=fixture();point=out['pointStates'][0];point['loaded']=[point['current']]
        self.assertTrue(any(zone!=point['current'] for zone in point['requests']))
        with self.assertRaises(r.ResultError):self.audit(out,b,d)
    def test_null_point_keeps_current_without_exact_historical_loaded_set(self):
        out,b,d=fixture();point=out['pointStates'][11]
        self.assertIsNone(point['expected']);self.assertEqual(point['requests'],[])
        point['loaded']=[point['current'],'axis-courts']
        self.assertEqual(self.audit(out,b,d),'PASS')
    def test_cache_or_owner_duplicates_fail(self):
        out,b,d=fixture();out['startup']['prebuilt'].append(r.TARGET)
        with self.assertRaises(r.ResultError):self.audit(out,b,d)
        out,b,d=fixture();out['configuration']['cache']['maxBytes']*=2
        with self.assertRaises(r.ResultError):self.audit(out,b,d)
    def test_complete_physics_counts_and_equality(self):
        out,b,d=fixture();out['physics'][1]['records']-=1
        with self.assertRaises(r.ResultError):self.audit(out,b,d)
        out,b,d=fixture();out['physics'][1]['sha256']='f'*64
        with self.assertRaises(r.ResultError):self.audit(out,b,d)
    def test_natural_owner_branch_and_all_cleanup_fields(self):
        for field in ['finalLoaded','finalPrebuilt','finalCache','finalColliders','finalWalkables']:
            out,b,d=fixture();out['resources'][field]=1
            with self.subTest(field=field),self.assertRaises(r.ResultError):self.audit(out,b,d)
        out,b,d=fixture();out['ownerBranch']['returnedBuildId']=6
        with self.assertRaises(r.ResultError):self.audit(out,b,d)
        out,b,d=fixture();out['resources']['builds'][7]['disposals']=0
        with self.assertRaises(r.ResultError):self.audit(out,b,d)
    def test_e45_owner_counts_match_all_76_colliders_and_two_supports(self):
        out,b,d=fixture();out['resources']['builds'][7]['colliders']=75
        with self.assertRaises(r.ResultError):self.audit(out,b,d)
        out,b,d=fixture();out['resources']['builds'][7]['walkables']=1
        with self.assertRaises(r.ResultError):self.audit(out,b,d)
    def test_natural_disposed_rebuild_is_allowed(self):
        out,b,d=fixture();owner=out['ownerBranch'];owner['retained']=False;owner['returnedBuildId']=8
        build=copy.deepcopy(out['resources']['builds'][7]);build['id']=8;out['resources']['builds'].append(build)
        self.assertEqual(self.audit(out,b,d),'PASS')
    def test_return_cannot_claim_an_older_or_nonfinal_e45_owner(self):
        out,b,d=fixture();earlier=copy.deepcopy(out['resources']['builds'][7]);earlier['id']=8
        out['resources']['builds'].append(earlier)
        out['ownerBranch'].update(retained=False,firstBuildId=8,returnedBuildId=7)
        with self.assertRaises(r.ResultError):self.audit(out,b,d)
        out,b,d=fixture();later=copy.deepcopy(out['resources']['builds'][7]);later['id']=8
        out['resources']['builds'].append(later)
        with self.assertRaises(r.ResultError):self.audit(out,b,d)
    def test_no_boolean_numbers_or_negative_extents(self):
        for value in [True,-1,1.25,2**53]:
            out,b,d=fixture();out['routes']['initial']['frames']=value
            with self.subTest(value=value),self.assertRaises(r.ResultError):self.audit(out,b,d)
    def test_finite_glyph_coverage_and_complete_request_set(self):
        out,b,d=fixture();out['nativeText']['requestedTexts'][0]['text']='前'
        with self.assertRaises(r.ResultError):self.audit(out,b,d)
        out,b,d=fixture();out['nativeText']['observedCodepoints']=[]
        with self.assertRaises(r.ResultError):self.audit(out,b,d)
        out,b,d=fixture();out['nativeText']['actualSelectedFace']='Noto Sans CJK SC'
        with self.assertRaises(r.ResultError):self.audit(out,b,d)
        out,b,d=fixture();out['nativeText']['textures']['records']=0
        with self.assertRaises(r.ResultError):self.audit(out,b,d)
    def test_partial_fail_is_never_success(self):
        out,b,d=fixture();out={k:v for k,v in out.items() if k in r.CORE};out.update(status='FAIL',completed=False,
            stages=['ENVIRONMENT'],assertionGroups=['ENVIRONMENT'],physics=[],pointStates=[],routes={},
            errors=[{'stage':'ENVIRONMENT','name':'AssertionError','message':'synthetic failure'}])
        self.assertEqual(self.audit(out,b,d),'FAIL')
        out['status']='PASS'
        with self.assertRaises(r.ResultError):self.audit(out,b,d)

if __name__=='__main__':unittest.main(verbosity=2)
