# Exact Wenhua 493 fixture transport

These 24 ordered base64 blocks preserve the original gzip byte for byte. The original file remains authoritative and preferred; corrupt originals fail without fallback. Only an absent original selects the verified blocks. No tests, collision records, supports or negative controls are removed.

Regenerate outside the fixture directory using `python3 scripts/qa/generate-chunked-gzip.py --input /path/to/world-493-before.json.gz --output /tmp/new-wenhua-blocks`. Verify all identities before reviewing any change. Manifest hash pinning is not a private-key signature.

- format: `1`
- filename: `world-493-before.json.gz`
- originalGitBlobSHA1: `55e6b97d1fcec6b03242491bb9da42b647e8de8e`
- compressedBytes: `1172255`
- compressedSHA256: `dbca3c3fd71b922551749e09f2bf1a2162e22e8db53924163ad5dab2a8bfb78c`
- uncompressedBytes: `2653233`
- uncompressedSHA256: `d23fc4371477397c49378352fdb66194f8368ce5e33e616b8c8020588fccd8f5`
- chunkBytes: `49152`
- manifestSHA256: `21064669e6902e3790933bc352a73b87320755021115099151a2136931471847`
- chunkCount: `24`

A remote backup may physically omit the original only when every block, manifest, attributes and the verified reader/pin are included and the omission is explicitly recorded. The original local gzip must be retained. This does not make the QA physical tree an exact mirror or the full scene accepted.
