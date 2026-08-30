# Roster Pay Premium V6.5 — Month Boundary Fix (Tested)

The user-reported V6.4 failure was reproduced exactly:
- Çağlar August roster: 117:40 Duty / 26:44 Night.

Cause:
- PDF.js can return `Jul. 31` as one text item.
- V6.4 incorrectly used the numeric date list index as the weekday column.
- Because 31 was missing from that numeric list, August 1 shifted left into the
  July 31 cell and inherited the previous-month overnight flight.

Fix:
- Weekday/calendar column is now derived from the actual X coordinate of each
  numeric date header, not from its array position.

Browser-like span regression tests all PASS:
- July 2026: 145:18 Duty / 20:33 Night
- August 2026: 137:33 Duty / 11:13 Night
- September 2026: 111:03 Duty / 09:05 Night
- Çağlar August roster: 112:22 Duty / 21:46 Night

Critical tests:
- Çağlar Aug 1: 10:40→16:02 = 05:52, no July 31 bleed
- Aug 30 activated standby: 11:50, 1 sector
- Sep 22: 05:25, 2 sectors
- Sep 23: separate standby 02:00, 0 sectors
