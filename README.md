# Roster Pay Premium V6.9.4 — Privacy Dashboard

## Visible UI changes
- Selected airplane/sunset/sea logo kept in the header and Safari Add to Home Screen icon.
- Seniority selector shows only experience ranges; base salary is no longer displayed.
- PDF filename/size/modified time/PDF ID detail card removed from the UI. The fresh-file byte snapshot and fingerprint logic remains in the background.
- “Ek ödeme durumu” and all visible hourly-rate / threshold explanations removed.
- “Kazanç dağılımı” and detailed compensation-line breakdown removed.
- Replaced with privacy-safe activity visuals: duty-type donut, roster counts, Night/Duty ratio.
- Layover summary shows days only, not monetary amounts.
- Calculation parameters remain in background JavaScript and continue to drive the total estimate.

## PDF redesign
- Cleaner first page with new brand icon, total estimate, KPI cards, duty-type donut and time bars.
- No base-salary amount, hourly rates, pay thresholds, source PDF metadata, or compensation-by-line breakdown.
- Settings show seniority range only.
- Page 2 keeps the detailed daily duty table.

## Tests
- JavaScript syntax PASS.
- Latest September regression PASS:
  - Sep 15 STBY 21:00→05:00 = 02:00
  - Sep 16 Duty 05:00→10:00 = 05:30, Night 01:00, 2 sectors
  - Sep 22 / Sep 23 PASS
- Same-day activated standby synthetic regression PASS.
- PWA icon / manifest references PASS.
- Privacy UI static checks PASS.

Note: Because GitHub Pages is client-side, calculation constants remain technically inspectable in JavaScript source; this release removes them from normal UI and PDF output, not from source code.
