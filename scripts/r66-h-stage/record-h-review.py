"""Adopt the complete H43 review into the one canonical queue; no acceptance inferred."""
from pathlib import Path
import sys,json,datetime,copy,collections
P=Path(__file__).resolve().parents[2];D=P/'docs/photo-fidelity';R=D/'H-REVIEW'
sys.path.insert(0,str(P/'scripts/photo-fidelity'))
from queue_storage import load_queue,write_queue
from queue import summarize
q=load_queue();assert q['integration']['release']=='R64-G';raw=json.loads((D/'QUEUE.json').read_text())['rawSha256'];now=datetime.datetime.now(datetime.timezone.utc).isoformat()
obs=json.loads((R/'OBJECT-OBSERVATIONS.json').read_text());observations={r['id']:r for r in obs['objects']};ix={i['id']:i for i in q['items']}
old=copy.deepcopy(q['integration']);old.update(frozenLocalCommit='6a2803b9238a2f3f2225a2bc45a4084b1fbfe0d0',verifiedRemoteCommit='2895ef3f6e877a517bccf7343fd4d7992bf94cd3',residualInventory='docs/photo-fidelity/RESIDUALS/R64-G-STAGE.json',accepted=False);q['completedStageHistory'].append(old)
q['integration']={'release':'R66-H','historicalPlanId':'R65-H','baseLocalCommit':'aa5793395a16fbd870ce758174a5f9438f3bc423','baseTree':'61011e22d5c20afd200248e6ad34cc582225f2c3','baseRemoteCommit':'5bd1846d78ec1bf5df6ad7284678d8f6251b35fd','baseRemoteStatus':'R65_FULL_REMOTE_VERIFIED','branch':'feat/r66-h-northwest-fidelity-20261023','adoptedAt':now,'scope':'All H43,586 required feature checks,3 existing declaration audits,EXPAND02/03/06; no unresolved label creates a physical building.','publicReferenceImageCopies':False,'stageStatus':'IN_PROGRESS','retainedPreviousResiduals':old['retainedPreviousResiduals']+[old['residualInventory']],'releaseCadence':'Necessary cumulative verification, full remote delivery, then I. User merges main. No main/Pages changes.'}
# Correct attribution, not physical geometry or deletion of an unresolved ID.
a=ix['AUX-3001DA0EEDCA'];migration={'at':now,'id':a['id'],'fromSection':a['section'],'fromRelease':a['release'],'toSection':'H','toHistoricalPlan':'R65-H','runtimeRef':a['runtimeBindings'][0]['ref'],'reason':'Existing courtWalls encloses Chonghua at92.62..145.18/460..505.6; code zone west-six does not assign physical court to F.','newEntity':False,'previousReviewRetained':copy.deepcopy(a.get('currentCycleDeclarationReview'))}
a.update(section='H',release='R65-H',sectionAssignment='EXISTING_CHONGHUA_COURT_DECLARATION_H__BOUNDARY_NOT_HISTORICALLY_ACCEPTED',parentCandidates=['FC-DC1832BAF2']);a.setdefault('migrationHistory',[]).append(migration)
for r in q['releasePlan']:
 if r['section']=='F':r['supplementaryRuntimeIds']=[x for x in r['supplementaryRuntimeIds']if x!=a['id']]
 if r['section']=='H':
  if a['id']not in r['supplementaryRuntimeIds']:r['supplementaryRuntimeIds'].append(a['id'])
  r.update(status='IN_PROGRESS',executionRelease='R66-H',partialPublicationLabel='R66-H stage with explicit unresolved H43 features, not complete H acceptance',remoteVersionConflict='R66 execution follows fully verified R65; uploader rechecks before writing')
for k in ['FC-1E7AEF1723','FC-700739D144']:
 i=ix[k];i['contextParentCandidates']=copy.deepcopy(i['parentCandidates']);i['parentCandidates']=['FC-DCA93F15C3'];i['parentResolution']='OFFICIAL_NAMED_REAR_HALL_IMMEDIATE_PARENT__ROOM_POSITION_STILL_UNVERIFIED';i['immediatePhysicalParentId']='FC-DCA93F15C3';i['entityId']=None
 if k not in ix['FC-DCA93F15C3']['requiredChildIds']:ix['FC-DCA93F15C3']['requiredChildIds'].append(k)
