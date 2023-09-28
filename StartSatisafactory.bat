@REM start "Satisfactory" "D:\Steam\steamapps\common\Satisfactory\FactoryGame.exe"
start "child" "C:\Users\JARVIS\AppData\Local\FactoryGame\SatisfactorySynchronizer\runFirstTime.bat"
timeout 1
cd "C:\Users\JARVIS\AppData\Local\FactoryGame\SatisfactorySynchronizer\src"
node "index.js"
@pause