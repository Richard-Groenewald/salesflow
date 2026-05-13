echo.
echo  SalesFlow server starting on port 8080...
echo  Keep this window open while using SalesFlow.
echo.
timeout /t 1 >nul
start "" "http://localhost:8080"
node server.js