E=['平面朝向与院落连接','层数屋式/脊坡/檐与瓦色','开间柱网、斗栱梁枋和彩画区','门窗开口墙体影壁','台基台阶栏杆柱头','抱厦廊庑耳房及上下连接','牌匾文字、挂位和遮挡','独有庭院设施与位置']
I=['分间门洞柱网标高地坪','天花藻井罩屏和固定装修','主要家具种类数量朝向比例','字画楹联镜灯帘与饰物关系','功能及历史/现代展陈分层','可见缺件及无据模板物件']
notes={}
def note(name,labels,text,action,partial=False,categories=None):
 for label in labels.split(','):notes[(name,label)]={'finding':text,'next':action,'implemented':partial,'residualCategories':categories or ['SOURCE','ENGINEERING','BROWSER']}
note('重华宫','E3,E6','只新增已看正面三开间抱厦下六个素轮廓肩撑，实接旧柱梁；未雕花、未改整殿。','核雕纹/材色与浏览器同视角；现拟合尺寸不是测绘。',True)
note('重华宫','I3,I6','仅精确移除四件无源通用宝座及一个专属包络，UNKNOWN/knownEmpty=false；无据房间边界不变且标未验。','乐善堂属崇敬殿、抑斋属浴德殿，不把它们家具放进当前中殿。需本殿当前房间库存。',True)
note('重华宫','I1,I2,I5','R48既有葫芦罩类型、隔断与五间殿保留；同名空间、前后院/房间不是一个模板库存。','结合官图和平面逐房定位，不因既有结构自动接受。',False,['LOCATION','SOURCE','TARGET_DATE','BROWSER'])
note('延春阁','E7','已有注册竖匾移到正面高梁区；完整牌框与真实支承/视线检查，未新增同名牌。','浏览器字形/材质与遮挡验收仍缺；拟合高度4.97、前后-12.35非测绘。',True)
note('延春阁','E5,E6','转棒南栏和挂落均有来源；挂落被旧下屋裙遮挡、上栏完整身体跳跃暴露旧漏腿/屋裙穿落，故换形撤回。原栏所有几何/碰撞恢复。','独立解决上层栏杆脚踝碰撞与下屋裙真实支承/接檐，再恢复来源支持的轮廓；不是缺照片。',False,['ENGINEERING','SOURCE','BROWSER'])
note('延春阁','I3,I6','精确移除八件无据通用家具与八碰撞，未改变楼层/承托/原栏；UNKNOWN不等于历史空房。','完工期室内/梯路/陈设分期定位后制作，不采用施工或1922旧影混充当前库存。',True)
note('延春阁','I1','原三实体层和无可验证上层楼梯状态保持，只有地面房间/到达。','不添加假楼梯或上层传送；保留旧跳跃物理工程红与飞行拒绝落台证据。',False,['ENGINEERING','LOCATION','SOURCE','BROWSER'])
note('英华殿','E4','16南窗叶上新增三方向素框格并闭合边框，保原不通透窗叶和全部物理；不是精确三交六椀雕饰。','本殿细胞/雕纹比例须进一步图证，背/侧窗不据南照复制。',True)
note('英华殿','I2','官方PDF藻井近图已看，青方框、八角层与圆形中心可辨；现绑定位置/尺度未证。','先核实际顶梁/柱网与照片方位再加，不凭一张近照切任意中央洞。',False,['LOCATION','ENGINEERING','SOURCE','BROWSER'])
note('英华门','E1,E4,E5,I1','既有锚点上一座单券门实造曲面开口、匹配拱顶曲线实体、外开素门与真实0.10m低门槛支承；保原地图外包络。','门扇外开为游览姿态，非现场许可；核完整墙院/纹样/尺寸和浏览器画面。',True)
note('英华门','E2,E3,E7,E8,I2,I3,I4,I5,I6','单拱门源图未标摄影日期；保原黄瓦屋拟合，不从别处抄三洞山门、牌匾/门钉/陈设。','区分英华殿山门三券与本门单券；未见装饰和背面库存保持未知。',False,['SOURCE','TARGET_DATE','ENGINEERING','BROWSER'])
rows=[];count=0
for i in q['items']:
 if i['section']!='H' or not i['id'].startswith('FC-'):continue
 o=observations[i['id']];features={};partial={}
 for side,topics in [('exterior',E),('interior',I)]:
  facet=i['facets'][side]
  if facet['status']=='NOT_APPLICABLE':continue
  for n,f in enumerate(facet.get('features',[])):
   label=('E'if side=='exterior'else'I')+str(n+1);topic=topics[n];specific=notes.get((i['name'],label))
   sourcepositive='DIRECT_IMAGE_SOURCE_GAP' not in o['categories'];cats=['LOCATION','ENGINEERING','SOURCE','TARGET_DATE','BROWSER']if not o['runtimeBindings']else['SOURCE','ENGINEERING','TARGET_DATE','BROWSER']
   r=specific or {'finding':o['currentModelObservation']+' 来源核查：'+o['sourceObservation']+' 此项核查为'+topic+'，不从文字用途推定完整几何/库存。','next':o['specificResidual']+' '+o['nextAction'],'implemented':False,'residualCategories':cats}
   status='PARTIAL'if r['implemented']else'DIFFED'if specific or sourcepositive or side=='exterior'else'BLOCKED_SOURCE'
   f.update(status=status,currentCycleAccepted=False,acceptedScope=None,scopeScanComplete=True,reviewNote=r['finding'],residualAction=r['next'],residualCategories=r['residualCategories'],reviewEvidence='H-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json')
   if r['implemented']:f['implementedScopeR66']=r['finding'];partial[label]=r['finding']
   features[label]={'featureId':f['id'],'topic':topic,**r,'status':status,'accepted':False};count+=1
  statuses=[f['status']for f in facet['features']];status='PARTIAL'if'PARTIAL'in statuses else'DIFFED'if'DIFFED'in statuses else'BLOCKED_SOURCE';facet.update(status=status,currentCycleReview=status,currentCycleAccepted=False,currentCycleScopeReview={'at':now,'scopeScanComplete':True,'evidence':'H-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json','browserAcceptance':False,'wholeObjectAccepted':False})
 i.update(scopeReviewCompleted=True,nextAction=o['nextAction']);i['currentCycleIdentityReview']={'at':now,'physicalIdentityAccepted':False,'sourceObservations':'H-REVIEW/OBJECT-OBSERVATIONS.json','runtimeDeclarationCount':len(i['runtimeBindings']),'newPhysicalEntities':0,'immediateParent':o['immediatePhysicalParentId']}
 rows.append({'id':i['id'],'name':i['name'],'model':o['currentModelObservation'],'sourceObservation':o['sourceObservation'],'sourceEvidenceIds':o['sourceEvidenceIds'],'features':features,'boundedChanges':partial,'remaining':o['specificResidual'],'categories':o['categories'],'requiredChildren':i['requiredChildIds'],'accepted':False})
