# R62-E Yonghe canopy shoulders: partial only

The original local builder has four round front columns and a straight front beam but no curved beam-column shoulder solids. Both official photographs were actually viewed. This change adds only six short, plain curved shoulders, fitted as pairs in the three existing open bays. It does not duplicate or change the old canopy shell, rounded roof, 208 retained rafter segments, columns, nameboard, doors, physics or furnishings.

See report.json for sources, reference hashes, numerical FIT disclosures, exact preserved-geometry proof, limitations and the two-line owner hook. No official image bytes are stored here. The before/after PNG files are CPU diagnostics generated from the actual local production meshes, albedo/UV and plaque atlas, not browser visual acceptance. The source fixture is original project JavaScript, not an official photograph.

Verification: node --test tests/r62-yonghe-canopy-knees.test.mjs. After the owner inserts the import and call, require the actual production route with R62_REQUIRE_YONGHE_HOOK=1 node --test tests/r62-yonghe-canopy-knees.test.mjs. Baseline tests always load the SHA-checked R61 original builder, so inserting the real hook will not make the baseline accidentally contain the new shoulders.

Only front shoulder silhouette and basic color are implemented. Fine carving, painted subjects, hidden framing, exact repeated corner pattern and measured dimensions remain unknown. Lowest new edge is 5.3488 m above the platform, outside tested standing and jumping envelopes. No full-world, browser or broad aggregate suite was run.
