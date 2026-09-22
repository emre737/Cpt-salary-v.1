# Roster Pay Premium V6.9.7 — RSV Zero Duty

- RSV0/1/2/3/4 are now a separate `RSV` type, not STBY.
- RSV is shown as RSV in the result table, activity summary/chart and exported PDF.
- RSV contributes 00:00 Duty regardless of scheduled Report/Release duration.
- RSV contributes 00:00 Night.
- Ordinary SB standby is unchanged and still credits 25%.
- SFI SIM alias and special-credit logic is unchanged.

Latest uploaded roster (`schedule-2026-9(8).pdf`) regression:
- Sep 29: Report 07:00, RSV3 07:00–17:00, Release 17:00.
- Result: RSV / Duty 00:00 / Night 00:00 / Sector 0.
- V6.9.6 total Duty: 135:35.
- V6.9.7 total Duty: 133:05.
- Monthly Night unchanged.
- Every non-RSV row matches V6.9.6.

Tests:
- JavaScript syntax PASS.
- Latest roster PASS.
- RSV0–RSV4 classification PASS.
- STBY 25% regression PASS.
- Existing SFI regression PASS.
