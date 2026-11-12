if not __debug__:
 raise RuntimeError('Python optimization is not permitted for evidence checks')
import resource,pathlib,json,sys
resource.setrlimit(resource.RLIMIT_AS,(128*1024**2,128*1024**2))
b=pathlib.Path(__file__).resolve().parent
current=pathlib.Path(sys.argv[1])
prior=b/'fixtures'
def prior_fields_equal(old,new,path=''):
 if isinstance(old,dict):
  for k,v in old.items():assert k in new,path+'/'+k;prior_fields_equal(v,new[k],path+'/'+k)
 elif isinstance(old,list):
  assert len(old)==len(new),path
  for i,(v,w) in enumerate(zip(old,new)):prior_fields_equal(v,w,path+f'/{i}')
 else:assert old==new,(path,old,new)
rows=[]
for subject,visible,other,hair in [('shakyamuni',3,21,9),('amitabha',2,20,10),('bhaisajyaguru',5,18,12)]:
 old=json.loads((prior/f'reviewed-6998-figure-{subject}.json').read_text());new=json.loads((current/f'FIGURE-{subject}.json').read_text());prior_fields_equal(old,new)
 assert sum(q['selectedEndpointVisible']for q in new['rays'])==visible
 assert sum(q['newFirst']['role']!=q['targetRole']for q in new['rays'])==other
 assert sum(q['visibleNoseSurfaceWitness'] is not None for q in new['rays'])==12
 assert sum(q['visibleCrownSurfaceWitness'] is not None for q in new['rays'])==hair
 for q in new['rays']+new['highViewRays']:
  assert q['oldFirst']['ownerId'] and q['newFirst']['ownerId']
  for k in ['visibleNoseSurfaceWitness','visibleCrownSurfaceWitness']:
   if q[k]:assert q[k]['onActualTriangle'] and q[k]['sameOldNewFirstSurface']
 rows.append({'subject':subject,'allPriorTargetsAndHitFieldsPreserved':True,'directEndpointCount':visible,'firstOtherRoleCount':other,'noseWitnessCount':12,'crownWitnessCount':hair})
print(json.dumps({'status':'PASS_ADDITIVE_CLASSIFICATION_NO_TARGET_OR_PRIOR_HIT_CHANGE','subjects':rows},indent=2))
