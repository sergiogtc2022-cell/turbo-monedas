package com.turbomonedas.juego;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.util.Locale;

/**
 * Contenedor del juego: muestra assets/index.html en pantalla completa
 * abre la galería cuando el juego pide una foto o un audio, y presta la voz
 * del teléfono (TextToSpeech) para que el personaje hable.
 */
public class MainActivity extends Activity {

    private static final int SOLICITUD_FOTO = 1001;
    private WebView webView;
    private ValueCallback<Uri[]> callbackFoto;
    private TextToSpeech voz;
    private boolean vozLista = false;
    private Actualizador actualizador;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        webView = new WebView(this);
        setContentView(webView);

        WebSettings ajustes = webView.getSettings();
        ajustes.setJavaScriptEnabled(true);
        ajustes.setDomStorageEnabled(true);          // guarda la foto entre partidas
        ajustes.setMediaPlaybackRequiresUserGesture(false);
        ajustes.setAllowFileAccess(true);

        voz = new TextToSpeech(this, estado -> {
            if (estado != TextToSpeech.SUCCESS) return;
            int r = voz.setLanguage(new Locale("es", "MX"));
            if (r < 0) r = voz.setLanguage(new Locale("es"));
            vozLista = r >= 0;
            voz.setPitch(1.2f);
            voz.setSpeechRate(1.1f);
        });
        webView.addJavascriptInterface(new PuenteVoz(), "AndroidVoz");

        actualizador = new Actualizador(this);
        webView.addJavascriptInterface(new PuenteApp(), "AndroidApp");
        webView.postDelayed(() -> actualizador.buscar(false), 3000);   // revisa al abrir

        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback,
                                             FileChooserParams params) {
                if (callbackFoto != null) {
                    callbackFoto.onReceiveValue(null);
                }
                callbackFoto = callback;

                // El juego pide "image/*" para la foto o "audio/*" para la grabación
                String[] aceptados = params.getAcceptTypes();
                String pedido = aceptados == null ? "" : String.join(",", aceptados).toLowerCase();
                boolean esAudio = pedido.contains("audio") || pedido.contains(".m4a") || pedido.contains(".mp3");
                Intent intent;
                String titulo;
                if (esAudio) {
                    // Selector de documentos del sistema: muestra Descargas, Grabaciones, etc., nunca la galería
                    intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                    intent.setType("audio/*");
                    intent.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"audio/*", "application/ogg", "video/mp4"});
                    titulo = "Elige tu grabación";
                } else {
                    intent = new Intent(Intent.ACTION_GET_CONTENT);
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                    intent.setType("image/*");
                    titulo = "Elige tu foto";
                }
                try {
                    startActivityForResult(esAudio ? intent : Intent.createChooser(intent, titulo), SOLICITUD_FOTO);
                } catch (Exception e) {
                    callbackFoto = null;
                    return false;
                }
                return true;
            }
        });

        webView.loadUrl("file:///android_asset/index.html");
        ocultarBarras();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == SOLICITUD_FOTO && callbackFoto != null) {
            Uri[] resultado = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
            callbackFoto.onReceiveValue(resultado);
            callbackFoto = null;
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            ocultarBarras();
        }
    }

    @SuppressWarnings("deprecation")
    private void ocultarBarras() {
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
    }

    @Override
    protected void onPause() {
        webView.onPause();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        webView.onResume();
        if (actualizador != null) actualizador.alRegresar();
    }

    /** Lo que el juego puede llamar desde JavaScript como window.AndroidVoz.hablar("..."). */
    private class PuenteVoz {
        @JavascriptInterface
        public boolean hablar(String texto) {
            if (!vozLista) return false;
            voz.speak(texto, TextToSpeech.QUEUE_FLUSH, null, "frase");
            return true;
        }
    }

    /** Versión instalada y búsqueda manual de actualizaciones (botón en Configuración). */
    private class PuenteApp {
        @JavascriptInterface
        public String version() {
            return actualizador.versionTexto();
        }

        @JavascriptInterface
        public void buscarActualizacion() {
            actualizador.buscar(true);
        }
    }

    @Override
    protected void onDestroy() {
        if (actualizador != null) actualizador.cerrar();
        if (voz != null) voz.shutdown();
        webView.destroy();
        super.onDestroy();
    }
}
