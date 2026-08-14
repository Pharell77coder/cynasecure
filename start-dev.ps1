Start-Process powershell -ArgumentList "-NoExit", "-Command", "maildev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "stripe listen --forward-to localhost:5000/api/payments/webhook"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backoffice; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python app.py"

# Démarre l'émulateur Android en arrière-plan (remplace "Pixel_3_API_31" par le vrai nom
# de ton AVD si différent -> visible avec : emulator -list-avds)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "emulator -avd Pixel_3_API_31"

# Attend que l'émulateur soit prêt avant de lancer le build (sinon "device offline")
Write-Host "Attente du démarrage de l'émulateur..."
& adb wait-for-device
do {
    Start-Sleep -Seconds 2
    $boot = & adb shell getprop sys.boot_completed 2>$null
} while ($boot -ne "1")
Write-Host "Émulateur prêt, lancement du build mobile..."

# Build + installe + lance l'app sur l'émulateur, puis attache Metro
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd mobile; npx expo run:android"