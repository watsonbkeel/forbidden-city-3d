// Keep the original 0.5 m gate sampling grid inside the player's legal world bounds.
function gateProbeSamples(center, half, bounds, radius = 0.5) {
  const samples = [];
  for (let z = center - half; z <= center + half; z += 0.5) {
    if (z >= bounds.minZ + radius && z <= bounds.maxZ - radius) samples.push(z);
  }
  if (!samples.length) throw new Error('Gate passage probe lies outside the world bounds');
  return samples;
}
module.exports = { gateProbeSamples };
