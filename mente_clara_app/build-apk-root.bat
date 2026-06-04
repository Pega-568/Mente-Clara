@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo   GENERANDO APK - MENTE CLARA
echo ==========================================

cd /d "%~dp0"

set JAVA_HOME=D:\Android\jbr
set PATH=%JAVA_HOME%\bin;%PATH%

echo.
echo Verificando Java...
java -version

echo.
echo Limpiando APK anterior...
if exist "MenteClara-debug.apk" del "MenteClara-debug.apk"

echo.
echo Generando build web...
call npm run build

if errorlevel 1 (
    echo.
    echo ERROR: Fallo npm run build
    pause
    exit /b 1
)

echo.
echo Sincronizando Capacitor con Android...
call npx cap sync android

if errorlevel 1 (
    echo.
    echo ERROR: Fallo npx cap sync android
    pause
    exit /b 1
)

echo.
echo Compilando APK Android...
cd android
call gradlew assembleDebug

if errorlevel 1 (
    echo.
    echo ERROR: Fallo la compilacion de Gradle
    pause
    exit /b 1
)

cd ..

echo.
echo Copiando APK a la carpeta raiz del proyecto...

copy "android\app\build\outputs\apk\debug\app-debug.apk" "MenteClara-debug.apk" /Y

if errorlevel 1 (
    echo.
    echo ERROR: No se pudo copiar el APK a la raiz
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   APK GENERADO CORRECTAMENTE
echo ==========================================
echo.
echo Archivo final:
echo %cd%\MenteClara-debug.apk
echo.

pause
endlocal
