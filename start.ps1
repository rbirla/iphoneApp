$ADB = "C:\Users\rahul\AppData\Local\Android\Sdk\platform-tools\adb.exe"

# Set up port forwarding for both common ports
& $ADB reverse tcp:8081 tcp:8081
& $ADB reverse tcp:8082 tcp:8082

Write-Host "ADB port forwarding set up" -ForegroundColor Green

# Start backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\AppDev\App Idea'; .venv\Scripts\python.exe -m uvicorn backend.getChannels:app --reload --host 0.0.0.0 --port 8000"

Write-Host "Backend starting on port 8000" -ForegroundColor Green

# Start frontend
Set-Location "C:\AppDev\App Idea\frontend"
npx expo start
