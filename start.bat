@echo off
title THE NEXUS // DISPATCH - News Portal & AI Agent
echo ========================================================
echo   THE NEXUS // DISPATCH - Automated AI News Portal
echo ========================================================
echo.
echo Starting local web server on port 5050...
start "" "http://localhost:5050"
node server.js
pause
