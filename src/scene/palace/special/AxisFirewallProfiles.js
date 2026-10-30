/** Source-bounded east Taihe connector, not a mirrored pair or surveyed model.
 * Museum 2020 article p54: stepped masonry, not a timber gallery.
 * Its p55 photograph is explicitly captioned east-to-west and independently
 * shows the EAST connector's upper-wall doorway. The plan establishes the
 * transverse relation to 中左门; retained scene control points set metres.
 */
export const AXIS_FIREWALL_SOURCE = 'https://www.dpm.org.cn/Uploads/File/2020/10/23/u5f9255173a228.pdf';
const finite=(value,label)=>{if(!Number.isFinite(value))throw Error(`Invalid Taihe firewall ${label}`);return value;};

export function createTaiheEastFirewallProfile({hall,rect,layers,lh,setback,linkWall}) {
  if(hall?.name!=='太和殿'||hall.position?.x!==0||hall.position?.z!==0)throw Error('Taihe firewall requires the retained Taihe identity and origin');
  if(![linkWall?.from,linkWall?.to].every(v=>Array.isArray(v)&&v.length===2&&v.every(Number.isFinite)))throw Error('Invalid Taihe firewall transverse wall endpoints');
  if(linkWall?.kind!=='wall'||linkWall.from?.[0]>=0||linkWall.to?.[0]>=linkWall.from?.[0]||linkWall.from?.[1]!==linkWall.to?.[1]||!linkWall.gaps?.some(g=>g.gate==='中左门'))throw Error('Taihe firewall requires the east 中左门 transverse wall binding');
  if(layers!==3||!Number.isFinite(lh)||!Number.isFinite(setback)||lh<=0||setback<=0)throw Error('Taihe firewall requires the existing three terrace tiers');
  const halfWidth=finite(hall.dimensions?.width,'hall width')/2,upperEdge=-finite(rect?.hw,'terrace half width');
  if(halfWidth<=0||upperEdge>=0||!Number.isFinite(rect.z0)||!Number.isFinite(rect.z1)||rect.z0>=rect.z1)throw Error('Invalid Taihe firewall retained hall/terrace controls');
  const z=finite(linkWall.from[1],'wall line'),outerJoinX=finite(linkWall.from[0],'outer join'),outerEdge=upperEdge-(layers-1)*setback;
  const terminalHeight=finite(linkWall.h,'terminal height'),visibleHeight=terminalHeight-lh;
  // East hall wall is 0.9m thick in the retained production shell. Touch its
  // exterior plane; never extend through the room or move the plinth to fit.
  const innerJoinX=-halfWidth-.45;
  if(!(outerJoinX<=outerEdge&&outerEdge-outerJoinX<=1&&upperEdge<innerJoinX&&visibleHeight>3.2&&z>rect.z0+2&&z<rect.z1-2))throw Error('Taihe east firewall control points no longer match the reviewed local binding');
  const terraceTiers=Array.from({length:layers},(_,i)=>({
    id:`tier-${i+1}`,x0:outerEdge+i*setback,x1:i===layers-1?innerJoinX:outerEdge+(i+1)*setback,
    floorY:(i+1)*lh,topY:terminalHeight+i*lh,
  }));
  const upper=terraceTiers.at(-1),centerX=(upper.x0+upper.x1)/2;
  // Relative doorway station comes from p55, approximately midway along the
  // visible upper span. The conservative clear opening is a photo fit, not a
  // measurement. Uncertainty is descriptive, not a statistical confidence CI.
  const passage={centerX,clearWidth:2.1,clearHeight:2.25,floorY:layers*lh,
    fit:{stationFraction:.5,stationEnvelopeM:2.4,wallDoorRatioRange:[1.8,2.05],metricStatus:'OWN_FRONT_BACK_RATIO_WITH_RETAINED_WALL_NOT_SURVEY',statisticalInterval:false},
    currentVisitorAccess:'UNKNOWN',gameplayOpen:true};
  if(upper.x1-upper.x0<=passage.clearWidth+.4)throw Error('Taihe firewall opening no longer fits the retained upper span');
  const spans=[...(outerJoinX<outerEdge?[{id:'retained-wall-join',x0:outerJoinX,x1:outerEdge,floorY:0,topY:terminalHeight}]:[]),...terraceTiers];
  return {id:'taihe-east-stepped-firewall',objectId:'FC-1ABC6622CB',side:'east',name:'太和殿东侧阶梯状封火墙（局部拟合）',
    status:'VERIFY_PENDING',dimensionStatus:'PHOTO_FIT_WITH_INHERITED_CONTROLS',z,thickness:1.4,spans,terraceTiers,passage,
    terminalJoin:{x:outerJoinX,z,height:terminalHeight,item:'axis-courts/items/13',gate:'中左门'},
    hallJoin:{x:innerJoinX,z},source:{url:AXIS_FIREWALL_SOURCE,featurePages:[5,6],eastIdentityPage:6,photographDate:'UNSPECIFIED',ownSouth:{vp:'1906',sphere:'1943187762877087744'},ownNorth:{vp:'1701',sphere:'1943158148205166592'},lowerSouth:{vp:'1978',sphere:'1943131446062137344'},observedCapLevels:3,observedDrops:2},
    inherited:{hallWidth:halfWidth*2,terraceUpperHalfWidth:rect.hw,layers,lh,setback},
    remaining:['exact-metric-survey-unknown','lower-brick-foot-height-obscured','fine-painted-pattern-and-leaf-fittings-unverified','browser-matched-views-pending'],
  };
}

