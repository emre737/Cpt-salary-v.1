# Roster Pay Premium V6.1 — Activated Standby Fix

30 Ağustos tipi görevler için parser düzeltildi.

Roster örneği:
- Report 03:30
- SB1 03:30 → 06:15
- Report 06:15
- Release 06:15
- DH ADB 07:30 → 09:37 FRA
- XQ911 FRA 12:10 → 16:06 ADB
- Final Release 16:06

06:15'teki Report + Release artık ayrı, sıfır süreli duty oluşturmaz.
Bunlar standby activation boundary olarak işlenir.

Hesap:
- Standby: 02:45 × %25 = 00:41
- Active duty: 06:15 → 16:06 = 09:51
- Post-flight: +00:30
- Toplam duty credit ≈ 11:02
- Sektör: 1 (XQ911)
- DH sektör sayısına eklenmez
- Standby kısmı night pay'e girmez

V6.0 event parser, DH, SIM, Instructor ve ücret kuralları korunmuştur.
