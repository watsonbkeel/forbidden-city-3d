"""Single-authority G29 feature review. No source image redistribution or acceptance."""
from pathlib import Path
import json,sys,datetime,collections,hashlib
P=Path(__file__).resolve().parents[2];D=P/'docs/photo-fidelity';R=D/'G-REVIEW';sys.path.insert(0,str(P/'scripts/photo-fidelity'))
from queue_storage import load_queue,write_queue
from queue import summarize
q=load_queue();assert q['integration']['release']=='R64-G' and 'completeScopeScan' not in q['integration'];raw=json.loads((D/'QUEUE.json').read_text())['rawSha256'];now=datetime.datetime.now(datetime.timezone.utc).isoformat();ix={i['id']:i for i in q['items']};items=[i for i in q['items'] if i['section']=='G' and i['id'].startswith('FC-')];assert len(items)==29
# Actual code/source boundaries, not guessed missing-entity duplication.
O={}
def obj(name,model,source,residual,categories,viewed=False):O[name]={'model':model,'sourceObservation':source,'residual':residual,'residualCategories':categories.split(','),'specificImageViewed':viewed}
obj('钦安殿','一个专用殿体 garden/36，/37 为非渲染区域；R48四内柱与R49侧入口保留。','已看正面官图中低抱厦仍在；白石台面、红色下部和格扇可辨。2015研究记1950年代拆、2004–2008重建，不能照旧词条删现抱厦。','保测量网格与盝顶；背面、雕刻、宗教室内及真实开放情况待核，侧通行只是游览拟合。','SOURCE,ENGINEERING,TARGET_DATE,BROWSER',True)
obj('天一门','本轮实际新增 garden/40 专用单券门，不再只是 anchors 坐标。原40声明原样。','正反两官图见青砖拱券、绿琉璃带、黄歇山顶、两侧影壁；门扇状态不同。','现6.3×3.9外包络和拱/阶均PHOTO_FIT；外开门为可游览拟合。獬豸、门钉、影壁纹样、满文和庭院全围合未做。','SOURCE,ENGINEERING,TARGET_DATE,BROWSER',True)
obj('绛雪轩','没有实际命名模型；现anchor(-60.1,445.2)不是渲染。','官图可辨本色门窗、附加卷棚抱厦；正文坐东朝西五间硬山，三间抱厦。','13.6×23.9仅地图包络，不能当南向殿宽深；主体/抱厦/花台分开定位，室内未知。','LOCATION,ENGINEERING,SOURCE,TARGET_DATE,BROWSER',True)
obj('万春亭','R47专用十字20角围护/12柱/独立门洞已存在，本轮全字节保持。','本体官图已看但树遮；上圆下方四抱厦不可重当缺失，也不能从千秋复制藻井。','台栏、独立宝顶与本亭天花需要本体视图和尺寸拟合；不因相似共用整副库存。','SOURCE,ENGINEERING,BROWSER',True)
obj('千秋亭','R47独立十字亭保留；本轮仅单球宝顶换四段拟合轮廓。','官图清楚呈台座、瓶状段、颈带与顶冠；细雕不可辨。','仅无雕纹PHOTO_FIT，原四臂/门/物理精确保留；栏杆、独立藻井及隐蔽侧仍未完整。','SOURCE,ENGINEERING,BROWSER',True)
obj('浮碧亭','R48三间主亭/抱厦/通路已存在；本轮补独立天花格框，不重造亭。','百花天花图见方格，外观绿瓦黄剪边；8023桥细图明确见石拱与雕花。','百花图案仍未复原；保旧中央藻井但不宣其来源通过。现实心桥板与拱桥不符，需要池底/台高/侧剖面联合工程，不是缺图。','ENGINEERING,LOCATION,SOURCE,BROWSER',True)
obj('澄瑞亭','R48三间主亭/抱厦/通路已存在；本轮独立方格天花和八方藻井阶层轮廓。','本亭天花及藻井各自官图已看，可见金龙天花与八方中心；不借浮碧花卉纹。','龙纹、彩画、深度和连接细部未复刻；桥拱正文有述但本桥拱像素未看，不能复制浮碧剖面。','SOURCE,ENGINEERING,BROWSER',True)
obj('御景亭','Existing summit pavilion at Duixiu, not a second ground-level pavilion. 南侧实心视觉板改四柱两横栏；另外三面旧板未验保留。','官图可见正面柱与通透横栏；屋坡与后面不可据此完整推断。','山顶支承/旧门与碰撞不变；南栏原本无实体整墙，未留隐形墙。背栏/内部/真实蹬道与山体联合工程待做。','SOURCE,ENGINEERING,LOCATION,BROWSER',True)
obj('堆秀山','现有 duixiu_rockery 与山顶御景亭；不是没有模型。','已看整体官图，山体、登道、水法应分组件；当前种子随机石形不等于实景。','保现有回滚但明确需替换随机山体；山洞、两侧蹬道、喷水与支承/碰撞是独立有源工程，需剖面与位置复核。','ENGINEERING,LOCATION,SOURCE,BROWSER',True)
obj('摛藻堂','缺独立实际模型；研究(-52.5,511.6)18.3×6.9非测绘。','官图见五间硬山、中央门、两侧槛窗及书店标识；前景另一亭天花不属于摛藻堂。','实现本体先定位东北边界；西耳房单独子边界。照片现代书店不冒历史藏书室，室内未知。','LOCATION,ENGINEERING,SOURCE,TARGET_DATE,BROWSER',True)
obj('延晖阁','缺独立实际模型。','官图双明层窗带可辨；文献两明层夹暗层、北倚宫墙。','独立多层壳、墙接合/楼梯与暗层需要方案；不可按两层通用楼或把背景阁当集福门上层。','LOCATION,ENGINEERING,SOURCE,BROWSER',True)
obj('四神祠','缺独立实际模型。','本体官图与正文支持八角主体加抱厦、无斗栱；不是通用敞八角亭。','先注册位置与主体附加体；神祇身份文字有分歧，未看室内不造神像或供台。','LOCATION,ENGINEERING,SOURCE,TARGET_DATE,BROWSER',True)
obj('位育斋','缺独立实际模型。','官图五间硬山、门窗与现代商店标识可辨；相机前亭顶不是本斋天花。','与澄瑞前后关系需地图定位；不据历史用途布佛像，不冒称现代店内完整库存。','LOCATION,ENGINEERING,SOURCE,TARGET_DATE,BROWSER',True)
obj('养性斋','只有anchor(62,444)，没有实际模型；非宁寿养性殿。','官图见东向凹形两层转角、上层廊与下层窗；岩石遮下部。','12.3×25.3是部分包络非全U平面；需三段楼体/接檐/楼梯方案，不补已拆曲流馆。','LOCATION,ENGINEERING,SOURCE,TARGET_DATE,BROWSER',True)
obj('玉翠亭','没有实际命名模型，旧尺寸表定位与官方方位矛盾。','官方文字玉翠东北、凝香西北；项目负X为东，而旧表把玉翠写(+64.9,510.6)。本轮未看本亭像素。','先独立核平面/主体身份，不直接交换两个猜坐标；三色瓦/后来加窗需本体图，亭下仍适用室内核查。','LOCATION,SOURCE,ENGINEERING,BROWSER')
obj('凝香亭','没有实际命名模型，非玉翠别名。','官方西北、旧名金香；旧表(-63.9,511.6)与项目负X=东冲突。本轮未看本亭像素。','独立主体定位与屋瓦/柱/天花图后实现，不能拿玉翠围护和藻井复制。','LOCATION,SOURCE,ENGINEERING,BROWSER')
obj('顺贞门','garden/28通用单门，北墙/33仅7.8m一处开口。','正文三座随墙琉璃门；本次官图仅中央较清楚，前景拱为神武门，背景高楼不是顺贞门顶。','三门组与北墙开口需联合定位/通行设计；不能把20.3×4.5简单三等分，承光/延和/集福是另外院门。','ENGINEERING,LOCATION,SOURCE,BROWSER',True)
obj('钦安殿东南亭','没有模型或已核anchor；复用现FC ID，不另增香亭同义实体。','官方全景3318是导航线索，本轮无本亭像素；文字有东南炉北侧香亭。','须定位钦安院内东南亭与炉关系，核亭顶/柱/亭下，不能从祭祀用名造家具。','LOCATION,SOURCE,ENGINEERING,BROWSER')
obj('钦安殿西南亭','没有模型或已核anchor；复用现FC ID，不另增香亭同义实体。','官方全景3677是导航线索，本轮无本亭像素；文字有西南旗杆石北侧香亭。','须定位钦安院内西南亭与杆石关系，核亭顶/柱/亭下，不能镜像东南假造细部。','LOCATION,SOURCE,ENGINEERING,BROWSER')
obj('承光门','无实际模型；研究anchor(.2,507.6)与10×3.9仅拟合线索。','官方正文北向一间琉璃庑殿门与转折矮墙；现代陈列牌封口不代表历史门叶。','核小院南口位置/朝向、墙转折与通行；无本体像素不造象饰，不与顺贞门合为一物。','LOCATION,ENGINEERING,SOURCE,TARGET_DATE,BROWSER')
for n,s in [('琼苑东门','garden/26，x=-68,z429.7，与/34外园东墙'),('琼苑西门','garden/27，x=68,z429.7，与/35外园西墙')]:obj(n,'现有通用门：'+s+'。','主需求有独立全景导航，但本轮未取本体像素；不是钦安内院小门。','保实体/墙洞/通路，不再增加同名门；屋式/开扇/纹样/牌匾等需来源细核。','SOURCE,ENGINEERING,LOCATION,BROWSER')
obj('御花园东井亭','无实际命名模型/井口；旧图上估(-48.2,457.7)5.3×5.7。','3980.jpg及独立亭内全景链接已列；本次图读取没有返回像素，不能算已看。','先看东井亭本体/檐下/井口关系并校路径树木；不凭名称挖井或添加宫殿家具。','SOURCE,LOCATION,ENGINEERING,BROWSER')
obj('御花园西井亭','无实际命名模型/井口；旧图上估(36.9,461.8)3.1×3.4。','3958/8026/8018独立图链接明确，本次未看像素；不可声明无图。','先看本体/檐下竹纹和井口，独立注册，不复制东亭尺寸或造未证深井。','SOURCE,LOCATION,ENGINEERING,BROWSER')
obj('延和门','无实际模型；旧(-14.3,513.2)未空间核定。','官方同页两侧门词条都写西侧但墙转向相反，文字冲突保留；本门图未看。','先用实景平面区分两侧门与三顺贞门，定位置再建，不按猜测把原宫墙扩大开口。','LOCATION,SOURCE,ENGINEERING,BROWSER')
obj('集福门','无实际模型；旧(15.3,513.1)未空间核定。','8402官图已看为小琉璃门，相邻殿与高背景楼均非本门楼层；词条侧别矛盾。','精确父院/视向/转折矮墙定位后做独立门；背面与隐蔽细部另核。','LOCATION,ENGINEERING,SOURCE,BROWSER',True)
obj('御花园','已有imperial_garden主组、GardenBuilder景观与garden ZoneBase围墙门殿共同组成；不是另一栋殿。','现136×95.6包络与官方约140×80边界定义未对齐；路径/床/随机树/碗灯不因此变成实物库存。','本轮只剪实际被天一占用床面，撤实际穿屏两灯；其余保持不代表史实。28子项及EXPAND-06未完不能总项通过。','ENGINEERING,LOCATION,SOURCE,BROWSER')
for n,ref in [('长康左门','garden/30'),('长康右门','garden/31')]:obj(n,'已有通用候选'+ref+'，不是新增对象。','主需求本体图/现存定位未确认；旧表z421.6/422.4与实际422.7不同。','保原候选ID和导航，先核名称、父院和实际门体；不得凭命名认定物理身份已通过。','SOURCE,LOCATION,ENGINEERING,BROWSER')
assert set(O)=={i['name'] for i in items}
E=['平面朝向与院落连接','层数屋式/脊坡/檐与瓦色','开间柱网、斗栱梁枋和彩画区','门窗开口墙体影壁','台基台阶栏杆柱头','抱厦廊庑耳房及上下连接','牌匾文字、挂位和遮挡','独有庭院设施与位置']
I=['分间门洞柱网标高地坪','天花藻井罩屏和固定装修','主要家具种类数量朝向比例','字画楹联镜灯帘与饰物关系','功能及历史/现代展陈分层','可见缺件及无据模板物件']
notes={}
def note(name,labels,finding,next,categories='SOURCE,ENGINEERING,BROWSER',partial=None):
 for label in labels.split(','):notes[(name,label)]={'finding':finding,'next':next,'residualCategories':categories.split(','),'implementedScope':partial}
