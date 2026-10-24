"""Read current queue and generate only the L11/136 review snapshot; never mutate queue."""
from pathlib import Path
import json,gzip,datetime,collections,subprocess
P=Path(__file__).resolve().parents[2];D=P/'docs/photo-fidelity';OUT=D/'L-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json'
m=json.loads((D/'QUEUE.json').read_text());q=json.loads(gzip.decompress(b''.join((D/'QUEUE.parts'/m['gzipSha256']/p['name']).read_bytes()for p in m['parts'])))
items=[i for i in q['items']if i['section']=='L'];assert len(items)==11 and all(i['id'].startswith('FC-')for i in items)
GROUP='FC-E8C2F3E267';CHILDREN=['FC-168251EA2D','FC-2BC4B765C8','FC-5E9F74827C','FC-540CD84282']
models={
'神武门':'Layout/13 已有北门声明，GateTowerProfiles/GateTowerShell 已实现独立公布轴网与三券门、上层殿体；不是五间三进深华门复制体，本轮不改。',
'角楼':'Enclosure.buildCornerTowers 四次循环复用29m包围盒轮廓和27.5m总高拟合；本轮仅共享铜鎏金宝顶圆腹、短颈、顶珠轮廓，不代表复合屋顶整体准确。',
'西华门内北值房':'官方名称及门内北侧关系明确；当前无精确运行绑定，不能另造一个普通房屋作为完成。',
'内金水河':'Layout/3 声明由 palace/river.js 与 R36 南部河道和明确桥位驱动；遗留 dimensions 100×15 不是实测河道矩形，本轮保留几何。',
'紫禁城城墙':'Layout/1 与 Enclosure.buildOuterWalls 已有四边城墙。PALACE_RECT 实际 minZ=-425/maxZ=547，南北972m；旧注释961m与实际不同。官方961m已知，此为工程坐标残项而非资料不足。',
'护城河':'Layout/0 筒子河外框940.5×1147.5、riverWidth=52为既有工程参数；官方约52m宽仅支持总说，不证明四边现状岸线。',
'城隍庙':'当前无运行绑定；官方西北隅西墙旁及山门、庙门、正殿、配殿应逐项定位，不生成无定位的院落。'}
for n in ['东北角楼','东南角楼','西北角楼','西南角楼']:models[n]='Enclosure.buildCornerTowers 已有该方位独立实例，共用29m模型与宝顶模板；本轮继承共享拟合，不作该方位照片独立验收。'
# All eight exterior checklist IDs retain their original denominator, including outdoor adaptations.
notes={
'神武门':['已公布五间一进深轴网保留；北门与972m宫墙工程坐标仍需联合核查。','重檐庑殿既有专用造型，本轮无实景屋坡/檐高验收。','专用轴网、围廊柱梁保留；彩画及局部斗栱仍未逐构件核。','三券门及上层门窗已有专用构造，完整开口照片比例待核。','城台石栏及门洞既有几何，踏步/栏柱相接需连续通路验证。','四周围廊不可按华门三进深复制；围廊竖向接缝待实景核。','牌匾模块保留；本轮未做该门新视点遮挡验收。','钟鼓文字有据，但具体形制位置未有已核内景，不添任意陈设。'],
'角楼':['十字交叉平面与内外抱厦深度不同有官方文本；29m统一包围盒不等于测绘。','本轮已看官方角楼两图，仅圆腹/短颈/顶珠宝顶轮廓共享拟合；屋坡、三层檐和复合歇山其余部分不验收。','共享柱梁斗栱仍为通用模板，不能据宝顶局部改动标全部准确。','门窗仅模板；独立方位开口和墙面不明。','石台与城墙连接采用既有模型，未测各侧台基栏杆高度。','抱厦交叉与檐部接合残项保留，不另加一个父组室内。','泛称角楼图不确认四座牌额；不凭总组创造文字。','四角楼及城墙护城河关系已声明，泛称照片不支持逐方位设施定位。'],
'西华门内北值房':['名称/门内北侧关系有据；精确落点和运行绑定待工程定位。','官方专图8007.jpg存在；完整屋坡/尺寸尚缺，不造默认屋顶。','未有运行模型对照；柱数梁架局部证据待专图核查。','门窗完整立面未核；不可沿用六宫默认开间。','台基阶石与地坪连接未定位，不伪造可达路线。','与西华门和附房连接尚未在代码绑定。','无可确认牌额文字与位置，不造牌匾。','独立值房身份保留，不以父门构件替代完成。'],
'内金水河':['已有R36南部蜿蜒河道/桥位；全河走向涵洞宽度坡度未全核。','无建筑屋顶；本细项转核露天水面剖面与岸石顶缘，不生成檐口。','无殿堂柱梁；对应桥栏与岸石承托，非柱网建模任务。','无门窗；对应桥下过水开口及涵洞，后者缺全程图证。','局部岸石和水面有官方桥图；全河岸高/阶石不能按局部图验收。','对应桥梁-河岸过渡及连续岸线；保留原桥位，不宣称全河连通已验。','无已确认建筑牌额；不得为河道添加默认牌匾。','明确内金水桥等桥位与河道关联；各段桥型及设施仍待分别比对。'],
'紫禁城城墙':['官方南北961m/东西753m；实际代码南北972m，调整必须联动神武门北墙四角楼及路线。','无殿堂屋顶；对应女墙顶缘和城墙冠部，逐段差异未核。','无殿堂柱梁；对应墙体结构/垛口段落，不能套柱网。','对应四门洞口及墙段接合；现代码北门开口沿用神武门宽度。','官方约10m高支持总说；台基厚度、墙坡及马道逐段未知。','对应墙-门-角楼接合，972m与961m残项不得盲缩北墙解决。','不把宫门牌额算作每段城墙牌额；无额外文字证据不造。','女墙、排水、马道与维修段尚未逐段核验，保留工程和图证残项。'],
'护城河':['既有矩形外框不是现状岸线测绘；四边分别复核，不据52m总说全验。','无屋顶；对应水面高度和岸石顶缘，不新增建筑檐部。','无柱梁；对应岸石与桥下支承，跨河桥须独立定位。','无门窗；对应桥下通水开口，不凭默认门洞生成。','约52m河宽文字有据，岸石坡度/水位/平台无逐段尺度。','对应河岸连续接头、桥岸过渡及城台关系，沿用几何不宣称全路线通过。','无建筑牌额任务；河道不生成默认文字。','河岸植被及四边跨河桥未逐一确认；不均匀复制树木或桥。'],
'城隍庙':['西北隅西墙旁有文本，仍无精确运行绑定；独立院落定位是工程残项。','官方外景/琉璃门图已列，山门庙门正殿配殿屋顶需分别比对。','无已绑定实体柱梁，不能以一总名充作多座完成。','琉璃门官方图可供核查，不推定正殿全部门窗。','台基阶石与西墙地坪关系未定位；不虚构可进入路径。','山门、庙门、正殿、配殿应逐项展开，不能无证扩成多个既定建筑。','牌额字形和挂位未专项核验，不能仅用总名造牌匾。','庙宇功能并不证明当前神像/香案清单；不添无证设施。']}
childnotes=['四隅实例已有独立绑定；父组关系只作目录，不是测绘坐标确认。','继承共享宝顶拟合，但无该方位独立照片，仍DIFFED不PARTIAL。','共享柱梁斗栱模板，逐座差异待带方位图核查。','各方位门窗开口缺独立照片，保持未验。','台基/城墙接缝未作逐座实景尺寸验收。','复合歇山抱厦相接使用通用模型，独立方向形体仍待核。','没有该方位牌额证据，不造新文字。','现有方位和护城河关系仅工程声明，不代表逐座景观独立核验。']
interiors=['分隔、柱网、楼层及踏步','天花、藻井、梁架和彩画','主家具数量、位置和朝向','挂画、对联、镜灯及帘幕关系','现状使用功能及陈设时期','遗漏物件与无证物件']
records=[];patches=[]
for i in items:
 name=i['name'];is_child=i['id']in CHILDREN
 r={k:i.get(k)for k in ['id','name','section','kind','nature','runtimeBindings','registryBindings','placeBindings','parentCandidates','requiredChildIds','bindingStatus']}
 r.update(scopeReviewCompleted=True,currentCycleAccepted=False,physicalIdentityAccepted=False,currentModel=models[name],observedSourceScope=i['cautions'],remaining=models[name]+' 所有完整对象仍未验收；具体残项见每个feature。')
 r['sourceReviewEvidence']={'inheritedInputSourceIds':list(dict.fromkeys(i['identitySourceIds']+[s for e in i['sourceEvidence'].values()for s in e['sourceIds']])),'inspectedImages':(['https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d3ef250ba9.jpg','https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d3f0db3657.jpg']if i['id']==GROUP else []),'imageInspectionByThisWorker':False,'imageInspectionReportedByImplementationOwner':i['id']==GROUP,'allSourcecardImageURLsAreViewed':False,'browserComparisonPerformedByThisSynthesisWorker':False,'sourceReadScope':'Master official-source captions, current queue and dedicated runtime code. Actual two generic corner-tower image inspections reported by implementation owner; no per-direction identity assigned.'}
 r['facets']={}
 for side,facet in i['facets'].items():
  fs=[]
  for j,f in enumerate(facet.get('features',[])):
   status='DIFFED';cats=['ENGINEERING','BROWSER']
   if side=='exterior':
    note=(childnotes if is_child else notes[name])[j]
    if i['id']==GROUP and j==1:status='PARTIAL'
    if is_child:cats+=['SOURCE_DIRECTIONAL_IDENTITY']
   else:
    status='BLOCKED_SOURCE';cats=['SOURCE_CURRENT_INTERIOR','BROWSER']
    note=interiors[j]+'：缺可确认当前内部图，不把官方功能文字扩成精确陈设。'
    if i['id']==GROUP:note=interiors[j]+'：仅汇总四子空间待核项，禁止在父组另造通用室内；子楼内部图证不足。'
    if name=='神武门'and j==0:status='DIFFED';cats=['ENGINEERING','BROWSER'];note='五间一进深及围廊已有正式轴网和专用代码；保留现有实现，楼层踏步分隔本轮未作实景验收。'
   fs.append({'id':f['id'],'status':status,'acceptedScope':None,'currentCycleAccepted':False,'scopeScanComplete':True,'reviewNote':note,'residualAction':name+'／'+f['id']+'：'+note,'residualCategories':cats,'reviewEvidence':'L-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json','targetVersionConfirmed':False})
  stat='NOT_APPLICABLE'if not fs else ('PARTIAL'if any(f['status']=='PARTIAL'for f in fs)else 'DIFFED'if any(f['status']=='DIFFED'for f in fs)else 'BLOCKED_SOURCE')
  r['facets'][side]={'status':stat,'currentCycleReview':stat,'currentCycleAccepted':False,'scopeScanComplete':True,'notApplicableReason':facet.get('notApplicableReason'),'features':fs}
 records.append(r)
 if is_child:patches.append({'id':i['id'],'beforeParentCandidates':i['parentCandidates'],'parentCandidates':[GROUP],'parentResolution':'MASTER_TEXT_GROUP_MEMBERSHIP_NOT_SURVEYED_COORDINATES','reason':'Four directional towers belong to aggregate corner-tower directory; not a fifth building or surveyed topology.','physicalObjectsAdded':0,'physicalIdentityAccepted':False})
