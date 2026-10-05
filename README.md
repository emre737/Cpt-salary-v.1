# Roster Pay Premium V6.10.1 — FO Real Roster Tested

Actual First Officer roster tested: September 2026.

Results
- Duty: 156:59
- Night: 13:44
- Extra sectors: 4
- Domestic layover equivalent: 9.0 days
  - DLM Sep 8–12: 5.0
  - ONQ Sep 16–17: 2.0
  - ONQ Sep 22–23: 2.0
- International layover: 0.0

Estimated EUR total with Off to Duty = 0:
- FO 0–1: 7,101.31
- FO 2–3: 7,321.31
- FO 3–4: 7,551.31
- FO 4–5: 7,771.31
- FO 5+: 7,991.31

Narrow fix found during real-roster testing
- Layover outbound search said "same day first" but actually sorted the previous day first.
- This incorrectly attached the Sep 22 ONQ stay to Sep 21.
- V6.10.1 now checks the hotel day first, then the previous day.
- No Duty/Night/parser rule was changed.

Regression
- JavaScript syntax PASS.
- Actual FO roster PASS.
- Captain Duty/Night/parser exact regression PASS across 20 historical roster PDFs.
- Source diff scope PASS: only version + layover candidate ordering changed.
