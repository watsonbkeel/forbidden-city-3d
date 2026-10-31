from pathlib import Path
import json,hashlib,collections
p=Path(__file__).resolve().parent;r=p.parents[1]/'r157-wumen-joint-layout-1622'
old=json.loads((p/'OLD-SHAFT-ROLE-INVENTORY.json').read_text());src=json.loads((r/'scripts/photo-fidelity/batches/wumen-joint-layout/source-registration.json').read_text())['upperPlan'];scale=src['registrationScale'];new=[]
farUs=[[839,877,938,1027,1089,1126],[839,877,938,1028,1089,1126],[1599,1636,1697,1787,1848,1885],[1599,1636,1697,1787,1849,1885]]
vs=[[1196,1257,1346,1407],[2477,2537,2626,2687],[1198,1259,1348,1409],[2479,2539,2628,2688]]
for row in old['rows']:
 q=dict(row);q['sourceSite']=None;q['proposedAxisXZ']=None
 role=q['role'];owner=q['owner']
 if owner=='axis/wumen-upper-tower':q.update(action='PRESERVE_COMPLETE_NON_TARGET',proposedAxisXZ=q['actualLocalAxis'])
 elif role=='main_or_transverse_retention_separate_contract':q.update(action='REBUILD_LINK_POSITION_PENDING_SEPARATE_SOURCE_AND_PHYSICS_CONTRACT',preserve='column .19/.22 radii,4.1 height,12 segments only; NOT matrix')
 elif 'endpoint_four' in role or 'interface_row_four' in role:q.update(action='REMOVE_ENGINEERING_SHAFT_IN_PROPOSAL_ONLY',reason='interface physical shaft identity/count unknown; no geometric duplicate claim')
 else:
  pavilion=next((x for x in src['pavilions'] if x['id']==owner),None)
  if pavilion:
   i=src['pavilions'].index(pavilion);u0,u1=pavilion['outerColumnPixelU'];v0,v1=pavilion['outerColumnPixelV'];cx,cz=pavilion['nominalLocalCenterXZ']
   same=[x for x in old['rows'] if x['owner']==owner and x['role']==role]
   if role=='existing_far_row_six':
    same.sort(key=lambda x:x['actualLocalAxis'][0]);ordinal=same.index(row);u=list(reversed(farUs[i]))[ordinal];v=v0 if i in [0,2] else v1
   else:
    same.sort(key=lambda x:-x['actualLocalAxis'][1]);ordinal=same.index(row);u=u1 if i<2 else u0;v=vs[i][ordinal]
   q.update(action='MOVE_ONLY_PRESERVE_COLUMN_GEOMETRY_MATERIAL',sourceSite={'page':pavilion['page'],'u':u,'v':v,'status':'approximate source + explicit shared endpoint fit'},proposedAxisXZ=[cx+((u0+u1)/2-u)*scale,cz+((v0+v1)/2-v)*scale])
  else:
   w=next(x for x in src['wings'] if x['id']==owner);allrows=[x for x in old['rows'] if x['owner']==owner];mid=(min(x['actualLocalAxis'][0] for x in allrows)+max(x['actualLocalAxis'][0] for x in allrows))/2;side=0 if row['actualLocalAxis'][0]<mid else 1
   same=[x for x in allrows if x['role']==role and (0 if x['actualLocalAxis'][0]<mid else 1)==side];same.sort(key=lambda x:-x['actualLocalAxis'][1]);j=same.index(row)+1
   q.update(action='MOVE_ONLY_PRESERVE_COLUMN_GEOMETRY_MATERIAL',sourceSite={'page':w['page'],'u':list(reversed(w['pairedOuterColumnPixelU']))[side],'v':w['longitudinalColumnPixelV'][j]},proposedAxisXZ=[w['outerColumnLocalX'][side],w['longitudinalColumnLocalZ'][j]])
 new.append(q)
for i,pav in enumerate(src['pavilions']):
 u0,u1=pav['outerColumnPixelU'];v0,v1=pav['outerColumnPixelV'];cx,cz=pav['nominalLocalCenterXZ'];u=u0 if i<2 else u1
 for j,v in enumerate(vs[i]):new.append({'owner':pav['id'],'path':None,'proposedID':pav['id']+'/inward-middle/'+str(j),'action':'ADD_SOURCE_READ_NON_INTERFACE_SHAFT','sourceSite':{'page':pav['page'],'u':u,'v':v},'proposedAxisXZ':[cx+((u0+u1)/2-u)*scale,cz+((v0+v1)/2-v)*scale],'geometryPolicy':'share frozen old same-owner column template; no radius/height/scale change'})
counts=collections.Counter(q['action'] for q in new);assert counts['PRESERVE_COMPLETE_NON_TARGET']==52;assert counts['REMOVE_ENGINEERING_SHAFT_IN_PROPOSAL_ONLY']==24;assert counts['ADD_SOURCE_READ_NON_INTERFACE_SHAFT']==16;assert counts['MOVE_ONLY_PRESERVE_COLUMN_GEOMETRY_MATERIAL']==88
out={'status':'NUMERIC_ROLE_PROPOSAL_NOT_IMPLEMENTED_OR_APPROVED','coordinateSpace':'WUMEN_COMPONENT_LOCAL_XZ','oldCount':188,'proposedModelCountConditional':180,'knownPerimeterCountConditional':104,'unknownInterfaceAreas':8,'counts':counts,'limitations':['links24 position unresolved','southern far row old2723/2725 vs canonical2724/2726 explicitly fitted shared endpoint within pixel read band','source approximate not surveyed; eight interfaces remain unknown','no actual geometry, no physics, no new bearing/route acceptance'],'rows':new}
(p/'SHAFT-ROLE-PROPOSAL-2051.json').write_text(json.dumps(out,indent=2)+'\n');print(dict(counts))