assert(len(rows),count)==(43,586)
aux=[]
for i in q['items']:
 if i['section']!='H'or not i['id'].startswith('AUX-'):continue
 i['currentCycleDeclarationReview']={'at':now,'status':'DIFFED','identityAccepted':False,'existingDeclarationOnly':True,'scopeScanComplete':True,'navigationRetained':True,'note':'Existing court enclosure only; fitted bounds/gate relations not accepted historic survey. No extra hall.'}
 for side,f in i['facets'].items():
  if f['status']!='NOT_APPLICABLE':f.update(status='DIFFED',currentCycleReview='DIFFED',currentCycleAccepted=False)
 aux.append({'id':i['id'],'ref':i['runtimeBindings'][0]['ref'],'newEntity':False,'accepted':False})
assert len(aux)==3
for e in q['expansionTasks']:
 if e['id']in['EXPAND-02','EXPAND-03','EXPAND-06']:
  e.setdefault('sectionReviews',{})['H']={'at':now,'status':'DIFFED','enumerationComplete':False,'report':'H-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json','note':'Deduplicate named children and existing declaration IDs before physical expansion; unresolved ear/side halls and well pavilions must be individually positioned. Chonghua west well pavilion is a symmetry counterpart, not proof of a real well.'};e['status']='DIFFED';e['blocksFullAcceptance']=True
