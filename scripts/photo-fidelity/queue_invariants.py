"""Research queue progress invariants, unchanged by storage migration."""
def validate_progress(q):
 items=q['items'];ids=[x['id'] for x in items];ix={x['id']:x for x in items}
 if len(ids)!=len(set(ids)):raise ValueError('duplicate task ID')
 instance_keys=[x['runtimeInstanceKey'] for x in items if x.get('runtimeInstanceKey')]
 if len(instance_keys)!=len(set(instance_keys)):raise ValueError('duplicate runtime instance review; use one ID and typed parent references')
 visiting=set();done=set()
 def visit(key):
  if key in visiting:raise ValueError('required child dependency cycle')
  if key in done or key not in ix:return
  visiting.add(key)
  for child in ix[key].get('requiredChildIds',[]):visit(child)
  visiting.remove(key);done.add(key)
 for key in ids:visit(key)
 for item in items:
  for child in item.get('requiredChildIds',[]):
   if child==item['id'] or child not in ix:raise ValueError(f'{item["id"]}: invalid required child')
  candidates=item.get('requiredComponentCandidates',[])
  if not isinstance(candidates,list) or len({c.get('id') for c in candidates})!=len(candidates):raise ValueError('invalid required component candidates')
  for c in candidates:
   if not isinstance(c.get('id'),str) or c.get('required') is not True or set(c.get('facets',{}))!={'exterior','interior'} or any(v not in q['statusVocabulary'] for v in c['facets'].values()):raise ValueError('invalid required component candidate scope')
  for side,facet in item['facets'].items():
   state=facet['status']
   if state not in q['statusVocabulary']:raise ValueError(f'{item["id"]}: invalid state')
   if state=='NOT_APPLICABLE' and not facet.get('notApplicableReason'):raise ValueError(f'{item["id"]}: missing N/A reason')
   if state=='ACCEPTED':
    if any(c['facets'][side] not in ['ACCEPTED','NOT_APPLICABLE'] or (c['facets'][side]=='ACCEPTED' and not c.get('runtimeBinding')) for c in candidates):raise ValueError(f'{item["id"]}: required source component remains unresolved')
    ev=facet.get('visualEvidence',{})
    if not all(ev.get(k) for k in ['before','after','referenceComparison','browserRun']):raise ValueError(f'{item["id"]}: browser before/after evidence required')
    if not item.get('acceptanceRecords'):raise ValueError(f'{item["id"]}: acceptance record required')
    if any(f['status'] not in ['ACCEPTED','NOT_APPLICABLE'] for f in facet.get('features',[])):raise ValueError(f'{item["id"]}: required feature remains open')
    for child in item.get('requiredChildIds',[]):
     if ix[child]['facets'][side]['status'] not in ['ACCEPTED','NOT_APPLICABLE']:raise ValueError(f'{item["id"]}: required child remains open')
  if item.get('currentCycleAccepted') and any(f['status'] not in ['ACCEPTED','NOT_APPLICABLE'] for f in item['facets'].values()):raise ValueError(f'{item["id"]}: incomplete full acceptance')
 return True
