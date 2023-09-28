const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git')();
const os = require('os');

const yongji = '76561198214145843';
const kevin = '76561198083081162';
const machineID = path.basename(os.homedir());

const otherSaveFolder = machineID.toLowerCase() === 'kisuna' ? kevin : yongji;

const log = console.log.bind(console);

let local = process.env.LOCALAPPDATA
const gameSaveFiles = "FactoryGame/Saved/SaveGames"
const pathToSyncedSave = "../Saved/SaveGames"

const pathToWatch = path.join(local, gameSaveFiles);
const pathToSave = path.join(__dirname, '..')
const pathToPerson = path.join(pathToSave, otherSaveFolder);
log(pathToPerson)

const pathToRepo = path.join(local, 'FactoryGame', 'SatisfactorySynchronizer')
const watcher = chokidar.watch(pathToWatch, {
    ignoreInitial: true,
    cwd: __dirname,
    awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      },
});

console.log("Syncing any changes from other players");
simpleGit.pull();


watcher
.on('ready', () => log('Initial scan complete. Ready for changes'))
.on('addDir', path => addDir(path))
.on('change', path => fileChange(path))
.on('add', path => addFile(path))
.on('error', error => log(`Watcher error: ${error}`))

function addDir(changedPath) {
    log(`Addition detected: Folder ${changedPath} has been added`);
    let otherPlayer = getPathToOtherPlayer(changedPath);
    const pathToTarget = path.join(pathToRepo, convertToTargetPath(changedPath))
    const pathToTargetOtherPlayer = path.join(pathToWatch, otherSaveFolder)

    log('Attempting to copy over to ' + pathToTarget);

    fs.cpSync(changedPath, pathToTarget, {recursive: true});
    fs.cpSync(changedPath, pathToTargetOtherPlayer, {recursive: true});

    syncChanges()
}

function addFile(changedPath) {
    log(`Addition detected: File ${changedPath} has been added`);
    const filename = path.basename(changedPath);
    let otherPlayer = getPathToOtherPlayer(changedPath);
    const pathToTarget = path.join(pathToRepo, convertToTargetPath(changedPath))
    const pathToTargetOtherPlayer = path.join(pathToWatch, otherSaveFolder, filename)
    log("also copy to " + pathToTargetOtherPlayer);
    log('Attempting to copy over to ' + pathToTarget);
    fs.closeSync(fs.openSync(pathToTarget, 'w'));
    fs.closeSync(fs.openSync(pathToTargetOtherPlayer, 'w'));

    fs.copyFileSync(changedPath, pathToTarget)
    fs.copyFileSync(changedPath, pathToTargetOtherPlayer)

    syncChanges()
}

function fileChange(changedPath) {
    log(`Change detected: File ${changedPath} has been changed`);
    const filename = path.basename(changedPath);
    let otherPlayer = getPathToOtherPlayer(changedPath);

    const pathToTarget = path.join(pathToRepo, convertToTargetPath(changedPath))
    const pathToTargetOtherPlayer = path.join(pathToWatch, otherSaveFolder, filename)
    log('Attempting to copy over to ' + pathToTarget);

    fs.copyFileSync(changedPath, pathToTarget)
    fs.copyFileSync(changedPath, pathToTargetOtherPlayer)
    
    syncChanges()
}

function convertToTargetPath(relativePath) {
    let toArray = relativePath.split('');
    for(let i = 0; i < 6; i++){
        toArray.shift();
    }
    
    return toArray.join('');
}

function getParentPath(str) {
    return str.substring(0, str.lastIndexOf("/"));
}

function getPathToOtherPlayer(originalPath) {
    let filename = path.basename(originalPath);
    let splitPath = path.dirname(originalPath).split('\\')
    splitPath.pop();
    splitPath.push(otherSaveFolder);
    splitPath.push(filename);
    let resolvePath = splitPath.join("\\")
    log(resolvePath)
    return resolvePath;
}

async function syncChanges() {
    log('Syncing changes to github')
    await simpleGit
        .add('../.')
        .commit("sync")
        .push();
}