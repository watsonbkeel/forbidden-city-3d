import {nightTourLighting} from './NightTourLighting.js';
import {isRestTime} from '../characters/DailyRoutineClock.js';
/** Requested tour schedule, not historical lamp practice. Uses the same civil
 * snapshot as character routines; missing snapshot retains solar-only behavior. */
export function householdLightingPolicy(daylight,beijingTime){
 const minutes=beijingTime?.minutesOfDay;
 const scheduled=Number.isFinite(minutes)&&(minutes>=19*60||minutes<6*60);
 return {gain:Math.max(nightTourLighting(daylight).night,scheduled?1:0),resting:isRestTime(beijingTime)};
}
