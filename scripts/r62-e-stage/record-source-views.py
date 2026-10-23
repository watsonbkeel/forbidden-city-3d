"""Record actual reference image inspections. No image bytes are published."""
from pathlib import Path
import json,hashlib,sys
P=Path(__file__).resolve().parents[2];cache=Path(sys.argv[1]);dest=P/'docs/photo-fidelity/E-REVIEW/SOURCES-VIEWED.json'
x=json.loads(dest.read_text());rows={a['url']:a for a in x['sources']}
def add(url,file,coverage,at,page=None):
 b=(cache/file).read_bytes();r={'url':url,'page':page,'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b),'actuallyViewed':True,'observedAt':at,'photographDate':None,'coverage':coverage,'publicCopy':False,'inspection':'DIRECT_IMAGE_VIEW; NOT BROWSER MODEL ACCEPTANCE'}
 rows[url]=r
j=json.loads((cache/'jingyang-images.json').read_text());jn=['Front three-bay hip hall, upper rectilinear window fields and lower plain fields; no interior survey.','Han/Manchu vertical front plaque close-up, red fitted carved frame; no plan.','Front hall oblique and adjacent roof relation; fitted not measured.','Rear courtyard oblique, five-bay study hall, four sill windows; well pavilion and wings require separate placement confirmation.','Rear five-bay south elevation, central doors and four straight/stepped grille high-sill windows; exact repeat count unmeasured.','Well pavilion and adjacent rear/front roof relationships; exact site coordinate not established.','Inside gate oblique with painted leaves/transom and side ranges; cardinal view not assumed.']
for k,u in j.items():add(u,f'jingyang-{int(k):02}.jpg',jn[int(k)-1],'2026-10-23T02:15:49Z','https://www.dpm.org.cn/explore/building/236511.html')
notes={
'jingren':['Front five-bay xieshan hall; four high grey sills with wide square-grid centers and narrow diamond side fields; central doors and partial terrace/ramp/stair relations. No interior view.','Han/Manchu blue-ground golden lettering and red curved frame close-up; mounting beam/rafters partially visible.','Stone freestanding screen and white fence in front courtyard; placement still needs unique site binding.','Oblique front confirms divided square/diamond high-sill windows; side stair/terrace relation visible, no measured dimensions.','Rear five-bay hard-gable hall oblique; upper stepped grille fields and pale/glazed lower fields, center doors and low steps. Not the main hall north glazing.','Rear frontal confirms five bays, upper/lower split windows and center doors; grid repetitions and exact materials remain fit.','Four-post small well pavilion with stone well body and yellow roof; location is not inferred from generic placement.','Partial upward roof corner/junction and painted brackets; not whole building coverage.'],
'zhongcui':['Front five-bay xieshan hall and veranda, split upper grille/lower pale fields, center doors and frontal steps. Modern signage is not historic inventory.','Vertical Han/Manchu blue-ground plaque and red/gold frame, close-up only.','Front veranda/curved knee braces and window bands; no room interior.','Tree-obscured oblique front and small well pavilion; magnolia and courtyard relationship visible but placement not surveyed.','Rear hall through gallery: upper stepped grille and lower glazed fields, central door and front veranda frame. Plaque visible but wording not reliably transcribed.'],
'chengqian':['Front oblique: high grey sill windows, broad square-grid center and narrow diamond fields; modern curtain at entrance, no room interior.','Han/Manchu plaque close-up and frame/eave painting only.','Rear five-bay hall with rectangular glazed high-sill windows and central doors; not the front lattice scheme.','Oblique front confirms window division and side approach stairs/terrace; dimensions remain fit.','Courtyard front context, urn, tree and freestanding structure; each needs separate identity/position, not blanket inventory approval.']}
for a in json.loads((cache/'three-east-gallery-images.json').read_text()):
 add(a['url'],a['file'],notes[a['name']][a['ordinal']-1],'2026-10-23T02:30:24Z' if a['name']=='jingren' else '2026-10-23T02:36:56Z',f"https://www.dpm.org.cn/explore/building/{a['page']}.html")
static={
'afddf457817e':'Yuqing palace plaque close-up only; no plan/whole compound.',
'71fe69a49653':'Yuqing winter courtyard oblique, one facade/door/low steps; not all four courts or interior.',
'cbf5e215f774':'Weiyu local interior: round opening, plaque, timber and blue glazed fields, partial side bench/kang and rear frames. No complete plan, target date, or resolved east-ear-room/east-secondary-bay identity; not whole Yuqing evidence.',
'4f6a3c2ff20c':'Zhai palace plaque close-up; no whole facade or room layout.',
'35389e7f0fe2':'Zhai front oblique with projecting porch, columns, terrace stairs and central ramp relation. Modern toy deer/exhibition banners are not Qing inventory.',
'2697bf612f61':'Fengxian Han/Manchu golden-letter plaque, sculpted frame, upper eave beam and lower eave roof relationship. Fine carving remains unreplicated.',
'0cf8fa50cc93':'Fengxian nine-bay front double-eave hall, five middle door bays, four outer sill windows, upper plaque and terrace; rear hall not shown.',
'2074e87f472c':'Captioned Chengsu courtyard view obscured by trees, side wing and modern glazing; cannot establish whole seven-bay elevation or interior.',
'e5218e8a28aa':'Zhongsi single wall doorway with roof/eaves and red leaf, adjacent decorated gate fragment; actual location/boundary must be established.',
'0e77c793c43b':'Zhongsi vertical Han/Manchu plaque and tile/eave close-up only.',
'3bc10716496d':'Tianqiong precinct decorated gateway and partial courtyard beyond; not the five-bay main hall elevation or full compound.',
'62e78d0937ea':'Jingshifang plaque only; cannot verify all QianEast five compounds or their three-court arrangements.',
'43903f6a89ae':'Linzhi rear wall gate with double closed leaves, roof and side returns; exact map relationship pending.',
'eafa96b51fae':'Cangzhen decorated glazed gate, central opening, side panels, threshold and corridor beyond; photo supports facade not exact width/plan.'}
for a in json.loads((cache/'e-static-index.json').read_text()):
 key=a['file'][9:-4];at='2026-10-23T02:39:52Z' if key=='2697bf612f61' else '2026-10-23T02:36:43Z' if key in ['e5218e8a28aa','0e77c793c43b','3bc10716496d','62e78d0937ea','43903f6a89ae','eafa96b51fae'] else '2026-10-23T02:32:00Z'
 add(a['url'],a['file'],static[key],at);rows[a['url']]['objectScope']=a['objects']
for u,r in list(rows.items()):
 if u.endswith('s5e9d39e4779a2.jpg'):add(u,'yonghe-front.jpg','Overall Yonghe open three-bay rounded canopy and curved knees; main wall upper grille/lower plain fields and terrace. Exact carving/grid dimensions not surveyed.','2026-10-23T02:39:52Z','https://www.dpm.org.cn/explore/building/236518.html')
x['sources']=list(rows.values());x['sourceCount']=len(rows);x['actuallyViewedCount']=sum(a['actuallyViewed'] for a in rows.values());x['boundary']='Official photographs remain private. Observations cover only stated image subjects. URL upload dates are not capture dates. Panorama HTML/metadata reads never count as actual imagery or complete 360; CPU model views never count as browser/GPU acceptance.'
dest.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');print(x['sourceCount'],x['actuallyViewedCount'])
