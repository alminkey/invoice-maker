package com.vaico.invoicemobile

import android.annotation.SuppressLint
import android.Manifest
import android.app.DownloadManager
import android.content.BroadcastReceiver
import android.content.Intent
import android.content.IntentFilter
import android.content.ContentValues
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.webkit.*
import androidx.activity.ComponentActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import android.util.Base64
import android.content.pm.PackageManager
import android.os.Environment
import android.widget.Toast
import android.webkit.URLUtil
import android.provider.MediaStore
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream

class MainActivity : ComponentActivity() {
  private lateinit var webView: WebView
  private val startUrl = "https://invoice-maker-2drs.vercel.app"
  private val REQ_WRITE_EXTERNAL = 1001
  private val dmIds: MutableMap<Long, String> = mutableMapOf()
  private var dmReceiver: BroadcastReceiver? = null

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
      override fun onPageFinished(view: WebView?, url: String?) {
        super.onPageFinished(view, url)
        // Install a hook to capture blobs created via URL.createObjectURL
        val hook = """
          (function(){
            try {
              if (window.__blobHookInstalled) return;
              window.__blobMap = new Map();
              var orig = URL.createObjectURL;
              URL.createObjectURL = function(blob){
                var u = orig.call(URL, blob);
                try {
                  var r = new FileReader();
                  r.onloadend = function(){ try{ window.__blobMap.set(u, String(r.result)); }catch(_){} };
                  r.readAsDataURL(blob);
                } catch(_){ }
                return u;
              };
              window.__blob2data = function(u){
                return new Promise(function(res, rej){
                  try { var v = window.__blobMap && window.__blobMap.get(u); if (v) res(v); else rej('not found'); }
                  catch(e){ rej(String(e)); }
                });
              };
              window.__blobHookInstalled = true;
            } catch(_){ }
          })();
        """.trimIndent()
        view?.evaluateJavascript(hook, null)
      }
    }

    // JS bridge for blob/data downloads
    webView.addJavascriptInterface(AndroidDownloader(), "AndroidDownloader")

    // Listen for DownloadManager completion to show success toast
    dmReceiver = object : BroadcastReceiver() {
      override fun onReceive(context: android.content.Context?, intent: Intent?) {
        if (intent?.action == DownloadManager.ACTION_DOWNLOAD_COMPLETE) {
          val id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1L)
          val name = dmIds.remove(id)
          if (name != null) {
            Toast.makeText(this@MainActivity, "Saved to Downloads: $name", Toast.LENGTH_LONG).show()
          }
        }
      }
    }
    registerReceiver(dmReceiver, IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE))

    // Handle downloads initiated from <a download> or Content-Disposition
    webView.setDownloadListener { url, userAgent, contentDisposition, mimeType, _ ->
      try {
        // Handle data: and blob: specially
        if (url.startsWith("data:")) {
          saveDataUrl(url, URLUtil.guessFileName("download", contentDisposition, mimeType), mimeType)
          return@setDownloadListener
        }
        if (url.startsWith("blob:")) {
          val safeName = URLUtil.guessFileName("download", contentDisposition, mimeType)
          val escapedUrl = url.replace("'", "\\'")
          val escapedName = safeName.replace("'", "\\'")
          val escapedMime = (mimeType ?: "application/octet-stream").replace("'", "\\'")
          val jsMapFirst = """
            (function(){
              var u = '$escapedUrl'; var name='$escapedName'; var mime='$escapedMime';
              var tries = 0;
              function tryGet(){
                try {
                  if (window.__blob2data) {
                    window.__blob2data(u).then(function(d){ window.AndroidDownloader.downloadBase64(name, d, mime); })
                    .catch(function(){ if (tries++ < 40) setTimeout(tryGet, 50); else window.AndroidDownloader.error('map timeout'); });
                  } else {
                    if (tries++ < 20) setTimeout(tryGet, 100); else window.AndroidDownloader.error('no hook');
                  }
                } catch(e) { try{ window.AndroidDownloader.error(String(e)); }catch(_){} }
              }
              tryGet();
            })();
          """.trimIndent()
          webView.evaluateJavascript(jsMapFirst, null)
          // No network fallback here; rely on cached dataURL to avoid crashes in older WebViews
          return@setDownloadListener
        }

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

        if (Build.VERSION.SDK_INT >= 29) {
          request.setDestinationInExternalFilesDir(this, Environment.DIRECTORY_DOWNLOADS, filename)
        } else {
          request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename)
        }

        CookieManager.getInstance().getCookie(url)?.let { request.addRequestHeader("cookie", it) }
        request.addRequestHeader("User-Agent", userAgent)

        val dm = getSystemService(DOWNLOAD_SERVICE) as DownloadManager
        val id = dm.enqueue(request)
        dmIds[id] = filename
        Toast.makeText(this, "Downloading…", Toast.LENGTH_SHORT).show()
      } catch (e: Exception) {
        Toast.makeText(this, "Download failed: ${e.message}", Toast.LENGTH_LONG).show()
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

  override fun onDestroy() {
    super.onDestroy()
    dmReceiver?.let { try { unregisterReceiver(it) } catch (_: Exception) {} }
  }

  // JS bridge class
  inner class AndroidDownloader {
    @JavascriptInterface
    fun downloadBase64(name: String?, dataUrl: String, mime: String?) {
      runOnUiThread {
        try {
          val filename = (name?.ifBlank { null } ?: "download-${System.currentTimeMillis()}")
          saveDataUrl(dataUrl, filename, mime)
          Toast.makeText(this@MainActivity, "Saved to Downloads: $filename", Toast.LENGTH_LONG).show()
        } catch (e: Exception) {
          Toast.makeText(this@MainActivity, "Download failed: ${e.message}", Toast.LENGTH_LONG).show()
        }
      }
    }

    @JavascriptInterface
    fun error(msg: String?) {
      runOnUiThread { Toast.makeText(this@MainActivity, "Download error: ${msg ?: "unknown"}", Toast.LENGTH_LONG).show() }
    }
  }

  private fun saveDataUrl(dataUrl: String, defaultName: String, mimeMaybe: String?) {
    val comma = dataUrl.indexOf(',')
    if (!dataUrl.startsWith("data:") || comma < 0) throw IllegalArgumentException("Not a data: URL")
    val meta = dataUrl.substring(5, comma) // e.g. application/pdf;base64
    val base64 = dataUrl.substring(comma + 1)
    val mime = meta.substringBefore(';', missingDelimiterValue = (mimeMaybe ?: "application/octet-stream"))
    val bytes = Base64.decode(base64, Base64.DEFAULT)
    saveBytes(bytes, defaultName, mime)
  }

  private fun saveBytes(bytes: ByteArray, name: String, mime: String) {
    if (Build.VERSION.SDK_INT >= 29) {
      val values = ContentValues().apply {
        put(MediaStore.Downloads.DISPLAY_NAME, name)
        put(MediaStore.Downloads.MIME_TYPE, mime)
        put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
        put(MediaStore.Downloads.IS_PENDING, 1)
      }
      val uri = contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
        ?: throw IllegalStateException("Failed to create download entry")
      contentResolver.openOutputStream(uri).use { out ->
        if (out == null) throw IllegalStateException("No output stream")
        out.write(bytes)
      }
      values.clear()
      values.put(MediaStore.Downloads.IS_PENDING, 0)
      contentResolver.update(uri, values, null, null)
    } else {
      val granted = ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED
      if (!granted) throw SecurityException("Storage permission not granted")
      val dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
      if (!dir.exists()) dir.mkdirs()
      val file = File(dir, name)
      FileOutputStream(file).use { it.write(bytes) }
    }
  }
}


