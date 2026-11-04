import{Teleport}from'../r164-qingshou-raised-walk/fixture.mjs';import{zone}from'./fixture.mjs';
export function landing(kit,cm){const t=Object.create(Teleport.prototype);t.targets=new Map([['履顺门',zone.items[4]]]);t.zoneManager={getMapItems:()=>kit.mapItems,getLoadedIds:()=>['ningshou']};t.collisionManager=cm;return t.resolveLanding('履顺门')}
