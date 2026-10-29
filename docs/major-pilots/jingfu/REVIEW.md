# Independent review

Read-only reviewer `review_yangxing` inspected the own official source text and7411 image before implementation. Confirmed front-gallery subject, hall wall at image right/courtyard left; warned against reading the oblique photo as measured elevation or as interior imagery. Those limits are recorded in source metadata.

Final review independently reran **7/7 geometry tests**, inspected all five `candidate-complete` views, and found no newly introduced blocker. Specifically checked south-only ceiling extent, south-only column palette, unchanged actual door width/walkables, and physical envelopes of plain base shoulders.

Implementation red/green work caught the initial added shoulder's missing physical envelope; fixed with actual cylinder geometry bounds. The first CPU capture happened during that correction and was correctly rejected by runtime fingerprint guard; retained but not accepted. Replacement capture and all three code-only builds share the final fingerprint.

Review acceptance is scoped to this south gallery candidate and tests, not historical art, the entire Jingfu hall, or browser/GPU acceptance. Lotus carving, Su-style paintings, precise original grid inventories and unseen rooms remain unimplemented/unverified.
