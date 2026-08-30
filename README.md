# Roster Pay Premium V6.0 — Event-Based Roster Parser

Bu sürümde Report/Release eşleştirme motoru yeniden yazıldı.

## Temel parser kuralı
Takvim günü görev sınırı değildir. PDF hücresindeki bütün aktiviteler görsel sırasıyla event olarak işlenir:

- Report -> yeni duty açar
- XQ / DH / SB / SIM -> yalnızca o anda açık olan duty'ye bağlanır
- Release -> açık duty'yi kapatır
- Duty gece yarısını geçebilir
- Aynı gün sabah önceki duty'nin Release'i ve akşam yeni duty'nin Report'u bulunabilir

## Duplicate sektör düzeltmesi
Gece yarısını geçen uçuşlarda aynı XQ uçuş numarası iki hücrede görünebilir.
Sektörler duty içinde XQ uçuş numarasına göre tekilleştirilir.

Örnek:
- 22 Sep Report 19:30
- XQ9238
- XQ9239
- 23 Sep XQ9239 continuation
- Release 00:25

Sonuç: 2 sektör, 19:30 -> 00:25 + 00:30 = 05:25.

23 Sep'teki ayrı görev:
- Report 13:00
- SB3 13:00 -> 21:00
- Release 21:00
Sonuç: 08:00 x %25 = 02:00, 0 sektör.

## Eylül 2026 regression hedefi
Beklenen duty satırları:
3 05:40
4 06:40
5 08:15
6 08:30
11 08:30
12 04:55
13 06:55
14 11:45
15 01:45
18 01:53
19 01:45
21 08:45
22 05:25
23 02:00
25 05:40
27 08:10
28 08:30
30 06:00

Toplam: 111:03 (CAE Virtual Duty Period ile aynı).

Diğer kurallar korunmuştur:
- flight / DH / SIM duty sonunda +00:30
- standby-only %25
- activated standby: SB kısmı %25 + aktif duty %100 +00:30
- standby kısmına night ödeme yazılmaz
- SIM eğitim günü Instructor Yes ise +06:00 TRI credit
- Instructor Yes/No
- seniority, Off to Duty, yatı ve ücret hesapları
