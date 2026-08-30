# Roster Pay Premium V5.7 — Overnight Standby Fix

- 18 Sep Report 17:00, SB4 -> 19 Sep Release 00:30:
  7:30 standby, %25 = 1:53.
- 19 Sep Report 21:00, SB5 -> 20 Sep Release 04:00:
  7:00 standby, %25 = 1:45.
- Parser artık bir gün hücresindeki erken saatli Release'i önceki gecenin göreviyle,
  daha geç saatli Report'u ise yeni görevle eşleştirir.
- V5.6 kuralları korunmuştur.
