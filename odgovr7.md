Detaljni koraci za Build APK (Android Studio)

Priprema okruženja
- Instaliraj Android Studio (Giraffe/Flamingo ili novije) + Android SDK Platform 34 i Build-Tools.
- Preporučeni JDK: 17 (Android Studio dolazi s ugrađenim JDK-om – koristi default).
- Repo već sadrži minimalni Android projekat u folderu `android/`.

1) Postavi URL web-aplikacije (Vercel)
- Uredi `android/app/src/main/java/com/alminkey/invoicemobile/MainActivity.kt`.
- Postavi `startUrl` na tvoj HTTPS URL, npr.:
  - `private val startUrl = "https://invoice-maker-git-main-alminkeys-projects.vercel.app"`
- Sačuvaj fajl.

2) Otvori projekat u Android Studiju
- Android Studio → File → Open → izaberi folder `android/` na korijenu repozitorija.
- Pričekaj „Gradle Sync“ da preuzme wrapper/dependencies (prvi put može potrajati).

3) Odaberi Build varijantu
- U donjem lijevom dijelu otvori „Build Variants“ panel.
- Za brzi test izaberi `app` → `debug`.
- Za proizvodni APK izaberi `release` (može zahtijevati potpisivanje – vidi korak 5b).

4) Build nesigniranog debug APK‑a (najbrže za demo)
- Menu: Build → Build APK(s).
- Kada build završi, Android Studio pokaže notifikaciju „APK(s) generated“ → klikni „locate“:
  - Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`
  - Release APK (ako si odabrao release varijantu): `android/app/build/outputs/apk/release/app-release-unsigned.apk`

5) Build potpisanog release APK‑a (preporučeno za dijeljenje)
- 5a) Brzo (unsigned, ali manje poželjno): kao u koraku 4 s varijantom `release` – rezultat je unsigned APK.
- 5b) Potpisani APK (Generate Signed Bundle/APK):
  - Build → Generate Signed Bundle/APK… → odaberi „APK“ → Next.
  - Keystore: „Create new…“ (prvi put):
    - Key store path: npr. `android/keystore/keystore.jks`
    - Password/Confirm: upiši sigurnu lozinku
    - Key alias: npr. `invoice`
    - Key password: upiši (može isto kao iznad)
    - Validity: 25+ godina (npr. 30)
  - Next → Modul: `app` → Build Variant: `release`
  - Signature Versions: V1 i V2 označene → Finish.
  - Rezultat: `android/app/build/outputs/apk/release/app-release.apk` (potpisan APK spreman za slanje).

6) Instalacija na uređaj
- Opcija A: Kopiraj APK na telefon i instaliraj (omogući instalaciju iz nepoznatih izvora na telefonu).
- Opcija B: ADB (USB debug):
  - Uključi „Developer options“ i „USB debugging“ na telefonu.
  - Instaliraj „Android Platform Tools“ (ako treba), pa:
    - `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`

7) Česte napomene/greške
- WebView traži HTTPS: već koristimo `https://…vercel.app`. Ako vidiš „prazan ekran“, provjeri da URL nije mijenjao.
- Miješani sadržaj (HTTP u HTTPS): dozvoljeno je u kodu (`mixedContentMode = ALWAYS_ALLOW`), ali preporuka je sve resurse držati na HTTPS.
- Cache/Service Worker: prilikom testiranja osvježi aplikaciju ili očisti WebView cache ako vidiš stari sadržaj.
- Ako Gradle javi grešku o verzijama plugina:
  - Synci projekt (File → Sync Project with Gradle Files) i pusti Android Studio da predloži ažuriranja.
  - build.gradle (Project) koristi AGP 8.6.0 i Kotlin 1.9.24 – to je kompatibilno sa compileSdk 34.

Korisni fajlovi u ovom repou
- `android/README.md` – kratka verzija istih koraka.
- `android/app/src/main/java/.../MainActivity.kt` – tvoj `startUrl` (Vercel). Tu mijenjaš adresu.
- `android/app/src/main/AndroidManifest.xml` – label/ikona i dozvole.
- `android/app/build.gradle` – `applicationId` (trenutno `com.alminkey.invoice`).

Ako želiš, mogu: dodati prilagođenu ikonu (PNG/SVG), promijeniti naziv aplikacije (launcher label), ili pripremiti „Generate Signed APK“ profil (Gradle properties) za brže repete.

