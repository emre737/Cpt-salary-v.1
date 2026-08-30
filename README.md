# Roster Pay Premium V6.4 — Three-Month Regression Tested

Gerçek July, August ve September 2026 roster PDF'leriyle test edildi.

Beklenen roster-bazlı sonuçlar (uygulamanın Math.round hh:mm gösterimi):
- July 2026: Duty 145:18, Night 20:33
- August 2026: Duty 137:33, Night 11:13
- September 2026: Duty 111:03, Night 09:05

Düzeltilen iki hata:
1. Calendar cell bleed:
   "Aug. 1" / "Sep. 1" gibi komşu ay etiketleri day-number x konumunu kaydırabiliyordu.
   Artık 7 sabit takvim sütunu kullanılıyor. July 31 standby'a August 1 uçuşu bulaşmıyor.
2. Post-flight Night first-load:
   +00:30 post-flight Night hesabı artık PDF ilk okunduğu anda uygulanıyor;
   ikinci recalc gerekmiyor.

Kritik regressionlar:
- July 31: STBY 03:00–13:00 => 02:30, 0 sektör.
- August 30: STBY 03:30–06:15 + activation + DH + XQ911, final Release 16:54 => 11:50, 1 sektör.
- September 22: 19:30 -> next-day 00:25 => 05:25, 2 sektör.
- September 23: separate STBY 13:00–21:00 => 02:00, 0 sektör.
