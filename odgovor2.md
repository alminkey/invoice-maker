Odlično — evo dva praktična načina da spremiš Android demo koji možeš poslati prijatelju. Preporučujem WebView “omotač” jer ne traži verifikaciju domena niti kompleksnu konfiguraciju.

Opcija 1: WebView wrapper (preporučeno)
- Ideja: Android aplikacija otvara tvoju web-app (npr. Vercel URL) u full-screen WebView-u.
- Preduslov: Deploy na HTTPS (Vercel je najlakši, već imaš repo spreman).
  - Vercel koraci:
    - Instaliraj Vercel CLI ili preko web UI: “New Project” → importuj repo → framework Next.js → deploy.
    - Kopiraj https://tvoj-projekat.vercel.app URL.
- Napravi Android projekat (u posebnom folderu) i ubaci ove datoteke:

1) AndroidManifest.xml
- Daj aplikaciji internet i full-screen WebView.
- Uključi podršku za file access ako treba za JSON import/export u app.

<?xml version="1.0" encoding="utf-8"?>
<manifest package="com.example.invoicemobile" xmlns:android="http://schemas.android.com/apk/res/android">
  <uses-permission android:name="android.permission.INTERNET"/>
  <application
    android:label="Invoice Maker"
    android:usesCleartextTraffic="false"
    android:networkSecurityConfig="@xml/network_security_config"
    android:theme="@style/Theme.App">
    <activity android:name=".MainActivity"
      android:exported="true"
      android:screenOrientation="portrait"
      android:configChanges="orientation|keyboardHidden|screenSize">
      <intent-filter>
        <action android:name="android.intent.action.MAIN"/>
        <category android:name="android.intent.category.LAUNCHER"/>
      </intent-filter>
    </activity>
  </application>
</manifest>

2) res/xml/network_security_config.xml
- (Opcionalno) zadrži default; WebView će koristiti HTTPS.

<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <base-config cleartextTrafficPermitted="false"/>
  </network-security-config>

3) res/layout/activity_main.xml
- Jedan WebView koji zauzima cijeli ekran.

<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
  android:layout_width="match_parent" android:layout_height="match_parent">
  <WebView
    android:id="@+id/webview"
    android:layout_width="match_parent"
    android:layout_height="match_parent"/>
</FrameLayout>

4) MainActivity.kt
- Uključi JS, DOM storage, SW, i intercept neke sheme (download pdf, itd.).

package com.example.invoicemobile

import android.annotation.SuppressLint
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.webkit.CookieManager
import android.webkit.ServiceWorkerClient
import android.webkit.ServiceWorkerController
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity

class MainActivity : ComponentActivity() {
  private lateinit var webView: WebView
  private val startUrl = "https://tvoj-projekat.vercel.app"

  @SuppressLint("SetJavaScriptEnabled")
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_main)

    webView = findViewById(R.id.webview)
    val ws = webView.settings
    ws.javaScriptEnabled = true
    ws.domStorageEnabled = true
    ws.cacheMode = WebSettings.LOAD_DEFAULT
    ws.allowFileAccess = true
    ws.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW

    CookieManager.getInstance().setAcceptCookie(true)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
      CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true)
    }

    webView.webChromeClient = WebChromeClient()
    webView.webViewClient = object : WebViewClient() {
      override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
        val url = request.url.toString()
        // Dozvoli navigaciju unutar app
        if (Uri.parse(url).scheme?.startsWith("http") == true) {
          return false
        }
        return true
      }
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
      val swc = ServiceWorkerController.getInstance()
      swc.setServiceWorkerClient(object : ServiceWorkerClient() {
        override fun shouldInterceptRequest(request: WebResourceRequest) = null
      })
    }

    webView.loadUrl(startUrl)
  }

  override fun onBackPressed() {
    if (this::webView.isInitialized && webView.canGoBack()) {
      webView.goBack()
    } else {
      super.onBackPressed()
    }
  }
}

5) build.gradle (Module)
- Koristi minimalan SDK 26+, Kotlin, AndroidX.

plugins {
  id 'com.android.application'
  id 'org.jetbrains.kotlin.android'
}
android {
  namespace 'com.example.invoicemobile'
  compileSdk 34
  defaultConfig {
    applicationId "com.example.invoicemobile"
    minSdk 26
    targetSdk 34
    versionCode 1
    versionName "1.0.0"
  }
  buildTypes {
    release {
      minifyEnabled true
      proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
    debug { minifyEnabled false }
  }
  compileOptions {
    sourceCompatibility JavaVersion.VERSION_17
    targetCompatibility JavaVersion.VERSION_17
  }
  kotlinOptions { jvmTarget = '17' }
}
dependencies {
  implementation 'androidx.core:core-ktx:1.13.1'
  implementation 'androidx.appcompat:appcompat:1.7.0'
  implementation 'com.google.android.material:material:1.12.0'
}

6) build.gradle (Project) + gradle wrapper
- Android Studio će ih generisati pri kreiranju projekta (“Empty Views Activity”), pa samo zamijeni gore fajlove.

Build APK:
- Otvori projekat u Android Studiju.
- File → Sync Project with Gradle Files.
- Build → Build Bundle(s)/APK(s) → Build APK(s).
- APK ćeš naći u `app/build/outputs/apk/release/` (ili `debug/` za debug).

Napomena:
- Ovo koristi deployovanu web-app. Ako želiš “instalacioni” PWA osjećaj: već imaš manifest + service worker; WebView to koristi prema SW API podršci. Za puni TWA (bez UI hroma) treba domen verifikacija (Opcija 2).

Opcija 2: TWA (Trusted Web Activity)
- Kad app bude na HTTPS domenu (npr. Vercel), možeš napraviti TWA koja otvara PWA bez browser UI i ima bolju integraciju.
- Koraci (ukratko):
  - Instaliraj Bubblewrap CLI: npm i -g @bubblewrap/cli
  - bubblewrap init --manifest=https://tvoj-projekat.vercel.app/manifest.webmanifest
  - Potpiši app (Bubblewrap te vodi), build: bubblewrap build
  - Na server postavi `.well-known/assetlinks.json` sa SHA256 keystore fingerprintom (Bubblewrap generiše).
  - Install na uređaj: bubblewrap install ili preko Android Studija.
- Bez assetlinks verifikacije TWA neće raditi kako treba, zato predlažem WebView za brzi demo.

Šta dalje mogu odraditi za tebe
- Ako želiš, mogu:
  - Pripremiti minimalan Android projekat (u `android/` folderu) sa gore navedenim fajlovima i default package name, pa ga push-ati u repo.
  - Dodati skriptu/README sa tačnim build koracima za APK.
  - Pomoći s Vercel deploy-om (ako još nije online) i unijeti taj URL u WebView “startUrl”.
  
Reci koju varijantu želiš (WebView projekt u repo-u ili želiš da prođemo TWA put sa Bubblewrap-om), i koji URL da postavim kao startnu stranicu u aplikaciji.

