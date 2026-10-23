# 乾清门中央后廊一格天花：有界修正，非整门验收

Official source: https://www.dpm.org.cn/explore/building/236473.html
Image actually viewed: https://img.dpm.org.cn/Uploads/Picture/2020/11/17/s5fb36b5c36cf3.jpg
SHA-256: 16d30e5d2fc0f5003a8d2261078ec79069fd3bcb254e7deff3c0a21dbc03d38c.
Photography date unknown; URL date is not the photography date. Source pixels are
not included in runtime textures or redistributed in the release.

The photograph shows a green square frame grid and blue/gold painted cells
immediately above the retained rear-eave nameboard. The actual prior geometry
shows dense exposed rafters. Only the central rear porch bay is changed:
x [-3.73,3.73], z [3,9], panel y8.3, batten underside8.18. These dimensions and the
9×7 subdivision are fits inside the existing measured/model shell, not a survey
or a counted full photographic ceiling. Unobserved side/end bays remain unknown.

The new 256×256 original procedural texture uses plain circle-and-border color
zones. It does **not** reproduce the photographed dragon/figurative painting.
That fine-paint difference remains open rather than being represented as done.
No source-photo pixels, new lights, or furniture are added.

All original triangles, attributes, metadata, and the final south-window03 shape
are retained exactly. Added:218 triangles,2 materials,1 texture,19 actual thin-panel
and batten collision boxes. No floor/walkable/rescue support is added. The panel
proxy is thin and the recess below it remains empty, not one blanket low box.
All new geometry is below the old roof; the normal production FlightEnvelope is
unchanged. The existing controller's body-top inset remains eyeY−.05; this work
does not claim to repair artificial elevated upward head sweeps or alter physics.

Evidence: reports/r61-d-stage/porch-coffers-01/ contains same-camera actual
CPU geometry previews and source hashes. The ceiling diagnostic was viewed.
This is not browser/WebGL PBR/shadow/GPU/mobile acceptance.

Validation: tests/r61-qianqing-porch-coffers.test.mjs 7/7, including exact original
triangles,63 actual panel rays, real collider limits, disposal, FlightEnvelope,
and an already-built-world consumer with a missing-proxy negative probe.
Full D-world inspection remains pending. Earlier red logs are retained. Four
old south-window-only whole-gate invariants now fail because this later change
adds the explicitly enumerated ceiling; the original tests were not weakened or
counted as passing. Successor retention proves old geometry exact and the finite
new physical delta. See qianqing-window03-historical-after-coffers.txt.
