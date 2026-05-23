Set-Location "C:\Users\Admin\Desktop\SITES COURTE DUREE\Site de réservation\Codage"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PUBLICATION SITE DE RESERVATION" -ForegroundColor Cyan
Write-Host "  Paray le Monial" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. git add
Write-Host "1. Ajout des modifications..." -ForegroundColor Yellow
git add -A
Write-Host "   OK" -ForegroundColor Green

# 2. git commit
Write-Host "2. Commit..." -ForegroundColor Yellow
$msg = "Mise a jour - " + (Get-Date -Format "yyyy-MM-dd HH:mm")
git commit -m $msg 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK" -ForegroundColor Green
} else {
    Write-Host "   Rien de nouveau a publier" -ForegroundColor Gray
}

# 3. git push
Write-Host "3. Envoi vers GitHub..." -ForegroundColor Yellow
$push = git push origin main 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK - Render met a jour le site dans 2-3 min" -ForegroundColor Green
} else {
    Write-Host "   ERREUR :" -ForegroundColor Red
    Write-Host $push -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TERMINE !" -ForegroundColor Cyan
Write-Host "  https://paray-appart-location.onrender.com" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "Appuyez sur Entree pour fermer"
