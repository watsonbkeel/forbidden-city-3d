"""Fixed E45 result auditor. Pure data only, no child, files or native imports.

The caller must supply the independently bound input receipt. This is not an
input provisioner. It cannot approve a different runtime or font inventory.
"""
import re

STAGES=['ENVIRONMENT','REGISTERED','INIT','E45_ROUTES','POINT_MATRIX','FAR','RETURN','CLEANUP']
ORDER=['axis-courts','east-six','west-six','ningshou','outer-east','outer-west','garden','yuqing-south-entry']
TARGET=ORDER[-1]
POINTS=[('axis-core',0,0,ORDER[0]),('east-E46',-134.5,207,ORDER[1]),('west-six',100,300,ORDER[2]),
        ('ningshou',-260,320,ORDER[3]),('outer-east',-250,0,ORDER[4]),('outer-west',220,400,ORDER[5]),
        ('garden',0,450,ORDER[6]),('E45',-134.5,193,TARGET),('E45-north-near',-134.5,204.999,TARGET),
        ('E45-shared-edge',-134.5,205,ORDER[1]),('E45-east-edge',-130.25,193,TARGET),
        ('east-gap',-130.125,193,None),('axis-west-edge',-130,193,ORDER[0])]
NEIGHBORS={ORDER[0]:[ORDER[i] for i in [1,4,5,6,7]],ORDER[1]:[ORDER[i] for i in [0,3,6,7]],
           ORDER[2]:[ORDER[i] for i in [5,6]],ORDER[3]:[ORDER[i] for i in [1,4]],
           ORDER[4]:[ORDER[i] for i in [0,3]],ORDER[5]:[ORDER[i] for i in [0,2]],
           ORDER[6]:[ORDER[i] for i in [0,1,2]],TARGET:[ORDER[i] for i in [1,0]]}
CONFIG_PINS={
'axis-courts':'ed8cd05302b600e55a4a303740dc2396988f009deb8c28e4abefa4144c701560',
'east-six':'d32c3d15e5c050e3530e4e424b7706d9a8206383b62383dfc14c5f8e663a6f4f',
'west-six':'a98ddde19f72fa3facc8fdfe5ec3c3130fc1ad572c3d4550661b44885a42a66e',
'ningshou':'3d7906a94d0ae48f4321bb98ce545de668a0ff4c7279535a2b431c6620a1421c',
'outer-east':'b943383090570f93772a35f39240dfdd1bccec4be265a9fb30dc40b48a956417',
'outer-west':'ad0dfb1fc2f47218603f3aadf031b8dc1f0563f2824434fa474e5eb05aef2b30',
'garden':'b5ae0e20de5b0b62768575efc44460ee2ead7b5f01b3e7ec71daa6c6c37f75dd',
'yuqing-south-entry':'80ae091bf1adef3775adbd2bbbdb6da4beb2a98d6faf5ffed163541e3e833ad4'}
CORE='schema status completed cleanup_complete candidate_commit candidate_tree input_manifest_sha256 stages assertionGroups errors cleanupErrors physics routes pointStates'.split()
EXTRA='runtime environment configuration startup staticScope ownerBranch resources nativeText'.split()
OWNERS='loaded prebuilt cache cacheBytes'
DIGEST='records bytes sha256'
PHYSICS='colliders walkables templates '+DIGEST
COST='cacheable geometryBytes geometryAttributeBytes textureBytes accountedBytes geometries textures'
STATIC={
'included':['PalaceBuilder.buildGate(original PALACE_LAYOUT 乾清门)','Enclosure.buildOuterWalls(original layout)'],
'alreadyInZones':['axis-courts/items/4 景运门','axis-courts/items/6 东轴墙','east-six original E46'],
'excluded':['Other static PalaceBuilder palaces/gates/river rendering','Static GardenBuilder and corner/corridor methods','Characters, active GLB interiors, lights and GPU'],
'wholeWorld':False}

class ResultError(ValueError): pass

def need(ok,message):
    if not ok: raise ResultError(message)
def keys(obj,names):
    expected=set(names.split() if isinstance(names,str) else names)
    need(isinstance(obj,dict) and set(obj)==expected,'exact fields: '+','.join(sorted(expected)))
