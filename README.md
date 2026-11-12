# Turbo Monedas

Juego para Android: nivel 1 de plataformas 2D y nivel 2 de carreras en 3D, con el personaje creado desde una foto.

## Instalar en el celular

1. Abre la sección **Releases** de este repositorio desde el celular.
2. Descarga `TurboMonedas.apk` de la versión más reciente.
3. Ábrelo y permite "instalar apps de origen desconocido".

Cada cambio que se sube a `main` compila un APK nuevo automáticamente (pestaña **Actions**).
Se instala encima del anterior sin perder tu foto ni tu configuración.

## Estructura

- `app/src/main/assets/index.html` y `app/src/main/assets/js/` — el juego (HTML + JavaScript)
  - `base.js` pantalla, configuración, voz, sonido y controles
  - `nivel1-plataformas.js` nivel 1
  - `nivel2-carrera.js` nivel 2
  - `pantallas.js` foto del personaje y menús
  - `principal.js` bucle del juego y cambio de nivel
- `app/src/main/java/.../MainActivity.java` — contenedor Android (pantalla completa y selector de fotos)
- `.github/workflows/compilar-apk.yml` — compilación automática del APK
