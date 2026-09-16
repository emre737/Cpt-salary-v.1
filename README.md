# Roster Pay Premium V6.9.1 — Overnight Standby Split Hotfix

Tested against the actual uploaded September 2026 roster.

Fix:
- Same-day standby activation remains combined.
- If standby starts on one calendar day and activation Report occurs after midnight
  on the next day, the roster is split:
  - previous day = standby-only
  - current day = fresh normal duty from activation Report to final Release

Actual September 15/16:
- Sep 15: 21:00 → 05:00 STBY = 02:00 duty, Night 00:00, 0 sectors
- Sep 16: 05:00 → 10:00 Duty +00:30 = 05:30 duty, Night 01:00, 2 sectors

Regression PASS:
- Aug 30 same-day activated standby remains combined: 11:50 duty, 1 sector
- Sep 22 overnight flight remains 05:25, 2 sectors
- Sep 23 separate standby remains 02:00, 0 sectors
