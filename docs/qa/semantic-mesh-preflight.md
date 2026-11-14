# Semantic mesh preflight: deliberately limited developer QA

Base/rollback: R379 `7feaaca1b6bb34d456f87b90f7bf4a872add703f`. This addition changes no runtime model, asset, default, deployment or original build/browser resource guard. It is not the completed three-Buddha art deliverable.

## Usage

Python 3, standard library only:

```sh
python3 tests/semantic-preflight/test_preflight.py
python3 scripts/qa/semantic_mesh_preflight.py source-mesh.json
```

Input: indexed **source topology**, `positions` flat XYZ and `indices` flat triangle indices. Do not feed a render mesh split at UV seams and then weld it merely to pass this tool. Units are metres in the existing isolated side-study local frame, +Z front. The scope is NOT arbitrary scenes or arbitrary scales.

Exit 0 means only the stated checks passed; 1 is a mesh rejection; 2 is an input/usage error. Reports produced after successful input parsing and preflight state artAcceptance, selfIntersection and renderNormals as NOT_TESTED. Read/parse failures return INPUT_ERROR and do not establish any acceptance.

Checks: bounded finite coordinates, integer index range, 20,000 vertices / 10,000 triangles, duplicate and degenerate faces, two faces per edge, coherent winding, one connected component, no unreferenced vertices, positive signed volume and a single cyclic vertex link. CLI file limit is 8MiB.

Support uses the **lowest intersection on the entire vertical line** at x=-.4,-.2,0,.2,.4 and z=.08. Current scaled lotus **core** top is .8037370443344116m. The accepted gap is -0.04 < bodyY-coreY <= .001m. Petal tips are not the support plane. The original source registration y928 maps to .800m, not the older prototype's manually lowered .795m. This plane and five samples are fixture-specific constraints, not proof of whole-footprint contact or historical dimensions.

## Regression coverage and provenance

Ten test methods cover a supported closed fixture, open/duplicate/reversed/degenerate faces, malformed/NaN/bool/noninteger input, a floating body, triangle budget, huge integer rejection, disconnected/global-inward geometry, a buried body's false top-surface support, shared-vertex nonmanifold shells and CLI huge/deep JSON. A readonly sandbox cannot create the CLI's temporary fixture; run in a writable development/test workspace. No test mutates project assets.

The initial implementation failed three independent negative cases: huge integer OverflowError, truncated-ray false support and vertex-pinched shells. Tests were observed failing before correction. Independent retest passed after correction. A retained local failed research mesh still rejected 255 duplicate faces, 446 bad edges and five floating supports. The failed art meshes are NOT introduced into the product by this QA branch.

A different 160-vertex/316-triangle research cage passed these limited geometric checks but failed independent normal-scale art review. This is a deliberate example of why `passed` cannot mean art acceptance or release readiness.

## Non-goals and limitations

No full triangle self-intersection proof, coplanar-overlap proof, UV/material validation, render-normal validation, anatomical validity, source-art semantic interpretation, final silhouette fit, whole-body hand/collision test, GPU/mobile/routes or complete-project acceptance. Coordinate-coincident geometry with distinct indices must be assessed separately. No auto-repair, smoothing, budget expansion or downloading occurs.

The accompanying one-shot hosted workflow runs only these dependency-free tests, timeout 120 seconds. It does not invoke a browser/build or replace the project's existing 6GiB/720-second guarded workloads. Existing R379 product CI evidence remains historical, not automatically rerun or generalized to art acceptance.