note('钦安殿','E4','五块原落地格扇已在旧包络内分为红下部、凹进素框与方格，原闭合碰撞保持。','格子尺度、色彩和遮挡区域仍PHOTO_FIT；不将不可通行正面宣称可游览入口。',partial='Five front-panel skins only; original bay/physics envelopes retained.')
note('钦安殿','E5','原支承体实际砖色与官图白石台不符，本轮仅改白石材质，几何/台阶/支承ID原样。','须另核须弥座线脚、雕刻和栏板，材质纠正不算石作完整。',partial='Marble surface assignment only; all support geometry retained.')
note('钦安殿','E2,E6','专用盝顶、南抱厦、四内柱已有；已看现代官图确有低抱厦。','旧“后拆”文字与2004–2008复建证据并列，不拆现体；坡度/抱厦投影仍分别按测量与拟合分类。','SOURCE,ENGINEERING,TARGET_DATE,BROWSER')
note('钦安殿','I1','R48四内柱源节点与R49游览侧入口已存在，不能以旧stale metadata称缺失。','宗教空间分间/梁架与开放许可未获证，不补祭祀家具；文献柱网不等同整个室内。')
for label in ['E1','E2','E3','E4','E5','I1']:
 note('天一门',label,'实际新专用单券门：24段拱曲线同时驱动可见砌体和既有头顶代理，真实台阶/平台/双向通路；绿带和两素影壁均拟合。','外开门只是游览姿态，粗框/形制不代替9×9门钉、满文、獬豸或完整琉璃细部。',partial='Bounded instantiated Tianyi shell/profile, paired plain screens and physical access; no full inventory acceptance.')
