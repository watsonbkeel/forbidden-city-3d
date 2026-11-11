/** Figure-10 equal-scale engineering registration. Symbols are NOT surveyed walls.
 * Heights, retreats, roof types/palette, net openings and earth-level thresholds
 * are conservative MODEL_FIT. Unknown wooden screen/annexes/interiors omitted. */
const freeze=o=>{if(o&&typeof o==='object'){Object.values(o).forEach(freeze);Object.freeze(o)}return o};
export const QIANDONG_SECOND_FRONT_COURT=freeze({
  "id": "east-six/qiandong-second-front-court",
  "gate": {
    "kind": "gate",
    "qiandongSecondFrontGate": "figure10",
    "x": -116.1201461854728,
    "z": 466,
    "w": 6,
    "source": "DPM-2020-figure10-MODEL_FIT"
  },
  "body": {
    "kind": "hall",
    "qiandongSecondFrontCourt": "figure10",
    "source": "DPM-2020-figure10-MODEL_FIT"
  },
  "gap": {
    "side": "s",
    "at": -116.1201461854728,
    "w": 6
  },
  "southWallBand": {
    "x0": -128.63727729556877,
    "x1": -102.41388761991777,
    "z": 466,
    "t": 1,
    "h": 4.5,
    "originalHeight": 6.5,
    "baseHeight": 1
  },
  "rooms": [
    {
      "id": "westWing",
      "uv": [
        235,
        285,
        352,
        433
      ],
      "symbol": {
        "x0": -108.67245317496574,
        "x1": -102.41388761991777,
        "z0": 466.43809958885333,
        "z1": 476.57697578803106
      },
      "rot": 1.5707963267948966
    },
    {
      "id": "eastWing",
      "uv": [
        396.5,
        444.5,
        351.5,
        433
      ],
      "symbol": {
        "x0": -128.63727729556877,
        "x1": -122.6290543627227,
        "z0": 466.43809958885333,
        "z1": 476.63956144358156
      },
      "rot": -1.5707963267948966
    },
    {
      "id": "northRoom",
      "uv": [
        269.5,
        420.5,
        278.5,
        342.5
      ],
      "symbol": {
        "x0": -125.63316582914572,
        "x1": -106.73229785290087,
        "z0": 477.7661032434902,
        "z1": 485.7770671539516
      },
      "rot": 0
    }
  ],
  "fit": {
    "wallRetreat": 0.95,
    "roofOverhang": 0.35,
    "wallHeight": 3.8,
    "doorWidth": 2.2,
    "doorHeight": 2.8,
    "floorY": 0,
    "gateNetWidth": 3.4,
    "gateDepth": 0.8,
    "gateRoofBaseY": 5.8,
    "gateRoofDepth": 2.4,
    "gateNetHeight": 4.6,
    "gateRoofHeight": 1.2
  },
  "status": "MODEL_FIT_NOT_SURVEY_NOT_FULL_HISTORICAL_RECONSTRUCTION"
});
const RETAINED=freeze([
  {
    "kind": "gate",
    "name": "乾东五所",
    "x": -142,
    "z": 466,
    "source": "estimated"
  },
  {
    "kind": "courtWalls",
    "x0": -211,
    "x1": -74,
    "z0": 466,
    "z1": 520,
    "gates": [
      {
        "side": "s",
        "at": -142,
        "gate": "乾东五所"
      },
      {
        "side": "s",
        "at": -116.1201461854728,
        "w": 6
      }
    ]
  },
  {
    "kind": "hall",
    "x": -83.7,
    "z": 501.6,
    "w": 18.9,
    "d": 7.2,
    "pad": 0.4,
    "ph": 0.45,
    "colH": 5.44,
    "roof": "gable",
    "brackets": false,
    "map": "hall"
  },
  {
    "kind": "hall",
    "x": -112.2,
    "z": 501.6,
    "w": 18.9,
    "d": 7.2,
    "pad": 0.4,
    "ph": 0.45,
    "colH": 5.44,
    "roof": "gable",
    "brackets": false,
    "map": "hall"
  },
  {
    "kind": "hall",
    "x": -142.2,
    "z": 501.6,
    "w": 18.9,
    "d": 7.2,
    "pad": 0.4,
    "ph": 0.45,
    "colH": 5.44,
    "roof": "gable",
    "brackets": false,
    "map": "hall"
  },
  {
    "kind": "hall",
    "x": -170.8,
    "z": 501.6,
    "w": 18.9,
    "d": 7.2,
    "pad": 0.4,
    "ph": 0.45,
    "colH": 5.44,
    "roof": "gable",
    "brackets": false,
    "map": "hall"
  },
  {
    "kind": "hall",
    "x": -199.5,
    "z": 501.6,
    "w": 18.9,
    "d": 7.2,
    "pad": 0.4,
    "ph": 0.45,
    "colH": 5.44,
    "roof": "gable",
    "brackets": false,
    "map": "hall"
  },
  {
    "kind": "region",
    "name": "乾东五所",
    "x0": -211,
    "x1": -74,
    "z0": 466,
    "z1": 520
  }
]);
const equal=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
const fail=()=>{throw Error('Qiandong second front court exact source/gap/selector contract mismatch')};
/** Local engineering band is anchored to the existing equal-scale wing
 * symbols, not a second registration or a claim of historical elevation. */
