# Script to package the Super Note App for submission
$projectName = "Super_Note_App_Source"
$rootPath = Resolve-Path "$PSScriptRoot/.."
$destinationZip = "$rootPath/$projectName.zip"
$tempFolder = "$rootPath/submission_temp"

# 1. Clean up old files
if (Test-Path $destinationZip) { Remove-Item $destinationZip }
if (Test-Path $tempFolder) { Remove-Item -Recurse -Force $tempFolder }

# 2. Create temp folder
New-Item -ItemType Directory -Path $tempFolder

# 3. Copy files (excluding heavy directories)
Write-Host "Copying files from $rootPath..." -ForegroundColor Cyan
Copy-Item -Path "$rootPath/backend", "$rootPath/frontend", "$rootPath/database", "$rootPath/docker-compose.yml", "$rootPath/README.md", "$rootPath/.gitignore", "$rootPath/LICENSE" -Destination $tempFolder -Recurse -Exclude "node_modules", "vendor", "dist", "mysql_data", ".env", ".git"

# 4. Clean up unnecessary files inside the copy
Remove-Item -Recurse -Force "$tempFolder/frontend/node_modules" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$tempFolder/backend/vendor" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$tempFolder/frontend/dist" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$tempFolder/database/mysql_data" -ErrorAction SilentlyContinue

# 5. Zip the temp folder
Write-Host "Zipping files into $destinationZip..." -ForegroundColor Green
Compress-Archive -Path "$tempFolder/*" -DestinationPath $destinationZip

# 6. Clean up temp folder
Remove-Item -Recurse -Force $tempFolder

Write-Host "Successfully created $destinationZip" -ForegroundColor Yellow
Write-Host "Please check the zip file before submitting."
