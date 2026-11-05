# Pinned CPU-only Changyin test font

This is a real-outline subset used only by the lower and middle Changyin
component tests. It does not change product font selection, ship in `public/`,
reconstruct original calligraphy, or establish browser/GPU visual acceptance.
The original pixel assertions and their thresholds are unchanged.

## Provenance and license

- Upstream project: https://github.com/notofonts/noto-cjk, as recorded in the
  installed Debian font package's `/usr/share/doc/fonts-noto-cjk/copyright`.
- Source file used: `/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc`.
- Source SHA-256: `5d9c31a059600193c9d7968a998bde886ccdc77e934006ad243b41794c496a7d`.
- Source collection face 2: **Noto Serif CJK SC Regular**, version
  `2.003;GOOG;NotoSerifCJKsc-Regular;ADOBE`.
- Source name-table version: `Version 2.003;hotconv 1.1.1;makeotfexe 2.6.0`.
- Source copyright: `© 2017-2024 Adobe (http://www.adobe.com/).`; the installed
  package also attributes `2010-2012, Google Corporation`. Both are preserved
  in `OFL.txt`; the original font's copyright/license metadata is retained.
- License: SIL Open Font License 1.1. The complete license is in `OFL.txt`.
  Its verified UTF-8 file size is 4,260 bytes and SHA-256 is
  `c106844fe4031b157f50d2e10c7d9e07f738cdf02295d3d3d98572d361623f92`.
  It contains the preamble, definitions, all five conditions, termination,
  and disclaimer, without the unrelated Debian packaging/GPL section.
  Name-table family/full/PostScript and CFF names are renamed to
  `Forbidden City Test CJK` / `ForbiddenCityTestCJK-Regular`, avoiding use
  of the original primary font name for the derivative.
- Source provenance here is verified from the installed font and distribution
  copyright, not a claim that an upstream download URL was fetched or verified.
  Regeneration must reject any source that does not have the hash above.

## Exact content

The committed `ForbiddenCityTestCJK-Regular.otf` is **7,192 bytes**.
SHA-256: `fbad0a8d2bd81170a66ef7a1094548fcd250a2034b60581fa193d6d717af1c24`.

The cmap contains space and exactly the eight required characters:

- `壺` U+58FA, `天` U+5929, `宣` U+5BA3, `豫` U+8C6B
- `導` U+5C0E, `和` U+548C, `怡` U+6021, `泰` U+6CF0

The source `.notdef` outline is retained. Every retained real character's
outline is checked against the source using fontTools `RecordingPen`.
There are no hand-drawn stand-in shapes. The test helper checks the exact file
hash before registration. Its `STKaiti` alias is an explicit CPU-test binding
to the first name in the existing product font list, not a claim about the
font's identity or historical calligraphy. No Python or font download is
needed to run the tests after a clone and `npm ci`.

## Rebuild (maintainer only)

Use Python with **fontTools 4.61.1** and the exact source TTC identified above:

```sh
python tests/fonts/changyin/rebuild.py /path/to/NotoSerifCJK-Regular.ttc \
  tests/fonts/changyin/ForbiddenCityTestCJK-Regular.otf
```

The script pins the source hash, fontTools version, TTC face and final hash.
It preserves source timestamps (`recalcTimestamp=False` and
`recalc_timestamp=False`), retains all original name/license records, renames
the derivative's primary names, and saves with deterministic table ordering.
The input source head created/modified values are both `3804698393`.

For a real missing-glyph negative, write outside the checkout:

```sh
python tests/fonts/changyin/rebuild.py /path/to/NotoSerifCJK-Regular.ttc \
  /tmp/changyin-missing-yu.otf --omit 豫
```

That negative is 6,608 bytes, SHA-256
`52670a20f6f5f8c303e193c84e10cbc5d27a018a1888159dd547da4893230d74`.
It must be rejected by `validateChangyinFont` before registration. Do not
replace the committed fixture or expected hash with this negative.

## Validation scope

The two unchanged component suites contain 26 tests. A CJK-free read-only
Linux mount reproduced their original `1 !== 4` pixel failures: all eight
characters rendered the same missing-glyph box (737 gold pixels), matching
U+FFFF's shape. Merely setting `DISABLE_SYSTEM_FONTS_LOAD=1` does not isolate
native canvas 0.1.100 fallback fonts; fontconfig overrides alone did not either.

With this pinned subset, all 26 original assertions pass in the same CJK-free
environment. Replacing real `fillText` calls with no drawing fails both pixel
tests at `0,0,0,0`; forcing all calls to render `天` fails both at `1 !== 4`.
These are prerequisite/pixel-oracle checks, not whole-suite or remote-CI claims.

Installing official `fonts-noto-cjk` only in CI is a smaller workflow diff,
but leaves the checkout dependent on OS packages and mutable apt availability.
To be reproducible that alternative also needs an exact available package
version/archive digest and font checks. The committed 7 KB subset removes
that CI network/system dependency without packaging a full 26 MB TTC.
