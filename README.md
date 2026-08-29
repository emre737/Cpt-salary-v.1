# Roster Pay Premium v3 — SIM TRI + Hotel Auto

Değişiklikler:
- SIM eğitiminde TRI credit artık Report–Release değil, her SIM instruction için sabit 6:00.
- Normal duty hesabı değişmedi: Report–Release + SIM instruction duty credit.
- DH / transit / hotel TRI eğitim credit'ine eklenmez.
- PDF içindeki `Hotel` kayıtları otomatik tespit edilir.
- İstasyon Türkiye'deyse iç hat, değilse dış hat yatı olarak sınıflandırılır.
- 14:00 local kuralına göre tam/yarım yatı için otomatik ön hesap yapılır.
- Otomatik yatı sonuçları manuel kontrol alanlarına yazılır; kullanıcı gerekirse düzeltebilir.

Temmuz 2026 için eğitim günleri: 1,2,6,7,8,23,24
Beklenen TRI roster referansı:
- 1 Tem SIM: 6:00
- 2 Tem SIM: 6:00
- uçuş eğitimleri: roster planlı süreleri
- toplam yaklaşık 39:28

Not: Uçuş eğitiminde gerçek/planned flight time'dan yüksek olan ödeme esasına giriyorsa,
roster PDF tek başına nihai TRI süresini her zaman vermez.
