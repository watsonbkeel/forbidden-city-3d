/** Source-only registration of official 2021 upper-floor plan, printed pp.152–153.
 * Not dispatched by PalaceBuilder. These axes neither measure lower tunnels nor
 * authorize moving independent Que gates, changing the boundary or a base hull.
 * Evidence: docs/photo-fidelity/batches/R157-A37/wumen-integration-evidence/
 * WUMEN-JOINT-PLAN-REGISTRATION-20261031.{md,json}.
 */
const metersPerPixel = 25 / 377.5;
export function wumenPlanPoint(page, u, v) {
    if (page !== 152 && page !== 153) throw new RangeError('Unsupported plan page');
    if (!Number.isFinite(u) || !Number.isFinite(v)) throw new TypeError('Plan pixels must be finite');
    if (u < 0 || u > 2304 || v < 0 || v > 3000) throw new RangeError('Plan pixel outside rendered sheet');
    const x = page === 152 ? -30.025 - (u - 667) * metersPerPixel
        : 30.025 - (u - 2060) * metersPerPixel;
    return [x, ((1309.75 - v) / 377.5) * 25];
}
const pavilion = (side, end, page, pixelU, pixelV) => {
    const id = `INSTANCE-A-WUMEN-${side}-${end}-PAVILION`;
    return {
        id, page, pixelU, pixelV,
        centerLocalXZ: wumenPlanPoint(page, (pixelU[0] + pixelU[1]) / 2, (pixelV[0] + pixelV[1]) / 2),
        axisDimensionsXZ: [(pixelU[1] - pixelU[0]) * metersPerPixel, (pixelV[1] - pixelV[0]) * metersPerPixel],
        cornerColumns: pixelV.flatMap((v, j) => pixelU.map((u, i) => ({
            id: `${id}/corner-${j}-${i}`, ownerId: id, localXZ: wumenPlanPoint(page, u, v),
        }))),
    };
};
const pavilions = [
    pavilion('EAST', 'NORTH', 152, [839,1126], [1159,1447]),
    pavilion('EAST', 'SOUTH', 152, [839,1126], [2433,2724]),
    pavilion('WEST', 'NORTH', 153, [1599,1885], [1162,1448]),
    pavilion('WEST', 'SOUTH', 153, [1599,1885], [2435,2726]),
];
const wing = (id, north, south, pixelV) => {
    const {page, pixelU} = north;
    const axesZ = pixelV.map(v => wumenPlanPoint(page, pixelU[0], v)[1]);
    const columns = pixelV.flatMap((v, j) => pixelU.map((u, i) => {
        // Shared endpoints retain the pavilion's actual unique owner and coordinates.
        if (j === 0) return north.cornerColumns[2 + i];
        if (j === pixelV.length - 1) return south.cornerColumns[i];
        return {id: `${id}/axis-${j}-${i}`, ownerId: id, localXZ: wumenPlanPoint(page, u, v)};
    }));
    return {id, page, pixelU, pixelV, axesZ, columns,
        bays: axesZ.slice(1).map((z, i) => ({fromAxis: i, toAxis: i + 1, length: axesZ[i] - z})),
    };
};
function deepFreeze(value) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
        Object.values(value).forEach(deepFreeze); Object.freeze(value);
    }
    return value;
}
export const WUMEN_PLAN_REGISTRATION = deepFreeze({
    runtimeEnabled: false,
    sourceURL: 'https://www.dpm.org.cn/Uploads/File/2021/11/23/u619c5a27422d3.pdf',
    sourcePDFsha256: '5049aa0a175c2fe8da56f536a5846d29772f2fd424e6213236e964e2968d8a85',
    renderSize: [2304,3000], metersPerPixel, worldAnchor: [0,0,-419.6],
    worldAnchorStatus: 'RETAINED_RUNTIME_WHOLE_U_BBOX_NOT_VERIFIED_MAIN_COLUMN_ORIGIN',
    sourceIsLowerTunnelPlan: false,
    uncertainty: 'Independent pixel readings ±2px; excludes drawing distortion and later changes; not a survey.',
    platformTopRetainedEngineering: 12.3,
    lowerEnvelopeStatus: 'ENGINEERING_SEARCH_NOT_MEASURED_OR_ENABLED',
    queGateStatus: 'INDEPENDENT_GROUND_BUILDINGS_ANCHOR_PROVENANCE_UNRESOLVED',
    currentSouthBoundary: -500,
    pendingInterfaces: ['que-gate-metre-registration', 'joint-lower-camera-and-envelope',
        'south-boundary-and-ground-routes', 'ascent-terminal-platform-and-enclosure', 'north-and-south-photo-holdouts'],
    pavilions,
    wings: [
        wing('FC-B0439D9BED', pavilions[0], pavilions[1], [1447,1531,1605,1680.5,1755,1828,1903,1978,2052.5,2127.5,2201.5,2276.5,2350.5,2433]),
        wing('FC-FB99F593DB', pavilions[2], pavilions[3], [1448,1533.5,1607.5,1682.5,1757,1830.5,1905,1980,2054.5,2129.5,2204,2279,2353.5,2435]),
    ],
});
