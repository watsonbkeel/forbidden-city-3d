/** R125 only: two rendered low-platform owners dispatch the existing finite
 * full-body solver. No global step/body change and no synthetic floor. */
export const CHENGQIAN_REAR_ACCESS_IDS=Object.freeze(['chengqian-rear-east-entry','chengqian-rear-west-entry']);
export function bindChengqianRearEntry(owner,side){
 if(!['east','west'].includes(side)||owner.chengqianRearSource?.id!==`chengqian-rear-${side}-platform-slab`||owner.max.y!==Math.fround(.47))throw Error('Actual R125 slab owner required');
 owner.furnitureMotionScope={kind:'chengqian-rear-access',id:`chengqian-rear-${side}-entry`,groundY:0,minOffsetX:-.85,maxOffsetX:owner.max.x-owner.min.x+.85,minOffsetZ:-.65,maxOffsetZ:owner.max.z-owner.min.z+.65};
}
