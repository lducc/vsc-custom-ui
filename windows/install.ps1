# Run from the repo clone at C:\code\vsc-custom-ui. Backs up and replaces the VS Code user settings.
$settings = "$env:APPDATA\Code\User\settings.json"
git -C C:\code\vsc-custom-ui pull
if (Test-Path $settings) { Copy-Item $settings "$settings.bak" -Force }
Copy-Item C:\code\vsc-custom-ui\windows\settings.json $settings -Force
Write-Host "Done. In VS Code run: Reload Custom CSS and JS"
