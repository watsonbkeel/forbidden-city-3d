import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';

const ID='axis/taihe-terrace-instruments';
const PHOTOS={sundial:'https://img.dpm.org.cn/Uploads/Picture/dc/1609%5B1024%5D.jpg',jialiang:'https://img.dpm.org.cn/Uploads/Picture/dc/2536.jpg'};
const PREFIX='taihe-terrace-instrument:';

// A small, closed hipped stone canopy. The eave return and short ridge are
// original low-detail fits to the visible photograph, not borrowed palace
// roof construction, measured curvature, carving or verified rear detail.
function canopyGeometry(){
 const vertices=[];
 for(const [half,y] of[[.70,2.54],[.78,2.63],[.62,2.60]])for(const [x,z] of[[-1,-1],[1,-1],[1,1],[-1,1]])vertices.push(x*half,y,z*half);
 vertices.push(-.22,2.93,0,.22,2.93,0);
 const index=[0,1,2,0,2,3];
 for(let ring=0;ring<2;ring++)for(let i=0;i<4;i++){const a=ring*4+i,b=ring*4+(i+1)%4;index.push(a,a+4,b,b,a+4,b+4);}
 index.push(8,12,9,9,12,13,9,13,10,10,13,11,11,13,12,11,12,8);
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(index);g.computeVertexNormals();return g;
}

/** The two instruments ONLY. Caller must replace the four old visible meshes
 * and two old full boxes; never overlay this group on legacy solids. All
 * lengths are reversible source-relationship fits inside the retained nearby
 * route envelope. This does not certify whole Taihe Hall or museum access. */