note('天一门','E7','汉字牌面简化框已挂接，满文明确省略；CPU字体输出不代表浏览器读字结果。','浏览器核真实字形与遮挡，不能以CPU空字图认定游戏丢匾。','SOURCE,ENGINEERING,BROWSER')
note('天一门','E8,I3,I4,I6','正面图有动物和纹样，尚无完整三维/背面依据；没有用通用像填充。','保明确待做，不把空白影壁/缺动物称现状完整；门扇钉行另列有源工程。','SOURCE,ENGINEERING,BROWSER')
note('浮碧亭','I2','百花天花来源独立；新增方格框真实接旧顶面；花纹未画，旧中央藻井不因本轮被认可。','核本亭中央区及百花细图再做；不互换澄瑞金龙。',partial='Independent square ceiling-frame relief only.')
note('澄瑞亭','I2','独立官图确认方格天花与八方中心；本轮补格框及阶层轮廓，使用素色而非假龙纹。','金龙/彩画及每层细部后续按清晰照片校，不借别亭。',partial='Independent ceiling frames and fitted octagonal stepped contour only.')
note('浮碧亭','E1,E5,E8','8023实际桥孔图已看；现8.4×.9实心板、池水.3，仅剩.6竖向空间，不能简单切洞装饰。','需桥剖面/池底/通水方向与楼面/栏杆/行人承托统一方案；标有证工程残余而非缺来源。','ENGINEERING,LOCATION,SOURCE,BROWSER')
note('澄瑞亭','E1,E5,E8','保R48池桥通路；来源正文有桥，但尚未看本桥拱部像素。','独立看本桥剖面，不从浮碧照抄曲线或改现支承高度。','SOURCE,ENGINEERING,LOCATION,BROWSER')
note('千秋亭','E2','旧单球与官图分段宝顶不同；本轮只换四段素色低细分轮廓。','细雕、精确比例/背面未知，亭顶其它面与物理未动。',partial='One finial replaced by fitted base/vase/band/crown; no detailed ornament.')
note('御景亭','E5','南栏旧整板与官图通透柱横栏不同；只改可见南面，旧无连续碰撞墙。','另外三面未看不复制，山上台座/登道与山体联合残余；本体几何图不是实景巡游。',partial='South-facing rail only; original supports/collision and three unseen sides retained.')
note('堆秀山','E1,E5,E6,E8','实际seeded duixiu_rockery已经存在，但无真实山洞、侧阶登道和水法组合。','先建立山体/洞/道/水组件边界和剖面，重新验证真实可行路；不可将随机新seed当复原。','ENGINEERING,LOCATION,SOURCE,BROWSER')
note('御花园','E1,E8,I6','仅裁掉实际占新门的床顶/边沿并撤穿新影壁的(-3.3,463.1)/(3.3,463.1)两灯及碰撞；路径/34树/其余两灯两碗精确保持。','未改景观仍UNKNOWN，不将保留随机树和碗灯误认成准确实物清单。',partial='Only proven Tianyi footprint conflicts removed; no broad garden clearing.')
for name in ['玉翠亭','凝香亭']:note(name,'E1','官方玉翠东北、凝香西北，旧尺寸表在负X为东的项目中标反；两者都尚未实际实例化。','核独立平面/身份后建模；不交换猜测坐标或错误复用一个亭。','LOCATION,SOURCE,ENGINEERING,BROWSER')
note('顺贞门','E1,E4,E6','当前只有一门/一墙洞，官方三座随墙门；承光、延和、集福为另三座小院门而非该三门别名。','新开口需独立墙体/门组实体和可行路同一方案；本轮保旧缺口，不将缺工程叫缺源。','ENGINEERING,LOCATION,SOURCE,BROWSER')
for name in ['摛藻堂','位育斋']:note(name,'I5','官图出现现代书店/商店线索；前景另一亭天花不属于本殿。','分别设现代展陈与历史用途证据层，不造历史全套陈设，也不复制前景顶。','TARGET_DATE,SOURCE,LOCATION,ENGINEERING,BROWSER')
# Synchronize new/existing actual identities; never create another canonical FC item.
for name,ref,kind in [('天一门','data/zones/garden.json#/items/40','gate'),('堆秀山','src/scene/GardenBuilder.js#buildRockeryAndTop/duixiu_rockery','rockery')]:
 i=next(x for x in items if x['name']==name);i['runtimeBindingHistoryR64']=i['runtimeBindings'];i['runtimeBindings']=[{'inventoryId':'RI-'+hashlib.sha256(ref.encode()).hexdigest()[:12].upper(),'ref':ref,'kind':kind,'bindingStatus':'CURRENT_SOURCE_AND_GEOMETRY_LINK_NOT_BROWSER_ACCEPTANCE'}];i['bindingStatus']='EXISTING_RUNTIME_COMPONENT' if kind=='rockery' else 'R64_DEDICATED_RUNTIME_INSTANCE'