/** West has its OWN four source/interface controls; not an east instance rotated
 * through the hall. Source1665 confirms three cap levels and TWO descents. */
export function createTaiheWestFirewallProfile({hall,rect,layers,lh,setback,linkWall}) {
 if(hall?.name!=='太和殿'||hall.position?.x!==0||hall.position?.z!==0)throw Error('Taihe west firewall requires retained hall identity');
 if(linkWall?.kind!=='wall'||![linkWall.from,linkWall.to].every(v=>Array.isArray(v)&&v.length===2&&v.every(Number.isFinite))||linkWall.from[0]<=0||linkWall.to[0]<=linkWall.from[0]||linkWall.from[1]!==linkWall.to[1]||!linkWall.gaps?.some(g=>g.gate==='中右门'))throw Error('Taihe west firewall requires own 中右门 transverse wall');
 if(layers!==3||![lh,setback,rect?.hw,rect?.z0,rect?.z1,hall.dimensions?.width,linkWall.h].every(Number.isFinite)||lh<=0||setback<=0)throw Error('Invalid Taihe west terrace controls');
 const upperEdge=rect.hw,outerEdge=upperEdge+2*setback,outerJoinX=linkWall.from[0],innerJoinX=hall.dimensions.width/2+.45,z=linkWall.from[1],terminalHeight=linkWall.h;
 if(!(outerJoinX>=outerEdge&&outerJoinX-outerEdge<=1&&innerJoinX<upperEdge&&terminalHeight-lh>3.2&&z>rect.z0+2&&z<rect.z1-2))throw Error('Taihe west independent joins no longer fit retained terrace');
 const terraceTiers=Array.from({length:3},(_,i)=>({id:`tier-${i+1}`,x0:i===2?innerJoinX:outerEdge-(i+1)*setback,x1:outerEdge-i*setback,floorY:(i+1)*lh,topY:terminalHeight+i*lh}));
 const upper=terraceTiers[2],centerX=(upper.x0+upper.x1)/2,passage={centerX,clearWidth:2.1,clearHeight:2.25,floorY:3*lh,fit:{stationFraction:.5,wallDoorRatioRange:[1.8,2.05],metricStatus:'OWN_PHOTO_RATIO_WITH_RETAINED_TERRACE_CONTROLS_NOT_SURVEY'},currentVisitorAccess:'UNKNOWN',gameplayOpen:true};
 if(upper.x1-upper.x0<=passage.clearWidth+.4)throw Error('Taihe west own passage no longer fits');
 return {id:'taihe-west-stepped-firewall',objectId:'FC-1ABC6622CB',side:'west',name:'太和殿西侧阶梯状封火墙（自身图拟合）',status:'VERIFY_PENDING',dimensionStatus:'OWN_PHOTO_FIT_WITH_INHERITED_CONTROLS',z,thickness:1.4,
  spans:[...(outerJoinX>outerEdge?[{id:'retained-wall-join',x0:outerEdge,x1:outerJoinX,floorY:0,topY:terminalHeight}]:[]),...terraceTiers],terraceTiers,passage,
  terminalJoin:{x:outerJoinX,z,height:terminalHeight,item:'axis-courts/items/15',gate:'中右门'},hallJoin:{x:innerJoinX,z},
  source:{url:AXIS_FIREWALL_SOURCE,featurePages:[5,6],photographDate:'UNSPECIFIED',ownSouth:{vp:'1931',sphere:'1943192924463087616'},ownNorth:{vp:'1714',sphere:'1943159747552002048'},lowerSouth:{vp:'1665',sphere:'1943153407207194624'},observedCapLevels:3,observedDrops:2},
  inherited:{hallWidth:hall.dimensions.width,terraceUpperHalfWidth:rect.hw,layers,lh,setback},remaining:['exact-metric-survey-unknown','lower-brick-foot-height-obscured','browser-matched-views-pending']};
}
