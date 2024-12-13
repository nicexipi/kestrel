# Script PowerShell para Windows

Write-Host "🧪 Executando testes..." -ForegroundColor Blue

# Executa os testes com cobertura
npm run test:coverage

# Verifica o resultado
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Todos os testes passaram!" -ForegroundColor Green
} else {
    Write-Host "❌ Alguns testes falharam" -ForegroundColor Red
    exit 1
}

# Exibe o relatório de cobertura
Write-Host "`n📊 Relatório de Cobertura:" -ForegroundColor Blue
Get-Content coverage/lcov-report/index.html | Select-String -Pattern "fraction" -Context 0,4
