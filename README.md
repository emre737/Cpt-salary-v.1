# V6.7 — Month Carry-In / Carry-Out (Tested)

Month-end:
- Last-day duty crossing into next month is cut at 24:00.
- No post-flight is added to the old month.

Next-month carry-in:
- If day 1 starts with XQ/DH/SB/SIM continuation and Release but no Report,
  the new month creates a synthetic 00:00 carry-in duty.
- Flight/DH/SIM carry-in gets +00:30 post-flight at its real Release.
- Night is calculated normally in the new month.
- Standby carry-in remains 25% and gets no Night.

User example:
- Aug 31: 19:50 -> 24:00 = 04:10 Duty, no post-flight.
- Sep 1: 00:00 -> 01:55 +00:30 = 02:25 Duty, Night 01:25.

Regression tests PASS.
