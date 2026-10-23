from pathlib import Path
import json,sys,datetime,collections
P=Path(__file__).resolve().parents[2];D=P/'docs/photo-fidelity';sys.path.insert(0,str(P/'scripts/photo-fidelity'))
from queue_storage import load_queue,write_queue
from queue import summarize
q=load_queue();assert q['integration']['release']=='R61-D';assert 'completeScopeScan' not in q['integration'];raw=json.loads((D/'QUEUE.json').read_text())['rawSha256'];now=datetime.datetime.now(datetime.timezone.utc).isoformat()
rows={
'乾清门':('PARTIAL','PARTIAL','两梢间南外窗中宽高/侧窄低已改；原五间三进深、后檐门、三路台阶/影壁保留。','中央后廊一开间方格顶已补；9×7格和蓝金素圆纹仅fit，不是龙纹复刻或全门天花。','完整背/侧、木构尺寸、细格与彩画仍未核；全门厅和两端值房内景不足。'),
'乾清宫':('DIFFED','DIFFED','自身南立面官图与当前实际后三宫B层CPU已看；R26/R30/R33九间开间、两端穿堂、柱网和上层围护仍在，不重复新建。','R29/R32中央陈列三阶台、五扇屏、蓝炉和R34未证暖阁封闭边界保留；当前CPU天花/屏风/栏杆画纹较简化，官图不是全部仙楼/暖阁。','原中央陈列的细纹、柱联、方格天花颜色/密度是有图工程残余；背侧/暖阁完整关系须独立定位，不笼统称全缺源或已完成。'),
'交泰殿':('PARTIAL','DIFFED','正面官图与实际CPU已看，现独立三间攒尖壳及四门保留；南次间两窗中部已改真实直格/暗衬，内面/石槛/门洞保持；6×9及宽比为fit，不是全窗纹样复刻。','R27钟漏/R28屏匾藻井/R54低台与三面罩架已在；黄罩纹样、红屏字画和藻井雕画仍简化，不能以原局部验收替代本轮全内景。','保留南两窗局部改进，继续更细的分格/边饰与完整立面比例；罩架纹样/铭文和壁面等为有源工程残余；其它侧/背立面和全室日期仍未核。'),
'坤宁宫':('DIFFED','VERIFY_PENDING','自身西南斜照与当前B壳CPU已看；偏东门/直棂窗/二层檐存在，但完整背侧、檐口比例与彩画不可由单张照验收。','既有R55真实S三口低灶、东西分间和洞房层保留；本次门联/灯照片只到东暖阁门，不覆盖西祭祀空间，完整S需集中真实加载。','S锅灶不是本轮新成果；官图门联/灯细部、B窗框与墙面色仍有可审差异，完整三面炕/宗教物件库存须按房间时点补源。'),
'坤宁门':('PARTIAL','BLOCKED_SOURCE','独立官方南/北图核定北向；替换通用0.45m门壳为三间、北侧墙/南侧三分窗、真实侧踏步及简牌，保原锚点/墙洞宽。','不生成值房家具；仅可见门廊/门扉，值房内景未核。','1.2m台高和踏步/开间比例是fit；全八字琉璃影壁、两侧庑接合/细雕、满文匾及后廊天花仍待源或定位工程；新侧阶/原钦安地面路线需整世界核。'),
'景运门':('DIFFED','BLOCKED_SOURCE','自身官图已看，当前独立五间三门户/低台礓磋profile保留；未接受的R49C/R49F门头实验不混入。','当前完整门厅梁架未有自身图，不能用门额近照覆盖内景。','门额比例、挂层和旧低梁遮挡是已知有图工程残余；须独立处理整片门头/低梁关系，不盲移门宽柱跨。'),
'隆宗门':('DIFFED','BLOCKED_SOURCE','自身外观图已看；当前独立五间/三门、后内柱门扉与低礓磋保留，不能因照片关门取消游戏实体开口。','门厅内景覆盖不足；箭镞历史文字不是每图都可见的模型细节证据。','细格、匾框形/比例、梁枋彩画和南北接廊有待细核，后向完整视角缺；不将景运镜像当独立复原。'),
'昭仁殿':('DIFFED','BLOCKED_SOURCE','自身彩色正斜照和官方正文实际看过：南向三间、前抱厦/后接室，位乾清宫东。当前src及zone未找到独立绑定，不把旁边匿名廊或宫内暖阁冒充它。','官方历史黑白照和藏书叙述不能推出现状内陈或把数百部书逐本造入。','登记真实缺失模型/待定位工程：先解独立院边界、主殿/抱厦/后室与龙光门的坐标关系，再落专用外壳；正面有源，不写全BLOCKED_SOURCE。'),
'弘德殿':('DIFFED','BLOCKED_SOURCE','自身南面官图和正文已看：三间、前抱厦、后室及东小门。当前没有独立runtime绑定，不能直接镜像昭仁尺寸。','奉三无私、御座、后室匾仅文字，不建立当前完整家具库存。','独立坐标/院墙/凤彩门接合先解；前廊/三分门窗有图，可续专用壳工程，后背与内景仍缺。'),
'内左门':('BLOCKED_SOURCE','BLOCKED_SOURCE','现axis/items20通用墙门及北界墙保留；父页证名称关系，不证明本门完整外形。','门厅/内表面未有专图，未知不以无家具写不适用。','补独立正反立面/墙洞/高差和九卿值房接合，不能按现估计坐标硬扩门。'),
'内右门':('BLOCKED_SOURCE','BLOCKED_SOURCE','现axis/items22通用墙门保留；父页仅证在乾清门西及军机处附近。','无本门全内景，不复制内左结构当已核。','补本体图、门洞数/台阶/屋面与军机处院界；保现正常通行而不称历史准确。'),
'九卿值房':('BLOCKED_SOURCE','BLOCKED_SOURCE','data/anchors九卿房是中可信候选坐标，不是实际zone实体；与蒙古值房相邻不代表同栋。','无已定位现状全室/陈设图，不借军机处家具。','先确认实体边界、朝向与内左/景运北侧关系，再建；不把anchor或地图标题算渲染模型。'),
'蒙古王公大臣值房':('BLOCKED_SOURCE','BLOCKED_SOURCE','父页仅证景运内北侧区域，未唯一对应runtime或证明与九卿房同体。','现状室内布局/库存/日期均缺。','补独立图注、边界与朝向，不复用一个匿名廊段同时关闭两项。'),
'奏事待漏值所':('BLOCKED_SOURCE','BLOCKED_SOURCE','父页记景运内南侧，现没有确认的独立实例。','未见全室图与现陈设，不按值所名称添加桌椅。','位置和边界先核，保该FC任务及父院落欠项。'),
'东暖殿':('BLOCKED_SOURCE','BLOCKED_SOURCE','父词条证坤宁东院独立小殿；当前无唯一实例，与殿内东暖阁严格分开。','没有本体内外专图；不可借洞房照片。','独立院落位置/边界/外观待证后建，不能登记东暖阁两次。'),
'西暖殿':('BLOCKED_SOURCE','BLOCKED_SOURCE','父词条证坤宁西院独立小殿，当前无唯一实例。','无当前本体内景，不镜像东暖殿/暖阁。','补独立边界与现状图；保缺失任务，不推历史用途成库存。'),
'后三宫东庑':('DIFFED','PARTIAL','父词条给南北五门次序；代码garden东侧6匿名段坐标范围已审，未证明所有端点/真实间数。','对应声明opt-in去无据道具，保UNKNOWN而不称实景空房；旧分间仍NOT_VALIDATED。','需要逐段端点、转角、开窗/柱列与真实房间映射；不得把12段/32候选房当420余间完整复原。'),
'后三宫西庑':('DIFFED','PARTIAL','西侧五门次序可核，代码6匿名段保留；历史庑范围不因代码名称自动验收。','只去预设床/箱及专属碰撞，分间/门位置和具体用途仍未知。','独立核各段南转角/北端及南书房关系；不要复制东庑细节。'),
'军机处':('DIFFED','DIFFED','自身外廊官图与源码/anchors已审；anchor88.6/198.8未有同名zone实体，不能据此自动推出整栋宽深。','两张实际房内图可见炕、低案、椅凳及匾；只覆盖局部且拍摄日期未知，不能冒现时完整库存。','定位实际旧声明与殿外北廊边界后，可按已见局部建；有图但位置/范围工程未闭合，不叫全缺源。'),
'上书房':('DIFFED','BLOCKED_SOURCE','2019论文PDF第6页/印刷146页图6已实际看，见外柱廊和门窗局部；乾清门内东南庑位置非米制坐标，当前无独立已绑定实例。','论文旧家具叙述非当前陈列图。','对图6南转角/匿名段确认唯一实体；照片不能推出全栋宽深/内陈，不把历史功能转成当前库存。'),
'南书房':('BLOCKED_SOURCE','BLOCKED_SOURCE','研究文字支持乾清门内西南位置，当前无独立本体外观图/绑定。','无已核现状内景，不按历史功能复制书架。','补空间图/独立外观和现时点，保历史名称但不新增未证房间。'),
'坤宁宫东暖阁':('NOT_APPLICABLE','VERIFY_PENDING','母殿内部子项，无需另建独立外壳；保母殿门洞/实际S分区。','原官方精确命名vp与缩略图记录保留；本轮只看门联/灯近照，未完整360。不是独立东暖殿。','集中实际Kunning S加载/卸载核既有子室，不借西祭灶验收洞房；全360与家具背面/日期继续待核。')}
for side,names in [('东',['日精门','龙光门','景和门','永祥门','基化门']),('西',['月华门','凤彩门','隆福门','增瑞门','端则门'])]:
 for j,name in enumerate(names):rows[name]=('BLOCKED_SOURCE','BLOCKED_SOURCE',f'官方父词条已读，{side}庑南北第{j+1}门次序可核；当前garden内独立命名声明保留，但未有本体专图。','门内表面/构架未核，不能当无室内义务。','补自身门洞数、屋面、台阶和雕饰图；暂保原通行与标签，不把相同generic壳称形制一致。')
