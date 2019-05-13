import { spawn } from 'child_process';
import { resolve as resolvePath } from 'path';
import { AppUpdater } from './app-updater';

function exec(bin, args) {
  return new Promise((resolve, reject) => {
    try {
      const process = spawn(bin, args, {
        detached : true,
        stdio    : 'ignore',
      });

      process.on('error', (error) => {
        reject(error);
      });
      process.unref();

      if (process.pid !== undefined) {
        resolve(true);
      }
    }
    catch (error) {
      reject(error);
    }
  });
}

export class NSISUpdater extends AppUpdater {
  get appSuffix() {
    return '.exe';
  }

  async install(option) {
    const { 
      installer,
      packageFile,
      silent,
      runAfter,
      adminRequired,
    } = option;
    const args = [ '--updated' ];

    if (silent) {
      args.push('/S');
    }

    if (runAfter) {
      args.push('--force-run');
    }

    if (packageFile) {
      args.push(`--package-file=${packageFile}`);
    }

    if (true || adminRequired) {
      const elevate = resolvePath(process.resourcesPath, 'elevate.exe');

      await exec(elevate, [ installer ].concat(args));

      return;
    }

    await exec(installer, args);
  }
}
