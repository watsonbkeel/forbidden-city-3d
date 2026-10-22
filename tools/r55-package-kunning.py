#!/usr/bin/env python3
"""Package only the inspected R55 Kunning S export; retain the R54 rollback asset."""
import hashlib,json,pathlib,struct,sys
root=pathlib.Path(__file__).resolve().parents[1]
p=pathlib.Path(sys.argv[1]); data=p.read_bytes(); sha=hashlib.sha256(data).hexdigest(); n=struct.unpack_from('<I',data,12)[0]; gltf=json.loads(data[20:20+n]); bin=data[28+n:]
path=f'/models/interiors/kunning-v6-{sha[:12]}.glb'
(root/'public'/path.lstrip('/')).write_bytes(data)
manifest=root/'data/interiors/kunning.json'; cfg=json.loads(manifest.read_text()); old='/models/interiors/kunning-v6-0c83b4364eef.glb'
assert (root/'public'/old.lstrip('/')).exists()
counts={'renderableTriangles':0,'proxyTriangles':0}
for node in gltf['nodes']:
 if 'mesh' not in node:continue
 for pr in gltf['meshes'][node['mesh']]['primitives']:
  counts['proxyTriangles' if node['name'].startswith('COL_') else 'renderableTriangles']+=gltf['accessors'][pr['indices']]['count']//3
cfg['model']=path; cfg['asset']={'sha256':sha,'encodedBytes':len(data),**counts,'decodedBufferBytes':sum(v['byteLength'] for v in gltf['bufferViews']),'textureBytes':0,'geometryBinSHA256':hashlib.sha256(bin).hexdigest()}
cfg['source']='V6 furniture-only contract retained. R55 changes only the above-ground north stove, supported by Wang Wentao, 故宫学刊 2019 pp501–502, figs4–5, with p508 length/width table cross-check: one low continuous countertop with three covered inset mouths. 430mm height is documented; plan size, relative placement, lid simplification and pot order are reversible model fit, not a site survey. Other furniture and pilu hood are retained, not newly authenticated. No current museum admission claim.'
cfg['refinement']={'id':'r55-kunning-low-stoves','status':'BOUNDED_GROUND_STOVE_PARTIAL_NOT_FULL_RESTORATION','dimensionStatus':'SOURCE_HEIGHT_WITH_REVERSIBLE_PLAN_FIT_NOT_SURVEYED','sourceURL':'https://img.dpm.org.cn/Uploads/File/2020/11/13/u5fae21c07c127.pdf#page=3','sourcePublicationYear':2019,'captureDate':None,'sourceMeasurements':{'aboveGroundHeightMm':430,'potDiametersMm':[1050,1360,1160],'potDepthsMm':[340,780,760],'reportedTotalWidthMm':2160,'summaryTablePrintedPage':508,'summaryTableLengthDescription':'通面阔','summaryTableWidthMm':2160,'widthAmbiguity':'2160mm width is smaller than the 3570mm sum of mouth diameters; p508 distinguishes width from length (length spans the bay). It is not east-west total length. Mapping to this existing model and pot order remain unverified; model plan dimensions stay reversible fit.','frontWoodEdgeMm':{'width':230,'height':185}},'modelFit':{'lengthX':4.0,'depthZ':2.3,'aboveGroundHeight':.43,'localCenter':[-5.22,0,5.775],'mouthCenterZ':5.88,'eastWestPotOrderVerified':False,'flatLidThickness':.035,'lidRadialClearance':.022,'recessedLidSeatTop':.395,'northKangClearance':.020,'ringWidth':.026,'orderExplanation':'Source diameter ratios fit inside the fixed northStove region. Listed order is not verified east-west order.','coveredState':'Three flush simplified wood covers; no conjectural hardware or relief.'},'rollbackModel':old,'excluded':['underground fire pit','buried pot bellies','ground firebox mouths','moving lids','stairs into pit','flues','food','flames','new lights','pilu hood refinement','B architecture changes'],'preservation':'All non-stove triangles, attributes, material records and transforms compared against the retained R54 GLB. Other seven proxies, source profile, Loader and B shell are unchanged.'}
manifest.write_text(json.dumps(cfg,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'model':path,'asset':cfg['asset']},indent=2))
