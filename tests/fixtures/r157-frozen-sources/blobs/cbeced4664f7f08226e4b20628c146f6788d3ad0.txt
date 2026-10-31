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
  const passage={centerX,clearWidth:2.8,clearHeight:3,floorY:layers*lh,
    fit:{stationFraction:.5,stationEnvelopeM:2.4,widthEnvelopeM:.8,heightEnvelopeM:.6,statisticalInterval:false},
    currentVisitorAccess:'UNKNOWN',gameplayOpen:true};
  if(upper.x1-upper.x0<=passage.clearWidth+.4)throw Error('Taihe firewall opening no longer fits the retained upper span');
  const spans=[...(outerJoinX<outerEdge?[{id:'retained-wall-join',x0:outerJoinX,x1:outerEdge,floorY:0,topY:terminalHeight}]:[]),...terraceTiers];
  return {id:'taihe-east-stepped-firewall',objectId:'FC-1ABC6622CB',side:'east',name:'太和殿东侧阶梯状封火墙（局部拟合）',
    status:'VERIFY_PENDING',dimensionStatus:'PHOTO_FIT_WITH_INHERITED_CONTROLS',z,thickness:1.4,spans,terraceTiers,passage,
    terminalJoin:{x:outerJoinX,z,height:terminalHeight,item:'axis-courts/items/13',gate:'中左门'},
    hallJoin:{x:innerJoinX,z},source:{url:AXIS_FIREWALL_SOURCE,featurePages:[5,6],eastIdentityPage:6,photographDate:'UNSPECIFIED'},
    inherited:{hallWidth:halfWidth*2,terraceUpperHalfWidth:rect.hw,layers,lh,setback},
    remaining:['west-side-unreviewed','exact-metric-survey-unknown','outer-end-detail-unreviewed','own-east-frame-fitted-door-leaves-and-state-unreviewed','browser-matched-views-pending'],
  };
}
