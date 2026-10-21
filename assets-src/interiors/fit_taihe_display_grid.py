"""R34 exact-base rigid display registration, never a rescale or broad rebuild.
Only Z coordinates of complete faces inside the frozen display volume change.
Columns, their bases, hangings and the whole caisson are outside that volume.
The source hash, face closure, semantic inventory and profile whitelist are all
checked before output. Original GLB remains available for rollback.
"""
import copy
import json
import struct
from pathlib import Path
from append_taihe_caisson import pack_glb, unpack_glb, sha

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT/'public/models/interiors/taihe-hanging-fit-b032ccb094e0.glb'
BASE_SHA = 'b032ccb094e04100a7fc989467b1703b7ed58f143ff3a511e1c504ec38d84917'
BASE_PROFILE = ROOT/'assets-src/interiors/taihe_spatial_fit/r33-profile.json'
BASE_PROFILE_SHA = '10d682b9816e7601f1215ab859a29de086ddba6caf34d58032070dbbdddb6347'
PROFILE = ROOT/'data/architecture/taihe-core.json'
DISPLAY_PREFIXES = ('dais_', 'throne_', 'screen_', 'screenCrown_', 'display_', 'enamelCrane_', 'r7_dais_', 'furniture_')

def in_display(point):
    x,y,z=point
    return abs(x)<3.64 and y<7 and z>0

