I’ve implemented the first three items and the deposit feature, plus basic icons. Here’s what changed and what’s next.

**Šta Je Urađeno**
- I18n i encoding
  - Očistio BS/SK stringove (uklonjen “mojibake”), dodao ključne poruke: potvrde brisanja, validacije, “Depozit”, “Za naplatu”.
  - Primijenio i18n poruke u klijentima i postavkama (alerti i potvrde).
- Početna (Recent invoices)
  - Prikaz prvih 5 faktura sa iznosom, depozitom i “Za naplatu”.
  - Datoteka: `src/app/page.tsx`.
- PDF i Depozit
  - Dodan “Depozit” i “Za naplatu” u sumarni blok (Total → Deposit → Amount due), popravljen razdjelnik perioda “–” i footer.
  - Datoteka: `src/lib/pdf.tsx` (ispravljen i i18n labela za sve jezike).
- Forma Nova/Uredi fakturu
  - Dodano polje “Depozit” i live obračun (Ukupno → Za naplatu).
  - Validacija depozita (>= 0 i ≤ subtotal), poruke preko i18n.
  - Datoteke: `src/app/invoices/new/page.tsx`, `src/app/invoices/[id]/edit/page.tsx`.
- Lista faktura
  - Prikaz “Total”, “(−depozit)” i “Za naplatu” + i18n potvrda brisanja.
  - Datoteka: `src/app/invoices/page.tsx`.
- Detalj fakture
  - Prikaz Total, Depozit i “Za naplatu” u zaglavlju; standardizovani tekstovi.
  - Datoteka: `src/app/invoices/[id]/page.tsx`.
- Model i izračuni
  - Dodano polje `deposit?: number` i util `calcInvoiceAmountDue`.
  - Datoteka: `src/lib/models.ts`.
- Manifest ikone (osnovno)
  - Dodana referenca na `favicon.ico` u manifest.
  - Datoteka: `src/app/manifest.ts`.

**Napomene**
- Polje “Depozit” se sada vidi i u kreiranju i u editovanju fakture; ulazi u PDF i izračun “Za naplatu”.
- Postojeće fakture bez depozita ostaju validne (tretira se kao 0).
- I dalje postoje neki hardkodirani BS natpisi (npr. “Klijent”, “Stavke”, “Ukloni”); mogu ih prebaciti u i18n u sledećem prolazu.

**Šta Je Ostalo (kao što smo planirali)**
- Pojednostaviti detalj fakture UX:
  - Predlog: jedan “PDF” meni sa: Preview, Download, Download all; ili “Preview” dugme + “Download” kao primarno; ukloniti duplikate.
- PWA ikone (naprednije):
  - Dodati PNG ikone raznih dimenzija u `public/` i proširiti `icons` u manifestu (trenutno je samo favicon).

**Bonus Ideje (atraktivnije i modernije)**
- Elegantniji PDF look: lakše tabele, subtile separatori, QR/iban sekcija (po želji).
- Brzi presek na Home: kartice “Za naplatu ukupno”, “Plaćene ovaj mjesec”, “Neplaćene”.
- Tamna/ svijetla tema toggle.
- Export ZIP svih PDF-ova za klijenta ili godinu.

Želiš li da nastavim odmah sa pojednostavljenjem detalja fakture (spojiti PDF akcije) i proširenjem PWA ikona, ili prvo da verifikujemo da PDF rubrika “Depozit/Za naplatu” odgovara slici koju si poslao? Ako želiš, mogu uskladiti izgled PDF-a preciznije prema slici F:VAIC2.JPG.

