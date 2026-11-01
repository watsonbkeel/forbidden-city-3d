/** Root-approved R123 model-space fit, NOT surveyed palace coordinates.
 * One fixed declaration; callers still validate exact instance/source identities.
 * Main/front wings move once. Tihe, Lijing and all other frames remain retained. */
export const CHUXIU_FRAME_DZ=-5;
export const CHUXIU_MAIN_Z=429.3;
export const CHUXIU_FRONT_WING_Z=417;
export const CHUXIU_MAIN_PROFILE='chuxiu-official-topology-fit-r123';
export const CHUXIU_COURTYARD_PROFILE='chuxiu-return-corridor-fit-r123';
export const CHUXIU_WING_POSITION_PROFILE='chuxiu-side-access-fit-r123';
export const CHUXIU_REAR_PROFILE='chuxiu-rear-court-r123';
export const chuxiuShiftedZ=z=>z+CHUXIU_FRAME_DZ;
