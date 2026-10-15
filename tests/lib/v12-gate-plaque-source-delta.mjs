import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

// Finite V12 source deltas against immutable V10 9799e7e bytes. No source or
// geometry golden is regenerated, and no arbitrary formatting is normalized.
export const GATE_PLAQUE_SOURCE_DELTAS = {
  "src/scene/PalaceBuilder.js": {
    "historicalSha256": "c390fa393f9a7f34078d92a224ada589c7d63013a6580f32fafe64ff5206f324",
    "deltas": [
      {
        "before": "import { buildGateTowerShell } from './palace/special/GateTowerShell.js';\n",
        "after": "import { buildGateTowerShell } from './palace/special/GateTowerShell.js';\nimport { buildWumenSouthPlaque, buildShenwuInstitutionPlaque, SHENWU_GATE_NAME_OMISSION } from './palace/special/GatePlaques.js';\n"
      },
      {
        "before": "    const plaque = this.plaqueMesh('午门', 2, 3.2, true);\n    plaque.position.set(0, top + 9, -dm.depth / 2 - 0.5);\n    plaque.rotation.y = Math.PI;\n    g.add(plaque);\n",
        "after": "    g.add(buildWumenSouthPlaque(this, roof));\n"
      },
      {
        "before": "    const plaque = this.plaqueMesh('神武门', 1.6, 2.6, true);\n    plaque.position.set(0, PH + 5.5, -towerProfile.enclosure.innerZ - towerProfile.T / 2 - 0.15);\n    plaque.rotation.y = Math.PI;\n    g.add(plaque);\n",
        "after": "    g.add(buildShenwuInstitutionPlaque(this, { platformDepth: D, platformHeight: PH, tunnelHeight: tunnelH }));\n    g.userData.gatePlaqueOmissions = [structuredClone(SHENWU_GATE_NAME_OMISSION)];\n"
      }
    ]
  },
  "src/scene/RoofBuilder.js": {
    "historicalSha256": "7456d29095ac9a9b4fc23094a0e00028583551ea274c716ca968cacbdb7ae710",
    "deltas": [
      {
        "before": "  return { eaveY: yb, top };\n",
        "after": "  return { eaveY: yb, top, wallSoffitY: y0,\n    soffitProfile: { eaveY: yb, height: H, coefficient: type === 'pavilion' ? 0.36 : type === 'gable' ? 0.62 : 0.48, thickness: th, halfDepth: ez } };\n"
      },
      {
        "before": "  return { y0, eaveY: yb, topY: Y(0) };\n",
        "after": "  return { y0, eaveY: yb, topY: Y(0), ridgeTopY: Y(0) + hr * 1.8 };\n"
      },
      {
        "before": "  return { eaveY: sk.eaveY, top: upper.top };\n",
        "after": "  // Attachment metadata only: these are the actual generated lower-ridge and\n  // upper-soffit locals, not the decorative ridge/finial bounding-box top.\n  return { eaveY: sk.eaveY, top: upper.top, doubleEaveMountingBand: {\n    lowerY: sk.ridgeTopY, upperY: upper.wallSoffitY, halfDepth: Di / 2,\n    halfWidth: Wi / 2, upperSoffit: upper.soffitProfile,\n  } };\n"
      },
      {
        "before": "  return finalize(ctx, g, r.eaveY);\n",
        "after": "  const roof = finalize(ctx, g, r.eaveY);\n  if (r.doubleEaveMountingBand) roof.userData.doubleEaveMountingBand = r.doubleEaveMountingBand;\n  return roof;\n"
      }
    ]
  }
};

export function restoreV10GateSource(path,current) {
  const record=GATE_PLAQUE_SOURCE_DELTAS[path]; assert.ok(record,'Unknown protected source');
  let source=current.toString('utf8');
  for(const {before,after} of record.deltas){
    assert.equal(source.split(after).length-1,1,'Each exact V12 replacement must occur exactly once');
    source=source.replace(after,before);
  }
  assert.equal(createHash('sha256').update(source).digest('hex'),record.historicalSha256,
    'Only exact approved plaque calls and roof attachment metadata may differ from V10');
  return Buffer.from(source);
}
