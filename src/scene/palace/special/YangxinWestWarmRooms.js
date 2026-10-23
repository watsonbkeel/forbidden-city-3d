import * as THREE from 'three';

const deepFreeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(deepFreeze); Object.freeze(value); }
  return value;
};
const PAPER = 'https://img.dpm.org.cn/Uploads/File/2023/07/19/u64b75fda11a18.pdf';
const FIT = 'REVERSIBLE_MODEL_FIT_NOT_SURVEYED';
const STAGE = 'SOURCE_BASED_BASIC_FORMS_PARTIAL_NOT_FULL_RESTORATION';
const sx = 11.18 / 10.15, sz = 5.4 / 5.15;
const east = 6.32, west = 17.5, south = -5.55, north = -.15;
const passageWest = east + 2.14 * sx;
// The publication's three clear widths sum to 9.30 m, not its 10.15 m bay.
// Splitting that unexplained 0.85 m into two model separator strips is an
// EXPLICIT compatibility fit, not a finding about historic wall thickness.
const separator = .85 * sx / 2;
const qEast = passageWest + separator, qWest = qEast + 5.04 * sx;
const sEast = qWest + separator, sNorth = south + 6 * sz;
const qDoor = -1.1, southDivider = 2 * qDoor - sNorth;

/** Paper-local origin: southeast of west warm bay; +u west, +v north.
 * These source measurements are kept separately from the retained 12 m bay.
 * The source-to-model transform is reversible and deliberately NOT a survey.
 * No part of the northern Buddha hall or Meiwu is modeled here. */
