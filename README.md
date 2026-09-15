# Roster Pay Premium V6.8

V6.7 hesaplama motoru korunarak arayüz ve raporlama özellikleri eklendi.

## Yeni özellikler
- Off to Duty altındaki `Her duty için +330 €` açıklaması kaldırıldı.
- `Instructor` başlığı `SFI/TRI` olarak değiştirildi.
- TRI ile ilgili görünür alanlar `TRI/SFI` olarak güncellendi.
- Roster PDF alanına belirgin `PDF dosyasını lokal zamanlı olarak indirip yükleyin.` uyarısı eklendi.
- Sonuç kartına `PDF Raporunu İndir` butonu eklendi. Rapor toplam kazanç, Duty, Night, TRI/SFI, kazanç kalemleri, yatı özeti ve gün gün görev tablosunu içerir.
- Üste `Yenile` butonu eklendi. Service worker/cache temizlenip cache-busting query ile GitHub Pages'in en güncel sürümü tekrar yüklenir.

## Testler
- July 2026 regression: 145:18 Duty / 20:33 Night - PASS
- August 2026 regression: 137:33 Duty / 11:13 Night - PASS
- September baseline regression: 111:03 Duty / 09:05 Night - PASS
- Yeni yüklenen September roster: 115:37 Duty / 08:55 Night - PASS
- Çağlar roster: 112:22 Duty / 21:46 Night - PASS
- Month carry-in/out regression - PASS
- Month-end cutoff regression - PASS
- PDF report definition/download wiring - PASS
- Hard refresh cache-buster wiring - PASS
- JavaScript syntax check - PASS
