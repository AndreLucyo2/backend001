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
echo [1/3] Atualizando dependencias (npm install)...
npm install
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Erro ao instalar dependencias!
    pause
    exit /b %ERRORLEVEL%
)

REM Passo 2: Rodar build
echo.
echo [2/3] Gerando build (npm run build)...
npm run build
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Erro ao gerar o build!
    pause
    exit /b %ERRORLEVEL%
)

REM Passo 3: Iniciar servidor
echo.
echo [3/3] Iniciando servidor...
echo =====================================
node dist/server.js
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Erro ao iniciar o servidor!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ✅ Servidor finalizado.
pause
