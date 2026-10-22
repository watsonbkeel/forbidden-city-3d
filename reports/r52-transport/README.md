# R52 report transport

Some report-only JSON and exact red logs are stored as gzip. The chronological
patrol motion gzip is stored in two binary parts, each no larger than120,000bytes.
No production source or automatic test fixture is compressed by this transport index.

Verify all parts, order, compressed hashes and original bytes without writing:

    node scripts/r52-restore-report-archives.mjs

Restore the original report paths to a new directory, or to the repository root:

    node scripts/r52-restore-report-archives.mjs /absolute/new/report-directory
    node scripts/r52-restore-report-archives.mjs .

Existing files with different bytes are never overwritten. Every original JSON
and log SHA is recorded in ARCHIVES.json. The publication's original JSON can be
restored to make its original relative links and PUBLICATION-MANIFEST checks work;
the published CSV files remain directly readable and byte-identical, including CRLF.

Large intermediate mesh-buffer exports are omitted from this release tree, not
silently represented as identical smaller files. Their original sizes, hashes and
frozen local source commits are recorded under omittedGeneratedGeometry. They are
not automatic test inputs. All final PNGs, motion rows, per-view verification,
source/shape contracts, silhouette comparisons and red evidence are retained.
Re-exporting timing-dependent snapshots can produce different raw bytes.

Tests verify lossless restoration against the original75820ca commit where the
file was already committed, and fail closed on missing, reordered or corrupt parts.
The final unified report was generated after that commit and is verified against
its exact pre-compression SHA. No old fixture expectations were regenerated.
