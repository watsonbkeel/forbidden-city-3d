// Declaration-only evidence policy, never a claim of an empty historic room.
// These six existing shells are not a resolved mapping of all three Sansuo stages.
const RECORDS = [
  {
    "target": "outer-east/items/12",
    "runtimeInventoryId": "RI-8950897E9807",
    "item": {
      "kind": "hall",
      "name": "南三所西所前殿",
      "x": -251.8,
      "z": 39,
      "w": 15.4,
      "d": 10.6,
      "colH": 5.04,
      "roof": "gable",
      "enter": true,
      "source": "D1"
    }
  },
  {
    "target": "outer-east/items/13",
    "runtimeInventoryId": "RI-B44087B4A274",
    "item": {
      "kind": "hall",
      "name": "南三所西所后殿",
      "x": -251.8,
      "z": 68.9,
      "w": 19,
      "d": 10.3,
      "colH": 5.04,
      "roof": "gable",
      "source": "D1"
    }
  },
  {
    "target": "outer-east/items/14",
    "runtimeInventoryId": "RI-DE4AD62CF33B",
    "item": {
      "kind": "hall",
      "name": "南三所中所前殿",
      "x": -285.4,
      "z": 39,
      "w": 15.4,
      "d": 10.6,
      "colH": 5.04,
      "roof": "gable",
      "enter": true,
      "source": "D1"
    }
  },
  {
    "target": "outer-east/items/15",
    "runtimeInventoryId": "RI-5DAF22D29D90",
    "item": {
      "kind": "hall",
      "name": "南三所中所后殿撷芳殿",
      "x": -285.1,
      "z": 68.9,
      "w": 19,
      "d": 10.3,
      "colH": 5.04,
      "roof": "gable",
      "enter": true,
      "interior": "A:hall",
      "source": "D1"
    }
  },
  {
    "target": "outer-east/items/16",
    "runtimeInventoryId": "RI-24389A9919DC",
    "item": {
      "kind": "hall",
      "name": "南三所东所前殿",
      "x": -317.4,
      "z": 39,
      "w": 15.4,
      "d": 10.6,
      "colH": 5.04,
      "roof": "gable",
      "enter": true,
      "source": "D1"
    }
  },
  {
    "target": "outer-east/items/17",
    "runtimeInventoryId": "RI-DCC6EC3F42F8",
    "item": {
      "kind": "hall",
      "name": "南三所东所后殿",
      "x": -317,
      "z": 68.9,
      "w": 19,
      "d": 10.3,
      "colH": 5.04,
      "roof": "gable",
      "source": "D1"
    }
  }
];
const equal=(a,b)=>a&&b&&Object.keys(a).length===Object.keys(b).length&&Object.keys(b).every(k=>Object.hasOwn(a,k)&&a[k]===b[k]);
export function validateNansansuoInventoryPolicy({zoneId,itemIndex,item}={},params){
 const target=`${zoneId}/items/${itemIndex}`,record=RECORDS.find(r=>r.target===target);
 const policy=item?.furnishingPolicy;
 if(zoneId!=='outer-east'||!Number.isInteger(itemIndex)||!record||!policy||
   !equal(policy,{mode:'unknown-inventory',target,runtimeInventoryId:record.runtimeInventoryId}))
  throw new Error('Invalid explicit Nansansuo inventory policy or declaration target');
 const {furnishingPolicy,...rest}=item;
 if(!equal(rest,record.item))throw new Error('Nansansuo inventory declaration identity/envelope drift');
 if(params!==undefined){
  const expected={};for(const k of ['x','z','w','d','colH','roof','enter','interior','name'])if(Object.hasOwn(record.item,k))expected[k]=record.item[k];expected.rot=0;
  if(!equal(params,expected))throw new Error('Nansansuo inventory hall parameters drift');
 }
 return Object.freeze({...policy});
}