export function buildTaiheTerraceInstruments(builder,parent,input){
 if(!input||Object.keys(input).sort().join(',')!=='y,zf'||![input.y,input.zf,builder?.ox,builder?.oz].every(Number.isFinite)||input.y<0||
   !parent?.isGroup||parent.position.lengthSq()!==0||parent.rotation.x!==0||parent.rotation.y!==0||parent.rotation.z!==0||!parent.scale.equals(new T.Vector3(1,1,1))||
   !Array.isArray(builder.colliders)||!Array.isArray(builder.walkables)||typeof builder.library?.material!=='function'||typeof builder.ownMat!=='function')throw Error('Taihe instruments require an untransformed palace host and finite retained y/zf inputs');
 if(builder.colliders.some(c=>c.triangleSupport?.id.startsWith(PREFIX))||parent.getObjectByName(ID))throw Error('Duplicate Taihe instruments owner');
 const {y,zf}=input,z=zf+1,group=new T.Group(),colliders=[],geometries=[];group.name=ID;
 const stone=builder.library.material('marble'),metal=builder.ownMat('bronze',{color:0x4a3b28,metalness:.7,roughness:.45});
 const add=(kind,role,geometry,material=stone)=>{
  geometry.translate(kind==='sundial'?-17:17,y,z);applyBoxUV(geometry,builder.library.tileSize('marble'));
  geometries.push(geometry);const mesh=new T.Mesh(geometry,material),id=PREFIX+kind+':'+role+':'+group.children.length;
  mesh.name=`taihe-${kind}-${role}`;mesh.castShadow=mesh.receiveShadow=true;mesh.userData={instrument:kind,role,collisionId:id,source:PHOTOS[kind],dimensionStatus:'PHOTO_RELATIONSHIP_FIT_NOT_SURVEY'};
  // One closed solid per narrowphase owner avoids parity cancellation where
  // different touching pieces meet. Bounds are broadphase ONLY, never walls.
  const shape=triangleInstance(createTriangleTemplate(geometry),[builder.ox,0,builder.oz],id),box=shape.box.clone();box.triangleSupport=shape;colliders.push(box);group.add(mesh);return mesh;
 };
 const box=(kind,role,w,h,d,x,yy,zz=0)=>add(kind,role,new T.BoxGeometry(w,h,d).translate(x,yy,zz));
 try{
  const k='sundial';
  for(const [w,d,lo,hi] of[[1.6,1.6,0,.16],[1.4,1.4,.16,.32],[1.24,1.24,.32,.5]])box(k,'stepped-base',w,hi-lo,d,0,(lo+hi)/2);
  // Source1609: each broad column and its central gap are approximately
  // equal in frontal width. This ratio is not a surveyed stone section.
  for(const x of[-.33,.33])box(k,'pillar',.34,1.2,.32,x,1.1);
  box(k,'cross-table',1.4,.18,.75,0,1.79);
  const radius=.34,thickness=.06,cy=2.55,tilt=Math.PI/4;
  const bottom=cy-(radius+thickness/2)*Math.SQRT1_2;
  box(k,'upper-bearing',.68,bottom-1.88,.55,0,(bottom+1.88)/2);
  const dial=new T.CylinderGeometry(radius,radius,thickness,32).rotateX(tilt).translate(0,cy,0);add(k,'dial',dial);
  // Through-pin: exact same tilted axis as the visible disc. No invented
  // hour inscription, calendar scales, surveyed azimuth or clock behavior.
  add(k,'gnomon',new T.CylinderGeometry(.009,.009,.6,8).rotateX(tilt).translate(0,cy+.20*Math.SQRT1_2,.20*Math.SQRT1_2),metal);

  const j='jialiang';
  for(const [w,lo,hi] of[[1.6,0,.16],[1.4,.16,.32],[1.2,.32,.45],[1.28,.45,.55]])box(j,'stepped-base',w,hi-lo,w,0,(lo+hi)/2);
  box(j,'waisted-support',.72,.30,.72,0,.70);
  add(j,'flared-cap',new T.CylinderGeometry(1.20/Math.SQRT2,.72/Math.SQRT2,.30,4,1,false,Math.PI/4).translate(0,1,0));
  box(j,'canopy-floor',1.38,.19,1.38,0,1.245);
  for(const x of[-.455,.455])for(const zz of[-.455,.455])box(j,'post',.30,.60,.30,x,1.90,zz);
  // Two photographed apertures establish the visible frame type. The unseen
  // back is a plain compatibility continuation, not surveyed carved panels.
  // Own source is a pierced stone enclosure, NOT an open garden pavilion:
  // substantial sill and head fields surround apertures roughly half the
  // width/height. These coarse source ratios are still not measurements.
  for(const side of[-1,1])for(const [role,lo,hi] of[['sill',1.34,1.60],['lintel',2.20,2.54]]){
   box(j,role,1.21,hi-lo,.30,0,(lo+hi)/2,side*.455);box(j,role,.30,hi-lo,.61,side*.455,(lo+hi)/2);
  }
  add(j,'roof',canopyGeometry());
 }catch(error){geometries.forEach(g=>g.dispose());throw error;}
 group.userData.structure={id:ID,entityId:'FC-A478209231',accepted:false,scope:'SUN_DIAL_AND_VISIBLE_JIALIANG_STONE_COVER_ONLY',
  dimensionStatus:'PHOTO_RELATIONSHIP_FIT_NOT_SURVEY',photographyDate:null,hiddenMeasure:'UNMODELED',fineCarving:'UNMODELED',
  unknown:['exact dimensions','rear carving','stone inscription and dial graduations','current conservation/display date','original precise orientation'],
  footprintPolicy:'RETAINED_CENTERS_AND_1_6M_SQUARE_3M_HIGH_FITTED_NEIGHBOR_ROUTE_ENVELOPE',
  collision:'EXACT_PER_VISIBLE_CLOSED_SOLID_TRIANGLES_NO_FULL_OPENING_BOX_NO_RESCUE',
  instruments:[{kind:'sundial',centerX:-17,centerZ:z,baseY:y,source:PHOTOS.sundial,clearPillarWidth:.32,clearPillarHeight:1.2,pillarWidth:.34,apertureRatioStatus:'COARSE_OWN_PHOTO_RELATIONSHIP_NOT_MEASURED'},
   {kind:'jialiang',centerX:17,centerZ:z,baseY:y,source:PHOTOS.jialiang,clearWindowWidth:.61,clearWindowHeight:.60,apertureRatioStatus:'COARSE_OWN_PHOTO_RELATIONSHIP_NOT_MEASURED',hiddenBack:'PLAIN_COMPATIBILITY_CONTINUATION_UNVERIFIED'}]};
 parent.add(group);builder.colliders.push(...colliders);return group;
}
