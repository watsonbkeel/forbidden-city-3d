import {readVerifiedChunkedGzip} from './r157-verified-chunked-gzip.mjs';
export const WUYING_55_GZIP_PIN=Object.freeze({
  "format": 1,
  "filename": "world-55-before.json.gz",
  "originalGitBlobSHA1": "ef2c3842a19a46a5171d67224b6e27577b7bce8e",
  "compressedBytes": 2245512,
  "compressedSHA256": "8c5a33000cd0997cd2fee29ee64db747a3c025a93e28d9dd6701f0d6f26d252f",
  "uncompressedBytes": 4503318,
  "uncompressedSHA256": "f1c8ba0007a0540e51a9c50a9a9fcca40933e8e1e6e3eb3715df9c066290e031",
  "chunkBytes": 49152,
  "manifestSHA256": "a85b74faa63832bd6328cb930504b0b9ec84276b30e2329bce79a3dd255d0a36",
  "chunkCount": 46
});
export const readWuying55Gzip=(file=new URL('../fixtures/r158-wuying-integration/world-55-before.json.gz',import.meta.url))=>readVerifiedChunkedGzip(file,WUYING_55_GZIP_PIN);
