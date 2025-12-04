# 專案結構測試腳本
Write-Host "=== 專案結構測試 ===" -ForegroundColor Cyan
Write-Host ""

# 1. 文件結構測試
Write-Host "1. 文件結構測試" -ForegroundColor Yellow
Write-Host ""

$requiredJS = @('js/auth.js', 'js/script.js', 'js/supabase-api.js', 'js/supabase-config.js', 'js/github-api.js')
$requiredCSS = @('css/styles.css')
$requiredHTML = @('index.html', 'upload.html', 'detail.html', 'login.html', 'register.html', 'test-supabase.html')

$allPassed = $true

Write-Host "檢查 JS 文件:" -ForegroundColor White
foreach ($file in $requiredJS) {
    if (Test-Path $file) {
        Write-Host "  [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $file 不存在" -ForegroundColor Red
        $allPassed = $false
    }
}

Write-Host ""
Write-Host "檢查 CSS 文件:" -ForegroundColor White
foreach ($file in $requiredCSS) {
    if (Test-Path $file) {
        Write-Host "  [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $file 不存在" -ForegroundColor Red
        $allPassed = $false
    }
}

Write-Host ""
Write-Host "檢查 HTML 文件:" -ForegroundColor White
foreach ($file in $requiredHTML) {
    if (Test-Path $file) {
        Write-Host "  [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $file 不存在" -ForegroundColor Red
        $allPassed = $false
    }
}

Write-Host ""
Write-Host "2. 路徑引用檢查" -ForegroundColor Yellow
Write-Host ""

foreach ($htmlFile in $requiredHTML) {
    if (-not (Test-Path $htmlFile)) {
        continue
    }
    
    $content = Get-Content $htmlFile -Raw -Encoding UTF8
    $hasError = $false
    
    # 檢查 CSS 路徑
    $cssMatches = [regex]::Matches($content, 'href=["'']([^"'']*\.css[^"'']*)["'']')
    foreach ($match in $cssMatches) {
        $path = $match.Groups[1].Value
        if ($path -notlike 'css/*' -and $path -ne 'favicon.svg') {
            Write-Host "  [ERROR] $htmlFile : CSS 路徑錯誤 - $path" -ForegroundColor Red
            $hasError = $true
            $allPassed = $false
        }
    }
    
    # 檢查 JS 路徑
    $jsMatches = [regex]::Matches($content, 'src=["'']([^"'']*\.js[^"'']*)["'']')
    foreach ($match in $jsMatches) {
        $path = $match.Groups[1].Value
        if ($path -notlike 'js/*' -and $path -notlike 'http*' -and $path -ne '') {
            Write-Host "  [ERROR] $htmlFile : JS 路徑錯誤 - $path" -ForegroundColor Red
            $hasError = $true
            $allPassed = $false
        }
    }
    
    if (-not $hasError) {
        Write-Host "  [OK] $htmlFile 路徑正確" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "3. JavaScript 語法檢查" -ForegroundColor Yellow
Write-Host ""

foreach ($jsFile in $requiredJS) {
    if (-not (Test-Path $jsFile)) {
        continue
    }
    
    $content = Get-Content $jsFile -Raw -Encoding UTF8
    $openBraces = ([regex]::Matches($content, '\{')).Count
    $closeBraces = ([regex]::Matches($content, '\}')).Count
    $openParens = ([regex]::Matches($content, '\(')).Count
    $closeParens = ([regex]::Matches($content, '\)')).Count
    
    if ($openBraces -eq $closeBraces -and $openParens -eq $closeParens) {
        Write-Host "  [OK] $jsFile 語法正確" -ForegroundColor Green
    } else {
        Write-Host "  [WARNING] $jsFile 括號不匹配:" -ForegroundColor Yellow
        if ($openBraces -ne $closeBraces) {
            Write-Host "    大括號: 開=$openBraces, 閉=$closeBraces" -ForegroundColor Yellow
        }
        if ($openParens -ne $closeParens) {
            Write-Host "    小括號: 開=$openParens, 閉=$closeParens" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "4. CSS 語法檢查" -ForegroundColor Yellow
Write-Host ""

foreach ($cssFile in $requiredCSS) {
    if (-not (Test-Path $cssFile)) {
        continue
    }
    
    $content = Get-Content $cssFile -Raw -Encoding UTF8
    $openBraces = ([regex]::Matches($content, '\{')).Count
    $closeBraces = ([regex]::Matches($content, '\}')).Count
    
    if ($openBraces -eq $closeBraces) {
        Write-Host "  [OK] $cssFile 語法正確 (大括號: $openBraces)" -ForegroundColor Green
    } else {
        Write-Host "  [WARNING] $cssFile 大括號不匹配: 開=$openBraces, 閉=$closeBraces" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "5. Git 狀態檢查" -ForegroundColor Yellow
Write-Host ""

$gitStatus = git status --short 2>$null
if ($gitStatus) {
    $deleted = ($gitStatus | Where-Object { $_ -match '^ D' }).Count
    $added = ($gitStatus | Where-Object { $_ -match '^A ' }).Count
    $modified = ($gitStatus | Where-Object { $_ -match '^M ' }).Count
    $untracked = ($gitStatus | Where-Object { $_ -match '^\?\?' }).Count
    
    Write-Host "  已刪除文件: $deleted" -ForegroundColor Green
    Write-Host "  已新增文件: $added" -ForegroundColor Green
    Write-Host "  已修改文件: $modified" -ForegroundColor Green
    if ($untracked -gt 0) {
        Write-Host "  未追蹤文件: $untracked" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [OK] 沒有未提交的更改" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== 測試總結 ===" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "[SUCCESS] 所有基本測試通過！可以安全地提交到 Git。" -ForegroundColor Green
} else {
    Write-Host "[FAILED] 有測試失敗，請先修復問題再提交。" -ForegroundColor Red
}


