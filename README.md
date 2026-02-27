# Rate It

App móvil para calificar películas, series, libros, juegos, música y podcasts. Todo en un solo lugar, con social feed y challenges para competir con amigos.

## Qué hace

Organiza todo lo que ves, lees o escuchas sin tener que usar 7 apps distintas. Califica con un slider animado, guarda tus favoritos por categoría, compite en challenges anuales y sigue a tus amigos para ver qué están consumiendo.

Básicamente, si te gusta llevar control de lo que consumes culturalmente pero odias tener Letterboxd, Goodreads, Spotify wrapped y mil apps más, esto es para ti.

## Estado actual

- [x] Funciona en iOS y Android
- [x] Sistema de calificaciones con slider interactivo
- [x] Guardados organizados por categorías
- [x] Feed social y sistema de follows
- [x] Challenges anuales con progreso
- [x] Búsqueda integrada con múltiples APIs
- [ ] Tests automatizados
- [ ] Notificaciones push
- [ ] Sistema de comentarios

## Stack técnico

**Frontend:**
- React Native 0.81 + Expo 54
- NativeWind (Tailwind CSS para React Native)
- React Native Reanimated (animaciones fluidas)
- Expo Router (navegación basada en archivos)

**Backend:**
- Supabase (autenticación, base de datos PostgreSQL, storage)
- React Query (manejo de datos y caché)
- Zustand (state management)

**APIs externas:**
- TMDB (películas y series)
- iTunes API (música y álbumes)
- Google Books API (libros)
- RAWG (videojuegos)
- Podcast Index (podcasts)

## Requisitos previos

- Node.js 18 o superior
- Expo CLI instalado globalmente: `npm install -g expo-cli`
- Para iOS: Mac con Xcode instalado
- Para Android: Android Studio con un emulador configurado
- Cuenta de Supabase (gratis)

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/Loourx/rate-it.git
cd rate-it
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:

Crea un archivo `.env` en la raíz del proyecto y añade:
```bash
EXPO_PUBLIC_SUPABASE_URL=tu_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
EXPO_PUBLIC_TMDB_API_KEY=tu_tmdb_key
EXPO_PUBLIC_RAWG_API_KEY=tu_rawg_key
```

4. Aplica las migraciones de base de datos:

En tu proyecto de Supabase, ejecuta los scripts SQL que están en `/supabase/migrations`.

## Cómo usar

Para correr el proyecto en desarrollo:

```bash
# Inicia el servidor de desarrollo
npm start
```

Esto abrirá Expo Developer Tools en tu navegador. Desde ahí puedes:

- Presionar `i` para abrir en iOS Simulator
- Presionar `a` para abrir en Android Emulator
- Escanear el QR con Expo Go en tu teléfono física

O usa los comandos directos:
```bash
npm run ios      # Abre directo en iOS
npm run android  # Abre directo en Android
```

Primera vez que entras: crea tu cuenta, explora el feed social o busca algo para calificar (tap en la lupa).

## Estructura del proyecto

```
app/                   # Pantallas (Expo Router)
  (auth)/             # Login/registro
  (tabs)/             # Navegación principal (feed, search, rate, profile)
  content/[type]/     # Detalles de películas, libros, etc.
  profile/            # Perfiles de usuarios

components/           # Componentes reutilizables
  card/              # Sistema de cards
  content/           # Búsqueda, trending, detalles
  profile/           # Bookmarks, stats, challenges
  rating/            # Slider de calificación
  social/            # Features sociales
  ui/                # Botones, estados vacíos, etc.

lib/
  api/               # Conexiones a APIs externas
  hooks/             # Custom hooks
  stores/            # Estado global con Zustand
  types/             # Definiciones de TypeScript
  utils/             # Funciones helper y constantes

supabase/
  migrations/        # Scripts SQL para la base de datos
```

## Características destacadas

- **Slider de calificación fluido**: Sistema de rating 0-10 con interpolación logarítmica para movimiento natural a 60fps
- **Búsqueda por carpetas**: Navegación tipo explorador de archivos en lugar de menús tradicionales
- **Guardados visuales**: Los bookmarks se organizan en cajas con posters en abanico, expandibles en grid
- **Social feed**: Ve qué califican tus amigos en tiempo real
- **Challenges anuales**: Compite para completar metas de películas, libros, juegos
- **Funciona offline**: Los datos se cachean localmente y se sincronizan cuando hay conexión
- **Búsqueda unificada**: Integra TMDB, iTunes, Google Books, RAWG y Podcast Index en una sola búsqueda

## Problemas conocidos

- La búsqueda de podcasts puede ser lenta (limitación del API de Podcast Index)
- En Android 12+ puede haber un flash blanco al iniciar la app
- Con más de 200 bookmarks guardados, el scroll puede tener lag (optimización pendiente)

## Reportar problemas

Si encuentras un bug, abre un issue con:
- Pasos para reproducir el problema
- Device info (iOS/Android + versión del sistema)
- Capturas o video si es algo visual

## Contribuciones

Este es un proyecto personal con visión específica de diseño y UX. Si quieres proponer una feature nueva, abre un issue primero para discutirlo antes de hacer código.

Para contribuir:
```bash
git checkout -b feat/nombre-descriptivo
# haz tus cambios
git commit -m "feat: descripción clara del cambio"
git push origin feat/nombre-descriptivo
```

Los commits siguen [Conventional Commits](https://www.conventionalcommits.org/).

## Licencia y uso

Copyright 2026 - Todos los derechos reservados.

Este código es de fuente abierta para fines educativos y de referencia. No está permitido copiar, redistribuir o usar este código en proyectos comerciales sin autorización explícita.

Si quieres usar algo del proyecto, contacta primero.
