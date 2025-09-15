Sve je spremno i gurnuto na GitHub.

Šta sam dodao
- Android WebView projekat u android/
  - Minimalan projekat (Kotlin) koji otvara tvoju web-app u full-screen WebView-u.
  - Ključni fajlovi:
    - android/app/src/main/java/com/alminkey/invoicemobile/MainActivity.kt
    - android/app/src/main/AndroidManifest.xml
    - android/app/src/main/res/layout/activity_main.xml
    - android/app/src/main/res/xml/network_security_config.xml
    - android/app/build.gradle, android/build.gradle, android/settings.gradle
    - android/.gitignore
- Uputstva za build i Vercel deploy
  - android/README.md s jasnim koracima:
    - Gdje postaviti Vercel URL (startUrl u MainActivity.kt)
    - Kako otvoriti u Android Studiju i izgraditi APK
    - Kako deployati na Vercel i koristiti dobiveni URL

Šta uraditi sada
- Deploy na Vercel (ako već nisi)
  - Import repo → Next.js preset → Deploy
  - Uzmi URL npr. https://invoice-maker-demo.vercel.app
- Postavi URL u Android projektu
  - Uredi android/app/src/main/java/com/alminkey/invoicemobile/MainActivity.kt
  - Zamijeni: private val startUrl = "https://YOUR-VERCEL-URL.vercel.app"
- Build APK u Android Studiju
  - Open → odaberi folder android/
  - Sačekaj Gradle sync (AS će povući wrapper)
  - Build → Build APK(s)
  - APK će biti u app/build/outputs/apk/release/ (ili debug)

Commits
- chore(android): add minimal WebView project under android/ with build instructions and Vercel setup notes

Ako želiš, mogu i:
- Postaviti tvoju stvarnu Vercel URL u startUrl i push-ati izmjenu.
- Dodati app ikonu/adaptive-icon i naziv aplikacije po tvojoj želji.
- Uključiti “open in external apps” za mail/phone linkove ili preciznije rukovanje downloadom PDF-a unutar WebView-a.

