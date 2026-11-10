export const ORDER=Object.freeze(['axis-courts','east-six','west-six','ningshou','outer-east','outer-west','garden','yuqing-south-entry']);
export const TARGET='yuqing-south-entry';export const START=Object.freeze({x:-134.5,z:193});export const FAR=Object.freeze({x:100,z:300});
export const POINTS=Object.freeze([
 ['axis-core',0,0,'axis-courts'],['east-E46',-134.5,207,'east-six'],['west-six',100,300,'west-six'],['ningshou',-260,320,'ningshou'],['outer-east',-250,0,'outer-east'],['outer-west',220,400,'outer-west'],['garden',0,450,'garden'],['E45',-134.5,193,TARGET],['E45-north-near',-134.5,204.999,TARGET],['E45-shared-edge',-134.5,205,'east-six'],['E45-east-edge',-130.25,193,TARGET],['east-gap',-130.125,193,null],['axis-west-edge',-130,193,'axis-courts']
].map(([label,x,z,expected])=>Object.freeze({label,x,z,expected})));
export const GATE_ROUTES=Object.freeze([[[-134.5,186],[-134.5,199]],[[-134.5,199],[-134.5,186]]]);
export const OLD_ROUTES=Object.freeze([[[-94.47,174.1],[-118.47,174.1]],[[-118.47,174.1],[-94.47,174.1]],[[-141,205.6],[-141,208.5],[-141,205.6]],[[-128,205.6],[-128,208.5],[-128,205.6]]]);
export const APPROACH=Object.freeze([[-120,174.1],[-134.5,174.1],[-134.5,186],[-134.5,199],[-134.5,205.6]]);

export const NEIGHBORS=Object.freeze({"axis-courts":["east-six","outer-east","outer-west","garden","yuqing-south-entry"],"east-six":["axis-courts","ningshou","garden","yuqing-south-entry"],"west-six":["outer-west","garden"],"ningshou":["east-six","outer-east"],"outer-east":["axis-courts","ningshou"],"outer-west":["axis-courts","west-six"],"garden":["axis-courts","east-six","west-six"],"yuqing-south-entry":["east-six","axis-courts"]});

export const STATIC_SCOPE=Object.freeze({included:['PalaceBuilder.buildGate(original PALACE_LAYOUT 乾清门)','Enclosure.buildOuterWalls(original layout)'],alreadyInZones:['axis-courts/items/4 景运门','axis-courts/items/6 东轴墙','east-six original E46'],excluded:['Other static PalaceBuilder palaces/gates/river rendering','Static GardenBuilder and corner/corridor methods','Characters, active GLB interiors, lights and GPU'],wholeWorld:false});
