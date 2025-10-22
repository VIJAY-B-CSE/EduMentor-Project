# EduMentor Firebase Deployment Script
# This script ensures a clean build and deployment every time

Write-Host "🚀 Starting EduMentor Deployment Process..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Navigate to edumentor directory (if not already there)
$currentDir = Get-Location
Write-Host "📁 Current directory: $currentDir" -ForegroundColor Yellow

# Step 2: Clean old build folder
Write-Host ""
Write-Host "🧹 Cleaning old build files..." -ForegroundColor Yellow
if (Test-Path "build") {
    Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue
    Write-Host "✅ Old build folder deleted" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No existing build folder found" -ForegroundColor Gray
}

# Step 3: Create fresh production build
Write-Host ""
Write-Host "🔨 Creating fresh production build..." -ForegroundColor Yellow
Write-Host "⏳ This may take a few minutes..." -ForegroundColor Gray
Write-Host ""

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Build failed! Please fix errors and try again." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Build completed successfully!" -ForegroundColor Green

# Step 4: Verify build folder exists
Write-Host ""
Write-Host "🔍 Verifying build folder..." -ForegroundColor Yellow
if (Test-Path "build") {
    $buildSize = (Get-ChildItem build -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "✅ Build folder created (Size: $([math]::Round($buildSize, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "❌ Build folder not found! Build may have failed." -ForegroundColor Red
    exit 1
}

# Step 5: Deploy to Firebase
Write-Host ""
Write-Host "🔥 Deploying to Firebase..." -ForegroundColor Yellow
Write-Host ""

firebase deploy --only hosting --force

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Deployment failed! Please check Firebase configuration." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green

# Step 6: Final instructions
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Clear your browser cache (Ctrl+Shift+R)" -ForegroundColor White
Write-Host "   2. Open your hosted site in incognito mode" -ForegroundColor White
Write-Host "   3. Verify all fixes are working" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Your site should be live at your Firebase hosting URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  If changes don't appear:" -ForegroundColor Yellow
Write-Host "   - Wait 2-3 minutes for CDN cache to clear" -ForegroundColor White
Write-Host "   - Use incognito/private browsing mode" -ForegroundColor White
Write-Host "   - Clear browser cache completely" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