export const YANGXIN_WEST_ROOM_PLAN = deepFreeze({
  id: 'yangxin-west-warm-rooms-r53-basic-forms',
  catalogId: 'place-west-six-17d883bce6', stage: STAGE, dimensionStatus: FIT,
  layoutCheckpoint: '03dcb64842974642e3fe46bd5ebfba89dc68e9b7',
  coordinates: { positiveX: 'west', positiveZ: 'north', origin: 'retained Yangxin front-hall center' },
  sources: {
    paper: { url: PAPER, publication: '2023-07', printedPages: [123, 125, 127, 129], state: 'DOCUMENTED_2023_CONDITION_AND_HISTORICAL_ANALYSIS', author: '张杰', title: '养心殿西暖阁匾联、贴落现状及相关清代档案分析（上）' },
    photos: { page: 'https://www.dpm.org.cn/explore/building/236442.html', qinzheng: 'https://img.dpm.org.cn/Uploads/image/2026/04/30/2-stivNCrFc313.jpg', sanxi: 'https://img.dpm.org.cn/Uploads/image/2026/04/30/1-cPnefIMuK313.jpg', urlDate: '2026-04-30', captureDate: null, state: 'MUSEUM_DISPLAY_PHOTOGRAPH_NOT_DATED_HISTORIC_INVENTORY' },
    plaque: { printedPage: 127, currentObject: '1960s restoration using collected Yongzheng calligraphy', representation: 'BLANK_BOARD_BASIC_FRAME_NO_CALLIGRAPHY_REPLICA' },
  },
  sourceDimensions: { units: 'metres as stated in publication', westBay: [10.15, 11.56], rooms: { eastPassage: [2.14, 5.15], qinzhengqinxian: [5.04, 5.15], sanxitang: [2.12, 6] }, sanxiNorthProjection: .77, kanFrameSeparation: 2, unallocatedWidthDifference: .85, legacyEightSquareMetreClaimUsed: false },
  transform: {
    formula: 'model.x = 6.32 + u * scaleX; model.z = -5.55 + v * scaleZ',
    origin: [east, south], scaleX: sx, scaleZ: sz,
    reason: 'Fit the retained GLB floor and west bay without changing its x=6 partition or doorway. Southern depth is enlarged to retain a full 0.5m-radius visitor route through that legacy opening.',
    residuals: [
      { id: 'bay-width', source: 10.15, model: 11.18, delta: 1.03 },
      { id: 'southern-depth', source: 5.15, model: 5.4, delta: .25 },
      { id: 'unallocated-width', sourceDifference: .85, fittedSeparatorWidthEach: separator, status: 'UNKNOWN_ORIGIN_ALLOCATED_FOR_MODEL_ONLY_NOT_MEASURED_WALL_THICKNESS' },
      { id: 'sanxi-length-vs-projection', sourceLengthDifference: 6 - 5.15, sourceProjection: .77, sourceResidual: .08, modelResidual: .08 * sz, status: 'DIFFERENT_SOURCE_MEASUREMENT_EXTENTS_NOT_SILENTLY_RECONCILED' },
      { id: 'unbuilt-north-envelope', transformedSourceNorth: south + 11.56 * sz, retainedShellNorth: 6, delta: south + 11.56 * sz - 6, status: 'OUT_OF_SCOPE_NO_GEOMETRY_CREATED' },
      { id: 'front-plane', fittedRoomSouth: south, retainedFacade: -6.3, delta: .75, status: 'RETAINED_WINDOW_CLEARANCE_NOT_SURVEYED_ROOM_EDGE' },
      { id: 'old-east-door', retainedDoorX: 6, retainedClearZ: [-1.44, 1.44], usedRouteZ: -.84, status: 'LEGACY_COMPATIBILITY_DOOR_POSE_NOT_ATTESTED_HISTORIC_POSITION' },
    ],
  },
  bounds: { east, west, south, north, passageWest, qEast, qWest, sEast, sNorth, southDivider, separator },
  doorways: [
    { id: 'central-to-passage', axis: 'x', at: 6, center: 0, width: 2.88, routeCenter: -.84, status: 'RETAINED_GLB_OPENING_NO_DUPLICATE_WALL' },
    { id: 'passage-to-qinzheng', axis: 'x', at: (passageWest + qEast) / 2, center: -4.5, width: 1.7, source: 'p125 east wall south opening', status: FIT },
    { id: 'qinzheng-to-sanxi', axis: 'x', at: (qWest + sEast) / 2, center: qDoor, width: 1.6, source: 'p125 west wall north opening', status: FIT },
    { id: 'sanxi-north-to-south', axis: 'z', at: southDivider, center: 16.3, width: 1.35, source: 'p127 southern partition, p129 open frame visual', status: FIT },
  ],
  route: [[6,-.84],[7.5,-.84],[7.5,-4.5],[10.2,-4.5],[14,-3.2],[14,qDoor],[16.3,qDoor],[16.3,-3.5]],
  rearPolicy: 'UNBUILT_NO_DEFAULT_FURNITURE',
  limitations: [
    'This is a source-based basic-form/material partial, not a finished current-state or historical restoration.',
    'Door widths, separator thickness, wall heights, furniture dimensions and transforms are reversible compatibility fits.',
    'The 2023 plan, 2023 digital reconstructions and undated museum display photos are separate evidence layers.',
    'Basic wood, plaster, cloth and photo-visible kang/seat/table forms only; no brocade/relief pattern, calligraphy, porcelain, unseen storage or generic rear furniture is invented.',
    'The northern rear doorway outlines are source topology only and are not registered as completed visitor routes.',
  ],
});

function assertIdentity(kit, item, f) {
  if (item.name !== '养心殿' || item.x !== 108.6 || item.z !== 277.5 || item.w !== 36 || item.d !== 12 || item.ph !== .6 || item.colH !== 7.68 || ![undefined, 0, 'south'].includes(item.rot)) throw Error('R53 Yangxin identity/envelope mismatch');
  if (!f || f.parent !== kit.root || f.position.x !== item.x || f.position.z !== item.z || f.rotation.y !== 0) throw Error('R53 Yangxin registered frame identity mismatch');
  if (f.userData.yangxinWestWarmRooms) throw Error('R53 Yangxin west rooms already built');
}

/** Permanent B-shell augmentation. InteriorLoader neither owns nor removes it;
 * unchanged S GLB layers in/out around it. No assets, floor or roof are replaced. */
