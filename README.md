# Roster Pay Premium — Training Parser Fix v2

Bu sürüm şu iki hatayı düzeltir:

1. BOEING-C / BOEING-D SIM instruction satırları PDF'de iki satıra bölündüğünde SIM süresinin okunmaması.
2. XQ sektöründe kalkış ve varış saatleri iki satıra bölündüğünde TRI eğitim süresinin 00:00 çıkması.

Ayrıca PDF takvim hücreleri artık sütun/satır sınırlarına göre okunur.

Temmuz 2026 testinde beklenen yaklaşık parser sonuçları:
- Duty: ~145:18 (bordro gerçekleşeni 145.37 decimal ≈ 145:22)
- Night: ~20:03 (bordro gerçekleşeni 20.30 decimal ≈ 20:18)
- Ek sektör: 2
- TRI: artık 00:00 olmamalı; roster planlı sürelerinden hesaplanır.

Not: TRI uçuş ödemesinde şirket planlanan/gerçekleşen flight time'dan yüksek olanı kullanıyorsa,
roster PDF tek başına gerçekleşen flight time'ı içermediğinde nihai TRI tutarı manuel düzeltme gerektirebilir.