qin=ix['FC-89576A9B7C'];qin['requiredChildIds']=list(dict.fromkeys(qin['requiredChildIds']+['FC-276BC550CA','FC-30C5E54148','FC-F3135E4D16']))
for child in qin['requiredChildIds']:ix[child]['parentCandidates']=list(dict.fromkeys(ix[child]['parentCandidates']+[qin['id']]))
qin['requiredComponentCandidates']=[{'id':'G-QINAN-'+key,'name':name,'required':True,'facets':{'exterior':'DIFFED','interior':'BLOCKED_SOURCE'},'scope':'Existing-source component candidate, not new FC entity/model/room','runtimeBinding':None,'residualCategories':['LOCATION','SOURCE','ENGINEERING'],'nextAction':act} for key,name,act in [('COURT-WALL','钦安院墙','定位现园墙与独立钦安小院边界，勿重复封路'),('EAST-DOOR','钦安院东小门','先定位，不等同琼苑东门'),('WEST-DOOR','钦安院西小门','先定位，不等同琼苑西门'),('FURNACE','东南焚帛炉','与东南亭相对定位后核实物，不用通用碗代替'),('POLE-STONES','西南旗杆石','与西南亭相对定位，石座和杆的现存阶段分开核')]]
ix['FC-36C011ABEA']['relatedCourtEntityIds']=['FC-A3B03BAB65','FC-2934DA7C63','FC-CAA90DB107']
ix['FC-A1FFC2BC33']['requiredChildIds']=list(dict.fromkeys(ix['FC-A1FFC2BC33']['requiredChildIds']+['FC-4D1D69857E']))
rows=[];featurecount=0
for i in items:
 o=O[i['name']];i['currentCycleAccepted']=False;rowside={};partial={}
 for side,facet in i['facets'].items():
  features=facet.get('features',[])
  if not features:continue
  for n,f in enumerate(features):
   label=('E' if side=='exterior' else 'I')+str(n+1);specific=notes.get((i['name'],label));topic=(E if side=='exterior' else I)[n]
   if specific:r=specific.copy()
   else:
    known=side=='exterior' and o['specificImageViewed'] and n<4
    r={'finding':o['model']+' '+o['sourceObservation']+' 本细项：'+topic+'未获完整验收。','next':o['residual']+' 针对'+topic+'逐件比对，不从名称或导航条目生成默认库存。','residualCategories':o['residualCategories'] if side=='exterior' else ['SOURCE','ENGINEERING','TARGET_DATE','BROWSER'],'implementedScope':None}
   status='PARTIAL' if r['implementedScope'] else 'DIFFED' if (specific or side=='exterior') else 'BLOCKED_SOURCE'
   if i['name']=='御花园':status='PARTIAL' if r['implementedScope'] else 'DIFFED'
   if side=='exterior' and not specific and not o['specificImageViewed'] and i['name'] in ['琼苑东门','琼苑西门','长康左门','长康右门','御花园东井亭','御花园西井亭','钦安殿东南亭','钦安殿西南亭'] and n in [1,2,3,6]:status='BLOCKED_SOURCE'
   f.update(status=status,currentCycleAccepted=False,acceptedScope=None,scopeScanComplete=True,reviewNote=r['finding'],residualAction=r['next'],residualCategories=r['residualCategories'])
   if r['implementedScope']:f['implementedScopeR64']=r['implementedScope'];partial[label]=r['implementedScope']
   rowside[label]={'featureId':f['id'],'topic':topic,**r,'status':status,'accepted':False};featurecount+=1
  statuses=[f['status'] for f in features];facet.update(status='PARTIAL' if 'PARTIAL'in statuses else 'DIFFED' if 'DIFFED'in statuses else 'BLOCKED_SOURCE',currentCycleAccepted=False,currentCycleReview='PARTIAL' if 'PARTIAL'in statuses else 'DIFFED' if 'DIFFED'in statuses else 'BLOCKED_SOURCE',currentCycleScopeReview={'at':now,'scopeScanComplete':True,'evidence':'G-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json','browserAcceptance':False,'wholeObjectAccepted':False})
 i['nextAction']=o['residual'];i['scopeReviewCompleted']=True;i['currentCycleIdentityReview']={'at':now,'physicalIdentityAccepted':False,'renderedBindingCount':len(i['runtimeBindings']),'aggregateNotAdditionalHall':i['name']=='御花园','regionNotSecondBuilding':i['name']=='钦安殿','evidence':'G-REVIEW/REQUIRED-MATRIX-SNAPSHOT.json'}
 rows.append({'id':i['id'],'name':i['name'],**o,'runtimeBindings':i['runtimeBindings'],'requiredChildIds':i['requiredChildIds'],'features':rowside,'boundedChanges':partial,'wholeObjectAccepted':False})
