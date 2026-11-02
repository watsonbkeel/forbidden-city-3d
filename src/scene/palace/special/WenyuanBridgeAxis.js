// The official front photograph shows bridge -> entrance steps -> main bay on
// one axis. The retained six equal model bays put a COLUMN at the hall origin.
// Move the entire fitted bridge to the existing clear bay; never delete that
// column or grant an invisible crossing. This 3.375 m shift is a gameplay fit,
// not a surveyed bridge coordinate or a claim of current visitor admission.
export const WENYUAN_BRIDGE_X=-186.5-40.5/12;
export const WENYUAN_BRIDGE_ALIGNMENT=Object.freeze({
 source:'https://img.dpm.org.cn/Uploads/Picture/2024/02/21/s65d5b6eae1fbb.jpg',
 relation:'BRIDGE_STEPS_MAIN_BAY_SAME_AXIS',
 status:'GAMEPLAY_AXIS_ALIGNMENT_NOT_SURVEYED',
 previousX:-186.5,x:WENYUAN_BRIDGE_X,translationX:-3.375,
 retained:'BUILDING_COLUMNS_DOORS_VERANDA_STAIRS_POND_POLYGON',
});
