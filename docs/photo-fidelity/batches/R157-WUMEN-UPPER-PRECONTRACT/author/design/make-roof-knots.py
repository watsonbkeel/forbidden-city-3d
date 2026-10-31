from pathlib import Path
import json,hashlib
p=Path(__file__).resolve().parent;r=p.parents[1]/'r157-wumen-joint-layout-1622';src=json.loads((r/'scripts/photo-fidelity/batches/wumen-joint-layout/source-registration.json').read_text())['upperPlan'];rows=[]
def layer(oldW,oldD,newW,newD,ovh):
 return {'coordinateRoles':'ROOF_LAYER_LOCAL_HORIZONTAL_METRES_NOT_CITY','old':{'footprintHalf':[oldW/2,oldD/2],'eaveHalf':[oldW/2+ovh,oldD/2+ovh]},'proposal':{'footprintHalf':[newW/2,newD/2],'eaveHalf':[newW/2+ovh,newD/2+ovh]},'knotsPerAxis':{'old':[[0,v/2,v/2+ovh] for v in [oldW,oldD]],'proposal':[[0,v/2,v/2+ovh] for v in [newW,newD]]},'mandatoryActualSample':'footprint knot inserted in tile AND soffit mesh with corresponding common boundary segments','preserve':'no-lift base-profile Y at corresponding parameter, not all actual tube/lift Y'}
for pv in src['pavilions']:
 w=pv['outerColumnAxisBoundsLocal']['x'][1]-pv['outerColumnAxisBoundsLocal']['x'][0];d=pv['outerColumnAxisBoundsLocal']['z'][1]-pv['outerColumnAxisBoundsLocal']['z'][0];W=w+.4;D=d+.4;i=1.368;o=1.368
 rows.append({'id':pv['id'],'kind':'pavilion','columnAxisSize':[w,d],'parentPositionXZ':pv['nominalLocalCenterXZ'],'horizontalFits':{'solidWallHalf':[w/2-.8,d/2-.8],'facadeCenterHalf':[w/2-.7,d/2-.7],'beamOuterHalf':[w/2+.2,d/2+.2]},'lower':{'oldFootprintHalf':[5.7,5.7],'newFootprintHalf':[W/2,D/2],'oldSkirtKnotsInnerBearingEave':[5.7-i,5.7,5.7+o],'newSkirtKnotsInnerBearingEave':[[v/2-i,v/2,v/2+o] for v in [W,D]],'engineeringInset':i,'engineeringOverhang':o,'sourceStatus':'retained offsets, not roof survey'},'upper':layer(8.664,8.664,W-2*i,D-2*i,1.2),'YBaseRecipe':'pavilion_old in independent roof-formula-sensitivity.json; actual2056bounds reference only','detail':'low'})
for wing in src['wings']:
 length=wing['longitudinalColumnLocalZ'][0]-wing['longitudinalColumnLocalZ'][-1];width=wing['outerColumnLocalX'][1]-wing['outerColumnLocalX'][0]
 rows.append({'id':wing['id'],'kind':'wing','columnAxisSizeLocalXZ':[length,width],'orientation':'local roof X runs Wumen Z, original Ry pi/2; not Wumen axis coordinates','single':layer(39.8,13.4,length+.4,width+.4,1.608),'YBaseRecipe':'wing_old in independent roof-formula-sensitivity.json, parent-local input base6.5/worldcomponent18.8','detail':'low'})
for row in rows:
 for key in ['upper','single']:
  if key in row:
   for state in ['old','proposal']:
    for k in row[key]['knotsPerAxis'][state]:assert 0==k[0]<k[1]<k[2]
(p/'ROOF-KNOT-PROPOSAL-2104.json').write_text(json.dumps({'status':'NUMERIC_PROPOSAL_NOT_GENERATED_GEOMETRY_NOT_ACCEPTED','fixedOffsetsEngineeringNotSurvey':True,'sourceSHA256':hashlib.sha256((r/'scripts/photo-fidelity/batches/wumen-joint-layout/source-registration.json').read_bytes()).hexdigest(),'instances':rows,'unresolved':['actual common tile/soffit sampling and contact','corner lift and tube actualY delta','full topology/normal/UV baseline and candidate validation','beam/roof edge visual consistency','no production or new entity approval']},indent=2)+'\n');print('6 proposed role-resolved knot rows; no mesh generated')
