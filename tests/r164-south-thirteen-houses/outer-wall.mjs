import*as T from'three';import{Enclosure}from'../../src/scene/Enclosure.js';
/** Exact production east wall segment builder/spec/center, cropped longitudinally
 * to the tested band. No full Enclosure or World build. */
export function outerWall(library){const borrowed=new Set(),lib=library.owns?library:{...library,material(...a){const m=library.material(...a);borrowed.add(m);return m},owns:m=>borrowed.has(m)},e=new Enclosure(new T.Scene(),lib),{wallH:h,wallT:t}=e.wallSpec(),{x}=e.wallLines();e.addWallSegmentZ(e.group,{z1:140,z2:340,x:-x,h,t,brickH:1.5,outwardSide:-1},library.material('wall_red'),library.material('wall_brick'));return e}
