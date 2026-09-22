# Roster Pay Premium V6.9.5 - SFI SIM Alias + Override

Changes
- Duty/Night parser and Duty calculation are unchanged.
- New aliases affect only SFI/TRI extra credit:
  - BOEING-...
  - GOZEN with optional A/B/C/D
  - GOZENAYT with optional A/B/C/D
  - AYTGOZEN with optional A/B/C/D
  - SXS-FTD / SXSFTD / SXFTD with optional A/B/C/D
- Added optional "SFI özel credit" field.
  - Example: 24=03:30
  - This changes only SFI/TRI credit for that training day.
- Normal recognized SIM session credit remains 06:00 per session.
- Existing flight-training credit behavior remains unchanged.

Latest uploaded roster test: schedule-2026-9(7).pdf
- Sep 24 contains GOZENC 14:30-16:30 and is recognized as an SFI SIM alias.
- Sep 24 Duty stays 07:55 -> 20:15 with the existing Duty rule = 12:50.
- Whole-month Duty stays 138:45.
- Whole-month Night stays 11:40.
- If day 24 is entered as an education day:
  - default SFI credit = 06:00
  - with 24=03:30 = 03:30

Tests
- JavaScript syntax PASS
- V6.9.4 vs V6.9.5 exact Duty/Night output comparison on latest roster PASS
- Actual Sep 24 GOZENC detection PASS
- All requested alias/session suffix families PASS
- PWA manifest recreated and included
