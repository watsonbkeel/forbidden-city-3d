"""Derived F55/726 source-model executability matrix. Does not mark acceptance."""
from pathlib import Path
import sys,json,collections
P=Path(__file__).resolve().parents[2];D=P/'docs/photo-fidelity';R=D/'F-REVIEW';sys.path.insert(0,str(P/'scripts/photo-fidelity'))
from queue_storage import load_queue
q=load_queue();items=[i for i in q['items'] if i['section']=='F' and i['id'].startswith('FC-')]
six=json.loads((R/'SIX-COURTS-AUDIT.json').read_text());yang=json.loads((R/'YANGXIN-AUDIT.json').read_text());sources=json.loads((R/'SOURCES-VIEWED.json').read_text())
a={r['id']:r for r in six['objects']};a.update({r['id']:r for r in yang['objects'] if r['id'].startswith('FC-')});assert set(a)=={i['id'] for i in items} and len(items)==55
labels={'exterior':['E'+str(x) for x in range(1,9)],'interior':['I'+str(x) for x in range(1,7)]}
existing={i['id']:a[i['id']].get('binding',[]) for i in items};notes={}
def note(id,label,text,next,flags='DBU'):notes[(id,label)]={'finding':text,'next':next,'flags':flags}
# Each explicit delta has independent source and inherited-code boundaries.
note('FC-0B25381D42','E2','实际 rearHallProfile 强制 gable/hardGableEnd；已看独立官图见下部四面坡与上部山花，独立页写歇山而咸福父页写硬山。','只纠正现有同道堂屋顶，保留文字冲突；上下高度/坡度/瓦细部仍拟合。','DBOCU')
for id,pattern in [('FC-0B25381D42','上部矩形格、下部两主扇玻璃'),('FC-A7ECBBD837','上部菱格、下部三主扇玻璃')]:
 note(id,'E4','四个非中间格仍是落地通高 lattice_doors；官图为高砖槛墙、'+pattern+'，两殿不可同模板复制。','各自照片拟合四窗，中央观览开口与原门扇、碰撞和房间保持；不将拍照时封闭状态当通行规则。','DBOU')
 note(id,'I1','当前只有通用单个 hall 导航房间，不代表文献分间或全部真实居室。','先独立定位实际隔断/琴德簃画禅室或西次间；不得把导航边界当历史分间。','DRBLU')
 note(id,'I6','通用房内家具并非对应本房完整库存；本轮外立面纠正不验证它们。','保留有源室内差异清单，按本房照片/目标时期再处理，不冒空房或首版完整陈列。','DRBLU')
note('FC-A7ECBBD837','I3','已看官图18013：西式餐桌白布、餐椅、边柜、镜与地毯；现 generic hall 案椅柜与该西次间不符。','建立定位明确的西次间局部后再改家具，不借现单导航room自动布满全殿。','DBOLU')
note('FC-A7ECBBD837','I4','官图西次间有镜框、边柜、对称曲边洞口；不是慈禧1884卧室。','区分溥仪生活展与宫廷原状层，房间、陈设与拍摄年代分别核。','DBOLU')
note('FC-A7ECBBD837','E8','官方明确后院井亭已无存。','不从旧文献补井亭；现其它设施仍需位置校准。','RBU')
note('FC-D5026B6E97','I3','实际R48已有西间茶桌与两椅；已看8040图支持这类关系，但旁柜、器物、挂饰、雕刻仍缺或简化。','保留已有茶桌椅，不当新建；更多陈设独立核位置/细节/时期。','RDOBU')
note('FC-D5026B6E97','E6','R48穿堂与后檐退进已有；新看正面图有侧廊相接和浅色雀替，但廊深、连续接檐与本体fit尚未标定。','保留真实双向通路，把连接和雀替列有源工程项而非无图。','RDOBLU')
for id in ['FC-AD8EE60B60','FC-0C3B33AC86']:
 for label in ['E1','E2','E3','E4','E5','E6','E7']:
  note(id,label,'本体官图已看，三间、中央门、两侧槛窗、低台与侧接屋面可辨；没有已确证对应的独立运行实体。','先将照片视向/父院和全景定位到现模型，再按本体图制作；不得把前院匿名配殿擅自改名或增加重复殿。','DBOLU')
for label in ['I1','I2','I4']:
 note('FC-5E17363571',label,'已看8041/8042两向内景：深色密雕落地罩、异形通口与侧嵌玻璃/镜框；R48已有分间/两类框但仅简化形制。','保留R48通行/分间；精细开口、镂空与色彩按同房图再核，不将正反视角误认为两座殿。','RDOBLU')
