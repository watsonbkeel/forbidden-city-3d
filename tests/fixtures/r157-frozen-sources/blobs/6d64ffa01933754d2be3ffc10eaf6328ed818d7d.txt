/** R126 finite dispatch only. No body, step or solver changes. */
export const CHENGQIAN_ARRIVAL_IDS=Object.freeze(['chengqian-gate-arrival','chengqian-screen-bypass','chengqian-rear-arrival']);
export function bindChengqianArrival(owner,id,margin=.7){
 const expected={'chengqian-gate-arrival':['chengqian-gate-slab',Math.fround(.1)],'chengqian-screen-bypass':['chengqian-north-screen-stone',Math.fround(.22)],'chengqian-rear-arrival':['chengqian-rear-cap',Math.fround(.46)]}[id];
 if(!expected||owner.chengqianArrivalSource?.id!==expected[0]||owner.max.y!==expected[1]||!Number.isFinite(margin)||margin<0||margin>1)throw Error('Actual Chengqian arrival owner identity required');
 owner.furnitureMotionScope={kind:'chengqian-arrival',id,groundY:0,minOffsetX:-margin,maxOffsetX:owner.max.x-owner.min.x+margin,minOffsetZ:-margin,maxOffsetZ:owner.max.z-owner.min.z+margin};
}
