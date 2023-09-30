# SatisfactorySynchronizer

### How to use
1. Run `npm install`
2. Create a StartSatisafactory.bat file with the following script and modify it to your locations
    ```
    start "Satisfactory" "C:\Program Files (x86)\Steam\steamapps\common\Satisfactory\FactoryGame.exe"
    cd "C:\Users\{username}\AppData\Local\FactoryGame\SatisfactorySynchronizer\src"
    node "index.js"
    @pause
    ```
3. Go to your satisfactory shortcut and change the `Target` link to point to `StartSatisafactory.bat`
4. Run your newly created shortcut.
5. Upon exiting Satisfactory, wait 30 seconds for it to sync any changes to the repo before closing the command window.

### Explanation
1. On start of your script, it will pull down and overwrite your local satisfactory save files with the ones from the repo.
2. In intervals of 30s, it will check for any new saves/changes to your save files.
3. Upon detection of a change, it will grab your entire save folder's content, and distribute it to other player's save folders in the repo.


### Future TODOs
1. Restrict only one person to be using the script at any given time.
2. Auto close the script window upon exiting Satisfactory given that it does the last save upload.
3. Instead of overwriting the entire directory while saving new changes to other players, only sync files that are modified.
4. 