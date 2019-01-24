import Path from 'path'
import Os from 'os'
import { spawn, getPathSegments, setPathSegments } from '../../lib/process/win32'
import { pathExists, ensureDir, writeFile } from 'fs-extra'

const appFolder = Path.resolve(process.execPath, '..');
const exeName = Path.basename(process.execPath);
const rootAppDir = Path.resolve(appFolder, '..');
const updateDotExe = Path.resolve(Path.join(rootAppDir, 'Update.exe'));

export function handleSquirrelEvent(eventName) {
	switch (eventName) {
		case '--squirrel-install':
			return handleInstalled();
		
		case '--squirrel-updated':
			return handleUpdated();
		
		case '--squirrel-uninstall':
			return handleUninstall();
		
		case '--squirrel-obsolete':
			return Promise.resolve();
	}
	return null
}

async function handleInstalled() {
	await createShortcut(['StartMenu', 'Desktop']);
	//await installCLI()
}

async function handleUpdated() {
	await updateShortcut();
	//await installCLI()
}

async function handleUninstall() {
	await removeShortcut();
	
	// const paths = await getPathSegments();
	// const binPath = getBinPath();
	// const pathsWithoutBinPath = paths.filter(p => p !== binPath);
	// return setPathSegments(pathsWithoutBinPath)
}

function createShortcut (locations) {
	return spawnSquirrelUpdate([
		'--createShortcut',
		exeName,
		'-l',
		locations.join(','),
	])
}

async function spawnSquirrelUpdate (commands) {
	await spawn(updateDotExe, commands)
}

function removeShortcut () {
	return spawnSquirrelUpdate(['--removeShortcut', exeName])
}

async function updateShortcut(){
	const homeDirectory = Os.homedir();
	if (homeDirectory) {
		const desktopShortcutPath = Path.join(
			homeDirectory,
			'Desktop',
			'Yealink VC.lnk'
		);
		const exists = await pathExists(desktopShortcutPath);
		const locations = exists
			? ['StartMenu', 'Desktop']
			: ['StartMenu'];
		return createShortcut(locations)
	} else {
		return createShortcut(['StartMenu', 'Desktop'])
	}
}


function getBinPath() {
	return Path.resolve(process.execPath, '../../bin')
}

