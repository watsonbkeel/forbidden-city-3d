import test from 'node:test';import assert from 'node:assert/strict';
import {isRestTime,routineRole} from '../src/scene/characters/DailyRoutineClock.js';
import {getBeijingTime} from '../src/scene/sky/BeijingDayCycle.js';
import r from '../data/characters/index.js';
test('UTC+08 rest schedule crosses midnight with exact 21:00 and 06:00 boundaries',()=>{
 for(const [clock,expected]of [['20:59:59',false],['21:00:00',true],['23:59:59',true],['00:00:00',true],['05:59:59',true],['06:00:00',false]])assert.equal(isRestTime(getBeijingTime(new Date(`2026-10-24T${clock}+08:00`))),expected,clock);
 assert.equal(isRestTime(null),false);assert.equal(isRestTime({minutesOfDay:NaN}),false);
});
test('all 108 IDs retained, all 28 women assigned sleep role, only one emperor',()=>{assert.equal(r.actors.length,108);assert.equal(r.actors.filter(a=>routineRole(a)==='rest').length,28);assert.equal(r.actors.filter(a=>routineRole(a)==='work-transfer').length,1);assert.equal(r.paths.length,24);});
