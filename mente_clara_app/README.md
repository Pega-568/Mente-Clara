# Mente Clara – Aplicación Android

App de juegos cognitivos para adultos mayores. Generada con React + Vite y empaquetada como APK nativo mediante Capacitor.

---

## Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| Node.js | 18+ |
| Java JDK | 17 (Temurin recomendado) |
| Android Studio | Hedgehog 2023+ |
| Android SDK | API 22+ (Android 5.0) |

Asegúrate de que `JAVA_HOME` y `ANDROID_HOME` estén configurados en tus variables de entorno.

---

## Estructura del proyecto

```
mente_clara_app/
├── src/                  # Código fuente React
│   ├── App.jsx           # HashRouter (requerido para APK)
│   ├── games/            # 5 juegos cognitivos
│   ├── pages/            # Páginas (Inicio, Juegos, Dificultad, Resultado)
│   ├── data/             # Datos JSON de los juegos
│   ├── services/         # progressService.js (localStorage)
│   └── utils/            # shuffle, scoring, gameConfig
├── android/              # Proyecto Android nativo (Capacitor)
├── dist/                 # Build de producción (generado)
└── capacitor.config.json # Configuración Capacitor
```

---

## Generar el APK paso a paso

### 1. Instalar dependencias (primera vez)

```bash
cd mente_clara_app
npm install
```

### 2. Compilar la app web

```bash
npm run build
```
Esto genera la carpeta `dist/`.

### 3. Sincronizar con Android

```bash
npx cap sync android
```

### 4. Compilar el APK debug

```bash
cd android
.\gradlew.bat assembleDebug
```

El APK se genera en:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### 5. (Opcional) Instalar directamente en un dispositivo conectado

```bash
.\gradlew.bat installDebug
```

---

## Flujo de desarrollo rápido

Cada vez que modifiques el código React:

```bash
# 1. Reconstruir
npm run build

# 2. Sincronizar assets a Android
npx cap sync android

# 3. Recompilar APK
cd android && .\gradlew.bat assembleDebug
```

---

## Abrir en Android Studio

```bash
npx cap open android
```

Desde Android Studio puedes:
- Ejecutar en emulador (`Shift+F10`)
- Generar APK release firmado (`Build → Generate Signed Bundle/APK`)
- Ver logs de la WebView

---

## APK Release (producción)

Para generar un APK firmado para distribución:

1. En Android Studio: `Build → Generate Signed Bundle / APK`
2. Crea o selecciona un keystore
3. Elige `APK → release`
4. El APK quedará en `android/app/release/`

Alternativamente con Gradle:

```bash
cd android
.\gradlew.bat assembleRelease
```

---

## Notas técnicas importantes

| Aspecto | Detalle |
|---|---|
| **Router** | Se usa `HashRouter` (no `BrowserRouter`) para compatibilidad con `file://` en APK |
| **Fuentes** | Atkinson Hyperlegible Next cargada desde Google Fonts (requiere internet la primera vez) |
| **Persistencia** | `localStorage` nativo del WebView de Android — persiste entre sesiones |
| **Clave localStorage** | `mente_clara_progress` |
| **Sin backend** | 100% offline — todos los datos están en JSON locales en el APK |
| **Sin login** | No implementado por diseño inicial |

---

## Juegos incluidos

| Juego | Fácil | Medio |
|---|---|---|
| Parejas de memoria | 4 cartas, 2 pares | 6 cartas, 3 pares |
| Secuencia de colores | 3 colores, 3 rondas | 4 colores, 3 rondas |
| Imagen y palabra | 2 opciones, 5 rondas | 3 opciones, 5 rondas |
| Objeto intruso | 4 objetos, 5 rondas | 5 objetos, 5 rondas |
| Ordenar pasos | 3 pasos, 3 rondas | 4 pasos, 3 rondas |
