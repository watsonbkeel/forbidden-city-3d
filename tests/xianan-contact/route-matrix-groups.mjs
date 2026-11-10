// Frozen test-only matrix admission. No stage is executed merely by importing.
export const geometryPin={lanes:{leftThreshold:296.0800018310547,centralThreshold:300.8999938964844,rightThreshold:305.7200012207031},centerZ:-240.0999984741211,capMinZ:-244.56500244140625,capMaxZ:-235.63499450683594};
export const limits={frameLineBytes:3072,segmentLineBytes:512,crossingLineBytes:1024,perCaseMetadataBytes:32768,maxSegmentsPerFrame:{10:21,60:5},metadataAndStartBytes:655360,stdoutStderrBytes:131072,finalReceiptMirrorBytes:524288,newInputReserveBytes:393216};
const laneOrder=[['CENTRAL','centralThreshold'],['LEFT','leftThreshold'],['RIGHT','rightThreshold']];
const directionOrder=[['SN','south-to-north'],['NS','north-to-south']];
export const groups=[];
for(const [label,lane]of laneOrder)for(const fps of [10,60])for(const directions of fps===10?[directionOrder]:directionOrder.map(d=>[d])){
 const stage=`ROUTE-${label}-${fps}HZ${fps===60?'-'+directions[0][0]:''}-01`;
 const cases=directions.flatMap(([short,direction])=>['walk','sprint'].map(mode=>({id:`${label.toLowerCase()}-${fps}-${short.toLowerCase()}-${mode}`,direction,mode,movementFrameCap:fps===10?(mode==='walk'?76:55):(mode==='walk'?456:330),tailFrames:2*fps})));
 const frames=cases.reduce((n,c)=>n+c.movementFrameCap+c.tailFrames,0),segments=frames*limits.maxSegmentsPerFrame[fps];
 const budget={maxFrames:frames,maxSegments:segments,frameBytes:frames*limits.frameLineBytes,segmentBytes:segments*limits.segmentLineBytes,crossingBytes:cases.length*4*limits.crossingLineBytes,metadataAndStartBytes:limits.metadataAndStartBytes,stdoutStderrBytes:limits.stdoutStderrBytes,finalReceiptMirrorBytes:limits.finalReceiptMirrorBytes,newInputReserveBytes:limits.newInputReserveBytes};
 budget.totalUpperBound=Object.entries(budget).filter(([k])=>k.endsWith('Bytes')).reduce((n,[,v])=>n+v,0);
 groups.push({stage,lane,fps,cases,budget});
}
