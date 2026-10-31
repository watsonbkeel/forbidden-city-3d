import {readVerifiedChunkedGzip} from './r157-verified-chunked-gzip.mjs';
// Original 493 QA fixture identity; fixed digest, not a private-key signature.
export const TAIHEMEN_WORLD_FIXTURE_PIN=Object.freeze({
  "format": 1,
  "filename": "world-physics-5d8c713e.json.gz",
  "originalGitBlobSHA1": "6df149f5e70be9127779e4fde8efbe376857761b",
  "compressedBytes": 1183312,
  "compressedSHA256": "65ccdfee6839b9173bd5c3458f8e141474f33b52d5adfe150d68cd732c8ea18a",
  "uncompressedBytes": 2700665,
  "uncompressedSHA256": "dbda1e6e18635d7a80425b25e46337280a716f393c70b0b88dfaa9141f2904b4",
  "chunkBytes": 49152,
  "manifestSHA256": "5ff966b51f2d75499246fa09cd228718ca7d400b5fb885c1b074c5970a78e833",
  "chunkCount": 25
});
export function readTaihemenWorldFixture(){return readVerifiedChunkedGzip(new URL('../fixtures/r157-taihemen-integration/world-physics-5d8c713e.json.gz',import.meta.url),TAIHEMEN_WORLD_FIXTURE_PIN);}
