import { spawn } from 'child_process';
import path from 'path';

function execa(command, args, options) {
  try {
    const child = spawn(command, args, options);

    return new Promise((resolve, reject) => {
      let stdout = '';

      child.stdout.on('data', (data) => {
        stdout += data;
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        }
        else {
          reject(new Error(`Command "${command} ${args}" failed: "${stdout}"`));
        }
      });

      child.on('error', (err) => {
        reject(err);
      });

      // This is necessary if using Powershell 2 on Windows 7 to get the events
      // to raise.
      // See http://stackoverflow.com/questions/9155289/calling-powershell-from-nodejs
      child.stdin.end();
    });
  }
  catch (error) {
    return Promise.reject(error);
  }
}

async function build() {
  // await execa('git submodule update', [ '--init', '--recursive' ], { stdio: 'inherit' });
  await execa('yarn install', [ '--force' ], { stdio: 'inherit' });
  await execa('yarn install', [ '--force' ], { 
    cwd   : path.resolve(process.cwd(), 'plugins/vue-cli-plugin-electron'),
    stdio : 'inherit',
  });
  await execa('yarn build:electron', [], { stdio: 'inherit' });
}

build();
