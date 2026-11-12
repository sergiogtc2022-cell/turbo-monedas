package com.turbomonedas.juego;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.Settings;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Revisa en GitHub si hay un APK más nuevo que el instalado, lo descarga y abre el instalador.
 * La versión se compara con el número de compilación: la etiqueta "v0.1.N" corresponde a versionCode N.
 * Requiere que el repositorio sea público (si es privado, GitHub responde 404 y no se ofrece nada).
 */
class Actualizador {

    private static final String URL_ULTIMA =
            "https://api.github.com/repos/sergiogtc2022-cell/turbo-monedas/releases/latest";

    private final Activity actividad;
    private long idDescarga = -1;
    private String pendienteUrl, pendienteEtiqueta;   // si hubo que pedir el permiso de instalar

    Actualizador(Activity actividad) {
        this.actividad = actividad;
        IntentFilter filtro = new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE);
        if (Build.VERSION.SDK_INT >= 33) {
            actividad.registerReceiver(finDescarga, filtro, Context.RECEIVER_EXPORTED);
        } else {
            actividad.registerReceiver(finDescarga, filtro);
        }
    }

    int versionInstalada() {
        try {
            PackageInfo p = actividad.getPackageManager().getPackageInfo(actividad.getPackageName(), 0);
            return Build.VERSION.SDK_INT >= 28 ? (int) p.getLongVersionCode() : p.versionCode;
        } catch (Exception e) {
            return 0;
        }
    }

    /** avisarSiNoHay = true cuando el jugador tocó "Buscar actualizaciones". */
    void buscar(boolean avisarSiNoHay) {
        new Thread(() -> {
            try {
                HttpURLConnection c = (HttpURLConnection) new URL(URL_ULTIMA).openConnection();
                c.setRequestProperty("Accept", "application/vnd.github+json");
                c.setRequestProperty("User-Agent", "TurboMonedas");
                c.setConnectTimeout(8000);
                c.setReadTimeout(8000);
                int codigo = c.getResponseCode();
                if (codigo != 200) {
                    if (avisarSiNoHay) {
                        aviso(codigo == 404
                                ? "No se encontraron versiones (¿el repositorio es privado?)"
                                : "No se pudo revisar (" + codigo + ")");
                    }
                    return;
                }
                StringBuilder sb = new StringBuilder();
                try (BufferedReader r = new BufferedReader(new InputStreamReader(c.getInputStream(), "UTF-8"))) {
                    String linea;
                    while ((linea = r.readLine()) != null) sb.append(linea);
                }
                JSONObject o = new JSONObject(sb.toString());
                String etiqueta = o.getString("tag_name");
                int remota = Integer.parseInt(etiqueta.substring(etiqueta.lastIndexOf('.') + 1));
                String url = null;
                JSONArray archivos = o.getJSONArray("assets");
                for (int i = 0; i < archivos.length(); i++) {
                    JSONObject a = archivos.getJSONObject(i);
                    if (a.getString("name").endsWith(".apk")) {
                        url = a.getString("browser_download_url");
                        break;
                    }
                }
                if (url != null && remota > versionInstalada()) {
                    final String u = url;
                    actividad.runOnUiThread(() -> ofrecer(etiqueta, u));
                } else if (avisarSiNoHay) {
                    aviso("Ya tienes la versión más reciente (" + versionTexto() + ")");
                }
            } catch (Exception e) {
                if (avisarSiNoHay) aviso("Sin conexión para revisar actualizaciones");
            }
        }).start();
    }

    String versionTexto() {
        return "v0.1." + versionInstalada();
    }

    private void ofrecer(String etiqueta, String url) {
        if (actividad.isFinishing()) return;
        new AlertDialog.Builder(actividad)
                .setTitle("Nueva versión disponible")
                .setMessage("Hay una versión nueva de Turbo Monedas (" + etiqueta + "). "
                        + "¿Actualizar ahora? Tu foto y tu configuración se conservan.")
                .setPositiveButton("Actualizar", (d, w) -> descargar(url, etiqueta))
                .setNegativeButton("Después", null)
                .show();
    }

    private void descargar(String url, String etiqueta) {
        if (Build.VERSION.SDK_INT >= 26 && !actividad.getPackageManager().canRequestPackageInstalls()) {
            pendienteUrl = url;
            pendienteEtiqueta = etiqueta;
            aviso("Activa \"Permitir de esta fuente\" y regresa al juego");
            actividad.startActivity(new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                    Uri.parse("package:" + actividad.getPackageName())));
            return;
        }
        DownloadManager dm = (DownloadManager) actividad.getSystemService(Context.DOWNLOAD_SERVICE);
        DownloadManager.Request r = new DownloadManager.Request(Uri.parse(url));
        r.setTitle("Turbo Monedas " + etiqueta);
        r.setMimeType("application/vnd.android.package-archive");
        r.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
        r.setDestinationInExternalFilesDir(actividad, Environment.DIRECTORY_DOWNLOADS,
                "TurboMonedas-" + etiqueta + ".apk");
        idDescarga = dm.enqueue(r);
        aviso("Descargando actualización…");
    }

    /** Llamar desde onResume: si el jugador acaba de dar el permiso de instalar, continúa la descarga. */
    void alRegresar() {
        if (pendienteUrl != null && Build.VERSION.SDK_INT >= 26
                && actividad.getPackageManager().canRequestPackageInstalls()) {
            String u = pendienteUrl, e = pendienteEtiqueta;
            pendienteUrl = null;
            pendienteEtiqueta = null;
            descargar(u, e);
        }
    }

    void cerrar() {
        try {
            actividad.unregisterReceiver(finDescarga);
        } catch (Exception ignorada) {
            // ya estaba desregistrado
        }
    }

    private final BroadcastReceiver finDescarga = new BroadcastReceiver() {
        @Override
        public void onReceive(Context contexto, Intent intent) {
            long id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1);
            if (id != idDescarga) return;
            DownloadManager dm = (DownloadManager) actividad.getSystemService(Context.DOWNLOAD_SERVICE);
            Uri apk = dm.getUriForDownloadedFile(id);
            if (apk == null) {
                aviso("La descarga falló; inténtalo de nuevo");
                return;
            }
            Intent instalar = new Intent(Intent.ACTION_VIEW);
            instalar.setDataAndType(apk, "application/vnd.android.package-archive");
            instalar.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            try {
                actividad.startActivity(instalar);
            } catch (Exception e) {
                aviso("Abre la notificación de descarga para instalar");
            }
        }
    };

    private void aviso(String texto) {
        actividad.runOnUiThread(() -> Toast.makeText(actividad, texto, Toast.LENGTH_LONG).show());
    }
}