assert featurecount==400
aux=[]
for i in q['items']:
 if i['section']!='G' or not i['id'].startswith('AUX-'):continue
 ref=i['runtimeBindings'][0]['ref'];index=int(ref.rsplit('/',1)[1]);meaning='Outside garden: long inner-court wall, not assigned wholly to G' if index in [10,11,12,13] else 'Cross-area non-rendering street region, not an extra building' if index in [38,39] else 'Existing garden perimeter segment; exact historic boundaries and portal groups unverified'
 i['currentCycleDeclarationReview']={'at':now,'status':'DIFFED','identityAccepted':False,'existingDeclarationOnly':True,'ownership':meaning,'scopeScanComplete':True,'navigationRetained':True};i['entityCountStatus']='EXISTING_DECLARATION_AUDIT_NOT_ADDITIONAL_PHYSICAL_BUILDING'
 for side,f in i['facets'].items():
  if f['status']!='NOT_APPLICABLE':f.update(status='DIFFED',currentCycleReview='DIFFED',currentCycleAccepted=False)
 aux.append({'id':i['id'],'ref':ref,'ownership':meaning,'newGeometry':False,'accepted':False})
assert len(aux)==10
for e in q['expansionTasks']:
 if e['id']=='EXPAND-06':e.setdefault('sectionReviews',{})['G']={'at':now,'status':'DIFFED','enumerationComplete':False,'declarationAudits':10,'nextAction':'Deduplicate named children and typed paths/beds/pools/rocks/trees/ornaments/court-wall components; ten declarations are not ten new buildings. Four walls lie outside G and two street regions cross sections.'};e['status']='DIFFED';e['blocksFullAcceptance']=True