export function buildYangxinWestWarmRooms(kit, item, f) {
  assertIdentity(kit, item, f);
  const plan = YANGXIN_WEST_ROOM_PLAN;
  const g = new THREE.Group(); g.name = 'r53-yangxin-west-warm-rooms';
  g.userData = { role: g.name, stage: STAGE, dimensionStatus: FIT, source: PAPER, rearPolicy: plan.rearPolicy };
  f.add(g); f.updateWorldMatrix(true, true);
  const mat = (name, color, roughness=.9) => { const m = new THREE.MeshStandardMaterial({ name: `r53-yangxin-${name}`, color, roughness }); kit.owned.push(m); return m; };
  const plaster=mat('plaster-basic',0xe9e1d3),frame=mat('wood-frame-basic',0x573422,.65),wood=mat('kang-wood-basic',0x845439,.65),warmWood=mat('kang-panel-basic',0x794630,.65),darkWood=mat('dark-table-wood-basic',0x32241e,.6),cream=mat('cream-seat-plain',0xd7c6b9),yellowCloth=mat('yellow-seat-plain',0xd4a631),redCloth=mat('red-kang-cover-plain',0x991e19),blueCloth=mat('blue-kang-cover-plain',0x8398aa),paper=mat('blank-hanging-board',0xb99c68);
  const floor = item.ph + .02, H = 3.5, doorH = 2.5;
  const box = (role, m, x0, x1, y0, y1, z0, z1, extra = {}, parent = g) => {
    if (!(x1 > x0 && y1 > y0 && z1 > z0)) throw Error(`R53 nonpositive volume: ${role}`);
    const mesh = kit.mesh(parent, new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), m, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    mesh.name = role; mesh.userData = { role, solid: true, stage: STAGE, dimensionStatus: FIT, ...extra };
    kit.col(f, x0, y0, z0, x1, y1, z1);
    if (extra.loadBearingTop) {
      kit.walkBox(f,x0,z0,x1,z1,y1);
      Object.assign(kit.walkables.at(-1),{rescue:false,sourceRole:role});
    }
    return mesh;
  };
  const group = role => { const q = new THREE.Group(); q.name = role; q.userData = { role, stage: STAGE }; g.add(q); return q; };
  const alongXDoor = (role, x0, x1, z0, z1, center, width, parent = g) => {
    const a = center - width / 2, b = center + width / 2;
    box(`${role}-south-panel`, plaster, x0,x1,floor,floor+H,z0,a,{},parent);
    box(`${role}-north-panel`, plaster, x0,x1,floor,floor+H,b,z1,{},parent);
    box(`${role}-head`, frame, x0,x1,floor+doorH,floor+H,a,b,{doorway:role},parent);
  };
  const alongZDoor = (role, z, x0, x1, center, width, height = H, parent = g) => {
    const a = center - width / 2, b = center + width / 2;
    box(`${role}-east-jamb`, frame, x0,a,floor,floor+height,z-.07,z+.07,{},parent);
    box(`${role}-west-jamb`, frame, b,x1,floor,floor+height,z-.07,z+.07,{},parent);
    box(`${role}-head`, frame, a,b,floor+doorH,floor+height,z-.07,z+.07,{doorway:role},parent);
  };
  alongXDoor('r53-passage-qinzheng-partition',passageWest,qEast,south,north,-4.5,1.7);
  alongXDoor('r53-qinzheng-sanxi-partition',qWest,sEast,south,north,qDoor,1.6);
  // Rear apertures are not claims that the unknown northern rooms are complete.
  alongZDoor('r53-passage-north-unfinished-aperture',north,east,passageWest,7.05,1.18);
  box('r53-qinzheng-north-wall',plaster,qEast,qWest,floor,floor+H,north-.09,north+.09);
  box('r53-sanxi-north-wall',plaster,sEast,west,floor,floor+H,sNorth-.09,sNorth+.09);
  const divider = group('r53-sanxi-south-room-partition');
  alongZDoor('r53-sanxi-south-room-opening',southDivider,sEast,west,16.3,1.35,H,divider);
  for (const sign of [-1,1]) {
    const z = qDoor + sign * sz, q = group('r53-sanxi-kan-frame');
    q.userData.sourceSeparationMetres = 2; q.userData.sourcePage = 127;
    alongZDoor('r53-sanxi-kan-outline',z,sEast,west,16.3,1.85,2.8,q);
  }
  // Photo-visible furniture forms only. These are fitted silhouettes and plain
  // materials, not replicas of brocade, relief carving, porcelain or calligraphy.
  const solidShape = (role, geo, material, x,y,z, extra={}) => {
    const m=kit.mesh(g,geo,material,x,y,z);m.name=role;
    m.userData={role,solid:true,stage:STAGE,dimensionStatus:FIT,...extra};
    geo.computeBoundingBox();const b=geo.boundingBox.clone().translate(new THREE.Vector3(x,y,z));
    kit.col(f,b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z);return m;
  };
  const shapedBack=(role,x0,x1,y0,y1,z0,z1,material,alongX=false)=>{
    const w=alongX?z1-z0:x1-x0,h=y1-y0,d=alongX?x1-x0:z1-z0;
    const s=new THREE.Shape();s.moveTo(0,0);s.lineTo(w,0);s.lineTo(w,h*.68);
    s.quadraticCurveTo(w,h*.82,w*.86,h*.82);s.lineTo(w*.82,h*.82);
    s.quadraticCurveTo(w*.8,h,w*.64,h);s.lineTo(w*.36,h);
    s.quadraticCurveTo(w*.2,h,w*.18,h*.82);s.lineTo(w*.14,h*.82);
    s.quadraticCurveTo(0,h*.82,0,h*.68);s.closePath();
    const geo=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false,curveSegments:6});
    if(alongX)geo.rotateY(Math.PI/2);
    return solidShape(role,geo,material,x0,y0,alongX?z1:z0,{representation:'PHOTO_CONTOUR_SIMPLIFICATION_NOT_CARVING_REPLICA'});
  };
  const bolster=(role,material,x,y,z,sx,sy,sz)=>{const geo=new THREE.SphereGeometry(1,16,12);geo.scale(sx,sy,sz);solidShape(role,geo,material,x,y,z,{representation:'PLAIN_FABRIC_NO_INVENTED_BROCADE_PATTERN'});};
  const table=(role,x0,x1,z0,z1,bottom,top,sidePanel=false)=>{
    const q=group(role),leg=.065,t=.065,apron=.10,id=role==='r53-qinzheng-low-side-table'?(x0<11?'east':'west'):'center';q.name=`${role}-${id}`;
    q.userData={...q.userData,photo:sidePanel?plan.sources.photos.sanxi:plan.sources.photos.qinzheng,representation:'PHOTO_VISIBLE_BASIC_TOP_LEGS_AND_FRAME_NO_CARVING'};
    box(`${role}-${id}-top`,darkWood,x0,x1,top-t,top,z0,z1,{loadBearingTop:true},q);
    for(const x of[x0,x1-leg])for(const z of[z0,z1-leg])box('r53-fitted-table-leg',darkWood,x,x+leg,bottom,top-t,z,z+leg,{},q);
    for(const z of[z0,z1-.04])box('r53-fitted-table-apron',darkWood,x0,x1,top-t-apron,top-t,z,z+.04,{},q);
    if(sidePanel)box('r53-sanxi-desk-plain-side-panel',wood,x1-.05,x1,bottom+.08,top-t-.06,z0+.08,z1-.08,{representation:'VISIBLE_SIDE_PANEL_WITHOUT_UNVERIFIED_RELIEF'},q);
  };
  const framedZ=(role,x0,x1,y0,y1,z,fill=paper)=>{
    box(role,fill,x0,x1,y0,y1,z,z+.035,{replica:false});
    const t=.045;for(const x of[x0,x1-t])box('r53-blank-board-border',frame,x,x+t,y0,y1,z-.015,z);
    for(const y of[y0,y1-t])box('r53-blank-board-border',frame,x0+t,x1-t,y,y+t,z-.015,z);
  };
  const framedX=(role,x,y0,y1,z0,z1)=>{
    box(role,paper,x,x+.035,y0,y1,z0,z1,{replica:false});
    const t=.04;for(const z of[z0,z1-t])box('r53-blank-board-border',frame,x+.035,x+.05,y0,y1,z,z+t);
    for(const y of[y0,y1-t])box('r53-blank-board-border',frame,x+.035,x+.05,y,y+t,z0+t,z1-t);
  };
  box('r53-qinzheng-north-kang',wood,9.95,13.25,floor,floor+.65,-2.05,north-.10,{loadBearingTop:true,photo:plan.sources.photos.qinzheng,relationship:'NORTH_WALL_KANG_ONLY_PHOTO_VISIBLE_FORM'});
  for(let i=0;i<3;i++){
    const x=10.04+i*1.07;
    box('r53-qinzheng-kang-panel',warmWood,x,x+.97,floor+.09,floor+.55,-2.062,-2.05,{representation:'THREE_VISIBLE_PLAIN_RECESSED_PANELS_NO_MEDALLION_REPLICA'});
    for(const xx of[x,x+.94])box('r53-kang-panel-border',wood,xx,xx+.03,floor+.09,floor+.55,-2.072,-2.062);
    for(const yy of[floor+.09,floor+.52])box('r53-kang-panel-border',wood,x+.03,x+.94,yy,yy+.03,-2.072,-2.062);
  }
  box('r53-qinzheng-dark-kang-edging',darkWood,9.95,13.25,floor+.61,floor+.65,-2.05,-1.98);
  box('r53-qinzheng-red-kang-cover',redCloth,9.99,13.21,floor+.65,floor+.67,-2.01,north-.14,{loadBearingTop:true});
  box('r53-qinzheng-kang-seat',cream,10.7,12.5,floor+.67,floor+.81,-1.85,-.48,{loadBearingTop:true});
  shapedBack('r53-qinzheng-kang-seat-back',10.85,12.35,floor+.81,floor+1.57,-.58,-.4,cream);
  for(const x of[10.92,12.28])bolster('r53-qinzheng-round-bolster',cream,x,floor+.97,-1.55,.20,.16,.24);
  table('r53-qinzheng-low-side-table',10.05,10.58,-1.80,-.50,floor+.67,floor+1.30);
  table('r53-qinzheng-low-side-table',12.62,13.15,-1.80,-.50,floor+.67,floor+1.30);
  framedZ('r53-qinzheng-blank-plaque',10.25,12.95,floor+2.55,floor+3.20,north-.14);
  framedZ('r53-qinzheng-blank-central-hanging',10.40,12.80,floor+1.32,floor+2.38,north-.14);
  framedZ('r53-qinzheng-blank-side-hanging',9.48,9.78,floor+.85,floor+2.68,north-.14);
  framedZ('r53-qinzheng-blank-side-hanging',13.42,13.72,floor+.85,floor+2.68,north-.14);

  box('r53-sanxi-south-window-kang',warmWood,sEast+.08,west-.08,floor,floor+.60,-5.52,-4.05,{loadBearingTop:true,photo:plan.sources.photos.sanxi,relationship:'SOUTH_WINDOW_KANG_WITH_WEST_FACING_SEAT'});
  box('r53-sanxi-blue-kang-cover',blueCloth,sEast+.08,west-.08,floor+.60,floor+.62,-5.52,-4.05,{loadBearingTop:true});
  box('r53-sanxi-west-facing-seat',yellowCloth,sEast+.12,sEast+.82,floor+.62,floor+.75,-5.40,-4.30,{facing:'+X west',loadBearingTop:true});
  shapedBack('r53-sanxi-east-side-seat-back',sEast+.12,sEast+.27,floor+.75,floor+1.57,-5.35,-4.35,yellowCloth,true);
  for(const z of[-5.18,-4.52])bolster('r53-sanxi-round-bolster',yellowCloth,sEast+.49,floor+.91,z,.22,.16,.14);
  table('r53-sanxi-low-reading-desk',16.45,16.78,-5.30,-4.22,floor+.62,floor+1.25,true);
  framedX('r53-sanxi-blank-east-wall-board',sEast+.02,floor+2.10,floor+2.60,-5.10,-4.40);
  framedX('r53-sanxi-blank-side-hanging',sEast+.02,floor+1.0,floor+2.45,-5.48,-5.28);
  framedX('r53-sanxi-blank-side-hanging',sEast+.02,floor+1.0,floor+2.45,-4.22,-4.02);
  // Plain interior window casing is a photo-based type. Its depth bridges the
  // retained façade offset; original R48 glazing/grid is retained, not replaced.
  const win=group('r53-sanxi-interior-window-casing');win.userData.fitReason='COMPATIBILITY_REVEAL_TO_RETAINED_FACADE_NOT_SURVEYED_WINDOW_DEPTH';
  for(const [a,b]of[[sEast,sEast+.08],[west-.08,west]])box('r53-sanxi-window-reveal-jamb',plaster,a,b,floor,floor+3.5,-6.14,-5.55,{},win);
  box('r53-sanxi-window-reveal-head',plaster,sEast+.08,west-.08,floor+3.15,floor+3.5,-6.14,-5.55,{},win);
  box('r53-sanxi-window-sill',plaster,sEast+.08,west-.08,floor+.62,floor+.70,-6.14,-5.54,{loadBearingTop:true},win);


  const door = id => { const d=plan.doorways.find(d=>d.id===id); return d.axis==='x'?{x:d.at,z:d.routeCenter??d.center}:{x:d.center,z:d.at}; };
  const rooms = [
    {key:'east-passage',name:'养心殿·西暖阁东夹道',x0:east,x1:passageWest,z0:south,z1:north,doors:[door('central-to-passage'),door('passage-to-qinzheng')],spawn:{x:7.5,z:-3}},
    {key:'qinzhengqinxian',name:'养心殿·勤政亲贤室',x0:qEast,x1:qWest,z0:south,z1:north,doors:[door('passage-to-qinzheng'),door('qinzheng-to-sanxi')],spawn:{x:11.4,z:-3.8}},
    {key:'sanxitang-north',name:'养心殿·三希堂北部',x0:sEast,x1:west,z0:southDivider,z1:sNorth,doors:[door('qinzheng-to-sanxi'),door('sanxi-north-to-south')],spawn:{x:16.3,z:-1.1}},
    {key:'sanxitang-south',name:'养心殿·三希堂南小室',x0:sEast,x1:west,z0:south,z1:southDivider,doors:[door('sanxi-north-to-south')],spawn:{x:16.3,z:-3.5}},
  ];
  for (const r of rooms) {
    kit._lastFurnish = { cover: [], spawns: [r.spawn] };
    kit.registerRoom(f,{...r,kind:'r53-yangxin-source-room',y:item.ph,h:H});
    Object.assign(kit.rooms.at(-1),{sourceKey:r.key,stage:STAGE,dimensionStatus:FIT,spawnsStatus:'CLEAR_NAVIGATION_CANDIDATES_NOT_NEW_CHARACTERS'});
  }
  const metadata = { id: plan.id, stage: STAGE, dimensionStatus: FIT, source: PAPER, printedPages: plan.sources.paper.printedPages, rearPolicy: plan.rearPolicy, transform: plan.transform, sourceDimensions: plan.sourceDimensions, layoutCheckpoint:plan.layoutCheckpoint, materialStatus:'PLAIN_COLORS_NO_INVENTED_BROCADE_OR_CARVING', photoDates: { path: plan.sources.photos.urlDate, capture: null }, sources:plan.sources, limitations:plan.limitations, navigationRooms:rooms.map(r=>r.key), streamingOwnership:'PERMANENT_ZONE_B_SHELL_NOT_OPTIONAL_INTERIOR_GLB' };
  f.userData.yangxinWestWarmRooms = metadata;
  return metadata;
}
