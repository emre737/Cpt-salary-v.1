# Roster Pay Premium V6.9.6 - SFI Manual Adjustment Cleanup

Changes
- Removed the separate **SFI özel credit** input from the interface.
- Removed the day-based SFI override parser/calculation path (for example `24=03:30`).
- Exceptional SFI/TRI totals are now adjusted only from **Manuel kontrol → TRI/SFI toplam credit**.
- Normal SFI/TRI automatic calculation is unchanged:
  - recognized SIM aliases remain 06:00 per session;
  - existing flight-training credit behavior remains unchanged.
- Duty/Night parser and Duty calculation are unchanged.
- Existing SFI SIM aliases remain supported:
  - BOEING-...
  - GOZEN with optional A/B/C/D
  - GOZENAYT with optional A/B/C/D
  - AYTGOZEN with optional A/B/C/D
  - SXS-FTD / SXSFTD / SXFTD with optional A/B/C/D

Tests
- JavaScript syntax check PASS.
- No remaining `sfiCreditOverrides`, `sfiOverrideField`, or `parseSfiCreditOverrides` references.
- Manual `triEdit` field remains present and continues to feed pay calculation.
