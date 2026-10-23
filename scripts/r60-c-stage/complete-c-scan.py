from pathlib import Path
import json,sys,hashlib,datetime,collections
P=Path(__file__).resolve().parents[2];D=P/'docs/photo-fidelity';sys.path.insert(0,str(P/'scripts/photo-fidelity'))
from queue_storage import load_queue,write_queue
from queue import summarize
q=load_queue();assert q['integration']['release']=='R60-C';assert 'completeScopeScan' not in q['integration'],'One-time scan generator refuses to overwrite later canonical decisions';rawhash=json.loads((D/'QUEUE.json').read_text())['rawSha256'];now=datetime.datetime.now(datetime.timezone.utc).isoformat();ix={x['id']:x for x in q['items']}
# Each note is an object-specific source/model decision, not an acceptance proxy.
rows={
'武英殿':('DIFFED','DIFFED','实际主殿、前月台及现代16展柜仍在；R52侧阶/回折栏和4件器形优化不重做。父页两图实际是武英门，不借作主殿正立面。','本殿d111上向图及实际CPU顶视已逐一看；现20×12绿格和蓝底圆纹仅轮廓，缺龙纹、梁枋精确彩画；现代柜灯/空调不是宫廷家具。','独立核主殿正背侧面和测绘尺寸；自有图的格心/梁枋细纹属于已知工程残余，不冒缺源。2021陈列不能当2026实时库存。'),
'浴德堂':('DIFFED','PARTIAL','现卷棚主堂、闭合后浴室和接口均保留；不是凭穹顶图验收主堂外观/井亭/曲折通道/供水炉灶全系统。','后室自身照片约束既有向内穹顶砖缝，本轮几何/UV/采光孔/代理不动；这是封闭后室的诊断视图，不是开放游线。','其余浴室砖面、拱券与孔边细部为有局部证据的工程残余；主堂、通道、井亭和热工关系仍需独立图/定位。'),
'西华门':('PARTIAL','BLOCKED_SOURCE','实际三券门/五间三进深重檐门楼保留；只把朝西外向上带改浅色窗框密格，其余五面和下挡带精确保留。','门楼完整内景仍未知且无上楼入口；不能把门内北值房照片当门楼室内。','窗叶数、细格纹和米制尺寸为拟合；原屋顶比例/楼上窗实际分组/檐下构架与下门面仍待更细核，不能因新颜色声称全门复原。'),
'断虹桥':('DIFFED','NOT_APPLICABLE','已定位SouthWaterSystem内既有duanhong，不新叠桥；真实桥面下射线有支承。官方照片只是局部及一尊石狮。','单拱露天桥无建筑室内，保留原NOT_APPLICABLE，不删除外部桥下/券/岸连接义务。','单尊狮雕不得复制全部望柱；桥下侧立面/岸线/完整栏板序列须补源。帽形的三角支承为明确工程待决事项，不偷偷新增全局碰撞类型。'),
'南薰殿':('DIFFED','PARTIAL','实际五间单檐歇山、原翼角/屋身保留；独立翼角近照不能覆盖整殿立面。','移除原8个无据通用陈设及其8代理，登记UNKNOWN而非真实空房；40既有藻井构件只分绿/金/棕基础色，未建龙纹浮雕/细画，原几何不变。','优先按自身图处理藻井真实龙纹和斗栱细部，不能把大棕圆称复刻；需补全室、当前陈设、位置与时点，历史5层红柜/画像数不得直接摆成现代库存。'),
'武英门':('PARTIAL','BLOCKED_SOURCE','实际南面两端各4窗字段现都可见；原中深墙本体和各自唯一代理一起前移8.4m。补4段素石栏并保原3阶口，不照抄遮挡下裙。','主门内廊/背面未有足够自身照片；保持原贯通三门户，不用前立面证背面。','石栏望柱雕饰/真实间距、正中开间比例、完整瓦作和彩画/牌匾比例仍为拟合或工程残余，不能用旧矩形预算否认源图差异。'),
'敬思殿':('DIFFED','DIFFED','独立后殿及穿廊连接仍在，不能把“近似主殿”理解为所有尺寸一致。','实际本殿60号上向图与CPU当前20×8格顶已看；设备/现代展柜保留，蓝圆不是完整龙纹。','自身格心/梁枋细纹为有据工程残余；背立面/屋脊/独立尺寸和具体陈列日期待核，不复用主殿天花截图冒自身。'),
'凝道殿':('DIFFED','DIFFED','实际东配殿保留，不与西侧混名/镜像。','w22自身上向图和当前实际CPU明栿/檩椽已看；现通用蓝金纹过于重复，不能称精确彩画。','按本殿图逐件细化已可见梁架彩画，米制梁径/接头/窗立面需补更明确资料；当前陈列保持既有证据边界。'),
'焕章殿':('DIFFED','DIFFED','实际西配殿保留，不把凝道照片镜像。','w07自身上向图和当前CPU明栿/檩椽已看；源图红绿椽排与模型粗纹差距明确。','本殿可见梁架/漆层仍有工程残余；完整外立面/精确尺寸及展品现时库存待核。'),
'恒寿斋':('DIFFED','BLOCKED_SOURCE','已绑定现有items57，既有R48三间硬山和推定台基保留，不能新增第二座。2020论文Fig13确是其燕尾枋。','没有全室陈设证据，模型不补通用家具；门/全室仍不开放。','燕尾枋具体落在当前坐标哪一侧需照片/平面定位；不可把一端样式复制四端。不是再次修已完成硬山屋面。'),
'武英殿穿廊':('DIFFED','VERIFY_PENDING','现有items56工字连接体、门口/地面已定位，不另建重叠通廊。','实际现展通行体与背板保留；历史27间或其它库房数不能用于此廊。','连接高差、两端接檐与自身室内/展墙尺寸仍拟合；须独立全景定位，而不是把已有连接当缺失。'),
'武英殿东廊房':('BLOCKED_SOURCE','BLOCKED_SOURCE','父页只证左右廊房合计63间，未验证东侧单边数和唯一runtime对象。','独立房间与用途/现陈设均未定位，不能生成63间模板或把凝道殿顶替东廊。','先定位父子边界、朝向、端点和独立实例，再逐间确认；保留原FC与EXPAND义务。'),
'武英殿西廊房':('BLOCKED_SOURCE','BLOCKED_SOURCE','父页只证左右廊房合计63间，未验证西侧单边数和唯一runtime对象。','独立房间与用途/现陈设均未定位，不能把焕章殿当西廊房全体。','补独立位置/立面/间数证据，不等分63，不把现有匿名围墙硬命名。'),
'咸安宫':('DIFFED','NOT_APPLICABLE','当前是历史旧址范围，不是另一个现存殿体；1914年宝蕴楼和保留咸安门分开。','原输入已标无可适用的现存全宫室内；不把拆除的历史27房复建在现代楼体上。','统一历史时点和边界说明；保留历史身份，不把区域标签计作新增模型或验收整宫。'),
'咸安门':('DIFFED','BLOCKED_SOURCE','真实当前代码为通用五间殿型三通口，不是围墙门。官页“门三楹”与1939“门及东西掖间共5间”需要分主门/附间，不能机械5改3。','只有匾额梁枋近照，不覆盖门内或证明通口数；不补未知室内。','需自身完整正背立面及附间接合后做专用profile；现黄瓦屋型/开口/梁柱为明确需核的工程差异，不说完全无任何来源。'),
'宝蕴楼':('DIFFED','BLOCKED_SOURCE','实际三栋西式两层/半地下楼、明廊、绿边额、7素圆牌及泥缝已存在；2024官方活动照实际看过，不重做R48旧项。','现闭合外观体，不从1939库房功能推当前室内；不把活动照片等同可入馆全景。','照片可见的4石狮尚未建，圆牌花纹/灰塑/门窗比例仍有已知工程残余；雕塑背面/内部及尺寸未证。'),
'南薰门':('BLOCKED_SOURCE','BLOCKED_SOURCE','实际items8既有小门保留，历史名称/对象对应仍未证，不按估计标签新建更大门。','无自身内景，不新增陈设。','补确切图注、位置/现存时点和正反面；只有既有位置并非历史身份验证。')}
featuresE=['footprint_orientation_court_connections','storeys_roof_type_ridge_pitch_eaves_colour','bays_columns_brackets_beams_paint_zones','doors_windows_openings_walls_screens','terrace_steps_imperial_ramp_rails_posts','porches_corridors_ear_rooms_rear_halls_vertical_joins','plaques_text_placement_orientation_occlusion','unique_courtyard_facilities_locations']
featuresI=['room_partitions_portals_column_grid_levels_steps_floor','ceilings_caissons_frames_paint_screens_fixed_joinery','principal_furniture_type_count_location_facing_scale','pictures_couplets_mirrors_lights_curtains_ornament_relations','function_specificity_worship_library_residential_exhibition','visible_missing_objects_and_unsupported_model_objects']
explicitPartial={('武英门','exterior'):{featuresE[3],featuresE[4]},('浴德堂','interior'):{featuresI[1]},('南薰殿','interior'):{featuresI[1],featuresI[5]},('西华门','exterior'):{featuresE[3]}}
records=[]
for i in q['items']:
 if i['section']!='C' or not i['id'].startswith('FC-'):continue
 es,ins,en,inn,nxt=rows[i['name']];i['nextAction']=nxt;i['currentCycleAccepted']=False
 for side,status,note in [('exterior',es,en),('interior',ins,inn)]:
  f=i['facets'][side];f['status']=status;f['currentCycleReview']=status;f['nextAction']=nxt;f['currentCycleScopeReview']={'at':now,'sourceModelDifference':note,'scopeScanComplete':True,'browserAcceptance':False,'wholeObjectAccepted':False,'evidence':'docs/photo-fidelity/C-REVIEW/COMPLETE-SCAN.md'}
  for a in f.get('features',[]):
   st='BLOCKED_SOURCE' if status=='BLOCKED_SOURCE' else 'VERIFY_PENDING' if status=='VERIFY_PENDING' else 'DIFFED'
   if a['id'] in explicitPartial.get((i['name'],side),set()):st='PARTIAL'
   if side=='interior' and i['name'] in ['武英殿','敬思殿','凝道殿','焕章殿']:st='DIFFED' if a['id'] in [featuresI[1],featuresI[3],featuresI[5]] else 'VERIFY_PENDING'
   # Unknown inventory remains unknown even though ceiling pixels were changed.
   if i['name']=='南薰殿' and side=='interior' and a['id'] in [featuresI[2],featuresI[3],featuresI[4]]:st='BLOCKED_SOURCE'
   a.update(status=st,acceptedScope=None,reviewNote=note,residualAction=nxt,currentCycleAccepted=False)
  if side=='interior' and i['name'] in ['武英殿','敬思殿','凝道殿','焕章殿']:
   i['sourceEvidence'][side]['currentCycleActuallyViewed']=True;f['visualEvidence'].update(after=f"reports/r60-c-stage/retained-interior-review/{dict(武英殿='wuying',敬思殿='jingsi',凝道殿='ningdao',焕章殿='huanzhang')[i['name']]}-retained-ceiling-diagnostic.png",referenceComparison='C-REVIEW/SOURCES-VIEWED.json',browserRun=None)
 records.append({'id':i['id'],'name':i['name'],'exteriorStatus':es,'interiorStatus':ins,'exteriorFinding':en,'interiorFinding':inn,'nextAction':nxt,'accepted':False})
