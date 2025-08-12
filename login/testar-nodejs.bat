@echo off
title Teste Node.js
color 0B
cls

echo ========================================
echo    TESTE DE INSTALACAO DO NODE.JS
echo ========================================
echo.

echo Testando Node.js...
node --version
if %errorlevel% neq 0 (
    echo.
    echo [FALHOU] Node.js nao esta instalado!
    echo.
    echo Instrucoes:
    echo 1. Vá para https://nodejs.org/
    echo 2. Baixe a versao LTS
    echo 3. Instale como administrador
    echo 4. Reinicie o computador
    echo.
) else (
    echo.
    echo [SUCESSO] Node.js encontrado!
    echo.
)

echo Testando npm...
npm --version
if %errorlevel% neq 0 (
    echo.
    echo [FALHOU] npm nao esta disponivel!
    echo.
) else (
    echo.
    echo [SUCESSO] npm encontrado!
    echo.
)

echo.
echo ========================================
echo.
echo Pressione qualquer tecla para fechar...
pause >nul




