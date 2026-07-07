@echo off
set PATH=C:\Program Files\Git\cmd;%PATH%

set /p msg="Nhap mo ta thay doi: "

git add .
git commit -m "%msg%"
git push origin main

echo.
echo ✅ Da push len GitHub! Vercel se tu dong deploy...
pause
