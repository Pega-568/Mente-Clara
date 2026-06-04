@echo off
cd /d "%~dp0mente_clara_app"
call build-apk-root.bat
cd /d "%~dp0"
if exist "mente_clara_app\MenteClara-debug.apk" (
    copy "mente_clara_app\MenteClara-debug.apk" "MenteClara-debug.apk" /Y
    echo APK copiado al directorio raiz del proyecto.
)
