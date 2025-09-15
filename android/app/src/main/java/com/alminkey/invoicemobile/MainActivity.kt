package com.alminkey.invoicemobile

import android.annotation.SuppressLint
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.webkit.*
import androidx.activity.ComponentActivity

class MainActivity : ComponentActivity() {
  private lateinit var webView: WebView
  private val startUrl = "https://YOUR-VERCEL-URL.vercel.app" // TODO: set your deployed URL

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
        if (Uri.parse(url).scheme?.startsWith("http") == true) return false
        return true
      }
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