assert len(rows)==32
E=['footprint_orientation_court_connections','storeys_roof_type_ridge_pitch_eaves_colour','bays_columns_brackets_beams_paint_zones','doors_windows_openings_walls_screens','terrace_steps_imperial_ramp_rails_posts','porches_corridors_ear_rooms_rear_halls_vertical_joins','plaques_text_placement_orientation_occlusion','unique_courtyard_facilities_locations']
I=['room_partitions_portals_column_grid_levels_steps_floor','ceilings_caissons_frames_paint_screens_fixed_joinery','principal_furniture_type_count_location_facing_scale','pictures_couplets_mirrors_lights_curtains_ornament_relations','function_specificity_worship_library_residential_exhibition','visible_missing_objects_and_unsupported_model_objects']
partial={('乾清门','exterior'):{E[3]},('乾清门','interior'):{I[1]},('坤宁门','exterior'):{E[1],E[2],E[3],E[4]},('交泰殿','exterior'):{E[3]},('后三宫东庑','interior'):{I[5]},('后三宫西庑','interior'):{I[5]}}
records=[];aux=[]
for i in q['items']:
 if i['section']!='D':continue
 if i['id'].startswith('AUX-'):
  moved=any('garden.json#/items/'+str(n) in r['ref'] for r in i['runtimeBindings'] for n in range(14,26));note='声明自身精确12 opt-in清无据道具，保UNKNOWN、32未证分间与原通行；未唯一认定历史东西庑/房名。' if moved else '已有声明/区域范围保留；尚未独立确认本体边界和真实房名，不再生成一个模型。'
  i['currentCycleDeclarationReview']={'at':now,'status':'PARTIAL' if moved else 'DIFFED','scope':note,'runtimeChanged':moved,'physicalIdentityAccepted':False};i['nextAction']='按对应父项核独立位置/边界/照片，不删原审计ID。'
  for side,f in i['facets'].items():f.update(status='PARTIAL' if moved and side=='interior' else 'DIFFED',currentCycleReview='PARTIAL' if moved and side=='interior' else 'DIFFED',nextAction=i['nextAction'],currentCycleScopeReview=note)
  aux.append({'id':i['id'],'runtimeBindings':i['runtimeBindings'],'finding':note});continue
 es,ins,en,inn,nxt=rows[i['name']];i['nextAction']=nxt;i['currentCycleAccepted']=False
 for side,status,note in [('exterior',es,en),('interior',ins,inn)]:
  f=i['facets'][side];f.update(status=status,currentCycleReview=status,nextAction=nxt,currentCycleScopeReview={'at':now,'sourceModelDifference':note,'scopeScanComplete':True,'browserAcceptance':False,'wholeObjectAccepted':False,'evidence':'docs/photo-fidelity/D-REVIEW/COMPLETE-SCAN.md'})
  for a in f.get('features',[]):
   st='BLOCKED_SOURCE' if status=='BLOCKED_SOURCE' else 'VERIFY_PENDING' if status=='VERIFY_PENDING' else 'DIFFED'
   if a['id'] in partial.get((i['name'],side),set()):st='PARTIAL'
   if i['name'] in ['后三宫东庑','后三宫西庑'] and side=='interior' and a['id'] in I[2:5]:st='BLOCKED_SOURCE'
   if i['name']=='乾清门' and side=='interior' and a['id']!=I[1]:st='BLOCKED_SOURCE'
   a.update(status=st,acceptedScope=None,reviewNote=note,residualAction=nxt,currentCycleAccepted=False)
  if i['name'] in ['乾清宫','交泰殿','坤宁宫','景运门','隆宗门','昭仁殿','弘德殿','军机处','上书房'] and side=='exterior':i['sourceEvidence'][side]['currentCycleActuallyViewed']=True
  if i['name'] in ['乾清宫','交泰殿','军机处'] and side=='interior':i['sourceEvidence'][side]['currentCycleActuallyViewed']=True
  if i['name']=='交泰殿' and side=='exterior':f['visualEvidence'].update(before='reports/r61-d-stage/retained-three-review01/inner-three-jiaotai-exterior.png',after='reports/r61-d-stage/jiaotai-windows-01/inner-three-jiaotai-exterior.png',referenceComparison='D-REVIEW/SOURCES-VIEWED.json',browserRun=None)
 records.append({'id':i['id'],'name':i['name'],'exteriorStatus':es,'interiorStatus':ins,'exteriorFinding':en,'interiorFinding':inn,'nextAction':nxt,'accepted':False})