for fid,side,path in [('FC-FA7F5D119E','interior','base-colors-01/nanxun-ceiling.png'),('FC-6B7C231BFD','exterior','pale-windows-01/xihua-existing-west.png')]:
 i=ix[fid];i['facets'][side]['visualEvidence'].update(after='reports/r60-c-stage/'+path,browserRun=None);i['actualChanges'].append({'release':'R60-C','scope':rows[i['name']][3 if side=='interior' else 2],'wholeObjectAccepted':False})
ix['FC-07BD73D61B']['runtimeBindings'][0]['bindingStatus']='ACTUAL_LOCAL_GENERATED_BRIDGE_AND_CREST_TRIANGLE_VERIFIED_NOT_WHOLE_VISUAL_ACCEPTANCE'
aux=[]
for i in q['items']:
 if i['section']!='C' or not i['id'].startswith('AUX-'):continue
 kind=i['runtimeBindings'][0]['kind'];ref=i['runtimeBindings'][0]['ref'];reason='既有声明和构造器已审；当前边界仍为模型拟合，不是实测历史实体。'
 if kind=='region':reason='现有区域标签，不生成独立建筑或房间；西筒子跨区范围仍未唯一归属。'
 if kind=='hall':reason='已唯一关联现有恒寿斋或穿廊，保留审计ID；不是第二个模型。'
 i['currentCycleDeclarationReview']={'at':now,'status':'DIFFED','scope':reason,'runtimeChanged':False,'physicalIdentityAccepted':False};i['nextAction']='沿当前父项/未定边界继续验证；不删ID、不新增伪实体。'
 for side,f in i['facets'].items():f.update(status='DIFFED',currentCycleReview='DIFFED',nextAction=i['nextAction'],currentCycleScopeReview=reason)
 aux.append({'id':i['id'],'ref':ref,'kind':kind,'finding':reason})
