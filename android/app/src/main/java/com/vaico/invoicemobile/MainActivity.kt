package com.vaico.invoicemobile

import android.annotation.SuppressLint
import android.Manifest
import android.app.DownloadManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.webkit.*
import androidx.activity.ComponentActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import android.content.pm.PackageManager
import android.os.Environment
import android.widget.Toast
import android.webkit.URLUtil

class MainActivity : ComponentActivity() {
  private lateinit var webView: WebView
  private val startUrl = "https://invoice-maker-2drs.vercel.app"
  private val REQ_WRITE_EXTERNAL = 1001

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
    ws.setSupportMultipleWindows(false)

    CookieManager.getInstance().setAcceptCookie(true)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
      CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true)
    }

    webView.webChromeClient = WebChromeClient()
    webView.webViewClient = object : WebViewClient() {
      override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
        val url = request.url.toString()
        if (Uri.parse(url).scheme?.startsWith("http") == true) return false
        return true
      }
    }

    // Handle downloads initiated from <a download> or Content-Disposition
    webView.setDownloadListener { url, userAgent, contentDisposition, mimeType, _ ->
      // Permission for API < 29
      if (Build.VERSION.SDK_INT < 29) {
        val granted = ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED
        if (!granted) {
          ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.WRITE_EXTERNAL_STORAGE), REQ_WRITE_EXTERNAL)
          Toast.makeText(this, "Permission needed to save file. Tap download again.", Toast.LENGTH_SHORT).show()
          return@setDownloadListener
        }
      }

      val filename = URLUtil.guessFileName(url, contentDisposition, mimeType)
      val request = DownloadManager.Request(Uri.parse(url))
        .setMimeType(mimeType)
        .setTitle(filename)
        .setDescription("Downloading file")
        .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
        .setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename)

      CookieManager.getInstance().getCookie(url)?.let { request.addRequestHeader("cookie", it) }
      request.addRequestHeader("User-Agent", userAgent)

      val dm = getSystemService(DOWNLOAD_SERVICE) as DownloadManager
      dm.enqueue(request)
      Toast.makeText(this, "Downloading…", Toast.LENGTH_SHORT).show()
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
      val swc = ServiceWorkerController.getInstance()
      swc.setServiceWorkerClient(object : ServiceWorkerClient() {
        override fun shouldInterceptRequest(request: WebResourceRequest): WebResourceResponse? = null
      })
    }

    webView.loadUrl(startUrl)
  }

  override fun onBackPressed() {
    if (this::webView.isInitialized && webView.canGoBack()) webView.goBack() else super.onBackPressed()
  }
}


