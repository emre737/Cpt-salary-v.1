# Roster Pay Premium V6.11.0 — English UI & PDF

Based directly on V6.10.5.

## User-facing changes
- Full interface translated to English.
- Removed the redundant `1. Roster PDF` section title.
- Instructor-related headings use `Instructor`.
- `Instructor Duty Days (e.g. 18,19,20,29)`.
- Warning text: `Important: Download and upload the PDF in Local Time using the CAE application.`
- English `Choose File` control is shown independently of iPhone/browser locale.
- Results dashboard translated to English.
- Existing PDF report layout/design retained; report labels and notes translated to English.
- No SunExpress branding was added. The existing independent Roster Pay brand mark remains.

## Calculation logic
No business-rule changes from V6.10.5.

## Regression coverage
- JavaScript syntax: PASS.
- SIM/parser/pair code unchanged: PASS.
- Layover detection code unchanged: PASS.
- Duty/Night numeric calculation block unchanged: PASS.
- `calcPay` unchanged: PASS.
- Exact V6.10.5 vs V6.11.0 numeric regression across 26 real roster PDFs: PASS.
- July/August/September/Caglar/October historical baselines: PASS.
- First Officer September: 156:59 Duty / 13:44 Night / 9.0 domestic layover days: PASS.
- COV: domestic 4.0 days; SKD: international 2.5 days: PASS.
- November: 79:03 Duty / 05:10 Night: PASS.
- GOZEN/BOEING/SXS simulator families: standard 4h SIM = 06:00 Duty: PASS.
- Overnight simulator continuation dedupe: PASS.
- RSV zero Duty/Night: PASS.
- Standalone STBY no Night: PASS.
- Captain example: 13,678.65 EUR / 872,014 TRY at 63.75: PASS.
- FO 5+ with 1 Off to Duty: 8,291.31 EUR / 528,571 TRY at 63.75: PASS.
- English UI/PDF label checks: PASS.
- No SunExpress branding in app/PDF source: PASS.