matrix={'release':'R66-H','historicalPlan':'R65-H','scope':'All required-feature executability/source-model review; bounded implementation, not full acceptance','originalObjects':43,'featureChecks':586,'auxiliaryAudits':aux,'objects':rows,'migration':migration,'accepted':0,'officialImagesRedistributed':0,'browserAccepted':False};(R/'REQUIRED-MATRIX-SNAPSHOT.json').write_text(json.dumps(matrix,ensure_ascii=False,indent=2)+'\n')
md=['# R66-H all43 / 586 required-feature review','','Stage, not whole-H acceptance. All previous residuals retained. No reference photo/PDF redistribution.','']
for r in rows:
 md+=['## '+r['id']+' '+r['name'],'',r['model'],r['sourceObservation'],'']
 for label,f in r['features'].items():md+=['- '+label+' '+f['topic']+' ['+f['status']+']: '+f['finding']+' Next: '+f['next']]
 md+=['']
(R/'REQUIRED-MATRIX-SNAPSHOT.md').write_text('\n'.join(md)+'\n')
counts=collections.Counter(f['status']for i in q['items']if i['section']=='H'and i['id'].startswith('FC-')for facet in i['facets'].values()for f in facet.get('features',[]))
res={'release':'R66-H','stage':'ALL43_EXECUTABILITY_SCAN_WITH_BOUNDED_IMPLEMENTATION_NOT_FULL_ACCEPTANCE','scope':{'originalObjects':43,'requiredFeatures':586,'auxiliaryDeclarations':3,'featureStatuses':dict(counts),'accepted':0},'objects':[{k:r[k]for k in['id','name','boundedChanges','remaining','categories','requiredChildren','accepted']}for r in rows],'migration':migration,'expansionsIncomplete':['EXPAND-02','EXPAND-03','EXPAND-06'],'previousResiduals':q['integration']['retainedPreviousResiduals'],'verificationBoundary':'Functional CPU geometry and independently rebuilt B/S worlds reported separately. Browser/GPU, physical phone, full360 and period inventories remain unverified.'}
(D/'RESIDUALS/R66-H-STAGE.json').write_text(json.dumps(res,ensure_ascii=False,indent=2)+'\n')
q['integration']['completeScopeScan']={'at':now,'originalObjects':43,'featureChecks':586,'auxiliaryAudits':3,'report':'H-REVIEW/REQUIRED-MATRIX-SNAPSHOT.md','residuals':'RESIDUALS/R66-H-STAGE.json','wholeSectionAccepted':False};q['progressHistory'].append({'at':now,'internalBatch':'R66-H-ALL43-REVIEW','action':'All43/586features/3declarations reviewed; four bounded existing objects changed. No new unlocated building, no acceptance. Parent correction and one declaration ownership migration preserve every ID.'});q['summary']=summarize(q);write_queue(q,expected_raw_sha256=raw)
for section in ['F','H']:
 r=next(r for r in q['releasePlan']if r['section']==section);p=D/('RELEASES/'+r['release']+'.json');data=json.loads(p.read_text());data.update(release=r,objects=[i for i in q['items']if i['section']==section]);p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
resume=D/'RESUME.md';archive=D/'RESUME-R65-PRIORITY.md';assert not archive.exists();archive.write_bytes(resume.read_bytes());resume.write_text('''# R66-H continuation\n\nCanonical authority is QUEUE.json plus its verified immutable parts, through queue_storage.py. Original plan R65-H is executed as R66-H after the inserted R65 character fix. All43 originals/586 features/3 existing declarations and EXPAND02/03/06 have an explicit source/model/executability review. This is not full H acceptance.\n\nBase R65 local aa5793395a16fbd870ce758174a5f9438f3bc423, remote parent5bd1846d78ec1bf5df6ad7284678d8f6251b35fd. Preserve all108 actors/24routes, mutual bodies, all-day/night fill and author credit. All A-G residuals remain.\n\nImplemented only bounded Chonghua south joinery, Yanchun high registered plaque, exact two-host UNKNOWN inventory withholding, Yinghua south plain lattice and existing single-arch gate. Yanchun turned rail and hanging fascia are withdrawn; original rail restored, real old jump/roof-skirt physics defects retained as engineering residuals. No fake stair/upper destination.\n\nSee H-REVIEW/OBJECT-OBSERVATIONS.json, SOURCE-INDEX.json, REQUIRED-MATRIX-SNAPSHOT.md and RESIDUALS/R66-H-STAGE.json. Official source photos stay private; CPU previews are not browser/WebGL acceptance. Do not touch main/Pages/deployment configuration. Complete necessary checks and full remote delivery before I/R67.\n''')
print(json.dumps(res['scope']))