def fit(base, profile_bytes):
    if sha(base)!=BASE_SHA: raise ValueError('Unknown frozen R33 spatial baseline')
    if sha(BASE_PROFILE.read_bytes())!=BASE_PROFILE_SHA: raise ValueError('Changed frozen R33 profile')
    before=json.loads(BASE_PROFILE.read_bytes());profile=json.loads(profile_bytes)
    if profile.get('spatialFit',{}).get('id')!='r34-taihe-display-grid-fit' or profile['spatialFit'].get('deltaZ')!=-2:
        raise ValueError('Unknown display spatial fit')
    delta=profile['spatialFit']['deltaZ'];restored=copy.deepcopy(profile)
    for key in ('revision','status'):restored[key]=before[key]
    restored.pop('spatialFit')
    for key,fields in [('dais',('z0','z1')),('throne',('z',)),('screen',('z',))]:
        for field in fields:
            if abs(profile[key][field]-before[key][field]-delta)>1e-9:raise ValueError('Display registration must be rigid')
            restored[key][field]=before[key][field]
    for key in ('dais','screen'):restored[key]['registration']=before[key]['registration']
    if restored!=before:raise ValueError('Unrelated core profile change')
    gltf,binary=unpack_glb(base);gltf=copy.deepcopy(gltf);output=bytearray(binary);allowed=set();selections=[]
    if len(gltf['meshes'])!=8 or len(gltf['materials'])!=8:raise ValueError('Changed eight-batch source')
    for mi,mesh in enumerate(gltf['meshes']):
        if len(mesh['primitives'])!=1:raise ValueError('Unexpected primitive layout')
        nodes=[n for n in gltf['nodes'] if n.get('mesh')==mi]
        if len(nodes)!=1 or any(k in nodes[0] for k in ('rotation','scale','matrix')):raise ValueError('Expected untranslated axes')
        offset=nodes[0].get('translation',[0,0,0])
        if offset!=[0,0,0] and (nodes[0].get('name')!='throne_blue_waist' or offset!=[0,2.609999895095825,11.260000228881836]):raise ValueError('Unknown translated source node')
        primitive=mesh['primitives'][0];ai=primitive['attributes']['POSITION'];acc=gltf['accessors'][ai];view=gltf['bufferViews'][acc['bufferView']]
        if acc['componentType']!=5126 or acc['type']!='VEC3' or acc.get('byteOffset',0) or 'sparse' in acc or 'byteStride' in view or view['byteLength']!=acc['count']*12 or sum(a.get('bufferView')==acc['bufferView'] for a in gltf['accessors'])!=1:
            raise ValueError('Unexpected position layout')
        start=view.get('byteOffset',0);points=[struct.unpack_from('<3f',binary,start+i*12) for i in range(acc['count'])]
        selected={i for i,p in enumerate(points) if in_display([p[k]+offset[k] for k in range(3)])}
        ia=gltf['accessors'][primitive['indices']];iv=gltf['bufferViews'][ia['bufferView']]
        ids=struct.unpack_from('<'+{5123:'H',5125:'I'}[ia['componentType']]*ia['count'],binary,iv.get('byteOffset',0)+ia.get('byteOffset',0))
        faces=[ids[j:j+3] for j in range(0,len(ids),3) if any(i in selected for i in ids[j:j+3])]
        if any(any(i not in selected for i in face) for face in faces):raise ValueError('Display mask splits a source triangle')
        if offset!=[0,0,0]:
            if len(selected)!=len(points):raise ValueError('Translated node must be fully owned')
            nodes[0]['translation'][2]+=delta
        for i in selected if offset==[0,0,0] else []:
            struct.pack_into('<f',output,start+i*12+8,points[i][2]+delta);allowed.update(range(start+i*12+8,start+i*12+12))
        shifted=[struct.unpack_from('<3f',output,start+i*12) for i in range(acc['count'])]
        acc['min']=[min(p[k] for p in shifted) for k in range(3)];acc['max']=[max(p[k] for p in shifted) for k in range(3)]
        selections.append({'mesh':mi,'material':gltf['materials'][primitive['material']]['name'],'vertices':len(selected),'triangles':len(faces)})
    if any(a!=b and i not in allowed for i,(a,b) in enumerate(zip(binary,output))):raise ValueError('Non-display binary byte changed')
    contract=next(n['extras'] for n in gltf['nodes'] if n.get('name')=='TAIHE_CORE_CONTRACT')
    if contract['profileSHA256']!=BASE_PROFILE_SHA:raise ValueError('Wrong R33 profile contract')
    inventory=json.loads(contract['inventory']);moved=[]
    for item in inventory:
        semantic=item['name'].startswith(DISPLAY_PREFIXES)
        bounds=[in_display(item[k]) for k in ('min','max')]
        if semantic!=all(bounds) or any(bounds)!=all(bounds):raise ValueError('Inventory display ownership mismatch: '+item['name'])
        if semantic:
            for bound in ('min','max'):item[bound][2]+=delta
            moved.append(item['name'])
    if not moved or sum(s['vertices'] for s in selections)<1000:raise ValueError('Empty or incomplete display group')
    contract['inventory']=json.dumps(inventory,separators=(',',':'));contract['revision']=profile['revision'];contract['profileSHA256']=sha(profile_bytes)
    identity={'spatialFitId':profile['spatialFit']['id'],'spatialFitSourceSHA256':sha(Path(__file__).read_bytes()),'spatialFitBaseAssetSHA256':BASE_SHA,'spatialFitChangedVertices':sum(s['vertices'] for s in selections),'spatialFitDeltaZ':delta}
    contract.update(identity)
    receipt={'classification':profile['spatialFit']['classification'],'baseAssetSHA256':BASE_SHA,'profileBeforeSHA256':BASE_PROFILE_SHA,'profileAfterSHA256':sha(profile_bytes),'deltaZ':delta,'selections':selections,'inventoryEntriesMoved':moved,'binaryBytesBefore':len(binary),'binaryBytesAfter':len(output),'renderableTriangles':17924,'visibleBatches':8,'unchanged':'All non-display position bytes, every normal, UV, index, material, column, caisson and hanging; source retained for rollback'}
    return pack_glb(gltf,bytes(output)),identity,receipt

def main():
    result,identity,receipt=fit(BASE.read_bytes(),PROFILE.read_bytes());digest=sha(result);name='taihe-display-grid-'+digest[:12]+'.glb';(BASE.parent/name).write_bytes(result)
    path=ROOT/'data/interiors/taihe.json';cfg=json.loads(path.read_bytes());cfg['model']='/models/interiors/'+name;cfg['asset'].update(identity)
    cfg['asset'].update({'sha256':digest,'encodedBytes':len(result),'profileSHA256':sha(PROFILE.read_bytes()),'spatialFitNote':'R34 reversible -2m rigid display fit, linked to unchanged column/ceiling/hanging frame; not surveyed'})
    cfg['throne'].update({'ztb0':5.06,'ztb1':12.06,'thW':7.2,'registration':'R34 grouped display fit; actual permanent navigation reads shared core profile; no measured-current-placement claim'})
    path.write_text(json.dumps(cfg,ensure_ascii=False,indent=2)+'\n');receipt.update({'assetSHA256':digest,'model':cfg['model'],'encodedBytes':len(result)})
    (ROOT/'docs/current-state/r34-interior-spatial-fit/ASSET-RECEIPT.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'model':cfg['model'],**identity}))
if __name__=='__main__':main()
