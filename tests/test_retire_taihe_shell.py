"""Prove the finite old-shell replacement boundary without browser/GPU."""
import copy,importlib.util,json,struct,sys,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'assets-src/interiors'))
from append_taihe_caisson import unpack_glb,pack_glb,sha
from retire_taihe_shell import retire_shell
BASE=(ROOT/'public/models/interiors/taihe-v17-display-28d7a11dbeda.glb').read_bytes()
MASK=(ROOT/'assets-src/interiors/taihe_caisson/retired_shell_faces.json').read_bytes()
def chunks(g,b):return [b[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']] for v in g['bufferViews']]
class RetireShell(unittest.TestCase):
 def test_exact_only_two_index_views_change(self):
  result,receipt=retire_shell(BASE,MASK);old,ob=unpack_glb(BASE);new,nb=unpack_glb(result);a,b=chunks(old,ob),chunks(new,nb)
  touched={r['bufferView'] for r in receipt['indexChanges']};self.assertEqual(len(touched),2)
  for i,(before,after) in enumerate(zip(a,b)):
   if i not in touched:self.assertEqual(before,after)
  self.assertEqual(sum(r['removedTriangles'] for r in receipt['indexChanges']),320)
  for key in ['materials','meshes','scenes','scene']:self.assertEqual(old[key],new[key])
  self.assertEqual([n for n in old['nodes'] if 'mesh' in n],[n for n in new['nodes'] if 'mesh' in n])
 def test_all_retained_indices_exact_order_no_spatial_selection(self):
  result,receipt=retire_shell(BASE,MASK);old,ob=unpack_glb(BASE);new,nb=unpack_glb(result);a,b=chunks(old,ob),chunks(new,nb);mask=json.loads(MASK)
  for row in receipt['indexChanges']:
   ai=row['accessor'];acc=old['accessors'][ai];fmt={5123:'H',5125:'I'}[acc['componentType']];inds=struct.unpack('<'+fmt*acc['count'],a[row['bufferView']]);removed={x['triangleOrdinal'] for x in mask['triangles'] if x['material']==row['material']};wanted=[v for i in range(0,len(inds),3) if i//3 not in removed for v in inds[i:i+3]];self.assertEqual(b[row['bufferView']],struct.pack('<'+fmt*len(wanted),*wanted));self.assertEqual(new['accessors'][ai]['count'],len(wanted))
 def test_only_exact_inventory_members_retire(self):
  result,_=retire_shell(BASE,MASK);old,_=unpack_glb(BASE);new,_=unpack_glb(result)
  find=lambda g:next(n['extras'] for n in g['nodes'] if n.get('name')=='TAIHE_CORE_CONTRACT')
  a,b=find(old),find(new);self.assertEqual({k:v for k,v in a.items() if k!='inventory'},{k:v for k,v in b.items() if k!='inventory'})
  parts=set(json.loads(MASK)['parts']);oldrows=json.loads(a['inventory']);self.assertEqual(len([r for r in oldrows if r['name'] in parts]),19);self.assertEqual(json.loads(b['inventory']),[r for r in oldrows if r['name'] not in parts])
 def test_mutated_or_unrecognized_base_rejected(self):
  bad=bytearray(BASE);bad[-20]^=1
  with self.assertRaisesRegex(ValueError,'baseline'):retire_shell(bytes(bad),MASK)
 def test_changed_scope_or_duplicate_rows_rejected(self):
  for mutate in [lambda m:m['triangles'].append(copy.deepcopy(m['triangles'][0])),lambda m:m['triangles'][0].__setitem__('triangleOrdinal',0),lambda m:m['parts'].append('gold_column'),lambda m:m.__setitem__('matchTolerance',1)]:
   m=json.loads(MASK);mutate(m)
   with self.assertRaisesRegex(ValueError,'mask'):retire_shell(BASE,json.dumps(m).encode())
 def test_deterministic(self):self.assertEqual(retire_shell(BASE,MASK),retire_shell(BASE,MASK))
if __name__=='__main__':unittest.main()
