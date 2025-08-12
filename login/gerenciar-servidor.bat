@echo off
title Gerenciador do Servidor TubeMiner
color 0A

echo ========================================
echo    GERENCIADOR DO SERVIDOR TUBEMINER
echo ========================================
echo.

:menu
echo Escolha uma opcao:
echo.
echo 1. Iniciar servidor
echo 2. Parar servidor
echo 3. Verificar status
echo 4. Sair
echo.
set /p opcao="Digite sua opcao (1-4): "

if "%opcao%"=="1" goto iniciar
if "%opcao%"=="2" goto parar
if "%opcao%"=="3" goto status
if "%opcao%"=="4" goto sair
echo Opcao invalida!
goto menu

:iniciar
echo.
echo Verificando se a porta 3000 esta livre...
netstat -ano | findstr :3000 >nul
if %errorlevel%==0 (
    echo Porta 3000 ja esta em uso!
    echo Parando processo anterior...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        taskkill /PID %%a /F >nul 2>&1
    )
    timeout /t 2 >nul
)
echo Iniciando servidor...
npm start
goto menu

:parar
echo.
echo Parando servidor...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Parando processo PID: %%a
    taskkill /PID %%a /F >nul 2>&1
)
echo Servidor parado!
pause
goto menu

:status
echo.
echo Verificando status do servidor...
netstat -ano | findstr :3000 >nul
if %errorlevel%==0 (
    echo [STATUS] Servidor RODANDO na porta 3000
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        echo [PID] %%a
    )
) else (
    echo [STATUS] Servidor PARADO
)
echo.
pause
goto menu

:sair
echo.
echo Saindo...
exit

