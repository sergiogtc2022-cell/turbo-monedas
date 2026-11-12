# Merudichis Capuchinis

Juego para Android con la perrita Kiara: modo Historia (plataformas en versión clásica y 4 niveles pixel art: pradera, desierto, cueva y montaña nevada, Gran Premio, La Viborita, Nivel de Kiara y el Zombie Gigante), 4 minijuegos (Kiara-Man, Atrapa los trastes, Kiara saltarina y Memorama familiar), música chiptune original, tienda, récords y personajes con fotos reales por pose.

## Instalar en el celular

1. Abre la sección **Releases** de este repositorio desde el celular.
2. Descarga `MerudichisCapuchinis.apk` de la versión más reciente.
3. Ábrelo y permite "instalar apps de origen desconocido".

Ya instalada, la app revisa sola si hay versión nueva al abrirse (también en Configuración → Buscar actualizaciones).

Cada cambio que se sube a `main` compila un APK nuevo automáticamente (pestaña **Actions**).
Se instala encima del anterior sin perder fotos ni configuración.

## Estructura

- `app/src/main/assets/index.html` y `app/src/main/assets/js/` — el juego (HTML + JavaScript)
  - `base.js` pantalla, configuración, voz, sonido y controles
  - `personajes.js` modelos por default y fotos reales por pose (jugador y Kiara)
  - `nivel1-plataformas.js` nivel 1: bloques, enemigos y meta
  - `kiara.js` poder de Kiara (ataca, ladra y paraliza, o se hace grande para montarla)
  - `nivel2-carrera.js` nivel 2: Gran Premio
  - `nivel3-viborita.js` nivel 3: La Viborita
  - `nivel4-kiara.js` nivel 4: juegas con Kiara (olfatear, excavar, ladrar)
  - `nivel5-jefe.js` nivel 5: el Zombie Gigante
  - `nivel1-pixel.js` niveles pixel art (temáticas, fondos y física estilo plataformas clásicas con medidor P)
  - `niveles-pixel.js` mapas de los niveles 1-2 Desierto, 1-3 Cueva y 1-4 Montaña nevada
  - `pixelart.js` sprites pixel art y dibujo pixel por pixel del personaje y de Kiara
  - `mini-kiaraman.js`, `mini-trastes.js`, `mini-saltarina.js`, `mini-memorama.js` minijuegos
  - `musica.js` música chiptune original y fanfarrias de poderes
  - `progreso.js` banco de monedas, récords, estrellas y compartir récord
  - `tienda.js` tienda de accesorios y ventajas
  - `pantallas.js` menús, selector de niveles, configuración y pantalla de fotos
  - `principal.js` bucle del juego y cambio de nivel
- `app/src/main/java/.../MainActivity.java` — contenedor Android (pantalla completa, selector de archivos, voz)
- `app/src/main/java/.../Actualizador.java` — actualización automática desde Releases
- `.github/workflows/compilar-apk.yml` — compilación automática del APK
