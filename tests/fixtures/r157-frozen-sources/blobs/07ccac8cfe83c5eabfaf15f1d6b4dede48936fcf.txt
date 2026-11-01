/** R123 only: two actual low-platform owners dispatch the existing finite
 * full-body solver. No global step/body change and no synthetic floor. */
export const CHUXIU_REAR_ACCESS_IDS=Object.freeze(['chuxiu-rear-east-entry','chuxiu-rear-west-entry']);
export function bindChuxiuRearEntry(owner,side){
 if(!['east','west'].includes(side)||owner.chuxiuRearSource?.id!==`chuxiu-rear-${side}-platform-slab`||owner.max.y!==Math.fround(.47))throw Error('Actual R123 slab owner required');
 owner.furnitureMotionScope={kind:'chuxiu-rear-access',id:`chuxiu-rear-${side}-entry`,groundY:0,minOffsetX:-.85,maxOffsetX:owner.max.x-owner.min.x+.85,minOffsetZ:-.65,maxOffsetZ:owner.max.z-owner.min.z+.65};
}
