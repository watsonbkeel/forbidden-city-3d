import fs from 'node:fs';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {library} from '../lib/inner-palace-fixture.mjs';
export const zone=JSON.parse(fs.readFileSync(new URL('../../data/zones/outer-west.json',import.meta.url)));
export function fixture(){const lib=library(),kit=new CourtKit(lib,'outer-west');return{lib,kit,dispose(){kit.dispose(kit.root);}};}
export function meshes(frame){const out=[];frame.traverse(m=>{if(m.isMesh)out.push(m);});return out;}
export function state(kit){return JSON.stringify({children:kit.root.children.map(x=>x.uuid),c:kit.colliders,w:kit.walkables,owned:kit.owned.map(x=>x.uuid),rooms:kit.rooms,map:kit.mapItems,regions:kit.regions,plaques:kit.plaques});}

export async function compoundFixture(){
  const {ZoneBase}=await import('../../src/scene/zones/ZoneBase.js');
  const lib=library(),builder=new ZoneBase(lib,zone),kit=builder.kit;
  const gate=zone.items[50],width=builder.buildGate(gate);builder.gateWidths.set(gate.name,width);
  builder.buildCourtWalls(zone.items[51]);builder.buildHall(zone.items[52]);builder.buildHall(zone.items[53]);builder.buildRegion(zone.items[54]);
  return{lib,kit,builder,dispose(){builder.dispose();}};
}
