@echo off
echo Iniciando servidor Node.js...
echo Mantenha esta janela aberta para manter o servidor Node.js em execução.

echo.

echo [1/2] Atualizando dependencias (npm install)...
npm install --only=production
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Erro ao instalar dependencias!
    pause
    exit /b %ERRORLEVEL%
)

cd /d "%~dp0"
node dist/server.js
pause

