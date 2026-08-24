Start-Process powershell -ArgumentList "-NoExit", "-Command", "maildev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "stripe listen --forward-to localhost:5000/api/payments/webhook"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backoffice; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python app.py"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd mobile; npx expo run:android"
U?uGb_5yu6fxShJ