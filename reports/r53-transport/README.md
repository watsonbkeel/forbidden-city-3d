# Exact report/fixture transport

Run `node scripts/r53-restore-report-archives.mjs` to verify all containers without writing. Add an empty destination directory to restore the exact original raw JSON files under their versioned report paths. The index gives ordered per-part SHA-256, compressed and original lengths/SHA-256. Parts are binary, not base64, and at most120000 bytes. Corrupt, missing or reordered data fails before any output write. Different existing output is never overwritten.

The three world checkpoints are also explicit QA fixtures for concentrated continuation/consolidation. Their readers concatenate, validate, decompress and verify the original bytes before JSON parsing. Their original `success:false` outcomes are retained. Large raw duplicates and regenerable model dumps are not included. Six directly viewable PNG diagnostics remain included. This is a test-fixture/report storage change, not a claim that compressed containers have original JSON blob bytes.
