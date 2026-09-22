# Roster Pay Premium V6.9.6 — RSV Standby

Changes:
- RSV0 / RSV1 / RSV2 / RSV3 / RSV4 are parsed exactly like STBY for Duty credit.
- Standalone RSV is credited at 25%.
- If RSV is activated into an operating duty, the existing activated-standby logic is reused.
- SFI SIM alias/override logic from V6.9.5 is unchanged.

Latest uploaded roster test (schedule-2026-9(8).pdf):
- Sep 29: Report 07:00, RSV3 07:00–17:00, Release 17:00.
- Correct Duty credit: 02:30.
- Night: 00:00.
- Sectors: 0.
- All non-RSV duties matched the previous parser exactly.

Regression tests:
- JavaScript syntax PASS.
- Latest roster Sep 29 RSV3 PASS.
- RSV0–RSV4 standalone 25% PASS.
- Same-day activated RSV PASS.
- SFI GOZENC + 24=03:30 override regression PASS.