matrix={'release':'R64-G','scope':'Full executability/source-model scan, not full implementation or acceptance','objects':rows,'originalObjects':29,'featureChecks':400,'auxiliaryAudits':aux,'expansion':'EXPAND-06 incomplete','categories':{'SOURCE':'Unviewed/insufficient specific image or present inventory','LOCATION':'Identity/axis/component boundary not settled','ENGINEERING':'Source-supported implementation/physics or binding work remains','TARGET_DATE':'Current display versus historical state unresolved','BROWSER':'Final browser/WebGL visual and device verification absent'},'newCanonicalStatusVocabulary':False,'officialImagesRedistributed':0,'accepted':0}
(R/'REQUIRED-MATRIX-SNAPSHOT.json').write_text(json.dumps(matrix,ensure_ascii=False,indent=2)+'\n')
md=['# G29 required-feature review','', 'All 29 originals / 400 required feature checks / 10 existing declarations are explicitly reviewed. This is a stage with bounded changes, not all-G completion. No ACCEPTED status or browser proof is inferred.','','SOURCE, LOCATION, ENGINEERING, TARGET_DATE and BROWSER are residual categories, not new queue states.','']
for r in rows:
 md+=['## '+r['id']+' '+r['name'],'',r['model'],r['sourceObservation'],'']
 for label,f in r['features'].items():md += ['- '+label+' '+f['topic']+' ['+f['status']+']: '+f['finding']+' Next: '+f['next']+' Residuals: '+','.join(f['residualCategories'])]
 md+=['']
