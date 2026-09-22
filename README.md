# Roster Pay Premium V6.9.8 — Special SFI Credit Removed

- Removed `SFI özel credit` from the visible UI and its override logic.
- Exceptional SFI corrections are handled only through:
  `Manuel kontrol → TRI/SFI toplam credit`.
- Normal recognized SIM session credit remains 06:00.
- GOZEN / GOZENAYT / AYTGOZEN / SXS-FTD / BOEING recognition is unchanged.
- RSV0–RSV4 remain RSV with 00:00 Duty and 00:00 Night.
- Ordinary STBY remains 25%.

Tests:
- JavaScript syntax PASS.
- Special SFI field/code removed PASS.
- Manual TRI/SFI total-credit field preserved PASS.
- V6.9.7 → V6.9.8 exact Duty/Night regression PASS:
  Duty 133:05, Night 11:40.
- Sep 29 RSV3 remains 00:00 Duty / 00:00 Night PASS.
- Sep 24 GOZENC remains recognized, normal SFI credit 06:00 PASS.
- RSV0–RSV4 and STBY 25% synthetic regression PASS.