note('FC-79B3D4D2CE','E1','实际/31仅一个 r48-tiyuan-north-stage，三间面北；属于体元殿北抱厦而非独立新增建筑。','保同一实体父子关系；屋顶接合与舞台内部仍待视图核。','RDBU')
note('FC-BBDB208A58','E4','实际R48前后廊/退进窗口已存在，官图仅前面部分可见且树遮两端。','不得从staleJSON误报缺廊；后面与细分格继续独立核图。','ROBU')
note('FC-BBDB208A58','I2','R48已有晚清民初石膏五蝠天花示意，非通体彩绘顶。','保留类型，不换回模板；纹样/分格与实景仍未验收。','RBU')
note('FC-7AFDED67D3','I2','R54东梢北炕罩明确保留43mesh/1764tri局部源约束形制；西梢仍简化框，两梢不可按同一图复制。','本轮不重做已完成东罩；西梢、中央五屏/宝座、红楼梦壁画分别保留残余。','RDBU')
note('FC-B0A68A4270','I1','R41独立五间、四分隔与R53/R54演员实际承托面已存在，导航room不等于完整1884室内图。','保人物坐姿/脚踏/炕surface与开口，取现陈列独立图逐间复核。','RDBU')
for id in ['FC-3A99A2D3C9','FC-F23666ABA2']:
 for k in range(1,9):note(id,'E'+str(k),'当前 gate 记录仅用于历史位置/地图，实际 buildGate 产生0 mesh；符合已拆不补建原则。','保现状缺席与连通院口；精确历史旧址和展示说明仍可核，不视为待造新门。','RBU')
note('FC-1DD691141C','E1','当前太极门/28是实际通用门；不能与另有全景名的内启祥门直接合并。','补本门名称/所属院落/视点关系，保原ID且不以名称猜建或改位。','RBLNU')
# Yangxin findings are from actual decoded S plus R53 B, not stale generator prose.
for label in ['I3','I6']:
 note('FC-3122B6472E',label,'R53已有勤政炕、座、两低案；新看2-stivNCrFc313官图中央低木脚踏缺失，实际S无重复；外侧高案另缺但西侧与原路线冲突。','只增中央脚踏，分别测B/S地面接触；高案为有源工程/路线残余，不强塞或改旧人物。','RDOBU')
note('FC-3122B6472E','I1','R53四导航分间及南部合法绕行已实际存在；北佛堂/梅坞没有因此完成；图6的圆景/窗为通景画。','保实际B/S层和门洞，未知北部不造；画中窗不得变成真实洞口。','RDOBLU')
note('FC-DC9C591F0F','I2','1-cPnefIMuK313照片可读三希堂匾，正面有窗炕、蓝罩、黄色座与小读书案；R53已经局部实现。','修原输入无确认图的来源关联；保既有三希堂，不把照片局部扩大至全室。','ROBU')
note('FC-DC9C591F0F','I3','R53三希堂蓝罩炕、黄座、书案已有；墙瓶/边箱等可见但精确形制/空间未完整核。','只记录有源残余，保已做部分，未知物件不复制默认器皿。','RDOBU')
for label in ['E1','E4','E6','E8']:
 note('FC-7D18ADECBB',label,'官图3-wEzDjKTBc313已看，琉璃中央门、左右影壁、内木屏门和铜狮可辨；没有独立养心门运行项。','先核南边界与平面位置/尺寸，再做完整门与通行包；不得借东墙遵义门充数。','DBOLU')
