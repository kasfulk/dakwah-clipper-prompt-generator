# Test report — akun sosmed

```
$ npm test
✔ buildFinalPrompt mengisi semua placeholder tanpa sisa
✔ replaceClipTable mengganti baris klip, menyisakan satu baris per klip
✔ replaceClipTable mengabaikan balasan tanpa baris tabel
✔ adaptClipTable hanya mengirim clip-plan ke model
✔ adaptClipTable merangkai delta walau terpotong di tengah baris
✔ adaptClipTable menerima balasan JSON utuh walau stream diminta
✔ adaptClipTable melempar error HTTP dengan potongan respons
✔ parseYouTubeId menerima semua bentuk link
✔ parseYouTubeId menolak input tak valid
✔ parseYouTubeId menolak ID YouTube di host lain
✔ transcriptUrl menyusun tautan yang diminta
✔ prompt clip plan memakai format user dengan URL terisi
✔ prompt effectcraft memakai format user
✔ prompt effectcraft menyisipkan palet dan layout pilihan user
✔ prompt effectcraft menyalin clip-plan apa adanya, termasuk pola $
✔ parseClipPlan mengekstrak JSON dari balasan AI
✔ akun sosmed diformat per baris, @ ganda dibuang, username kosong dilewati
✔ prompt effectcraft menyisipkan akun sosmed pilihan user
✔ final prompt mengisi __SOCIAL__ dan tidak menyisakan placeholder
ℹ tests 19 · pass 19 · fail 0

$ npx vite build
✓ 115 modules transformed.
dist/assets/index-ujxQK96n.css   3.83 kB
dist/assets/index-DSU0uuNS.js   69.23 kB
✓ built in 299ms
```
