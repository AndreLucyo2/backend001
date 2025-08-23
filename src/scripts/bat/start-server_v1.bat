@echo off
title Servidor Node.js - Backend001

echo ================================
echo Iniciando servidor Node.js...
echo Mantenha esta janela aberta.
echo ================================
echo.

REM Ir para a pasta do script
cd /d "%~dp0"

REM Passo 1: Atualizar dependencias
echo [1/2] Atualizando dependencias (npm install)...
npm install --only=production
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Erro ao instalar dependencias!
    pause
    exit /b %ERRORLEVEL%
)

REM Passo 2: Iniciar servidor (mantém a janela aberta)
echo.
echo [2/2] Servidor em execucao...
echo =====================================
node dist/server.js

REM Se o servidor cair, exibe msg e espera
echo.
echo ❌ Servidor foi finalizado.
pause
