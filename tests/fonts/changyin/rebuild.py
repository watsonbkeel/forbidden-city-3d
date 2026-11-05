#!/usr/bin/env python3
"""Developer-only deterministic rebuild. CI uses the committed OTF, not Python."""
import argparse
import hashlib
import io
import json
from pathlib import Path

import fontTools
from fontTools import subset
from fontTools.pens.recordingPen import RecordingPen
from fontTools.ttLib import TTFont

SOURCE_SHA256 = "5d9c31a059600193c9d7968a998bde886ccdc77e934006ad243b41794c496a7d"
SUBSET_SHA256 = "fbad0a8d2bd81170a66ef7a1094548fcd250a2034b60581fa193d6d717af1c24"
CHARACTERS = " 壺天宣豫導和怡泰"

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("source", type=Path, help="Unmodified NotoSerifCJK-Regular.ttc 2.003")
parser.add_argument("output", type=Path)
parser.add_argument("--omit", choices=list(CHARACTERS[1:]), help="Developer missing-glyph negative only")
args = parser.parse_args()
assert fontTools.__version__ == "4.61.1", fontTools.__version__
assert hashlib.sha256(args.source.read_bytes()).hexdigest() == SOURCE_SHA256
font = TTFont(args.source, fontNumber=2, recalcTimestamp=False)
assert font["name"].getDebugName(1) == "Noto Serif CJK SC"
assert font["name"].getDebugName(5).startswith("Version 2.003;")
text = CHARACTERS.replace(args.omit, "") if args.omit else CHARACTERS
source_glyphs = font.getGlyphSet()
outlines = {}
for char in text:
    pen = RecordingPen()
    source_glyphs[font.getBestCmap()[ord(char)]].draw(pen)
    outlines[char] = pen.value

options = subset.Options()
options.name_IDs = ["*"]
options.name_languages = ["*"]
options.name_legacy = True
options.layout_features = []
options.notdef_glyph = True
options.notdef_outline = True
options.recalc_timestamp = False
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=text)
subsetter.subset(font)

family = "Forbidden City Test CJK"
postscript = "ForbiddenCityTestCJK-Regular"
names = {1: family, 2: "Regular", 3: "2.003;FC3D;" + postscript,
         4: family + " Regular", 6: postscript, 16: family, 17: "Regular"}
for record in font["name"].names:
    if record.nameID in names:
        record.string = names[record.nameID].encode(record.getEncoding())
cff = font["CFF "].cff
cff.fontNames = [postscript]
cff.topDictIndex[0].FamilyName = family
cff.topDictIndex[0].FullName = family + " Regular"

glyphs = font.getGlyphSet()
for char in text:
    pen = RecordingPen()
    glyphs[font.getBestCmap()[ord(char)]].draw(pen)
    assert pen.value == outlines[char], "Changed source outline: " + char
assert set(font.getBestCmap()) == {ord(char) for char in text}
output = io.BytesIO()
font.save(output, reorderTables=True)
data = output.getvalue()
digest = hashlib.sha256(data).hexdigest()
if not args.omit:
    assert len(data) == 7192
    assert digest == SUBSET_SHA256, digest
args.output.write_bytes(data)
print(json.dumps({"bytes": len(data), "sha256": digest, "characters": text,
                  "omitted": args.omit, "sourceOutlinesUnchanged": True,
                  "fontTools": fontTools.__version__}, ensure_ascii=False))
