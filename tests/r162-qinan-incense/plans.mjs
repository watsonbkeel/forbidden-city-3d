export const approaches=[-11,11].map(x=>({name:x<0?'source-east':'source-west',x,pts:[[0,474],[0,477.5],[x,477.5],[x,478],[x,477.5],[0,477.5],[0,474]]}));
export const oldPlans=[{name:'existing-central',pts:[[0,470],[0,478],[0,470]]},{name:'existing-south-crosspath',pts:[[-17,474],[17,474],[-17,474]]}];
export const negativePlans=[-11,11].flatMap(x=>[{name:'real-rear-screen',pts:[[x,478],[x,479.4]],startFeet:.08},{name:'real-front-column',pts:[[x-.9,477],[x-.9,478.8]],startFeet:0}]);
