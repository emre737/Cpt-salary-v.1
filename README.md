# Roster Pay Premium — Safari Fix

Bu sürüm iPhone Safari'deki:
`Setting up fake worker failed: Importing a module script failed`
hatasını düzeltmek için PDF.js'i klasik Safari uyumlu sürümle yükler.

## Güncelleme
Mevcut GitHub repository'nizde özellikle şu iki dosyanın üzerine yazın:
- `index.html`
- `sw.js`

İsterseniz ZIP içindeki tüm dosyaları da yeniden yükleyebilirsiniz.

Commit sonrası GitHub Pages deploy yeşil tik olunca Safari'de site adresinin sonuna:
`?v=2`
ekleyerek bir kez açın. Örn:
`https://kullanici.github.io/repo-adi/?v=2`

Bu, önceki Service Worker önbelleğini atlayıp yeni index.html'i getirir.
