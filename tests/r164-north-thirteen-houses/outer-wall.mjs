import*as T from'three';import{Enclosure}from'../../src/scene/Enclosure.js';
/** Exact production east wall segment builder/spec/center, cropped longitudinally
 * to the tested band. Includes the exact existing four corner support/tower builder, not full World. */
export function outerWallAndCorner(library){const borrowed=new Set(),lib=library.owns?library:{...library,material(...a){const m=library.material(...a);borrowed.add(m);return m},owns:m=>borrowed.has(m)},e=new Enclosure(new T.Scene(),lib),{wallH:h,wallT:t}=e.wallSpec(),{x,zN}=e.wallLines();e.addWallSegmentZ(e.group,{z1:330,z2:zN,x:-x,h,t,brickH:1.5,outwardSide:-1},library.material('wall_red'),library.material('wall_brick'));e.buildCornerTowers(e.group);return e}