features=[a for i in q['items'] if i['section']=='D' and i['id'].startswith('FC-') for f in i['facets'].values() for a in f.get('features',[])];assert len(records)==32 and len(features)==440 and len(aux)==17 and all(a['status']!='UNREVIEWED' for a in features)
res={'release':'R61-D','stage':'SOURCE_MODEL_EXECUTABILITY_SCAN_NOT_FULL_ACCEPTANCE','sourceCommit':'91c6770-plus-five-bounded-items','objects':records,'auxiliaryAudits':aux,'scope':{'originalDObjects':32,'requiredFeatureChecks':440,'auxiliaryAuditIds':17,'accepted':0,'featureStatuses':dict(collections.Counter(a['status'] for a in features))},'clearKnownEngineeringResiduals':['乾清中央陈列/梁枋/天花细画与柱联','交泰已有罩架/屏风/藻井纹样与南两窗更细分格','坤宁宫B/S门窗、房间照片时点与展示层分离','景运门已知门头挂层/低梁遮挡，未接受实验不得混入','昭仁/弘德/军机处/上书房已有自身图，但独立runtime边界定位未闭合','坤宁门八字影壁/两侧接廊/满文匾和细饰，当前只完成可核门壳及真实侧阶'],'runtimeAcceptance':'All browser/GPU/physical-phone checks remain unperformed. CPU actual geometry cannot substitute.','previousResiduals':['RESIDUALS/R58-A-STAGE.json','RESIDUALS/R59-B-STAGE.json','RESIDUALS/R60-C-STAGE.json'],'publicReferenceImageCopies':0}
(D/'RESIDUALS/R61-D-STAGE.json').write_text(json.dumps(res,ensure_ascii=False,indent=2)+'\n')
lines=['# D32 完整范围扫描与阶段残余','','这是逐对象/逐内外侧可执行性扫描，不是整区验收。原32身份及440细项全部保留，17附加声明审计不当新增建筑。已做5个有界改进：乾清门南窗、中央后廊格顶；坤宁门独立壳与真实侧阶；12内轴匿名庑无据陈设移除；交泰南两窗中直格。','未知室内不等于真实空房；有图工程差异不混称缺源。已有R27/R28/R33/R54/R55等保留，不重复计新成果。','']
for r in records:lines+=['## '+r['id']+' '+r['name'],r['exteriorFinding'],r['interiorFinding'],'下一步：'+r['nextAction'],'']
lines+=['## 范围与验收',json.dumps(res['scope'],ensure_ascii=False),'12既有内轴声明从G转D仅是物理归属澄清，154审计总数与原ID全部保留；没有把32分间等同真实历史全庑。','既有108人物与24路线数据/Kit/运行预算完全不改，仍须在新世界重新绑定。实际浏览器、GPU、手机缺口明确保留；阶段QA结果另见报告，本文不提前宣称通过。','所有官方照片/PDF只本地审阅，仓库/生产包仅含来源链接与校验，不再分发原图。']
(D/'D-REVIEW/COMPLETE-SCAN.md').write_text('\n\n'.join(lines)+'\n')
q['integration']['completeScopeScan']={'at':now,'originalObjects':32,'featureChecks':440,'auxiliaryAudits':17,'report':'D-REVIEW/COMPLETE-SCAN.md','residuals':'RESIDUALS/R61-D-STAGE.json','wholeSectionAccepted':False};q['progressHistory'].append({'at':now,'internalBatch':'R61-D-SCOPE-SCAN','action':'All32/440 original requirements and17 existing declaration audits reviewed; five bounded local changes, known engineering residuals explicit. Concentrated world still pending.','wholeD32Accepted':False});q['summary']=summarize(q);write_queue(q,expected_raw_sha256=raw)
for r in q['releasePlan']:
 if r['section'] not in ['D','G']:continue
 path=D/'RELEASES'/f"{r['release']}.json";out=json.loads(path.read_text());out['release']=r;out['objects']=[i for i in q['items'] if i['section']==r['section']];path.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(res['scope'],ensure_ascii=False))