def uint(value): need(type(value) is int and 0<=value<=2**53-1,'safe nonnegative integer')
def hash64(value): need(isinstance(value,str) and re.fullmatch('[a-f0-9]{64}',value) is not None,'SHA256')
def digest(row,names=DIGEST):
    keys(row,names);uint(row['records']);uint(row['bytes']);hash64(row['sha256'])
def cost(row):
    keys(row,COST);need(row['cacheable'] is True,'finite cacheable cost')
    for name in COST.split()[1:]:uint(row[name])
    need(row['accountedBytes']==row['geometryBytes']+row['textureBytes'],'cost sum')
def ownership(row):
    need(isinstance(row['cache'],list),'cache array');ids=[];total=0
    for entry in row['cache']:
        keys(entry,'id cost');cost(entry['cost']);ids.append(entry['id']);total+=entry['cost']['accountedBytes']
    allids=[]
    for group in (row['loaded'],row['prebuilt'],ids):
        need(isinstance(group,list) and all(type(x) is str and x in ORDER for x in group),'owner ids')
        allids+=group
    need(len(set(allids))==len(allids),'duplicate physical zone owner')
    uint(row['cacheBytes']);need(len(ids)<=2 and row['cacheBytes']==total<=33554432,'cache bounds/accounting')
def physics(row,labeled=False):
    digest(row,('label ' if labeled else '')+PHYSICS)
    for key in ('colliders','walkables','templates'):uint(row[key])
    need(row['records']==row['colliders']+row['walkables']+row['templates'],'complete physical occurrence stream count')
def error_rows(rows,cleanup=False):
    need(isinstance(rows,list),'errors array')
    for row in rows:
        keys(row,'name message' if cleanup else 'stage name message')
        need(all(type(v) is str for v in row.values()),'error strings')

