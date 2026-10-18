import * as THREE from 'three';
import { applyBoxUV } from '../../utils/GeometryUV.js';
import { closedTerraceStairGeometry } from './ThreeHallTerrace.js';

/** Museum1941 section/elevation: individual plinth ~0.9–1.1m.
 * North plan: central group~6m, outer groups~4–4.6m, centers~±6.2–6.6m.
 * Rounded registrations below are candidates, not a current measured survey.
 * Shared terrace, hall footprint and hall-body dimensions are not recalibrated. */
export const BAOHE_HALL_PLINTH = Object.freeze({
  id: 'baohe-individual-north-plinth', rise: 1, run: 1.6, treads: 6,
  stoneWidth: 2.9, innerClearWidth: 1.25, innerCheek: .3,
  outerCenter: 6.4, outerWidth: 4.4, outerCheek: .35,
  evidence: '1941_DRAWING_REGISTRATION_MODERN_PHOTO_TOPOLOGY',
  dimensions: 'APPROXIMATE_NOT_CURRENT_SURVEY', currentAccess: 'UNKNOWN',
  southCovering: 'MODERN_PHOTO_INSTALLATION_NOT_RECONSTRUCTED',
});

export function baoheHallPlinth({ z0, w, d, y, ph, stairW }) {
  const p=BAOHE_HALL_PLINTH;
  if(![z0,w,d,y,ph,stairW].every(Number.isFinite)||ph<p.rise||w<24||d<8||stairW<=0)throw Error('Baohe individual plinth registration');
  const y1=y+p.rise,zEdge=z0+d/2,zToe=zEdge+p.run,flights=[];
  for(const side of [-1,1]) {
    const a=p.stoneWidth/2,b=a+p.innerClearWidth;
    flights.push({kind:'inner',side,minX:side>0?a:-b,maxX:side>0?b:-a,
      centerX:side*(a+(p.innerClearWidth+p.innerCheek)/2),width:p.innerClearWidth+p.innerCheek,
      cheekCenters:[side*(b+p.innerCheek/2)],cheekWidth:p.innerCheek});
    const c=side*p.outerCenter,cw=p.outerCheek;
    flights.push({kind:'outer',side,minX:c-p.outerWidth/2+cw,maxX:c+p.outerWidth/2-cw,
      centerX:c,width:p.outerWidth,cheekCenters:[c-p.outerWidth/2+cw/2,c+p.outerWidth/2-cw/2],cheekWidth:cw});
  }
  for(const f of flights){Object.assign(f,{id:`${p.id}:${f.kind}:${f.side}`,zEdge,zToe,y0:y,y1,run:p.run,treadCount:p.treads});
    f.ramp={type:'ramp',axis:'z',minX:f.minX,maxX:f.maxX,minZ:zEdge,maxZ:zToe,a0:zEdge,a1:zToe,y0:y1,y1:y};}
  const ch=p.stoneWidth/2+p.innerClearWidth+p.innerCheek;
  const openings=[[-p.outerCenter-p.outerWidth/2,-p.outerCenter+p.outerWidth/2],[-ch,ch],[p.outerCenter-p.outerWidth/2,p.outerCenter+p.outerWidth/2]];
  return {...p,z0,w,d,y0:y,y1,zEdge,zToe,flights,openings,southStairWidth:stairW,priorFloorY:y+ph};
}

export function buildBaoheHallPlinth(b,parent,input) {
  const p=baoheHallPlinth(input),g=new THREE.Group();g.name=p.id;g.userData.structure=p;parent.add(g);b.baoheHallPlinth=p;
  const marble=b.library.material('marble'),tile=b.library.tileSize('marble');
  b.libBox(g,'sumeru_band',p.w,p.rise,p.d,0,p.y0+p.rise/2,p.z0,'band');
  b.libBox(g,'stone_slab',p.w+.2,.1,p.d+.2,0,p.y1-.03,p.z0,'box');
  b.walkBox(-p.w/2,p.z0-p.d/2,p.w/2,p.z0+p.d/2,p.y1);
  for(const side of [-1,1])b.col(side*p.w/2,p.y0,p.z0-p.d/2,side*(p.w/2-.5),p.y1,p.z0+p.d/2);
  // South visitor-cover configuration has not been dated. Preserve its inherited
  // approach footprint, adapting only the height/run to the lower common floor.
  const zs=p.z0-p.d/2,half=p.southStairWidth/2;
  b.col(-p.w/2,p.y0,zs,-half,p.y1,zs+.5);b.col(half,p.y0,zs,p.w/2,p.y1,zs+.5);
  b.buildStair(g,{zEdge:zs,dir:-1,y0:p.y0,y1:p.y1,run:p.run,width:p.southStairWidth});
  let cursor=-p.w/2;
  for(const[a,c]of p.openings){b.col(cursor,p.y0,p.zEdge,a,p.y1,p.zEdge-.5);cursor=c;}
  b.col(cursor,p.y0,p.zEdge,p.w/2,p.y1,p.zEdge-.5);
  const length=Math.hypot(p.run,p.rise),angle=Math.atan2(p.rise,p.run),zc=(p.zEdge+p.zToe)/2;
  for(const f of p.flights){
    const geometry=closedTerraceStairGeometry({...f,dir:1,xEdge:0,centerZ:0},tile);geometry.rotateY(-Math.PI/2);geometry.translate(f.centerX,0,p.zEdge);
    const m=new THREE.Mesh(geometry,marble);m.name=f.id;m.castShadow=m.receiveShadow=true;g.add(m);
    for(const x of f.cheekCenters){const cheek=b.box(g,marble,f.cheekWidth,.25,length,x,(p.y0+p.y1)/2+.06,zc,{box:tile});cheek.rotation.x=angle;cheek.name=f.id+':cheek';
      for(let j=0;j<8;j++)b.col(x-f.cheekWidth/2,p.y0,p.zEdge+j*p.run/8,x+f.cheekWidth/2,p.y1-j*p.rise/8+.18,p.zEdge+(j+1)*p.run/8);}
    const at=b.walkables.length;b.walkRampZ(f.minX,f.maxX,p.zEdge,p.zToe,p.y1,p.y0);b.walkables[at].structureId=f.id;
  }
  const section=new THREE.Shape();section.moveTo(0,0);section.lineTo(p.run,0);section.lineTo(0,p.rise);section.closePath();
  const solid=new THREE.ExtrudeGeometry(section,{depth:p.stoneWidth,bevelEnabled:false,steps:1,curveSegments:1});
  solid.translate(0,0,-p.stoneWidth/2);solid.rotateY(-Math.PI/2);solid.translate(0,p.y0,p.zEdge);
  const body=new THREE.Mesh(applyBoxUV(solid,tile),marble);body.name=p.id+':solid-stone';body.castShadow=body.receiveShadow=true;g.add(body);
  const face=new THREE.PlaneGeometry(p.stoneWidth,length);face.rotateX(-Math.PI/2+angle);face.translate(0,(p.y0+p.y1)/2+.04,zc);
  const slab=new THREE.Mesh(face,b.library.material('yulu'));slab.name=p.id+':carved-surface';slab.receiveShadow=true;g.add(slab);
  for(let j=0;j<16;j++)b.col(-p.stoneWidth/2,p.y0,p.zEdge+j*p.run/16,p.stoneWidth/2,p.y1-j*p.rise/16+.08,p.zEdge+(j+1)*p.run/16);
  return p.y1;
}
