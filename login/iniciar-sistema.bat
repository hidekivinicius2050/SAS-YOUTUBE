@echo off
echo Iniciando o sistema TubeMiner...
echo.

cd /d "%~dp0"
echo Diretorio atual: %CD%

echo.
echo Verificando se o Node.js esta instalado...
node --version
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo Por favor, instale o Node.js de https://nodejs.org
    echo e reinicie o computador.
    pause
    exit /b 1
)

echo.
echo Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
    if %errorlevel% neq 0 (
        echo ERRO: Falha ao instalar dependencias!
        pause
        exit /b 1
    )
)

echo.
echo Iniciando servidor...
echo O sistema estara disponivel em: http://localhost:3000
echo.
echo Pressione Ctrl+C para parar o servidor
echo.
npm start

pause
