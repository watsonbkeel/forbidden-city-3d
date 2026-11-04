import fs from'node:fs';import{fixture as hall}from'../r164-fori-balustrade/fixture.mjs';import{canvas}from'../r164-yangxin-east-panels/fixture.mjs';
export function fixture(){const restore=canvas(),b=hall({name:'畅音阁'});return{...b,zone:JSON.parse(fs.readFileSync('data/zones/ningshou.json')),dispose(){b.dispose();restore()}}}
