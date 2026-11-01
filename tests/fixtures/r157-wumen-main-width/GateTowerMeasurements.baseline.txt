/** Source cards only; reference PDFs/photos are not redistributed with the app.
 * Values describe their stated endpoints, never historical usable clear widths. */
export const GATE_TOWER_MEASUREMENTS = Object.freeze({
  wumen: {
    grid: { width:60.05, depth:25, status:'OFFICIAL_COLUMN_AXIS_TOTAL', source:'https://www.dpm.org.cn/explore/building/236454.html' },
    gallery: { axisSetback:2.9, modelUncertainty:.3, status:'PROVISIONAL_DIAGRAM_REGISTERED_NOT_SURVEYED', endpoints:'outer eave-column axis to inner enclosure axis',
      sources:['https://img.dpm.org.cn/Uploads/pdf/4884/T00124_00.pdf','https://img.dpm.org.cn/Uploads/pdf/4884/T00114_00.pdf'],
      registrationM:[2.8846153846,2.8205128205,2.9310344828,2.9885057471],
      limitation:'Two views in the same 2005 report, not independent as-built surveys. Exhibition insert is excluded. No exact clear width or 2026 access claim.' },
    doorType:{value:'lattice-panel',status:'PHOTO_SUPPORTED_TYPE',operation:'central architectural openings north and south; other bay operation unresolved'},
  },
  shenwu: {
    source:'https://img.dpm.org.cn/Uploads/File/2018/06/05/u5b164a2ba5129.pdf', citation:'Palace Museum Journal 2013(1), Table 1 p27 and Fig3 p28',
    rawColumnFootMm:{frontWtoE:[2850,6500,6650,9740,6630,6490,2880],rearWtoE:[2840,6495,6650,9770,6620,6505,2830],westDepth:[2820,12250,2890],eastDepth:[2840,12285,2840]},
    publishedPooledMm:{central:9755,adjacent:6637.5,outer:6497.5,gallery:2848.8},
    nominalShaftDiameterMm:{outer:655,inner:750,status:'DRAWN_PLAN_SECTION_NOT_FOOTING_ENVELOPE'},
    localOutlineMm:{width:43680,depth:20075,frontWidthReference:41740,widthOffsets:[970,970],figureDepthReference:17965,depthOffsets:[1055,1055],
      limitation:'Figure-side identity retained: depth chain matches table east values although drawn at page left. Local hall-base/balustrade outline, not city platform.'},
    nominalCityPlatformM:{width:50.18,depth:26.46,status:'PROVISIONAL_TOP_BOUNDARY_INTERPRETATION',source:'https://img.dpm.org.cn/Uploads/File/2020/02/16/u5e490f5ea72b3.pdf',page:343,
      limitation:'Published city-platform envelope does not resolve top/foot or parapet reference.'},
    topology:{northSouth:'three central lattice-door bay groups',eastWest:'central paired board doors',veranda:'four sides',source:'https://www.dpm.org.cn/explore/building/236456.html'},
  },
  publicAccess:{status:'NOT_VERIFIED',note:'Architectural preview openings do not assert visitor permission. Raised plinth/stair elevations remain deferred.'},
});
