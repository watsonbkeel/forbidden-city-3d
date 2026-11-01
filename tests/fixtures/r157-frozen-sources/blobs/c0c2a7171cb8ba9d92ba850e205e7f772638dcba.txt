import * as THREE from 'three';
import { buildBalustrade } from '../HallKit.js';
import { closedTerraceStairGeometry } from './ThreeHallTerrace.js';
import { applyBoxUV } from '../../utils/GeometryUV.js';

/** Only the south front of Taihemen. Retained envelope, fitted subdivision:
 * official photographs establish two stairs / central imperial stone, not
 * metric widths, original carvings, or present-day public access. */
export function taihemenSouthProfile({zEdge,y0,y1,run,width,halfWidth}){
 if(![zEdge,y0,y1,run,width,halfWidth].every(Number.isFinite)||y0!==0||y1<=y0||run<=0||width<10||halfWidth<=width/2)throw Error('Taihemen approach requires a finite retained single-tier envelope');
 const imperialWidth=5,cheekWidth=.35,flightWidth=(width-imperialWidth)/2;
 const p={id:'taihemen-south-separated-approach',zEdge,zToe:zEdge-run,y0,y1,run,width,halfWidth,imperialWidth,cheekWidth,
  dimensionStatus:'RETAINED_ENVELOPE_PHOTO_TOPOLOGY_FIT',currentVisitorAccess:'UNKNOWN',imperialWalkingPolicy:'NO_GAMEPLAY_WALKABLE',
  sources:[{url:'https://www.dpm.org.cn/explore/building/236439.html',use:'Official Taihemen building page'},
   {url:'https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e980c931a533.jpg',uploadPathDate:'2020-04-16',photographyDate:null,use:'Two flanking stairs, broad central imperial stone and sloped stone rails'}]};
 p.flights=[-1,1].map(side=>{const centerX=side*(imperialWidth/2+flightWidth/2),f={id:`${p.id}:${side}`,centerX,zEdge,zToe:p.zToe,y0,y1,run,width:flightWidth,cheekWidth,treadCount:Math.max(3,Math.round((y1-y0)/.16))};f.ramp={type:'ramp',axis:'z',minX:centerX-flightWidth/2+cheekWidth,maxX:centerX+flightWidth/2-cheekWidth,minZ:p.zToe,maxZ:zEdge,a0:zEdge,a1:p.zToe,y0:y1,y1:y0};return f;});
 return p;
}
export function buildTaihemenSouthApproach(builder,parent,p){
 parent.userData.taihemenSouth=p;
 const {zEdge,zToe,y0,y1,run,width,halfWidth,imperialWidth,cheekWidth:cw}=p,rise=y1-y0,length=Math.hypot(run,rise),marble=builder.library.material('marble');
 for(const [a,b] of[[-halfWidth,-width/2],[width/2,halfWidth]]){
  builder.col(a,y0,zEdge,b,y1,zEdge+.5);builder.rail(parent,a+.2,zEdge+.2,b-.2,zEdge+.2,y1);
 }
 for(const f of p.flights){
  const g=new THREE.Group();g.name=f.id;parent.add(g);
  const geo=closedTerraceStairGeometry({...f,xEdge:0,centerZ:0,dir:1},builder.library.tileSize('marble'));
  geo.rotateY(Math.PI/2);geo.translate(f.centerX,0,zEdge);
  const m=new THREE.Mesh(geo,marble);m.name=`${f.id}:closed-treads`;m.castShadow=m.receiveShadow=true;g.add(m);
  for(const side of[-1,1]){
   const x=f.centerX+side*(f.width/2-cw/2);
   const cheek=builder.box(g,marble,cw,.4,length,x,(y0+y1)/2+.1,(zEdge+zToe)/2,{box:2});cheek.rotation.x=-Math.atan2(rise,run);
   const rail=buildBalustrade(builder.library,{length:run,height:1.1});rail.name=`${f.id}:sloped-rail:${side}`;
   const mesh=rail.children[0],a=mesh.geometry.attributes.position;
   for(let i=0;i<a.count;i++)a.setY(i,a.getY(i)-a.getX(i)*rise/run);
   a.needsUpdate=true;mesh.geometry.computeVertexNormals();
   rail.rotation.y=Math.PI/2;rail.position.set(x,(y0+y1)/2+.25,(zEdge+zToe)/2);g.add(rail);
   for(let j=0;j<8;j++)builder.col(f.centerX+side*(f.width/2-cw),y0,zEdge-j*run/8,f.centerX+side*f.width/2,y1-j*rise/8+1.35,zEdge-(j+1)*run/8);
  }
  const before=builder.walkables.length;builder.walkRampZ(f.ramp.minX,f.ramp.maxX,zEdge,zToe,y1,y0);builder.walkables[before].structureId=f.id;
 }
 const section=new THREE.Shape();section.moveTo(0,0);section.lineTo(run,0);section.lineTo(0,rise);section.closePath();
 const base=new THREE.ExtrudeGeometry(section,{depth:imperialWidth,bevelEnabled:false,steps:1,curveSegments:1});base.translate(0,0,-imperialWidth/2);base.rotateY(Math.PI/2);base.translate(0,y0,zEdge);
 const body=new THREE.Mesh(applyBoxUV(base,builder.library.tileSize('marble')),marble);body.name=`${p.id}:imperial-solid`;body.castShadow=body.receiveShadow=true;parent.add(body);
 // Existing generic stone texture is a visual placeholder, not a reproduction
 // of Taihemen's carving. No new invented dragons or inscriptions.
 const slab=builder.box(parent,builder.library.material('yulu'),imperialWidth,.3,length,0,(y0+y1)/2+.05,(zEdge+zToe)/2);slab.rotation.x=-Math.atan2(rise,run);slab.name=`${p.id}:imperial-stone`;
 for(let j=0;j<32;j++)builder.col(-imperialWidth/2,y0,zEdge-j*run/32,imperialWidth/2,y1-j*rise/32+.2,zEdge-(j+1)*run/32);
 return p;
}
