@echo off
title Teste de Segurança - TubeMiner
color 0E

echo ========================================
echo    TESTE DE SEGURANCA - TUBEMINER
echo ========================================
echo.

echo [1/5] Testando Rate Limiting...
echo Fazendo 6 tentativas de login rapidas...
echo.

for /l %%i in (1,1,6) do (
    echo Tentativa %%i/6...
    curl -X POST http://localhost:3000/api/clientes/login -H "Content-Type: application/json" -d "{\"email\":\"test@test.com\",\"senha\":\"123456\"}" 2>nul | findstr "error"
    timeout /t 1 >nul
)

echo.
echo [2/5] Verificando logs de segurança...
if exist logs\security.log (
    echo Logs de seguranca encontrados:
    type logs\security.log | findstr "BRUTE_FORCE\|LOGIN_FAILED" | tail -5
) else (
    echo Nenhum log de seguranca encontrado ainda.
)

echo.
echo [3/5] Verificando headers de seguranca...
curl -I http://localhost:3000 2>nul | findstr "X-Content-Type-Options\|X-Frame-Options\|X-XSS-Protection"

echo.
echo [4/5] Testando validacao de entrada...
echo Tentativa com email invalido:
curl -X POST http://localhost:3000/api/clientes/login -H "Content-Type: application/json" -d "{\"email\":\"email-invalido\",\"senha\":\"123\"}" 2>nul

echo.
echo [5/5] Verificando backup automatico...
if exist backups\ (
    echo Diretorio de backup encontrado:
    dir backups\ /b
) else (
    echo Diretorio de backup nao encontrado.
)

echo.
echo ========================================
echo    TESTE CONCLUIDO
echo ========================================
echo.
echo Para verificar logs completos:
echo - Seguranca: logs\security.log
echo - Acesso: logs\access.log
echo - Erro: logs\error.log
echo.
pause

