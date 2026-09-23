# Roster Pay Premium V6.9.11 — All-SIM Overnight Continuation Fix

This release generalizes the overnight SIM continuation protection to every recognized SFI SIM alias.

Recognized families covered:
- BOEING-...
- GOZEN / GOZENA-B-C-D
- GOZENAYT + optional A/B/C/D
- AYTGOZEN + optional A/B/C/D
- SXS-FTD / SXSFTD / SXFTD + optional A/B/C/D

Rule:
- A start line such as `GOZENAYTB 23:30 ~` counts as one SIM.
- The next-day continuation line such as `GOZENAYTB ~ 03:30` does NOT count as a second SIM.
- Different session aliases such as A and B still count separately.
- Normal single-day sessions remain unchanged.

Duty/Night:
- No Duty or Night calculation rule changed.
- Actual October remains Duty 121:50 / Night 27:50.
- Oct 20 remains Duty 10:40 / Night 05:00.
- Training days 18,19,20 remain correct at TRI/SFI 18:00.

Regression:
- JavaScript syntax PASS.
- All recognized SIM alias families tested with overnight start/continuation PASS.
- Distinct A/B sessions remain separate PASS.
- Actual October roster PASS.
- All previously collected roster PDFs pass exact Duty/Night/row regression against V6.9.10.
- Existing RSV, STBY, Off to Duty 400 EUR, GOZEN aliases, privacy UI remain unchanged.
