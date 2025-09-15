Riješio sam greške iz Vercel loga i osnažio modal preko portala.

Ključne promjene za build
- ZIP import bez any:
  - src/app/invoices/page.tsx: `const { default: JSZip } = await import('jszip');`
- Uklonjeni any u formama i izračunima:
  - src/app/invoices/new/page.tsx i src/app/invoices/[id]/edit/page.tsx:
    - numeric inputs dozvoljavaju praznu vrijednost (placeholder „Količina“, „Cijena“), parsiranje u broj/NaN bez any.
    - dodani labeli „Od:“ i „Do:“ iznad polja datuma.
    - subtotal računan preko tipizirane privremene varijable (bez any castova).
- Store tipovi bez any:
  - src/store/useStore.ts: dodan `_syncFromActive` u tip, uklonjen `(get() as any)`, tip‑sigurno spajanje `updateCompany`.

Popup modal
- src/app/Nav.tsx: render kroz `createPortal(..., document.body)` → modal je 100% centriran, overlay `backdrop-blur-2xl` + `bg-black/60`.

Napomene
- Donja navigacija je fiksna na dnu i bez Settings kartice (zubčanik ostaje u headeru).
- Dugmad „Otvori/Uredi/Obriši“ su pomaknuta ispod iznosa i „Plaćeno“ dugmeta.
- Veći textarea „Opis“ i auto‑popuna opisa s prethodne fakture izabranog klijenta.

Dalje
- Pokreni redeploy na Vercel (Node 18+ ili 20). Ako se pojavi nova poruka, pošalji je.
- Pošalji Vercel URL pa ću ga upisati u Android `startUrl` i push-ati.

