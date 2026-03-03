Write-Host "[nexus] Building TypeScript..."
npm run build
if ($LASTEXITCODE -ne 0) { Write-Error "TypeScript build failed"; exit 1 }

Write-Host "[nexus] Packaging with pkg..."
npx pkg dist/index.js --config package.json --output nexus-server.exe
if ($LASTEXITCODE -ne 0) { Write-Error "pkg packaging failed"; exit 1 }

Write-Host "[nexus] Done: nexus-server.exe"
