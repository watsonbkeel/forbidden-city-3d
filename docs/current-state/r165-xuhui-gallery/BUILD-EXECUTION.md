# Complete build execution and limits

The locked complete output was built from a8de58573d5c1178ec9fe41484e58410628ab0fe with Node v24.22.1 and installed Vite 5.4.21. Runtime/build inputs, minification, target, chunk semantics, package lock and Vite configuration were unchanged.

The successful resource settings were:

```sh
GOMAXPROCS=2 GOMEMLIMIT=192MiB VITE_BASE=/forbidden-city-3d/ \
  node --max-old-space-size=768 --max-semi-space-size=16 \
  node_modules/vite/bin/vite.js build --outDir "$NEW_EMPTY_SIBLING_OUTPUT"
```

The recorded execution also imported a memory-only observer that wrote process.memoryUsage, v8 heap limit and resourceUsage every250ms. It did not change build hooks, source or output. Direct Vite is equivalent to the package's sole `build: vite build` script, with no skipped pre/post hooks, and removes the npm parent. Every output target was new and empty. Only the final complete output and verified identity are admitted.

Eight earlier terminal attempts remain in BUILD-EXECUTION-RECEIPTS.json. Seven were Killed/SIGKILL-style outcomes without an identified sender or proven kernel OOM. The separate512MiB attempt explicitly exhausted V8 heap and aborted. Decreasing Node young-space and removing npm reduced observed resource overhead but did not independently complete a build.

Read-only execution analysis located the final pressure in the esbuild service stage: Node CPU/heap had plateaued while Go RSS grew. Go1.20.12 supports GOMEMLIMIT in that service mode. The only changed setting from the immediately previous failed run to the successful run was GOMEMLIMIT=192MiB. The sampled esbuild maximum fell from291,764KiB (284.93MiB) to222,288KiB (217.08MiB), and the complete build passed. GOMEMLIMIT is a soft Go-managed-memory target, not a hard RSS cap; exceeding192MiB RSS is expected.

These250ms samples are not exact instantaneous peaks, individual process maxima need not coincide, and child-tree totals exclude observers/ancestors. The result supports execution memory-pressure mitigation, not proof of the prior SIGKILL cause, a production memory/FPS/thermal improvement, or a fix for the separate Chuxiu incident.

Complete build identity is BUILD-IDENTITY.json: R164-aba2a766422d, actual sourcea8de58573, sourceDirty=false, source fingerprint92f65a5350b67ef27d102a1747a01afdd479b71e8e71db06ecad1bbfd768831c. The subsequent documentation commit does not replace that actual build source. All137 files/44,796,662 bytes/92textures pass real Pages-base local HTTP status/MIME/hash comparison. Entry JavaScript is actually6,425,408 UTF-8 bytes; Vite's displayed6148.12kB is not substituted for this byte count. The inherited large-chunk warning remains.
