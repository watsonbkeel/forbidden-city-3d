# R98 rejected surface evidence

All PNGs are deterministic CPU rasterizations of this project's actual production/candidate triangles and existing rock albedo. They are not GPU screenshots, official source photographs or user screenshots. No official images are included.

- baseline/rear-before-textured.png: original rear diagnostic with the inherited front-facing light.
- baseline/rear-before-directional.png vs rear-v2/rear-after-directional.png: same rear camera and same rear-facing light; one permitted deeper geometry candidate, rejected as artificial grooves/low route-view value.
- baseline/left-side-before.png vs material-v1/left-side-after.png and baseline/route-before.png vs material-v1/route-after.png: same cameras/light, one UV/color trial, rejected for coarse/blurry close texture and inconsistent scale.
- checks/: original RED/GREEN structural evidence and preliminary CPU cost, not production approval; final-retention.tap verifies shipped R96 runtime is restored.
- rejected-fixtures/: non-active historical code; reproduce under the commits identified in docs/current-state/r98/EXPERIMENT-RESULT.md, not by importing archived relative paths as current runtime.

Additional raw geometry/images remain in the implementer's local evidence directories. None of these experiments were hooked into production GardenBuilder. R98's rear/support-wall completion goal remains unmet.
