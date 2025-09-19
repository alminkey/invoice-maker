## ProGuard / R8 rules for release builds
# Keep JavaScript interface methods invoked via reflection from WebView
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
