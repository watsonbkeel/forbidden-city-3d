/** Deterministic local environmental motion. Never owns a timer or world clock. */
export function stableCharacterSeed(id) {
  let h = 2166136261;
  for (const c of String(id)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function characterEnvironmentMotion(actor, simulationSeconds, speed = 0) {
  const seed = Number.isFinite(actor.behavior?.seed) ? actor.behavior.seed : stableCharacterSeed(actor.id);
  const phase = ((seed >>> 0) % 65521) / 65521 * Math.PI * 2;
  const pose = actor.behavior?.basePose ?? 'standing';
  return { phase, amplitude: actor.templateId === 'emperor-ceremonial' ? 0.45 : 0.7,
    walkSpeed: Math.max(0, Number.isFinite(speed) ? speed : 0),
    poseIndex: { standing: 0, seated: 1, kneeling: 2 }[pose] ?? 0,
    time: simulationSeconds, ceremonyPhase: 'waiting' };
}
