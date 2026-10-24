# Roster Pay Premium V6.10.5 — All SIM Duty Fix

Fix
- The Duty parser previously recognized only `BOEING-...` as a simulator event.
- GOZEN-family and FTD aliases could therefore miss the normal +00:30 post-SIM duty component when no flight/DH was present.
- Duty and SFI/TRI now share the same controlled simulator alias family:
  - BOEING-*
  - GOZEN A/B/C/D
  - GOZENAYT A/B/C/D
  - AYTGOZEN A/B/C/D
  - GOZENS#-* (including GOZENS2-B)
  - SXS-FTD / SXSFTD / SXFTD variants

Real November 2026 validation
- Nov 1 GOZENS2-B: 05:30 -> 06:00 Duty.
- Nov 29 GOZENC: remains 11:10 because the duty already contains DH and already had one +00:30 post-duty component.
- Nov 30 GOZENC: remains 09:40 for the same reason.
- Monthly Duty: 78:33 -> 79:03.
- Monthly Night: 05:10 unchanged.

Regression
- JavaScript syntax PASS.
- Synthetic tests PASS across 8 simulator alias variants.
- Overnight BOEING/GOZEN continuation is not double-counted.
- SFI/TRI session counts for existing aliases are unchanged.
- 22 real roster PDFs compared against V6.10.4.
- Only 3 files contained newly recognized GOZEN Duty aliases; only the November roster changed total Duty, exactly +00:30.
- July baseline remains 145:18 / 20:33.
- October BOEING overnight baseline remains 121:50 / 27:50.
- Çağlar month-boundary baseline remains 112:22 / 21:46.
- Source-diff scope PASS: only version + shared simulator alias recognition/Duty handling changes.
