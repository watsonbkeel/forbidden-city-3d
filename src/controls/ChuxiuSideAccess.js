/** Two original ordinary side-wall owners, only the front platform turn.
 * No added collider/floor and no changed mathematical resolver. */
export const CHUXIU_SIDE_IDS=Object.freeze(['chuxiu-east-side-turn','chuxiu-west-side-turn']);
export function registerChuxiuSideAccess(kit,zone){
 if(zone.id!=='west-six'||!zone.items?.[25]?.positionFit)return;
 const main=zone.items[23];if(main.name!=='储秀宫'||main.x!==94.8||main.z!==434.3||main.w!==27.1||main.d!==13.8||main.ph!==.6)throw Error('Chuxiu side interface main source mismatch');
 const targets=[{id:CHUXIU_SIDE_IDS[0],x0:80.89999999999999,x1:81.6,lo:79.3,hi:82},{id:CHUXIU_SIDE_IDS[1],x0:108,x1:108.7,lo:107.6,hi:110.3}];
 const rows=targets.map(t=>{const matches=kit.colliders.filter(b=>b.isBox3&&b.min.x===t.x0&&b.max.x===t.x1&&b.min.z===429.3&&b.max.z===441.2&&b.min.y===.6000000000000001&&b.max.y===6.5136);if(matches.length!==1||matches[0].furnitureMotionScope)throw Error('Chuxiu side interface exact owner mismatch');return{...t,b:matches[0]}});
 for(const t of rows)t.b.furnitureMotionScope={kind:'chuxiu-side-access',id:t.id,groundY:0,minOffsetX:t.lo-t.b.min.x,maxOffsetX:t.hi-t.b.min.x,minOffsetZ:427.8-t.b.min.z,maxOffsetZ:430.2-t.b.min.z};
}
