start "Satisfactory" "C:\Program Files (x86)\Steam\steamapps\common\Satisfactory\FactoryGame.exe"
start "child" "C:\Users\Kisuna\AppData\Local\FactoryGame\SatisfactorySynchronizer\runFirstTime.bat"
timeout 1
cd "C:\Users\Kisuna\AppData\Local\FactoryGame\SatisfactorySynchronizer\src"
node "index.js"
@pause