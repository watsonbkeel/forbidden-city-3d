/** Exact retained court-wall contracts. These strips do not cover the court interior. */
export const SHOUKANG_PERIMETER=Object.freeze({
 north:Object.freeze({frame:[289.2,0,273.02],rotation:0,length:41.139999999999986,region:{minX:267.38,maxX:311.02,minZ:271.77,maxZ:274.27},body:[[268.6300048828125,1,272.5199890136719],[309.7699890136719,6.5,273.5199890136719]],cap:[[268.6300048828125,6.5,272.1700134277344],[309.7699890136719,7.388999938964844,273.8699951171875]]}),
 east:Object.freeze({frame:[268.63,0,233.45999999999998],rotation:Math.PI/2,length:79.11999999999998,region:{minX:267.38,maxX:269.88,minZ:192.65,maxZ:274.27},body:[[268.1300048828125,1,193.89999389648438],[269.1300048828125,6.5,273.0199890136719]],cap:[[267.7799987792969,6.5,193.89999389648438],[269.4800109863281,7.388999938964844,273.0199890136719]]}),
 west:Object.freeze({frame:[309.77,0,233.45999999999998],rotation:Math.PI/2,length:79.11999999999998,region:{minX:308.52,maxX:311.02,minZ:192.65,maxZ:274.27},body:[[309.2699890136719,1,193.89999389648438],[310.2699890136719,6.5,273.0199890136719]],cap:[[308.9200134277344,6.5,193.89999389648438],[310.6199951171875,7.388999938964844,273.0199890136719]]})
});
for(const q of Object.values(SHOUKANG_PERIMETER)){Object.freeze(q.frame);Object.freeze(q.region);for(const k of ['body','cap']){q[k].forEach(Object.freeze);Object.freeze(q[k]);}}
export const shoukangPerimeterId=side=>'shoukang-entry-retained-'+side;
export function shoukangPerimeterContract(id){return Object.entries(SHOUKANG_PERIMETER).find(([side])=>shoukangPerimeterId(side)===id)?.[1];}
export function validateShoukangPerimeterScope(input,box,region){const c=shoukangPerimeterContract(input.id);if(!c||input.groundY!==undefined||Object.keys(c.region).some(k=>region[k]!==c.region[k])||box.min.toArray().some((v,i)=>v!==c.body[0][i])||box.max.toArray().some((v,i)=>v!==c.body[1][i]))throw new TypeError('Shoukang retained perimeter requires exact complete visible wall body and narrow strip');}
