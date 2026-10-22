import * as THREE from 'three';

const SOURCE = Object.freeze({
  page: 'https://www.dpm.org.cn/explore/building/236436.html',
  image: 'https://img.dpm.org.cn/Uploads/Picture/dc/1459%5B1024%5D.jpg',
  caption: '长春宫东梢间', photographyDate: null, restorationCampaign: null,
  rearScreenTotalPanelCount: null, visibleCentralFieldCount: 6,
  panelCountStatus: 'SIX_CLEAR_CENTRAL_FIELDS_AND_OCCLUDED_OUTER_STRIPS_DO_NOT_ESTABLISH_TOTAL',
});

// Fitted inside the retained north kang envelope; none of these are measurements.
export const CHANGCHUN_EAST_FIT = Object.freeze({
  centerX: -10.84, centerZ: 4.6, width: 3.7, depth: 2.7,
  postWidth: .13, top: 4.55, frontZ: 3.25, rearZ: 5.95,
  railHeights: Object.freeze([3.16, 3.72, 4.36, 4.49]),
  registerHeights: Object.freeze([3.43, 4.04]), registerHeight: .42,
  curtainTop: 3.10, curtainTie: 1.90, curtainBottom: .10,
  rearFieldZ: 5.83, rearFieldBottom: .50, rearFieldTop: 3.14, centralFieldWidth: 2.88,
});

export const CHANGCHUN_EAST_MATERIAL_FIT = Object.freeze({
  timber: Object.freeze({ color: 0x392c28, roughness: .84, metalness: 0 }),
  cloth: Object.freeze({ color: 0xb4b09b, roughness: .92, metalness: 0, side: THREE.DoubleSide }),
  trim: Object.freeze({ color: 0x6d8589, roughness: .90, metalness: 0, side: THREE.DoubleSide }),
  recess: Object.freeze({ color: 0xb6aa88, roughness: .92, metalness: 0 }),
});

