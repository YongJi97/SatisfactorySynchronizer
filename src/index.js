const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git')();
const os = require('os');
const childProcess = require('child_process');
const { gitP } = require('simple-git');

const yongji = '76561198214145843';
const kevin = '76561198083081162';
const machineID = path.basename(os.homedir());

const mySaveFolder = machineID.toLowerCase() === 'kisuna' ? yongji : kevin;
const otherSaveFolder = machineID.toLowerCase() === 'kisuna' ? kevin : yongji;

const log = console.log.bind(console);
console.debug = ()=>{}

let local = process.env.LOCALAPPDATA
const gameSaveFiles = "FactoryGame/Saved/SaveGames"
const pathToSyncedSave = "../Saved/SaveGames"
const saveFolders = 'Saved/SaveGames'
const pathToWatch = path.join(local, gameSaveFiles);
const pathToSave = path.join(__dirname, '..')
const pathToPerson = path.join(pathToSave, otherSaveFolder);
// log(pathToPerson)

const pathToRepo = path.join(local, 'FactoryGame', 'SatisfactorySynchronizer');

(async ()=> { await main() })();

function addDir(changedPath) {
    log(`Addition detected: Folder ${changedPath} has been added`);
    const filename = path.basename(changedPath);
    let otherPlayer = getPathToOtherPlayer(changedPath);
    const pathToTarget = path.join(pathToRepo, convertToTargetPath(changedPath))

    const pathToTargetOtherPlayer = path.join(pathToRepo, saveFolders, otherSaveFolder, filename)
    
    log('Attempting to copy over to ' + pathToTarget);
    fs.cpSync(changedPath, pathToTarget, {recursive: true});
    // log('also attempting to copy over to ' + pathToTargetOtherPlayer);
    massCopy()

    syncChanges()
}

function addFile(changedPath) {
    log(`Addition detected: File ${changedPath} has been added`);
    const filename = path.basename(changedPath);
    let otherPlayer = getPathToOtherPlayer(changedPath);
    const pathToTarget = path.join(pathToRepo, convertToTargetPath(changedPath))
    const pathToTargetOtherPlayer = path.join(pathToRepo, saveFolders, otherSaveFolder, filename)
    log('Attempting to copy over to ' + pathToTarget);
    fs.closeSync(fs.openSync(pathToTarget, 'w'));
    fs.copyFileSync(changedPath, pathToTarget)
    
    // log("also copy to " + pathToTargetOtherPlayer);
    massCopy()


    syncChanges()
}

function fileChange(changedPath) {
    log(`Change detected: File ${changedPath} has been changed`);
    const filename = path.basename(changedPath);
    let otherPlayer = getPathToOtherPlayer(changedPath);

    const pathToTarget = path.join(pathToRepo, convertToTargetPath(changedPath))
    const pathToTargetOtherPlayer = path.join(pathToRepo, saveFolders, otherSaveFolder, filename)
    
    log('Attempting to copy over to ' + pathToTarget);
    fs.copyFileSync(changedPath, pathToTarget)
    // log("also copy to " + pathToTargetOtherPlayer);
    massCopy()

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
    log('Executing git push')

    childProcess.execSync("git add ../.")
    childProcess.execSync("git commit -m \"new changes\"")
    childProcess.execSync("git push")

    log('Syncing to the cloud complete');
}

async function gitPull() {
    console.debug("start 1")
    log("Executing git pull")
    const gitPull = childProcess.execSync("git pull");
    log(gitPull.toString());
    
    console.debug("end 1")
}

async function syncToLocal() {
    console.debug("start 2")
    let localPath = pathToSyncedSave;
    let localappdata = path.join(local, gameSaveFiles)
    log(path.resolve(localPath));
    log("Copying from " + path.resolve(localPath) + " to " + localappdata);
    fs.cpSync(path.resolve(localPath), localappdata, {recursive: true, force: true});
    console.debug("end 2")
}

function massCopy() {
    let mySave = path.join(pathToSyncedSave, mySaveFolder);
    let otherSave = path.join(pathToSyncedSave, otherSaveFolder)
    log("Mass copying from " + mySave + " to " + otherSave);
    fs.cpSync(mySave, otherSave, {recursive: true});

}

async function main() {
    await gitPull();
    await syncToLocal();
    await startWatch();

}

async function startWatch(){ 
    console.debug("start 3")
    const watcher = chokidar.watch(pathToWatch, {
        ignoreInitial: true,
        cwd: __dirname,
        awaitWriteFinish: {
            stabilityThreshold: 2000,
            pollInterval: 100
          },
    });

    watcher
    .on('ready', () => log('Initial scan complete. Ready for changes'))
    // .on('addDir', path => addDir(path))
    .on('change', path => fileChange(path))
    .on('add', path => addFile(path))
    .on('error', error => log(`Watcher error: ${error}`))
    
    console.debug("end 3")
}