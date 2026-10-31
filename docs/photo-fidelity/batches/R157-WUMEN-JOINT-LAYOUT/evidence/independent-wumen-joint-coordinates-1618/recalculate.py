"""Read-only independent OSM/official-plan coordinate audit; no World or repo edits."""
from pathlib import Path
from math import sin,cos,radians,hypot
import json,hashlib,subprocess
ROOT=Path(__file__).resolve().parent.parent
REPO=ROOT/'r157-restored-411214'; REC=ROOT/'wumen-joint-recovery-1607'; OUT=Path(__file__).resolve().parent
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
raw=REC/'raw/osm-map.json'
assert sha(raw)=='6825b034879b83186e0c4ae2993bab411941f4a07b8528872b3ce236bd1de3ec'
data=json.loads(raw.read_bytes());nodes={e['id']:e for e in data['elements'] if e['type']=='node'};ways={e['id']:e for e in data['elements'] if e['type']=='way'}
def box(points):return [min(p[0] for p in points),min(p[1] for p in points),max(p[0] for p in points),max(p[1] for p in points)]
def mid(b):return [(b[0]+b[2])/2,(b[1]+b[3])/2]
def geo(i):return [(nodes[n]['lon'],nodes[n]['lat']) for n in ways[i]['nodes']]
origin=mid(box(geo(638449347)));c=cos(radians(2.13));s=sin(radians(2.13))
assert origin==[116.39081395,39.9158956]
def xy(p):
 u=-(p[0]-origin[0])*85499;v=(p[1]-origin[1])*111034
 return [c*u-s*v,s*u+c*v]
def row(i,role):
 w=ways[i];g=geo(i);p=list(map(xy,g));b=box(g);pb=box(p);a=xy(mid(b));q=mid(pb)
 return {'way':i,'role':role,'wayVersion':w['version'],'wayTimestamp':w['timestamp'],'nodeCountWithClosedRepeat':len(g),'tags':w.get('tags',{}),'geographicBBox':b,'geographicBBoxMidpointProjected':a,'projectedVerticesBBox':pb,'projectedVerticesBBoxMidpoint':q,'statisticDifferenceXZ':[q[0]-a[0],q[1]-a[1]],'vertices':[{'id':nid,'nodeVersion':nodes[nid]['version'],'nodeTimestamp':nodes[nid]['timestamp'],'lon':nodes[nid]['lon'],'lat':nodes[nid]['lat'],'xz':pt} for nid,pt in zip(w['nodes'],p)]}
ids={638449347:'Taihe origin named outline',638156366:'Whole U including wings/ramps, not main centre',638156994:'Main wooden body',638156914:'Main upper roof, unreliable form/height tags',638176319:'South barrier polyline including U front',638157005:'Lower concrete part, boundary layer uncertain',156149069:'Named east south wall 8',638206927:'Named west south wall 7',638156677:'NE wood pavilion',638156830:'NW wood pavilion',638156655:'SE wood pavilion',638156665:'SW wood pavilion',638156484:'East wing roof ridge part',638156495:'West wing roof ridge part',638249691:'Que left named way',638249692:'Que right named way',638170129:'Que left body',638170122:'Que right body',638206928:'East ascent part 1',638206935:'East ascent part 2',638206936:'East ascent part 3',638206937:'East ascent part 4',638206938:'East ascent part 5',638206921:'West ascent part 1',638206922:'West ascent part 2',638206923:'West ascent part 3',638206924:'West ascent part 4',638206925:'West ascent part 5'}
rows={str(i):row(i,r) for i,r in ids.items()};main=rows['638156994']['geographicBBoxMidpointProjected'];whole=rows['638156366']['geographicBBoxMidpointProjected']
# Independent graphical landmarks reread in the two 2304x3000 pages. Absolute metres
# are conditional on retained 25m depth and 60.05m width, NOT a surveyed axis total.
pdf=ROOT/'recovered-private-wumen/exhibition-2021.pdf';assert sha(pdf)=='5049aa0a175c2fe8da56f536a5846d29772f2fd424e6213236e964e2968d8a85'
span=1498.5-1121;scale=25/span;oy=(1498.5+1121)/2
rawp=[('NE',152,[839,1126],[1159,1447],638156677),('SE',152,[839,1126],[2433,2724],638156655),('NW',153,[1599,1885],[1162,1448],638156830),('SW',153,[1599,1885],[2435,2726],638156665)]
fit=[]
for name,page,u,v,wid in rawp:
 mx=(u[0]+u[1])/2;my=(v[0]+v[1])/2;lx=-30.025-(mx-667)*scale if page==152 else 30.025+(2060-mx)*scale;lz=(oy-my)*scale
 pos=[main[0]+lx,main[1]+lz];osm=rows[str(wid)]['geographicBBoxMidpointProjected']
 fit.append({'name':name,'printedPage':page,'pixelU':u,'pixelV':v,'axisWidthOverMainDepth':(u[1]-u[0])/span,'axisDepthOverMainDepth':(v[1]-v[0])/span,'conditionalLocalXZ':[lx,lz],'conditionalSizeXZ':[(u[1]-u[0])*scale,(v[1]-v[0])*scale],'conditionalWorldXZ':pos,'OSMWoodPart':wid,'OSMCentre':osm,'residualMetres':hypot(pos[0]-osm[0],pos[1]-osm[1]),'notSurvey':True})
