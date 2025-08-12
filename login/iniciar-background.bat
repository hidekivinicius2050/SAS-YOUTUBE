@echo off
title Sistema TubeMiner
color 0A
cls

echo ========================================
echo    SISTEMA TUBEMINER
echo ========================================
echo.
echo Iniciando o servidor TubeMiner...
echo.
echo O sistema estara disponivel em:
echo - Cliente: http://localhost:3000
echo - Admin: http://localhost:3000/admin
echo.
echo Credenciais de teste:
echo - Cliente: joao@exemplo.com / 123456
echo - Admin: admin@tubeminer.com / admin123
echo.
echo ========================================
echo    LOG DO SERVIDOR
echo ========================================
echo.

cd /d "C:\Users\samur\Downloads\Projeto-youtube\login"

echo Iniciando em 3 segundos...
timeout /t 3 /nobreak >nul

echo Executando servidor...
echo.
node server.js

echo.
echo ========================================
echo    SERVIDOR PARADO
echo ========================================
echo.
echo O servidor foi parado.
echo.
echo Pressione qualquer tecla para fechar...
pause >nul
