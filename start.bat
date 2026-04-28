@echo off
echo Starting RoeBook Project...

echo Starting Backend Server (localhost:5000)...
start cmd /k "cd backend && npm run dev"

echo Starting Frontend Server (localhost:5173)...
start cmd /k "cd vite-project && npm run dev"

echo Both servers are starting up in new windows!
