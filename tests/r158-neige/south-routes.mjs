import fs from 'node:fs';import {sideGateGeometry} from '../../src/scene/palace/special/SideGateProfiles.js';import {southCourtGateGeometry} from '../../src/scene/palace/special/SouthCourtGates.js';import {LAYOUT} from '../../src/config/constants.js';
// Exact bounded extraction of stepwalk.cjs gateTransit/courtWalk/SIDE_ROUTES,
// avoiding unrelated old helper fixture failures. No route change for Neige.
export function southernRoutes(){const A=JSON.parse(fs.readFileSync(new URL('../../data/anchors.json',import.meta.url))),east=JSON.parse(fs.readFileSync(new URL('../../data/zones/outer-east.json',import.meta.url))),axis=JSON.parse(fs.readFileSync(new URL('../../data/zones/axis-courts.json',import.meta.url)));
 const xh=A['协和门'],dh=A['东华门'],wh=A['文华门'],sg=sideGateGeometry(axis.items.find(i=>i.name==='协和门')),front=sg.ramps.find(r=>r.side==='front'),rear=sg.ramps.find(r=>r.side==='rear'),transit=[rear.zToe+2,rear.zToe,rear.zTop,front.zTop,front.zToe,front.zToe-2].map(z=>sg.toWorld(0,z));
 const h=east.items.find(i=>i.southCourtProfile==='wenhua-front'),gate=east.items.find(i=>i.southGateProfile==='wenhua'),g=southCourtGateGeometry(gate),x=h.x,frontTurnZ=h.z-6;
 const walk=[[gate.x,g.southToe-2],[gate.x,g.northToe+2],[x,g.northToe+2],[x,h.z-h.d/2-h.pad-h.ph*1.6-1],[x,frontTurnZ],[x+11,frontTurnZ],[x+11,h.z+5.7],[x,h.z+5.7]],entry=[[-30,-298],[-30,-324],[transit[0][0],-324],...transit];
 return[{name:'协和门→文华门→文华殿内',pts:[...entry,[wh.x,xh.z],...walk]},{name:'协和门→东华门→出宫',pts:[...entry,[-308,xh.z],[-308,dh.z],[-332,dh.z],[dh.x+25,dh.z],[LAYOUT.BOUNDARY.minX+10,dh.z]]}];}
