@echo off
echo Iniciando servidor Node.js...
echo Mantenha esta janela aberta para manter o servidor Node.js em execução.
echo.
cd /d "%~dp0"
node dist/server.js
pause
