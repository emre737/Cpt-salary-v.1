# Roster Pay Premium V6.9.1 — Version Label Fix

Changes:
- Visible version label corrected from accidental `V6.9.1.1` to `V6.9.1`.
- Version is now controlled from one JavaScript constant: `APP_VERSION = '6.9.1'`.
- Header badge, footer, PDF footer, exported PDF filename and status text all use the same source.
- Calculation/parser logic is unchanged from the tested V6.9.1 overnight-standby hotfix.

Regression checks:
- JavaScript syntax: PASS
- Sep 15 overnight standby: 21:00→05:00 = 02:00 duty
- Sep 16 fresh duty: 05:00→10:00 +00:30 = 05:30 duty, Night 01:00, 2 sectors
- Aug 30 same-day activated standby remains 11:50, 1 sector
- Sep 22/23 overnight flight + separate standby remain correct
