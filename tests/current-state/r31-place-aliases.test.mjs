import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { PlaceCatalog } from '../../src/ui/PlaceCatalog.js';

const read = () => JSON.parse(readFileSync(new URL('../../data/places/zh-CN.json', import.meta.url)));
const taihe = data => data.places.find(place => place.id === 'taihe');
const alias = (name = '奉天殿', sourceIds = ['taihe']) => ({ name, sourceIds });

test('eight curated historical/current aliases retain the source-backed current cards and 159 exact bindings', () => {
  const catalog = new PlaceCatalog();
  assert.equal(catalog.places.length, 159);
  assert.deepEqual(catalog.places.filter(place => place.aliases).map(place => [place.name, place.aliases]), [
    ['太和殿', [alias(), alias('皇极殿')]],
    ['储秀宫后殿', [alias('思顺斋', ['dpm-644d6c674fa6'])]],
    ['太极殿', [alias('未央宫', ['dpm-f712be35a41f']), alias('启祥宫', ['dpm-f712be35a41f'])]],
    ['神武门', [alias('玄武门', ['dpm-ce03d8f8b915'])]],
    ['延禧宫', [alias('灵沼轩', ['dpm-18e903c4cc20']), alias('水晶宫', ['dpm-18e903c4cc20'])]],
  ]);
  for (const place of catalog.places) {
    assert.equal(catalog.forBinding(place.sceneBinding), place);
    for (const entry of place.aliases ?? []) for (const id of entry.sourceIds) {
      assert.ok([place.summary, ...place.timeline].some(fact => fact.text.includes(entry.name) && fact.sourceIds.includes(id)));
      assert.ok(catalog.sourcesFor(place).some(source => source.id === id && source.publisher === '故宫博物院'));
    }
  }
});

test('optional historical aliases accept only a named source-backed field without changing name or target', () => {
  const data = read(); taihe(data).aliases = [alias()];
  const place = new PlaceCatalog(data).get('taihe');
  assert.equal(place.name, '太和殿'); assert.equal(place.modelExperience.teleportTargetName, '太和殿');
  assert.deepEqual(place.aliases, [alias()]);
  delete taihe(data).aliases;
  assert.doesNotThrow(() => new PlaceCatalog(data), 'previous catalogs need not add empty aliases');
});

for (const [name, value] of [
  ['non-list aliases', '奉天殿'], ['empty aliases', []], ['blank name', [alias(' ')]],
  ['padded name', [alias(' 奉天殿')]], ['HTML name', [alias('<b>奉天殿</b>')]],
  ['overlong name', [alias('字'.repeat(81))]], ['unknown alias field', [{ ...alias(), teleportTargetName: '神武门' }]],
  ['missing source', [alias('奉天殿', ['missing'])]], ['empty sources', [alias('奉天殿', [])]],
  ['duplicate sources', [alias('奉天殿', ['taihe', 'taihe'])]],
  ['duplicate names', [alias(), alias()]], ['redundant current name', [alias('太和殿')]],
  ['unsupported name', [alias('无据旧称')]], ['unrelated official source', [alias('奉天殿', ['announcements'])]],
  ['partly unrelated official sources', [alias('奉天殿', ['taihe', 'announcements'])]],
  ['too many aliases', Array.from({ length: 9 }, () => alias())],
]) test(`catalog rejects ${name}`, () => {
  const data = read(); taihe(data).aliases = value;
  assert.throws(() => new PlaceCatalog(data), /Place catalog/);
});

test('a canonical name cannot be redundantly added as a historical alias', () => {
  const data = read(); const place = data.places.find(place => place.name === '储秀宫后殿');
  place.aliases = [alias('丽景轩', ['dpm-644d6c674fa6'])];
  assert.throws(() => new PlaceCatalog(data), /Place catalog/);
});

test('JSON schema accepts named alias evidence and rejects malformed alias records', () => {
  const script = `import json,jsonschema
s=json.load(open('data/places/catalog.schema.json'));d=json.load(open('data/places/zh-CN.json'))
v=jsonschema.Draft202012Validator(s);v.check_schema(s)
p=next(p for p in d['places'] if p['id']=='taihe');p['aliases']=[{'name':'奉天殿','sourceIds':['taihe']}];v.validate(d)
for value in [[], '奉天殿', [{'name':'','sourceIds':['taihe']}], [{'name':' ','sourceIds':['taihe']}], [{'name':' 奉天殿','sourceIds':['taihe']}], [{'name':'<b>','sourceIds':['taihe']}], [{'name':'a'*81,'sourceIds':['taihe']}], [{'name':'奉天殿','sourceIds':[]}], [{'name':'奉天殿','sourceIds':['taihe','taihe']}], [{'name':'奉天殿','sourceIds':['taihe'],'extra':True}], [{'name':'奉天殿','sourceIds':['taihe']}]*9]:
 p['aliases']=value;assert not v.is_valid(d),value
print('alias schema and negative cases passed')`;
  const result = spawnSync('python', ['-c', script], { cwd: new URL('../../', import.meta.url), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});