md+=['## Existing declarations','']+['- '+a['id']+' '+a['ref']+': '+a['ownership'] for a in aux]
(R/'REQUIRED-MATRIX-SNAPSHOT.md').write_text('\n'.join(md)+'\n')
counts=collections.Counter(f['status'] for i in items for fa in i['facets'].values() for f in fa.get('features',[]))
res={'release':'R64-G','stage':'FULL_EXECUTABILITY_SCAN_BOUNDED_IMPLEMENTATION_NOT_G_ACCEPTANCE','scope':{'originalObjects':29,'requiredFeatures':400,'auxiliaryDeclarations':10,'featureStatuses':dict(counts),'accepted':0},'objects':[{'id':r['id'],'name':r['name'],'boundedChanges':r['boundedChanges'],'remaining':r['residual'],'categories':r['residualCategories'],'requiredChildren':r['requiredChildIds'],'accepted':False}for r in rows],'auxiliaryAudits':aux,'previousResiduals':q['integration']['retainedPreviousResiduals'],'expansionComplete':False,'sourceImageRecords':21,'referencePhotographsRedistributed':0,'verificationBoundary':'Functional CPU geometry/actual control and independently rebuilt worlds reported separately. Browser, WebGL/GPU, physical phone, full360 and complete period inventory unverified.'}
(D/'RESIDUALS/R64-G-STAGE.json').write_text(json.dumps(res,ensure_ascii=False,indent=2)+'\n')
q['integration']['completeScopeScan']={'at':now,'originalObjects':29,'featureChecks':400,'auxiliaryAudits':10,'report':'G-REVIEW/REQUIRED-MATRIX-SNAPSHOT.md','residuals':'RESIDUALS/R64-G-STAGE.json','wholeSectionAccepted':False};q['progressHistory'].append({'at':now,'internalBatch':'R64-G-COMPLETE-SCAN','action':'Reviewed all29 originals/400features/10declarations; bounded corrections and one Tianyi instance. Known sourced engineering and unviewed-image gaps separated. No whole-section acceptance.'});q['summary']=summarize(q);write_queue(q,expected_raw_sha256=raw)
p=D/'RELEASES/R64-G.json';r=json.loads(p.read_text());r['objects']=[i for i in q['items'] if i['section']=='G'];r['release']=next(x for x in q['releasePlan'] if x['section']=='G');p.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');print(json.dumps(res['scope']))
