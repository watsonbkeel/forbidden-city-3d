import{fixture as base}from'../r164-changyin-middle-plaque/fixture.mjs';import{buildChangyinMiddleNameboard}from'../../src/scene/palace/special/ChangyinMiddleNameboard.js';
export function fixture(){const b=base();b.middle=buildChangyinMiddleNameboard(b.kit,b.zone);return b}
