# Push Brief to GitHub
# 1. Create a new repo at https://github.com/new (name: brief, no README)
# 2. Run this script: .\push-to-github.ps1 -Username YOUR_GITHUB_USERNAME

param(
    [Parameter(Mandatory=$true)]
    [string]$Username
)

$repoUrl = "https://github.com/$Username/brief.git"
Set-Location $PSScriptRoot

if (git remote get-url origin 2>$null) {
    git remote remove origin
}
git remote add origin $repoUrl
git push -u origin main

Write-Host "`nDone! Repo: https://github.com/$Username/brief" -ForegroundColor Green