export function validateQiandongSecondFrontCourtProfile(p=QIANDONG_SECOND_FRONT_COURT){
 const b=p?.southWallBand,f=p?.fit,rooms=p?.rooms;
 if(!b||!f||!Number.isFinite(p.gap?.at)||!Number.isFinite(p.gap?.w)||!Array.isArray(rooms)||rooms.length!==3||!Object.values(b).every(Number.isFinite)||!Object.values(f).every(Number.isFinite)||rooms.some(r=>!r.symbol||!Object.values(r.symbol).every(Number.isFinite)))fail();
 if(b.x0!==rooms.find(r=>r.id==='eastWing')?.symbol.x0||b.x1!==rooms.find(r=>r.id==='westWing')?.symbol.x1||b.x0!==-128.63727729556877||b.x1!==-102.41388761991777||b.z!==466||b.z!==p.gate.z||b.t!==1||b.h!==4.5||b.originalHeight!==6.5||b.baseHeight!==1||f.gateRoofBaseY!==5.8||f.gateNetHeight!==4.6||f.gateNetWidth!==3.4||f.gateDepth!==.8||f.gateRoofDepth!==2.4||f.gateRoofHeight!==1.2||f.gateRoofBaseY<=f.gateNetHeight||b.x0>=p.gap.at-p.gap.w/2||b.x1<=p.gap.at+p.gap.w/2)fail();
 return p;
}
export function validateQiandongSecondFrontCourt(zoneJson){
 const items=zoneJson?.items;
 const declared=Array.isArray(items)&&items.some(q=>q&&('qiandongSecondFrontGate' in q||'qiandongSecondFrontCourt' in q));
 if(zoneJson?.id!=='east-six'){if(declared)fail();return null}
 if(!Array.isArray(items)||items.length<60)fail();
 for(let i=42;i<=49;i++)if(!equal(items[i],RETAINED[i-42]))fail();
 const p=validateQiandongSecondFrontCourtProfile();
 if(!equal(items[58],p.gate)||!equal(items[59],p.body))fail();
 if(items.filter(q=>q&&'qiandongSecondFrontGate' in q).length!==1||items.filter(q=>q&&'qiandongSecondFrontCourt' in q).length!==1)fail();
 // Explicit widths are same-source, never guessed from an anonymous name map.
 const gates=items[43].gates,prior=gates[0],next=gates[1];
 if(next.side!=='s'||next.at!==p.gate.x||next.w!==p.gate.w||p.gate.z!==items[43].z0)fail();
 // Old common gate uses the existing generic 3.6m portal + two 1.4m piers (6.4m gap); its declaration is locked above.
 if(Math.abs(next.at-prior.at)<(next.w+6.4)/2||next.at-next.w/2<items[43].x0||next.at+next.w/2>items[43].x1)fail();
 return p;
}
