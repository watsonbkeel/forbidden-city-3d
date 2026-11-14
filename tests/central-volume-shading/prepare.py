import sys,pathlib,hashlib,json,shutil,os,subprocess
root=pathlib.Path(sys.argv[1]).resolve(); here=pathlib.Path(__file__).resolve().parent; out=pathlib.Path(os.environ['EVIDENCE_DIR']).resolve()/'closeup-site'
assert not out.exists(), 'fresh output required'
pins=json.loads((here/'asset-pins.json').read_text());out.mkdir(); records={}
def copy(src,name):
 b=src.read_bytes();
 if name in pins: assert {'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}==pins[name], 'frozen input mismatch '+name
 p=out/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(b);records[name]={'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
for f in ['StudyArtBlend.js','SmoothBuddhaBody.js','CentralBuddhaVolumeStudy.js','OriginalBuddhaRelief.js','RefinedCentralBuddha.js','RefinedSideBuddha.js','EightTierLotus.js','OriginalLotusPetalUV.js']:
 copy(root/'src/scene/palace/special'/f,'src/'+f)
for source,dest in [('build/three.module.js','vendor/three.js'),('examples/jsm/utils/BufferGeometryUtils.js','vendor/BufferGeometryUtils.js')]:copy(root/'node_modules/three'/source,dest)
subjects={}
for id in ['shakyamuni']:
 png=f'{id}-refined-v2.png';grid=f'{id}-refined-alpha-grid-v2.json'
 for name in [png,grid]:copy(root/'public/textures/dafotang-original'/name,'assets/'+name)
 g=json.loads((out/'assets'/grid).read_text());assert g['sourceSHA256']==records['assets/'+png]['sha256']
 subjects[id]={'png':'assets/'+png,'grid':'assets/'+grid}
for name in ['index.html','page.mjs']:copy(here/name,name)
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
assert not subprocess.check_output(['git','status','--porcelain'],cwd=root,text=True).strip(), 'dirty checkout'
checkout=pathlib.Path(os.environ['EVIDENCE_DIR']).resolve()/'checkout-identity.json'
assert checkout.is_file(), 'mandatory checkout identity missing'
checkout_binding={'path':'checkout-identity.json','bytes':len(checkout.read_bytes()),'sha256':hashlib.sha256(checkout.read_bytes()).hexdigest()}
(out/'identity.json').write_text(json.dumps({'head':head,'checkoutIdentity':checkout_binding,'scope':'PRIVATE_ISOLATED_VISUAL_DIAGNOSTIC_NOT_PRODUCT_OR_GPU_ACCEPTANCE','files':records,'subjects':subjects},indent=2))
print(json.dumps({'files':len(records),'site':str(out)}))
