# Roster Pay Premium V5.9 — Datetime Duty Engine

Parser artık takvim gününü duty sınırı olarak kullanmaz.

Temel kural:
- Report bir duty açar.
- Kronolojik olarak sonraki geçerli Release duty'yi kapatır.
- Release ertesi güne geçebilir.
- Bir hücrede önce sabah carry-over Release, sonra akşam yeni Report varsa:
  önce eski duty kapanır, sonra yeni duty açılır.
- Aynı hücrede Report 13:00 / Release 21:00 gibi normal sıra varsa aynı duty içinde kapanır.
- Release 00:25 / Report 13:00 gibi sıra varsa 00:25 önceki duty'ye aittir.

Hedef örnek:
- 22 Sep Report 19:30 -> 23 Sep Release 00:25 = tek flight duty.
  +00:30 post-flight ile 05:25.
- 23 Sep Report 13:00 -> Release 21:00 = ayrı standby.
  %25 ile 02:00.

Önceki DH, post-flight, activated standby, SIM, Instructor ve ücret kuralları korunmuştur.
