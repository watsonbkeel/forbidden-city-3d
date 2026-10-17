"""Bounded detail-only open screen crowns on the frozen furniture candidate."""
import json
import struct
import sys
from pathlib import Path
from append_taihe_screen import append_batches,unpack_glb,pack_glb,sha
from taihe_screen_crowns.retire import retire_screen_headers
from taihe_screen_crowns.geometry import build_candidate
from taihe_furniture.geometry import build_candidate as furniture_candidate
from taihe_caisson.geometry import material_batches

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
BASE=ROOT/'public/models/interiors/taihe-furniture-0bfa52b758cb.glb'
BASE_SHA='0bfa52b758cba052b0b8258ebc338cb9b0f80129e00d0bb5970ef343758432ea'

def bounds(mesh,faces):
    # Match actual encoded float32 positions when recording ownership bounds.
    points=[tuple(struct.unpack('<3f',struct.pack('<3f',*mesh['vertices'][j]))) for i in faces for j in mesh['triangles'][i]]
    return {'min':[min(p[k] for p in points) for k in range(3)],'max':[max(p[k] for p in points) for k in range(3)]}

def update_retained_inventory(retired,receipt,profile):
    gltf,binary=unpack_glb(retired)
    contract=next(n['extras'] for n in gltf['nodes'] if n.get('name')=='TAIHE_CORE_CONTRACT')
    old=json.loads(contract['inventory']);whole=set(receipt['retiredInventoryNames']);partial=set(receipt['partialInventoryNames'])
    if len(whole)!=70 or len(partial)!=7:raise ValueError('Unexpected screen inventory ownership')
    original=furniture_candidate(profile);updated=[];changes=[]
    for row in old:
        name=row['name']
        if name in whole:continue
        if name in partial:
            part=name.removeprefix('furniture_')
            components=[c for c in original['metadata']['components'] if c['name']==part]
            if [len(c['triangles']) for c in components]!=[16,16,16,32]:raise ValueError('Changed source frame component ownership')
            keep=[i for c in components[:3] for i in c['triangles']]
            new={**row,**bounds(original,keep)}
            changes.append({'name':name,'before':row,'after':new,'retainedTriangles':48,'retiredCapTriangles':32})
            row=new
        updated.append(row)
    if len(changes)!=7 or len(updated)!=len(old)-70:raise ValueError('Missing or duplicated retired inventory')
    contract['inventory']=json.dumps(updated,separators=(',',':'))
    return pack_glb(gltf,binary),changes

def build(output=None):
    output=Path(output) if output else ROOT
    profile_path=ROOT/'data/architecture/taihe-core.json';profile=json.loads(profile_path.read_bytes())
    base=BASE.read_bytes()
    if sha(base)!=BASE_SHA:raise ValueError('Frozen furniture baseline changed')
    mask=HERE/'taihe_screen_crowns/retired_screen_header_faces.json'
    retired,retirement=retire_screen_headers(base,mask.read_bytes())
    retired,inventory_changes=update_retained_inventory(retired,retirement,profile)
    mesh=build_candidate(profile,'detail',crown_style='sculptural');count=len(mesh['triangles'])
    total=17266-retirement['removedTriangles']+count
    if total>17866 or total>profile['budgets']['sVisibleTriangles']:raise ValueError('Screen crown increment exceeds unchanged allocation')
    identity={
        'screenCrownSourceSHA256':sha((HERE/'taihe_screen_crowns/geometry.py').read_bytes()),
        'screenCrownBaseAssetSHA256':BASE_SHA,
        'screenCrownIntegrationSHA256':sha((HERE/'append_taihe_screen.py').read_bytes()),
        'screenCrownRetirementSHA256':sha((HERE/'taihe_screen_crowns/retire.py').read_bytes()),
        'screenCrownMaskSHA256':sha(mask.read_bytes()),
        'screenCrownTriangles':count,
        'screenCrownRemovedTriangles':retirement['removedTriangles'],
    }
    added_inventory=[{'name':'screenCrown_'+name,**bounds(mesh,faces)} for name,faces in mesh['parts'].items()]
    glb,prefixes=append_batches(retired,material_batches(mesh),identity,added_inventory)
    digest=sha(glb);relative='public/models/interiors/taihe-screen-crowns-'+digest[:12]+'.glb'
    target=output/relative;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(glb)
    sources=[HERE/'taihe_screen_crowns'/s for s in ['geometry.py','retire.py','derive_retirement.py','retired_screen_header_faces.json']]
    sources += [HERE/'append_taihe_screen.py',HERE/'append_taihe_caisson.py',HERE/'taihe_furniture/geometry.py',HERE/'taihe_caisson/geometry.py',Path(__file__)]
    result={'schema':'taihe-screen-crowns-1','status':'original source-informed openwork candidate; ordinary image review pending',
        'baselineAsset':str(BASE.relative_to(ROOT)),'baselineSHA256':BASE_SHA,'profileSHA256':sha(profile_path.read_bytes()),
        'sources':{str(p.relative_to(ROOT)):sha(p.read_bytes()) for p in sources},
        'asset':{'path':relative,'sha256':digest,'encodedBytes':len(glb),'renderableTriangles':total,'visibleBatches':8},
        'identity':identity,'retirement':retirement,'retainedInventoryChanges':inventory_changes,'appendedInventory':added_inventory,'accessorPrefixes':prefixes,'geometry':mesh['metadata'],
        'fallback':{'changed':False,'renderableTriangles':1596,'visibleBatches':8},
        'unchanged':['global screen envelope and estimated registration','lower screen surface occupancy','throne and other furnishing geometry','materials/textures/lights','navigation/collision/floors','other halls and extra ceiling batch','original 18000 triangle and 8 material-batch ceilings']}
    target=output/'docs/current-state/taihe-screen-crowns/SOURCE-MANIFEST.json';target.parent.mkdir(parents=True,exist_ok=True);target.write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n')
    return result

if __name__=='__main__':
    r=build(sys.argv[1] if len(sys.argv)>1 else None);print(json.dumps({'asset':r['asset'],'identity':r['identity']},ensure_ascii=False))