counts=collections.Counter(f['status']for r in records for fac in r['facets'].values()for f in fac['features']);assert sum(counts.values())==136 and counts['PARTIAL']==1
out={'schemaVersion':'r70-l-required-review-draft/v1','draftOnly':True,'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'requestedProductRevision':'R70-L local bounded draft; no full visual acceptance','observedHead':subprocess.check_output(['git','rev-parse','HEAD'],cwd=P,text=True).strip(),'scope':{'masterObjects':11,'auxiliaryDeclarations':0,'featuresReviewed':136,'featureStatusCounts':dict(counts),'acceptedObjects':0,'imageInspectionByThisSynthesisWorker':False,'noQueueWrites':True,'noInventedEntityBindings':True,'implementedFeatureScopes':1},'integrationInstructions':['Merge by stable id/facet/feature.id; preserve all 136 feature IDs and previous residuals.','PARTIAL applies only to generic tower-group finial silhouette, never individual directional photo acceptance.','972m versus official 961m is a known engineering discrepancy, not a missing-source excuse; no blind wall shortening.','Outdoor generic checklist IDs retain denominator with explicit adaptation; no interior furniture is generated.','Do not set actuallyViewedThisPlanningPass for sourcecards not independently inspected.'],'records':records,'auxiliaryRecords':[],'sourceEvidenceManifest':'L-REVIEW/PHOTO-SOURCES.json if prepared by implementation owner; this script does not create it','identityPatchProposals':patches,'preserveIdentityCandidates':[],'implementationEvidence':{'boundedScope':'Shared corner-tower finial rounded belly, short neck and top bead; photographic reversible fit, not measured geometry','independentDirectionalAcceptance':False,'wholeSectionAccepted':False}}
OUT.parent.mkdir(parents=True,exist_ok=True);OUT.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out['scope'],ensure_ascii=False))