/** Replace only the former east generic cover. The existing kang is untouched. */
export function buildChangchunEastAlcove(kit, item, f) {
  const p=CHANGCHUN_EAST_FIT;
  if (item.name!=='长春宫'||item.structure!=='west-domestic-hall'||item.domesticProfile!=='changchun-domestic'||
      item.x!==150.2||item.z!==379.6||item.w!==27.1||item.d!==13.8||item.ph!==.6||item.bays!==5||
      item.rot!==undefined||Math.abs(-2*item.w/5-p.centerX)>1e-9) {
    throw Error('Changchun east alcove requires the retained east end-bay and north kang');
  }
  const metadata={
    role:'changchun-east-kang-layers',stage:'PARTIAL_SOURCE_BOUNDED_BASE_MATERIALS_NOT_FINISHED_RESTORATION',
    whiteModelCheckpoint:'ce4829ac9c47bd10f7bd4c0e135cfc5a796c3f10',
    materialStatus:'REVERSIBLE_DISPLAY_PALETTE_NOT_COLORIMETRIC_OR_MATERIAL_SURVEY',
    materialFit:CHANGCHUN_EAST_MATERIAL_FIT,
    dimensionStatus:'REVERSIBLE_MODEL_FIT_NOT_SURVEYED',source:SOURCE,fit:p,currentInventoryVerified:false,
    sourceSupported:['high horizontal frame registers','drawn side curtains with contrasting edging','six clearly visible central vertical fields behind the kang; total leaf count unknown'],
    fitted:['frame height and depth','plain rectangular register fields without exact carving','curtain curves and fold spacing','six central plain frame divisions; outer field extent and total count unknown'],
    withheld:['rear screen total panel count','paintings and calligraphy','lanterns and hanging ornaments','carving and textile motifs','unseen construction','dated Cixi-era or current-inventory assertion'],
  };
  const group=new THREE.Group();group.name=metadata.role;
  group.userData={...metadata,structure:{id:'west-six/changchun-east-kang-layers',...metadata}};f.add(group);
  const materials=Object.fromEntries(Object.entries(CHANGCHUN_EAST_MATERIAL_FIT).map(([key,props])=>{
    const m=new THREE.MeshStandardMaterial({name:`r54_changchun_east_${key}`,...props});kit.owned.push(m);return[key,m];
  }));
  const colliderStart=kit.colliders.length;
  const mark=(m,role,solid,extra={})=>{m.name=role;m.userData={role,solid,dimensionStatus:metadata.dimensionStatus,...extra};return m;};
  function box(role,w,h,d,x,y,z,material=materials.timber,solid=true) {
    const m=mark(kit.mesh(group,new THREE.BoxGeometry(w,h,d),material,p.centerX+x,item.ph+y,z),role,solid);
    if(solid)kit.col(f,p.centerX+x-w/2,item.ph+y-h/2,z-d/2,p.centerX+x+w/2,item.ph+y+h/2,z+d/2);
    return m;
  }
  for(const x of [-p.width/2,p.width/2])for(const z of [p.frontZ,p.rearZ])
    box('changchun-east-frame-post',p.postWidth,p.top,p.postWidth,x,p.top/2,z);
  for(const y of p.railHeights)box('changchun-east-transom-rail',p.width,.12,.16,0,y,p.frontZ);
  // Minimal depth ties are fits, not claims about hidden joinery.
  box('changchun-east-rear-head',p.width,.12,.16,0,p.top-.06,p.rearZ);
  for(const x of [-p.width/2,p.width/2])box('changchun-east-depth-tie',.13,.12,p.depth,x,p.top-.06,p.centerZ);
  for(const y of p.registerHeights) {
    const innerWidth=p.width-2*p.postWidth,cell=innerWidth/3;
    for(let k=0;k<3;k++)box('changchun-east-upper-register-field',cell-.10,p.registerHeight,.05,(k-1)*cell,y,p.frontZ+.065,y===p.registerHeights[0]?materials.cloth:materials.timber);
    for(const x of [-cell/2,cell/2])box('changchun-east-upper-register-stile',.10,p.registerHeight+.10,.13,x,y,p.frontZ);
  }
  box('changchun-east-cloth-valance',p.width-.13,.22,.055,0,p.curtainTop+.025,p.frontZ+.015,materials.cloth,false);
  box('changchun-east-valance-edging',p.width-.13,.055,.065,0,p.curtainTop-.085,p.frontZ+.005,materials.trim,false);

  function fabric(role,sign,part,edge=false) {
    const cols=24,rows=edge?1:6,positions=[],indices=[];
    for(let i=0;i<=cols;i++)for(let j=0;j<=rows;j++) {
      const u=i/cols,v=j/rows;let x,y,z;
      if(part==='sweep') {
        x=.18+1.46*u;
        const lower=p.curtainTop-.035-1.165*Math.pow(u,.70);
        y=edge?lower+.055*v:THREE.MathUtils.lerp(p.curtainTop,lower,v);
        z=p.frontZ+.045+.038*Math.sin(u*10*Math.PI)*Math.sin(v*Math.PI);
      } else {
        y=THREE.MathUtils.lerp(p.curtainBottom,p.curtainTie,u);
        const width=THREE.MathUtils.lerp(.48,.15,u),center=THREE.MathUtils.lerp(1.56,1.565,u);
        x=edge?center-width/2+.045*v:center+(v-.5)*width;
        z=p.frontZ+.045+.035*Math.cos(v*8*Math.PI)*(.5+.5*(1-u));
      }
      positions.push(sign*x,y,z-(edge?.012:0));
    }
    for(let i=0;i<cols;i++)for(let j=0;j<rows;j++) {
      const a=i*(rows+1)+j,b=a+rows+1;indices.push(a,b,a+1,b,b+1,a+1);
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();
    return mark(kit.mesh(group,geo,edge?materials.trim:materials.cloth,p.centerX,item.ph,0),role,false,{curtainSide:sign<0?'east':'west',shape:part,foldStatus:'COARSE_FIT_NOT_HISTORIC_TEXTILE_RECONSTRUCTION'});
  }
  for(const sign of [-1,1])for(const part of ['sweep','tail']) {
    fabric('changchun-east-gathered-curtain',sign,part);
    fabric('changchun-east-curtain-edging',sign,part,true);
  }
  // Blank backing plus six visible central divisions only. The partly occluded
  // outer strips do not establish the full screen count or its hidden extent.
  const rearHeight=p.rearFieldTop-p.rearFieldBottom;
  box('changchun-east-recessed-screen-field',p.width-.32,rearHeight,.075,0,(p.rearFieldTop+p.rearFieldBottom)/2,p.rearFieldZ,materials.recess);
  for(const x of [-p.width/2+.12,p.width/2-.12])box('changchun-east-rear-field-edge',.11,rearHeight+.06,.10,x,(p.rearFieldTop+p.rearFieldBottom)/2,p.rearFieldZ-.025);
  for(const y of [p.rearFieldBottom+.06,p.rearFieldTop-.035])box('changchun-east-rear-field-rail',p.width-.13,.12,.10,0,y,p.rearFieldZ-.025);
  // Seven thin stiles outline only the six clearly visible central fields.
  // These are decorative strips on the existing solid backing, not new walls;
  // the retained body collision and support geometry are unchanged by them.
  for(let k=0;k<=6;k++) {
    const divider=box('changchun-east-visible-central-divider',.055,rearHeight-.12,.035,
      (k/6-.5)*p.centralFieldWidth,(p.rearFieldTop+p.rearFieldBottom)/2,p.rearFieldZ-.055,materials.timber,false);
    Object.assign(divider.userData,{visibleCentralFieldCount:6,totalScreenLeafCount:null,divisionIndex:k,detailStatus:'PLAIN_VISIBLE_DIVISION_NOT_PAINTING_OR_CALLIGRAPHY'});
  }
  group.userData.colliderRange={start:colliderStart,end:kit.colliders.length};
  return group;
}