note('FC-5D6B1C3547','E7','_DSC9079图只覆盖外檐匾/梁枋近景，不能认证整体前殿九分段或屋顶。','保既有匾挂位，满汉文字/雕框比例独立对照；整体前后立面另取证。','ROBU')
note('FC-9822769EA5','I3','真实S已有东暖阁座与黄纱；5-blzCDKuUt313官图见上深下黄横帘、南窗炕、后蓝屏，现资产近似关系非完整匹配。','保S，不重复B叠同物；按独立资产diff/层替换方案再修。','RDOBLU')
note('FC-8E4E75BF02','I1','有专名vp3000全景入口但未看完整像素；现代码无养心随安室；宁寿同名室不同实体。','查已知视点和平面，勿将图4又日新寝景凭气氛绑定。','DBLNU')
# Build a lossless feature-level review. Default rows explain actual coverage gaps,
# not auto-filling PARTIAL or assuming a linked page was visually examined.
out=[]
for i in items:
 r=a[i['id']];yx='status' in r;state=r.get('auditState',r.get('status'));binding=r.get('binding',[])
 retained=r.get('inheritedWork',[r.get('retained','')]);residual=r.get('residuals',{'engineering':[r.get('residual','')],'identityAndPosition':[],'sources':[]})
 identity=bool(binding or r.get('derivedRuntime') or state.startswith('EXISTING'))
 missing=not identity and not state.startswith('AGGREGATE');historical=i['kind']=='historical_location'
 noimage=i['sourceEvidence']['interior']['inputStatus']=='NO_CONFIRMED_IMAGE_IN_INPUT'
 feats={}
 for side,facet in i['facets'].items():
  for label,f in zip(labels[side],facet['features']):
   flags='RBU' if identity else 'BLU';finding='；'.join(retained) if identity else r.get('actualBinding',state)
   if side=='exterior':
    gap={'E1':'现有平面/院落尺寸仍为拟合，region不计第二实体。','E2':'屋型粗轮廓不等于瓦/脊/坡度与檐色逐图通过。','E3':'已有柱网/梁枋不认证柱距、斗栱和彩画细节。','E4':'实际门窗与观览开启姿态不自动代表拍照时状态。','E5':'现台阶/支承用于通行；石作、栏杆与真实全轮廓仍待核。','E6':'耳房/后殿/接廊需各自定位，父名不能覆盖未建子项。','E7':'殿名显示不代表满汉字、雕框、挂层与遮挡均已实景验收。','E8':'院设施不能从通用装饰或相邻照片推定。'}[label]
   else:
    gap={'I1':'导航房间/地面不自动认证真实分间层高。','I2':'固定装修/天花/落地罩须同房独立图证，已有形制保留。','I3':'家具类型、数量、朝向与陈列年代须同房定位，通用预设非库存。','I4':'字画镜帘灯具关系尚无完整本房可见面证明。','I5':'历史用途、现代展陈与匿名演绎人物必须分层，不能据用途造道具。','I6':'缺失物与无来源模型物分别列项，不以未知推为空房。'}[label]
    if noimage:flags+='N'
    if identity and label in ['I3','I6'] and not yx:flags+='D'
   if missing:finding+='；没有确认的独立物理绑定，先定位而非复制默认壳。'
   finding+=' '+gap
   nxt=('保留原成果与全部必需子项；' if identity else '先核本体/父院坐标与实体边界；')+'补所缺视角与目标时期，按有据差异改进后复核浏览器，不用CPU通过代替视觉验收。'
   row=notes.get((i['id'],label),{'finding':finding,'next':nxt,'flags':flags})
   feats[label]={'featureId':f['id'],'facet':side,**row,'sourceIds':i['sourceEvidence'][side]['sourceIds'],'inputCoverage':i['sourceEvidence'][side]['inputStatus'],'inheritedEvidenceRetained':True,'browserAcceptance':False}
 out.append({'id':i['id'],'name':i['name'],'bindingStatus':state,'priorWork':retained,'auditResiduals':residual,'cautions':i['cautions'],'features':feats,'accepted':False})
assert len(out)==55 and sum(len(x['features']) for x in out)==726
result={'release':'R63-F','baselineCommit':'f87342d7e1506713df4a6877943eb377e8299593','scope':{'originalObjects':55,'requiredFeatures':726,'auxiliaryDeclarations':26,'accepted':0},'flags':{'R':'actual inherited implementation retained, not accepted','D':'specific engineering/provenance difference','O':'actual source image pixels observed within stated subject','L':'identity/location/room boundary gap','N':'necessary target room photo missing or not yet inspected','U':'incomplete angle/metric/date/precision','C':'source conflict retained','B':'browser verification pending'},'boundary':'All original features retained. This is executability/source-model review, not functional or visual acceptance. Five bounded work items are separately tested; prior R48/R53/R54 not counted as new R63 work.','objects':out}
(R/'REQUIRED-MATRIX-SNAPSHOT.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
lines=['# R63-F 全55对象 / 726细项审查','','全部原始细项保留，0项视觉验收。实际生产分派/源图局部观察/工程残余分开；完整浏览器对照仍未完成。','', '|对象|E1|E2|E3|E4|E5|E6|E7|E8|I1|I2|I3|I4|I5|I6|','|---|'+'---|'*14]
for r in out:lines.append('|'+r['id']+' '+r['name']+'|'+'|'.join(r['features'].get(k,{}).get('flags','不适用原无细项') for k in labels['exterior']+labels['interior'])+'|')
lines+=['','## 逐对象差异与残余','']
for r in out:
 lines+=['### '+r['id']+' '+r['name'],'','- 原成果：'+'；'.join(r['priorWork']),'- 身份状态：'+r['bindingStatus'],'- 原注意事项：'+r['cautions']]
 for k,f in r['features'].items():lines+=['- '+k+' ['+f['flags']+'] '+f['finding']+' 下一步：'+f['next']]
 lines+=['']
(R/'REQUIRED-MATRIX-SNAPSHOT.md').write_text('\n'.join(lines)+'\n')
print(json.dumps(result['scope']))