long=[]
for side,north,south,cv in [('east',fit[0],fit[1],[1447,2433]),('west',fit[2],fit[3],[1448,2435])]:
 sep=north['conditionalLocalXZ'][1]-south['conditionalLocalXZ'][1]
 long.append({'side':side,'northSouthPavilionCentreDistanceConditional':sep,'ratioToMainDepth':sep/25,'wingInterfaceRowPixelV':cv,'conditionalBetweenRows':(cv[1]-cv[0])*scale,'currentRuntimeCentreDistance':50.4,'currentRuntimeBetweenPavilions':39.4})
# U front shares nodes with barrier: agreement is common-data provenance, NOT independent validation.
shared=set(ways[638156366]['nodes'])&set(ways[638176319]['nodes'])
lower=rows['638157005'];north=[{'node':v['id'],'localXZ':[v['xz'][0]-main[0],v['xz'][1]-main[1]],'worldXZ':v['xz']} for v in lower['vertices'] if v['xz'][1]>main[1]+11]
# History assertions: node sequences alone do not establish historical coordinates.
hist=[]
for wid,minv in [(638156366,10),(638156994,1),(638449347,3),(638176319,1)]:
 p=REC/f'raw/way-{wid}-history.json';els=json.loads(p.read_bytes())['elements'];a=[e for e in els if e['type']=='way' and e['id']==wid];current=ways[wid]
 hist.append({'way':wid,'historySHA256':sha(p),'versions':[{'v':e['version'],'t':e['timestamp'],'nodeCount':len(e['nodes']),'nodeSequenceEqualsCurrent':e['nodes']==current['nodes']} for e in a],'sequenceStableFromClaimedVersion':all(e['nodes']==current['nodes'] for e in a if e['version']>=minv),'claimedFrom':minv,'notHistoricalNodeCoordinateReplay':True})
# Check author's six recovered-file identities; do not execute their registration script.
manifest=json.loads((REC/'RECOVERY-MANIFEST.json').read_bytes());checks=[]
for f in manifest['files']:
 p=REC/f['path'];ok=p.stat().st_size==f['bytes'] and sha(p)==f['sha256'];assert ok;checks.append({'file':f['path'],'sha256':sha(p),'bytes':p.stat().st_size,'url':f['url']})
author=json.loads((REC/'registration.json').read_bytes());assert all(abs(f['residualMetres']-a['residualMeters'])<1e-10 for f,a in zip(fit,author['pavilionCrossChecks']))
for i in author['objects']:
 assert all(abs(a-b)<1e-10 for a,b in zip(rows[i]['geographicBBoxMidpointProjected'],author['objects'][i]['geographicBBoxCenterProjected']))
result={'scope':'INDEPENDENT_READ_ONLY_NUMERICAL_REPRODUCTION_NO_WORLD_NO_IMPLEMENTATION','rawSHA256':sha(raw),'rawBytes':raw.stat().st_size,'rawElementCount':len(data['elements']),'attribution':'OpenStreetMap contributors / ODbL; no survey-accuracy inference','sourceRetrieval':'New 2026-10-31 fetch, old private snapshots not recovered','originLonLat':origin,'projectionFormula':'xr=-(lon-originLon)*85499; zr=(lat-originLat)*111034; x=xr*cos(2.13deg)-zr*sin(2.13deg); z=xr*sin(2.13deg)+zr*cos(2.13deg)','centreStatistic':'geographic bbox midpoint, then project; alternative statistic separately retained','objects':rows,'deltaMainFromCurrentRuntime':[main[0],main[1]+419.6],'deltaMainFromU':[main[0]-whole[0],main[1]-whole[1]],'UAndBarrierSharedDistinctNodes':len(shared),'lowerNorthVertices':north,'lowerNorthZLocalRange':[min(v['localXZ'][1] for v in north),max(v['localXZ'][1] for v in north)],'planBasis':{'pdfSHA256':sha(pdf),'mainExternalPixelRows':[1121,1498.5],'pixelSpan':span,'conditionalMetresPerPixel':scale,'axisEndPointsNotSurveyed':True,'pixelReadErrorDoesNotIncludeDiagramDistortion':True},'pavilionFits':fit,'wingRatios':long,'history':hist,'recoveryManifestByteChecks':checks,'authorNumericalAgreement':True,'currentCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=REPO,text=True).strip(),'gitStatus':subprocess.check_output(['git','status','--short'],cwd=REPO,text=True)}
assert result['gitStatus']==''
(OUT/'independent-registration.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'main':main,'wholeU':whole,'deltaMainRuntime':result['deltaMainFromCurrentRuntime'],'pavilionResiduals':[p['residualMetres'] for p in fit],'wingRatios':long,'lowerNorth':result['lowerNorthZLocalRange'],'sharedNodes':len(shared),'sourceManifestFilesVerified':len(checks),'authorNumericalAgreement':True,'gitStatus':result['gitStatus']},indent=2))