features=[a for i in q['items'] if i['section']=='C' and i['id'].startswith('FC-') for f in i['facets'].values() for a in f.get('features',[])];assert len(features)==226 and len(records)==17 and len(aux)==7 and all(a['status']!='UNREVIEWED' for a in features)
res={'release':'R60-C','stage':'SOURCE_MODEL_EXECUTABILITY_SCAN_NOT_FULL_ACCEPTANCE','sourceCommit':'d1e0887','objects':records,'auxiliaryAudits':aux,'scope':{'originalCObjects':17,'requiredFeatureChecks':226,'auxiliaryAuditIds':7,'accepted':0,'featureStatuses':dict(collections.Counter(a['status'] for a in features))},'clearKnownEngineeringResiduals':['南薰自身藻井龙纹/斗栱细形与色画','武英/敬思自身格心/梁枋画纹','凝道/焕章自身梁架彩画细部','宝蕴已见4石狮及圆牌灰塑','咸安主门/掖间独立profile的定位与工程','断虹帽形三角支承工程方案，未经批准不得新增共享类型'],'runtimeAcceptance':'All browser/GPU/physical-phone checks remain unavailable; CPU images cannot substitute.','previousResiduals':['RESIDUALS/R58-A-STAGE.json','RESIDUALS/R59-B-STAGE.json'],'publicReferenceImageCopies':0}
(D/'RESIDUALS/R60-C-STAGE.json').write_text(json.dumps(res,ensure_ascii=False,indent=2)+'\n')
text=['# C17 完整范围扫描与阶段残余','', '本表是逐对象/逐内外侧的可执行性扫描，不是整区验收。全部226项仍保留，已做局部项为PARTIAL；旧成果不清零，实际浏览器证据缺口不以CPU代替。', '','已改5项、涉及4个对象：武英门端窗与素栏、浴德既有内穹顶砖缝、南薰无据道具清除及藻井基础色、西华外向可见窗上带。', '']
for r in records:text+=['## '+r['id']+' '+r['name'],r['exteriorFinding'],r['interiorFinding'],'下一步：'+r['nextAction'],'']
text+=['## 统计与边界',json.dumps(res['scope'],ensure_ascii=False),'已看到的纹样/雕塑工程残余不写成缺源。完整未知房间/库存仍BLOCKED_SOURCE，不把无道具当真实空房。','13个声明实体、1个已生成断虹桥、1个历史旧址区域、2个未独立定位廊房，不能合称17个已验模型。','7个C声明审计继续保留；12个代码属outer-west但物理属H/K的旧声明已经迁移所有权，没有删去154项任何ID。','官图/论文只保留链接与校验，不随仓库/生产包再分发。']
(D/'C-REVIEW/COMPLETE-SCAN.md').write_text('\n\n'.join(text)+'\n')
q['integration']['completeScopeScan']={'at':now,'originalObjects':17,'featureChecks':226,'auxiliaryAudits':7,'report':'C-REVIEW/COMPLETE-SCAN.md','residuals':'RESIDUALS/R60-C-STAGE.json','wholeSectionAccepted':False};q['progressHistory'].append({'at':now,'internalBatch':'R60-C-2','action':'Complete all C17/226 feature and seven declaration scans; retain known source-supported engineering residuals. Five bounded changes have54 focused passes. One cumulative world is running; no browser acceptance.','wholeC17Accepted':False})
q['summary']=summarize(q);write_queue(q,expected_raw_sha256=rawhash)
for r in q['releasePlan']:
 path=D/'RELEASES'/f"{r['release']}.json";data=json.loads(path.read_text());data['release']=r;data['objects']=[x for x in q['items'] if x['section']==r['section']];path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(res['scope'],ensure_ascii=False))
