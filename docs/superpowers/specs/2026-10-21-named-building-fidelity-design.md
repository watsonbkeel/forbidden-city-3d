# Named-building interior and exterior fidelity registry

## Intent and completion boundary

The user asks for every named palace/building's interior layout and exterior to be updated from Palace Museum evidence, not more generic copies. This is a multi-batch reconstruction program. The registry makes the complete named model scope explicit and prevents a small first batch from implying completion of all buildings.

The initial inventory contains 89 named renderable building identities: 83 existing catalog buildings, 恒寿斋, and five procedural garden pavilions. It is not a census of all physical buildings in the real museum. Gates, historical gate sites, region duplicates, and nonbuildings retain existing catalog behavior. The 44 unnamed hall records are tracked as auxiliary geometry when evidence connects them to a named complex; they do not become 44 invented named places.

## Data and runtime boundaries

A new `data/architecture/building-fidelity.json` stores stable model identity, nullable catalog ID, scene binding, model name, and separate interior/exterior records. Each record distinguishes:

- implementation class: generic placeholder, dedicated partial profile, optional asset overlay, or withheld geometry;
- evidence status: unknown, identity-only, specific sourced topology, or photo-relative fit;
- selected target state and whether the source is historical, restored display, dated museum installation, or undated;
- individual source claims with official URLs, never a source list implying every mesh was measured;
- dimension status and unresolved features;
- implemented changes, validation scope, and unaccepted visual/native/GPU state.

The read-only inventory remains a baseline document, not runtime truth. The runtime registry is slim, curated, and updated with actual production changes. Existing correct dedicated profiles are retained and labeled partial, not downgraded to generic or falsely certified complete. Existing generic throne geometry remains explicitly unverified unless evidence supports replacement, e.g. the approved Fengxian purpose correction.

A small validated lookup module supplies status text to `PlaceInfoPanel` by existing place ID. A short '模型复原状态' section reports exterior and interior independently. It adds no catalog entries, teleport targets, routes, permissions, or exhibition access claims. Buildings without cards remain tracked in data and tests, not given fabricated cards. UI text is rendered as text, not HTML.

Geometry remains controlled by explicit per-building builders and opt-in data fields. The registry is not an interpreter for arbitrary geometry instructions. It can reference a implemented profile and its source claims but cannot silently furnish a building by selecting a generic template.

## First implementation batch

Already scoped first patches: Wenhua dated corridor support incline/screen framing; Fengxian unsupported audience-throne suppression with explicit unreconstructed ritual layout. Wuying rear equipment remains pending reliable run mapping.

Next: six source-attested rear hard-gable roofs. Four unnamed east rear halls are bound to 景仁/承乾/钟粹/永和 by their existing coordinate/item identities. Existing named west rear halls remain named 储秀宫后殿 and 咸福宫后殿 for navigation, with attested names 丽景轩/同道堂 retained as evidence. Width/depth/height remain model fits. A strict opt-in roof-end profile must create flush gable end planes instead of merely renaming the existing overhanging gable approximation.

## Tests and acceptance

- Exact 89 identity coverage and 83 catalog-ID bindings; no duplicate stable binding.
- Every evidence claim identifies its limited scope and official source; identity sources alone do not certify interior/exterior geometry.
- Existing 159 place count and seven identity uncertainties remain unchanged.
- UI status is distinct from historical facts and current site access, and appears for generic as well as partial dedicated buildings.
- Six roof opt-ins are exact; malformed/transplanted profiles fail early. Ordinary roofs remain geometry/material/navigation equivalent.
- Real generated roof-end bounds, source-scoped corrections, physical routes, merged geometry and resource disposal are tested.
- Full current and historical suites compare against explicit known failures. No native/GPU/phone visual acceptance claim is made without actual execution.

## Deferred, not complete

Yonghe baoxia, distinct ceiling/facade details, west-palace partitions, Ningshou multi-storey and asymmetric plans require bounded per-building designs. They remain visible unfinished work. No fabricated furniture, painted motifs or historic inventory is added merely to fill a room or mark an entry complete.
