import {readVerifiedChunkedGzip} from './r157-verified-chunked-gzip.mjs';
export const WENHUA_493_GZIP_PIN=Object.freeze({
  "format": 1,
  "filename": "world-493-before.json.gz",
  "originalGitBlobSHA1": "55e6b97d1fcec6b03242491bb9da42b647e8de8e",
  "compressedBytes": 1172255,
  "compressedSHA256": "dbca3c3fd71b922551749e09f2bf1a2162e22e8db53924163ad5dab2a8bfb78c",
  "uncompressedBytes": 2653233,
  "uncompressedSHA256": "d23fc4371477397c49378352fdb66194f8368ce5e33e616b8c8020588fccd8f5",
  "chunkBytes": 49152,
  "manifestSHA256": "21064669e6902e3790933bc352a73b87320755021115099151a2136931471847",
  "chunkCount": 24
});
export function readWenhua493Gzip(){return readVerifiedChunkedGzip(new URL('../fixtures/r158-wenhua-gate-integration/world-493-before.json.gz',import.meta.url),WENHUA_493_GZIP_PIN);}
