# Roster Pay Premium V6.9.2 — Fresh PDF Verification

Same-filename iPhone/Safari hardening:
- File input is cleared before every picker open so selecting the same filename fires a new change event.
- The selected PDF bytes are read immediately and frozen in memory.
- Parsing uses the frozen byte snapshot, not a later live File reference.
- Old results/state are cleared as soon as a new PDF selection starts.
- Filename, size, local last-modified time, and a content-based SHA-256 PDF ID are shown.
- PDF report includes source PDF filename and PDF ID.

Tests:
- Same filename + different bytes => different PDF IDs.
- Latest uploaded September roster:
  - Sep 15 STBY 21:00→05:00 = 02:00
  - Sep 16 Duty 05:00→10:00 + post-flight = 05:30, Night 01:00, 2 sectors
  - Sep 22/23 overnight regressions unchanged
- JS syntax check PASS.
