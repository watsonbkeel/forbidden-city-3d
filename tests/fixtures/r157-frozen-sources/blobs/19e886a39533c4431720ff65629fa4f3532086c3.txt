/** Uses the Environment's UTC+08 civil time snapshot, never a second timer.
 * This is a requested virtual-tour schedule, not a historical timetable. */
export function isRestTime(beijingTime){
 const m=beijingTime?.minutesOfDay;
 return Number.isFinite(m)&&(m>=21*60||m<6*60);
}
export function routineRole(actor){
 if(['consort-daily','maid-daily'].includes(actor.templateId))return'rest';
 if(actor.templateId==='emperor-ceremonial')return'work-transfer';
 if(['eunuch-daily','guard-duty'].includes(actor.templateId))return'night-duty';
 return'unchanged';
}
