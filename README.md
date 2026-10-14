# Roster Pay Premium V6.10.2 — COV Domestic Fix

Change
- Added COV (Çukurova International Airport) to the Turkey IATA set.
- COV layovers are now classified as domestic.
- No Duty/Night/parser/pay-rate logic changed.

Real October 2026 COV roster validation
- COV layover: domestic, 4.0 equivalent days.
- SKD layover remains international, 2.5 equivalent days.
- Auto layover summary: Domestic 4.0 days / International 2.5 days.

Regression
- JavaScript syntax PASS.
- Real COV roster PASS.
- September First Officer layover regression PASS (Domestic 9.0 / International 0.0).
- Captain Duty/Night/parser exact regression PASS across 20 historical roster PDFs.
- Historical layover results unchanged across all 20 old roster PDFs.
- Exact source diff confirms only the version number and COV entry changed.
