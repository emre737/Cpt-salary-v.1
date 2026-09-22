# Roster Pay Premium V6.9.9 — Off to Duty 400 EUR

Change
- Off to Duty amount updated from 330 EUR/day to 400 EUR/day.

No other calculation or UI logic was changed from V6.9.8.

Tests
- JavaScript syntax PASS.
- Off to Duty:
  - 0 days = 0 EUR
  - 1 day = 400 EUR
  - 2 days = 800 EUR
  - 5 days = 2,000 EUR
- Exact index.html comparison confirms only version and Off to Duty rate changed.
- RSV zero-duty and SFI alias logic still present.
