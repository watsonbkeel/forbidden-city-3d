from pathlib import Path
import json,hashlib,collections
p=Path('../wumen-joint-recovery-1607/actual-junction-1940/bearing-2018/result.json');r=json.loads(p.read_text());rows=[]
for item in r['rows']:
 owner=item['id'];x,z=item['worldMatrix'][12],item['worldMatrix'][14]
 if owner.endswith('-PAVILION'):
  side='east' if '-EAST-' in owner else 'west';end='north' if '-NORTH-' in owner else 'south';far=-.5 if end=='north' else -61.9;outer=-53.2 if side=='east' else 53.2;interface=-11.5 if end=='north' else -50.9
  if abs(z-far)<1e-7:role='existing_far_row_six'
  elif abs(z-interface)<1e-7:role='existing_interface_row_four_NOT_four_source_confirmed_shafts'
  elif abs(x-outer)<1e-7:role='existing_outward_intermediate_four'
  else:raise ValueError(('unexpected pavilion shaft',owner,x,z))
 elif owner in ['FC-B0439D9BED','FC-FB99F593DB']:
  role='existing_wing_endpoint_four_per_wing_NOT_independent_new_columns' if min(abs(z+50.9),abs(z+11.5))<1e-7 else 'existing_wing_intermediate_twenty_four_per_wing'
 else:role='main_or_transverse_retention_separate_contract'
 rows.append({'owner':owner,'path':item['path'],'actualLocalAxis':[x,z],'role':role})
counts=dict(collections.Counter(q['role'] for q in rows));assert counts=={'main_or_transverse_retention_separate_contract':76,'existing_wing_endpoint_four_per_wing_NOT_independent_new_columns':8,'existing_wing_intermediate_twenty_four_per_wing':48,'existing_interface_row_four_NOT_four_source_confirmed_shafts':16,'existing_far_row_six':24,'existing_outward_intermediate_four':16}
output={'scope':'READ_ONLY_ROLE_CLASSIFICATION_OF_EXISTING_188_NOT_NEW_COLUMN_ACCEPTANCE','input':str(p),'inputSHA256':hashlib.sha256(p.read_bytes()).hexdigest(),'counts':counts,'interpretation':'Old pavilion14 consists far6+outward intermediate4+interface row4, NOT proposed observed far6+outward4+inward4. Removing/replacing16 old interface-row model shafts and adding16 separately source-read inward intermediates would leave pavilion count56 but entirely different identity for16. Old8 wing endpoints duplicate interface regions and cannot simply become8 accepted physical shafts. Future104 known perimeter plus8 non-column references requires independently re-read inward axes; no geometry implemented.','rows':rows}
Path('../wumen-joint-recovery-1607/upper-reassembly-2034/OLD-SHAFT-ROLE-INVENTORY.json').write_text(json.dumps(output,indent=2)+'\n');print(json.dumps(counts))
