# Roster Pay Premium V6.11.1 — TK-SIM Support

Based directly on V6.11.0.

## New simulator family
Recognizes:
- TK-SIMA / TK-SIMB / TK-SIMC / TK-SIMD
- Slot suffixes `-1`, `-2`, `-3`, `-4`
- Roster text with a space (`TK SIMC-2`)
- Hyphenated form (`TK-SIMC-2`)
- Compact form (`TKSIMC-2`)

The A/B/C/D letter and 1/2/3/4 number are treated only as simulator slot identifiers.

## Rules
- Same Duty treatment as BOEING / GOZEN / GOZENAYT / AYTGOZEN / SXS-FTD.
- Standard 4-hour simulator duty with the normal briefing/post-SIM treatment = 06:00 Duty.
- Same Instructor rule: 06:00 Instructor Credit per recognized session.

## December 2026 real-roster validation
- Dec 5 `TK SIMC-2`: old 05:30 -> new 06:00 Duty.
- Dec 7 `TK SIMB-3`: recognized as SIM; Duty duration remains unchanged because DH already caused the existing +00:30 post-duty credit.
- Total December Duty: 118:17 -> 118:47.
- December Night: 07:10 unchanged.
- Instructor Duty Days 5,7,19: 18:00 Instructor Credit.

## Regression
- JavaScript syntax PASS.
- Exact source diff PASS: only version, SIM regex and an internal comment changed.
- 26 previously supplied roster PDFs remain numerically identical to V6.11.0.
- 10 TK-SIM format variants tested.