def validate_payload(r,binding,*,input_doc):
    """Exact final PASS acceptance; bounded partial FAIL remains non-success."""
    need(isinstance(r,dict) and set(CORE)<=set(r)<=set(CORE+EXTRA),'top result fields')
    need(r['schema']=='e45-eight-zone-result/v1','schema')
    need(r['status'] in ('PASS','FAIL','INCOMPLETE'),'status')
    for field in ('completed','cleanup_complete'):need(type(r[field]) is bool,'completion boolean')
    for key in ('candidate_commit','candidate_tree','input_manifest_sha256'):
        need(r[key]==binding[key],'native/input identity '+key)
    need(r['candidate_commit']==input_doc['candidateCommit'] and r['candidate_tree']==input_doc['candidateTree'],'input native head/tree')
    for field in ('stages','assertionGroups'):
        need(isinstance(r[field],list) and r[field]==STAGES[:len(r[field])],'ordered completed stage prefix')
    need(r['stages']==r['assertionGroups'],'groups reflect completed stages')
    error_rows(r['errors']);error_rows(r['cleanupErrors'],True)
    need(isinstance(r['pointStates'],list) and isinstance(r['physics'],list) and isinstance(r['routes'],dict),'receipt containers')
    if r['status']!='PASS':
        need(r['completed'] is False,'non-PASS completed false')
        need(bool(r['errors'] or r['cleanupErrors']),'non-PASS reason required')
        need(len(r['pointStates'])<=13 and len(r['physics'])<=16,'partial receipt bounds')
        need(set(r['routes'])<=set(('initial','returned')),'partial route fields')
        return r['status']
    keys(r,CORE+EXTRA)
    need(r['completed'] and r['cleanup_complete'] and not r['errors'] and not r['cleanupErrors'],'clean completed PASS')
    need(r['stages']==STAGES,'all eight stages')
    keys(r['runtime'],'files manifest_sha256');need(r['runtime']['files']==1012,'runtime boundary file count')
    hash64(r['runtime']['manifest_sha256']);need(r['runtime']['manifest_sha256']==input_doc['sourceInventorySha256'],'source inventory binding')
    env=r['environment'];keys(env,'assets quality anisotropy fonts nativeCanvas declaredJavaScriptWrites nativeWriteAudit')
    need(env['quality']=='hd' and type(env['anisotropy']) is int and env['anisotropy']==4 and env['nativeCanvas'] is True,'actual native environment')
    need(env['declaredJavaScriptWrites']==[] and env['nativeWriteAudit']=='PARENT_SANDBOX_DIRECTORY_AUDIT_REQUIRED','writer declarations, not confinement claim')
    need(env['assets']==input_doc['assets'] and len(env['assets'])>22,'all actual consumed asset pins')
    seen=set()
    for asset in env['assets']:
        keys(asset,'path bytes sha256');need(type(asset['path']) is str and re.fullmatch(r'public/textures/hd/[A-Za-z0-9_.-]+',asset['path']) is not None,'asset path')
        need(asset['path'] not in seen,'duplicate consumed asset');seen.add(asset['path']);uint(asset['bytes']);hash64(asset['sha256'])
    need(env['fonts']==input_doc['fonts'] and bool(env['fonts']),'exact controlled registered font input')
    for font in env['fonts']:
        keys(font,'path sha256 family coverageRanges coverageEvidence');hash64(font['sha256'])
        need(type(font['path']) is str and type(font['family']) is str and font['family'],'font identity')
        need(isinstance(font['coverageEvidence'],dict) and bool(font['coverageEvidence']),'actual file/face query evidence')
        last=-1;need(isinstance(font['coverageRanges'],list) and bool(font['coverageRanges']),'actual finite font coverage')
        for span in font['coverageRanges']:
            need(isinstance(span,list) and len(span)==2,'font range pair');lo,hi=span
            need(type(lo) is int and type(hi) is int and last<lo<=hi<=0x10ffff,'ordered finite font ranges');last=hi
    cfg=r['configuration'];keys(cfg,'order hashes cache rivers moats');need(cfg['order']==ORDER and cfg['hashes']==CONFIG_PINS,'exact eight configurations')
    need(cfg['cache']=={'maxEntries':2,'maxBytes':33554432,'ttlMs':120000},'unchanged cache policy');hash64(cfg['rivers']);hash64(cfg['moats'])
    startup=r['startup'];keys(startup,'realBuilders registered allRegions allMapItems allRooms '+OWNERS)
    need(type(startup['realBuilders']) is int and startup['realBuilders']==8 and type(startup['registered']) is int and startup['registered']==8,'eight actual startup builders')
    ownership(startup);need(len(startup['loaded'])+len(startup['prebuilt'])==8 and not startup['cache'],'complete initial retained ownership')
    for field in ('allRegions','allMapItems','allRooms'):uint(startup[field])
    need(len(r['pointStates'])==13,'all thirteen point states');previous=TARGET
    for p,(label,x,z,expected) in zip(r['pointStates'],POINTS):
        keys(p,'label x z expected updates current '+OWNERS+' physics mode ensured requests')
        need((p['label'],p['x'],p['z'],p['expected'])==(label,x,z,expected),'fixed point identity')
        need(type(p['x']) in (int,float) and type(p['z']) in (int,float),'numeric point coordinates')
        need(p['mode']=='ensure-and-update' and p['ensured']==expected,'actual point mode')
        uint(p['updates']);need(1<=p['updates']<=32,'finite queue drain');ownership(p);physics(p['physics'])
        current=expected or previous;need(p['current']==current,'point current owner');previous=current
        need(p['requests']==([expected]+NEIGHBORS[expected] if expected else []),'complete exact ensure request list')
        need(current in p['loaded'],'point current owner must be loaded')
        need(all(zone in p['loaded'] for zone in p['requests']),'synchronously requested owners must be loaded')
    expected_labels=['initial-routes']+[p[0] for p in POINTS]+['natural-far','returned-routes']
    need(len(r['physics'])==16,'all sixteen complete physical receipts')
    for index,(row,label) in enumerate(zip(r['physics'],expected_labels)):
        physics(row,True);need(row['label']==label,'ordered physics label')
        if 1<=index<=13:need({k:v for k,v in row.items() if k!='label'}==r['pointStates'][index-1]['physics'],'point physical receipt equality')
    keys(r['routes'],'initial returned')
    for name,count in (('initial',50),('returned',16)):
        route=r['routes'][name];digest(route,'routes frames '+DIGEST);uint(route['routes']);uint(route['frames'])
        need(route['routes']==route['records']==count and route['frames']>count and route['bytes']>0,'complete native route/frame receipt')
    owner=r['ownerBranch'];keys(owner,'unloaded retained firstBuildId cost returnedBuildId');cost(owner['cost'])
    need(owner['unloaded'] is True and type(owner['retained']) is bool,'natural unload branch')
    uint(owner['firstBuildId']);uint(owner['returnedBuildId']);need(owner['retained']==(owner['firstBuildId']==owner['returnedBuildId']),'natural return owner identity')
    res=r['resources'];keys(res,'finalLoaded finalPrebuilt finalCache finalColliders finalWalkables builds tracked events '+DIGEST)
    for key in ('finalLoaded','finalPrebuilt','finalCache','finalColliders','finalWalkables'):need(type(res[key]) is int and res[key]==0,'final resource cleanup '+key)
    for key in ('tracked','events','records','bytes'):uint(res[key])
    hash64(res['sha256']);need(res['tracked']==res['records'] and res['events']>=res['tracked'],'complete owned resource event receipt')
    need(isinstance(res['builds'],list) and len(res['builds'])>=8,'startup plus natural rebuilt owners')
    for index,build in enumerate(res['builds']):
        keys(build,'id zone completed disposals colliders walkables regions rooms mapItems')
        need(type(build['id']) is int and build['id']==index and build['zone'] in ORDER and build['completed'] is True and type(build['disposals']) is int and build['disposals']==1,'builder lifecycle identity')
        for name in ('colliders','walkables','regions','rooms','mapItems'):uint(build[name])
        if build['zone']==TARGET:need(build['colliders']==76 and build['walkables']==2,'all E45 source collider/support occurrences')
    need([b['zone'] for b in res['builds'][:8]]==ORDER,'startup build order')
    for key in ('firstBuildId','returnedBuildId'):need(owner[key]<len(res['builds']) and res['builds'][owner[key]]['zone']==TARGET,'E45 owner build reference')
    target_ids=[b['id'] for b in res['builds'] if b['zone']==TARGET]
    need(owner['returnedBuildId']==target_ids[-1],'final E45 owner is the returned owner')
    if not owner['retained']:
        need(owner['returnedBuildId']>owner['firstBuildId'] and target_ids.index(owner['returnedBuildId'])==target_ids.index(owner['firstBuildId'])+1,'one fresh natural E45 rebuild')
    text=r['nativeText'];keys(text,'scope actualSelectedFace registeredFaces requestedTexts observedCodepoints requests textures rowReadbackLimitBytes')
    need(text['scope']=='ACTUAL_NATIVE_REQUESTS_AND_FINAL_CONSUMED_TEXTURES_NOT_BROWSER_EQUIVALENCE' and text['actualSelectedFace']=='NOT_EXPOSED_BY_API','honest native font scope')
    need(type(text['rowReadbackLimitBytes']) is int and text['rowReadbackLimitBytes']==65536,'bounded full pixel readback')
    need(isinstance(text['registeredFaces'],list) and bool(text['registeredFaces']),'actual native available faces')
    for face in text['registeredFaces']:
        keys(face,'family styles');need(type(face['family']) is str and bool(face['family']) and isinstance(face['styles'],list) and bool(face['styles']),'registered family/styles')
        for style in face['styles']:
            keys(style,'weight width style');uint(style['weight']);need(type(style['width']) is str and type(style['style']) is str,'native style fields')
    need(isinstance(text['requestedTexts'],list) and bool(text['requestedTexts']),'actual requested text list');cps=set();requests=set()
    for request in text['requestedTexts']:
        keys(request,'font text');need(type(request['text']) is str and type(request['font']) is str,'requested strings')
        pair=(request['font'],request['text']);need(pair not in requests,'unique requested text pairs');requests.add(pair)
        cps.update(ord(c) for c in request['text'] if ord(c)>=32)
    need(text['observedCodepoints']==sorted(cps),'complete actual requested codepoint set')
    for cp in cps:need(any(lo<=cp<=hi for f in env['fonts'] for lo,hi in f['coverageRanges']),'controlled available glyph coverage')
    for key in ('requests','textures'):digest(text[key]);need(text[key]['records']>0 and text[key]['bytes']>0,'complete native request/pixel receipts')
    need(text['requests']['records']>=len(requests),'all actual text occurrences')
    need(r['staticScope']==STATIC,'exact supplemental static scope, no duplicate zone objects')
    return 'PASS'
